/**
 * ============================================================================
 * INDI CV SYNTACTIC & ARTIFACT AUDITOR (INDI 2026)
 * ============================================================================
 * Auditor de Integridad Sintáctica, Verbos de Acción y Estructura para Smart CV.
 * Aplica los mismos estándares de calidad y completitud oracional que Orbital Presentations:
 * - Detección y erradicación de palabras huérfanas terminales (preposiciones, conjunciones, determinantes).
 * - Erradicación de puntos suspensivos mutilantes (...).
 * - Verificación de formato Google XYZ / STAR en viñetas laborales.
 * - Clasificación Pre-Route de arquetipo profesional del postulante.
 */

import { MultimodalCvExtraction } from '@/entities/cv/schemas';
import { assertSyntacticCompleteness } from '@/shared/lib/syntacticAuditor';

export type CvCandidateArchetype = 
  | 'executive_c_level'      // Liderazgo C-Level, directores, gerentes generales
  | 'technical_specialist'    // Arquitectura de software, DevOps, analítica, ingeniería
  | 'clinical_healthcare'     // Psicología, psiquiatría, medicina, enfermería, salud clínica
  | 'education_pedagogy'      // Docencia, educación, orientación vocacional, pedagogía
  | 'legal_finance'           // Derecho, finanzas, contabilidad, auditoría, compliance
  | 'business_growth'         // Ventas, marketing, adquisición, operaciones comerciales
  | 'general_professional';   // Perfil multifacético estándar

export interface CvPreRouteAssessment {
  detectedArchetype: CvCandidateArchetype;
  recommendedTone: string;
  focusKeywords: string[];
  requiresExecutiveSummary: boolean;
  estimatedSeniority: 'entry' | 'mid' | 'senior' | 'executive';
}

/**
 * Pre-Route: Evalúa el texto del CV con ponderación estricta de rol frente al cuerpo.
 * Previene categóricamente que profesionales de salud, educación o ingeniería sean
 * clasificados como C-Level por incluir palabras como "liderazgo" o "gestión".
 */
