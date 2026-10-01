/**
 * ============================================================================
 * INDI ORBITAL PRESENTATIONS: MOTOR HEURÍSTICO DE LAYOUT VISUAL (2026-2027)
 * ============================================================================
 * Basado en la investigación profunda de arquitectura:
 * Desacoplamiento semántico, SCQA de McKinsey y reducción de entropía cognitiva.
 */

export type SemanticIntent =
  | 'executive_scqa'
  | 'bento_dashboard'
  | 'timeline_roadmap'
  | 'testimonial'
  | 'comparison_delta'
  | 'hero_statement';

export type NodeType =
  | 'quantitative_metric'
  | 'qualitative_prose'
  | 'chart_vector'
  | 'media_asset';

export interface ContentNode {
  nodeType: NodeType;
  visualWeightDominance: number; // 1 to 5 (densidad gravitatoria para CSS Subgrid)
  label?: string;
  value?: string;
  change?: string;
  text?: string;
}

export interface AbstractSlide {
  intent: SemanticIntent;
  actionTitle?: string;
  supportNodes: ContentNode[];
}

export enum LayoutHeuristic {
  HERO_STATEMENT = 'layout-hero-statement',
  KPI_BENTO_GRID = 'layout-kpi-bento',
  SPLIT_COMPARISON = 'layout-split-comparison',
  SEQUENTIAL_TIMELINE = 'layout-sequential-timeline',
  MASONRY_DYNAMIC = 'layout-masonry-dynamic',
}

/**
 * Motor heurístico de evaluación topológica de diapositivas que mapea entropía semántica
 * hacia contenedores funcionales basados en la metodología SCQA/MECE.
 */
export function inferOptimalLayoutStrategy(slide: AbstractSlide): LayoutHeuristic {
  const totalNodes = slide.supportNodes.length;
  const quantitativeMetrics = slide.supportNodes.filter(
    (n) => n.nodeType === 'quantitative_metric'
  ).length;
  const vectorsAndCharts = slide.supportNodes.filter(
    (n) => n.nodeType === 'chart_vector'
  ).length;

  // Regla 1: Síntesis Ejecutiva C-Level (Principio deductivo de Minto / McKinsey)
  // Impacto deductivo inicial o final que requiere absorción instantánea sin distractores.
  if (totalNodes <= 2 && (slide.intent === 'executive_scqa' || slide.intent === 'hero_statement')) {
    return LayoutHeuristic.HERO_STATEMENT;
  }

  // Regla 2: Extracción Cuantitativa Masiva
  // Superado un umbral de deltas numéricos, las listas causan ceguera. Se impone el diseño de cuadros KPI Bento.
  if (quantitativeMetrics >= 3 && totalNodes < 7) {
    return LayoutHeuristic.KPI_BENTO_GRID;
  }

  // Regla 3: Tensión o Dualidad Semántica (A/B)
  // Contrastes absolutos, balances o escenarios antes vs después.
  if (totalNodes === 2 && (vectorsAndCharts > 0 || slide.intent === 'comparison_delta')) {
    return LayoutHeuristic.SPLIT_COMPARISON;
  }

  // Regla 4: Continuidad Histórica / Roadmap
  if (slide.intent === 'timeline_roadmap' && totalNodes >= 3) {
    return LayoutHeuristic.SEQUENTIAL_TIMELINE;
  }

  // Regla 5: Arquitectura Asimétrica Diversa
  // Entropía elevada con topología mixta (gráficos + métricas + texto) forzan un reflow dinámico.
  const hasMixedTopology = new Set(slide.supportNodes.map((n) => n.nodeType)).size > 2;
  if (totalNodes > 3 && hasMixedTopology) {
    return LayoutHeuristic.MASONRY_DYNAMIC;
  }

  // Protocolo a prueba de fallos priorizando reflow automático responsivo.
  return LayoutHeuristic.KPI_BENTO_GRID;
}
