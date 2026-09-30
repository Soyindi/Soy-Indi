import { describe, it, expect } from 'vitest';
import { PRICING_PLANS } from '@/entities/subscription/types';
import { checkUserEntitlementAction } from '@/features/pricing/actions';

describe('Subscription & Entitlements Logic', () => {
  it('debe tener configurados los planes comerciales oficiales (Mensual $2.500 CLP / Semestral $6.000 CLP)', () => {
    expect(PRICING_PLANS.monthly.priceClp).toBe(2500);
    expect(PRICING_PLANS.semiannual.priceClp).toBe(6000);
    expect(PRICING_PLANS.semiannual.discountPercentage).toBe(60);
    expect(PRICING_PLANS.semiannual.monthlyEquivalentClp).toBe(1000);
  });

  it('debe otorgar 15 días de prueba gratuita y 30 créditos de IA por defecto a nuevos usuarios', async () => {
    // Si no se pasa userId o no existe usuario registrado
    const entitlement = await checkUserEntitlementAction('usuario-inexistente-uuid');
    expect(entitlement.hasAccess).toBe(true);
    expect(entitlement.isTrial).toBe(true);
    expect(entitlement.daysRemaining).toBeGreaterThanOrEqual(1);
    expect(entitlement.aiCredits).toBe(30);
  });
});
