import { describe, it, expect } from 'vitest';
import {
  resolveEntitlementState,
  buildPreviewEntitlement,
  resolveLegacyTrialAnchor,
  computeClockSkewMs,
  msUntilNextSecondBoundary,
  shouldDisplayLiveCountdown,
  TRIAL_DURATION_MS,
  GRACE_PERIOD_MS,
} from '@/entities/subscription/entitlement-engine';
import {
  resolvePlanFromPayment,
  computeSubscriptionActivationWindow,
} from '@/entities/subscription/proration';
import { userEntitlementSchema } from '@/entities/subscription/schemas';

describe('Entitlement Engine Deterministic State Machine (Audit 2026)', () => {
  const baseNow = new Date('2026-10-10T12:00:00.000Z').getTime();

  it('calcula estado TRIAL activo con expiración absoluta exacta y pasa validación Zod', () => {
    const trialEndsAt = baseNow + 2 * 86_400_000;
    const entitlement = resolveEntitlementState(
      {
        status: 'TRIAL',
        trialEndsAt,
        subscriptionEndsAt: null,
        resolvedTier: 'pro',
      },
      baseNow
    );

    expect(entitlement.hasAccess).toBe(true);
    expect(entitlement.isTrial).toBe(true);
    expect(entitlement.isGracePeriod).toBe(false);
    expect(entitlement.status).toBe('TRIAL');
    expect(entitlement.tier).toBe('pro');
    expect(entitlement.daysRemaining).toBe(2);
    expect(entitlement.expiresAt).toBe(trialEndsAt);
    expect(entitlement.source).toBe('database');
    expect(entitlement.timeRemaining.days).toBe(2);
    expect(entitlement.timeRemaining.hours).toBe(0);

    const parsed = userEntitlementSchema.safeParse(entitlement);
    expect(parsed.success).toBe(true);
  });

  it('transiciona TRIAL a EXPIRED cuando now supera trialEndsAt (eliminación de bypass)', () => {
    const expiredTrialEndsAt = baseNow - 1000;
    const entitlement = resolveEntitlementState(
      {
        status: 'TRIAL',
        trialEndsAt: expiredTrialEndsAt,
        subscriptionEndsAt: null,
      },
      baseNow
    );

    expect(entitlement.hasAccess).toBe(false);
    expect(entitlement.isTrial).toBe(false);
    expect(entitlement.status).toBe('EXPIRED');
    expect(entitlement.daysRemaining).toBe(0);
    expect(entitlement.timeRemaining.isExpired).toBe(true);
  });

  it('transiciona ACTIVE a GRACE_PERIOD durante la ventana de 5 días post-vencimiento (Regla 19)', () => {
    // 1 día después de haber vencido la suscripción paga
    const subscriptionEndsAt = baseNow - 86_400_000;
    const entitlement = resolveEntitlementState(
      {
        status: 'ACTIVE',
        trialEndsAt: null,
        subscriptionEndsAt,
        resolvedTier: 'max',
      },
      baseNow
    );

    expect(entitlement.hasAccess).toBe(true);
    expect(entitlement.isGracePeriod).toBe(true);
    expect(entitlement.status).toBe('GRACE_PERIOD');
    expect(entitlement.tier).toBe('max');
    // Le quedan 4 días de los 5 de gracia
    expect(entitlement.daysRemaining).toBe(4);
    expect(entitlement.expiresAt).toBe(subscriptionEndsAt + GRACE_PERIOD_MS);
  });

  it('transiciona ACTIVE a EXPIRED tras agotarse los 5 días de período de gracia', () => {
    // 6 días después del vencimiento
    const subscriptionEndsAt = baseNow - 6 * 86_400_000;
    const entitlement = resolveEntitlementState(
      {
        status: 'ACTIVE',
        trialEndsAt: null,
        subscriptionEndsAt,
        resolvedTier: 'max',
      },
      baseNow
    );

    expect(entitlement.hasAccess).toBe(false);
    expect(entitlement.isGracePeriod).toBe(false);
    expect(entitlement.status).toBe('EXPIRED');
    expect(entitlement.daysRemaining).toBe(0);
  });

  it('ancla cuentas legacy con trialEndsAt = null exactamente a 3 días a partir de ahora (Auto-Healing)', () => {
    const anchor = resolveLegacyTrialAnchor(baseNow);
    expect(anchor).toBe(baseNow + TRIAL_DURATION_MS);
  });

  it('buildPreviewEntitlement genera contratos consistentes marcados como anonymous/fallback', () => {
    const preview = buildPreviewEntitlement(baseNow, 'anonymous');
    expect(preview.source).toBe('anonymous');
    expect(preview.hasAccess).toBe(true);
    expect(preview.isTrial).toBe(true);
    expect(preview.status).toBe('TRIAL');
    expect(shouldDisplayLiveCountdown(preview)).toBe(false);
  });

  it('shouldDisplayLiveCountdown cumple la Regla 19 (UX No Invasiva)', () => {
    // 1. TRIAL con datos reales sí muestra cuenta regresiva
    const realTrial = resolveEntitlementState(
      { status: 'TRIAL', trialEndsAt: baseNow + 86_400_000, subscriptionEndsAt: null },
      baseNow
    );
    expect(shouldDisplayLiveCountdown(realTrial)).toBe(true);

    // 2. ACTIVE con 20 días restantes NO muestra cuenta regresiva estresante
    const calmActive = resolveEntitlementState(
      { status: 'ACTIVE', trialEndsAt: null, subscriptionEndsAt: baseNow + 20 * 86_400_000 },
      baseNow
    );
    expect(shouldDisplayLiveCountdown(calmActive)).toBe(false);

    // 3. ACTIVE urgente (<= 3 días) sí activa el temporizador
    const urgentActive = resolveEntitlementState(
      { status: 'ACTIVE', trialEndsAt: null, subscriptionEndsAt: baseNow + 2 * 86_400_000 },
      baseNow
    );
    expect(shouldDisplayLiveCountdown(urgentActive)).toBe(true);
  });

  it('corrige desfase de reloj solo si supera la tolerancia de 60 segundos', () => {
    const serverNow = 1_000_000;
    // 5 segundos de diferencia: considerado jitter/latencia, skew = 0
    expect(computeClockSkewMs(serverNow, 1_005_000, 60_000)).toBe(0);
    // 120 segundos de diferencia: reloj cliente desfasado, skew = -120_000
    expect(computeClockSkewMs(serverNow, 1_120_000, 60_000)).toBe(-120_000);
  });

  it('calcula alineación al milisegundo exacto del siguiente segundo (msUntilNextSecondBoundary)', () => {
    expect(msUntilNextSecondBoundary(1234)).toBe(766);
    expect(msUntilNextSecondBoundary(2000)).toBe(1000);
  });
});

