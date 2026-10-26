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
    expect(PRICING_TIERS.starter.limits.cards).toBe(1);
    expect(PRICING_TIERS.starter.limits.cvs).toBe(1);
    expect(PRICING_TIERS.starter.limits.presentations).toBe(0);
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

  it('garantiza el Plan Comunitario Gratuito permanente (1 Tarjeta + 1 Smart CV) cuando el trial Pro de 3 días ha expirado', async () => {
    const { db } = await import('@/shared/api/db');
    const { assertQuotaAvailableAction } = await import('@/features/pricing/actions');

    const findFirstSpy = db.query.user.findFirst;
    const findManyUserSpy = db.query.user.findMany;
    const findManyCardsSpy = db.query.cards.findMany;
    const findManyCvsSpy = db.query.smartCvs.findMany;

    const expiredTrialUser = {
      id: 'user-community-expired-trial',
      status: 'TRIAL',
      trialEndsAt: new Date(Date.now() - 86_400_000), // Expiró ayer
      subscriptionEndsAt: null,
    };

    try {
      // Simular usuario con trial vencido, 0 tarjetas, 0 CVs y 0 referidos
      (db.query.user as any).findFirst = async () => expiredTrialUser;
      (db.query.user as any).findMany = async () => [];
      (db.query.cards as any).findMany = async () => [];
      (db.query.smartCvs as any).findMany = async () => [];

      // 1. assertUserEntitlementAction permite mutaciones de tarjetas y CVs bajo Plan Comunitario
      const cardEntitlement = await assertUserEntitlementAction('user-community-expired-trial', 'cards');
      expect(cardEntitlement.allowed).toBe(true);
      expect(cardEntitlement.entitlement.tier).toBe('starter');
      expect(cardEntitlement.entitlement.limits.cards).toBe(1);
      expect(cardEntitlement.entitlement.limits.cvs).toBe(1);

      const cvEntitlement = await assertUserEntitlementAction('user-community-expired-trial', 'cvs');
      expect(cvEntitlement.allowed).toBe(true);
      expect(cvEntitlement.entitlement.tier).toBe('starter');

      // 2. Presentaciones sí requieren membresía activa tras expirar el trial Pro
      const presEntitlement = await assertUserEntitlementAction('user-community-expired-trial', 'presentations');
      expect(presEntitlement.allowed).toBe(false);
      expect(presEntitlement.error).toContain('Presentaciones Orbitales');

      // 3. Con 0 tarjetas y 0 CVs, assertQuotaAvailableAction permite crear la 1ra Tarjeta y el 1er CV gratis
      const firstCardQuota = await assertQuotaAvailableAction('user-community-expired-trial', 'cards');
      expect(firstCardQuota.allowed).toBe(true);
      expect(firstCardQuota.currentCount).toBe(0);
      expect(firstCardQuota.maxLimit).toBe(1);

      const firstCvQuota = await assertQuotaAvailableAction('user-community-expired-trial', 'cvs');
      expect(firstCvQuota.allowed).toBe(true);
      expect(firstCvQuota.currentCount).toBe(0);
      expect(firstCvQuota.maxLimit).toBe(1);

      // 4. Cuando el usuario ya creó 1 tarjeta y 1 CV, bloquea la 2da creación (1/1) salvo que tenga referidos
      (db.query.cards as any).findMany = async () => [{ id: 'card-1' }];
      (db.query.smartCvs as any).findMany = async () => [{ id: 'cv-1' }];

      const secondCardQuota = await assertQuotaAvailableAction('user-community-expired-trial', 'cards');
      expect(secondCardQuota.allowed).toBe(false);
      expect(secondCardQuota.currentCount).toBe(1);
      expect(secondCardQuota.maxLimit).toBe(1);
      expect(secondCardQuota.error).toContain('1/1');

      const secondCvQuota = await assertQuotaAvailableAction('user-community-expired-trial', 'cvs');
      expect(secondCvQuota.allowed).toBe(false);
      expect(secondCvQuota.currentCount).toBe(1);
      expect(secondCvQuota.maxLimit).toBe(1);

      // 5. Si invita a 3 colegas confirmados, desbloquea +1 tarjeta extra gratuita (límite sube a 2)
      (db.query.user as any).findMany = async () => [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }];
      const bonusCardQuota = await assertQuotaAvailableAction('user-community-expired-trial', 'cards');
      expect(bonusCardQuota.allowed).toBe(true);
      expect(bonusCardQuota.currentCount).toBe(1);
      expect(bonusCardQuota.maxLimit).toBe(2);
    } finally {
      (db.query.user as any).findFirst = findFirstSpy;
      (db.query.user as any).findMany = findManyUserSpy;
      (db.query.cards as any).findMany = findManyCardsSpy;
      (db.query.smartCvs as any).findMany = findManyCvsSpy;
    }
  });
});
