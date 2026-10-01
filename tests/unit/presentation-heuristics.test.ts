import { describe, it, expect } from 'vitest';
import {
  inferOptimalLayoutStrategy,
  LayoutHeuristic,
  AbstractSlide,
} from '@/entities/presentation/heuristics';
import { presentationSlideSchema } from '@/entities/presentation/schemas';

describe('Presentation Layout Heuristics Engine (Deep Research)', () => {
  it('Regla 1: debe inferir HERO_STATEMENT para síntesis ejecutiva C-Level con <= 2 nodos', () => {
    const slide: AbstractSlide = {
      intent: 'executive_scqa',
      actionTitle: 'Consolidar el liderazgo en Punta Arenas mediante descentralización perimetral',
      supportNodes: [
        { nodeType: 'qualitative_prose', visualWeightDominance: 5 },
        { nodeType: 'qualitative_prose', visualWeightDominance: 4 },
      ],
    };

    const layout = inferOptimalLayoutStrategy(slide);
    expect(layout).toBe(LayoutHeuristic.HERO_STATEMENT);
  });

  it('Regla 2: debe inferir KPI_BENTO_GRID cuando existen >= 3 métricas cuantitativas', () => {
    const slide: AbstractSlide = {
      intent: 'bento_dashboard',
      actionTitle: 'Acelerar la conversión en +290% con latencia sub-milisegundo en el Edge',
      supportNodes: [
        { nodeType: 'quantitative_metric', visualWeightDominance: 5 },
        { nodeType: 'quantitative_metric', visualWeightDominance: 5 },
        { nodeType: 'quantitative_metric', visualWeightDominance: 4 },
        { nodeType: 'qualitative_prose', visualWeightDominance: 2 },
      ],
    };

    const layout = inferOptimalLayoutStrategy(slide);
    expect(layout).toBe(LayoutHeuristic.KPI_BENTO_GRID);
  });

  it('Regla 3: debe inferir SPLIT_COMPARISON para dualidad semántica A/B o comparativa', () => {
    const slide: AbstractSlide = {
      intent: 'comparison_delta',
      actionTitle: 'Reemplazar el costo recurrente por usuario activo por una tarifa plana accesible',
      supportNodes: [
        { nodeType: 'qualitative_prose', visualWeightDominance: 4 },
        { nodeType: 'chart_vector', visualWeightDominance: 4 },
      ],
    };

    const layout = inferOptimalLayoutStrategy(slide);
    expect(layout).toBe(LayoutHeuristic.SPLIT_COMPARISON);
  });

  it('Regla 4: debe inferir SEQUENTIAL_TIMELINE para hojas de ruta con >= 3 hitos', () => {
    const slide: AbstractSlide = {
      intent: 'timeline_roadmap',
      actionTitle: 'Desplegar la infraestructura perimetral en 3 fases secuenciales',
      supportNodes: [
        { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
        { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
        { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
      ],
    };

    const layout = inferOptimalLayoutStrategy(slide);
    expect(layout).toBe(LayoutHeuristic.SEQUENTIAL_TIMELINE);
  });

  it('Regla 5: debe inferir MASONRY_DYNAMIC cuando la entropía es elevada con topología mixta', () => {
    const slide: AbstractSlide = {
      intent: 'bento_dashboard',
      supportNodes: [
        { nodeType: 'quantitative_metric', visualWeightDominance: 4 },
        { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
        { nodeType: 'chart_vector', visualWeightDominance: 5 },
        { nodeType: 'media_asset', visualWeightDominance: 2 },
      ],
    };

    const layout = inferOptimalLayoutStrategy(slide);
    expect(layout).toBe(LayoutHeuristic.MASONRY_DYNAMIC);
  });

  it('debe validar diapositivas con Action Title del Principio de Pirámide y semanticIntent', () => {
    const validSlide = {
      id: 'scqa-1',
      title: 'Resumen Estratégico',
      actionTitle: 'Capturar el 40% del mercado regional antes del cierre de Q4',
      subtitle: 'Respuesta ejecutiva según marco SCQA',
      semanticIntent: 'executive_scqa' as const,
      visualType: 'concept' as const,
      layout: 'layout-hero-statement' as const,
      keyPoints: ['Punto focal de valor.'],
    };

    const result = presentationSlideSchema.safeParse(validSlide);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.actionTitle).toContain('Capturar el 40%');
      expect(result.data.semanticIntent).toBe('executive_scqa');
    }
  });
});
