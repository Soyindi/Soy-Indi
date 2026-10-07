'use server';

import { db } from '@/shared/api/db';
import { user } from '@/entities/schema';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { PRICING_TIERS, PlanTier, TierLimits, UserEntitlement, calculateTimeRemaining } from '@/entities/subscription/types';
import { userEntitlementSchema } from '@/entities/subscription/schemas';
import { paymentsHistory, cards, smartCvs, presentations } from '@/entities/schema';
import { and, desc } from 'drizzle-orm';

export type { UserEntitlement };

/**
 * Consulta de derecho de acceso (Entitlement) del usuario con cómputo temporal exacto
 * y resolución estricta del tier contratado ('starter' | 'pro' | 'max').
 */
export async function checkUserEntitlementAction(userId?: string): Promise<UserEntitlement> {
  try {
    let targetUser = null;
    let targetUserId = userId;

    if (userId) {
      targetUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });
    } else {
      const sessionResult = await getSafeAuthenticatedUserId();
      if (sessionResult.userId) {
        targetUserId = sessionResult.userId;
        targetUser = await db.query.user.findFirst({
          where: eq(user.id, sessionResult.userId),
        });
      }
    }

    const now = new Date();

    if (!targetUser || !targetUserId) {
      // Estado seguro por defecto: 3 días desde ahora para demos y nuevos visitantes (con cuota Pro durante trial)
      const defaultExpiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).getTime();
      const timeRemaining = calculateTimeRemaining(defaultExpiresAt, now);
      const trialTier: PlanTier = 'pro';
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        tier: trialTier,
        limits: PRICING_TIERS[trialTier].limits,
        daysRemaining: 3,
        expiresAt: defaultExpiresAt,
        timeRemaining,
      };
    }

    const trialEndsAt = targetUser.trialEndsAt ? new Date(targetUser.trialEndsAt) : null;
    const subscriptionEndsAt = targetUser.subscriptionEndsAt ? new Date(targetUser.subscriptionEndsAt) : null;

    // Resolver tier activo si existe pago previo aprobado
    let resolvedTier: PlanTier = 'pro';
    try {
      const latestPayment = await db.query.paymentsHistory.findFirst({
        where: and(eq(paymentsHistory.userId, targetUserId), eq(paymentsHistory.status, 'approved')),
        orderBy: [desc(paymentsHistory.createdAt)],
      });
      if (latestPayment && (latestPayment.planTier as PlanTier) in PRICING_TIERS) {
        resolvedTier = latestPayment.planTier as PlanTier;
      }
    } catch {
      // Fallback a Pro si no hay tabla o consulta falla
      resolvedTier = 'pro';
    }

    // 1. Si tiene suscripción activa vigente
    if (targetUser.status === 'ACTIVE') {
      const expiresAt = subscriptionEndsAt ? subscriptionEndsAt.getTime() : null;
      const isStillValid = !subscriptionEndsAt || now <= subscriptionEndsAt;

      if (isStillValid) {
        const timeRemaining = calculateTimeRemaining(expiresAt, now);
        const days = subscriptionEndsAt
          ? Math.max(1, Math.ceil((subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 30;

        return {
          hasAccess: true,
          isTrial: false,
          status: 'ACTIVE',
          tier: resolvedTier,
          limits: PRICING_TIERS[resolvedTier].limits,
          daysRemaining: days,
          expiresAt,
          timeRemaining,
        };
      }
    }

    // 2. Si está en período de prueba (3 días) y no ha expirado
    if (targetUser.status === 'TRIAL' && trialEndsAt && now <= trialEndsAt) {
      const expiresAt = trialEndsAt.getTime();
      const timeRemaining = calculateTimeRemaining(expiresAt, now);
      const days = Math.max(1, Math.ceil((expiresAt - now.getTime()) / (1000 * 60 * 60 * 24)));
      const trialTier: PlanTier = 'pro';

      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        tier: trialTier,
        limits: PRICING_TIERS[trialTier].limits,
        daysRemaining: days,
        expiresAt,
        timeRemaining,
      };
    }

    // 3. Si no tiene fecha definida de trial pero tiene status TRIAL
    if (targetUser.status === 'TRIAL' && !trialEndsAt) {
      const defaultExpiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).getTime();
      const timeRemaining = calculateTimeRemaining(defaultExpiresAt, now);
      const trialTier: PlanTier = 'pro';
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        tier: trialTier,
        limits: PRICING_TIERS[trialTier].limits,
        daysRemaining: 3,
        expiresAt: defaultExpiresAt,
        timeRemaining,
      };
    }

    // 4. Acceso expirado
    const expiredAt = trialEndsAt?.getTime() || subscriptionEndsAt?.getTime() || null;
    return {
      hasAccess: false,
      isTrial: false,
      status: 'EXPIRED',
      tier: resolvedTier,
      limits: PRICING_TIERS[resolvedTier].limits,
      daysRemaining: 0,
      expiresAt: expiredAt,
      timeRemaining: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalMs: 0,
      },
    };
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'test' && !err?.message?.includes('no such table')) {
      console.error('Error verificando entitlement:', err);
    }
    const defaultExpiresAt = Date.now() + 3 * 24 * 60 * 60 * 1000;
    const fallbackTier: PlanTier = 'pro';
    return {
      hasAccess: true,
      isTrial: true,
      status: 'TRIAL',
      tier: fallbackTier,
      limits: PRICING_TIERS[fallbackTier].limits,
      daysRemaining: 3,
      expiresAt: defaultExpiresAt,
      timeRemaining: calculateTimeRemaining(defaultExpiresAt),
    };
  }
}

