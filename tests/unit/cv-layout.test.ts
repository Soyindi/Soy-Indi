import { describe, it, expect } from 'vitest';
import {
  calculateCvPageDistribution,
  A4_PAGE_MAX_CAPACITY,
  getHeaderWeight,
  getSummaryWeight,
  getSingleExperienceWeight,
} from '@/features/ai-smart-cv/lib/cv-layout';
import { CVFormValues } from '@/entities/cv/schemas';

describe('INDI Smart CV - Motor de Distribución y Balance Geométrico A4 (cv-layout)', () => {
  it('distribuye de forma armónica múltiples experiencias en Hoja 1 evitando el espacio en blanco vacío', () => {
    // Caso real: Usuario con Job 0 de 7 viñetas y Job 1 de 3 viñetas
    const mockCv = {
      templateId: 'modern-slate',
      targetRole: 'Psicólogo - Intervención Clínica y Psicosocial | Desarrollo de Sistemas e IA (Autodidacta)',
      content: {
        fullName: 'MATÍAS RICARDO RIQUELME CÁRDENAS',
        email: 'psicodomo.mr@gmail.com',
        phone: '+56 9 8252 8235',
        location: 'Punta Arenas, Chile',
        rut: '18.289.552-8',
        linkedinUrl: 'https://linkedin.com/in/matiasriquelme',
        summary: 'Psicólogo - Intervención Clínica y Psicosocial | Desarrollo de Sistemas e IA (Autodidacta) con sólida trayectoria impulsando iniciativas de alto impacto y eficiencia técnica. Especialista en optimización de procesos, buenas prácticas y alineación de requerimientos con objetivos de negocio.',
        skills: ['Psicodiagnóstico', 'Intervención Clínica', 'Desarrollo de Software', 'Python', 'TypeScript', 'Liderazgo', 'Redacción de Informes'],
        experience: [
          {
            role: 'Psicólogo de Reinserción Social',
            company: 'Complejo Penitenciario Castro',
            period: '2021 - 2024 / Abr. 2022 - Mar. 2023 / Oct. 2021 - Mar. 2022',
            bullets: [
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en evaluación psico-criminológica y redacción de informes técnicos para población penitenciaria y administración de justicia para Complejo Penitenciario Castro.',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en diseño y aplicación de Pauta RNR en intervenciones individuales y grupales orientadas a reducir la reincidencia para Complejo Penitenciario Castro.',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en coordinación semanal en terapias, entrevistas clínicas y talleres psicoeducativos para Complejo Penitenciario Castro.',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en monitoreo anual de salud mental de la población interna para detección temprana de riesgos para Complejo Penitenciario Castro.',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en gestión de registros clínicos en plataformas institucionales y reporte mensual de indicadores para Complejo Penitenciario Castro.',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en desarrollo de talleres de autocuidado dirigidos al personal de trato directo para Complejo Penitenciario Castro.',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en participación activa en reuniones interdisciplinarias para ajustar estrategias de intervención para Complejo Penitenciario Castro.',
            ],
          },
          {
            role: 'Psicólogo (Reemplazante)',
            company: 'Programa de Cuidados Paliativos Universales',
            period: 'Dic. 2023 - Feb. 2024',
            bullets: [
              'Dirigí estratégicamente apoyo psicológico a pacientes con enfermedades crónicas y terminales, y a sus cuidadores, optimizando flujos de trabajo en Programa de Cuidados Paliativos Universales.',
              'Dirigí estratégicamente coordinación con el equipo de enfermería y trabajo social para dar continuidad a los planes de atención, optimizando flujos de trabajo en Programa de Cuidados Paliativos Universales.',
              'Dirigí estratégicamente contención emocional en situaciones de crisis y acompañamiento en duelo temprano, optimizando flujos de trabajo en Programa de Cuidados Paliativos Universales.',
            ],
          },
          {
            role: 'Psicólogo',
            company: 'PIE y Convivencia Escolar',
            period: 'Mar. 2021 - Nov. 2021 | Mar. 2020 - Dic. 2020',
            bullets: [
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en evaluación, diagnóstico y seguimiento de estudiantes con necesidades educativas especiales (NEE).',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en intervenciones familiares integrales y mediación de conflictos.',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en promoción de la convivencia escolar.',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en articulación con redes comunales y gestión de recursos externos.',
              'Implementé mejores prácticas de visión estratégica y liderazgo de equipos en resguardo activo de los derechos de niños, niñas y adolescentes.',
            ],
          },
        ],
        education: [
          {
            degree: 'Título de Psicólogo',
            institution: 'Universidad de Magallanes, Chile',
            year: '2019 • 2020',
            credentialType: 'DEGREE',
          },
        ],
        references: [],
      },
    };

    const distribution = calculateCvPageDistribution(mockCv as unknown as CVFormValues);

    // Debe requerir 2 páginas
    expect(distribution.needsTwoPages).toBe(true);

    // En la Hoja 1 deben quedar Job 0 y Job 1, NO solo Job 0
    expect(distribution.page1Experiences.length).toBeGreaterThanOrEqual(2);
    expect(distribution.page1Experiences[0].role).toBe('Psicólogo de Reinserción Social');
    expect(distribution.page1Experiences[1].role).toBe('Psicólogo (Reemplazante)');

    // La ocupación de la Hoja 1 debe ser alta (>= 75%) eliminando el hueco en blanco
    expect(distribution.capacityUtilizationPct).toBeGreaterThanOrEqual(75);
    expect(distribution.capacityUtilizationPct).toBeLessThanOrEqual(100);

    // El Job 2 debe quedar en Hoja 2
    expect(distribution.page2Experiences.length).toBeGreaterThanOrEqual(1);
    expect(distribution.page2Experiences[0].role).toBe('Psicólogo');
  });

  it('mantiene un CV compacto en 1 sola hoja si todo su contenido cabe dentro del umbral A4', () => {
    const compactCv = {
      templateId: 'modern-slate',
      targetRole: 'Full Stack Engineer',
      content: {
        fullName: 'CARLOS SILVA',
        email: 'carlos@example.com',
        phone: '+56 9 1234 5678',
        location: 'Santiago, Chile',
        summary: 'Ingeniero de Software con 5 años de experiencia diseñando arquitecturas web escalables y microservicios con TypeScript y Next.js.',
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
        experience: [
          {
            role: 'Senior Developer',
            company: 'Tech Corp',
            period: '2022 - Presente',
            bullets: [
              'Lideré el desarrollo de microservicios con 99.9% de uptime.',
              'Optimicé tiempos de compilación y despliegue CI/CD en un 40%.',
            ],
          },
          {
            role: 'Software Engineer',
            company: 'Startup SpA',
            period: '2020 - 2022',
            bullets: [
              'Diseñé interfaces responsivas con Tailwind CSS y React.',
              'Implementé autenticación segura y pasarelas de pago.',
            ],
          },
        ],
        education: [
          {
            degree: 'Ingeniería Civil Informática',
            institution: 'Universidad de Chile',
            year: '2019',
            credentialType: 'DEGREE',
          },
        ],
        references: [],
      },
    };

    const distribution = calculateCvPageDistribution(compactCv as unknown as CVFormValues);
    expect(distribution.needsTwoPages).toBe(false);
    expect(distribution.page1Experiences.length).toBe(2);
    expect(distribution.page2Experiences.length).toBe(0);
    expect(distribution.capacityUtilizationPct).toBeLessThanOrEqual(100);
  });

  it('calibra correctamente el peso de viñetas sin doble conteo arbitrario', () => {
    const exp = {
      role: 'DevOps Engineer',
      company: 'Cloud Chile',
      period: '2023',
      bullets: [
        'Lideré la migración a Kubernetes reduciendo la latencia de red.', // ~62 chars -> 1 línea
        'Orquesté la infraestructura en Terraform automatizando despliegues multirregión con alta disponibilidad para 20k usuarios concurrentes.', // ~135 chars -> 2 líneas
      ],
    };

    const result = getSingleExperienceWeight(exp);
    // 2.2 base + (1 línea * 1.05 + 0.3) + (2 líneas * 1.05 + 0.3) + 0.8 margen = 2.2 + 1.35 + 2.4 + 0.8 = ~6.75
    expect(result.totalWeight).toBeGreaterThan(5.5);
    expect(result.totalWeight).toBeLessThan(8.5);
  });

  it('divide el portafolio de 8 proyectos entre Hoja 1 y Hoja 2 cuando Hoja 1 está bajo el 86% y evita sobrecargar la Hoja 2', () => {
    const denseMultidisciplinaryCv = {
      templateId: 'swiss-minimalist',
      targetRole: 'Psicólogo Clínico y Psicosocial · Desarrollador de Software Full-Stack e IA',
      content: {
        fullName: 'MATÍAS RICARDO RIQUELME CÁRDENAS',
        email: 'psicodomo.mr@gmail.com',
        phone: '+56 9 8252 8235',
        location: 'Punta Arenas, Chile',
        rut: '18.209.442-0',
        linkedinUrl: 'linkedin.com/in/matias-riquelme',
        websiteUrl: 'soyindi.cl',
        summary:
          'Psicólogo titulado por la Universidad de Magallanes (2018), con registro vigente en la Superintendencia de Salud y Secreduc. Seis años de experiencia clínica y psicosocial en contextos de alta exigencia y desarrollador full-stack autodidacta con sistemas en producción.',
        skills: [
          'Psicodiagnóstico clínico', 'WAIS-IV', 'WISC-V', 'Luscher', 'HTP', 'ASSIST',
          'Primeros Auxilios Psicológicos (PAP)', 'Terapia Breve', 'Intervención en Crisis',
          'Python', 'TypeScript', 'JavaScript', 'SQL', 'Node.js', 'React', 'Next.js',
          'FastAPI', 'Tailwind CSS', 'PostgreSQL', 'Supabase', 'Turso (libSQL)', 'Drizzle ORM',
          'Redis', 'Docker', 'Integración de APIs LLM (Claude, OpenAI, Gemini, DeepSeek)',
        ],
        experience: [
          {
            role: 'Psicólogo de Reinserción Social',
            company: 'Complejo Penitenciario Biobío · Sodexo · Concepción',
            period: 'Oct. 2021 – Abr. 2024',
            bullets: [
              '– Evaluaciones psicocriminológicas e informes técnicos para tribunales de justicia y comisiones de libertad condicional.',
              '– Diseño y ejecución de planes de intervención individual y grupal bajo el modelo Riesgo-Necesidad-Responsividad (RNR) orientados a disminuir factores dinámicos de reincidencia.',
              '– Atención psicológica semanal, contención en crisis y monitoreo periódico de riesgo suicida en población penal.',
              '– Talleres de autocuidado y manejo de estrés para personal penitenciario de trato directo.',
            ],
          },
          {
            role: 'Psicólogo Clínico (Reemplazante)',
            company: 'Unidad de Cuidados Paliativos Universales · Hospital Clínico de Magallanes',
            period: 'Dic. 2023 – Feb. 2024',
            bullets: [
              '– Acompañamiento psicológico a pacientes oncológicos y no oncológicos en etapa avanzada y a sus grupos familiares.',
              '– Intervención en crisis, elaboración de duelo anticipado y coordinación clínica con equipo médico, de enfermería y trabajo social.',
            ],
          },
          {
            role: 'Psicólogo PIE y Convivencia Escolar',
            company: 'Escuela República del Paraguay (DAEM Recoleta)',
            period: 'Mar. 2020 – Nov. 2021',
            bullets: [
              '– Evaluación psicodiagnóstica integral (WISC-V, WAIS-IV, pruebas proyectivas) y planes de apoyo para estudiantes con NEE.',
              '– Intervención familiar, mediación escolar, promoción del buen trato y articulación con redes de protección de derechos de NNA.',
            ],
          },
          {
            role: 'Desarrollador Full-Stack e Ingeniería de IA Independiente',
            company: 'Diseño, desarrollo y despliegue en producción de plataformas SaaS',
            period: 'Ene. 2025 – Presente',
            bullets: [
              'PSICODOMO · Plataforma clínica y gestión en salud mental · psicodomo.cl — Python · FastAPI · PostgreSQL · React · Docker. Sistema web con ficha clínica electrónica y agendamiento.',
              'INDI (Soyindi) · Ecosistema de identidad profesional verificable · soyindi.cl — Next.js 15 · TypeScript · Turso · Drizzle ORM. Plataforma multi-tenant con tarjetas digitales y Smart CV.',
              'Slingshot · Sistema de análisis cuantitativo y datos financieros en tiempo real — Python · Node.js · WebSockets · SQLite WAL. Ingesta de mercado de baja latencia.',
              'Kumo Relational · Motor de inteligencia relacional y memoria semántica — Python · SQLite WAL · Embeddings vectoriales. Infraestructura híbrida relacional-vectorial.',
              'ClicLaboral · Plataforma de intermediación y empleabilidad — Next.js · TypeScript · PostgreSQL. Portal orientado a conectar oferta laboral regional.',
              'NeuroScan · Asistente de apoyo al análisis psicométrico y neuropsicológico — Python · Procesamiento documental. Sistematización de puntajes clínicos.',
              'Visant Coffee Break · Plataforma digital comercial y catálogo gastronómico — Next.js · Tailwind CSS. Sitio comercial responsivo con cotización por WhatsApp.',
              'Agente Postulador · Automatización inteligente de flujos de postulación — Python · Automatización web. Adecuación semántica de antecedentes con supervisión humana.',
            ],
          },
        ],
        education: Array.from({ length: 15 }, (_, i) => ({
          degree: i === 0 ? 'Licenciado en Psicología · Título de Psicólogo' : `Curso Especializado #${i}`,
          institution: i === 0 ? 'Universidad de Magallanes' : 'Servicio de Salud Magallanes',
          year: `202${i % 6}`,
          credentialType: i === 0 ? 'DEGREE' : 'CERTIFICATION',
        })),
        references: Array.from({ length: 5 }, (_, i) => ({
          name: `Referencia Profesional ${i + 1}`,
          role: 'Jefatura Clínica',
          company: 'Hospital Clínico de Magallanes',
          contact: `+56 9 9949 711${i}`,
        })),
      },
    };

    const dist = calculateCvPageDistribution(denseMultidisciplinaryCv as unknown as CVFormValues);

    // Hoja 1 debe incluir los 3 cargos clínicos + la primera parte del portafolio tecnológico (4 ítems en page1Experiences)
    expect(dist.page1Experiences).toHaveLength(4);
    expect(dist.page1Experiences[3].bullets.length).toBeGreaterThanOrEqual(2);
    expect(dist.page1Experiences[3].bullets.length).toBeLessThan(8);
    expect(dist.capacityUtilizationPct).toBeGreaterThanOrEqual(85);
    expect(dist.capacityUtilizationPct).toBeLessThanOrEqual(100);

    // Hoja 2 recibe la continuación del portafolio sin desbordar (o desborda limpiamente a Hoja 3 si supera capacidad)
    expect(dist.page2Experiences[0].isContinued).toBe(true);
    expect(dist.page2Weight).toBeLessThanOrEqual(A4_PAGE_MAX_CAPACITY);
  });
});
