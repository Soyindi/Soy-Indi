/**
 * ============================================================================
 * INDI CV INTELLIGENCE & MATCHING ENGINE (INDI 2026 Standards)
 * ============================================================================
 * Motor determinista y heurístico para:
 * 1. Matching semántico bidireccional entre CV y Ofertas Laborales (Job Descriptions).
 * 2. Gap analysis: cálculo de Match Score, palabras clave faltantes y requisitos críticos.
 * 3. Taxonomía dinámica de habilidades por arquetipo profesional y rol objetivo.
 * 4. Fórmulas de cuantificación STAR / Google XYZ con valores sugeridos.
 */

import {
  CVContent,
  JobMatchAnalysisResult,
  SkillCategoryGroup,
} from '@/entities/cv/schemas';
import { evaluateCvPreRouteStrategy } from '@/features/ai-smart-cv/lib/cv-auditor';

/**
 * Catálogo Curado de Habilidades por Rol y Arquetipo Profesional
 */
const ROLE_SKILL_TAXONOMY: Record<string, {
  coreTechnical: string[];
  toolsFrameworks: string[];
  methodologies: string[];
  softLeadership: string[];
}> = {
  software: {
    coreTechnical: ['Arquitectura de Software', 'Sistemas Distribuidos', 'Bases de Datos SQL/NoSQL', 'Algoritmos y Estructuras', 'Diseño de APIs REST/GraphQL'],
    toolsFrameworks: ['TypeScript', 'Next.js', 'React', 'Node.js', 'Docker', 'PostgreSQL', 'AWS', 'Tailwind CSS', 'Git'],
    methodologies: ['CI/CD Pipeline', 'TDD (Test-Driven Development)', 'Scrum / Agile', 'Clean Architecture', 'Observabilidad'],
    softLeadership: ['Code Reviews', 'Mentoría Técnica', 'Resolución de Problemas Complejos', 'Comunicación Asertiva'],
  },
  frontend: {
    coreTechnical: ['Arquitectura Frontend', 'Web Performance (Core Web Vitals)', 'Accesibilidad WCAG 2.2 AA', 'Responsive Design', 'State Management'],
    toolsFrameworks: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite', 'GraphQL', 'Storybook'],
    methodologies: ['Design Systems', 'Micro-Frontends', 'Testing E2E / Unitario', 'Optimización LCP/INP'],
    softLeadership: ['Colaboración UI/UX', 'Atención al Detalle', 'Empatía con el Usuario'],
  },
  marketing: {
    coreTechnical: ['Estrategia de Crecimiento (Growth)', 'Optimización de Conversión (CRO)', 'Marketing de Contenidos', 'Gestión de Presupuesto Publicitario'],
    toolsFrameworks: ['Google Analytics 4', 'Meta Ads Manager', 'Google Ads', 'HubSpot', 'SEMrush', 'Looker Studio'],
    methodologies: ['A/B Testing Riguroso', 'Funnel de Adquisición & Retención', 'SEO On-Page & Off-Page', 'E-mail Marketing Automatizado'],
    softLeadership: ['Storytelling Comercial', 'Negociación Estratégica', 'Análisis de Datos Cuantitativos'],
  },
  data: {
    coreTechnical: ['Modelado de Datos', 'Machine Learning', 'Ingeniería de Características', 'Consultas Analíticas Complejas', 'Estadística Aplicada'],
    toolsFrameworks: ['Python', 'SQL', 'PostgreSQL', 'Pandas', 'Power BI', 'Snowflake', 'dbt', 'Tableau'],
    methodologies: ['ETL / ELT Pipelines', 'Gobernanza de Datos', 'Validación Cruzada', 'Monitoreo de Data Drift'],
    softLeadership: ['Traducción de Datos a Negocio', 'Presentación Ejecutiva a C-Level', 'Pensamiento Crítico'],
  },
  management: {
    coreTechnical: ['Planificación Estratégica', 'Gestión de P&L / Presupuesto', 'Gobernanza Corporativa', 'Gestión de Riesgos Operacionales'],
    toolsFrameworks: ['Jira', 'Notion Enterprise', 'Confluence', 'Miro', 'PowerPoint / Keynote', 'Slack Enterprise'],
    methodologies: ['OKRs & KPIs Trimestrales', 'Scrum / Kanban Frameworks', 'Mejora Continua Kaizen', 'Design Thinking'],
    softLeadership: ['Liderazgo de Equipos Multidisciplinarios', 'Resolución de Conflictos', 'Gestión del Cambio Organizacional'],
  },
  health: {
    coreTechnical: ['Evaluación Diagnóstica', 'Intervención Clínica', 'Diseño de Planes de Tratamiento', 'Psicometría y Baterías Clínicas'],
    toolsFrameworks: ['Fichas Clínicas Electrónicas', 'Sistemas Fonasa / Isapre', 'DSM-5 / CIE-11', 'Telemedicina Segura'],
    methodologies: ['Consentimiento Informado', 'Ética Profesional y Confidencialidad', 'Terapia Basada en Evidencia', 'Interconsulta Médica'],
    softLeadership: ['Contención Emocional', 'Escucha Activa', 'Alianza Terapéutica', 'Pensamiento Clínico Riguroso'],
  },
  finance_legal: {
    coreTechnical: ['Análisis Financiero Corporativo', 'Cumplimiento Normativo (Compliance)', 'Auditoría Tributaria y Contable', 'Gestión de Contratos y Litigios'],
    toolsFrameworks: ['SAP ERP', 'IFRS / NIIF', 'Excel Financiero Avanzado', 'Power BI Financiero', 'Sistemas SII / Previred'],
    methodologies: ['Control Presupuestario', 'Due Diligence Legal y Financiero', 'Gobierno Corporativo', 'Evaluación de Riesgo Crediticio'],
    softLeadership: ['Negociación de Alto Nivel', 'Rigor Analítico', 'Ética Fiduciaria', 'Asesoría a Directorio'],
  },
  operations_engineering: {
    coreTechnical: ['Optimización de Cadena de Suministro', 'Gestión de Mantenimiento Confiable', 'Seguridad Industrial y Prevención', 'Planificación de Operaciones'],
    toolsFrameworks: ['SAP MM/PM', 'AutoCAD / BIM', 'MS Project / Primavera', 'ERP Logístico', 'ISO 9001 / ISO 45001'],
    methodologies: ['Lean Six Sigma', 'Mejora Continua (Kaizen)', 'Gestión de Inventarios (JIT)', 'Control de Calidad Total'],
    softLeadership: ['Supervisión en Terreno', 'Coordinación de Contratistas', 'Toma de Decisiones bajo Presión'],
  },
  education: {
    coreTechnical: ['Diseño Curricular e Instruccional', 'Evaluación de Aprendizajes', 'Innovación Pedagógica', 'Investigación Académica'],
    toolsFrameworks: ['LMS (Moodle / Canvas)', 'Herramientas EdTech', 'Google Workspace for Education', 'APA 7ma Edición'],
    methodologies: ['Aprendizaje Basado en Proyectos (ABP)', 'Educación Inclusiva (DUA / PIE)', 'Convivencia Escolar', 'Tutoría Académica'],
    softLeadership: ['Comunicación Pedagógica', 'Liderazgo en Aula', 'Trabajo Colaborativo con Familias'],
  },
};

