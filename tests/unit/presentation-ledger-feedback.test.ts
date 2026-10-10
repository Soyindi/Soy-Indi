import { describe, it, expect } from 'vitest';
import {
  parseMetricNumericValue,
  validateDocumentMetricsLedger,
  validateTimelineChronology,
} from '@/features/orbital-presentations/lib/ledger-validator';
import {
  evaluatePreRouteStrategy,
  ScopedPresentationContext,
} from '@/features/orbital-presentations/lib/document-parser';

describe('Ledger Feedback & Pre-Route Engine (tests/unit)', () => {
  describe('Ledger Validator: Reconciliación Simbólica', () => {
    it('parsea correctamente componentes numéricos, signos y unidades de métricas', () => {
      expect(parseMetricNumericValue('+34.5%')).toEqual({
        numeric: 34.5,
        unit: '%',
        isPercentage: true,
      });

      expect(parseMetricNumericValue('$1,250 M')).toEqual({
        numeric: 1250,
        unit: '$M',
        isPercentage: false,
      });

      expect(parseMetricNumericValue('-12.4%')).toEqual({
        numeric: -12.4,
        unit: '%',
        isPercentage: true,
      });

      expect(parseMetricNumericValue('')).toEqual({
        numeric: null,
        unit: '',
        isPercentage: false,
      });
    });

    it('detecta discrepancias cuando el signo del delta contradice la tendencia cualitativa', () => {
      const metrics = [
        { label: 'Crecimiento de Ingresos', value: '+25%', trend: 'down' as const },
      ];
      const diagnosis = validateDocumentMetricsLedger(metrics);
      expect(diagnosis.isValid).toBe(false);
      expect(diagnosis.inconsistenciesFound.length).toBeGreaterThan(0);
      expect(diagnosis.inconsistenciesFound[0]).toContain("indica valor positivo '+25%' pero tendencia descendente");
      expect(diagnosis.feedbackPromptChunk).toBeDefined();
    });

    it('aprueba métricas coherentes sin emitir advertencias espurias', () => {
      const metrics = [
        { label: 'Crecimiento de Ventas', value: '+45%', trend: 'up' as const },
        { label: 'Reducción de Latencia', value: '-30ms', trend: 'down' as const },
      ];
      const diagnosis = validateDocumentMetricsLedger(metrics);
      expect(diagnosis.isValid).toBe(true);
      expect(diagnosis.inconsistenciesFound.length).toBe(0);
      expect(diagnosis.feedbackPromptChunk).toBeUndefined();
    });

    it('detecta si las cuotas relativas de participación exceden el 100%', () => {
      const metrics = [
        { label: 'Cuota de Mercado A', value: '60%', trend: 'up' as const },
        { label: 'Cuota de Mercado B', value: '55%', trend: 'up' as const },
      ];
      const diagnosis = validateDocumentMetricsLedger(metrics);
      expect(diagnosis.isValid).toBe(false);
      expect(diagnosis.inconsistenciesFound[0]).toContain('excediendo el 100%');
    });

    it('valida la coherencia de cronogramas y detecta pasos duplicados', () => {
      const steps = [
        { step: 'Fase 01', title: 'Descubrimiento' },
        { step: 'Fase 02', title: 'Implementación' },
        { step: 'Fase 01', title: 'Cierre' },
      ];
      const result = validateTimelineChronology(steps);
      expect(result.isChronologicallyCoherent).toBe(false);
      expect(result.warnings[0]).toContain('Hito duplicado detectado');
    });
  });

  describe('Pre-Route Strategy: Enrutamiento Activo y Scoped Containers', () => {
    it('enruta documentos densos o con tablas hacia extracción profunda con libro mayor', () => {
      const tabularText = `
        | Activos | Pasivos | Patrimonio |
        | $10,000 | $4,000  | $6,000     |
        Balance de situación financiera anual consolidado.
        Total de ingresos: $50,000.
      `;
      const assessment = evaluatePreRouteStrategy(tabularText, 'balance.pdf');
      expect(assessment.hasTabularDensity).toBe(true);
      expect(assessment.recommendedPipeline).toBe('deep_ledger_extraction');
    });

    it('enruta documentos concisos hacia la vía rápida determinista', () => {
      const shortText = 'Plan de marketing para el tercer trimestre. Enfoque en captación de leads en redes sociales.';
      const assessment = evaluatePreRouteStrategy(shortText);
      expect(assessment.recommendedPipeline).toBe('direct_heuristic_fast_path');
      expect(assessment.semanticDispersionScore).toBeLessThan(0.4);
    });

    it('ScopedPresentationContext aísla las fuentes y formatea directivas fijadas', () => {
      const scoped = new ScopedPresentationContext('test_pres_123');
      expect(scoped.getContextId()).toBe('test_pres_123');

      scoped.addSource('source_1', 'Primer documento de análisis.');
      scoped.addPinnedNote('Priorizar métricas de rentabilidad operativa.');

      expect(scoped.getAggregatedCleanText()).toContain('Primer documento de análisis.');
      expect(scoped.getPinnedContextDirective()).toContain('Priorizar métricas de rentabilidad');
    });
  });
});
