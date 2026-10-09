import { describe, it, expect } from 'vitest';
import { calculateUpgradeTimeCredit } from '@/entities/subscription/proration';
import { PRICING_TIERS } from '@/entities/subscription/types';

describe('Motor de Crédito Temporal (Subscription Proration Engine)', () => {
  it('calcula la duración estándar de 30 días cuando el usuario no tiene plan previo', () => {
    const result = calculateUpgradeTimeCredit(null, null, 0, 'starter', 'monthly');
    expect(result.hasTimeCredit).toBe(false);
    expect(result.bonusDays).toBe(0);
    expect(result.totalDays).toBe(30);
    expect(result.creditMonetaryClp).toBe(0);
  });

  it('calcula la duración estándar de 180 días para contratación semestral sin crédito previo', () => {
    const result = calculateUpgradeTimeCredit(null, null, 0, 'pro', 'semiannual');
    expect(result.hasTimeCredit).toBe(false);
    expect(result.bonusDays).toBe(0);
    expect(result.totalDays).toBe(180);
    expect(result.creditMonetaryClp).toBe(0);
  });

  it('calcula días de crédito bonus al hacer upgrade de Starter Mensual ($2.500) a Pro Mensual ($4.990) con 15 días restantes', () => {
    // Starter mensual = 2500 CLP / 30 días = ~83.33 CLP/día
    // 15 días restantes = 15 * 83.33 = 1250 CLP crédito residual
    // Pro mensual = 4990 CLP / 30 días = ~166.33 CLP/día
    // BonusDays = floor(1250 / 166.33) = floor(7.51) = 7 días
    // TotalDays = 30 + 7 = 37 días
    const result = calculateUpgradeTimeCredit('starter', 'monthly', 15, 'pro', 'monthly');

    expect(result.hasTimeCredit).toBe(true);
    expect(result.creditMonetaryClp).toBe(1250);
    expect(result.bonusDays).toBe(7);
    expect(result.totalDays).toBe(37);
  });

  it('calcula días de crédito bonus al pasar de Pro Mensual a Max Mensual con 20 días restantes', () => {
    // Pro mensual = 4990 / 30 = 166.33 CLP/día -> 20 días = 3326.66 ~ 3327 CLP
    // Max mensual = 8990 / 30 = 299.66 CLP/día
    // BonusDays = floor(3327 / 299.66) = 11 días
    // TotalDays = 30 + 11 = 41 días
    const result = calculateUpgradeTimeCredit('pro', 'monthly', 20, 'max', 'monthly');

    expect(result.hasTimeCredit).toBe(true);
    expect(result.bonusDays).toBe(11);
    expect(result.totalDays).toBe(41);
  });

  it('calcula crédito al pasar de Starter a Pro Semestral ($15.000 / 180 días = ~83.33 CLP/día)', () => {
    // Starter mensual = 2500 / 30 = ~83.33 CLP/día -> 20 días = ~1667 CLP
    // Pro semestral = 15000 / 180 = ~83.33 CLP/día
    // BonusDays = floor(1667 / 83.33) = 20 días
    // TotalDays = 180 + 20 = 200 días
    const result = calculateUpgradeTimeCredit('starter', 'monthly', 20, 'pro', 'semiannual');

    expect(result.hasTimeCredit).toBe(true);
    expect(result.bonusDays).toBe(20);
    expect(result.totalDays).toBe(200);
  });

  it('no otorga crédito si remainingDays es menor o igual a 0', () => {
    const result = calculateUpgradeTimeCredit('starter', 'monthly', 0, 'pro', 'monthly');
    expect(result.hasTimeCredit).toBe(false);
    expect(result.bonusDays).toBe(0);
    expect(result.totalDays).toBe(30);
  });
});
