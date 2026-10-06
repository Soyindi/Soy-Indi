import { z } from 'zod';

export const createCheckoutPreferenceSchema = z.object({
  tier: z.enum(['starter', 'pro', 'max']).default('pro'),
  planInterval: z.enum(['monthly', 'semiannual']).default('semiannual'),
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

export const timeRemainingSchema = z.object({
  days: z.number().int().min(0),
  hours: z.number().int().min(0).max(23),
  minutes: z.number().int().min(0).max(59),
  seconds: z.number().int().min(0).max(59),
  isExpired: z.boolean(),
  totalMs: z.number().int().min(0),
});

export const userEntitlementSchema = z.object({
  hasAccess: z.boolean(),
  isTrial: z.boolean(),
  status: z.enum(['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED']),
  daysRemaining: z.number().int().min(0),
  expiresAt: z.number().nullable(),
  timeRemaining: timeRemainingSchema,
});
