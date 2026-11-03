import { describe, it, expect, vi } from 'vitest';
import { rewriteCvSectionSchema } from '@/entities/cv/schemas';
import { rewriteCvSectionAction } from '@/features/ai-smart-cv/actions';

// Mock de llamada a NVIDIA NIM
vi.mock('@/shared/api/nvidia-nim', () => ({
  callNvidiaNimChat: vi.fn().mockImplementation(async (messages: any[]) => {
    const userPrompt = messages.find((m: any) => m.role === 'user')?.content || '';
    if (userPrompt.includes('Software Architect')) {
      return {
        success: true,
        content: JSON.stringify({
          suggestions: [
            'Lideré el diseño de microservicios distribuidos, optimizando la latencia operativa en un entorno de alta disponibilidad.',
            'Orquesté la migración a arquitecturas event-driven, reduciendo costos de infraestructura en la organización.',
            'Diseñé sistemas escalables con estrictos estándares de observabilidad y resiliencia para el rol de Software Architect.'
          ]
        })
      };
    }
    return {
      success: false,
      error: 'Mock fallback trigger'
    };
  })
}));

describe('Smart CV - Inline AI Writer & Schema Audit', () => {
  it('valida correctamente las entradas con rewriteCvSectionSchema', () => {
    const valid = rewriteCvSectionSchema.safeParse({
      text: 'Desarrollé la API de pagos',
      type: 'BULLET',
      mode: 'XYZ_IMPACT',
      role: 'Full Stack Engineer',
      company: 'Fintech SpA',
      targetRole: 'Senior Backend Engineer',
      skills: ['TypeScript', 'Node.js', 'PostgreSQL']
    });

    expect(valid.success).toBe(true);
  });

  it('rechaza textos vacíos por contrato Zod', async () => {
    const res = await rewriteCvSectionAction({
      text: '',
      type: 'BULLET',
      mode: 'XYZ_IMPACT'
    });

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('genera sugerencias enriquecidas por IA con contexto cuando el modelo responde', async () => {
    const res = await rewriteCvSectionAction({
      text: 'Diseñé la arquitectura del sistema',
      type: 'BULLET',
      mode: 'XYZ_IMPACT',
      role: 'Software Architect',
      targetRole: 'Software Architect',
      company: 'TechCorp'
    });

    expect(res.success).toBe(true);
    expect(res.suggestions).toHaveLength(3);
    expect(res.suggestions[0]).toContain('microservicios');
  });

  it('aplica fallback contextualizado inteligente en ausencia del modelo sin romper coherencia', async () => {
    const res = await rewriteCvSectionAction({
      text: 'Optimizé las consultas SQL de la base de datos',
      type: 'BULLET',
      mode: 'XYZ_IMPACT',
      role: 'DBA',
      company: 'Banco Central',
      targetRole: 'Database Administrator'
    });

    expect(res.success).toBe(true);
    expect(res.suggestions.length).toBeGreaterThanOrEqual(2);
    // Valida que el fallback mencione a la empresa o rol en lugar de cadenas descontextualizadas
    expect(res.suggestions.some(s => s.includes('Banco Central') || s.includes('Database Administrator'))).toBe(true);
  });

  it('genera variantes ejecutivas para el resumen profesional adaptadas al rol objetivo', async () => {
    const res = await rewriteCvSectionAction({
      text: 'Ingeniero con 5 años de experiencia en frontend',
      type: 'SUMMARY',
      mode: 'EXECUTIVE',
      targetRole: 'Lead Frontend Engineer'
    });

    expect(res.success).toBe(true);
    expect(res.suggestions[0]).toContain('Lead Frontend Engineer');
  });

  it('procesa bloques multilínea de viñetas devolviendo conjuntos de viñetas separados por saltos de línea', async () => {
    const multiBulletText = `Lideré equipo de 4 ingenieros
Diseñé arquitectura de microservicios
Reduje costos en un 30%`;

    const res = await rewriteCvSectionAction({
      text: multiBulletText,
      type: 'BULLET',
      mode: 'XYZ_IMPACT',
      role: 'Tech Lead',
      company: 'Startup SpA',
      targetRole: 'Engineering Manager'
    });

    expect(res.success).toBe(true);
    expect(res.suggestions).toHaveLength(3);
    // Cada variante debe preservar el formato multilínea (3 viñetas separadas por \n)
    for (const sug of res.suggestions) {
      const lines = sug.split('\n').filter(Boolean);
      expect(lines).toHaveLength(3);
    }
  });

  it('previene duplicación de verbos de acción en las sugerencias generadas', async () => {
    const res = await rewriteCvSectionAction({
      text: 'Lideré el despliegue de infraestructura en la nube',
      type: 'BULLET',
      mode: 'XYZ_IMPACT',
      role: 'Cloud Architect',
      company: 'Tech Chile'
    });

    expect(res.success).toBe(true);
    for (const sug of res.suggestions) {
      expect(sug).not.toMatch(/lider[eé]\s+lider[eé]/i);
      expect(sug).not.toMatch(/orquest[eé]\s+orquest[eé]/i);
    }
  });

  it('aplica enfoque de Palabras Clave ATS incorporando términos del sector', async () => {
    const res = await rewriteCvSectionAction({
      text: 'Desarrollé la interfaz de usuario con React y TypeScript',
      type: 'BULLET',
      mode: 'ATS_KEYWORDS',
      role: 'Frontend Developer',
      company: 'Digital Solutions',
      targetRole: 'Senior Frontend Engineer'
    });

    expect(res.success).toBe(true);
    expect(res.suggestions).toHaveLength(3);
    expect(res.suggestions[0]).not.toContain('[añadir métrica]');
  });

  it('erradica duplicaciones sintácticas ("Lideré orquesté", "Lideré coordinación") y corchetes en fallback offline', async () => {
    const rawBullets = `Orquesté la ejecución de apoyo psicológico a pacientes con enfermedades crónicas
Coordinación con el equipo de enfermería y trabajo social para dar continuidad
Contención emocional en situaciones de crisis y acompañamiento en duelo anticipatorio`;

    const res = await rewriteCvSectionAction({
      text: rawBullets,
      type: 'BULLET',
      mode: 'XYZ_IMPACT',
      role: 'Psicólogo (Reemplazante)',
      company: 'Programa de Cuidados Paliativos Universales',
      targetRole: 'Psicólogo Clínico'
    });

    expect(res.success).toBe(true);
    expect(res.suggestions).toHaveLength(3);

    for (const variant of res.suggestions) {
      // Cero duplicación de verbos
      expect(variant).not.toMatch(/lider[eé]\s+orquest/i);
      expect(variant).not.toMatch(/lider[eé]\s+coordinaci/i);
      expect(variant).not.toMatch(/lider[eé]\s+contenci/i);
      expect(variant).not.toMatch(/orquest[eé]\s+ejecuci/i);
      // Cero corchetes de programación o placeholders toscos
      expect(variant).not.toMatch(/\[(?:añadir|especificar).*?\]/i);
      // Preserva el formato multilínea
      const lines = variant.split('\n').filter(Boolean);
      expect(lines).toHaveLength(3);
    }
  });

  it('bloquea contaminación cruzada de términos ajenos (ej. "psico-criminológico" o "RNR") en Psicólogo Practicante en SEREMI', async () => {
    const rawBullet = 'Colaboré con Gendarmería de Chile, Geopark y el Ministerio de Desarrollo Social.';
    const globalCvSkills = [
      'Evaluación psico-criminológica',
      'Modelo RNR',
      'Cuidados paliativos',
      'Python',
      'Event Sourcing',
      'SHA-256'
    ];

    const res = await rewriteCvSectionAction({
      text: rawBullet,
      type: 'BULLET',
      mode: 'XYZ_IMPACT',
      role: 'Psicólogo Practicante',
      company: 'Secretaría Regional Ministerial de Salud Magallanes',
      targetRole: 'Psicólogo Clínico · Desarrollo de Sistemas e IA',
      skills: globalCvSkills
    });

    expect(res.success).toBe(true);
    expect(res.suggestions).toHaveLength(3);

    for (const sug of res.suggestions) {
      // Jamás debe inyectar terminología carcelaria/penitenciaria o de software en la práctica de SEREMI de Salud
      expect(sug).not.toMatch(/psico[- ]?criminol/i);
      expect(sug).not.toMatch(/modelo\s+rnr/i);
      expect(sug).not.toMatch(/event\s+sourcing/i);
      expect(sug).not.toMatch(/sha[- ]?256/i);
      expect(sug).not.toMatch(/cuidados\s+paliativos/i);
    }
  });
});
