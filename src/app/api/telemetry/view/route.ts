import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { cards, cardEvents, smartCvs, presentations } from '@/entities/schema';
import { eq, sql } from 'drizzle-orm';
import { telemetryViewSchema } from '@/entities/telemetry/schemas';

/**
 * Route Handler de Telemetría Asíncrona (INDI 2026)
 * Registra visitas en segundo plano sin bloquear el renderizado ni romper el caché perimetral ISR.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = telemetryViewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Payload de telemetría inválido' }, { status: 400 });
    }

    const { slug, entityType } = parsed.data;

    if (slug === 'demo') {
      return NextResponse.json({ success: true, ignored: 'demo_slug' });
    }

    if (entityType === 'card') {
      const card = await db.query.cards.findFirst({
        where: eq(cards.slug, slug),
        columns: { id: true },
      });

      if (!card) {
        return NextResponse.json({ success: false, error: 'Tarjeta no encontrada' }, { status: 404 });
      }

      await db.batch([
        db
          .update(cards)
          .set({ viewsCount: sql`${cards.viewsCount} + 1` })
          .where(eq(cards.id, card.id)),
        db.insert(cardEvents).values({
          cardId: card.id,
          eventType: 'view',
        }),
      ]);
    } else if (entityType === 'cv') {
      const cvRecord = await db.query.smartCvs.findFirst({
        where: eq(smartCvs.slug, slug),
        columns: { id: true },
      });

      if (!cvRecord) {
        return NextResponse.json({ success: false, error: 'Smart CV no encontrado' }, { status: 404 });
      }

      await db
        .update(smartCvs)
        .set({ viewsCount: sql`${smartCvs.viewsCount} + 1` })
        .where(eq(smartCvs.id, cvRecord.id));
    } else if (entityType === 'presentation') {
      const pres = await db.query.presentations.findFirst({
        where: eq(presentations.slug, slug),
        columns: { id: true },
      });

      if (!pres) {
        return NextResponse.json({ success: false, error: 'Presentación no encontrada' }, { status: 404 });
      }

      await db
        .update(presentations)
        .set({ viewsCount: sql`${presentations.viewsCount} + 1` })
        .where(eq(presentations.id, pres.id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Telemetría Error]', error);
    // Responder 200/500 silencioso para no interrumpir clientes
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
