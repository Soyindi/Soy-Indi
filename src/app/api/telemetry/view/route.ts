import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/shared/api/db';
import { cards, cardEvents, smartCvs, presentations } from '@/entities/schema';
import { eq, sql } from 'drizzle-orm';
import { telemetryViewSchema } from '@/entities/telemetry/schemas';
import { checkTelemetryRateLimit, getUpstashRedis } from '@/shared/lib/rateLimiter';

/**
 * Route Handler de Telemetría Asíncrona (INDI 2026)
 * Registra visitas en segundo plano sin bloquear el renderizado ni romper el caché perimetral ISR.
 * 
 * Estrategia de Resiliencia y Alta Concurrencia (Hybrid Piggyback Flush):
 * 1. Con Upstash Redis disponible: Absorbe incrementos con HINCRBY atómico.
 *    Verifica ventana de 60s con lock SET NX EX 60 o umbral de 25 visitas.
 *    Si corresponde, ejecuta el flush en background con after() sin bloquear el retorno HTTP 200.
 * 2. Fallback sin Redis (o en desarrollo/testing local): Escritura directa en Turso LibSQL.
 */
export async function POST(req: NextRequest) {
  try {
    // 0. Protección contra abusos y ráfagas de escritura (60 req/min por IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'anonymous-client';
    const rateLimit = await checkTelemetryRateLimit(ip);
    if (!rateLimit.success) {
      return NextResponse.json({ success: true, rateLimited: true }, { status: 200 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = telemetryViewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Payload de telemetría inválido' }, { status: 400 });
    }

    const { slug, entityType } = parsed.data;

    if (slug === 'demo') {
      return NextResponse.json({ success: true, ignored: 'demo_slug' });
    }

    const redis = getUpstashRedis();

    // =========================================================================
    // RUTA 1: Absorción con Buffer Distribuido en Upstash Redis (Hybrid Piggyback)
    // =========================================================================
    if (redis && process.env.NODE_ENV !== 'test') {
      try {
        const bufferKey = `indi:views:buffer:${entityType}`;
        const pending = await redis.hincrby(bufferKey, slug, 1);
        const lock = await redis.set(`indi:views:flush_lock:${entityType}`, '1', {
          nx: true,
          ex: 60,
        });

        // Si pasó al menos 1 minuto (lock === 'OK') O el buffer superó 25 visitas
        if (lock === 'OK' || pending >= 25) {
          after(async () => {
            try {
              const allCounts = await redis.hgetall<Record<string, number>>(bufferKey);
              if (allCounts && Object.keys(allCounts).length > 0) {
                // Limpiar buffer en Redis
                await redis.del(bufferKey);

                // Ejecutar flush en lote a Turso LibSQL
                for (const [targetSlug, count] of Object.entries(allCounts)) {
                  const numViews = Number(count) || 1;
                  if (entityType === 'card') {
                    const card = await db.query.cards.findFirst({
                      where: eq(cards.slug, targetSlug),
                      columns: { id: true },
                    });
                    if (card) {
                      await db.batch([
                        db
                          .update(cards)
                          .set({ viewsCount: sql`${cards.viewsCount} + ${numViews}` })
                          .where(eq(cards.id, card.id)),
                        db.insert(cardEvents).values({
                          cardId: card.id,
                          eventType: 'view',
                        }),
                      ]);
                    }
                  } else if (entityType === 'cv') {
                    await db
                      .update(smartCvs)
                      .set({ viewsCount: sql`${smartCvs.viewsCount} + ${numViews}` })
                      .where(eq(smartCvs.slug, targetSlug));
                  } else if (entityType === 'presentation') {
                    await db
                      .update(presentations)
                      .set({ viewsCount: sql`${presentations.viewsCount} + ${numViews}` })
                      .where(eq(presentations.slug, targetSlug));
                  }
                }
              }
            } catch (flushErr) {
              console.warn('[Telemetry Piggyback Flush Error]', flushErr);
            }
          });
        }

        return NextResponse.json({ success: true, buffered: true });
      } catch (redisErr) {
        console.warn('[Telemetry Redis Warning] Fallback a persistencia directa:', redisErr);
      }
    }

    // =========================================================================
    // RUTA 2: Persistencia Directa (Fallback Resiliente / Testing)
    // =========================================================================
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
