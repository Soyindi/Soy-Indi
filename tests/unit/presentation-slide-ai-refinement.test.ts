import { describe, it, expect, vi } from 'vitest';
import { refineSlideWithAiSchema, timelineItemSchema } from '@/entities/presentation/schemas';
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

  it('normaliza defensivamente timelineData con alias (label, phase) y sintetiza títulos si vienen vacíos', () => {
    // Caso 1: Viene con "label" en vez de "step" y sin "title", solo "description"
    const parsed1 = timelineItemSchema.parse({
      label: 'Meses 1-6',
      description: 'Establecer objetivos y desarrollar un plan integral de intervención.',
    });
    expect(parsed1.step).toBe('Meses 1-6');
    expect(parsed1.title).toBe('Establecer objetivos y desarrollar');
    expect(parsed1.description).toBe('Establecer objetivos y desarrollar un plan integral de intervención.');

    // Caso 2: Viene con "phase"
    const parsed2 = timelineItemSchema.parse({
      phase: 'Fase 02',
      title: 'Despliegue Operativo',
      description: 'Implementación gradual en terreno.',
    });
    expect(parsed2.step).toBe('Fase 02');
    expect(parsed2.title).toBe('Despliegue Operativo');
    expect(parsed2.description).toBe('Implementación gradual en terreno.');

    // Caso 3: String plano
    const parsed3 = timelineItemSchema.parse('Lanzamiento a producción');
    expect(parsed3.step).toBe('Paso');
    expect(parsed3.title).toBe('Lanzamiento a producción');
  });

  it('generateAiSlidesAction genera diapositivas con timelineData completamente poblado en slide 4', async () => {
    const { generateAiSlidesAction } = await import('@/features/orbital-presentations/actions');
    const result = await generateAiSlidesAction('alcohol y drogas', 'general', 4);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.length).toBe(4);

    const fourthSlide = result.data?.[3];
    expect(fourthSlide).toBeDefined();
    expect(fourthSlide?.visualType).toBe('timeline');
    expect(fourthSlide?.timelineData).toBeDefined();
    expect(fourthSlide?.timelineData?.length).toBeGreaterThan(0);

    fourthSlide?.timelineData?.forEach((item: any, i: number) => {
      expect(item.step).toBeTruthy();
      expect(item.step.trim().length).toBeGreaterThan(0);
      expect(item.title).toBeTruthy();
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.description).toBeTruthy();
    });
  });
});


