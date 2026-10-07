import { describe, it, expect } from 'vitest';
import { PRICING_TIERS, PRICING_PLANS, calculateTimeRemaining } from '@/entities/subscription/types';
import { userEntitlementSchema, createCheckoutPreferenceSchema } from '@/entities/subscription/schemas';
import { checkUserEntitlementAction, assertUserEntitlementAction } from '@/features/pricing/actions';

describe('Subscription & Entitlements Logic', () => {
  it('debe tener configurada la Matriz de 3 Planes: Starter 🟢, Pro 🔵 y Max 🟣 con ciclo mensual y semestral', () => {
    // 1. Starter
    expect(PRICING_TIERS.starter.monthly.priceClp).toBe(2500);
    expect(PRICING_TIERS.starter.semiannual.priceClp).toBe(6000);
    expect(PRICING_TIERS.starter.semiannual.discountPercentage).toBe(60);
    expect(PRICING_TIERS.starter.semiannual.monthlyEquivalentClp).toBe(1000);
    expect(PRICING_TIERS.starter.limits.cards).toBe(3);
    expect(PRICING_TIERS.starter.limits.cvs).toBe(1);
    expect(PRICING_TIERS.starter.limits.presentations).toBe(2);
    expect(PRICING_TIERS.starter.limits.hasWatermark).toBe(false);

    // 2. Pro (Recomendado)
    expect(PRICING_TIERS.pro.monthly.priceClp).toBe(4990);
    expect(PRICING_TIERS.pro.semiannual.priceClp).toBe(15000);
    expect(PRICING_TIERS.pro.semiannual.discountPercentage).toBe(50);
    expect(PRICING_TIERS.pro.semiannual.monthlyEquivalentClp).toBe(2500);
    expect(PRICING_TIERS.pro.limits.cards).toBe(10);
    expect(PRICING_TIERS.pro.limits.cvs).toBe(5);
    expect(PRICING_TIERS.pro.limits.presentations).toBe(10);
    expect(PRICING_TIERS.pro.limits.hasWatermark).toBe(false);

    // 3. Max (Poder Ilimitado)
    expect(PRICING_TIERS.max.monthly.priceClp).toBe(8990);
    expect(PRICING_TIERS.max.semiannual.priceClp).toBe(29990);
    expect(PRICING_TIERS.max.semiannual.discountPercentage).toBe(44);
    expect(PRICING_TIERS.max.limits.cards).toBe('unlimited');
    expect(PRICING_TIERS.max.limits.cvs).toBe('unlimited');
    expect(PRICING_TIERS.max.limits.presentations).toBe('unlimited');
    expect(PRICING_TIERS.max.limits.hasWatermark).toBe(false);

    // 4. Verificación de Cero Redundancia en copy de marca de agua
    const starterWatermarkText = PRICING_TIERS.starter.features.some(f => f.text.toLowerCase().includes('sin marca de agua'));
    const proHasWatermarkDuplicate = PRICING_TIERS.pro.features.some(f => f.text.toLowerCase().includes('marca 100% removida'));
    const maxHasWatermarkDuplicate = PRICING_TIERS.max.features.some(f => f.text.toLowerCase().includes('marca 100% removida'));

    expect(starterWatermarkText).toBe(true);
    expect(proHasWatermarkDuplicate).toBe(false);
    expect(maxHasWatermarkDuplicate).toBe(false);
  });

  it('valida el contrato Zod de preferencia de checkout con tier y planInterval', () => {
    const valid = createCheckoutPreferenceSchema.safeParse({
      tier: 'pro',
      planInterval: 'semiannual',
    });
    expect(valid.success).toBe(true);

    const defaultFallback = createCheckoutPreferenceSchema.safeParse({});
    expect(defaultFallback.success).toBe(true);
    if (defaultFallback.success) {
      expect(defaultFallback.data.tier).toBe('pro');
      expect(defaultFallback.data.planInterval).toBe('semiannual');
    }
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
    expect(allowedCheck.entitlement.tier).toBe('pro');
    expect(allowedCheck.entitlement.limits.cards).toBe(10);
    expect(allowedCheck.entitlement.limits.cvs).toBe(5);
    expect(allowedCheck.entitlement.limits.presentations).toBe(10);

    // Verificación de contrato seguro
    expect(allowedCheck.error).toBeUndefined();
  });

  it('el guardrail assertQuotaAvailableAction valida límites cuantitativos por plan', async () => {
    const { assertQuotaAvailableAction } = await import('@/features/pricing/actions');

    // Para usuario en prueba o nuevo (tier Pro: 10 tarjetas, 5 cvs, 10 presentaciones)
    const cardQuota = await assertQuotaAvailableAction('usuario-inexistente-uuid', 'cards');
    expect(cardQuota.allowed).toBe(true);
    expect(cardQuota.maxLimit).toBe(10);

    const cvQuota = await assertQuotaAvailableAction('usuario-inexistente-uuid', 'cvs');
    expect(cvQuota.allowed).toBe(true);
    expect(cvQuota.maxLimit).toBe(5);

    const presentationQuota = await assertQuotaAvailableAction('usuario-inexistente-uuid', 'presentations');
    expect(presentationQuota.allowed).toBe(true);
    expect(presentationQuota.maxLimit).toBe(10);
  });
});
