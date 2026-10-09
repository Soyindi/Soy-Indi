import { PlanInterval, PlanTier, PaymentProvider } from '@/entities/subscription/types';

export interface CreateCheckoutSessionParams {
  userId: string;
  tier: PlanTier;
  planInterval: PlanInterval;
  origin: string;
  affiliateCode?: string;
  customerEmail?: string;
  customerName?: string;
}

export interface CheckoutSessionResult {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  provider: PaymentProvider;
  mode: 'live' | 'sandbox' | 'demo_fallback';
  error?: string;
}

export interface WebhookSignatureVerificationParams {
  rawBody: string;
  signatureHeader: string | null;
  secret?: string;
  maxToleranceSeconds?: number;
}

export interface PaymentProviderAdapter {
  readonly id: PaymentProvider;
  isConfigured(): boolean;
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult>;
  verifyWebhookSignature(params: WebhookSignatureVerificationParams): Promise<boolean>;
}
