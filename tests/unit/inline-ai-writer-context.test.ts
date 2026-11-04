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

  it('detecta perfiles multidisciplinarios y purga la fusión causal alucinada entre desarrollo de software y registros clínicos en el Resumen', async () => {
    const { verifyAndPurgeCrossRoleContamination } = await import('@/features/ai-smart-cv/lib/cv-quality-engine');
    const { evaluateCvPreRouteStrategy } = await import('@/features/ai-smart-cv/lib/cv-auditor');

    const sourceSummary =
      'Psicólogo con más de cinco años de trayectoria en los ámbitos de salud, educación y justicia. A esta formación clínica sumo competencias autodidactas en desarrollo de software, arquitecturas de datos seguras e inteligencia artificial, con sistemas reales en producción orientados a la optimización de procesos.';

    const preRoute = evaluateCvPreRouteStrategy(
      `${sourceSummary} Python TypeScript FastAPI`,
      'Psicólogo · Intervención Clínica y Psicosocial | Desarrollo de Sistemas e IA'
    );

    expect(preRoute.isMultidisciplinary).toBe(true);
    expect(preRoute.secondaryArchetype).toBeDefined();

    const hallucinatedSummary =
      'Psicólogo Clínico con más de cinco años de trayectoria en los sectores de salud, educación y justicia. Integra la práctica clínica basada en la ética profesional con competencias avanzadas en desarrollo de software y arquitectura de datos segura, optimizando la gestión de registros clínicos y automatizando procesos para garantizar la continuidad operativa y la calidad en la atención integral.';

    const purged = verifyAndPurgeCrossRoleContamination(
      hallucinatedSummary,
      sourceSummary,
      'Psicólogo · Intervención Clínica y Psicosocial | Desarrollo de Sistemas e IA'
    );

    expect(purged.hadContamination).toBe(true);
    expect(purged.cleanText).not.toMatch(/optimizando la gestión de registros clínicos/i);
    expect(purged.cleanText).toContain('proyectos tecnológicos propios en producción');
  });

  it('extrae limpiamente los 8 proyectos tecnológicos con sus nombres/URLs, normaliza glifos Wingdings "l " y no crea falsos cargos con "Arquitectura:" o "Ley 19.628"', async () => {
    const { parseCvTextToStructuredData } = await import('@/features/ai-smart-cv/lib/cv-text-parser');

    const rawFourPageCv = `Matías Ricardo Riquelme Cárdenas
Psicólogo · Intervención Clínica y Psicosocial | Desarrollo de Sistemas e IA (autodidacta)
psriquelme.m@gmail.com · +56 9 2372 6707 o 61 2 252592 · linkedin.com/in/matiriquelme
PERFIL PROFESIONAL
Psicólogo con más de cinco años de trayectoria en los ámbitos de salud, educación y justicia.
EXPERIENCIA PROFESIONAL
Psicólogo de Reinserción Social · Complejo Penitenciario Biobío – Concepción
Dic. 2021 – Mar. 2022 | Ene. 2023 – Nov. 2024 · (Justice Services Sodexo)
l Evaluación psico-criminológica y redacción de informes técnicos para procesos judiciales y administrativos.
l Diseño y aplicación del Modelo RNR en intervenciones individuales y grupales orientadas a reducir la reincidencia.
Psicólogo (Reemplazante) · Programa de Cuidados Paliativos Universales – Hospital Clínico de Magallanes
Ene. 2025 – Mar. 2025
l Apoyo psicológico a pacientes con enfermedades crónicas y terminales, y a sus cuidadores.
Psicólogo – PIE y Convivencia Escolar · Escuela Almirante Jorge Montt Álvarez – Penco
Mar. 2021 – Nov. 2021 | Abr. 2022 – Dic. 2022
l Evaluación, diagnóstico y seguimiento de estudiantes con necesidades educativas especiales (NEE).
Psicólogo (Reemplazante) · CESFAM – Penco
Sep. 2019 – Dic. 2019
l Evaluaciones diagnósticas, intervenciones psicológicas y seguimiento de casos.
Psicólogo Practicante · Secretaría Regional Ministerial de Salud Magallanes
May. 2018 – Dic. 2018
l Colaboración con Gendarmería de Chile, Geopark y el Ministerio de Desarrollo Social.
PROYECTOS DE DESARROLLO TECNOLÓGICO (AUTODIDACTA · 2024–2026)
Diseño e implementación autónoma de plataformas con tecnologías de producción, base del proyecto de investigación ERBE (Ecosistema
de Rehabilitación Basado en Evidencia):
Soyindi (INDI) · soyindi.cl
Plataforma SaaS de identidad digital: tarjeta digital, Smart CV con ATS y programa de afiliados. Next.js 16, React 19, TypeScript, Tailwind CSS v4, Drizzle
ORM + Turso, Better-Auth, Cloudflare R2, Upstash Redis y Vercel.
l Tarjeta digital: perfiles públicos con código QR, vCard 4.0 con foto, pase de Google Wallet.
Joyas JP · joyasjp.cl
E-commerce de joyería urbana y plata Ley 925. Next.js 14, TypeScript, Drizzle ORM + Turso, Zod v4, Flow.cl.
l Administración protegida con sesiones JWT en cookie HttpOnly.
Salón Marilyn Monroe · salonmarilynmonroe.cl
Plataforma de agendamiento y gestión para salón de peluquería. Next.js 14, Drizzle ORM + Turso, Tailwind CSS, Cloudinary.
l Agendamiento multi-colaboradora con motor de fases.
Casa Aira Boutique · casaaira.cl
E-commerce de vestidos de alta costura (tallas XS a 6XL). Next.js 16, React 19, TypeScript, Drizzle ORM + Turso, Cloudinary, Flow.cl.
l Pasarela de pago Flow.cl con firma HMAC-SHA256.
ContaPymePUQ · contapymepuq.cl
Ecosistema contable, laboral y publicitario para pymes de Magallanes: siete módulos en una sola plataforma, operativa con 37 organizaciones cliente, 189
colaboradores y 400 liquidaciones. Next.js 16, React 19, TypeScript, FastAPI (Python 3.12), Supabase/PostgreSQL con RLS multi-tenant, Mercado Pago.
l Contabilidad y tributario: facturación electrónica DTE ante el SII (facturas, boletas, guías), órdenes de compra convertibles a factura,
conciliación bancaria con encadenamiento SHA-256 y asistente legal tributario que genera escritos al SII en Word.
l Remuneraciones: Libro de Remuneraciones Electrónico (LRE), créditos sociales CCAF y portal de autoatención laboral por WhatsApp.
l ContaEmpleos Magallanes: bolsa laboral regional de autoservicio con auditoría de cada oferta bajo el Art. 2° del Código del Trabajo.
Slingshot · github.com/matiquelmec/Slingshot
Terminal cuantitativa autónoma de análisis y ejecución algorítmica (cripto y cuentas de fondeo). Python 3.12, FastAPI, Polars, WebSocket, Next.js 15, Turso
+ Drizzle, XGBoost / ONNX, Ollama y NVIDIA NIM.
l Arquitectura: frontend Next.js 15 en Vercel (Feature-Sliced Design, multi-tenant) y motor cuantitativo en VPS 24/7, con ejecución en
Bitunix Futures y MetaTrader 5.
Visant Coffee Break · github.com/matiquelmec/Visant
Plataforma web B2B de cotización de coffee break corporativo (Punta Arenas). React 18, TypeScript, Vite, Tailwind CSS v4.
l Cotizador en tiempo real con IVA y exención de Zona Franca.
ClicLaboral · github.com/matiquelmec/ClicLaboral
Control de asistencia laboral inmutable. NestJS, Event Sourcing + CQRS, PostgreSQL con RLS.
l Encadenamiento criptográfico SHA-256 y anonimización de datos personales; traduce la Res. Exenta N°38/2024 de la Dirección del
Trabajo y la Ley 19.628 a una arquitectura auditable. github.com/matiquelmec/ClicLaboral`;

    const parsed = parseCvTextToStructuredData(rawFourPageCv, 'RIQUELME_CARDENAS_-_CV.pdf');

    // Exactamente 6 experiencias (5 psicólogo + 1 portafolio de proyectos) sin falsos cargos como "Arquitectura:" o "Trabajo y la Ley 19.628"
    expect(parsed.experience).toHaveLength(6);
    for (const exp of parsed.experience) {
      expect(exp.role).not.toMatch(/arquitectura:\s*frontend/i);
      expect(exp.role).not.toMatch(/trabajo\s+y\s+la\s+ley/i);
      for (const b of exp.xyzBullets) {
        expect(b.text).not.toMatch(/^[lL|]\s+/);
      }
    }

    const portfolioExp = parsed.experience.find((e) => e.role.includes('Proyectos de Desarrollo Tecnológico'));
    expect(portfolioExp).toBeDefined();
    expect(portfolioExp?.xyzBullets).toHaveLength(8);
    expect(portfolioExp?.xyzBullets[0].text).toContain('Soyindi (INDI)');
    expect(portfolioExp?.xyzBullets[4].text).toContain('ContaPymePUQ');
    expect(portfolioExp?.xyzBullets[5].text).toContain('Slingshot');
    expect(portfolioExp?.xyzBullets[7].text).toContain('ClicLaboral');
  });

  it('extrae al 100% el nuevo formato tabular de 4 páginas (CV Noviembre 2026) con años/horas en cursos, referencias de 4 líneas y banner desplazado', async () => {
    const { parseCvTextToStructuredData } = await import('@/features/ai-smart-cv/lib/cv-text-parser');

    const rawTabularFourPageCv = `PERFIL PROFESIONAL
Psicólogo con más de cinco años de trayectoria en salud, educación y justicia. He trabajado en contextos de alta
complejidad, como intervención penitenciaria bajo el modelo de Riesgo, Necesidad y Responsabilidad (RNR) en
Concepción y acompañamiento en fin de vida en el Hospital Clínico de Magallanes. De forma paralela y autodidacta me he
formado en desarrollo de software, arquitecturas de datos e inteligencia artificial, diseñando y manteniendo ocho sistemas
propios y para negocios de Magallanes y Chile, varios en producción, orientados a optimizar procesos.
EXPERIENCIA PROFESIONAL
Psicólogo de Reinserción Social · Complejo Penitenciario Biobío – Concepción
Justice Services Sodexo Dic. 2021 – Mar. 2022 · Ene. 2023 – Nov. 2024
l Elaboré evaluaciones psico-criminológicas e informes técnicos para procesos judiciales y administrativos.
Psicólogo (Reemplazante) · Programa de Cuidados Paliativos Universales
Hospital Clínico de Magallanes · Punta Arenas Ene. 2025 – Mar. 2025
l Brindé apoyo psicológico a pacientes con enfermedades crónicas y terminales, así como a sus cuidadores.
Psicólogo · PIE y Convivencia Escolar
Escuela Almirante Jorge Montt Álvarez · Penco Mar. 2021 – Nov. 2021 · Abr. 2022 – Dic. 2022
l Realicé evaluación, diagnóstico y seguimiento de estudiantes con necesidades educativas especiales (NEE).
Psicólogo (Reemplazante)
CESFAM · Penco Sep. 2019 – Dic. 2019
l Realicé evaluaciones diagnósticas, intervenciones psicológicas individuales y seguimiento de casos en atención primaria.
Psicólogo Practicante
Secretaría Regional Ministerial de Salud · Magallanes May. 2018 – Dic. 2018
l Colaboré en programas conjuntos con Gendarmería de Chile, Geopark y el Ministerio de Desarrollo Social.
Matías Riquelme Cárdenas · Curriculum Vitae · Noviembre 2026 Página 1 de 4
MATÍAS RICARDO RIQUELME CÁRDENAS
Psicólogo · Intervención Clínica y Psicosocial | Desarrollo de Sistemas e IA (autodidacta)
psriquelme.m@gmail.com · +56 9 2372 6707 · 61 2 252592 · Punta Arenas, Chile
linkedin.com/in/matiriquelme · github.com/matiquelmec · soyindi.cl
PROYECTOS DE DESARROLLO TECNOLÓGICO (AUTODIDACTA · 2024 – 2026)
Diseño e implementación autónoma de plataformas con tecnologías de producción, base del proyecto de investigación ERBE
(Ecosistema de Rehabilitación Basado en Evidencia):
Soyindi (INDI) · Plataforma SaaS de identidad digital soyindi.cl · github.com/Soyindi/Soy-Indi
Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Drizzle ORM + Turso · Better-Auth · Cloudflare R2 · Upstash Redis · Vercel
l Tarjeta digital: perfiles públicos con código QR, vCard 4.0 con foto, pase de Google Wallet (firma JWT RS256).
Joyas JP · E-commerce de joyería urbana y plata Ley 925 joyasjp.cl
Next.js 14 · TypeScript · Drizzle ORM + Turso · Zod v4 · Flow.cl
l Administración protegida con sesiones JWT en cookie HttpOnly, conciliación de pagos idempotente.
Salón Marilyn Monroe · Agendamiento y gestión para salón de
peluquería salonmarilynmonroe.cl
Next.js 14 · Drizzle ORM + Turso · Tailwind CSS · Cloudinary
l Agendamiento multi-colaboradora con motor de fases (aplicación, procesado, lavado y finalizado).
Casa Aira Boutique · E-commerce de alta costura (tallas XS a 6XL) casaaira.cl
Next.js 16 · React 19 · TypeScript · Drizzle ORM + Turso · Cloudinary · Flow.cl
l Pasarela de pago Flow.cl con firma HMAC-SHA256, conciliación idempotente (webhook y retorno).
ContaPymePUQ · Ecosistema contable, laboral y publicitario para
pymes contapymepuq.cl · github.com/matiquelmec/ContapymeV2
Next.js 16 · React 19 · TypeScript · FastAPI (Python 3.12) · Supabase/PostgreSQL con RLS multi-tenant · Mercado Pago
l Operativa en Magallanes con 37 organizaciones cliente, 189 colaboradores y 400 liquidaciones procesadas en siete módulos integrados.
MATÍAS RICARDO RIQUELME CÁRDENAS Psicólogo · Desarrollo de Sistemas e IA
Matías Riquelme Cárdenas · Curriculum Vitae · Noviembre 2026 Página 2 de 4
Slingshot · Terminal cuantitativa de análisis y ejecución algorítmica github.com/matiquelmec/Slingshot
Python 3.12 · FastAPI · Polars · WebSocket · Next.js 15 · Turso + Drizzle · XGBoost / ONNX · Ollama · NVIDIA NIM
l Arquitectura: frontend Next.js 15 en Vercel (Feature-Sliced Design, multi-tenant) y motor cuantitativo en VPS 24/7.
Visant Coffee Break · Cotización web B2B para coffee break corporativo github.com/matiquelmec/Visant
React 18 · TypeScript · Vite · Tailwind CSS v4
l Cotizador en tiempo real con IVA y exención de Zona Franca, integración con WhatsApp.
ClicLaboral · Control de asistencia laboral inmutable github.com/matiquelmec/ClicLaboral
NestJS · Event Sourcing + CQRS · PostgreSQL con RLS · SHA-256
l Encadenamiento criptográfico SHA-256 y anonimización de datos personales; traduce la Res. Exenta N° 38/2024.
COMPETENCIAS
Clínicas y psicosociales Psicodiagnóstico (WISC-V, pruebas proyectivas y psicométricas) · Modelo RNR · Intervención en crisis ·
Cuidados paliativos y duelo · PIE / NEE
Desarrollo TypeScript · Python 3.12 · SQL · React 18/19 · Next.js 14–16 (App Router) · FastAPI · NestJS ·
Tailwind CSS v4 · HTML/CSS
MATÍAS RICARDO RIQUELME CÁRDENAS Psicólogo · Desarrollo de Sistemas e IA
Matías Riquelme Cárdenas · Curriculum Vitae · Noviembre 2026 Página 3 de 4
EDUCACIÓN
Título de Psicólogo · Licenciado en Psicología 2013 – 2018
Universidad de Magallanes · Punta Arenas, Chile
Tesis: «Sensibilidad Estacional en la Región de Magallanes»
ESPECIALIZACIONES Y FORMACIÓN COMPLEMENTARIA
Diplomado en Psicodiagnóstico Laboral Grupo ASCS Do Agile 2019 · 100 h
Redacción de Informes Técnicos SENCE 2023 · 80 h
Prevención del Consumo de Drogas y Alcohol en el Mundo
Laboral SENDA 2019 · 10 h
Formación en WISC-V Education Business Group, Inc. 2021 · 20 h
Primeros Auxilios Psicológicos Universidad de Magallanes 2020
Prevención de Autolesiones y Suicidio: Empoderamiento de
Profesionales de APS OPS / OMS 2020 · 16 h
Salud de la Mujer y el Embarazo: Abordaje Integral para APS OPS / OMS 2020 · 8 h
Detección Temprana de Consumo Problemático SENDA 2020 · 20 h
Derechos de los Niños, Niñas y Adolescentes Subsecretaría de Derechos Humanos 2025 · 20 h
Introducción a los Derechos Humanos Subsecretaría de Derechos Humanos 2025 · 15 h
REFERENCIAS PROFESIONALES
Cecilia Vivallo Corvalán
Enfermera encargada, Cuidados Paliativos Universales
Hospital Clínico de Magallanes
+56 9 8226 8970
Carlos Domínguez Parra
Jefe de Reinserción Social
Complejo Penitenciario Biobío · Justice Services Sodexo
+56 9 8933 0333
Marisol Cárcamo
Coordinadora del Área Psicosocial
Complejo Penitenciario Biobío · Justice Services Sodexo
+56 9 7467 7104
Jannette Pantoja
Inspectora General
Escuela Almirante Jorge Montt Álvarez · Penco
+56 9 6143 4397
Claudia Cárcamo
Psicóloga
CESFAM Penco
+56 9 7387 7180
MATÍAS RICARDO RIQUELME CÁRDENAS Psicólogo · Desarrollo de Sistemas e IA
Matías Riquelme Cárdenas · Curriculum Vitae · Noviembre 2026 Página 4 de 4`;

    const parsed = parseCvTextToStructuredData(rawTabularFourPageCv, 'CV_Matias_Riquelme_2026.pdf');

    expect(parsed.fullName).toBe('MATÍAS RICARDO RIQUELME CÁRDENAS');
    expect(parsed.targetRole).toContain('Psicólogo');
    expect(parsed.experience).toHaveLength(6);

    const portfolioExp = parsed.experience.find((e) => e.role.includes('Proyectos de Desarrollo Tecnológico'));
    expect(portfolioExp?.xyzBullets).toHaveLength(8);
    expect(portfolioExp?.xyzBullets[2].text).toContain('Salón Marilyn Monroe');
    expect(portfolioExp?.xyzBullets[4].text).toContain('ContaPymePUQ');

    // Las 11 entradas de educación con sus años exactos
    expect(parsed.education).toHaveLength(11);
    expect(parsed.education[0]).toEqual({
      degree: 'Título de Psicólogo · Licenciado en Psicología',
      institution: 'Universidad de Magallanes, Punta Arenas, Chile',
      year: '2013 – 2018',
    });
    expect(parsed.education[1]).toEqual({
      degree: 'Diplomado en Psicodiagnóstico Laboral',
      institution: 'Grupo ASCS Do Agile',
      year: '2019 · 100 h',
    });
    expect(parsed.education[2]).toEqual({
      degree: 'Redacción de Informes Técnicos',
      institution: 'SENCE',
      year: '2023 · 80 h',
    });
    expect(parsed.education[3]).toEqual({
      degree: 'Prevención del Consumo de Drogas y Alcohol en el Mundo Laboral',
      institution: 'SENDA',
      year: '2019 · 10 h',
    });
    expect(parsed.education[9]).toEqual({
      degree: 'Derechos de los Niños, Niñas y Adolescentes',
      institution: 'Subsecretaría de Derechos Humanos',
      year: '2025 · 20 h',
    });
    expect(parsed.education[10]).toEqual({
      degree: 'Introducción a los Derechos Humanos',
      institution: 'Subsecretaría de Derechos Humanos',
      year: '2025 · 15 h',
    });

    // Las 5 referencias con sus teléfonos completos
    expect(parsed.references).toHaveLength(5);
    expect(parsed.references[0]).toEqual({
      name: 'Cecilia Vivallo Corvalán',
      role: 'Enfermera encargada, Cuidados Paliativos Universales',
      company: 'Hospital Clínico de Magallanes',
      contact: '+56 9 8226 8970',
    });
    expect(parsed.references[4]).toEqual({
      name: 'Claudia Cárcamo',
      role: 'Psicóloga',
      company: 'CESFAM Penco',
      contact: '+56 9 7387 7180',
    });
  });

  it('extrae el 100% del CV minimalista de 3 páginas (guiones en-dash, cargos en 3 líneas, proyectos sin URL en cabecera, registros y referencias en 5 líneas)', async () => {
    const { parseCvTextToStructuredData } = await import('@/features/ai-smart-cv/lib/cv-text-parser');
    const rawMinimalistThreePageCv = `MATÍAS RICARDO RIQUELME CÁRDENAS
Psicólogo Clínico y Psicosocial · Desarrollador de Software Full-Stack e IA
Punta Arenas, Chile · +56 9 8252 8235 · psicodomo.mr@gmail.com · RUT 18.209.442-0
soyindi.cl · github.com/matiquelmec · linkedin.com/in/matias-riquelme
Disponibilidad inmediata · Presencial en Magallanes, híbrido o remoto · Licencia clase B
PERFIL PROFESIONAL
Psicólogo titulado por la Universidad de Magallanes (2018), con registro vigente en la Superintendencia de Salud (N.º 563845) y Secreduc (Folio 261748). Seis años de experiencia clínica y psicosocial en contextos de alta exigencia: reinserción social penitenciaria bajo modelo RNR, cuidados paliativos hospitalarios, salud mental en APS y convivencia escolar (PIE). En paralelo, desarrollador full-stack autodidacta con sistemas en producción comercial que integran inteligencia artificial generativa, pasarelas de pago y arquitecturas multi-tenant seguras.
EXPERIENCIA PROFESIONAL EN PSICOLOGÍA
Psicólogo de Reinserción Social
Complejo Penitenciario Biobío · Sociedad Concesionaria Grupo 2 S.A. (Sodexo) · Concepción
Oct. 2021 – Abr. 2024
– Evaluaciones psicocriminológicas e informes técnicos para tribunales de justicia y comisiones de libertad condicional.
– Diseño y ejecución de planes de intervención individual y grupal bajo el modelo Riesgo-Necesidad-Responsividad (RNR) orientados a disminuir factores dinámicos de reincidencia.
– Atención psicológica semanal, contención en crisis y monitoreo periódico de riesgo suicida en población penal.
– Talleres de autocuidado y manejo de estrés para personal penitenciario de trato directo.
Psicólogo Clínico (Reemplazante)
Unidad de Cuidados Paliativos Universales · Hospital Clínico de Magallanes · Punta Arenas
Dic. 2023 – Feb. 2024
– Acompañamiento psicológico a pacientes oncológicos y no oncológicos en etapa avanzada y a sus grupos familiares.
– Intervención en crisis, elaboración de duelo anticipado y coordinación clínica con equipo médico, de enfermería y trabajo social.
Psicólogo PIE y Convivencia Escolar
Escuela República del Paraguay (DAEM Recoleta) y establecimientos educacionales · Santiago y Concepción
Mar. 2020 – Nov. 2021
– Evaluación psicodiagnóstica integral (WISC-V, WAIS-IV, pruebas proyectivas) y planes de apoyo para estudiantes con NEE.
– Intervención familiar, mediación escolar, promoción del buen trato y articulación con redes de protección de derechos de NNA.
PROYECTOS DE DESARROLLO TECNOLÓGICO E IA
Desarrollador Full-Stack e Ingeniería de IA Independiente
Diseño, desarrollo y despliegue en producción de plataformas SaaS, sistemas clínicos y herramientas cuantitativas
Ene. 2025 – Presente
PSICODOMO · Plataforma clínica y gestión en salud mental · psicodomo.cl
Python · FastAPI · PostgreSQL · React · Docker · Cifrado AES-256
– Sistema web para profesionales de salud mental con ficha clínica electrónica, agendamiento y generación asistida de informes manteniendo criterio clínico humano.
INDI (Soyindi) · Ecosistema de identidad profesional verificable · soyindi.cl
Next.js 15 · TypeScript · Turso (libSQL) · Drizzle ORM · Tailwind CSS · Flow.cl · Mercado Pago
– Plataforma multi-tenant con tarjetas digitales interactivas (vCard 4.0, Google Wallet), Smart CV optimizado para ATS con firma digital y motor de presentaciones ejecutivas 16:9.
Matías Ricardo Riquelme Cárdenas · Curriculum Vitae · Noviembre 2026 Página 1 de 3
Slingshot · Sistema de análisis cuantitativo y datos financieros en tiempo real
Python · Node.js · WebSockets · SQLite WAL · Modelos de lenguaje e inferencia cuantitativa
– Ingesta de mercado de baja latencia mediante WebSockets, persistencia relacional optimizada y orquestación de modelos analíticos para evaluación de riesgo y señales operativas.
Kumo Relational · Motor de inteligencia relacional y memoria semántica · github.com/matiquelmec
Python · SQLite WAL · Embeddings vectoriales · Arquitectura modular
– Infraestructura ligera para consulta híbrida relacional-vectorial orientada a agentes autónomos y trazabilidad auditable de decisiones.
ClicLaboral · Plataforma de intermediación y empleabilidad · En desarrollo
Next.js · TypeScript · PostgreSQL · Diseño centrado en accesibilidad
– Portal orientado a conectar oferta laboral regional con perfiles verificados y postulación simplificada.
NeuroScan · Asistente de apoyo al análisis psicométrico y neuropsicológico · En desarrollo
Python · Procesamiento documental · Estructuración clínica
– Herramienta de sistematización de puntajes y apoyo a la redacción técnica de baterías de evaluación psicológica.
Visant Coffee Break · Plataforma digital comercial y catálogo gastronómico · Punta Arenas
Next.js · Tailwind CSS · Optimización SEO local y conversión por WhatsApp
– Sitio comercial responsivo diseñado para cotización rápida de servicios de banquetería y eventos corporativos regionales.
Agente Postulador · Automatización inteligente de flujos de postulación · En desarrollo
Python · Automatización web · Adaptación curricular asistida por IA
– Agente experimental para análisis de ofertas laborales y adecuación semántica de antecedentes profesionales con supervisión del usuario.
Nota de trayectoria: Desde abril de 2024 dediqué un período planificado a la formación intensiva en ingeniería de software, arquitectura cloud e inteligencia artificial aplicada, consolidando los sistemas en producción descritos arriba en paralelo a atenciones y consultorías independientes.
COMPETENCIAS Y HERRAMIENTAS
Clínicas y psicosociales Psicodiagnóstico clínico · WAIS-IV · WISC-V · Luscher · HTP · Persona bajo la Lluvia · ASSIST · Primeros Auxilios Psicológicos
(PAP) · Terapia Breve · Intervención en Crisis · Entrevista Motivacional · Acompañamiento Psicosocial · Duelo y Cuidados Paliativos
Desarrollo Python · TypeScript · JavaScript · SQL · Node.js · React · Next.js · FastAPI · Tailwind CSS · HTML5 / CSS3
Datos e infraestructura PostgreSQL · Supabase · Turso (libSQL) · Drizzle ORM · Redis · Docker · Git / GitHub · Linux · Vercel · Railway
Inteligencia artificial Integración de APIs LLM (Claude, OpenAI, Gemini, DeepSeek) · Prompt Engineering · RAG · Automatización de flujos · WebSockets
Seguridad y arquitectura OAuth 2.0 · JWT · RBAC · Row-Level Security (RLS) · Cifrado AES-256 · Rate Limiting · Auditoría de seguridad · Arquitectura
modular y monolitos modulares
EDUCACIÓN
Licenciado en Psicología · Título de Psicólogo
Universidad de Magallanes · Punta Arenas, Chile
2013 – 2018
REGISTROS PROFESIONALES
Prestador Individual de Salud · N.º 563845 Superintendencia de Salud Dic. 2018
Registro Secreduc Profesionales de la Educación · Folio
261748
Ministerio de Educación May. 2019
FORMACIÓN COMPLEMENTARIA
Cuidados Paliativos en Personas Mayores · 20 h Subsecretaría de Salud Pública Ago. 2025
Acompañamiento Psicosocial en APS · 27 h Servicio de Salud Magallanes Oct. 2024
Calidad de Atención al Usuario del Sector Público · 25 h SENCE Jun. 2023
Salud sin Violencia: Ley N.º 20.584 · 27 h Servicio de Salud Magallanes Abr. 2023
Prevención del Consumo de Sustancias (Modelo Islandés) ·
32 h
SENDA Mar. 2023
Entrevista Investigativa Videograbada: Ley N.º 21.057 Subsecretaría de Derechos Humanos Ago. 2022
Matías Ricardo Riquelme Cárdenas · Curriculum Vitae · Noviembre 2026 Página 2 de 3
Intervenciones Breves en Consumo de Alcohol y Tabaco
(ASSIST) · 32 h
Organización Panamericana de la Salud Mar. 2020
Autocuidado de la Salud Mental en Equipos de Salud · 12 h OPS / OMS Dic. 2020
Escala de Inteligencia de Wechsler para Adultos (WAIS-IV) ·
16 h
ADIPA Ago. 2019
Pruebas Proyectivas Gráficas: Luscher, Persona bajo la Lluvia,
HTP
Centro de Estudios de la Conducta Ago. 2018
Scrum Master Professional Certificate (SMPC) Grupo ASCS Do Agile Abr. 2025
Curso Profesional de Python · Certificado de aprobación Education Business Group, Inc. Nov. 2024
REFERENCIAS PROFESIONALES
Psi. Maribel Pérez
Jefa Unidad de Cuidados Paliativos
Hospital Clínico de Magallanes
+56 9 9949 7119
Dr. Ramón Verdugo
Médico Cirujano
Hospital Clínico de Magallanes
+56 9 8232 9518
E.U. Camila Miranda
Enfermera encargada, Cuidados Paliativos
Universales
Hospital Clínico de Magallanes
+56 9 8889 4725
Psi. Jonathan Matus
Jefe Técnico Regional
Complejo Penitenciario Biobío · Sociedad
Concesionaria Grupo 2 (Sodexo)
+56 9 9128 8970
Rosamelia cárcamo
Inspectora General
Escuela República del Paraguay, Recoleta
+56 9 7951 7416
Matías Ricardo Riquelme Cárdenas · RUT 18.209.442-0
Punta Arenas, Chile · Noviembre 2026
Matías Ricardo Riquelme Cárdenas · Curriculum Vitae · Noviembre 2026 Página 3 de 3`;

    const parsed = parseCvTextToStructuredData(
      rawMinimalistThreePageCv,
      'CV_Matias_Riquelme_Cardenas_2026_Minimalista.pdf'
    );

    expect(parsed.fullName).toBe('MATÍAS RICARDO RIQUELME CÁRDENAS');
    expect(parsed.rut).toBe('18.209.442-0');
    expect(parsed.phone).toBe('+56 9 8252 8235');
    expect(parsed.email).toBe('psicodomo.mr@gmail.com');

    // 3 cargos clínicos + 1 bloque de Proyectos de Desarrollo Tecnológico + 1 Nota de trayectoria
    expect(parsed.experience.length).toBeGreaterThanOrEqual(4);
    expect(parsed.experience[0].role).toBe('Psicólogo de Reinserción Social');
    expect(parsed.experience[0].company).toContain('Complejo Penitenciario Biobío');
    expect(parsed.experience[0].period).toBe('Oct. 2021 – Abr. 2024');
    expect(parsed.experience[0].xyzBullets).toHaveLength(4);

    // Verificar que los 8 proyectos (incluyendo Slingshot, ClicLaboral y Visant Coffee Break sin URL en título) se extrajeron completos
    const techPortfolio = parsed.experience.find((e) =>
      e.role.includes('Desarrollador Full-Stack') || e.role.includes('Proyectos de Desarrollo')
    );
    expect(techPortfolio).toBeDefined();
    expect(techPortfolio?.xyzBullets).toHaveLength(8);
    expect(techPortfolio?.xyzBullets.some((b) => b.text.includes('Slingshot'))).toBe(true);
    expect(techPortfolio?.xyzBullets.some((b) => b.text.includes('ClicLaboral'))).toBe(true);
    expect(techPortfolio?.xyzBullets.some((b) => b.text.includes('Visant Coffee Break'))).toBe(true);

    // Verificar Habilidades sin cortes en paréntesis ni líneas partidas
    expect(parsed.skills).toContain('Primeros Auxilios Psicológicos (PAP)');
    expect(parsed.skills).toContain('Integración de APIs LLM (Claude, OpenAI, Gemini, DeepSeek)');
    expect(parsed.skills).toContain('Arquitectura modular y monolitos modulares');

    // Verificar Educación (1 grado + 2 registros + 12 cursos = 15 ítems)
    expect(parsed.education).toHaveLength(15);
    expect(parsed.education[0].degree).toContain('Licenciado en Psicología');
    expect(parsed.education[1].degree).toContain('Prestador Individual de Salud');
    expect(parsed.education[1].institution).toBe('Superintendencia de Salud');
    expect(parsed.education[1].year).toBe('Dic. 2018');
    expect(parsed.education[2].degree).toContain('Folio 261748');
    expect(parsed.education[2].institution).toBe('Ministerio de Educación');
    expect(parsed.education[2].year).toBe('May. 2019');

    // Verificar las 5 Referencias (incluyendo bloques de 5 líneas con cargo/institución envuelta)
    expect(parsed.references).toHaveLength(5);
    expect(parsed.references[2]).toEqual({
      name: 'E.U. Camila Miranda',
      role: 'Enfermera encargada, Cuidados Paliativos Universales',
      company: 'Hospital Clínico de Magallanes',
      contact: '+56 9 8889 4725',
    });
    expect(parsed.references[3]).toEqual({
      name: 'Psi. Jonathan Matus',
      role: 'Jefe Técnico Regional',
      company: 'Complejo Penitenciario Biobío, Sociedad Concesionaria Grupo 2 (Sodexo)',
      contact: '+56 9 9128 8970',
    });
    expect(parsed.references[4]).toEqual({
      name: 'Rosamelia cárcamo',
      role: 'Inspectora General',
      company: 'Escuela República del Paraguay, Recoleta',
      contact: '+56 9 7951 7416',
    });
  });
});