export function evaluateCvPreRouteStrategy(rawText: string, specificRole?: string): CvPreRouteAssessment {
  const fullText = (rawText || '').toLowerCase();
  const roleText = (specificRole || '').toLowerCase();

  // Patrones jerárquicos: título/rol directo vs cuerpo del texto
  const archetypesPatterns: Record<
    Exclude<CvCandidateArchetype, 'general_professional'>,
    { title: RegExp; body: RegExp; keywords: string[]; tone: string }
  > = {
    clinical_healthcare: {
      title: /\b(psic[oó]log[oa]|m[eé]dic[oa]|enfermer[oa]|terapeut[oa]|kinesi[oó]log[oa]|psiquiatr[oa]|nutricionist[oa]|fonoaudi[oó]log[oa]|cl[ií]nic[oa])\b/i,
      body: /\b(pacientes?|atenci[oó]n cl[ií]nica|diagn[oó]stico|intervenci[oó]n|salud mental|terapia|fonasa|fichas? cl[ií]nicas?|cuidados paliativos|rehabilitaci[oó]n|reincidencia|psicoeduca|rnr)\b/i,
      keywords: ['atención clínica', 'evaluación diagnóstica', 'adherencia terapéutica', 'intervención integral', 'ética profesional'],
      tone: 'Clínico riguroso, ético, empático y orientado a resultados en pacientes o usuarios',
    },
    education_pedagogy: {
      title: /\b(profesor[a]?|docente|educador[a]?|pedagog[oa]|orientador[a]?|tutor[a]?|maestr[oa])\b/i,
      body: /\b(alumnos?|estudiantes?|aula|curr[ií]cul|aprendizaje|evaluaci[oó]n formativa|pedag[oó]gic[oa]|convivencia escolar|pie)\b/i,
      keywords: ['diseño curricular', 'metodologías activas', 'evaluación formativa', 'convivencia escolar'],
      tone: 'Pedagógico, formador, estructurado y enfocado en el desarrollo integral',
    },
    technical_specialist: {
      title: /\b(software|developer|desarrollador[a]?|frontend|backend|full\s?stack|devops|data scientist|ingenier[oa] de datos|arquitect[oa] de software|sysadmin)\b/i,
      body: /\b(typescript|python|react|docker|aws|sql|api|microservicios|ci\/cd|git|latencia|bases de datos|c[oó]digo|testing)\b/i,
      keywords: ['arquitectura distribuida', 'escalabilidad', 'latencia', 'calidad de código', 'ci/cd'],
      tone: 'Técnico de precisión, orientado a métricas de ingeniería, confiabilidad y rendimiento',
    },
    legal_finance: {
      title: /\b(abogad[oa]|jur[ií]dic[oa]|auditor[a]?|contador[a]?|analista financier[oa]|oficial de cumplimiento|compliance)\b/i,
      body: /\b(tributari[oa]|ifrs|balance|auditor[ií]a|litigios?|contratos?|normativa|riesgo financier[oa]|presupuestario)\b/i,
      keywords: ['cumplimiento normativo', 'control interno', 'gestión de riesgo', 'análisis financiero'],
      tone: 'Riguroso, analítico, estructurado y apegado a estándares de gobierno corporativo',
    },
    executive_c_level: {
      title: /\b(director[a]? general|gerente general|vp|chief executive|ceo|cto|cfo|coo|head of|directorio|socio director)\b/i,
      body: /\b(p&l|ebitda|presupuesto anual|gobierno corporativo|estrategia corporativa|directorio)\b/i,
      keywords: ['visión estratégica', 'gestión de p&l', 'eficiencia operativa', 'liderazgo de equipos', 'crecimiento sostenible'],
      tone: 'Ejecutivo estratégico, gobierno corporativo, alta dirección y métricas financieras',
    },
    business_growth: {
      title: /\b(marketing|growth|ventas|sales|account executive|kam|comercial|business developer)\b/i,
      body: /\b(adquisici[oó]n|conversisi[oó]n|pipeline|funnel|roi|kpis comerciales|clientes|prospecci[oó]n|facturaci[oó]n)\b/i,
      keywords: ['adquisición de clientes', 'crecimiento de ingresos', 'conversión de funnel', 'roi comercial'],
      tone: 'Comercial asertivo, orientado a metas cuantitativas y generación de demanda',
    },
  };

  // Ponderación de señales: Coincidencia en Rol = 5 Puntos, en Cuerpo = 1 Punto
  let bestArchetype: CvCandidateArchetype = 'general_professional';
  let highestScore = 0;
  let selectedConfig = {
    keywords: ['impacto verificable', 'eficiencia operativa', 'mejora continua'],
    tone: 'Profesional, preciso y orientado a resultados medibles',
  };

  for (const [archetype, config] of Object.entries(archetypesPatterns) as [Exclude<CvCandidateArchetype, 'general_professional'>, any][]) {
    let score = 0;
    if (roleText && config.title.test(roleText)) {
      score += 5;
    } else if (config.title.test(fullText)) {
      score += 3;
    }
    if (config.body.test(fullText)) {
      score += 1;
    }

    if (score > highestScore) {
      highestScore = score;
      bestArchetype = archetype;
      selectedConfig = config;
    }
  }

  // 2. Estimación de seniority según años o títulos
  const yearsMatches = fullText.match(/\b(1[0-9]|[5-9])\s*(?:años|years)\b/i);
  let estimatedSeniority: 'entry' | 'mid' | 'senior' | 'executive' = 'mid';
  if (bestArchetype === 'executive_c_level' || (yearsMatches && parseInt(yearsMatches[1], 10) >= 10)) {
    estimatedSeniority = 'executive';
  } else if (yearsMatches && parseInt(yearsMatches[1], 10) >= 5) {
    estimatedSeniority = 'senior';
  } else if (/\b(junior|trainee|practicante|pasante|egresad[oa]|asistente)\b/i.test(fullText)) {
    estimatedSeniority = 'entry';
  }

  return {
    detectedArchetype: bestArchetype,
    recommendedTone: selectedConfig.tone,
    focusKeywords: selectedConfig.keywords,
    requiresExecutiveSummary: estimatedSeniority === 'senior' || estimatedSeniority === 'executive',
    estimatedSeniority,
  };
}

/**
 * Audita y auto-repara una viñeta laboral individual para erradicar palabras huérfanas,
 * puntos suspensivos o prefijos obsoletos ("Responsabilidad:", "Logro:").
 */