/**
 * Expresión regular canónica para verificar si una viñeta contiene una métrica cuantitativa verificable
 * (porcentajes, montos, multiplicadores o volúmenes con unidades operativas).
 */
export const QUANTITATIVE_METRIC_REGEX =
  /\b(?:\d+(?:[.,]\d+)?\s?(?:%|k|m|mm|ms|s|x|veces|horas|días|dias|semanas|meses|años|anos|personas|usuarios|pacientes|clientes|estudiantes|alumnos|proyectos|equipos|casos|informes|consultas|millones|miles|puntos|uf|usd|clp)\b|\$\s?\d+|\b\d{2,}\b)/i;

/**
 * Evalúa si un texto de logro laboral contiene al menos una métrica cuantitativa verificable.
 */
export function hasQuantitativeMetric(bulletText: string): boolean {
  if (!bulletText) return false;
  return QUANTITATIVE_METRIC_REGEX.test(bulletText);
}

/**
 * Obtiene recomendaciones predictivas de habilidades categorizadas según el rol y las habilidades actuales
 */
export function getRecommendedSkillsForRole(
  targetRole: string,
  currentSkills: string[] = []
): SkillCategoryGroup[] {
  const normalizedRole = targetRole.toLowerCase();
  const currentSkillsLower = new Set(currentSkills.map((s) => s.toLowerCase().trim()));

  // 1. Determinar el perfil más cercano
  let matchedKey = 'software';
  if (normalizedRole.includes('front') || normalizedRole.includes('ui') || normalizedRole.includes('web') || normalizedRole.includes('ux') || normalizedRole.includes('diseñ')) {
    matchedKey = 'frontend';
  } else if (normalizedRole.includes('market') || normalizedRole.includes('growth') || normalizedRole.includes('ventas') || normalizedRole.includes('comercial') || normalizedRole.includes('publicidad')) {
    matchedKey = 'marketing';
  } else if (normalizedRole.includes('data') || normalizedRole.includes('datos') || normalizedRole.includes('analyt') || normalizedRole.includes('ia') || normalizedRole.includes('ai') || normalizedRole.includes('bi')) {
    matchedKey = 'data';
  } else if (normalizedRole.includes('gerente') || normalizedRole.includes('director') || normalizedRole.includes('lead') || normalizedRole.includes('jefe') || normalizedRole.includes('product') || normalizedRole.includes('manager') || normalizedRole.includes('ceo') || normalizedRole.includes('coordina')) {
    matchedKey = 'management';
  } else if (normalizedRole.includes('psic') || normalizedRole.includes('médic') || normalizedRole.includes('medic') || normalizedRole.includes('salud') || normalizedRole.includes('nutri') || normalizedRole.includes('enferm') || normalizedRole.includes('kinesi') || normalizedRole.includes('terap') || normalizedRole.includes('clínic') || normalizedRole.includes('clinic')) {
    matchedKey = 'health';
  } else if (normalizedRole.includes('finan') || normalizedRole.includes('contad') || normalizedRole.includes('auditor') || normalizedRole.includes('abogad') || normalizedRole.includes('legal') || normalizedRole.includes('jurídic') || normalizedRole.includes('tribut')) {
    matchedKey = 'finance_legal';
  } else if (normalizedRole.includes('operacion') || normalizedRole.includes('logíst') || normalizedRole.includes('logist') || normalizedRole.includes('industrial') || normalizedRole.includes('prevenci') || normalizedRole.includes('obras') || normalizedRole.includes('construcc') || normalizedRole.includes('manteni')) {
    matchedKey = 'operations_engineering';
  } else if (normalizedRole.includes('docen') || normalizedRole.includes('profes') || normalizedRole.includes('educa') || normalizedRole.includes('pedagog') || normalizedRole.includes('académic')) {
    matchedKey = 'education';
  }

  const taxonomy = ROLE_SKILL_TAXONOMY[matchedKey] || ROLE_SKILL_TAXONOMY.software;

  const buildGroup = (
    category: SkillCategoryGroup['category'],
    label: string,
    skillList: string[]
  ): SkillCategoryGroup => ({
    category,
    label,
    skills: skillList.map((skillName, idx) => ({
      name: skillName,
      isCurrent: currentSkillsLower.has(skillName.toLowerCase()),
      popularityScore: Math.max(60, 98 - idx * 6),
    })),
  });

  return [
    buildGroup('CORE_TECHNICAL', 'Habilidades Técnicas Centrales', taxonomy.coreTechnical),
    buildGroup('TOOLS_FRAMEWORKS', 'Herramientas y Plataformas', taxonomy.toolsFrameworks),
    buildGroup('METHODOLOGIES_GOVERNANCE', 'Metodologías y Estándares', taxonomy.methodologies),
    buildGroup('SOFT_LEADERSHIP', 'Liderazgo y Habilidades Estratégicas', taxonomy.softLeadership),
  ];
}

