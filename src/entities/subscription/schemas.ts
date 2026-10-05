import { z } from 'zod';

export const createCheckoutPreferenceSchema = z.object({
  planInterval: z.enum(['monthly', 'semiannual'], {
    message: 'El plan debe ser monthly o semiannual',
  }),
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
