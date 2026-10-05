import { describe, expect, it } from 'vitest';
import {
  LANDING_CONTENT,
  LANDING_MAX_SECTIONS,
  formatClp,
  landingContentSchema,
  landingProductSchema,
} from '@/entities/landing/schemas';

describe('Landing minimalista — contrato de contenido', () => {
  it('valida el contenido canónico', () => {
    expect(landingContentSchema.safeParse(LANDING_CONTENT).success).toBe(true);
  });

  it('respeta el presupuesto de secciones', () => {
    expect(LANDING_CONTENT.sections.length).toBeLessThanOrEqual(LANDING_MAX_SECTIONS);
    const tooMany = { ...LANDING_CONTENT, sections: [...LANDING_CONTENT.sections, 'faq'] };
    expect(landingContentSchema.safeParse(tooMany).success).toBe(false);
  });

  it('mantiene precios alineados con AGENTS.md', () => {
    expect(LANDING_CONTENT.pricing).toEqual({ monthlyClp: 2500, semiannualClp: 6000, trialDays: 3 });
    expect(formatClp(2500)).toBe('$2.500');
  });

  it('rechaza enlaces externos o protocol-relative en productos', () => {
    const base = LANDING_CONTENT.products[0];
    expect(landingProductSchema.safeParse({ ...base, href: '//evil.com' }).success).toBe(false);
    expect(landingProductSchema.safeParse({ ...base, href: 'https://evil.com' }).success).toBe(false);
  });
});