/**
 * Guardrail de Seguridad Server-Side: Valida si el usuario tiene permiso activo
 * para mutaciones críticas (creación, edición o publicación).
 */
export async function assertUserEntitlementAction(userId?: string): Promise<{
  allowed: boolean;
  entitlement: UserEntitlement;
  error?: string;
}> {
  const entitlement = await checkUserEntitlementAction(userId);

  if (!entitlement.hasAccess) {
    return {
      allowed: false,
      entitlement,
      error:
        'Tu período de prueba ha finalizado. Suscríbete a un plan de INDI para continuar creando y editando tus recursos profesionales.',
    };
  }

  return {
    allowed: true,
    entitlement,
  };
}

export type ResourceQuotaType = 'cards' | 'cvs' | 'presentations';

/**
 * Guardrail de Cuotas Cuantitativas Server-Side:
 * Verifica que el usuario no supere los límites numéricos de su plan ('starter', 'pro', 'max').
 * Si el límite es 'unlimited', la acción siempre está permitida.
 */
export async function assertQuotaAvailableAction(
  userId: string,
  resource: ResourceQuotaType
): Promise<{
  allowed: boolean;
  currentCount: number;
  maxLimit: number | 'unlimited';
  error?: string;
}> {
  const entitlement = await checkUserEntitlementAction(userId);
  if (!entitlement.hasAccess) {
    return {
      allowed: false,
      currentCount: 0,
      maxLimit: entitlement.limits[resource],
      error: 'Tu período de prueba o suscripción ha expirado.',
    };
  }

  const limit = entitlement.limits[resource];
  if (limit === 'unlimited') {
    return { allowed: true, currentCount: 0, maxLimit: 'unlimited' };
  }

  let currentCount = 0;
  try {
    if (resource === 'cards') {
      const userCards = await db.query.cards.findMany({
        where: eq(cards.userId, userId),
        columns: { id: true },
      });
      currentCount = Array.isArray(userCards) ? userCards.length : 0;
    } else if (resource === 'cvs') {
      const userCvs = await db.query.smartCvs.findMany({
        where: eq(smartCvs.userId, userId),
        columns: { id: true },
      });
      currentCount = Array.isArray(userCvs) ? userCvs.length : 0;
    } else if (resource === 'presentations') {
      const userPresentations = await db.query.presentations.findMany({
        where: eq(presentations.userId, userId),
        columns: { id: true },
      });
      currentCount = Array.isArray(userPresentations) ? userPresentations.length : 0;
    }
  } catch {
    currentCount = 0;
  }

  if (currentCount >= limit) {
    const resourceNames: Record<ResourceQuotaType, string> = {
      cards: 'tarjetas digitales',
      cvs: 'versiones de Smart CV',
      presentations: 'presentaciones 16:9',
    };
    return {
      allowed: false,
      currentCount,
      maxLimit: limit,
      error: `Has alcanzado el límite máximo de ${limit} ${resourceNames[resource]} de tu ${PRICING_TIERS[entitlement.tier].name}. Actualiza a un plan superior para crear más.`,
    };
  }

  return {
    allowed: true,
    currentCount,
    maxLimit: limit,
  };
}

/**
 * Simulación de sesión de Checkout (MercadoPago / Stripe)
 */
export async function createCheckoutSessionAction(
  planInterval: 'monthly' | 'semiannual' = 'semiannual',
  currency: 'CLP' | 'USD' = 'CLP',
  tier: 'starter' | 'pro' | 'max' = 'pro'
) {
  const { PRICING_TIERS } = await import('@/entities/subscription/types');
  const tierConfig = PRICING_TIERS[tier] || PRICING_TIERS.pro;
  const cycleDetail = tierConfig[planInterval];
  const amount = cycleDetail.priceClp;
  const description = `INDI: ${tierConfig.name} (${planInterval === 'semiannual' ? 'Semestral' : 'Mensual'})`;

  return {
    success: true,
    data: {
      tier,
      planInterval,
      amount,
      currency,
      description,
      checkoutUrl: `/checkout/success?tier=${tier}&plan=${planInterval}`,
    },
  };
}
