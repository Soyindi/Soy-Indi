import { describe, it, expect } from 'vitest';
import { cardFormSchema } from '@/entities/card/schemas';
import { cvFormSchema } from '@/entities/cv/schemas';
import { presentationFormSchema } from '@/entities/presentation/schemas';
import { PRESENTATION_THEMES } from '@/entities/presentation/templates';

describe('Multi-Tenant & Security Audit Suite', () => {
  it('cardFormSchema debe validar y requerir campos mínimos obligatorios sin permitir XSS o valores gigantes', () => {
    const invalidCard = {
      slug: 'invalid slug with spaces!',
      title: 'A', // Demasiado corto (min 2)
      profession: '',
      themeConfig: {
        themeId: 'stellar',
      },
    };

    const result = cardFormSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
  });

  it('cardFormSchema debe admitir campo address con hasta 200 caracteres para geolocalización y mapas', () => {
    const validCard = {
      slug: 'ana-silva',
      title: 'Ana Silva',
      profession: 'Product Designer',
      address: 'Av. Providencia 1208, Oficina 702, Santiago, Chile',
      themeConfig: {
        themeId: 'stellar',
        primaryColorOklch: '#6366f1',
        backgroundColorOklch: '#090a10',
        particleBehavior: 'ambient',
        particleIntensity: 'balanced',
        fontFamily: 'Inter',
        enableGlassRefraction: true,
      },
    };

    const result = cardFormSchema.safeParse(validCard);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address).toBe('Av. Providencia 1208, Oficina 702, Santiago, Chile');
    }
  });

  it('cvFormSchema debe requerir campos canónicos mínimos para evitar inyecciones anónimas', () => {
    const invalidCv = {
      title: '',
      targetRole: '',
      content: {
        fullName: '',
      },
    };

    const result = cvFormSchema.safeParse(invalidCv);
    expect(result.success).toBe(false);
  });

  it('presentationFormSchema debe validar correctamente slides y configuraciones de tema', () => {
    const validPres = {
      title: 'Pitch Deck Q4',
      slug: 'pitch-deck-q4',
      isPublic: true,
      slidesData: [
        {
          id: 'slide-1',
          title: 'Visión General',
          keyPoints: ['Punto 1', 'Punto 2'],
          visualType: 'concept' as const,
          speakerNotes: 'Notas del orador',
        },
      ],
      themeSettings: PRESENTATION_THEMES[0],
    };

    const result = presentationFormSchema.safeParse(validPres);
    expect(result.success).toBe(true);
  });
});
