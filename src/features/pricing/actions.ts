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

import {
  resolveEntitlementState,
  buildPreviewEntitlement,
  resolveLegacyTrialAnchor,
} from '@/entities/subscription/entitlement-engine';

/**
 * Consulta de derecho de acceso (Entitlement) del usuario con cómputo temporal exacto
 * y resolución estricta del tier contratado ('starter' | 'pro' | 'max').
 *
 * Invariante: Un usuario en TRIAL con trialEndsAt = null es saneado atómicamente y persistido
 * una única vez con un trial real de 3 días desde el momento del saneamiento,
 * eliminando el bug del 'sliding trial' donde el cronómetro volvía a 3d en cada render.
 */
export async function checkUserEntitlementAction(userId?: string): Promise<UserEntitlement> {
  const nowMs = Date.now();
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

    if (!targetUser || !targetUserId) {
      return buildPreviewEntitlement(nowMs, 'anonymous');
    }

    // Auto-healing atómico y persistido para cuentas TRIAL legacy sin trialEndsAt definido
    let effectiveTrialEndsAt = targetUser.trialEndsAt;
    if (targetUser.status === 'TRIAL' && !targetUser.trialEndsAt) {
      const anchoredTrialEndsAt = new Date(resolveLegacyTrialAnchor(nowMs));
      effectiveTrialEndsAt = anchoredTrialEndsAt;
      try {
        await db
          .update(user)
          .set({
            trialEndsAt: anchoredTrialEndsAt,
            updatedAt: new Date(nowMs),
          })
          .where(and(eq(user.id, targetUserId), eq(user.status, 'TRIAL')));
      } catch (patchErr) {
        console.error('[Entitlement Auto-Healing] Falló la persistencia de trialEndsAt para usuario:', targetUserId, patchErr);
      }
    }

    // Resolver tier contratado mediante el historial de pagos
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
      resolvedTier = 'pro';
    }

    return resolveEntitlementState(
      {
        status: targetUser.status,
        trialEndsAt: effectiveTrialEndsAt,
        subscriptionEndsAt: targetUser.subscriptionEndsAt,
        resolvedTier,
      },
      nowMs
    );
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'test' && !err?.message?.includes('no such table')) {
      console.error('Error verificando entitlement:', err);
    }
    return buildPreviewEntitlement(nowMs, 'fallback');
  }
}

export type ResourceQuotaType = 'cards' | 'cvs' | 'presentations';

/**
 * Guardrail de Seguridad Server-Side: Valida si el usuario tiene permiso activo
 * para mutaciones críticas (creación, edición o publicación).
 *
 * Gobernanza Plan Comunitario Gratuito 2026:
 * - Si el usuario tiene acceso activo (TRIAL vigente, ACTIVE o GRACE_PERIOD), se permite toda mutación.
 * - Si el período de prueba Pro de 3 días finalizó (status === 'EXPIRED'), el usuario transiciona
 *   automáticamente al Plan Comunitario Gratuito Permanente (Starter: 1 Tarjeta Digital + 1 Smart CV
 *   de por vida + bonos por referidos). Por lo tanto, las mutaciones de Tarjetas ('cards') y Smart CV
 *   ('cvs') permanecen habilitadas, delegando el tope cuantitativo de creación a assertQuotaAvailableAction.
 * - Las Presentaciones Orbitales ('presentations') requieren Trial Pro vigente o Membresía Activa.
 */
export async function assertUserEntitlementAction(
  userId?: string,
  resource?: ResourceQuotaType
): Promise<{
  allowed: boolean;
  entitlement: UserEntitlement;
  error?: string;
}> {
  const entitlement = await checkUserEntitlementAction(userId);

  if (!entitlement.hasAccess) {
    // En el Plan Comunitario Gratuito (post-trial), Tarjetas Digitales y Smart CVs son 100% gratuitos y permanentes
    if (!resource || resource === 'cards' || resource === 'cvs') {
      const communityEntitlement: UserEntitlement = {
        ...entitlement,
        tier: 'starter',
        limits: PRICING_TIERS.starter.limits,
      };
      return {
        allowed: true,
        entitlement: communityEntitlement,
      };
    }

    return {
      allowed: false,
      entitlement,
      error:
        'Tu período de prueba Pro ha finalizado. El generador de Presentaciones Orbitales requiere una Membresía activa (Pro o Max), mientras que tu Tarjeta Digital y Smart CV siguen siendo 100% gratuitos en tu Plan Comunitario.',
    };
  }

  return {
    allowed: true,
    entitlement,
  };
}

