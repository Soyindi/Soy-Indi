import { describe, it, expect } from 'vitest';
import { telemetryViewSchema } from '@/entities/telemetry/schemas';
import { POST } from '@/app/api/telemetry/view/route';
import { NextRequest } from 'next/server';

describe('Passive Telemetry & View Counting Pipeline (INDI 2026)', () => {
  it('valida estrictamente el contrato Zod de telemetría de visualización', () => {
    const validCard = telemetryViewSchema.safeParse({
      slug: 'matias-riquelme',
      entityType: 'card',
    });
    expect(validCard.success).toBe(true);

    const validCv = telemetryViewSchema.safeParse({
      slug: 'cv-matias',
      entityType: 'cv',
    });
    expect(validCv.success).toBe(true);

    const validPresentation = telemetryViewSchema.safeParse({
      slug: 'pitch-deck-2026',
      entityType: 'presentation',
    });
    expect(validPresentation.success).toBe(true);

    // Tipo de entidad inválida
    const invalidType = telemetryViewSchema.safeParse({
      slug: 'pitch-deck-2026',
      entityType: 'other_unknown',
    });
    expect(invalidType.success).toBe(false);

    // Slug vacío
    const emptySlug = telemetryViewSchema.safeParse({
      slug: '',
      entityType: 'card',
    });
    expect(emptySlug.success).toBe(false);
  });

  it('el endpoint /api/telemetry/view responde de forma segura e ignora slugs de demo sin romper', async () => {
    const req = new NextRequest('http://localhost:3000/api/telemetry/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'demo', entityType: 'card' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.ignored).toBe('demo_slug');
  });

  it('el endpoint /api/telemetry/view rechaza payloads maliciosos o corruptos con HTTP 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/telemetry/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 123 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});
