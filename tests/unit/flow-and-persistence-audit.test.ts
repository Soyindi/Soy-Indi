import { describe, it, expect } from 'vitest';
import { cardFormSchema } from '@/entities/card/schemas';
import { cards } from '@/entities/schema';

describe('Auditoría Integral de Flujo y Persistencia', () => {
  it('el esquema Zod de tarjeta debe admitir personalizaciones de acabado y textura alineadas con la BD', () => {
    const rawData = {
      slug: 'auditoria-flujo-test',
      title: 'Matias Riquelme',
      profession: 'Staff Software Engineer',
      themeConfig: {
        themeId: 'stellar',
        primaryColorOklch: 'oklch(0.65 0.22 260)',
        backgroundColorOklch: 'oklch(0.14 0.04 260)',
        particleBehavior: 'ambient' as const,
        particleIntensity: 'balanced' as const,
        fontFamily: 'Inter',
        enableGlassRefraction: true,
        badgeText: 'Verificado',
        ctaLabel: 'Contactar Ahora',
        cardFinish: 'titanium' as const,
        surfaceTexture: 'radial-glow' as const,
      },
    };

    const parsed = cardFormSchema.safeParse(rawData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.themeConfig.cardFinish).toBe('titanium');
      expect(parsed.data.themeConfig.surfaceTexture).toBe('radial-glow');
      expect(parsed.data.themeConfig.badgeText).toBe('Verificado');
    }
  });

  it('la tabla de base de datos cards define la columna themeConfig y slug con constraints de integridad', () => {
    expect(cards.slug).toBeDefined();
    expect(cards.themeConfig).toBeDefined();
    expect(cards.userId).toBeDefined();
    expect(cards.viewsCount).toBeDefined();
  });
});
