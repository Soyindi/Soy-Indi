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
});
