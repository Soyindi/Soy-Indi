import { describe, it, expect } from 'vitest';
import { cardFormSchema } from '@/entities/card/schemas';

describe('CardFormSchema Validation', () => {
  const validCardData = {
    slug: 'juan-perez',
    title: 'Juan Pérez',
    profession: 'Senior Frontend Engineer',
    about: 'Desarrollador con más de 8 años construyendo aplicaciones web distribuidas.',
    phone: '+56912345678',
    whatsapp: '+56912345678',
    emailContact: 'juan@empresa.com',
    websiteUrl: 'https://juanperez.dev',
    linkedinUrl: 'https://linkedin.com/in/juanperez',
    instagramUrl: 'https://instagram.com/juanperez',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    themeConfig: {
      themeId: 'stellar',
      primaryColorOklch: '#6366f1',
      backgroundColorOklch: '#0f172a',
      particleBehavior: 'interactive' as const,
      particleIntensity: 'balanced' as const,
      fontFamily: 'sans',
      enableGlassRefraction: true,
    },
  };

  it('debe validar exitosamente una tarjeta con todos los campos correctos', () => {
    const result = cardFormSchema.safeParse(validCardData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('juan-perez');
      expect(result.data.title).toBe('Juan Pérez');
    }
  });

  it('debe fallar si el slug contiene caracteres inválidos (mayúsculas o espacios)', () => {
    const invalidSlugCard = {
      ...validCardData,
      slug: 'Juan Perez Con Espacios',
    };
    const result = cardFormSchema.safeParse(invalidSlugCard);
    expect(result.success).toBe(false);
  });

  it('debe fallar si el título o profesión están vacíos', () => {
    const invalidCard = {
      ...validCardData,
      title: '',
      profession: '',
    };
    const result = cardFormSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('debe rechazar URLs con formato inválido', () => {
    const invalidUrlCard = {
      ...validCardData,
      websiteUrl: 'no-es-una-url-valida',
    };
    const result = cardFormSchema.safeParse(invalidUrlCard);
    expect(result.success).toBe(false);
  });

  it('debe aceptar campos opcionales vacíos o ausentes', () => {
    const minimalCard = {
      slug: 'maria-gonzalez',
      title: 'María González',
      profession: 'Diseñadora UI/UX',
      themeConfig: {
        themeId: 'aurora',
        primaryColorOklch: '#10b981',
        backgroundColorOklch: '#022c22',
        particleBehavior: 'ambient' as const,
        particleIntensity: 'subtle' as const,
        fontFamily: 'sans',
        enableGlassRefraction: true,
      },
    };
    const result = cardFormSchema.safeParse(minimalCard);
    expect(result.success).toBe(true);
  });

  it('debe validar correctamente bloques Bento modulares', () => {
    const cardWithBento = {
      ...validCardData,
      themeConfig: {
        ...validCardData.themeConfig,
        badgeText: 'Disponibilidad Inmediata',
        ctaLabel: 'Agendar Reunión',
      },
      bentoBlocks: [
        {
          id: 'bento-1',
          type: 'metric' as const,
          title: 'Clientes Satisfechos',
          subtitle: 'Latinoamérica y Europa',
          metricValue: '+150',
          metricDelta: '+25% YoY',
        },
        {
          id: 'bento-2',
          type: 'link' as const,
          title: 'Portafolio 2026',
          subtitle: 'Ver casos de éxito',
          url: 'https://miportafolio.dev',
        },
      ],
    };
    const result = cardFormSchema.safeParse(cardWithBento);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bentoBlocks).toHaveLength(2);
      expect(result.data.bentoBlocks?.[0].metricValue).toBe('+150');
      expect(result.data.themeConfig.badgeText).toBe('Disponibilidad Inmediata');
    }
  });
});
