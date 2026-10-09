import { describe, it, expect } from 'vitest';
import {
  createCheckoutPreferenceSchema,
  flowWebhookPayloadSchema,
  flowPaymentStatusSchema,
} from '@/entities/subscription/schemas';
import { flowAdapter } from '@/shared/lib/payments/flow';
import { paymentRegistry } from '@/shared/lib/payments/registry';

describe('Flow.cl Integration & Multi-Payment Ecosystem (INDI 2026)', () => {
  it('valida que createCheckoutPreferenceSchema acepte flow como proveedor predeterminado', () => {
    const defaultCheckout = createCheckoutPreferenceSchema.safeParse({
      tier: 'pro',
      planInterval: 'semiannual',
    });
    expect(defaultCheckout.success).toBe(true);
    if (defaultCheckout.success) {
      expect(defaultCheckout.data.provider).toBe('flow');
    }

    const explicitFlow = createCheckoutPreferenceSchema.safeParse({
      tier: 'starter',
      planInterval: 'monthly',
      provider: 'flow',
    });
    expect(explicitFlow.success).toBe(true);
  });

  it('calcula la firma canónica HMAC-SHA256 de Flow de forma determinista', () => {
    // Simulamos un set de parámetros
    const params = {
      apiKey: 'FLOW_TEST_KEY',
      commerceOrder: 'indi_order_123',
      amount: 2500,
      currency: 'CLP',
    };

    const signature = flowAdapter.signParams(params);
    expect(typeof signature).toBe('string');
    expect(signature.length).toBe(64); // SHA-256 produce un hash hex de 64 caracteres

    // La misma entrada debe producir el mismo hash
    const signature2 = flowAdapter.signParams(params);
    expect(signature).toBe(signature2);
  });

  it('valida el contrato Zod para webhooks y estado de pago de Flow', () => {
    const webhookData = {
      token: 'flow_token_xyz987',
      s: 'hash123',
    };
    const parsedWebhook = flowWebhookPayloadSchema.safeParse(webhookData);
    expect(parsedWebhook.success).toBe(true);

    const statusData = {
      flowOrder: 987654,
      commerceOrder: 'indi_user_123',
      status: 2, // 2: Pagada
      amount: 2500,
      currency: 'CLP',
      optional: JSON.stringify({ userId: 'u123', planTier: 'starter', planInterval: 'monthly' }),
    };
    const parsedStatus = flowPaymentStatusSchema.safeParse(statusData);
    expect(parsedStatus.success).toBe(true);
  });

  it('el registry de adaptadores resuelve Flow y lo declara como proveedor prioritario por defecto', () => {
    const flow = paymentRegistry.getAdapter('flow');
    expect(flow.id).toBe('flow');

    const defaultProvider = paymentRegistry.getDefaultProvider();
    expect(defaultProvider).toBe('flow');
  });

  it('el adaptador Flow provee modo demo_fallback cuando no hay API keys configuradas', async () => {
    const session = await flowAdapter.createCheckoutSession({
      userId: 'user_flow_demo',
      tier: 'pro',
      planInterval: 'semiannual',
      origin: 'https://soyindi.cl',
    });

    expect(session.success).toBe(true);
    expect(session.provider).toBe('flow');
    expect(session.mode).toBe('demo_fallback');
    expect(session.checkoutUrl).toContain('/checkout/success');
  });
});
