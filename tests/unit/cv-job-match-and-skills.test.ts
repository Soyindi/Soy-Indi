import { describe, it, expect } from 'vitest';
import {
  analyzeCvJobMatchDeterministically,
  getRecommendedSkillsForRole,
} from '@/features/ai-smart-cv/lib/cv-matching-engine';
import { CVContent } from '@/entities/cv/schemas';

describe('Smart CV Job Matching Engine & Skill Taxonomies', () => {
  const mockCvContent: CVContent = {
    fullName: 'Alejandro Vargas',
    email: 'alejandro@empresa.cl',
    phone: '+56912345678',
    location: 'Santiago, Chile',
    summary: 'Ingeniero con 6 años de experiencia en desarrollo web, TypeScript, Next.js y bases de datos relacionales.',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Git'],
    experience: [
      {
        company: 'Fintech SpA',
        role: 'Tech Lead / Senior Developer',
        period: '2020 - Presente',
        bullets: ['Lideré la migración a arquitecturas serverless con React, Node.js y PostgreSQL aumentando el throughput 3x.'],
        detailedBullets: [],
      },
    ],
    education: [
      {
        degree: 'Ingeniería Civil Informática',
        institution: 'Universidad Técnica',
        year: '2019',
        credentialType: 'DEGREE',
      },
    ],
    references: [],
    credentials: [],
  };

  describe('analyzeCvJobMatchDeterministically', () => {
    it('calcula un match score elevado cuando el CV cubre las palabras clave principales', () => {
      const jobDescription = `
        Buscamos un Ingeniero Senior con experiencia en TypeScript, React, Node.js y PostgreSQL.
        Requisitos: Al menos 4 años de experiencia en desarrollo web y grado de ingeniería o licenciatura.
        Deseable manejo de Docker y GraphQL.
      `;

      const result = analyzeCvJobMatchDeterministically(jobDescription, mockCvContent, 'Senior Software Engineer');

      expect(result.matchScore).toBeGreaterThanOrEqual(60);
      expect(result.matchingKeywords).toContain('typescript');
      expect(result.matchingKeywords).toContain('react');
      expect(result.matchingKeywords).toContain('postgresql');
      expect(result.missingKeywords.length).toBeGreaterThan(0);
      expect(result.missingKeywords).toContain('docker');
      expect(result.tailoredSummaryAdvice).toBeDefined();
    });

    it('identifica keywords faltantes de alto impacto para sugerir agregarlas', () => {
      const jobDescription = `
        Se requiere experiencia excluyente en Kubernetes, Terraform, AWS Cloud y CI/CD pipelines.
      `;

      const result = analyzeCvJobMatchDeterministically(jobDescription, mockCvContent, 'DevOps Engineer');

      expect(result.missingKeywords).toContain('kubernetes');
      expect(result.missingKeywords).toContain('terraform');
      expect(result.missingKeywords).toContain('aws');
      expect(result.matchScore).toBeLessThan(70);
    });

    it('detecta auditoría de requisitos indispensables (experiencia y educación)', () => {
      const jobDescription = `
        Requisitos indispensables: Mínimo 5 años de experiencia comprobable. Grado académico de Ingeniería o Máster.
      `;

      const result = analyzeCvJobMatchDeterministically(jobDescription, mockCvContent);

      expect(result.criticalRequirements.length).toBeGreaterThan(0);
      const expReq = result.criticalRequirements.find((r) => r.requirement.toLowerCase().includes('experiencia'));
      expect(expReq).toBeDefined();
      expect(expReq?.status).toBe('FULFILLED');
    });
  });

  describe('getRecommendedSkillsForRole', () => {
    it('retorna grupos de habilidades organizados para un rol de desarrollo software', () => {
      const groups = getRecommendedSkillsForRole('Senior Frontend Developer', ['React', 'TypeScript']);

      expect(groups.length).toBeGreaterThan(0);
      const allSkills = groups.flatMap((g) => g.skills);

      const reactSkill = allSkills.find((s) => s.name.toLowerCase() === 'react');
      expect(reactSkill?.isCurrent).toBe(true);

      const unselectedSkill = allSkills.find((s) => s.name.toLowerCase() === 'tailwind css' || s.name.toLowerCase() === 'next.js');
      expect(unselectedSkill).toBeDefined();
    });

    it('resuelve taxonomía por defecto para roles genéricos', () => {
      const groups = getRecommendedSkillsForRole('Consultor Estratégico', []);

      expect(groups.length).toBeGreaterThan(0);
      const allSkills = groups.flatMap((g) => g.skills);
      expect(allSkills.length).toBeGreaterThan(3);
    });
  });
});
