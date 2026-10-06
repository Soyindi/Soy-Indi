import { z } from 'zod';

export const telemetryViewSchema = z.object({
  slug: z.string().min(1, 'El slug es obligatorio').max(100),
  entityType: z.enum(['card', 'cv', 'presentation']),
});

export type TelemetryViewPayload = z.infer<typeof telemetryViewSchema>;
