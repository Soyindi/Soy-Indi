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
import { assertSyntacticCompleteness } from '@/features/orbital-presentations/lib/presentation-auditor';

export type CvCandidateArchetype = 
  | 'executive_c_level'      // Liderazgo, EBITDA, dirección estratégica, gestión de equipos
  | 'technical_specialist'    // Arquitectura de software, DevOps, analítica, ingeniería
  | 'clinical_healthcare'     // Psicología, medicina, salud, terapias
  | 'business_growth'         // Ventas, marketing, adquisición, operaciones
  | 'general_professional';   // Perfil multifacético estándar

export interface CvPreRouteAssessment {
  detectedArchetype: CvCandidateArchetype;
  recommendedTone: string;
  focusKeywords: string[];
  requiresExecutiveSummary: boolean;
  estimatedSeniority: 'entry' | 'mid' | 'senior' | 'executive';
}

/**
 * Pre-Route: Evalúa el texto crudo del CV en microsegundos para determinar el arquetipo
 * y ajustar los prompts del Cascade AI Router con enfoque quirúrgico.
 */
export function evaluateCvPreRouteStrategy(rawText: string): CvPreRouteAssessment {
  const text = (rawText || '').toLowerCase();

  // 1. Detección de arquetipo
  const hasTech = /\b(software|developer|frontend|backend|full\s?stack|typescript|python|react|docker|aws|sql|api|arquitectura)\b/i.test(text);
  const hasExecutive = /\b(director|gerente|vp|head\s?of|chief|ceo|cto|cfo|liderazgo|presupuesto|ebitda|directorio)\b/i.test(text);
  const hasHealth = /\b(psic[oó]log|m[eé]dic|terapeuta|salud|cl[ií]nic|paciente|atenci[oó]n|fonasa)\b/i.test(text);
  const hasGrowth = /\b(marketing|ventas|sales|growth|adquisici[oó]n|roi|kpis|comercial|negocios)\b/i.test(text);

  let detectedArchetype: CvCandidateArchetype = 'general_professional';
  let focusKeywords: string[] = ['impacto', 'resultados', 'optimización'];
  let recommendedTone = 'Profesional y estructurado con logros verificables';

  if (hasExecutive) {
    detectedArchetype = 'executive_c_level';
    focusKeywords = ['visión estratégica', 'liderazgo de equipos', 'ebitda', 'eficiencia operativa'];
    recommendedTone = 'Ejecutivo de alto nivel, métricas de negocio y gobierno corporativo';
  } else if (hasTech) {
    detectedArchetype = 'technical_specialist';
    focusKeywords = ['arquitectura distribuida', 'escalabilidad', 'latencia', 'calidad de código'];
    recommendedTone = 'Técnico de precisión, impacto en ingeniería y rendimiento';
  } else if (hasHealth) {
    detectedArchetype = 'clinical_healthcare';
    focusKeywords = ['atención clínica', 'evaluación diagnóstica', 'adherencia terapéutica', 'bienestar'];
    recommendedTone = 'Clínico riguroso, ético y orientado al impacto en pacientes';
  } else if (hasGrowth) {
    detectedArchetype = 'business_growth';
    focusKeywords = ['conversión', 'adquisición', 'retención', 'roi'];
    recommendedTone = 'Comercial asertivo con métricas de ingresos y funnel';
  }

  // 2. Estimación de seniority según años o menciones
  const yearsMatches = text.match(/\b(1[0-9]|[5-9])\s*(?:años|years)\b/i);
  let estimatedSeniority: 'entry' | 'mid' | 'senior' | 'executive' = 'mid';
  if (hasExecutive || (yearsMatches && parseInt(yearsMatches[1], 10) >= 10)) {
    estimatedSeniority = 'executive';
  } else if (yearsMatches && parseInt(yearsMatches[1], 10) >= 5) {
    estimatedSeniority = 'senior';
  } else if (/\b(junior|trainee|practicante|pasante|egresad[oa]|asistente)\b/i.test(text)) {
    estimatedSeniority = 'entry';
  }

  return {
    detectedArchetype,
    recommendedTone,
    focusKeywords,
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
    const cleanRawAchievements = exp.rawAchievements.map((ach) => {
      const res = auditAndRepairCvBullet(ach);
      if (res.wasRepaired) repairedBulletsCount++;
      return res.repairedText;
    });

    const cleanXyzBullets = exp.xyzBullets.map((bullet) => {
      const res = auditAndRepairCvBullet(bullet.text);
      if (res.wasRepaired) repairedBulletsCount++;
      return {
        ...bullet,
        text: res.repairedText,
      };
    });

    return {
      ...exp,
      rawAchievements: cleanRawAchievements,
      xyzBullets: cleanXyzBullets,
    };
  });

  return {
    auditedExtraction: {
      ...extraction,
      summary: cleanSummary,
      experience: auditedExperience,
    },
    repairedBulletsCount,
  };
}