describe('Subscription Proration & Activation Security Engine', () => {
  it('resuelve plan por monto cobrado si los metadatos fueron manipulados (Anti-Tampering)', () => {
    // Supongamos un atacante intenta enviar metadata planTier: 'max' pero sólo pagó 2500 CLP (Starter Mensual)
    const resolved = resolvePlanFromPayment('max', 'monthly', 2500);
    expect(resolved.planTier).toBe('starter');
    expect(resolved.planInterval).toBe('monthly');
    expect(resolved.resolvedBy).toBe('amount');
  });

  it('acumula bono de tiempo en upgrade mediante computeSubscriptionActivationWindow', () => {
    const nowMs = new Date('2026-10-10T12:00:00.000Z').getTime();
    // Usuario Starter con 20 días vigentes que hace upgrade a Pro Semestral
    const window = computeSubscriptionActivationWindow({
      currentStatus: 'ACTIVE',
      currentTier: 'starter',
      currentInterval: 'monthly',
      currentSubscriptionEndsAt: nowMs + 20 * 86_400_000,
      newTier: 'pro',
      newInterval: 'semiannual',
      nowMs,
    });

    expect(window.remainingDays).toBe(20);
    expect(window.bonusDays).toBeGreaterThan(0);
    expect(window.totalDays).toBe(180 + window.bonusDays);
    expect(window.subscriptionEndsAt.getTime()).toBe(nowMs + window.totalDays * 86_400_000);
  });
});
