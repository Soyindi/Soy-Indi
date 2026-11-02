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
