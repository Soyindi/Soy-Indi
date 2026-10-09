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
});

