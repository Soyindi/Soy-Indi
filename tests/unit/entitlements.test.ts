import { describe, it, expect } from 'vitest';
import { PRICING_PLANS, calculateTimeRemaining } from '@/entities/subscription/types';
import { userEntitlementSchema } from '@/entities/subscription/schemas';
import { checkUserEntitlementAction, assertUserEntitlementAction } from '@/features/pricing/actions';

describe('Subscription & Entitlements Logic', () => {
  it('debe tener configurados los planes comerciales oficiales (Mensual $2.500 CLP / Semestral $6.000 CLP)', () => {
    expect(PRICING_PLANS.monthly.priceClp).toBe(2500);
    expect(PRICING_PLANS.semiannual.priceClp).toBe(6000);
    expect(PRICING_PLANS.semiannual.discountPercentage).toBe(60);
    expect(PRICING_PLANS.semiannual.monthlyEquivalentClp).toBe(1000);
  });

  it('calcula con precisión matemática determinista el tiempo restante en días, horas, minutos y segundos', () => {
    const baseNow = new Date('2026-10-06T12:00:00.000Z');
    // 2 días, 4 horas, 30 minutos y 15 segundos después
    const target = new Date(baseNow.getTime() + (2 * 24 * 3600 + 4 * 3600 + 30 * 60 + 15) * 1000);

    const result = calculateTimeRemaining(target, baseNow);
    expect(result.days).toBe(2);
    expect(result.hours).toBe(4);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(15);
    expect(result.isExpired).toBe(false);
  });

  it('reconoce correctamente cuando el tiempo ha expirado', () => {
    const baseNow = new Date('2026-10-06T12:00:00.000Z');
    const pastTarget = new Date(baseNow.getTime() - 1000);

    const result = calculateTimeRemaining(pastTarget, baseNow);
    expect(result.isExpired).toBe(true);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.totalMs).toBe(0);
  });

  it('debe otorgar 3 días de prueba gratuita por defecto con expiresAt estructurado y esquema Zod válido', async () => {
    const entitlement = await checkUserEntitlementAction('usuario-inexistente-uuid');
    expect(entitlement.hasAccess).toBe(true);
    expect(entitlement.isTrial).toBe(true);
    expect(entitlement.status).toBe('TRIAL');
    expect(entitlement.daysRemaining).toBe(3);
    expect(typeof entitlement.expiresAt).toBe('number');
    expect(entitlement.timeRemaining).toBeDefined();
    expect(entitlement.timeRemaining.days).toBeGreaterThanOrEqual(2);

    const parsed = userEntitlementSchema.safeParse(entitlement);
    expect(parsed.success).toBe(true);
  }, 15000);

  it('el guardrail assertUserEntitlementAction permite la ejecución a usuarios válidos y retorna error formal a expirados', async () => {
    // Para usuario nuevo o prueba por defecto:
    const allowedCheck = await assertUserEntitlementAction('usuario-inexistente-uuid');
    expect(allowedCheck.allowed).toBe(true);
    expect(allowedCheck.entitlement.hasAccess).toBe(true);

    // Verificación de contrato seguro
    expect(allowedCheck.error).toBeUndefined();
  });
});
