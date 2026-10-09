import { PRICING_TIERS } from '@/entities/subscription/types';
import {
  CheckoutSessionResult,
  CreateCheckoutSessionParams,
  PaymentProviderAdapter,
  WebhookSignatureVerificationParams,
} from './types';

/**
 * Adaptador Oficial Fintoc A2A / PAC Digital (Open Finance Chile)
 * - Tasa de comisión: 1,00% + IVA
 * - Tasa de aprobación proyectada: >98% (BancoEstado, Santander, Banco de Chile, BCI, etc.)
 * - Soporte Edge WebCrypto HMAC-SHA256
 */
export class FintocAdapter implements PaymentProviderAdapter {
  readonly id = 'fintoc' as const;

  private getApiKey(): string {
    return process.env.FINTOC_API_KEY || process.env.FINTOC_SECRET_KEY || '';
  }

  private getWebhookSecret(): string {
    return process.env.FINTOC_WEBHOOK_SECRET || '';
  }

  isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key !== 'test_dummy_key');
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
    const tierConfig = PRICING_TIERS[params.tier] || PRICING_TIERS.pro;
    const cycleDetail = tierConfig[params.planInterval];
    const planName = `${tierConfig.name} (${params.planInterval === 'semiannual' ? 'Semestral' : 'Mensual'})`;
    const planPrice = cycleDetail.priceClp;

    // Si no hay API key configurada en local/staging, provee un fallback demo controlado
    if (!this.isConfigured()) {
      return {
        success: true,
        checkoutUrl: `${params.origin}/checkout/success?tier=${params.tier}&plan=${params.planInterval}&provider=fintoc&demo=true`,
        sessionId: `fintoc_mock_intent_${Date.now()}`,
        provider: 'fintoc',
        mode: 'demo_fallback',
      };
    }

    try {
      const response = await fetch('https://api.fintoc.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planPrice,
          currency: 'CLP',
          recipient_account: {
            // Cuenta receptora configurada en panel Fintoc
          },
          metadata: {
            user_id: params.userId,
            plan_tier: params.tier,
            plan_interval: params.planInterval,
            affiliate_code: params.affiliateCode || '',
            product: `INDI: ${planName}`,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Fintoc API error HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        checkoutUrl: data.widget_token ? `https://webview.fintoc.com?token=${data.widget_token}` : undefined,
        sessionId: data.id,
        provider: 'fintoc',
        mode: 'live',
      };
    } catch (err: any) {
      console.error('[FintocAdapter] Error creating payment intent:', err);
      // Fallback a modo controlado ante fallos de red
      return {
        success: false,
        provider: 'fintoc',
        mode: 'demo_fallback',
        error: err.message || 'Error al conectar con la pasarela Fintoc.',
      };
    }
  }

  /**
   * Verificación Criptográfica WebCrypto HMAC-SHA256 (Compatible con Vercel Edge Runtime)
   * Header esperado: "t=1710000000,v1=605e55e...678"
   */
  async verifyWebhookSignature(params: WebhookSignatureVerificationParams): Promise<boolean> {
    const secret = params.secret || this.getWebhookSecret();

    // Modo permisivo seguro si no hay secret configurado (entorno de pruebas local)
    if (!secret) {
      return true;
    }

    if (!params.signatureHeader) {
      return false;
    }

    try {
      const parts = Object.fromEntries(
        params.signatureHeader.split(',').map((part) => {
          const [k, v] = part.split('=');
          return [k?.trim(), v?.trim()];
        })
      );

      const timestamp = parseInt(parts.t || '', 10);
      const providedSignature = parts.v1;

      if (!timestamp || !providedSignature) {
        return false;
      }

      // Protección anti-replay: tolerancia de 300 segundos
      const tolerance = params.maxToleranceSeconds ?? 300;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTimestamp - timestamp) > tolerance) {
        console.warn(`[FintocAdapter] Webhook rechazado por timestamp expirado (delta: ${Math.abs(currentTimestamp - timestamp)}s > ${tolerance}s)`);
        return false;
      }

      // WebCrypto SubtleCrypto HMAC-SHA256
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const sigMatches = providedSignature.match(/.{2}/g);
      if (!sigMatches) return false;
      const sigBytes = new Uint8Array(sigMatches.map((b) => parseInt(b, 16)));

      const signedPayload = `${parts.t}.${params.rawBody}`;
      return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(signedPayload));
    } catch (error) {
      console.error('[FintocAdapter] Signature verification exception:', error);
      return false;
    }
  }
}

export const fintocAdapter = new FintocAdapter();
