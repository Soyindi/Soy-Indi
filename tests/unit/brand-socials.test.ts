import { describe, it, expect } from 'vitest';
import { brandSocialLinksSchema, OFFICIAL_BRAND_SOCIALS } from '@/entities/brand/socials';
import { LANDING_CONTENT } from '@/entities/landing/schemas';

describe('Brand Social Networks & Pricing Copy Consistency (INDI 2026)', () => {
  it('valida el esquema canónico de enlaces sociales oficiales', () => {
    const parseRes = brandSocialLinksSchema.safeParse(OFFICIAL_BRAND_SOCIALS);
    expect(parseRes.success).toBe(true);
    if (parseRes.success) {
      expect(parseRes.data.instagramUrl).toContain('instagram.com/soyindi.cl');
      expect(parseRes.data.linkedinUrl).toContain('linkedin.com/company/soyindi');
      expect(parseRes.data.xUrl).toContain('x.com/soyindicorporate');
      expect(parseRes.data.whatsappUrl).toContain('wa.me/56900000000');
    }
  });

  it('rechaza URLs sociales malformadas con protocolo inválido', () => {
    const invalidData = {
      ...OFFICIAL_BRAND_SOCIALS,
      instagramUrl: 'not-a-valid-url',
    };
    const parseRes = brandSocialLinksSchema.safeParse(invalidData);
    expect(parseRes.success).toBe(false);
  });

  it('permite cadenas vacías para desactivar temporalmente un canal secundario', () => {
    const validDataWithDisabled = {
      ...OFFICIAL_BRAND_SOCIALS,
      youtubeUrl: '',
      tiktokUrl: '',
    };
    const parseRes = brandSocialLinksSchema.safeParse(validDataWithDisabled);
    expect(parseRes.success).toBe(true);
  });

  it('asegura que el copy de la landing no contenga la referencia desfasada a $1.000 al mes en comparativa', () => {
    const paperVsDigital = LANDING_CONTENT.valueProps.find(
      (v) => v.title === 'Más barata que el papel'
    );
    expect(paperVsDigital).toBeDefined();
    expect(paperVsDigital?.description).toContain('$2.500 al mes');
    expect(paperVsDigital?.description).not.toContain('$1.000 al mes');
  });
});
