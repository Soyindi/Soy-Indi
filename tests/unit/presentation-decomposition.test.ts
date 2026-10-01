import { describe, it, expect } from 'vitest';
import {
  presentationDecompositionRequestSchema,
  PresentationSlide,
} from '@/entities/presentation/schemas';
import {
  calculateSlidePacingAndCount,
} from '@/features/orbital-presentations/actions';
import {
  inferOptimalLayoutStrategy,
  AbstractSlide,
  LayoutHeuristic,
} from '@/entities/presentation/heuristics';

describe('Motor de Deconstrucción y Pacing Orbital (SCQA + Pacing)', () => {
  describe('calculateSlidePacingAndCount', () => {
    it('calcula correctamente el ritmo para un pitch relámpago de 2 a 3 minutos', () => {
      const pacing3 = calculateSlidePacingAndCount(3);
      expect(pacing3.slidesCount).toBe(3);
      expect(pacing3.pacingSecondsPerSlide).toBe(60);

      const pacing2 = calculateSlidePacingAndCount(2);
      expect(pacing2.slidesCount).toBe(3);
      expect(pacing2.pacingSecondsPerSlide).toBe(40);
    });

    it('calcula correctamente el ritmo para una reunión ejecutiva de 5 minutos', () => {
      const pacing5 = calculateSlidePacingAndCount(5);
      expect(pacing5.slidesCount).toBe(5);
      expect(pacing5.pacingSecondsPerSlide).toBe(60);
    });

    it('calcula correctamente el ritmo para un keynote de 10 minutos', () => {
      const pacing10 = calculateSlidePacingAndCount(10);
      expect(pacing10.slidesCount).toBe(8);
      expect(pacing10.pacingSecondsPerSlide).toBe(75);
    });

    it('calcula correctamente el ritmo para un deep dive de 20 minutos', () => {
      const pacing20 = calculateSlidePacingAndCount(20);
      expect(pacing20.slidesCount).toBe(12);
      expect(pacing20.pacingSecondsPerSlide).toBe(100);
    });
  });

  describe('Validación de Esquema Zod: presentationDecompositionRequestSchema', () => {
    it('valida con éxito un payload completo y válido', () => {
      const validPayload = {
        rawContent: 'Propuesta de arquitectura para microservicios con NVIDIA NIM y LibSQL serverless en la Patagonia.',
        durationMinutes: 10,
        targetAudience: 'investors' as const,
        presentationTone: 'orbital_cyber' as const,
      };

      const parsed = presentationDecompositionRequestSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('aplica valores por defecto si se omiten parámetros opcionales', () => {
      const minimalPayload = {
        rawContent: 'Texto de prueba con más de cinco caracteres requeridos.',
      };

      const parsed = presentationDecompositionRequestSchema.safeParse(minimalPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.durationMinutes).toBe(5);
        expect(parsed.data.targetAudience).toBe('investors');
        expect(parsed.data.presentationTone).toBe('orbital_cyber');
      }
    });

    it('falla si el contenido tiene menos de 5 caracteres', () => {
      const invalidPayload = {
        rawContent: 'Hola',
      };

      const parsed = presentationDecompositionRequestSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Motor Heurístico de Inferencia de Layouts SCQA', () => {
    it('infiere KPI_BENTO_GRID cuando predominan métricas cuantitativas', () => {
      const slide: AbstractSlide = {
        intent: 'bento_dashboard',
        supportNodes: [
          { nodeType: 'quantitative_metric', visualWeightDominance: 5 },
          { nodeType: 'quantitative_metric', visualWeightDominance: 5 },
          { nodeType: 'quantitative_metric', visualWeightDominance: 4 },
        ],
      };

      const layout = inferOptimalLayoutStrategy(slide);
      expect(layout).toBe(LayoutHeuristic.KPI_BENTO_GRID);
    });

    it('infiere HERO_STATEMENT para resúmenes ejecutivos C-Level breves', () => {
      const slide: AbstractSlide = {
        intent: 'executive_scqa',
        supportNodes: [
          { nodeType: 'qualitative_prose', visualWeightDominance: 5, text: 'Visión principal' },
        ],
      };

      const layout = inferOptimalLayoutStrategy(slide);
      expect(layout).toBe(LayoutHeuristic.HERO_STATEMENT);
    });

    it('infiere SPLIT_COMPARISON para intenciones de contraste delta', () => {
      const slide: AbstractSlide = {
        intent: 'comparison_delta',
        supportNodes: [
          { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
          { nodeType: 'chart_vector', visualWeightDominance: 3 },
        ],
      };

      const layout = inferOptimalLayoutStrategy(slide);
      expect(layout).toBe(LayoutHeuristic.SPLIT_COMPARISON);
    });

    it('infiere SEQUENTIAL_TIMELINE para roadmaps de ejecución', () => {
      const slide: AbstractSlide = {
        intent: 'timeline_roadmap',
        supportNodes: [
          { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
          { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
          { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
        ],
      };

      const layout = inferOptimalLayoutStrategy(slide);
      expect(layout).toBe(LayoutHeuristic.SEQUENTIAL_TIMELINE);
    });
  });
});
