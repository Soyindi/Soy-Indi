/**
 * ============================================================================
 * INDI CV QUALITY & GROUNDING GUARD ENGINE (2026)
 * ============================================================================
 * Motor de calidad editorial y anti-alucinación de métricas.
 * 1. Verifica que la IA no invente números, porcentajes o métricas no provistas por el usuario.
 * 2. Asigna un puntaje determinista (0-100) evaluando verbos de acción, longitud y ausencia de clichés.
 * 3. Prohíbe terminantemente marcadores no resueltos como "[añadir métrica]" en la salida final.
 */

export interface BulletQualityReport {
  score: number;
  hasStrongVerb: boolean;
  hasMetric: boolean;
  lengthBand: 'too_short' | 'ideal' | 'too_long';
  cliches: string[];
  placeholders: string[];
  weakOpeners: string[];
}

const STRONG_VERBS = [
  'lideré', 'diseñé', 'desarrollé', 'optimizé', 'coordiné', 'gestioné', 'implementé',
  'arquitecté', 'dirigí', 'evalué', 'diagnosticé', 'intervine', 'orquesté', 'automaticé',
  'reduje', 'incrementé', 'administré', 'formulé', 'supervisé', 'consolidé', 'articulé',
  'reestructuré', 'ejecuté', 'resolví', 'analicé', 'programé', 'facilité'
];

const WEAK_OPENERS = [
  'responsable de', 'encargado de', 'encargada de', 'a cargo de', 'participé en',
  'ayudé en', 'colaboré con', 'apoyo en', 'trabajé en', 'asistí en', 'hice', 'realicé'
];

const CLICHES = [
  'mejores prácticas de visión estratégica',
  'visión estratégica y liderazgo de equipos',
  'liderazgo de equipos en',
  'visión estratégica en',
  'proactivo',
  'orientado a resultados',
  'pensamiento out of the box',
  'sinergia',
  'jugador de equipo',
  'capacidad de trabajo bajo presión'
];

/**
 * Evalúa la calidad de una viñeta individual
 */
export function scoreBulletQuality(text: string): BulletQualityReport {
  const clean = (text || '').trim();
  const lower = clean.toLowerCase();

  const firstWord = lower.split(/\s+/)[0] || '';
  const hasStrongVerb = STRONG_VERBS.some((v) => lower.startsWith(v) || firstWord === v);
  const weakOpeners = WEAK_OPENERS.filter((w) => lower.startsWith(w));
  
  // Detección de métricas reales cuantitativas
  const hasMetric = /\b(?:\d+[%kKmM]?|\$\d+|\d+\s*(?:personas|usuarios|pacientes|clientes|meses|días|proyectos|alumnos|familias|casos|sesiones|horas|ms|s))\b/i.test(clean);

  // Detección de marcadores tipo [añadir métrica...]
  const placeholders = clean.match(/\[.*?\]/g) || [];

  // Detección de clichés o frases genéricas
  const foundCliches = CLICHES.filter((c) => lower.includes(c));

  // Evaluación de longitud ideal (entre 80 y 190 caracteres)
  let lengthBand: 'too_short' | 'ideal' | 'too_long' = 'ideal';
  if (clean.length < 50) lengthBand = 'too_short';
  else if (clean.length > 210) lengthBand = 'too_long';

  let score = 50;
  if (hasStrongVerb) score += 20;
  if (hasMetric) score += 20;
  if (lengthBand === 'ideal') score += 10;
  if (weakOpeners.length > 0) score -= 25;
  if (foundCliches.length > 0) score -= 30;
  if (placeholders.length > 0) score -= 20;

  return {
    score: Math.max(0, Math.min(100, score)),
    hasStrongVerb,
    hasMetric,
    lengthBand,
    cliches: foundCliches,
    placeholders,
    weakOpeners,
  };
}

/**
 * Grounding Guard: Verifica que los números o métricas presentes en la sugerencia
 * existieran previamente en el texto original (o hayan sido introducidos por el usuario).
 * Si la IA inventa un "aumenté 35%" de la nada, este guard lo detecta y lo frena.
 */
