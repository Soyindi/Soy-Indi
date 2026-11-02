import { describe, it, expect } from 'vitest';
import { jsPDF } from 'jspdf';
import { extractSpatialTextFromPdf } from '@/shared/lib/spatialDocumentExtractor';
import { parseCvTextToStructuredData } from '@/features/ai-smart-cv/lib/cv-text-parser';
import { analyzeDocumentContent } from '@/features/orbital-presentations/lib/document-parser';

describe('Spatial Document Extraction & Semantic Intelligence Pipeline (INDI 2026)', () => {
  describe('extractSpatialTextFromPdf (Two-Column Layout Separation)', () => {
    it('debe separar limpiamente dos columnas sin mezclar oraciones de izquierda con derecha', async () => {
      const doc = new jsPDF();
      // Simular un PDF de dos columnas:
      // Columna Izquierda (x: 20): Habilidades y contacto
      doc.text('HABILIDADES TÉCNICAS', 20, 30);
      doc.text('React & Next.js', 20, 40);
      doc.text('TypeScript Estricto', 20, 50);

      // Columna Derecha (x: 120): Experiencia laboral
      doc.text('EXPERIENCIA LABORAL', 120, 30);
      doc.text('Lead Architect en Tech Corp', 120, 40);
      doc.text('Lideré equipo de 12 ingenieros', 120, 50);

      const arrayBuffer = doc.output('arraybuffer');
      const uint8 = new Uint8Array(arrayBuffer);

      const extracted = await extractSpatialTextFromPdf(uint8);

      expect(extracted).toBeTruthy();
      // Ambas columnas deben existir en el texto resultante
      expect(extracted).toContain('HABILIDADES TÉCNICAS');
      expect(extracted).toContain('EXPERIENCIA LABORAL');
      expect(extracted).toContain('TypeScript Estricto');
      expect(extracted).toContain('Lead Architect en Tech Corp');

      // Validar que no se mezclaron horizontalmente en la misma línea
      const lines = extracted.split('\n').map((l) => l.trim()).filter(Boolean);
      const mixedLine = lines.find((l) => l.includes('React') && l.includes('Lead Architect'));
      expect(mixedLine).toBeUndefined();
    });

    it('debe manejar PDFs estándar de una columna con orden secuencial natural', async () => {
      const doc = new jsPDF();
      doc.text('TÍTULO DEL DOCUMENTO', 20, 30);
      doc.text('Párrafo 1 con contenido descriptivo.', 20, 45);
      doc.text('Párrafo 2 con conclusiones clave.', 20, 60);

      const arrayBuffer = doc.output('arraybuffer');
      const uint8 = new Uint8Array(arrayBuffer);

      const extracted = await extractSpatialTextFromPdf(uint8);

      expect(extracted).toContain('TÍTULO DEL DOCUMENTO');
      expect(extracted).toContain('Párrafo 1');
      expect(extracted).toContain('Párrafo 2');
    });
  });

  describe('Smart CV Parser (Non-Truncated Achievement Preservation)', () => {
    it('no debe cortar logros ni crear cargos fantasma cuando una viñeta menciona años históricos', () => {
      const cvText = `
Gonzalo Medina
Arquitecto Cloud
gonzalo@tech.cl

EXPERIENCIA LABORAL
Cloud Consulting SpA
Arquitecto de Soluciones
2022 - Presente
• En 2023 lideré la migración completa a microservicios reduciendo costos en 40%.
• Durante 2024 implementé arquitectura serverless en AWS con latencia sub-50ms.
• Diseñé plataforma distribuida para 100.000 usuarios concurrentes.

EDUCACIÓN
Ingeniería Civil Informática
Universidad de Chile
2021
`;
      const result = parseCvTextToStructuredData(cvText, 'gonzalo_cv.pdf');

      expect(result.experience.length).toBe(1);
      expect(result.experience[0].company).toBe('Cloud Consulting SpA');
      expect(result.experience[0].role).toBe('Arquitecto de Soluciones');
      // Debe contener los 3 logros sin haber creado cargos ficticios para "En 2023" o "Durante 2024"
      expect(result.experience[0].rawAchievements.length).toBe(3);
      expect(result.experience[0].rawAchievements[0]).toContain('2023 lideré la migración');
      expect(result.experience[0].rawAchievements[1]).toContain('2024 implementé arquitectura');
    });
  });

  describe('Orbital Presentation Document Parser (Topic Density Clustering)', () => {
    it('debe generar secciones semánticas agrupadas por densidad temática sin cortes arbitrarios', () => {
      const documentText = `
# PLAN ESTRATÉGICO INDI 2026

## 1. Diagnóstico de Infraestructura
La infraestructura anterior presentaba latencias considerables y costos elevados por transferencias de datos.
Se requería modernización hacia el Edge con Cloudflare R2 y Turso LibSQL.

## 2. Propuesta Tecnológica
Implementamos arquitectura Feature-Sliced Design unidireccional estricta.
La autenticación Better-Auth permite escalabilidad total sin cobros por usuario activo.

## 3. Métricas y Resultados
Reducción de costos de infraestructura en 85%.
Latencia reducida a 15ms en lecturas perimetrales.
Cumplimiento normativo del 100% frente a la EU AI Act y SERNAC.
`;

      const analysis = analyzeDocumentContent(documentText, 'estrategia.md');

      expect(analysis.detectedArchetype).toBeDefined();
      expect(analysis.titleSuggestion).toContain('PLAN ESTRATÉGICO INDI 2026');
      expect(analysis.semanticSections.length).toBeGreaterThanOrEqual(2);

      // Verificar que se extrajeron métricas correctamente
      expect(analysis.hasMetrics).toBe(true);
      const costMetric = analysis.detectedMetrics.find((m) => m.value.includes('85%') || m.value.includes('15ms'));
      expect(costMetric).toBeDefined();
    });
  });

  describe('Edge-case CV Ingestion: Independent Technical Projects & Education Sanitization', () => {
    it('debe estructurar proyectos independientes sin partir viñetas ni separar URLs huérfanas', () => {
      const technicalCvText = `
Matías Riquelme
Ingeniero de Software
contacto@matias.cl

EXPERIENCIA LABORAL
PROYECTOS DE DESARROLLO TECNOLÓGICO (AUTODIDACTA)
ClicLaboral
• Plataforma de empleo descentralizada con contratos inteligentes
y encadenamiento criptográfico para auditoría de postulaciones
https://github.com/matias/cliclaboral

ContaPymePuq
• Software de facturación electrónica y gestión contable para pymes de Magallanes
https://github.com/matias/contapyme

EDUCACIÓN
ESPECIALIZACIONES Y FORMACIÓN COMPLEMENTARIA
• Diplomado en Psicodiagnóstico Laboral - Adipa (2024)
• Formación en WISC-V · Centro de Neurociencias (2023)
`;

      const result = parseCvTextToStructuredData(technicalCvText, 'cv_tecnico.pdf');

      // Validar Proyectos
      expect(result.experience.length).toBeGreaterThanOrEqual(2);
      const clicProject = result.experience.find((e) => e.role.includes('ClicLaboral'));
      expect(clicProject).toBeDefined();
      expect(clicProject?.company).toContain('Proyectos');
      // Debe haber concatenado la descripción multilínea con la URL en lugar de crear 3 viñetas separadas
      expect(clicProject?.xyzBullets[0].text).toContain('contratos inteligentes y encadenamiento');
      expect(clicProject?.xyzBullets[0].text).toContain('https://github.com/matias/cliclaboral');

      // Validar Educación: NO debe crear un grado universitario para el subtítulo "ESPECIALIZACIONES Y FORMACIÓN COMPLEMENTARIA"
      const fakeDegree = result.education.find((e) => e.degree.toLowerCase().includes('especializaciones y formación'));
      expect(fakeDegree).toBeUndefined();

      // Debe extraer Adipa como institución en el diplomado
      const adipaEdu = result.education.find((e) => e.degree.includes('Diplomado en Psicodiagnóstico'));
      expect(adipaEdu).toBeDefined();
      expect(adipaEdu?.institution.toLowerCase()).toContain('adipa');
    });

    it('debe extraer educación formal y cursos de secciones independientes y preservar teléfonos reales en referencias', () => {
      const cvConCursosYReferencias = `
Matías Riquelme
Psicólogo Clínico
matias@psicologia.cl
+56 9 8226 8970

EXPERIENCIA LABORAL
Psicólogo Clínico en Hospital Clínico Magallanes
2021 - 2024
• Realicé intervenciones en cuidados paliativos

EDUCACIÓN FORMAL
• Título de Psicólogo • Licenciado en Psicología · Universidad de Magallanes (2018)

CURSOS Y FORMACIÓN CONTINUA
• Curso de Cuidados Paliativos y Acompañamiento en Duelo · OPS (2023)
• Diplomado en Evaluación Pericial Psicológica · Adipa (2022)

REFERENCIAS LABORALES
Cecilia Vivallo Corvalán
Enfermera encargada, Cuidados Paliativos Universales · Hospital Clínico de Magallanes
Contacto: +56 9 8226 8970

Carlos Domínguez Parra
Jefe de Reinserción Social · Complejo Penitenciario Biobío
Contacto: +56 9 9876 5432

Marisol Cárcamo
Coordinadora del Área Psicosocial · Sodexo Biobío
Contacto: +56 9 1122 3344
`;

      const result = parseCvTextToStructuredData(cvConCursosYReferencias, 'cv_completo.pdf');

      // 1. Debe extraer el título universitario y ambos cursos/diplomados
      expect(result.education.length).toBeGreaterThanOrEqual(3);
      expect(result.education.some((e) => e.degree.includes('Psicólogo'))).toBe(true);
      expect(result.education.some((e) => e.degree.includes('Cuidados Paliativos'))).toBe(true);
      expect(result.education.some((e) => e.degree.includes('Evaluación Pericial'))).toBe(true);

      // 2. Debe extraer las 3 referencias con sus números de teléfono reales (cero [TELEFONO_PROTEGIDO])
      expect(result.references.length).toBe(3);
      for (const ref of result.references) {
        expect(ref.contact).not.toContain('PROTEGIDO');
        expect(ref.contact).toMatch(/\+?56\s?9\s?\d{4}\s?\d{4}/);
      }
      expect(result.references[0].contact).toContain('8226');
      expect(result.references[1].contact).toContain('9876');
      expect(result.references[2].contact).toContain('1122');
    });

    it('debe aislar el CV de certificados anexos, extrayendo los 11 cursos y las 5 referencias completas (incluyendo Claudia Cárcamo)', () => {
      const cvConCertificadosAnexos = `
Matías Ricardo Riquelme Cárdenas
Psicólogo · Intervención Clínica y Psicosocial | Desarrollo de Sistemas e IA (autodidacta)
psriquelme.m@gmail.com · +56 9 2372 6707 · linkedin.com/in/matiriquelme
Residencia: Punta Arenas, Chile · Edad: 33 años · Estado civil: Soltero

PERFIL PROFESIONAL
Psicólogo con más de cinco años de trayectoria en los ámbitos de salud, educación y justicia.

EXPERIENCIA PROFESIONAL
Psicólogo de Reinserción Social · Complejo Penitenciario Biobío – Concepción
Dic. 2021 – Mar. 2022 | Ene. 2023 – Nov. 2024 · (Justice Services Sodexo)
● Evaluación psico-criminológica y redacción de informes técnicos.
● Diseño y aplicación del Modelo RNR.

Psicólogo (Reemplazante) · Programa de Cuidados Paliativos Universales – Hospital Clínico de Magallanes
Ene. 2025 – Mar. 2025
● Apoyo psicológico a pacientes crónicos y terminales.

EDUCACIÓN
Título de Psicólogo · Licenciado en Psicología · Universidad de Magallanes, Chile
2013 – 2018
Tesis: «Sensibilidad Estacional en la Región de Magallanes»

ESPECIALIZACIONES Y FORMACIÓN COMPLEMENTARIA
Área laboral / forense
● Diplomado en Psicodiagnóstico Laboral – Grupo ASCS do Agile.
● Elaboración de Informes Técnicos bajo el Modelo RNR – Certificado por SENCE.
● Prevención del Consumo de Drogas y Alcohol en el Mundo Laboral – SENDA.
Evaluación y clínica
● Formación en WISC-V – Education Business Group, Inc.
● Primeros Auxilios Psicológicos – Universidad de Magallanes.
● Prevención de Autolesiones y Suicidio – OPS / Organización Panamericana de la Salud.
● Salud de la Mujer y el Embarazo – Organización Panamericana de la Salud.
● Detección Temprana de consumo problemático – SENDA.
Derechos y marco legal
● Derechos de los Niños, Niñas y Adolescentes – Subsecretaría de los Derechos Humanos.
● Introducción a los Derechos Humanos – Subsecretaría de los Derechos Humanos.

REFERENCIAS PROFESIONALES
Cecilia Vivallo Corvalán — Enfermera encargada, Cuidados Paliativos Universales, Hospital Clínico de Magallanes · +56 9 8226 8970
Carlos Domínguez Parra — Jefe de Reinserción Social, Justice Services Sodexo, Complejo Penitenciario Biobío · +56 9 8933 0333
Marisol Cárcamo — Coordinadora del Área Psicosocial, Justice Services Sodexo, Complejo Penitenciario Biobío · +56 9 7467 7104
Jannette Pantoja — Inspectora General, Escuela Almirante Jorge Montt Álvarez, Penco · +56 9 6143 4397
Claudia Cárcamo — Psicóloga, CESFAM, Penco · +56 9 7387 7180
_____________________
Matías Ricardo Riquelme Cárdenas · RUT 18.209.442-0

Se confiere el presente Diploma a:
Matías Ricardo Riquelme Cárdenas
Diplomado en Psicodiagnóstico Laboral
Santiago, 08 de junio de 2019

Fecha de Término Curso 02-06-2023
Natural de República de Chile, aprobo el Curso Online Internacional denominado:
Formación en la prueba de Inteligencia WISC - V
Para verificar la autenticidad del certificado debes ingresar el código de validez en el siguiente link:
https://ebg.ec/verificacion
Certificado de Participación
ha participado y aprobado el Curso de autoaprendizaje en línea:
La autenticidad de este certificado se puede verificar en:
CERTIFICADO DE FINALIZACIÓN
ha completado el curso
La Subsecretaría de Derechos Humanos otorga el presente certificado de aprobación a:
Por haber participado y completado con éxito el curso de
Realizado en modalidad de formación a distancia e-learning. Tuvo una duración de 20 horas.
`;

      const result = parseCvTextToStructuredData(cvConCertificadosAnexos, 'cv_14_paginas.pdf');

      // 1. Debe haber extraído exactamente 11 elementos de educación (1 título universitario + 10 cursos/especializaciones)
      expect(result.education.length).toBe(11);
      expect(result.education[0].degree).toContain('Psicólogo');
      expect(result.education.some((e) => e.degree.includes('Autolesiones y Suicidio'))).toBe(true);
      expect(result.education.some((e) => e.degree.includes('WISC-V'))).toBe(true);
      expect(result.education.some((e) => e.degree.includes('Derechos de los Niños'))).toBe(true);

      // 2. Ningún texto administrativo de diplomas anexos debe colarse como título
      expect(result.education.some((e) => e.degree.includes('Fecha de Término'))).toBe(false);
      expect(result.education.some((e) => e.degree.includes('Natural de República'))).toBe(false);
      expect(result.education.some((e) => e.degree.includes('Para verificar la autenticidad'))).toBe(false);
      expect(result.education.some((e) => e.degree.includes('Evaluación y clínica'))).toBe(false);
      expect(result.education.some((e) => e.degree.includes('Área laboral'))).toBe(false);

      // 3. Debe extraer las 5 referencias completas incluyendo a Claudia Cárcamo
      expect(result.references.length).toBe(5);
      const names = result.references.map((r) => r.name);
      expect(names).toContain('Cecilia Vivallo Corvalán');
      expect(names).toContain('Carlos Domínguez Parra');
      expect(names).toContain('Marisol Cárcamo');
      expect(names).toContain('Jannette Pantoja');
      expect(names).toContain('Claudia Cárcamo');

      // 4. Cada referencia debe tener su teléfono celular chileno real y cero [TELEFONO_PROTEGIDO]
      for (const ref of result.references) {
        expect(ref.contact).not.toContain('PROTEGIDO');
        expect(ref.contact).toMatch(/\+?56\s?9\s?\d{4}\s?\d{4}/);
      }
      expect(result.references.find((r) => r.name.includes('Claudia'))?.contact).toContain('7387 7180');
      expect(result.references.find((r) => r.name.includes('Carlos'))?.contact).toContain('8933 0333');
    });

    it('debe fusionar defensivamente todas las experiencias si la IA colapsa en un solo cargo', async () => {
      const { parseCvTextWithAiCascade } = await import('@/features/ai-smart-cv/lib/multimodal-parser');
      const cvTextConMultiplesCargos = `
Matías Ricardo Riquelme Cárdenas
Psicólogo Clínico
psriquelme.m@gmail.com · +56 9 2372 6707

EXPERIENCIA PROFESIONAL
Psicólogo de Reinserción Social · Complejo Penitenciario Biobío
Dic. 2021 – Nov. 2024
● Evaluación psico-criminológica y redacción de informes técnicos.
● Diseño y aplicación del Modelo RNR.

Psicólogo (Reemplazante) · Hospital Clínico de Magallanes
Ene. 2025 – Mar. 2025
● Apoyo psicológico a pacientes crónicos y terminales.

Psicólogo – PIE y Convivencia Escolar · Escuela Almirante Jorge Montt Álvarez
Mar. 2021 – Dic. 2022
● Evaluación y seguimiento de estudiantes con NEE.

EDUCACIÓN
Título de Psicólogo · Universidad de Magallanes (2018)
● Diplomado en Psicodiagnóstico Laboral · Grupo ASCS do Agile (2019)

REFERENCIAS PROFESIONALES
Carlos Domínguez Parra — Jefe de Reinserción · Sodexo · +56 9 8933 0333
Marisol Cárcamo — Coordinadora · Sodexo · +56 9 7467 7104
`;

      const result = await parseCvTextWithAiCascade(cvTextConMultiplesCargos, 'cv_test.pdf');

      // Debe preservar los 3 cargos de experiencia laboral
      expect(result.experience.length).toBeGreaterThanOrEqual(3);
      expect(result.experience.some((e) => e.role.includes('Reinserción'))).toBe(true);
      expect(result.experience.some((e) => e.role.includes('Hospital') || e.company.includes('Hospital') || e.role.includes('Reemplazante'))).toBe(true);
      expect(result.experience.some((e) => e.role.includes('PIE') || e.company.includes('Escuela'))).toBe(true);

      // Debe preservar las 2 referencias con números distintos
      expect(result.references.length).toBe(2);
      expect(result.references[0].contact).toContain('8933 0333');
      expect(result.references[1].contact).toContain('7467 7104');
    });
  });
});
