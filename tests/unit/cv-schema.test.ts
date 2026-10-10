import { describe, it, expect, vi } from 'vitest';
import { cvFormSchema, cvBulletSchema, cvEducationSchema } from '@/entities/cv/schemas';

describe('CVFormSchema & EU AI Act Guardrails', () => {
  const validCv = {
    title: 'CV Tech Lead 2026',
    targetRole: 'Staff Software Engineer',
    templateId: 'executive-modern',
    content: {
      fullName: 'Camila Morales',
      email: 'camila@tech.io',
      phone: '+56987654321',
      location: 'Santiago, Chile',
      summary: 'Líder técnico con 10 años de experiencia escalando arquitecturas distribuidas.',
      skills: ['TypeScript', 'Next.js', 'PostgreSQL', 'Docker', 'AWS'],
      experience: [
        {
          company: 'Acme Global',
          role: 'Staff Engineer',
          period: '2022 - Presente',
          bullets: [
            'Reduje la latencia de APIs en un 45% mediante migración a Edge computing.',
            'Lideré un equipo de 12 ingenieros distribuidos con adopción del 95% en métricas DORA.',
          ],
          detailedBullets: [
            {
              text: 'Reduje la latencia de APIs en un 45% mediante migración a Edge computing.',
              needs_metric: false,
            },
          ],
        },
      ],
      education: [
        {
          degree: 'Ingeniería Civil en Computación',
          institution: 'Universidad de Chile',
          year: '2016',
          credentialType: 'DEGREE' as const,
        },
      ],
      signatureType: 'TYPOGRAPHIC' as const,
    },
  };

  it('debe validar correctamente un CV con estructura completa y viñetas cuantificadas', () => {
    const result = cvFormSchema.safeParse(validCv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content.fullName).toBe('Camila Morales');
      expect(result.data.content.experience[0].detailedBullets?.[0].needs_metric).toBe(false);
    }
  });

  it('debe requerir al menos 2 caracteres en el título y rol objetivo', () => {
    const invalidCv = {
      ...validCv,
      title: 'A',
      targetRole: 'B',
    };
    const result = cvFormSchema.safeParse(invalidCv);
    expect(result.success).toBe(false);
  });

  it('debe validar la bandera needs_metric en viñetas sin métricas según EU AI Act', () => {
    const unquantifiedBullet = {
      text: 'Apoyé en la mejora del sistema de facturación interna.',
      needs_metric: true,
    };
    const result = cvBulletSchema.safeParse(unquantifiedBullet);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.needs_metric).toBe(true);
    }
  });

  it('debe rechazar viñetas con texto vacío', () => {
    const emptyBullet = {
      text: '',
      needs_metric: false,
    };
    const result = cvBulletSchema.safeParse(emptyBullet);
    expect(result.success).toBe(false);
  });

  it('debe permitir tipos de credencial académica definidos en el estándar', () => {
    const validDegree = {
      degree: 'Master in Computer Science',
      institution: 'MIT',
      year: '2020',
      credentialType: 'CERTIFICATION' as const,
    };
    const result = cvEducationSchema.safeParse(validDegree);
    expect(result.success).toBe(true);
  });

  it('callNvidiaNimChat orquesta failover hacia Groq LPU si los modelos primarios no responden', async () => {
    const originalFetch = global.fetch;
    const originalGroqKey = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'gsk_mock_test_key_groq';

    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('api.groq.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: 'OK Groq LPU Resiliente' } }],
            usage: { total_tokens: 12 },
          }),
        };
      }
      // Simula fallo EOL 410 en NVIDIA NIM
      return {
        ok: false,
        status: 410,
        text: async () => 'Model has reached end of life',
      };
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    try {
      const { callNvidiaNimChat } = await import('@/shared/api/nvidia-nim');
      const result = await callNvidiaNimChat([
        { role: 'user', content: 'Di OK' }
      ], {
        model: 'meta/llama-3.2-90b-vision-instruct',
        maxTokens: 10,
      });

      expect(result.success).toBe(true);
      expect(result.content).toBe('OK Groq LPU Resiliente');
      expect(result.modelUsed).toBe('groq/qwen3.8-27b');
    } finally {
      global.fetch = originalFetch;
      if (originalGroqKey !== undefined) {
        process.env.GROQ_API_KEY = originalGroqKey;
      } else {
        delete process.env.GROQ_API_KEY;
      }
    }
  });
});
