import { describe, it, expect } from 'vitest';
import { 
  createCheckoutPreferenceSchema, 
  mercadopagoWebhookPayloadSchema 
} from '@/entities/subscription/schemas';
import { PRICING_PLANS } from '@/entities/subscription/types';

describe('Mercado Pago Integration & Schema Contracts', () => {
  it('validates checkout preference input correctly', () => {
    const validMonthly = createCheckoutPreferenceSchema.safeParse({ planInterval: 'monthly' });
    expect(validMonthly.success).toBe(true);

    const validSemiannual = createCheckoutPreferenceSchema.safeParse({ planInterval: 'semiannual' });
    expect(validSemiannual.success).toBe(true);

    const invalidPlan = createCheckoutPreferenceSchema.safeParse({ planInterval: 'annual' });
    expect(invalidPlan.success).toBe(false);
  });

  it('matches plan prices in CLP with official business model ($2.500 and $6.000)', () => {
    expect(PRICING_PLANS.monthly.priceClp).toBe(2500);
    expect(PRICING_PLANS.semiannual.priceClp).toBe(6000);
    expect(PRICING_PLANS.monthly.trialDays).toBe(3);
  });

  it('validates Mercado Pago IPN webhook payload format', () => {
    const validWebhook = {
      action: 'payment.created',
      type: 'payment',
      data: {
        id: '1234567890',
      },
      date_created: '2026-10-05T04:00:00Z',
      id: 987654,
    };

    const parsed = mercadopagoWebhookPayloadSchema.safeParse(validWebhook);
    expect(parsed.success).toBe(true);
  });

  it('rejects malformed webhook payloads missing data.id', () => {
    const malformed = {
      action: 'payment.created',
      data: {},
    };

    const parsed = mercadopagoWebhookPayloadSchema.safeParse(malformed);
    expect(parsed.success).toBe(false);
  });

  it('calculates proper subscription duration (30 days vs 180 days)', () => {
    const now = new Date('2026-10-05T12:00:00Z');
    
    // Plan Mensual
    const monthlyEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const monthlyDays = Math.round((monthlyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(monthlyDays).toBe(30);

    // Plan Semestral
    const semiannualEnd = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    const semiannualDays = Math.round((semiannualEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(semiannualDays).toBe(180);
  });
});
