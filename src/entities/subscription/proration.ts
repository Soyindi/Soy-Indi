import { PRICING_TIERS, PlanInterval, PlanTier } from './types';

export interface ProrationCalculationResult {
  hasTimeCredit: boolean;
  creditMonetaryClp: number;
  bonusDays: number;
  totalDays: number;
  dailyRateOldClp: number;
  dailyRateNewClp: number;
  explanation: string;
}

/**
 * Motor Determinista de Conversión de Crédito Temporal (Time Credit Conversion)
 *
 * Fórmula matemática estándar:
 * V_daily_old = P_old / nominalDaysOld
 * V_daily_new = P_new / nominalDaysNew
 * Credit_monetary = RemainingDays * V_daily_old
 * BonusDays = floor(Credit_monetary / V_daily_new)
 * TotalDuration = NominalDaysNew + BonusDays
 *
 * @param currentTier Tier actual del usuario ('starter' | 'pro' | 'max')
 * @param currentInterval Intervalo actual ('monthly' | 'semiannual')
 * @param remainingDays Días vigentes restantes en el plan actual
 * @param newTier Nuevo tier adquirido ('starter' | 'pro' | 'max')
 * @param newInterval Intervalo contratado para el nuevo plan
 */
export function calculateUpgradeTimeCredit(
  currentTier: PlanTier | null | undefined,
  currentInterval: PlanInterval | null | undefined,
  remainingDays: number,
  newTier: PlanTier,
  newInterval: PlanInterval = 'monthly'
): ProrationCalculationResult {
  const nominalDaysNew = newInterval === 'semiannual' ? 180 : 30;
  const newTierConfig = PRICING_TIERS[newTier] || PRICING_TIERS.pro;
  const newPriceClp = newTierConfig[newInterval].priceClp;
  const dailyRateNewClp = Math.max(1, newPriceClp / nominalDaysNew);

  // Si no hay plan previo o los días restantes son <= 0, no hay crédito
  if (!currentTier || remainingDays <= 0) {
    return {
      hasTimeCredit: false,
      creditMonetaryClp: 0,
      bonusDays: 0,
      totalDays: nominalDaysNew,
      dailyRateOldClp: 0,
      dailyRateNewClp: Math.round(dailyRateNewClp),
      explanation: `Suscripción estándar por ${nominalDaysNew} días en ${newTierConfig.name}.`,
    };
  }

  const oldTierConfig = PRICING_TIERS[currentTier] || PRICING_TIERS.starter;
  const oldInterval = currentInterval || 'monthly';
  const nominalDaysOld = oldInterval === 'semiannual' ? 180 : 30;
  const oldPriceClp = oldTierConfig[oldInterval].priceClp;
  const dailyRateOldClp = Math.max(1, oldPriceClp / nominalDaysOld);

  // Crédito monetario residual no consumido
  const creditMonetaryClp = Math.round(remainingDays * dailyRateOldClp);

  // Días adicionales equivalentes en el nuevo plan
  const bonusDays = Math.floor(creditMonetaryClp / dailyRateNewClp);
  const totalDays = nominalDaysNew + bonusDays;

  return {
    hasTimeCredit: bonusDays > 0,
    creditMonetaryClp,
    bonusDays,
    totalDays,
    dailyRateOldClp: Math.round(dailyRateOldClp),
    dailyRateNewClp: Math.round(dailyRateNewClp),
    explanation: bonusDays > 0
      ? `Transición de ${oldTierConfig.name} a ${newTierConfig.name}: se compensaron ${remainingDays} días residuales ($${creditMonetaryClp.toLocaleString('es-CL')} CLP) como ${bonusDays} días adicionales. Duración total: ${totalDays} días.`
      : `Transición a ${newTierConfig.name} por ${nominalDaysNew} días.`,
  };
}

// ============================================================================
// ACTIVACIÓN IDEMPOTENTE DE SUSCRIPCIONES (Funciones puras compartidas por todas las pasarelas)
// ============================================================================

