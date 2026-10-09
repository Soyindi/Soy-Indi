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
