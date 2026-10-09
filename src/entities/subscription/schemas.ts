import { z } from 'zod';

export const paymentProviderSchema = z.enum(['flow', 'fintoc', 'webpay', 'mercadopago']);

export const createCheckoutPreferenceSchema = z.object({
  tier: z.enum(['starter', 'pro', 'max']).default('pro'),
  planInterval: z.enum(['monthly', 'semiannual']).default('semiannual'),
  provider: paymentProviderSchema.default('flow'),
  affiliateCode: z.string().optional(),
});


export type CreateCheckoutPreferenceInput = z.infer<typeof createCheckoutPreferenceSchema>;

export const mercadopagoWebhookPayloadSchema = z.object({
  action: z.string().optional(),
  type: z.string().optional(),
  data: z.object({
    id: z.string(),
  }),
  date_created: z.string().optional(),
  id: z.number().or(z.string()).optional(),
  live_mode: z.boolean().optional(),
  user_id: z.number().or(z.string()).optional(),
});

export type MercadopagoWebhookPayload = z.infer<typeof mercadopagoWebhookPayloadSchema>;

// Contrato estricto para recepción de Webhooks de Fintoc A2A / PAC Digital
export const fintocWebhookPayloadSchema = z.object({
  id: z.string(),
  type: z.enum([
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'subscription.created',
    'payment_intent.succeeded',
    'payment_intent.failed',
    'checkout_session.finished',
    'checkout_session.expired',
  ]),
  created_at: z.string().optional(),
  data: z.object({
    id: z.string(),
    object: z.string().optional(),
    amount: z.number().int().positive(),
    currency: z.string().default('CLP'),
    status: z.string(),
    customer_id: z.string().optional(),
    subscription_id: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export type FintocWebhookPayload = z.infer<typeof fintocWebhookPayloadSchema>;

// Contrato para transacciones Webpay Oneclick / Transbank
export const webpayTransactionPayloadSchema = z.object({
  buyOrder: z.string(),
  sessionId: z.string().optional(),
  amount: z.number().int().positive(),
  tbkUser: z.string().optional(),
  authorizationCode: z.string().optional(),
  responseCode: z.number().int().optional(),
  paymentTypeCode: z.string().optional(),
  sharesNumber: z.number().int().optional(),
  status: z.enum(['AUTHORIZED', 'FAILED', 'REVERSED', 'NULLIFIED']).default('AUTHORIZED'),
});

export type WebpayTransactionPayload = z.infer<typeof webpayTransactionPayloadSchema>;

// Contrato de Webhook de Flow.cl (POST con token de pago)
export const flowWebhookPayloadSchema = z.object({
  token: z.string(),
  s: z.string().optional(), // Firma HMAC opcional en POST
});

export type FlowWebhookPayload = z.infer<typeof flowWebhookPayloadSchema>;

// Contrato de Estado de Pago consultado a Flow (/payment/getStatus)
export const flowPaymentStatusSchema = z.object({
  flowOrder: z.number().or(z.string()),
  commerceOrder: z.string(),
  requestDate: z.string().optional(),
  status: z.number().int(), // 1: pendiente, 2: pagada, 3: rechazada, 4: anulada
  subject: z.string().optional(),
  currency: z.string().default('CLP'),
  amount: z.number().positive(),
  payer: z.string().optional(),
  optional: z.string().optional(), // JSON codificado o string de metadatos (userId, tier, interval)
  pending_info: z.record(z.string(), z.any()).optional(),
  paymentData: z.record(z.string(), z.any()).optional(),
  merchantId: z.string().optional(),
});

export type FlowPaymentStatus = z.infer<typeof flowPaymentStatusSchema>;


export const timeRemainingSchema = z.object({
  days: z.number().int().min(0),
  hours: z.number().int().min(0).max(23),
  minutes: z.number().int().min(0).max(59),
  seconds: z.number().int().min(0).max(59),
  isExpired: z.boolean(),
  totalMs: z.number().int().min(0),
});

export const tierLimitsSchema = z.object({
  cards: z.union([z.number().int().min(0), z.literal('unlimited')]),
  cvs: z.union([z.number().int().min(0), z.literal('unlimited')]),
  presentations: z.union([z.number().int().min(0), z.literal('unlimited')]),
  hasWatermark: z.boolean(),
  analyticsLevel: z.enum(['basic', 'standard', 'advanced']),
  aiTier: z.enum(['standard', 'fast_lane', 'top_nim']),
});

export const userEntitlementSchema = z.object({
  hasAccess: z.boolean(),
  isTrial: z.boolean(),
  isGracePeriod: z.boolean().default(false),
  status: z.enum(['TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'CANCELLED']),
  tier: z.enum(['starter', 'pro', 'max']),
  limits: tierLimitsSchema,
  daysRemaining: z.number().int().min(0),
  expiresAt: z.number().nullable(),
  timeRemaining: timeRemainingSchema,
});
