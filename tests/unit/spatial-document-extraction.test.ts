import { describe, it, expect } from 'vitest';
import { jsPDF } from 'jspdf';
import { extractSpatialTextFromPdf } from '@/shared/lib/spatialDocumentExtractor';
import { parseCvTextToStructuredData } from '@/features/ai-smart-cv/lib/cv-text-parser';
import { analyzeDocumentContent } from '@/features/orbital-presentations/lib/document-parser';

describe('Spatial Document Extraction & Semantic Intelligence Pipeline (INDI 2026)', () => {
  describe('extractSpatialTextFromPdf (Two-Column Layout Separation)', () => {
    it('debe separar limpiamente dos columnas sin mezclar oraciones de izquierda con derecha', async () => {
      const doc = new jsPDF();
      // Simular un PDF de dos columnas:
      // Columna Izquierda (x: 20): Habilidades y contacto
      doc.text('HABILIDADES TÉCNICAS', 20, 30);
      doc.text('React & Next.js', 20, 40);
      doc.text('TypeScript Estricto', 20, 50);

      // Columna Derecha (x: 120): Experiencia laboral
      doc.text('EXPERIENCIA LABORAL', 120, 30);
      doc.text('Lead Architect en Tech Corp', 120, 40);
      doc.text('Lideré equipo de 12 ingenieros', 120, 50);

      const arrayBuffer = doc.output('arraybuffer');
      const uint8 = new Uint8Array(arrayBuffer);

      const extracted = await extractSpatialTextFromPdf(uint8);

      expect(extracted).toBeTruthy();
      // Ambas columnas deben existir en el texto resultante
      expect(extracted).toContain('HABILIDADES TÉCNICAS');
      expect(extracted).toContain('EXPERIENCIA LABORAL');
      expect(extracted).toContain('TypeScript Estricto');
      expect(extracted).toContain('Lead Architect en Tech Corp');

      // Validar que no se mezclaron horizontalmente en la misma línea
      const lines = extracted.split('\n').map((l) => l.trim()).filter(Boolean);
      const mixedLine = lines.find((l) => l.includes('React') && l.includes('Lead Architect'));
      expect(mixedLine).toBeUndefined();
    });

    it('debe manejar PDFs estándar de una columna con orden secuencial natural', async () => {
      const doc = new jsPDF();
      doc.text('TÍTULO DEL DOCUMENTO', 20, 30);
      doc.text('Párrafo 1 con contenido descriptivo.', 20, 45);
      doc.text('Párrafo 2 con conclusiones clave.', 20, 60);

      const arrayBuffer = doc.output('arraybuffer');
      const uint8 = new Uint8Array(arrayBuffer);

      const extracted = await extractSpatialTextFromPdf(uint8);

      expect(extracted).toContain('TÍTULO DEL DOCUMENTO');
      expect(extracted).toContain('Párrafo 1');
      expect(extracted).toContain('Párrafo 2');
    });
  });

  describe('Smart CV Parser (Non-Truncated Achievement Preservation)', () => {
    it('no debe cortar logros ni crear cargos fantasma cuando una viñeta menciona años históricos', () => {
      const cvText = `
Gonzalo Medina
Arquitecto Cloud
gonzalo@tech.cl

EXPERIENCIA LABORAL
Cloud Consulting SpA
Arquitecto de Soluciones
2022 - Presente
• En 2023 lideré la migración completa a microservicios reduciendo costos en 40%.
• Durante 2024 implementé arquitectura serverless en AWS con latencia sub-50ms.
• Diseñé plataforma distribuida para 100.000 usuarios concurrentes.

EDUCACIÓN
Ingeniería Civil Informática
Universidad de Chile
2021
`;
      const result = parseCvTextToStructuredData(cvText, 'gonzalo_cv.pdf');

      expect(result.experience.length).toBe(1);
      expect(result.experience[0].company).toBe('Cloud Consulting SpA');
      expect(result.experience[0].role).toBe('Arquitecto de Soluciones');
      // Debe contener los 3 logros sin haber creado cargos ficticios para "En 2023" o "Durante 2024"
      expect(result.experience[0].rawAchievements.length).toBe(3);
      expect(result.experience[0].rawAchievements[0]).toContain('2023 lideré la migración');
      expect(result.experience[0].rawAchievements[1]).toContain('2024 implementé arquitectura');
    });
  });

  describe('Orbital Presentation Document Parser (Topic Density Clustering)', () => {
    it('debe generar secciones semánticas agrupadas por densidad temática sin cortes arbitrarios', () => {
      const documentText = `
# PLAN ESTRATÉGICO INDI 2026

## 1. Diagnóstico de Infraestructura
La infraestructura anterior presentaba latencias considerables y costos elevados por transferencias de datos.
Se requería modernización hacia el Edge con Cloudflare R2 y Turso LibSQL.

## 2. Propuesta Tecnológica
Implementamos arquitectura Feature-Sliced Design unidireccional estricta.
La autenticación Better-Auth permite escalabilidad total sin cobros por usuario activo.

## 3. Métricas y Resultados
Reducción de costos de infraestructura en 85%.
Latencia reducida a 15ms en lecturas perimetrales.
Cumplimiento normativo del 100% frente a la EU AI Act y SERNAC.
`;

      const analysis = analyzeDocumentContent(documentText, 'estrategia.md');

      expect(analysis.detectedArchetype).toBeDefined();
      expect(analysis.titleSuggestion).toContain('PLAN ESTRATÉGICO INDI 2026');
      expect(analysis.semanticSections.length).toBeGreaterThanOrEqual(2);

      // Verificar que se extrajeron métricas correctamente
      expect(analysis.hasMetrics).toBe(true);
      const costMetric = analysis.detectedMetrics.find((m) => m.value.includes('85%') || m.value.includes('15ms'));
      expect(costMetric).toBeDefined();
    });
  });
});