export function verifyBulletGrounding(sourceText: string, suggestedText: string): {
  isGrounded: boolean;
  hallucinatedMetrics: string[];
} {
  const sourceNumbers = (sourceText.match(/\b\d+(?:[.,]\d+)?%?\b/g) || []).map((n) => n.replace('%', ''));
  const suggestedNumbers = (suggestedText.match(/\b\d+(?:[.,]\d+)?%?\b/g) || []).map((n) => n.replace('%', ''));

  const hallucinatedMetrics: string[] = [];
  for (const num of suggestedNumbers) {
    if (!sourceNumbers.includes(num)) {
      hallucinatedMetrics.push(num);
    }
  }

  return {
    isGrounded: hallucinatedMetrics.length === 0,
    hallucinatedMetrics,
  };
}

/**
 * Filtra la lista global de habilidades del CV para preservar EXCLUSIVAMENTE
 * aquellas que guarden relación fáctica o léxica con el cargo y viñeta actual.
 * Evita que habilidades de otros cargos (ej: 'Evaluación psico-criminológica' o 'SHA-256')
 * se inyecten al optimizar un cargo ajeno (ej: 'Psicólogo Practicante' en SEREMI de Salud).
 */
export function filterRoleRelevantSkills(
  skills: string[] = [],
  role?: string,
  company?: string,
  bulletText?: string
): string[] {
  if (!Array.isArray(skills) || skills.length === 0) return [];
  const context = `${role || ''} ${company || ''} ${bulletText || ''}`.toLowerCase();
  if (!context.trim()) return [];

  // Palabras comunes a ignorar al comparar tokens
  const stopwords = new Set(['de', 'la', 'en', 'el', 'y', 'a', 'los', 'del', 'con', 'para', 'un', 'una', 'por']);

  return skills.filter((skill) => {
    const sLower = skill.toLowerCase().trim();
    if (!sLower) return false;

    // 1. Coincidencia directa completa en el contexto del cargo o viñeta
    if (context.includes(sLower)) return true;

    // 2. Coincidencia por tokens significativos (ej: 'diagnóstico', 'burnout', 'paliativos', 'rnr')
    const skillTokens = sLower
      .replace(/[^a-záéíóúñ0-9]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 3 && !stopwords.has(t));

    return skillTokens.some((token) => context.includes(token));
  });
}

/**
 * Lista de términos hipersensibles de alta especificidad de dominio
 * que suelen contaminarse indebidamente si el modelo LLM hace asociaciones libres.
 */
const DOMAIN_SPECIFIC_MARKERS = [
  { pattern: /\bpsico[- ]?criminol[oó]gic[oa]s?\b/gi, canonicalReplacement: 'de diagnóstico institucional e intervención' },
  { pattern: /\bmodelo\s+rnr\b/gi, canonicalReplacement: 'estándares técnicos de intervención' },
  { pattern: /\bcuidados\s+paliativos\b/gi, canonicalReplacement: 'atención en salud' },
  { pattern: /\bevent\s+sourcing\b/gi, canonicalReplacement: 'arquitectura de datos' },
  { pattern: /\bsha[- ]?256\b/gi, canonicalReplacement: 'integridad de datos' },
  { pattern: /\bpenitenciari[oa]s?\b/gi, canonicalReplacement: 'institucionales' },
];

/**
 * Validador y purgador post-generación de contaminación cruzada entre experiencias.
 * Si la sugerencia incluye términos de un dominio técnico ajeno que NO existían
 * en el texto original de la viñeta ni en el título del cargo, los purga o sustituye.
 */
