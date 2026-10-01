import { describe, it, expect } from 'vitest';
import {
  analyzeDocumentContent,
  detectDocumentArchetype,
} from '@/features/orbital-presentations/lib/document-parser';
import { decomposeAndGeneratePresentationAction } from '@/features/orbital-presentations/actions';

describe('Pipeline Semántico Adaptativo (SAP Engine) - Clasificación y Fidelidad', () => {
  describe('Clasificación Automática de Arquetipos (detectDocumentArchetype)', () => {
    it('clasifica un documento técnico con arquitectura de microservicios y bases de datos', () => {
      const techText = `
        Especificación de Microservicios y Flujo de Datos
        Nuestra arquitectura backend utiliza Next.js App Router, Turso LibSQL serverless
        y esquemas de Drizzle ORM con endpoints Edge API de baja latencia (<20ms).
        Implementamos un sistema de caché con Upstash Redis y autenticación con Better-Auth.
      `;
      const res = detectDocumentArchetype(techText, 'architecture-spec.md');
      expect(res.archetype).toBe('technical_architecture');
      expect(res.confidence).toBeGreaterThan(0.5);
    });

    it('clasifica una tesis de negocio / pitch deck para inversionistas', () => {
      const pitchText = `
        Pitch Deck Semilla: Oportunidad de Mercado TAM y Modelo SaaS
        El mercado total direccionable (TAM) en América Latina es de $4.8B.
        Nuestra tasa de conversión B2B creció un 240% y el CAC se redujo a $18 por cliente.
        Buscamos una ronda seed de $1.5M para acelerar ventas y expansión internacional.
      `;
      const res = detectDocumentArchetype(pitchText, 'seed-pitch-deck.pdf');
      expect(res.archetype).toBe('business_pitch');
      expect(res.confidence).toBeGreaterThan(0.5);
    });

    it('clasifica un informe de auditoría y diagnóstico de riesgos', () => {
      const auditText = `
        Informe de Auditoría y Evaluación de Vulnerabilidades 2026
        Se identificaron 4 hallazgos de severidad media y 1 deficiencia de riesgo crítico.
        Recomendamos aplicar parches de seguridad y mitigar la exposición de tokens.
        El score general de cumplimiento se evaluó en 78/100.
      `;
      const res = detectDocumentArchetype(auditText, 'security-audit-report.pdf');
      expect(res.archetype).toBe('audit_report');
    });
  });

  describe('Detección de Contraste, Secuencias y Conceptos Reales (analyzeDocumentContent)', () => {
    it('extrae bloques de contraste (problema vs solución) presentes en el texto', () => {
      const text = `
        El problema actual radica en que los procesos manuales son lentos y costosos.
        La solución automatizada propuesta reduce los tiempos de entrega un 85% de manera eficiente.
      `;
      const analysis = analyzeDocumentContent(text);
      expect(analysis.hasContrast).toBe(true);
      expect(analysis.contrastBlocks.length).toBeGreaterThan(0);
      expect(analysis.contrastBlocks[0].problemAspect).toContain('lentos y costosos');
      expect(analysis.contrastBlocks[0].solutionAspect).toContain('solución automatizada');
    });

    it('extrae definiciones conceptuales clave', () => {
      const text = `
        Gobernanza de Datos: Protocolo de validación y control de acceso multi-tenant.
        Edge Computing: Despliegue de lógica serverless perimetral cerca del usuario final.
      `;
      const analysis = analyzeDocumentContent(text);
      expect(analysis.hasConcepts).toBe(true);
      expect(analysis.conceptDefinitions.length).toBeGreaterThanOrEqual(1);
      const terms = analysis.conceptDefinitions.map((c) => c.term);
      expect(terms.some((t) => t.includes('Gobernanza') || t.includes('Edge'))).toBe(true);
    });

    it('extrae fases y cronogramas reales si existen en el documento', () => {
      const text = `
        Cronograma del Proyecto:
        Fase 1: Configuración de Infraestructura y Setup inicial.
        Fase 2: Despliegue de Piloto y validación en terreno.
        Fase 3: Expansión de Clientes y escala global.
      `;
      const analysis = analyzeDocumentContent(text);
      expect(analysis.hasSequence).toBe(true);
      expect(analysis.sequenceSteps.length).toBe(3);
      expect(analysis.sequenceSteps[0].title).toContain('Fase 1');
    });
  });

  describe('Generación Adaptativa End-to-End (decomposeAndGeneratePresentationAction)', () => {
    it('genera diapositivas contextualizadas sin alucinaciones numéricas cuando el texto no tiene métricas', async () => {
      const narrativeText = `
        Manifiesto sobre la Transformación del Trabajo Remoto.
        El aislamiento digital ha modificado la forma en que los equipos de ingeniería colaboran.
        La asincronía permite mayor concentración y disminuye la fricción entre zonas horarias.
        La cultura corporativa debe basarse en la confianza y en entregables tangibles.
        Nuestra conclusión es que la documentación viva supera a las reuniones innecesarias.
      `;

      const result = await decomposeAndGeneratePresentationAction({
        rawContent: narrativeText,
        durationMinutes: 5,
        targetAudience: 'engineering',
        presentationTone: 'deep_space',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.slidesData.length).toBe(5);
        // Debe haber diapositiva de visión
        expect(result.data.slidesData[0].title).toBe('Resumen Ejecutivo & Visión');
        
        // Ningún slide debe tener datos numéricos inventados si el texto no los tiene
        const metricSlides = result.data.slidesData.filter((s) => s.visualType === 'metrics');
        expect(metricSlides.length).toBe(0);

        // Los keyPoints deben contener palabras del texto
        const allKeyPoints = result.data.slidesData.flatMap((s) => s.keyPoints).join(' ');
        expect(
          allKeyPoints.includes('remoto') ||
          allKeyPoints.includes('ingeniería') ||
          allKeyPoints.includes('asincronía') ||
          allKeyPoints.includes('documentación')
        ).toBe(true);
      }
    });

    it('incluye diapositiva de métricas Bento cuando el texto sí aporta datos cuantitativos', async () => {
      const dataText = `
        Reporte Financiero Q3 2026:
        Los ingresos recurrentes alcanzaron $420k con un incremento interanual del 185%.
        La retención neta se situó en 99.4% y el churn mensual cayó a 0.8%.
        Proyectamos cerrar el año con 12000 usuarios activos en la plataforma.
      `;

      const result = await decomposeAndGeneratePresentationAction({
        rawContent: dataText,
        durationMinutes: 3,
        targetAudience: 'investors',
        presentationTone: 'solar_obsidian',
      });

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.slidesData.length).toBe(3);
        const metricSlide = result.data.slidesData.find((s) => s.visualType === 'metrics');
        expect(metricSlide).toBeDefined();
        expect(metricSlide?.metricsData?.length).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
