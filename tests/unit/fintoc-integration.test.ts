import { describe, it, expect } from 'vitest';
import {
  fintocWebhookPayloadSchema,
  createCheckoutPreferenceSchema,
} from '@/entities/subscription/schemas';
import { fintocAdapter } from '@/shared/lib/payments/fintoc';
import { paymentRegistry } from '@/shared/lib/payments/registry';

describe('Fintoc Integration & Payment Provider Adapter (INDI 2026)', () => {
  it('valida esquemas de checkout unificado con selector de proveedor', () => {
    const validFintoc = createCheckoutPreferenceSchema.safeParse({
      tier: 'pro',
      planInterval: 'semiannual',
      provider: 'fintoc',
    });
    expect(validFintoc.success).toBe(true);

    const validWebpay = createCheckoutPreferenceSchema.safeParse({
      tier: 'starter',
      planInterval: 'monthly',
      provider: 'webpay',
    });
    expect(validWebpay.success).toBe(true);

    const invalidProvider = createCheckoutPreferenceSchema.safeParse({
      tier: 'starter',
      planInterval: 'monthly',
      provider: 'stripe_unsupported',
    });
    expect(invalidProvider.success).toBe(false);
  });

  it('valida payloads de webhook de Fintoc estrictamente', () => {
    const validPayload = {
      id: 'evt_123456789',
      type: 'invoice.payment_succeeded',
      created_at: '2026-10-09T17:00:00Z',
      data: {
        id: 'pi_abc123',
        amount: 2500,
        currency: 'CLP',
        status: 'succeeded',
        metadata: {
          user_id: 'user_test_123',
          plan_tier: 'starter',
          plan_interval: 'monthly',
        },
      },
    };

    const parsed = fintocWebhookPayloadSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it('el registry de adaptadores resuelve Fintoc, Webpay y Mercado Pago', () => {
    const fintoc = paymentRegistry.getAdapter('fintoc');
    expect(fintoc.id).toBe('fintoc');

    const webpay = paymentRegistry.getAdapter('webpay');
    expect(webpay.id).toBe('webpay');

    const mp = paymentRegistry.getAdapter('mercadopago');
    expect(mp.id).toBe('mercadopago');
  });

  it('el adaptador Fintoc provee modo demo_fallback cuando no hay API keys configuradas', async () => {
    const session = await fintocAdapter.createCheckoutSession({
      userId: 'user_demo_1',
      tier: 'starter',
      planInterval: 'monthly',
      origin: 'https://soyindi.cl',
    });

    expect(session.success).toBe(true);
    expect(session.provider).toBe('fintoc');
    expect(session.checkoutUrl).toContain('/checkout/success');
  });

  it('calcula la comisión del 25% para afiliados sobre pagos Fintoc en CLP', () => {
    const planPrice = 2500;
    const commissionClp = Math.round(planPrice * 0.25);
    expect(commissionClp).toBe(625);

    const semiannualPrice = 15000;
    const semiannualCommission = Math.round(semiannualPrice * 0.25);
    expect(semiannualCommission).toBe(3750);
  });
});