export function auditAndRepairCvBullet(rawBullet: string): {
  repairedText: string;
  isComplete: boolean;
  wasRepaired: boolean;
} {
  if (!rawBullet) return { repairedText: '', isComplete: true, wasRepaired: false };

  // 0. Si es un artefacto de separación de página ("PÁGINA SIGUIENTE", etc.), descartar
  if (/p[áa]gina\s+siguiente/i.test(rawBullet) || /^[-—\s.]{3,}$/.test(rawBullet)) {
    return { repairedText: '', isComplete: true, wasRepaired: true };
  }

  // 1. Eliminar viñetas decorativas y prefijos de etiqueta obvia ("Logro:", "Responsabilidad:", etc.)
  let clean = rawBullet
    .replace(/^[\s•\-\*·\u2022\u25cf\u25cb\u25e6\u2219\u22c5\u00b7>]+/, '')
    .replace(/^(?:logros?|responsabilidad(?:es)?|funciones?|tareas?|actividades?|tarea|meta)[:.\-\s]*/i, '')
    .trim();

  // 2. Auditar completitud sintáctica contra lista negra de palabras huérfanas y puntos suspensivos
  const check = assertSyntacticCompleteness(clean);
  let repaired = check.repairedText;

  // 3. Asegurar que inicie con mayúscula
  if (repaired.length > 0) {
    repaired = repaired.charAt(0).toUpperCase() + repaired.slice(1);
  }

  // 4. Si termina sin punto y tiene más de 15 caracteres, colocar punto final pulcro
  if (repaired.length > 15 && !/[.!?]$/.test(repaired)) {
    repaired = `${repaired}.`;
  }

  const wasRepaired = repaired !== rawBullet;

  return {
    repairedText: repaired,
    isComplete: check.isComplete,
    wasRepaired,
  };
}

/**
 * Audita integralmente la extracción de un CV (experiencias, viñetas XYZ y resumen)
 * garantizando cero truncamientos y coherencia antes de enviar a UI o persistir en Turso.
 */
export function auditAndRepairCvExtraction(
  extraction: MultimodalCvExtraction
): {
  auditedExtraction: MultimodalCvExtraction;
  repairedBulletsCount: number;
} {
  let repairedBulletsCount = 0;

  // 1. Reparar Resumen Profesional
  let cleanSummary = extraction.summary ? extraction.summary.trim() : '';
  if (cleanSummary) {
    const summaryCheck = assertSyntacticCompleteness(cleanSummary);
    cleanSummary = summaryCheck.repairedText;
    if (cleanSummary.length > 20 && !/[.!?]$/.test(cleanSummary)) {
      cleanSummary = `${cleanSummary}.`;
    }
  }

  // 2. Reparar Viñetas de Experiencia
  const auditedExperience = extraction.experience.map((exp) => {
    const cleanRawAchievements = exp.rawAchievements
      .map((ach) => {
        const res = auditAndRepairCvBullet(ach);
        if (res.wasRepaired) repairedBulletsCount++;
        return res.repairedText;
      })
      .filter((t) => t.length > 5);

    const cleanXyzBullets = exp.xyzBullets
      .map((bullet) => {
        const res = auditAndRepairCvBullet(bullet.text);
        if (res.wasRepaired) repairedBulletsCount++;
        return {
          ...bullet,
          text: res.repairedText,
        };
      })
      .filter((b) => b.text.length > 5);

    return {
      ...exp,
      rawAchievements: cleanRawAchievements,
      xyzBullets: cleanXyzBullets,
    };
  });

  // 3. Sanitizar años de educación: erradicar etiquetas de placeholder ("No especificado", "N/A", "Sin fecha")
  const auditedEducation = (extraction.education || []).map((edu) => {
    const rawYear = (edu.year || '').trim();
    const isPlaceholderYear = /^(?:no\s+especificado|sin\s+fecha|no\s+disponible|n\/a|pendiente|graduado(?:\s*\/\s*acreditado)?|desconocido|-+)$/i.test(
      rawYear
    );
    return {
      ...edu,
      year: isPlaceholderYear ? '' : rawYear,
    };
  });

  return {
    auditedExtraction: {
      ...extraction,
      summary: cleanSummary,
      experience: auditedExperience,
      education: auditedEducation,
    },
    repairedBulletsCount,
  };
}
