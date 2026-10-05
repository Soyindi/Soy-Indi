import { describe, it, expect, vi, beforeEach } from 'vitest';
import { slugifyCvTitle, generateCvSlug, cvFormSchema } from '@/entities/cv/schemas';
import { getPublicSmartCvAction, incrementCvViewsAction } from '@/features/ai-smart-cv/actions';
import { db } from '@/shared/api/db';

vi.mock('@/shared/api/db', () => ({
  db: {
    query: {
      smartCvs: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    })),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Smart CV Digital Sharing & URL Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('slugifyCvTitle', () => {
    it('debe limpiar tildes, caracteres especiales y normalizar a minúsculas separadas por guiones', () => {
      const input = 'María José Ñuñoa - Ingeniera & Desarrolladora Senior';
      const output = slugifyCvTitle(input);
      expect(output).toBe('maria-jose-nunoa-ingeniera-desarrolladora-senior');
    });

    it('debe retornar fallback seguro "cv-profesional" ante cadenas vacías o solo símbolos', () => {
      expect(slugifyCvTitle('')).toBe('cv-profesional');
      expect(slugifyCvTitle('   ')).toBe('cv-profesional');
      expect(slugifyCvTitle('!@#$%^&*()_+')).toBe('cv-profesional');
    });

    it('debe limitar la longitud máxima del slug base a 48 caracteres limpios', () => {
      const longInput = 'desarrollador-de-software-especializado-en-sistemas-distribuidos-de-alta-concurrencia-y-baja-latencia';
      const output = slugifyCvTitle(longInput);
      expect(output.length).toBeLessThanOrEqual(48);
      expect(output.endsWith('-')).toBe(false);
    });
  });

  describe('generateCvSlug', () => {
    it('debe generar un slug limpio profesional por defecto que cumpla con ^[a-z0-9-]+$', () => {
      const slug = generateCvSlug('Tech Lead 2026');
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug).toBe('tech-lead-2026');
    });

    it('debe generar sufijo aleatorio cuando withSuffix es true para evitar colisiones forzadas', () => {
      const slug1 = generateCvSlug('Camila Morales', true);
      const slug2 = generateCvSlug('Camila Morales', true);
      expect(slug1).toMatch(/^camila-morales-[a-z0-9]{4}$/);
      expect(slug2).toMatch(/^camila-morales-[a-z0-9]{4}$/);
      expect(slug1).not.toBe(slug2);
    });
  });

  describe('cvFormSchema with Digital Sharing Fields', () => {
    const validBaseCv = {
      title: 'CV Tech Lead 2026',
      targetRole: 'Staff Software Engineer',
      templateId: 'modern-executive',
      content: {
        fullName: 'Ignacio Valenzuela',
        email: 'ignacio@tech.cl',
        phone: '+56912345678',
        location: 'Valparaíso, Chile',
        summary: 'Arquitecto de software enfocado en resiliencia y performance.',
        skills: ['TypeScript', 'Next.js', 'PostgreSQL'],
        experience: [
          {
            company: 'Banco Digital',
            role: 'Tech Lead',
            period: '2021 - Presente',
            bullets: ['Aumenté la disponibilidad del cluster bancario al 99.99%'],
          },
        ],
        education: [
          {
            degree: 'Ingeniería Civil Informática',
            institution: 'UTFSM',
            year: '2019',
          },
        ],
      },
    };

    it('debe aceptar un CV con slug válido e isPublic booleano', () => {
      const cvWithSharing = {
        ...validBaseCv,
        slug: 'ignacio-valenzuela-tech-lead-7f2a',
        isPublic: true,
      };

      const result = cvFormSchema.safeParse(cvWithSharing);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe('ignacio-valenzuela-tech-lead-7f2a');
        expect(result.data.isPublic).toBe(true);
      }
    });

    it('debe rechazar slugs con espacios, mayúsculas o caracteres inválidos', () => {
      const invalidSlugs = [
        'Ignacio Valenzuela',
        'ignacio_valenzuela',
        'ignacio/valenzuela',
        'ignacio@lead',
      ];

      for (const badSlug of invalidSlugs) {
        const result = cvFormSchema.safeParse({
          ...validBaseCv,
          slug: badSlug,
        });
        expect(result.success).toBe(false);
      }
    });

    it('debe permitir que slug sea omitido o nulo para autogeneración en servidor', () => {
      const result = cvFormSchema.safeParse(validBaseCv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPublic).toBe(true); // default true
      }
    });
  });

  describe('Server Actions: getPublicSmartCvAction & incrementCvViewsAction', () => {
    it('debe retornar el CV público cuando existe y isPublic es true', async () => {
      const mockCv = {
        id: 'cv-123',
        slug: 'matias-engineer-9b3c',
        title: 'CV Staff Engineer',
        isPublic: true,
        viewsCount: 14,
        content: { fullName: 'Matías Riquelme' },
      };

      vi.mocked(db.query.smartCvs.findFirst).mockResolvedValueOnce(mockCv as any);

      const result = await getPublicSmartCvAction('matias-engineer-9b3c');
      expect(result.success).toBe(true);
      if (result.success && 'data' in result && result.data) {
        expect(result.data.id).toBe('cv-123');
        expect(result.data.viewsCount).toBe(14);
      }
    });

    it('debe rechazar el acceso si el CV existe pero tiene isPublic: false (privado)', async () => {
      const mockPrivateCv = {
        id: 'cv-private',
        slug: 'matias-private-slug',
        title: 'CV Confidencial',
        isPublic: false,
        viewsCount: 2,
      };

      vi.mocked(db.query.smartCvs.findFirst).mockResolvedValueOnce(mockPrivateCv as any);

      const result = await getPublicSmartCvAction('matias-private-slug');
      expect(result.success).toBe(false);
      expect(result.error).toContain('privado');
    });

    it('debe rechazar el acceso si el CV no existe en la base de datos', async () => {
      vi.mocked(db.query.smartCvs.findFirst).mockResolvedValueOnce(null as any);

      const result = await getPublicSmartCvAction('non-existent-slug');
      expect(result.success).toBe(false);
      expect(result.error).toContain('no encontrado');
    });

    it('debe ejecutar exitosamente el incremento atómico de vistas', async () => {
      const result = await incrementCvViewsAction('cv-123');
      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });
  });
});
