'use server';

import { db } from '@/shared/api/db';
import { cardEvents, cards } from '@/entities/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const recordEventSchema = z.object({
  slug: z.string().min(1),
  eventType: z.enum(['view', 'contact_save', 'whatsapp_click', 'share', 'qr_scan']),
  source: z.string().optional().default('direct'),
  device: z.string().optional().default('mobile'),
});

export type RecordEventInput = z.input<typeof recordEventSchema>;

/**
 * Server Action: Telemetría de Alta Resiliencia para Tarjetas Digitales INDI
 * Registra eventos atómicos en Turso (LibSQL) e incrementa contadores consolidados.
 */
export async function trackCardEventAction(input: RecordEventInput): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validated = recordEventSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: 'Parámetros de telemetría inválidos' };
    }

    const { slug, eventType, source, device } = validated.data;

    // Buscar tarjeta correspondiente
    const card = await db.query.cards.findFirst({
      where: eq(cards.slug, slug),
    });

    if (!card) {
      return { success: false, error: 'Tarjeta no encontrada' };
    }

    // Atomic batch update in Turso LibSQL (collapses 2 roundtrips into 1)
    if (eventType === 'view') {
      await db.batch([
        db.insert(cardEvents).values({
          cardId: card.id,
          eventType,
          source,
          device,
        }),
        db
          .update(cards)
          .set({ viewsCount: sql`${cards.viewsCount} + 1` })
          .where(eq(cards.id, card.id)),
      ]);
    } else if (eventType === 'contact_save' || eventType === 'whatsapp_click') {
      await db.batch([
        db.insert(cardEvents).values({
          cardId: card.id,
          eventType,
          source,
          device,
        }),
        db
          .update(cards)
          .set({ clicksCount: sql`${cards.clicksCount} + 1` })
          .where(eq(cards.id, card.id)),
      ]);
    } else {
      await db.insert(cardEvents).values({
        cardId: card.id,
        eventType,
        source,
        device,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Telemetry] Error registrando evento de tarjeta:', err);
    return { success: false, error: 'Error registrando telemetría' };
  }
}
