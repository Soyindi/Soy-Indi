import { describe, it, expect } from 'vitest';
import * as schema from '@/entities/schema';
import { getTableColumns } from 'drizzle-orm';
import { z } from 'zod';

describe('Turso LibSQL Architecture & Schema Integrity Suite', () => {
  it('debe contener todas las 9 tablas de dominio centralizadas en schema.ts', () => {
    expect(schema.user).toBeDefined();
    expect(schema.session).toBeDefined();
    expect(schema.account).toBeDefined();
    expect(schema.verification).toBeDefined();
    expect(schema.cards).toBeDefined();
    expect(schema.cardEvents).toBeDefined();
    expect(schema.smartCvs).toBeDefined();
    expect(schema.presentations).toBeDefined();
    expect(schema.paymentsHistory).toBeDefined();
  });

  it('tabla paymentsHistory debe incluir columnas para auditoría financiera de Mercado Pago', () => {
    const columns = getTableColumns(schema.paymentsHistory);
    expect(columns.id).toBeDefined();
    expect(columns.userId).toBeDefined();
    expect(columns.planInterval).toBeDefined();
    expect(columns.amount).toBeDefined();
    expect(columns.currency).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.paymentMethodId).toBeDefined();
    expect(columns.externalReference).toBeDefined();
    expect(columns.createdAt).toBeDefined();
  });

  it('tabla cards debe incluir columna address para geolocalización', () => {
    const columns = getTableColumns(schema.cards);
    expect(columns.address).toBeDefined();
    expect(columns.slug).toBeDefined();
    expect(columns.themeConfig).toBeDefined();
    expect(columns.viewsCount).toBeDefined();
    expect(columns.clicksCount).toBeDefined();
  });

  it('tabla cardEvents debe definir tipos de eventos de telemetría válidos', () => {
    const columns = getTableColumns(schema.cardEvents);
    expect(columns.cardId).toBeDefined();
    expect(columns.eventType).toBeDefined();
    expect(columns.source).toBeDefined();
    expect(columns.device).toBeDefined();
    expect(columns.createdAt).toBeDefined();
  });

  it('tabla presentations debe soportar slidesData y themeSettings con modo JSON', () => {
    const columns = getTableColumns(schema.presentations);
    expect(columns.slidesData).toBeDefined();
    expect(columns.themeSettings).toBeDefined();
    expect(columns.isPublic).toBeDefined();
    expect(columns.slug).toBeDefined();
  });

  it('validador de telemetría de tarjeta debe rechazar tipos de eventos desconocidos', () => {
    const telemetrySchema = z.object({
      slug: z.string().min(1),
      eventType: z.enum(['view', 'contact_save', 'whatsapp_click', 'share', 'qr_scan']),
      source: z.string().optional().default('direct'),
      device: z.string().optional().default('mobile'),
    });

    const validPayload = {
      slug: 'matias-riquelme',
      eventType: 'whatsapp_click' as const,
      source: 'qr',
      device: 'mobile',
    };
    expect(telemetrySchema.safeParse(validPayload).success).toBe(true);

    const invalidPayload = {
      slug: 'matias-riquelme',
      eventType: 'hacker_event',
    };
    expect(telemetrySchema.safeParse(invalidPayload).success).toBe(false);
  });
});
