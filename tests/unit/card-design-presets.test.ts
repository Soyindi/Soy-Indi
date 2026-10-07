import { describe, it, expect } from 'vitest';
import { cardFormSchema } from '@/entities/card/schemas';
import { CARD_DESIGN_PRESETS } from '@/entities/card/themes';

describe('Card Design Presets & Materials', () => {
  it('debe contener los 7 arquetipos de diseño curados con paletas OKLCH válidas incluyendo opciones claras', () => {
    expect(CARD_DESIGN_PRESETS).toHaveLength(7);
    const ids = CARD_DESIGN_PRESETS.map((p) => p.id);
    expect(ids).toContain('luminous-opal');
    expect(ids).toContain('aurora-lumina');
    expect(ids).toContain('cyber-nebula');
    expect(ids).toContain('executive-titanium');
    expect(ids).toContain('emerald-botanical');
    expect(ids).toContain('solar-obsidian');
    expect(ids).toContain('swiss-monochrome');
  });

  it('debe validar exitosamente acabados de tarjeta (cardFinish) claros y oscuros, y texturas de superficie', () => {
    const cardWithFinish = {
      slug: 'ana-silva',
      title: 'Ana Silva',
      profession: 'Chief Design Officer',
      themeConfig: {
        themeId: 'luminous-opal',
        primaryColorOklch: '#4f46e5',
        backgroundColorOklch: '#f8fafc',
        particleBehavior: 'interactive' as const,
        particleIntensity: 'balanced' as const,
        fontFamily: 'Inter',
        enableGlassRefraction: true,
        cardFinish: 'luminous-glass' as const,
        surfaceTexture: 'frosted-prism' as const,
        badgeText: 'Disponible para Consultoría',
      },
    };

    const res = cardFormSchema.safeParse(cardWithFinish);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.themeConfig.cardFinish).toBe('luminous-glass');
      expect(res.data.themeConfig.surfaceTexture).toBe('frosted-prism');
      expect(res.data.themeConfig.badgeText).toBe('Disponible para Consultoría');
    }
  });

  it('debe asignar valores por defecto en cardFinish y surfaceTexture si no son proporcionados', () => {
    const cardDefault = {
      slug: 'diego-rojas',
      title: 'Diego Rojas',
      profession: 'Staff Backend Engineer',
      themeConfig: {
        themeId: 'stellar',
        primaryColorOklch: '#6366f1',
        backgroundColorOklch: '#090a10',
        particleBehavior: 'ambient' as const,
        particleIntensity: 'subtle' as const,
        fontFamily: 'Inter',
        enableGlassRefraction: true,
      },
    };

    const res = cardFormSchema.safeParse(cardDefault);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.themeConfig.cardFinish).toBe('classic');
      expect(res.data.themeConfig.surfaceTexture).toBe('radial-glow');
    }
  });
});
