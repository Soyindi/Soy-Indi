import { describe, it, expect } from 'vitest';
import { evaluateCvPreRouteStrategy } from '@/features/ai-smart-cv/lib/cv-auditor';
import { scoreBulletQuality, verifyBulletGrounding } from '@/features/ai-smart-cv/lib/cv-quality-engine';

describe('INDI Smart CV - Pre-Route & Quality Engine v2 (Anti-Alucinaciones)', () => {
  describe('evaluateCvPreRouteStrategy (Pre-Route Ponderado)', () => {
    it('clasifica a un psicólogo como clinical_healthcare aunque contenga palabras como liderazgo o informes', () => {
      const psychologistCv = `
        MATÍAS RICARDO RIQUELME CÁRDENAS
        Psicólogo - Intervención Clínica y Psicosocial | Desarrollo de Sistemas e IA (Autodidacta)
        Experiencia:
        Psicólogo de Reinserción Social - Complejo Penitenciario Castro
        Lideré la evaluación psico-criminológica y redacción de informes técnicos para población penitenciaria.
        Diseño y aplicación de Pauta RNR en intervenciones individuales y grupales.
        Psicólogo (Reemplazante) - Cuidados Paliativos Universales
        Apoyo psicológico a pacientes con enfermedades crónicas y terminales.
      `;

      const result = evaluateCvPreRouteStrategy(psychologistCv, 'Psicólogo - Intervención Clínica y Psicosocial');
      expect(result.detectedArchetype).toBe('clinical_healthcare');
      expect(result.recommendedTone).toContain('Clínico');
      // Debe enfocarse en clínica y bienestar, NUNCA en ebitda ni visión estratégica corporativa
      expect(result.focusKeywords).toContain('atención clínica');
      expect(result.focusKeywords).not.toContain('ebitda');
      expect(result.focusKeywords).not.toContain('visión estratégica');
    });

    it('clasifica a un docente como education_pedagogy', () => {
      const teacherCv = `
        Profesor de Educación Básica mención Lenguaje y Comunicación.
        Docente de aula con 6 años de experiencia en diseño curricular y metodologías activas.
      `;
      const result = evaluateCvPreRouteStrategy(teacherCv, 'Profesor de Educación Básica');
      expect(result.detectedArchetype).toBe('education_pedagogy');
    });

    it('clasifica a un Director General como executive_c_level', () => {
      const executiveCv = `
        Gerente General y Directorio.
        Gestión de P&L, presupuesto anual y estrategia corporativa.
      `;
      const result = evaluateCvPreRouteStrategy(executiveCv, 'Gerente General');
      expect(result.detectedArchetype).toBe('executive_c_level');
      expect(result.focusKeywords).toContain('visión estratégica');
    });
  });

  describe('scoreBulletQuality & verifyBulletGrounding (Quality & Grounding Guard)', () => {
    it('penaliza viñetas con clichés repetitivos de plantillas anteriores', () => {
      const badBullet = 'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en evaluación de casos.';
      const score = scoreBulletQuality(badBullet);
      expect(score.cliches.length).toBeGreaterThan(0);
      expect(score.score).toBeLessThan(60);
    });

    it('penaliza y detecta marcadores sin rellenar tipo [añadir métrica]', () => {
      const placeholderBullet = 'Lideré la optimización de flujos clínicos [añadir métrica de impacto].';
      const score = scoreBulletQuality(placeholderBullet);
      expect(score.placeholders.length).toBeGreaterThan(0);
      expect(score.score).toBeLessThan(70);
    });

    it('califica con alto puntaje viñetas con verbo fuerte y métricas reales', () => {
      const excellentBullet = 'Evalué a 45 internos al mes mediante pauta RNR, reduciendo la reincidencia en un 18%.';
      const score = scoreBulletQuality(excellentBullet);
      expect(score.hasStrongVerb).toBe(true);
      expect(score.hasMetric).toBe(true);
      expect(score.score).toBeGreaterThanOrEqual(80);
    });

    it('verifyBulletGrounding detecta si la IA inventó porcentajes o números no existentes en la fuente', () => {
      const source = 'Atendí pacientes en el hospital regional coordinando tratamientos.';
      const hallucinatedSuggestion = 'Atendí pacientes en el hospital regional, logrando un aumento del 35% en adherencia.';
      
      const check = verifyBulletGrounding(source, hallucinatedSuggestion);
      expect(check.isGrounded).toBe(false);
      expect(check.hallucinatedMetrics).toContain('35');
    });
  });
});
