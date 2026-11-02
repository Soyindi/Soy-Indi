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

  describe('Enriquecimiento Forense de Fechas de Educación y Reparación Sintáctica (Noviembre 2026)', () => {
    it('enrichEducationDatesFromCertificates reemplaza "No especificado", preserva rangos "2013 – 2018" y extrae años reales de certificados SENCE, SENDA, OPS, WISC-V y DD.HH.', async () => {
      const { enrichEducationDatesFromCertificates, extractDateFromCertificateBlock } = await import(
        '@/features/ai-smart-cv/lib/multimodal-parser'
      );

      // Verificar formatos complejos individuales de certificados chilenos e internacionales
      expect(extractDateFromCertificateBlock('Certificado de Participación • abril 10, 2019 • SENDA')).toBe('2019');
      expect(
        extractDateFromCertificateBlock(
          'Redacción de informes tecnicos\nFecha de Término Curso 02-06-2023\nSantiago, 19 de Noviembre de 2024'
        )
      ).toBe('2023');
      expect(
        extractDateFromCertificateBlock(
          'Curso Virtual Derechos de los Niños, Niñas y Adolescentes desarrollado entre el 19/05/25 y el 09/06/25.'
        )
      ).toBe('2025');

      // Simular documento completo (Cuerpo del CV + Anexos de Certificados separados por salto de página)
      const fullDocumentText = [
        `MATÍAS RICARDO RIQUELME CÁRDENAS
Psicólogo Clínico
FORMACIÓN ACADÉMICA
Universidad de Magallanes, Chile • 2013 – 2018
Título de Psicólogo • Licenciado en Psicología
_____________________
Matías Ricardo Riquelme Cárdenas · RUT 18.209.442-0`,
        `--- PÁGINA 6 ---
Certificado de Participación
Prevención del Consumo de Drogas y Alcohol en el Mundo Laboral
SENDA • abril 10, 2019`,
        `--- PÁGINA 7 ---
SENCE • Servicio Nacional de Capacitación y Empleo
Nombre Curso: Redacción de informes tecnicos
Fecha de Término Curso 02-06-2023
Santiago, 19 de Noviembre de 2024`,
        `--- PÁGINA 9 ---
“Ed ucation Business Group, I nc.”
“ Formación en la prueba de inteligencia WISC - V ”
05 de marzo del 2021`,
        `--- PÁGINA 10 ---
Organización Panamericana de la Salud (OPS)
Prevención de la autolesión y el suicidio: empoderamiento de los profesionales de atención primaria de salud
12 de enero de 2020`,
        `--- PÁGINA 11 ---
Organización Panamericana de la Salud (OPS)
Salud de la Mujer y el Embarazo: enfoques integrales para una maternidad segura
12 de enero de 2020`,
        `--- PÁGINA 12 ---
Certificado de Participación
Detección Temprana
SENDA • 13 enero 2020`,
        `--- PÁGINA 13 ---
La Subsecretaría de Derechos Humanos otorga el presente certificado de aprobación a:
Por haber participado y completado con éxito el curso de Derechos de los Niños, Niñas y Adolescentes
desarrollado entre el 19/05/25 y el 09/06/25.`,
        `--- PÁGINA 14 ---
Matías Riquelme Cárdenas
15 horas cronológicas
85 %
19 de mayo de 2025
Powered by TCPDF (www.tcpdf.org)`,
      ].join('\n');

      const aiEducationWithPlaceholders = [
        {
          degree: 'Título de Psicólogo • Licenciado en Psicología (Tesis: «Sensibilidad Estacional en la Región de Magallanes»)',
          institution: 'Universidad de Magallanes, Chile',
          year: '2018',
        },
        {
          degree: 'Diplomado en Psicodiagnóstico Laboral',
          institution: 'Grupo ASCS do Agile',
          year: 'No especificado',
        },
        {
          degree: 'Elaboración de Informes Técnicos bajo el Modelo RNR',
          institution: 'SENCE',
          year: 'No especificado',
        },
        {
          degree: 'Prevención del Consumo de Drogas y Alcohol en el Mundo Laboral',
          institution: 'SENDA',
          year: 'No especificado',
        },
        {
          degree: 'Formación en WISC-V',
          institution: 'Education Business Group, Inc.',
          year: 'No especificado',
        },
        {
          degree: 'Prevención de Autolesiones y Suicidio',
          institution: 'Organización Panamericana de la Salud (OPS)',
          year: 'No especificado',
        },
        {
          degree: 'Salud de la Mujer y el Embarazo',
          institution: 'Organización Panamericana de la Salud (OPS)',
          year: 'No especificado',
        },
        {
          degree: 'Detección Temprana de consumo problemático',
          institution: 'SENDA',
          year: 'No especificado',
        },
        {
          degree: 'Derechos de los Niños, Niñas y Adolescentes',
          institution: 'Subsecretaría de los Derechos Humanos',
          year: 'No especificado',
        },
        {
          degree: 'Introducción a los Derechos Humanos',
          institution: 'Subsecretaría de los Derechos Humanos',
          year: 'No especificado',
        },
      ];

      const enriched = enrichEducationDatesFromCertificates(
        aiEducationWithPlaceholders,
        fullDocumentText,
        'Matías Ricardo Riquelme Cárdenas'
      );

      expect(enriched[0].year).toBe('2013 – 2018'); // Rango universitario completo restaurado
      expect(enriched[1].year).toBe(''); // Diplomado escaneado sin texto queda limpio (''), nunca 'No especificado'
      expect(enriched[2].year).toBe('2023'); // SENCE RNR (02-06-2023, ignorando fecha impresión 2024)
      expect(enriched[3].year).toBe('2019'); // SENDA Mundo Laboral (abril 10, 2019)
      expect(enriched[4].year).toBe('2021'); // WISC-V EBG (05 de marzo del 2021)
      expect(enriched[5].year).toBe('2020'); // OPS Autolesiones/Autolesión (12 de enero de 2020)
      expect(enriched[6].year).toBe('2020'); // OPS Salud de la Mujer (12 de enero de 2020)
      expect(enriched[7].year).toBe('2020'); // SENDA Detección Temprana (13 enero 2020)
      expect(enriched[8].year).toBe('2025'); // DD.HH. NNA (09/06/25 -> 2025)
      expect(enriched[9].year).toBe('2025'); // DD.HH. Introducción (certificado TCPDF hermano -> 2025)
    });

    it('auditAndRepairCvExtraction repara "con más de cinco trayectoria" a "con más de cinco años de trayectoria" y limpia "No especificado"', async () => {
      const { auditAndRepairCvExtraction } = await import('@/features/ai-smart-cv/lib/cv-auditor');

      const brokenExtraction = {
        fullName: 'Matías Ricardo Riquelme Cárdenas',
        email: 'psriquelme.m@gmail.com',
        phone: '+56 9 2372 6707',
        location: 'Punta Arenas, Chile',
        targetRole: 'Psicólogo Clínico',
        summary: 'Psicólogo con más de cinco trayectoria en los ámbitos de salud, educación y justicia.',
        skills: ['Psicodiagnóstico', 'Modelo RNR'],
        experience: [],
        education: [
          {
            degree: 'Diplomado en Psicodiagnóstico Laboral',
            institution: 'Grupo ASCS do Agile',
            year: 'No especificado',
          },
        ],
        references: [],
      };

      const { auditedExtraction } = auditAndRepairCvExtraction(brokenExtraction);
      expect(auditedExtraction.summary).toContain('con más de cinco años de trayectoria');
      expect(auditedExtraction.education[0].year).toBe('');
    });
  });
});