/**
 * Guardrail de Cuotas Cuantitativas Server-Side:
 * Verifica que el usuario no supere los límites numéricos de su plan ('starter', 'pro', 'max').
 * Si el límite es 'unlimited', la acción siempre está permitida.
 * Cuando el trial Pro de 3 días ha expirado (!entitlement.hasAccess), aplica automáticamente
 * los límites permanentes del Plan Comunitario Gratuito (Starter: 1 Tarjeta, 1 Smart CV, 0 Presentaciones)
 * más las recompensas acumuladas por referidos.
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

  // Si el trial Pro expiró, evaluar con las cuotas permanentes del Plan Comunitario Gratuito (Starter)
  const effectiveTierLimits = entitlement.hasAccess
    ? entitlement.limits
    : PRICING_TIERS.starter.limits;

  const baseLimit = effectiveTierLimits[resource];
  if (baseLimit === 'unlimited') {
    return { allowed: true, currentCount: 0, maxLimit: 'unlimited' };
  }

  // Bonus cuantitativo por referidos activos en la comunidad (Recompensa Comunitaria 2026):
  // - Nivel 1 (3+ referidos): +1 Tarjeta Digital por cada 3 colegas referidos confirmados
  // - Nivel 2 (5+ referidos): +1 Smart CV por cada 5 colegas referidos confirmados
  // - Nivel 3 (10+ referidos - Embajador Oro): Cupos ilimitados en Tarjetas Digitales y Smart CVs
  let bonusQuota = 0;
  try {
    const referredUsers = await db.query.user.findMany({
      where: eq(user.referredBy, userId),
      columns: { id: true },
    });
    const totalReferred = Array.isArray(referredUsers) ? referredUsers.length : 0;

    if (totalReferred >= 10 && (resource === 'cards' || resource === 'cvs')) {
      return { allowed: true, currentCount: 0, maxLimit: 'unlimited' };
    }

    if (resource === 'cards') {
      bonusQuota = Math.floor(totalReferred / 3);
    } else if (resource === 'cvs') {
      bonusQuota = Math.floor(totalReferred / 5);
    }
  } catch {
    bonusQuota = 0;
  }

  const effectiveLimit = (baseLimit as number) + bonusQuota;

  if (effectiveLimit <= 0) {
    return {
      allowed: false,
      currentCount: 0,
      maxLimit: 0,
      error:
        'Tu Plan Comunitario Gratuito incluye 1 Tarjeta Digital y 1 Smart CV permanentes. Para crear Presentaciones Orbitales 16:9, activa el Plan Pro o Max.',
    };
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

  if (currentCount >= effectiveLimit) {
    const resourceNames: Record<ResourceQuotaType, string> = {
      cards: 'tarjetas digitales',
      cvs: 'versiones de Smart CV',
      presentations: 'presentaciones 16:9',
    };
    const referralHint = resource === 'cards'
      ? ' Puedes editar tu tarjeta actual desde el Panel o invitar a 3 colegas con tu enlace para desbloquear +1 tarjeta extra gratis.'
      : resource === 'cvs'
      ? ' Puedes editar y descargar tu CV actual desde el Panel o invitar a 5 colegas con tu enlace para desbloquear +1 CV extra gratis.'
      : ' Activa un plan superior para ampliar tu capacidad.';

    return {
      allowed: false,
      currentCount,
      maxLimit: effectiveLimit,
      error: `Has alcanzado el límite máximo de ${effectiveLimit} ${resourceNames[resource]} de tu plan (${currentCount}/${effectiveLimit}).${referralHint}`,
    };
  }

  return {
    allowed: true,
    currentCount,
    maxLimit: effectiveLimit,
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
