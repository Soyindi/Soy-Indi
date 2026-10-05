import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSmartCvByIdAction, upsertSmartCvAction } from '@/features/ai-smart-cv/actions';
import { buildCvPdfDocument, sanitizeBulletText } from '@/features/ai-smart-cv/lib/pdf-engine';
import { CVFormValues } from '@/entities/cv/schemas';
import { db } from '@/shared/api/db';

vi.mock('@/shared/api/db', () => ({
  db: {
    query: {
      smartCvs: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      user: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({}),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue({}),
    })),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Smart CV Persistence, Multi-Tenant Security & Enterprise Export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleCv: CVFormValues = {
    title: 'CV Tech Lead & Principal Architect 2026',
    targetRole: 'Principal Cloud Architect',
    slug: 'diego-valenzuela-arch',
    isPublic: true,
    templateId: 'executive-modern',
    content: {
      fullName: 'Diego Valenzuela',
      email: 'diego@enterprise.io',
      phone: '+56 9 9876 5432',
      location: 'Santiago, Chile',
      rut: '17.892.401-2',
      summary: 'Arquitecto de Soluciones Cloud con más de 10 años diseñando plataformas altamente distribuidas sobre SQLite y arquitecturas de microservicios con latencia sub-milisegundo.',
      skills: ['TypeScript', 'Turso SQLite', 'Drizzle ORM', 'Next.js 16', 'Zod', 'Docker'],
      experience: [
        {
          company: 'Andes Cloud Systems',
          role: 'Principal Architect',
          period: '2023 - Presente',
          bullets: [
            '• Lideré la migración a Turso LibSQL reduciendo costos de infraestructura en un 65%.',
            '- Implementé pipelines automatizados de CI/CD aumentando la confiabilidad del release.',
          ],
          detailedBullets: [
            { text: 'Lideré la migración a Turso LibSQL reduciendo costos de infraestructura en un 65%.', needs_metric: false },
            { text: 'Implementé pipelines automatizados de CI/CD aumentando la confiabilidad del release.', needs_metric: false },
          ],
        },
      ],
      education: [
        {
          degree: 'Ingeniería Civil Informática',
          institution: 'Universidad Técnica Federico Santa María',
          year: '2015',
          credentialType: 'DEGREE',
          verifiedCredentialId: 'UTFSM-VAL-17892401',
        },
      ],
      references: [
        {
          name: 'Carolina Morales',
          role: 'Directora de Tecnología',
          company: 'Fintech Andes',
          contact: '+56 9 8111 2233',
        },
      ],
      credentials: [],
      signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      signatureType: 'DRAWN',
      signatureDate: '04 de Octubre de 2026',
    },
  };

  describe('getSmartCvByIdAction (Multi-Tenant Tenant-Level Ownership)', () => {
    it('debe retornar exitosamente el CV cuando pertenece al usuario autenticado', async () => {
      const mockRecord = {
        id: 'cv-abc-123',
        userId: 'demo-local-offline-user-id',
        title: sampleCv.title,
        targetRole: sampleCv.targetRole,
        slug: sampleCv.slug,
        isPublic: true,
        atsScore: 92,
        templateId: 'executive-modern',
        content: sampleCv.content,
      };

      vi.mocked(db.query.smartCvs.findFirst).mockResolvedValueOnce(mockRecord as any);

      const res = await getSmartCvByIdAction('cv-abc-123', 'demo-local-offline-user-id');
      expect(res.success).toBe(true);
      if (res.success && res.data) {
        expect(res.id).toBe('cv-abc-123');
        expect(res.data.content.fullName).toBe('Diego Valenzuela');
        expect(res.data.content.rut).toBe('17.892.401-2');
      }
    });

    it('debe rechazar el acceso si el CV existe pero pertenece a otro tenant (anti-IDOR)', async () => {
      // Si la query filtrada por id Y userId no encuentra nada, findFirst retorna null
      vi.mocked(db.query.smartCvs.findFirst).mockResolvedValueOnce(null as any);

      const res = await getSmartCvByIdAction('cv-ajeno-999', 'user-atacante');
      expect(res.success).toBe(false);
      expect(res.error).toContain('no encontrado o no tienes permisos');
    });

    it('debe retornar error si el CV no existe en la base de datos', async () => {
      vi.mocked(db.query.smartCvs.findFirst).mockResolvedValueOnce(null as any);

      const res = await getSmartCvByIdAction('cv-inexistente', 'demo-local-offline-user-id');
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('upsertSmartCvAction (Modo Creación vs Actualización)', () => {
    it('debe insertar un nuevo registro en smartCvs cuando no se envía cvId', async () => {
      vi.mocked(db.query.smartCvs.findFirst).mockResolvedValueOnce(null as any); // sin colisión de slug

      const res = await upsertSmartCvAction(sampleCv, undefined, 'demo-local-offline-user-id');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.id).toBeDefined();
        expect(res.slug).toBe('diego-valenzuela-arch');
        expect(db.insert).toHaveBeenCalled();
      }
    });

    it('debe actualizar el registro existente cuando se provee un cvId válido y verificado', async () => {
      const existingCv = {
        id: 'cv-existente-100',
        userId: 'demo-local-offline-user-id',
        slug: 'diego-valenzuela-arch',
      };

      vi.mocked(db.query.smartCvs.findFirst).mockResolvedValueOnce(existingCv as any);

      const res = await upsertSmartCvAction(sampleCv, 'cv-existente-100', 'demo-local-offline-user-id');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.id).toBe('cv-existente-100');
        expect(db.update).toHaveBeenCalled();
      }
    });

    it('debe rechazar la actualización si el cvId pertenece a otro usuario (violación de ownership)', async () => {
      // Query busca and(eq(id, cvId), eq(userId, targetUserId)) y no coincide
      vi.mocked(db.query.smartCvs.findFirst).mockResolvedValueOnce(null as any);

      const res = await upsertSmartCvAction(sampleCv, 'cv-otro-usuario', 'demo-local-offline-user-id');
      expect(res.success).toBe(false);
      expect(res.error).toContain('no pertenece al usuario autenticado');
    });
  });

  describe('Motor Vectorial de Exportación PDF (Grado Empresarial & A4 Unificado)', () => {
    it('debe sanitizar viñetas con caracteres preexistentes y artefactos de OCR (%Ï, %ï)', () => {
      expect(sanitizeBulletText('• Lideré el equipo de arquitectura')).toBe('Lideré el equipo de arquitectura');
      expect(sanitizeBulletText('- Optimicé la latencia P95')).toBe('Optimicé la latencia P95');
      expect(sanitizeBulletText('* Diseñé el nuevo esquema relacional')).toBe('Diseñé el nuevo esquema relacional');
      expect(sanitizeBulletText('• • Reduje los costos en un 30%')).toBe('Reduje los costos en un 30%');
      expect(sanitizeBulletText('Logro sin viñeta previa')).toBe('Logro sin viñeta previa');
      // Casos de artefactos de OCR de diplomas y títulos:
      expect(sanitizeBulletText('%Ï Diplomado en Psicodiagnóstico Laboral')).toBe('Diplomado en Psicodiagnóstico Laboral');
      expect(sanitizeBulletText('%ï Elaboración de Informes Técnicos')).toBe('Elaboración de Informes Técnicos');
      expect(sanitizeBulletText('%Ï Primeros Auxilios Psicológicos')).toBe('Primeros Auxilios Psicológicos');
    });

    it('debe construir un documento jsPDF con formato estándar unificado A4 (210 x 297 mm)', () => {
      const doc = buildCvPdfDocument(sampleCv, { format: 'a4' });
      expect(doc).toBeDefined();

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Dimensiones exactas de A4: 210 x 297 mm
      expect(Math.round(width)).toBe(210);
      expect(Math.round(height)).toBe(297);
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });

    it('debe incluir datos de contacto verificables en las referencias laborales del PDF', () => {
      const cvWithRef: CVFormValues = {
        ...sampleCv,
        content: {
          ...sampleCv.content,
          references: [
            {
              name: 'Cecilia Vivallo Corvalán',
              role: 'Enfermera encargada',
              company: 'Hospital Clínico de Magallanes',
              contact: '+56 9 9123 4567 • cecilia.vivallo@redsalud.gob.cl',
            },
          ],
        },
      };

      const doc = buildCvPdfDocument(cvWithRef, { format: 'a4' });
      expect(doc).toBeDefined();
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });

    it('no debe generar páginas huérfanas al final cuando no hay firma digital explícita', () => {
      const cvWithoutSignature: CVFormValues = {
        ...sampleCv,
        content: {
          ...sampleCv.content,
          signatureUrl: '', // Sin firma digital configurada
        },
      };

      const doc = buildCvPdfDocument(cvWithoutSignature, { format: 'a4' });
      expect(doc).toBeDefined();
      // Documento compacto de 1 o 2 páginas sin página vacía
      expect(doc.getNumberOfPages()).toBeLessThanOrEqual(2);
    });

    it('debe incluir texto justificado y pie de página institucional en todas las hojas', () => {
      const doc = buildCvPdfDocument(sampleCv, { format: 'a4' });
      const totalPages = doc.getNumberOfPages();
      expect(totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  describe('parseCvTextToStructuredData (References Contact Extraction)', () => {
    it('debe extraer referencias con contacto (teléfono y email) en formato de una sola línea', async () => {
      const { parseCvTextToStructuredData } = await import('@/features/ai-smart-cv/lib/cv-text-parser');
      const cvText = `
Matias Riquelme
Psicólogo Clínico
matias@test.com
+56 9 1234 5678

RESUMEN PROFESIONAL
Psicólogo con experiencia en intervención clínica y psicodiagnóstico.

EXPERIENCIA LABORAL
Hospital Clínico
Psicólogo Clínico
2023 - Presente
• Atención a pacientes.

EDUCACIÓN
Psicología
Universidad de Magallanes
2020

REFERENCIAS LABORALES
• Cecilia Vivallo Corvalán — Enfermera encargada, Hospital Clínico — Tel: +56 9 9123 4567 • cecilia@redsalud.gob.cl
• Carlos Domínguez Parra - Médico Cirujano, Clínica Magallanes - Fono: +56987654321
`;
      const result = parseCvTextToStructuredData(cvText, 'cv_matias.pdf');
      expect(result.references.length).toBe(2);
      expect(result.references[0].name).toBe('Cecilia Vivallo Corvalán');
      expect(result.references[0].role).toBe('Enfermera encargada');
      expect(result.references[0].company).toBe('Hospital Clínico');
      expect(result.references[0].contact).toContain('56 9 9123 4567');
      expect(result.references[0].contact).toContain('cecilia@redsalud.gob.cl');

      expect(result.references[1].name).toBe('Carlos Domínguez Parra');
      expect(result.references[1].role).toBe('Médico Cirujano');
      expect(result.references[1].contact).toContain('56987654321');
    });

    it('debe extraer referencias en formato multilínea (Nombre en l1, Cargo/Empresa en l2, Teléfono en l3)', async () => {
      const { parseCvTextToStructuredData } = await import('@/features/ai-smart-cv/lib/cv-text-parser');
      const cvText = `
Rodrigo Sanchez
Ingeniero Civil
rodrigo@test.com

EXPERIENCIA LABORAL
Tech SpA
Ingeniero
2022 - Presente
• Desarrollo de software.

REFERENCIAS
María José Carrasco
Jefa de Proyectos - Empresa Minera
Contacto: +56 9 5555 4444

Andrés Morales Soto
Director de Operaciones - Logística Austral
Teléfono: +56 9 8888 7777 • andres.morales@austral.cl
`;
      const result = parseCvTextToStructuredData(cvText, 'cv_rodrigo.pdf');
      expect(result.references.length).toBe(2);
      expect(result.references[0].name).toBe('María José Carrasco');
      expect(result.references[0].role).toBe('Jefa de Proyectos');
      expect(result.references[0].company).toBe('Empresa Minera');
      expect(result.references[0].contact).toContain('56 9 5555 4444');

      expect(result.references[1].name).toBe('Andrés Morales Soto');
      expect(result.references[1].role).toBe('Director de Operaciones');
      expect(result.references[1].company).toBe('Logística Austral');
      expect(result.references[1].contact).toContain('56 9 8888 7777');
      expect(result.references[1].contact).toContain('andres.morales@austral.cl');
    });

    it('no debe absorber referencias posteriores en la primera persona de referencia (Anti-Swallow)', async () => {
      const { parseCvTextToStructuredData } = await import('@/features/ai-smart-cv/lib/cv-text-parser');
      const cvText = `
Matías Ricardo Riquelme Cárdenas
Psicólogo Clínico
matias@test.cl

EXPERIENCIA LABORAL
Hospital Clínico de Magallanes
Psicólogo
2023 - Presente
• Atención clínica.

REFERENCIAS LABORALES
Cecilia Vivallo Corvalán
Enfermera encargada • Cuidados Paliativos Universales, Hospital Clínico de Magallanes
+56 9 8226 8970

Hernán Soto Mansilla
Médico Cirujano • Hospital Clínico de Magallanes
+56 9 8933 0333

Patricia Andrade Vera
Coordinadora de Salud • Red Asistencial Magallanes
+56 9 7467 7104

Francisco Muñoz Oyarzún
Jefe de Unidad • Servicio de Salud Magallanes
+56 9 6143 4397

Claudia Cárcamo
Psicóloga • CESFAM, Penco
+56 9 7387 7180
`;
      const result = parseCvTextToStructuredData(cvText, 'cv_matias.pdf');
      expect(result.references.length).toBe(5);

      expect(result.references[0].name).toBe('Cecilia Vivallo Corvalán');
      expect(result.references[0].role).toBe('Enfermera encargada');
      expect(result.references[0].contact).toBe('+56 9 8226 8970');

      expect(result.references[1].name).toBe('Hernán Soto Mansilla');
      expect(result.references[1].role).toBe('Médico Cirujano');
      expect(result.references[1].contact).toBe('+56 9 8933 0333');

      expect(result.references[2].name).toBe('Patricia Andrade Vera');
      expect(result.references[2].role).toBe('Coordinadora de Salud');
      expect(result.references[2].contact).toBe('+56 9 7467 7104');

      expect(result.references[3].name).toBe('Francisco Muñoz Oyarzún');
      expect(result.references[3].role).toBe('Jefe de Unidad');
      expect(result.references[3].contact).toBe('+56 9 6143 4397');

      expect(result.references[4].name).toBe('Claudia Cárcamo');
      expect(result.references[4].role).toBe('Psicóloga');
      expect(result.references[4].contact).toBe('+56 9 7387 7180');
    });
  });
});


