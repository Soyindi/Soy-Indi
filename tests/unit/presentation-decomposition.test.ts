import { describe, it, expect } from 'vitest';
import {
  presentationDecompositionRequestSchema,
  PresentationSlide,
} from '@/entities/presentation/schemas';
import {
  calculateSlidePacingAndCount,
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

  describe('Motor de Extracción y Análisis Semántico de Documentos (IDP)', () => {
    it('extrae métricas numéricas, título y secciones desde texto plano o markdown', async () => {
      const { analyzeDocumentContent } = await import('@/features/orbital-presentations/lib/document-parser');

      const sampleDoc = `
# Propuesta Estratégica INDI 2026

Nuestra plataforma permite digitalizar identidades corporativas con un crecimiento del 340% en retención.
El costo de infraestructura se redujo a $12k mensuales manteniendo un SLA del 99.98%.

## Diagnóstico y Situación de Mercado
Las soluciones analógicas presentan una tasa de abandono del 88%.
Al integrar códigos QR dinámicos y analítica en tiempo real, transformamos la interacción con el cliente.
El retorno sobre la inversión se amortiza en menos de 14 dias para equipos B2B.

## Conclusiones y Próximos Hitos
Iniciaremos la fase de despliegue en Punta Arenas con 50 clientes piloto.
Consolidaremos la integración con Turso LibSQL y modelos de visión de NVIDIA NIM.
`;

      const analysis = analyzeDocumentContent(sampleDoc, 'propuesta-indi-2026.md');

      expect(analysis.charCount).toBeGreaterThan(100);
      expect(analysis.wordCount).toBeGreaterThan(30);
      expect(analysis.titleSuggestion).toBe('Propuesta Estratégica INDI 2026');
      expect(analysis.detectedMetrics.length).toBeGreaterThanOrEqual(1);

      // Verificar que detectó métricas reales como 340% o 99.98%
      const values = analysis.detectedMetrics.map((m) => m.value);
      expect(values.some((v) => v.includes('%') || v.includes('$'))).toBe(true);

      // Verificar que las secciones semánticas no están vacías
      expect(analysis.semanticSections.length).toBeGreaterThan(0);
      expect(analysis.semanticSections[0].actionSummary.length).toBeGreaterThan(10);
      // Las secciones no deben contener oraciones partidas por slice rígido
      analysis.semanticSections.forEach((sec) => {
        sec.points.forEach((pt) => {
          expect(pt.length).toBeGreaterThan(5);
        });
      });
    });

    it('extrae secuencias y contrastes preservando oraciones completas', async () => {
      const { analyzeDocumentContent } = await import('@/features/orbital-presentations/lib/document-parser');
      const doc = `
# Plan de Acción
El problema anterior era complejo, lento y costoso para la operación.
Nuestra solución implementa una mejora integral con un sistema automatizado y escalable.
Fase 1: Configurar la infraestructura en la nube y preparar los microservicios.
Fase 2: Ejecutar la migración de base de datos relacional hacia Turso LibSQL.
`;
      const res = analyzeDocumentContent(doc);
      expect(res.contrastBlocks.length).toBeGreaterThan(0);
      expect(res.contrastBlocks[0].problemAspect).toContain('complejo, lento y costoso');
      expect(res.contrastBlocks[0].solutionAspect).toContain('mejora integral con un sistema');
      expect(res.sequenceSteps.length).toBe(2);
      expect(res.sequenceSteps[0].detail).toBe('Configurar la infraestructura en la nube y preparar los microservicios');
    });

    it('decodifica texto plano desde base64 con extractTextFromDocument', async () => {
      const { extractTextFromDocument } = await import('@/features/orbital-presentations/lib/document-parser');

      const text = 'Plan de Expansión Corporativa y Estrategia Tecnológica INDI';
      const base64 = Buffer.from(text, 'utf-8').toString('base64');

      const extracted = await extractTextFromDocument(base64, 'estrategia.txt', 'text/plain');
      expect(extracted).toBe(text);
    });
  });
});

