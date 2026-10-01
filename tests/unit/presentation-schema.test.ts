import { describe, it, expect } from 'vitest';
import {
  presentationSlideSchema,
  presentationFormSchema,
  presentationThemeSchema,
} from '@/entities/presentation/schemas';
import { PRESENTATION_TEMPLATES, PRESENTATION_THEMES } from '@/entities/presentation/templates';

describe('Presentation Schema & Templates Validation', () => {
  const validSlideData = {
    id: 'slide-1',
    title: 'Visión General de la Plataforma',
    subtitle: 'Arquitectura descentralizada y baja latencia',
    visualType: 'concept' as const,
    layout: 'standard' as const,
    badgeText: 'VISIÓN 2026',
    keyPoints: ['Latencia inferior a 15ms.', 'Cero dependencias de servidores monolíticos.'],
    speakerNotes: 'Comenzar con la propuesta de valor.',
  };

  const validPresentationData = {
    title: 'Presentación Ejecutiva 2026',
    slug: 'presentacion-ejecutiva-2026',
    isPublic: true,
    themeSettings: PRESENTATION_THEMES[0],
    slidesData: [validSlideData],
  };

  it('debe validar exitosamente una presentación con datos correctos', () => {
    const result = presentationFormSchema.safeParse(validPresentationData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Presentación Ejecutiva 2026');
      expect(result.data.slug).toBe('presentacion-ejecutiva-2026');
      expect(result.data.slidesData.length).toBe(1);
    }
  });

  it('debe rechazar slugs con mayúsculas, espacios o caracteres especiales no permitidos', () => {
    const invalidSlugData = {
      ...validPresentationData,
      slug: 'Presentacion Con Mayusculas!',
    };
    const result = presentationFormSchema.safeParse(invalidSlugData);
    expect(result.success).toBe(false);
  });

  it('debe fallar si el título de la presentación es menor a 3 caracteres', () => {
    const invalidTitleData = {
      ...validPresentationData,
      title: 'AB',
    };
    const result = presentationFormSchema.safeParse(invalidTitleData);
    expect(result.success).toBe(false);
  });

  it('debe requerir al menos 1 diapositiva en la presentación', () => {
    const emptySlidesData = {
      ...validPresentationData,
      slidesData: [],
    };
    const result = presentationFormSchema.safeParse(emptySlidesData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('al menos 1 diapositiva');
    }
  });

  it('debe validar diapositivas con métricas y KPIs estructurados', () => {
    const metricSlide = {
      id: 'slide-metrics',
      title: 'Métricas de Crecimiento',
      visualType: 'metrics' as const,
      layout: 'kpi-cards' as const,
      keyPoints: ['Crecimiento acelerado en Q3.'],
      metricsData: [
        { label: 'Conversión', value: '42.8%', change: '+340%', trend: 'up' as const },
        { label: 'Latencia', value: '<20ms', change: '-85%', trend: 'up' as const },
      ],
    };

    const result = presentationSlideSchema.safeParse(metricSlide);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metricsData?.length).toBe(2);
      expect(result.data.visualType).toBe('metrics');
    }
  });

  it('debe validar diapositivas con comparativas antes/después', () => {
    const comparisonSlide = {
      id: 'slide-comp',
      title: 'Comparativa de Mercado',
      visualType: 'comparison' as const,
      layout: 'split-2col' as const,
      comparisonData: {
        beforeTitle: 'Enfoque Tradicional',
        beforeItems: ['Tarifas altas por usuario', 'Caídas de conexión'],
        afterTitle: 'INDI 2026',
        afterItems: ['Costo fijo accesible', 'Alta disponibilidad perimetral'],
      },
    };

    const result = presentationSlideSchema.safeParse(comparisonSlide);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comparisonData?.beforeItems.length).toBe(2);
      expect(result.data.comparisonData?.afterItems.length).toBe(2);
    }
  });

  it('debe validar diapositivas con roadmap y líneas de tiempo', () => {
    const timelineSlide = {
      id: 'slide-time',
      title: 'Roadmap de Lanzamiento',
      visualType: 'timeline' as const,
      layout: 'timeline-steps' as const,
      timelineData: [
        { step: 'Fase 1', title: 'MVP', description: 'Lanzamiento inicial en producción' },
        { step: 'Fase 2', title: 'Escala', description: 'Expansión a nivel nacional' },
      ],
    };

    const result = presentationSlideSchema.safeParse(timelineSlide);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timelineData?.length).toBe(2);
    }
  });

  it('debe validar todas las plantillas predefinidas del catálogo sin errores', () => {
    expect(PRESENTATION_TEMPLATES.length).toBeGreaterThanOrEqual(4);

    for (const template of PRESENTATION_TEMPLATES) {
      const result = presentationFormSchema.safeParse(template.data);
      expect(
        result.success,
        `La plantilla ${template.name} (${template.id}) falló la validación: ${
          !result.success ? JSON.stringify(result.error.issues) : ''
        }`
      ).toBe(true);
    }
  });

  it('debe validar los temas visuales disponibles en la paleta', () => {
    expect(PRESENTATION_THEMES.length).toBeGreaterThanOrEqual(3);

    for (const theme of PRESENTATION_THEMES) {
      const result = presentationThemeSchema.safeParse(theme);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(result.data.backgroundGradient).toContain('radial-gradient');
      }
    }
  });
});