const ACTIVATION_MS_PER_DAY = 24 * 60 * 60 * 1000;
const VALID_TIERS: readonly PlanTier[] = ['starter', 'pro', 'max'];
const VALID_INTERVALS: readonly PlanInterval[] = ['monthly', 'semiannual'];

export interface ResolvedPaymentPlan {
  planTier: PlanTier;
  planInterval: PlanInterval;
  /** `metadata`: metadatos coherentes con el monto · `amount`: inferido del monto cobrado · `default`: fallback. */
  resolvedBy: 'metadata' | 'amount' | 'default';
}

/**
 * Resuelve el plan efectivamente pagado cruzando los metadatos con el MONTO REAL cobrado
 * por la pasarela (anti-manipulación). Si los metadatos no coinciden con el precio oficial
 * pero el monto corresponde exactamente a otro plan del catálogo, prevalece el monto.
 */
export function resolvePlanFromPayment(
  metaTier: unknown,
  metaInterval: unknown,
  amountClp: number,
  fallback: { planTier: PlanTier; planInterval: PlanInterval } = { planTier: 'pro', planInterval: 'monthly' }
): ResolvedPaymentPlan {
  const tier = VALID_TIERS.includes(metaTier as PlanTier) ? (metaTier as PlanTier) : null;
  const interval = VALID_INTERVALS.includes(metaInterval as PlanInterval) ? (metaInterval as PlanInterval) : null;

  if (tier && interval && PRICING_TIERS[tier][interval].priceClp === amountClp) {
    return { planTier: tier, planInterval: interval, resolvedBy: 'metadata' };
  }

  for (const candidateTier of VALID_TIERS) {
    for (const candidateInterval of VALID_INTERVALS) {
      if (PRICING_TIERS[candidateTier][candidateInterval].priceClp === amountClp) {
        return { planTier: candidateTier, planInterval: candidateInterval, resolvedBy: 'amount' };
      }
    }
  }

  if (tier && interval) {
    return { planTier: tier, planInterval: interval, resolvedBy: 'metadata' };
  }

  return { planTier: tier ?? fallback.planTier, planInterval: interval ?? fallback.planInterval, resolvedBy: 'default' };
}

export interface SubscriptionActivationWindowInput {
  currentStatus: string | null | undefined;
  currentTier: PlanTier | null | undefined;
  currentInterval: PlanInterval | null | undefined;
  currentSubscriptionEndsAt: Date | number | null | undefined;
  newTier: PlanTier;
  newInterval: PlanInterval;
  nowMs: number;
}

export interface SubscriptionActivationWindow {
  remainingDays: number;
  totalDays: number;
  bonusDays: number;
  subscriptionEndsAt: Date;
  proration: ProrationCalculationResult;
}

/**
 * Calcula la nueva vigencia de la suscripción a partir del estado PREVIO al pago.
 * Sólo una suscripción ACTIVE y vigente genera crédito temporal (trial y gracia no acumulan).
 */
export function computeSubscriptionActivationWindow(input: SubscriptionActivationWindowInput): SubscriptionActivationWindow {
  const endsAtMs =
    input.currentSubscriptionEndsAt === null || input.currentSubscriptionEndsAt === undefined
      ? null
      : typeof input.currentSubscriptionEndsAt === 'number'
      ? input.currentSubscriptionEndsAt
      : input.currentSubscriptionEndsAt.getTime();

  const hasLiveSubscription = input.currentStatus === 'ACTIVE' && endsAtMs !== null && endsAtMs > input.nowMs;
  const remainingDays = hasLiveSubscription ? Math.ceil((endsAtMs! - input.nowMs) / ACTIVATION_MS_PER_DAY) : 0;

  const proration = calculateUpgradeTimeCredit(
    hasLiveSubscription ? input.currentTier ?? null : null,
    hasLiveSubscription ? input.currentInterval ?? null : null,
    remainingDays,
    input.newTier,
    input.newInterval
  );

  return {
    remainingDays,
    totalDays: proration.totalDays,
    bonusDays: proration.bonusDays,
    subscriptionEndsAt: new Date(input.nowMs + proration.totalDays * ACTIVATION_MS_PER_DAY),
    proration,
  };
}
