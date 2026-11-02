import { describe, it, expect } from 'vitest';
import { extractTextFromDocxArrayBuffer, parseWordXmlToPlainText } from '@/shared/lib/docxTextExtractor';
import { validateFileSignature } from '@/shared/lib/fileSecurity';
import { sanitizeCvForPublicView, CVFormValues } from '@/entities/cv/schemas';
import { sanitizeAndGroundAiBullet } from '@/features/ai-smart-cv/lib/cv-quality-engine';
import { calculateCvPageDistribution } from '@/features/ai-smart-cv/lib/cv-layout';

describe('INDI Smart CV - Universal Extraction, Security & Privacy 2026', () => {
  describe('Word (.docx) Native Extraction & File Security', () => {
    it('parseWordXmlToPlainText procesa párrafos, quiebres de línea y decodifica entidades XML', () => {
      const sampleXml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p><w:r><w:t>Rodrigo Morales Cárdenas</w:t></w:r></w:p>
            <w:p><w:r><w:t>Psicólogo Clínico &amp; Terapeuta</w:t></w:r></w:p>
            <w:p>
              <w:r><w:t>Experiencia en salud pública</w:t><w:br/><w:t>Atención de más de 120 pacientes al mes.</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>
      `;

      const text = parseWordXmlToPlainText(sampleXml);
      expect(text).toContain('Rodrigo Morales Cárdenas');
      expect(text).toContain('Psicólogo Clínico & Terapeuta');
      expect(text).toContain('Atención de más de 120 pacientes al mes.');
    });

    it('validateFileSignature reconoce cabecera ZIP de .docx y valida extensión de Word', () => {
      // Cabecera estándar ZIP PK\x03\x04
      const zipHeader = new Uint8Array([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
      const result = validateFileSignature(zipHeader, 'curriculum_vitae.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('docx');
    });
  });

  describe('Privacidad de Datos Personales (Ley N° 21.719 Chile)', () => {
    const rawCv: CVFormValues = {
      title: 'CV Matías Riquelme',
      targetRole: 'Psicólogo Clínico',
      slug: 'matias-riquelme',
      isPublic: true,
      templateId: 'executive-modern',
      content: {
        fullName: 'Matías Riquelme',
        email: 'matias@test.cl',
        phone: '+56 9 1234 5678',
        location: 'Punta Arenas, Chile',
        rut: '18.492.041-K',
        summary: 'Resumen profesional...',
        skills: ['Clínica', 'Diagnóstico'],
        experience: [],
        education: [],
        references: [
          {
            name: 'Cecilia Vivallo Corvalán',
            role: 'Enfermera encargada',
            company: 'Hospital Clínico',
            contact: '+56 9 8226 8970 • cecilia@hospital.cl',
          },
          {
            name: 'Carlos Domínguez Parra',
            role: 'Jefe de Reinserción',
            company: 'Gendarmería',
            contact: '+56 9 8933 0333',
          },
        ],
        showRutOnPublic: false,
        showReferenceContactsOnPublic: false,
        credentials: [],
        signatureType: 'NONE',
      },
    };

    it('sanitizeCvForPublicView oculta por defecto el RUT y ofusca teléfonos de terceros', () => {
      const publicCv = sanitizeCvForPublicView(rawCv);

      // RUT debe estar indefinido
      expect(publicCv.content.rut).toBeUndefined();

      // Contactos de terceros deben estar ofuscados
      expect(publicCv.content.references?.[0].contact).toBe('[Disponible a solicitud]');
      expect(publicCv.content.references?.[1].contact).toBe('[Disponible a solicitud]');
    });

    it('sanitizeCvForPublicView respeta cuando el usuario habilita explícitamente mostrar RUT o referencias', () => {
      const customPrivacyCv: CVFormValues = {
        ...rawCv,
        content: {
          ...rawCv.content,
          showRutOnPublic: true,
          showReferenceContactsOnPublic: true,
        },
      };

      const publicCv = sanitizeCvForPublicView(customPrivacyCv);
      expect(publicCv.content.rut).toBe('18.492.041-K');
      expect(publicCv.content.references?.[0].contact).toContain('8226 8970');
    });
  });

  describe('Grounding Guard & Limpieza de Placeholders de IA', () => {
    it('elimina corchetes residuales de plantilla como [especificar volumen] o [añadir métrica]', () => {
      const rawAiSuggestion = 'Lideré la atención a pacientes terminales [especificar volumen o mejora lograda], optimizando los procesos en cuidados paliativos [añadir métrica de impacto].';
      const result = sanitizeAndGroundAiBullet(rawAiSuggestion, 'Atención a pacientes terminales en cuidados paliativos.');

      expect(result.cleanText).not.toContain('[especificar');
      expect(result.cleanText).not.toContain('[añadir');
      expect(result.cleanText).toContain('Lideré la atención a pacientes terminales, optimizando los procesos en cuidados paliativos.');
    });
  });

  describe('Paginación Dinámica A4 de Múltiples Hojas', () => {
    it('calcula totalPages y distribuye ordenadamente sin desbordamiento', () => {
      const multiJobCv: CVFormValues = {
        title: 'CV Extenso',
        targetRole: 'Psicólogo Especialista',
        slug: 'psicologo-extenso',
        templateId: 'executive-modern',
        content: {
          fullName: 'Docente Especialista',
          email: 'docente@test.cl',
          phone: '+56 9 9999 8888',
          location: 'Chile',
          summary: 'Trayectoria extensa de más de 15 años...',
          skills: ['Habilidad 1', 'Habilidad 2', 'Habilidad 3', 'Habilidad 4', 'Habilidad 5'],
          experience: Array.from({ length: 6 }).map((_, i) => ({
            role: `Cargo ${i + 1}`,
            company: `Institución ${i + 1}`,
            period: '2020 - 2024',
            bullets: [
              'Logro relevante con impacto verificable en la organización.',
              'Implementación de procesos conforme a estándares internacionales.',
              'Coordinación de equipos multidisciplinarios y entrega de informes.',
            ],
            detailedBullets: [
              { text: 'Logro relevante con impacto verificable en la organización.', needs_metric: false },
              { text: 'Implementación de procesos conforme a estándares internacionales.', needs_metric: false },
              { text: 'Coordinación de equipos multidisciplinarios y entrega de informes.', needs_metric: false },
            ],
          })),
          education: Array.from({ length: 4 }).map((_, i) => ({
            degree: `Diplomado ${i + 1}`,
            institution: `Universidad ${i + 1}`,
            year: `202${i}`,
            credentialType: 'DIPLOMA' as const,
          })),
          credentials: [],
          signatureType: 'NONE' as const,
          references: [],
        },
      };

      const distribution = calculateCvPageDistribution(multiJobCv);
      expect(distribution.needsTwoPages).toBe(true);
      expect(distribution.totalPages).toBeGreaterThanOrEqual(2);
      expect(distribution.page1Experiences.length).toBeGreaterThan(0);
      expect(distribution.page2Experiences.length).toBeGreaterThan(0);
    });
  });
});