/**
 * Analiza determinísticamente una oferta laboral frente al contenido del CV
 * y calcula Match Score, Brechas (Gaps), Palabras clave y Consejos de impacto.
 */
export function analyzeCvJobMatchDeterministically(
  jobDescription: string,
  cvContent: CVContent,
  targetRole: string = ''
): JobMatchAnalysisResult {
  const cleanJobText = (jobDescription || '').toLowerCase();

  // 1. Compilar todo el texto del CV de forma resiliente
  const cvCorpus = [
    cvContent.summary || '',
    targetRole,
    ...(cvContent.skills || []),
    ...(cvContent.experience || []).map((e) => {
      const bulletsText = Array.isArray(e.bullets) ? e.bullets.join(' ') : '';
      const detailedText = Array.isArray(e.detailedBullets) ? e.detailedBullets.map((b) => `${b.text} ${b.action_verb || ''}`).join(' ') : '';
      return `${e.company || ''} ${e.role || ''} ${bulletsText} ${detailedText} ${((e as Record<string, unknown>).description as string) || ''}`;
    }),
    ...(cvContent.education || []).map((ed) => `${ed.degree || ''} ${ed.institution || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  // 2. Extraer tokens y requisitos de la oferta laboral (filtrando conectores comunes en español)
  const stopwords = new Set([
    'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para',
    'con', 'no', 'una', 'su', 'al', 'es', 'lo', 'como', 'mas', 'más', 'pero', 'sus',
    'le', 'ya', 'o', 'fue', 'este', 'ha', 'si', 'porque', 'esta', 'son', 'entre', 'está',
    'cuando', 'muy', 'sin', 'sobre', 'ser', 'tiene', 'también', 'me', 'hasta', 'hay',
    'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni',
    'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos',
    'requisitos', 'funciones', 'buscamos', 'postula', 'responsabilidades', 'experiencia',
    'trabajo', 'empresa', 'equipo', 'perfil', 'cargo', 'postulante', 'años', 'conocimiento',
    'deseable', 'manejo', 'menos', 'grado', 'área', 'area',
  ]);

  // Extraer términos técnicos o n-gramas relevantes de la oferta
  const words = cleanJobText
    .replace(/[.,;:!?()"[\]{}]/g, ' ')
    .replace(/[^a-záéíóúüñ0-9+#.-]/gi, ' ')
    .split(/\s+/)
    .map((w) => w.trim().replace(/^[.-]+|[.-]+$/g, ''))
    .filter((w) => w.length >= 3 && !stopwords.has(w));

  // Contar frecuencias en la vacante
  const wordFreq = new Map<string, number>();
  words.forEach((w) => {
    wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  });

  // Identificar los hasta 30 términos más prominentes de la oferta
  const prominentTerms = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([term]) => term);

  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];

  prominentTerms.forEach((term) => {
    if (cvCorpus.includes(term)) {
      matchingKeywords.push(term);
    } else {
      missingKeywords.push(term);
    }
  });

  // 3. Evaluar requisitos críticos detectados en la vacante
  const criticalRequirements: JobMatchAnalysisResult['criticalRequirements'] = [];

  // Mención de años de experiencia
  const expMatch = cleanJobText.match(/(\d+)\+?\s*(?:años|anos|years)\s*(?:de\s*experiencia)?/i);
  if (expMatch) {
    const requiredYears = parseInt(expMatch[1], 10);
    const cvYearsMatch = cvCorpus.match(/(\d+)\+?\s*(?:años|anos|years)/i);
    const hasEnoughYears = cvYearsMatch ? parseInt(cvYearsMatch[1], 10) >= requiredYears : cvContent.experience.length * 2 >= requiredYears;

    criticalRequirements.push({
      requirement: `Al menos ${requiredYears} años de experiencia en el área`,
      status: hasEnoughYears ? 'FULFILLED' : 'PARTIAL',
      suggestion: hasEnoughYears
        ? `Cumples con el requisito de ${requiredYears} años de trayectoria.`
        : `La oferta solicita ${requiredYears} años de experiencia. Destaca en tu resumen tus años totales consolidados.`,
    });
  }

  // Mención de título / grado universitario
  const degreeRequired = /\b(t[ií]tulo|licenciatura|ingenier[ií]a|universitari[ao]|carrera\s+profesional)\b/i.test(cleanJobText);
  if (degreeRequired) {
    const hasDegree = cvContent.education.length > 0;
    criticalRequirements.push({
      requirement: 'Título profesional o grado universitario afín',
      status: hasDegree ? 'FULFILLED' : 'MISSING',
      suggestion: hasDegree
        ? 'Título universitario acreditado en la sección de Educación.'
        : 'La oferta exige título universitario. Asegúrate de incluir tu grado académico o certificación habilitante.',
    });
  }

  // Mención de inglés o idioma extranjero
  const englishRequired = /\b(ingl[eé]s|english|b2|c1|biling[uü]e|avanzado|intermedio)\b/i.test(cleanJobText);
  if (englishRequired) {
    const mentionsEnglish = /\b(ingl[eé]s|english|b2|c1|fluent|biling)\b/i.test(cvCorpus);
    criticalRequirements.push({
      requirement: 'Dominio de inglés (intermedio o avanzado)',
      status: mentionsEnglish ? 'FULFILLED' : 'MISSING',
      suggestion: mentionsEnglish
        ? 'Dominio de inglés detectado en tu currículum.'
        : 'La vacante solicita inglés. Especifica tu nivel de idioma en las habilidades o resumen.',
    });
  }

  // 4. Calcular Match Score
  let score = 40; // Base por estructura completa
  if (prominentTerms.length > 0) {
    const keywordRatio = matchingKeywords.length / prominentTerms.length;
    score += Math.round(keywordRatio * 45);
  }
  if (criticalRequirements.every((r) => r.status === 'FULFILLED')) {
    score += 15;
  } else if (criticalRequirements.some((r) => r.status === 'FULFILLED')) {
    score += 8;
  }

  const finalScore = Math.min(100, Math.max(25, score));

  // 5. Redactar consejos directivos de adaptación
  const tailoredSummaryAdvice = missingKeywords.length > 0
    ? `Adapta tu resumen profesional para enfatizar tu experiencia con "${missingKeywords.slice(0, 3).join(', ')}" y alinear tu propuesta de valor con las prioridades de esta oferta.`
    : `Tu perfil presenta una alta afinidad léxica con la vacante. Refuerza tus mayores logros cuantificados en el resumen profesional.`;

  const highImpactActionAdvice: string[] = [];
  if (missingKeywords.length > 0) {
    highImpactActionAdvice.push(`Incorpora los términos clave "${missingKeywords.slice(0, 4).join(', ')}" en tus viñetas de experiencia laboral.`);
  }
  highImpactActionAdvice.push('Cuantifica tus responsabilidades con métricas STAR (volumen de personas, % de mejora o presupuesto gestionado).');
  if (finalScore >= 80) {
    highImpactActionAdvice.push('¡Excelente alineación! Estás listo para postular superando el filtro ATS con alta probabilidad.');
  } else {
    highImpactActionAdvice.push('Revisa los requisitos parciales o faltantes para asegurar que tu postulación no sea descartada en la primera fase.');
  }

  return {
    matchScore: finalScore,
    matchingKeywords: matchingKeywords.slice(0, 25),
    missingKeywords: missingKeywords.slice(0, 25),
    criticalRequirements,
    tailoredSummaryAdvice,
    highImpactActionAdvice,
  };
}