export function verifyAndPurgeCrossRoleContamination(
  suggestedText: string,
  sourceText: string = '',
  role: string = '',
  company: string = ''
): { cleanText: string; hadContamination: boolean; contaminatedTerms: string[] } {
  let cleanText = suggestedText;
  const context = `${sourceText} ${role} ${company}`.toLowerCase();
  const contaminatedTerms: string[] = [];

  for (const marker of DOMAIN_SPECIFIC_MARKERS) {
    if (marker.pattern.test(cleanText)) {
      // Verificar si el término ya existía legítimamente en el cargo o viñeta original
      const testRegex = new RegExp(marker.pattern.source, 'i');
      if (!testRegex.test(context)) {
        contaminatedTerms.push(marker.pattern.source);
        cleanText = cleanText.replace(marker.pattern, marker.canonicalReplacement);
      }
    }
  }

  // Prevención de Fusión Causal Alucinada (Domain Conflation Bias) en perfiles multidisciplinarios:
  // Si el usuario tiene experiencia clínica y competencias de software paralelas, pero el texto original
  // NO afirma que haya creado software para registros clínicos o atención de pacientes, purgar ese nexo inventado.
  const sourceHasClinicalSoftwareLink = /\b(?:software|arquitecturas?\s+de\s+datos|inteligencia\s+artificial)\b[^.]*\b(?:registros?\s+cl[ií]nicos?|fichas?\s+cl[ií]nicas?|atenci[oó]n\s+cl[ií]nica|atenci[oó]n\s+integral|pacientes?)\b/i.test(sourceText);
  if (!sourceHasClinicalSoftwareLink) {
    const conflatedSoftwareClinicalRegex = /(?:,\s*)?optimizando\s+la\s+gesti[oó]n\s+de\s+registros?\s+cl[ií]nicos?[^.]*(?:atenci[oó]n\s+integral|pacientes?|cl[ií]nica)/gi;
    if (conflatedSoftwareClinicalRegex.test(cleanText)) {
      contaminatedTerms.push('fusión-causal-software-clínico');
      cleanText = cleanText.replace(
        conflatedSoftwareClinicalRegex,
        ', con sistemas y proyectos tecnológicos propios en producción orientados a la automatización y optimización de procesos'
      );
    }
  }

  // Limpiar posibles espacios dobles tras la sustitución
  cleanText = cleanText.replace(/\s{2,}/g, ' ').trim();

  return {
    cleanText,
    hadContamination: contaminatedTerms.length > 0,
    contaminatedTerms,
  };
}

/**
 * Sanitiza y repara sugerencias generadas por la IA:
 * 1. Remueve corchetes residuales o placeholders de plantilla como [especificar volumen], [añadir métrica de impacto]
 * 2. Verifica grounding frente al texto original para prevenir alucinaciones de cifras inventadas
 * 3. Purga contaminación cruzada entre roles
 */
export function sanitizeAndGroundAiBullet(
  suggestedBullet: string,
  sourceText?: string,
  role?: string,
  company?: string
): { cleanText: string; isGrounded: boolean; hallucinatedMetrics: string[] } {
  let cleanText = suggestedBullet;

  // 1. Eliminar marcadores entre corchetes
  cleanText = cleanText.replace(/\[(?:especificar|añadir|completar|ingresar|indicar)[^\]]*\]/gi, '').trim();
  cleanText = cleanText.replace(/\[[^\]]{3,35}\]/g, '').trim();

  // 2. Purgar contaminación cruzada de términos de otros puestos
  const isolationCheck = verifyAndPurgeCrossRoleContamination(cleanText, sourceText, role, company);
  cleanText = isolationCheck.cleanText;

  // Limpiar posibles espacios dobles o comas huérfanas dejadas por el borrado
  cleanText = cleanText
    .replace(/\s+([,\.])/g, '$1')
    .replace(/\s*,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Asegurar punto final
  if (cleanText && !cleanText.endsWith('.')) {
    cleanText += '.';
  }

  // 3. Verificación de Grounding si se proveyó texto fuente
  if (sourceText && sourceText.trim().length > 0) {
    const check = verifyBulletGrounding(sourceText, cleanText);
    return {
      cleanText,
      isGrounded: check.isGrounded,
      hallucinatedMetrics: check.hallucinatedMetrics,
    };
  }

  return {
    cleanText,
    isGrounded: true,
    hallucinatedMetrics: [],
  };
}
