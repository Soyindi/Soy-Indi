import { describe, it, expect } from 'vitest';
import {
  evaluateCvPreRouteStrategy,
  auditAndRepairCvBullet,
  auditAndRepairCvExtraction,
} from '@/features/ai-smart-cv/lib/cv-auditor';
import { MultimodalCvExtraction } from '@/entities/cv/schemas';

describe('Smart CV Syntactic & Pre-Route Auditor (INDI 2026)', () => {
  describe('evaluateCvPreRouteStrategy', () => {
    it('clasifica perfiles de ingeniería de software como technical_specialist', () => {
      const techCv = `
        Ingeniero de Software Senior con experiencia en TypeScript, Next.js, React, Docker y microservicios.
        Diseñé arquitecturas de datos en la nube y optimicé APIs de alta concurrencia.
      `;
      const assessment = evaluateCvPreRouteStrategy(techCv);
      expect(assessment.detectedArchetype).toBe('technical_specialist');
      expect(assessment.focusKeywords).toContain('arquitectura distribuida');
    });

    it('clasifica perfiles ejecutivos de alta dirección como executive_c_level', () => {
      const executiveCv = `
        Gerente General y Director de Operaciones con 12 años liderando equipos multidisciplinarios.
        Gestión de presupuesto anual, optimización de EBITDA y reporte a directorio.
      `;
      const assessment = evaluateCvPreRouteStrategy(executiveCv);
      expect(assessment.detectedArchetype).toBe('executive_c_level');
      expect(assessment.estimatedSeniority).toBe('executive');
      expect(assessment.requiresExecutiveSummary).toBe(true);
    });

    it('clasifica perfiles de salud y psicología como clinical_healthcare', () => {
      const clinicalCv = `
        Psicólogo Clínico con experiencia en atención de pacientes, evaluación diagnóstica
        y diseño de intervenciones terapéuticas individuales. Registro Fonasa vigente.
      `;
      const assessment = evaluateCvPreRouteStrategy(clinicalCv);
      expect(assessment.detectedArchetype).toBe('clinical_healthcare');
      expect(assessment.focusKeywords).toContain('atención clínica');
    });
  });

  describe('auditAndRepairCvBullet', () => {
    it('elimina prefijos obsoletos de etiqueta y palabras huérfanas al final', () => {
      const rawBullet = 'Logro: Lideré la migración del sistema para el';
      const result = auditAndRepairCvBullet(rawBullet);
      expect(result.wasRepaired).toBe(true);
      expect(result.repairedText).toBe('Lideré la migración del sistema.');
    });

    it('elimina puntos suspensivos mutilantes y preserva la oración completa', () => {
      const rawBullet = '• Optimicé el tiempo de respuesta del servidor en un 35%...';
      const result = auditAndRepairCvBullet(rawBullet);
      expect(result.repairedText).not.toContain('...');
      expect(result.repairedText).toBe('Optimicé el tiempo de respuesta del servidor en un 35%.');
    });

    it('respeta viñetas bien estructuradas asegurando formato capitalizado y punto final', () => {
      const rawBullet = 'diseñé la estrategia comercial aumentando las ventas en 20%';
      const result = auditAndRepairCvBullet(rawBullet);
      expect(result.repairedText).toBe('Diseñé la estrategia comercial aumentando las ventas en 20%.');
    });
  });

  describe('auditAndRepairCvExtraction', () => {
    it('audita integralmente resumen y viñetas de experiencia en un CV', () => {
      const extraction: MultimodalCvExtraction = {
        fullName: 'Juan Pérez',
        email: 'juan@test.com',
        phone: '+56 9 1234 5678',
        location: 'Santiago, Chile',
        targetRole: 'Software Architect',
        summary: 'Profesional enfocado en desarrollo de software para la',
        skills: ['TypeScript', 'Node.js'],
        experience: [
          {
            company: 'Tech SpA',
            role: 'Lead Developer',
            period: '2022 - Presente',
            rawAchievements: ['Responsabilidad: Coordinación técnica del equipo con'],
            xyzBullets: [
              {
                text: '• Diseñé microservicios de alto tráfico para',
                needs_metric: true,
              },
            ],
          },
        ],
        education: [
          {
            degree: 'Ingeniería en Computación',
            institution: 'Universidad',
            year: '2020',
          },
        ],
        references: [],
      };

      const { auditedExtraction, repairedBulletsCount } = auditAndRepairCvExtraction(extraction);

      expect(repairedBulletsCount).toBeGreaterThan(0);
      expect(auditedExtraction.summary).toBe('Profesional enfocado en desarrollo de software.');
      expect(auditedExtraction.experience[0].rawAchievements[0]).toBe('Coordinación técnica del equipo.');
      expect(auditedExtraction.experience[0].xyzBullets[0].text).toBe('Diseñé microservicios de alto tráfico.');
    });

    it('purga marcadores de salto de página que se hayan filtrado en viñetas de experiencia', () => {
      const extraction: MultimodalCvExtraction = {
        fullName: 'Matías Riquelme',
        email: 'matias@test.com',
        phone: '+56 9 1234 5678',
        location: 'Concepción, Chile',
        targetRole: 'Psicólogo & Dev',
        summary: 'Resumen profesional.',
        skills: ['Python', 'SQL'],
        experience: [
          {
            company: 'Hospital Clínico',
            role: 'Psicólogo',
            period: '2020 - 2021',
            rawAchievements: [
              'Atención clínica individual.',
              '--- PÁGINA SIGUIENTE ---',
              'Gestión de derivaciones hospitalarias.',
            ],
            xyzBullets: [
              { text: 'Atención clínica individual.', needs_metric: false },
              { text: '--- PÁGINA SIGUIENTE ---', needs_metric: false },
              { text: 'Gestión de derivaciones hospitalarias.', needs_metric: false },
            ],
          },
        ],
        education: [
          {
            degree: 'Formación en WISC-V',
            institution: 'Education Business Group',
            year: '2021',
          },
        ],
        references: [],
      };

      const { auditedExtraction } = auditAndRepairCvExtraction(extraction);

      expect(auditedExtraction.experience[0].rawAchievements).not.toContain('--- PÁGINA SIGUIENTE ---');
      expect(auditedExtraction.experience[0].rawAchievements.length).toBe(2);
      expect(auditedExtraction.experience[0].xyzBullets.some((b) => b.text.includes('PÁGINA SIGUIENTE'))).toBe(false);
      expect(auditedExtraction.experience[0].xyzBullets.length).toBe(2);
      expect(auditedExtraction.education[0].degree).toBe('Formación en WISC-V');
    });
  });
});
