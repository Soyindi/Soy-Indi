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
l Contabilidad y tributario: facturación electrónica DTE ante el SII.
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
});
