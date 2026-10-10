import { describe, it, expect, vi } from 'vitest';
import { refineSlideWithAiSchema } from '@/entities/presentation/schemas';
import { refineSlideWithAiAction } from '@/features/orbital-presentations/actions';

// Mock de llamada a NVIDIA NIM
vi.mock('@/shared/api/nvidia-nim', () => ({
  callNvidiaNimChat: vi.fn().mockImplementation(async (messages: any[]) => {
    const userPrompt = messages.find((m: any) => m.role === 'user')?.content || '';
    if (userPrompt.includes('Escalabilidad Global')) {
      return {
        success: true,
        content: JSON.stringify({
          actionTitle: 'La arquitectura distribuida reduce la latencia en un 70%, asegurando alta disponibilidad',
          keyPoints: [
            'Despliegue perimetral multi-región para tiempos de respuesta menores a 20ms.',
            'Aislamiento multi-tenant estricto con cifrado y cero persistencia binaria.',
            'Escalabilidad elástica tolerante a particiones de red.'
          ],
          speakerNotes: 'Comenzar enfatizando la reducción del 70% en latencia. Dirigir la mirada hacia el impacto en retención de usuarios corporativos.',
          suggestedVisualType: 'architecture',
          rationale: 'Se sintetizó un Action Title con tesis concluyente y notas conversacionales orientadas a inversores.'
        })
      };
    }
    return {
      success: false,
      error: 'Mock fallback trigger'
    };
  })
}));

describe('Orbital Presentations - Slide AI Copilot & Schema Audit', () => {
  const sampleSlide = {
    id: 'slide-101',
    title: 'Escalabilidad Global',
    subtitle: 'Infraestructura de alta concurrencia',
    visualType: 'concept' as const,
    keyPoints: ['Microservicios en Edge', 'Caché RFC 9111'],
  };

  it('valida contratos estrictos con refineSlideWithAiSchema', () => {
    const valid = refineSlideWithAiSchema.safeParse({
      slide: sampleSlide,
      action: 'action_title',
      presentationContext: {
        presentationTitle: 'INDI Tech Pitch 2026',
        targetAudience: 'investors',
        tone: 'orbital_cyber',
        slideIndex: 2,
        totalSlides: 10,
      },
    });

    expect(valid.success).toBe(true);
  });

  it('rechaza acciones no reconocidas por contrato Zod', () => {
    const invalid = refineSlideWithAiSchema.safeParse({
      slide: sampleSlide,
      action: 'unsupported_action' as any,
    });

    expect(invalid.success).toBe(false);
  });

  it('genera Action Titles McKinsey asertivos con el modelo 70B cuando hay conectividad', async () => {
    const res = await refineSlideWithAiAction({
      slide: sampleSlide,
      action: 'action_title',
      presentationContext: {
        presentationTitle: 'INDI Pitch 2026',
        targetAudience: 'investors',
        tone: 'orbital_cyber',
        slideIndex: 2,
        totalSlides: 8,
      },
    });

    expect(res.success).toBe(true);
    expect(res.data?.actionTitle).toBeDefined();
    // Debe ser un titular asertivo y no una etiqueta obvia
    expect(res.data?.actionTitle).toContain('70%');
    expect(res.data?.actionTitle).not.toMatch(/^introducción|^resumen|^análisis/i);
  });

  it('aplica fallback heurístico determinista y contextualmente coherente sin inventar prefijos', async () => {
    const res = await refineSlideWithAiAction({
      slide: {
        id: 'slide-202',
        title: 'Modelo de Negocio B2B',
        visualType: 'metrics' as const,
        keyPoints: ['Métrica inicial'],
        metricsData: [{ label: 'ARR', value: '$1.2M' }],
      },
      action: 'all_enhancements',

      presentationContext: {
        presentationTitle: 'Estrategia de Crecimiento',
        targetAudience: 'b2b_clients',
        tone: 'orbital_cyber',
      },
    });

    expect(res.success).toBe(true);
    expect(res.data?.actionTitle).toBeDefined();
    expect(res.data?.actionTitle).not.toMatch(/^introducción|^resumen/i);
    expect(res.data?.speakerNotes).toBeDefined();
    expect(res.data?.keyPoints?.length).toBeGreaterThan(0);
  });

  it('procesa generate_from_intent sintetizando una diapositiva completa desde una idea ejecutiva', async () => {
    const res = await refineSlideWithAiAction({
      slide: {
        id: 'slide-303',
        title: 'Nueva Diapositiva',
        visualType: 'concept' as const,
        keyPoints: [],
      },
      action: 'generate_from_intent',
      userIntentPrompt: 'Reducción del 40% de costos operativos con automatización en Q3',
      targetVisualType: 'metrics',
      presentationContext: {
        presentationTitle: 'Roadmap Operativo 2026',
        targetAudience: 'investors',
        tone: 'orbital_cyber',
      },
    });

    expect(res.success).toBe(true);
    expect(res.data?.actionTitle).toBeDefined();
    expect(res.data?.keyPoints?.length).toBeGreaterThanOrEqual(2);
    expect(res.data?.speakerNotes).toBeDefined();
    expect(res.data?.metricsData?.length).toBeGreaterThanOrEqual(1);
    expect(res.data?.suggestedVisualType).toBe('metrics');
  });

  it('valida que populate_visual_structure sea una acción Zod válida', () => {
    const valid = refineSlideWithAiSchema.safeParse({
      slide: sampleSlide,
      action: 'populate_visual_structure',
      targetVisualType: 'comparison',
      userIntentPrompt: 'Comparativa de arquitecturas monolito vs distributed edge',
    });

    expect(valid.success).toBe(true);
  });

  it('generateAiSlidesAction estructura una propuesta completa desde un tema o tesis de usuario', async () => {
    const { generateAiSlidesAction } = await import('@/features/orbital-presentations/actions');
    const result = await generateAiSlidesAction('Plataforma SaaS de Identidad Digital 2026', 'pitch-deck', 4);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.length).toBeGreaterThanOrEqual(2);
    expect(result.presentationTitle).toBeDefined();

    // Las diapositivas deben tener titulares estratégicos sin prefijos obvios
    const firstSlide = result.data?.[0];
    expect(firstSlide?.title).toBeDefined();
    expect(firstSlide?.actionTitle).toBeDefined();
    expect(firstSlide?.keyPoints?.length).toBeGreaterThan(0);
  });
});


