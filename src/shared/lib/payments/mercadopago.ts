import { PRICING_TIERS } from '@/entities/subscription/types';
import { isMercadoPagoConfigured, preferenceClient } from '@/shared/lib/mercadopago';
import {
  CheckoutSessionResult,
  CreateCheckoutSessionParams,
  PaymentProviderAdapter,
  WebhookSignatureVerificationParams,
} from './types';

/**
 * Adaptador Oficial Mercado Pago SDK v2 (Legacy Fallback)
 */
export class MercadoPagoAdapter implements PaymentProviderAdapter {
  readonly id = 'mercadopago' as const;

  isConfigured(): boolean {
    return isMercadoPagoConfigured();
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
    const tierConfig = PRICING_TIERS[params.tier] || PRICING_TIERS.pro;
    const cycleDetail = tierConfig[params.planInterval];
    const planName = `${tierConfig.name} (${params.planInterval === 'semiannual' ? 'Semestral' : 'Mensual'})`;
    const planPrice = cycleDetail.priceClp;
    const planDescription = `${tierConfig.tagline} • ${cycleDetail.intervalText}`;

    if (!this.isConfigured()) {
      return {
        success: true,
        checkoutUrl: `${params.origin}/checkout/success?tier=${params.tier}&plan=${params.planInterval}&provider=mercadopago&demo=true`,
        sessionId: `mp_mock_${Date.now()}`,
        provider: 'mercadopago',
        mode: 'demo_fallback',
      };
    }

    try {
      const preferenceResponse = await preferenceClient.create({
        body: {
          items: [
            {
              id: `plan_${params.tier}_${params.planInterval}`,
              title: `INDI: ${planName}`,
              description: planDescription,
              quantity: 1,
              unit_price: planPrice,
              currency_id: 'CLP',
            },
          ],
          payer: {
            email: params.customerEmail,
          },
          back_urls: {
            success: `${params.origin}/checkout/success?tier=${params.tier}&plan=${params.planInterval}`,
            pending: `${params.origin}/checkout/pending`,
            failure: `${params.origin}/pricing?error=payment_declined`,
          },
          auto_return: 'approved',
          metadata: {
            user_id: params.userId,
            tier: params.tier,
            plan_interval: params.planInterval,
            affiliate_code: params.affiliateCode || '',
          },
        },
      });

      return {
        success: true,
        checkoutUrl: preferenceResponse.init_point || preferenceResponse.sandbox_init_point || undefined,
        sessionId: preferenceResponse.id,
        provider: 'mercadopago',
        mode: 'live',
      };
    } catch (err: any) {
      console.error('[MercadoPagoAdapter] Error:', err);
      return {
        success: false,
        provider: 'mercadopago',
        mode: 'demo_fallback',
        error: err.message || 'Error al conectar con Mercado Pago.',
      };
    }
  }

  async verifyWebhookSignature(params: WebhookSignatureVerificationParams): Promise<boolean> {
    const { verifyMercadoPagoWebhookSignature } = await import('@/shared/lib/mercadopago');
    return verifyMercadoPagoWebhookSignature({
      xSignatureHeader: params.signatureHeader,
      xRequestIdHeader: null,
      dataId: 'webhook',
      webhookSecret: params.secret,
      maxToleranceSeconds: params.maxToleranceSeconds,
    });
  }
}

export const mercadopagoAdapter = new MercadoPagoAdapter();
