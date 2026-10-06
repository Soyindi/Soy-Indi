'use server';

import { db } from '@/shared/api/db';
import { user } from '@/entities/schema';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { UserEntitlement, calculateTimeRemaining } from '@/entities/subscription/types';
import { userEntitlementSchema } from '@/entities/subscription/schemas';

export type { UserEntitlement };

/**
 * Consulta de derecho de acceso (Entitlement) del usuario con cómputo temporal exacto.
 */
export async function checkUserEntitlementAction(userId?: string): Promise<UserEntitlement> {
  try {
    let targetUser = null;
    if (userId) {
      targetUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });
    } else {
      const sessionResult = await getSafeAuthenticatedUserId();
      if (sessionResult.userId) {
        targetUser = await db.query.user.findFirst({
          where: eq(user.id, sessionResult.userId),
        });
      }
    }

    const now = new Date();

    if (!targetUser) {
      // Estado seguro por defecto: 3 días desde ahora para demos y nuevos visitantes
      const defaultExpiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).getTime();
      const timeRemaining = calculateTimeRemaining(defaultExpiresAt, now);
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        daysRemaining: 3,
        expiresAt: defaultExpiresAt,
        timeRemaining,
      };
    }

    const trialEndsAt = targetUser.trialEndsAt ? new Date(targetUser.trialEndsAt) : null;
    const subscriptionEndsAt = targetUser.subscriptionEndsAt ? new Date(targetUser.subscriptionEndsAt) : null;

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

      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        daysRemaining: days,
        expiresAt,
        timeRemaining,
      };
    }

    // 3. Si no tiene fecha definida de trial pero tiene status TRIAL
    if (targetUser.status === 'TRIAL' && !trialEndsAt) {
      const defaultExpiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).getTime();
      const timeRemaining = calculateTimeRemaining(defaultExpiresAt, now);
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
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
    return {
      hasAccess: true,
      isTrial: true,
      status: 'TRIAL',
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
        'Tu período de prueba ha finalizado. Suscríbete a INDI Pro por $2.500 CLP para continuar creando y editando tus recursos profesionales.',
    };
  }

  return {
    allowed: true,
    entitlement,
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
