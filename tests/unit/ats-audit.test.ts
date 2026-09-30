import { describe, it, expect } from 'vitest';
import { auditAtsScoreAction } from '@/features/ai-smart-cv/actions';
import { CVFormValues } from '@/entities/cv/schemas';

describe('ATS Score & Audit Engine', () => {
  const baseCv: CVFormValues = {
    title: 'CV Software Engineer',
    targetRole: 'Software Engineer',
    templateId: 'executive-modern',
    content: {
      fullName: 'Andrés Castro',
      email: 'andres@example.com',
      phone: '+56911223344',
      location: 'Valparaíso, Chile',
      summary: 'Desarrollador enfocado en arquitectura react, typescript, api y microservicios.',
      skills: ['TypeScript', 'React', 'Next.js', 'SQL', 'Docker', 'Git'],
      experience: [
        {
          company: 'Fintech Solutions',
          role: 'Senior Software Engineer',
          period: '2021 - 2025',
          bullets: [
            'Lideré el diseño de arquitectura API reduciendo costos en 30%.',
            'Implementé pruebas automatizadas aumentando cobertura a 85%.',
          ],
          detailedBullets: [
            { text: 'Lideré el diseño de arquitectura API reduciendo costos en 30%.', needs_metric: false },
            { text: 'Implementé pruebas automatizadas aumentando cobertura a 85%.', needs_metric: false },
          ],
        },
      ],
      education: [
        {
          degree: 'Ingeniería en Informática',
          institution: 'Universidad Técnica Federico Santa María',
          year: '2020',
          credentialType: 'DEGREE',
        },
      ],
      references: [],
      credentials: [],
      signatureType: 'NONE',
    },
  };

  it('debe otorgar un score alto (>70) a un CV con keywords relevantes y métricas cuantificadas', async () => {
    const result = await auditAtsScoreAction(baseCv);
    expect(result.success).toBe(true);
    expect(result.data.score).toBeGreaterThanOrEqual(70);
    expect(result.data.keywordMatches.length).toBeGreaterThan(0);
    expect(result.data.strengths.length).toBeGreaterThan(0);
  });

  it('debe detectar advertencias de alucinación/métricas si existen viñetas con needs_metric=true', async () => {
    const cvWithMissingMetrics: CVFormValues = {
      ...baseCv,
      content: {
        ...baseCv.content,
        experience: [
          {
            company: 'Legacy Corp',
            role: 'Desarrollador',
            period: '2019 - 2021',
            bullets: ['Colaboré en tareas de soporte y programación general.'],
            detailedBullets: [
              { text: 'Colaboré en tareas de soporte y programación general.', needs_metric: true },
            ],
          },
        ],
      },
    };

    const result = await auditAtsScoreAction(cvWithMissingMetrics);
    expect(result.success).toBe(true);
    expect(result.data.hallucinationWarnings).toBeDefined();
    expect(result.data.hallucinationWarnings?.length).toBeGreaterThan(0);
  });

  it('debe identificar keywords faltantes de la taxonomía del rol objetivo', async () => {
    const poorCv: CVFormValues = {
      ...baseCv,
      targetRole: 'Frontend Developer',
      content: {
        ...baseCv.content,
        summary: 'Persona entusiasta y trabajadora.',
        skills: ['Word', 'Excel'],
        experience: [],
      },
    };

    const result = await auditAtsScoreAction(poorCv);
    expect(result.success).toBe(true);
    expect(result.data.missingKeywords.length).toBeGreaterThan(0);
    expect(result.data.score).toBeLessThan(70);
  });
});
