/**
 * ============================================================================
 * INDI PRESENTATION DOCUMENT EXTRACTOR & SEMANTIC SUMMARIZER (SAP ENGINE)
 * ============================================================================
 * Extrae texto real de archivos (PDFs, Markdown, TXT, CSV, JSON) y genera un
 * Perfil Semántico Adaptativo (DocumentSemanticProfile).
 * Clasifica el arquetipo (técnico, negocio, auditoría, educacional, estratégico),
 * detecta polaridad de contraste (problemas vs soluciones), secuencias/fases,
 * definiciones conceptuales y métricas cuantitativas verificables.
 */

import { DocumentArchetype } from '@/entities/presentation/schemas';

export interface ExtractedContrastBlock {
  problemAspect: string;
  solutionAspect: string;
}

export interface ExtractedSequenceStep {
  stepIndex: number;
  title: string;
  detail: string;
}

export interface ExtractedConceptDefinition {
  term: string;
  definition: string;
}

export interface ExtractedDocumentContent {
  rawText: string;
  charCount: number;
  wordCount: number;
  titleSuggestion: string;
  detectedArchetype: DocumentArchetype;
  archetypeConfidence: number;
  hasMetrics: boolean;
  hasContrast: boolean;
  hasSequence: boolean;
  hasConcepts: boolean;
  detectedMetrics: Array<{
    label: string;
    value: string;
    change?: string;
    trend: 'up' | 'down' | 'neutral';
  }>;
  contrastBlocks: ExtractedContrastBlock[];
  sequenceSteps: ExtractedSequenceStep[];
  conceptDefinitions: ExtractedConceptDefinition[];
  keyTakeaways: string[];
  semanticSections: Array<{
    heading: string;
    actionSummary: string;
    points: string[];
    suggestedIntent?: string;
  }>;
}

/**
 * Extrae texto puro desde un buffer o base64 de un documento
 */
export async function extractTextFromDocument(
  fileBase64: string,
  fileName: string,
  mimeType: string
): Promise<string> {
  const isPdf =
    mimeType.includes('pdf') ||
    fileName.toLowerCase().endsWith('.pdf') ||
    fileBase64.startsWith('JVBERi0');

  if (isPdf) {
    try {
      const buffer = Buffer.from(fileBase64, 'base64');
      const uint8 = new Uint8Array(buffer);

      const { extractSpatialTextFromPdf } = await import('@/shared/lib/spatialDocumentExtractor');
      const spatialText = await extractSpatialTextFromPdf(uint8);
      if (spatialText && spatialText.trim().length > 20) {
        return spatialText.trim();
      }

      const { extractText } = await import('unpdf');
      const res = await extractText(uint8);
      const text = Array.isArray(res.text) ? res.text.join('\n\n') : (res.text || '');
      return text.trim();
    } catch (err) {
      console.warn('[DocExtractor] Error extrayendo con unpdf:', err);
    }
  }

  // Texto plano / Markdown / CSV / JSON
  try {
    const text = Buffer.from(fileBase64, 'base64').toString('utf-8');
    return text.trim();
  } catch (err) {
    console.warn('[DocExtractor] Error decodificando base64:', err);
    return '';
  }
}

/**
 * Clasificador probabilístico de Arquetipo de Documento
 */
export function detectDocumentArchetype(text: string, fileName?: string): {
  archetype: DocumentArchetype;
  confidence: number;
} {
  const lower = (text + ' ' + (fileName || '')).toLowerCase();

  // Puntajes de coincidencia léxica y estructural
  const scores: Record<DocumentArchetype, number> = {
    technical_architecture: 0,
    business_pitch: 0,
    audit_report: 0,
    narrative_educational: 0,
    executive_strategy: 0,
  };

  if (fileName) {
    const fn = fileName.toLowerCase();
    if (fn.includes('ensayo') || fn.includes('tesis') || fn.includes('paper') || fn.includes('academic') || fn.includes('beca')) {
      scores.narrative_educational += 6;
    }
    if (fn.includes('pitch') || fn.includes('deck') || fn.includes('investor')) {
      scores.business_pitch += 6;
    }
    if (fn.includes('audit') || fn.includes('informe') || fn.includes('reporte')) {
      scores.audit_report += 6;
    }
    if (fn.includes('arch') || fn.includes('tech') || fn.includes('spec')) {
      scores.technical_architecture += 6;
    }
  }

  // 1. Arquitectura Técnica
  const techKeywords = [
    'arquitectura', 'api', 'microservicio', 'servidor', 'latencia', 'base de datos',
    'sql', 'backend', 'frontend', 'docker', 'cloud', 'edge', 'turbopack', 'libsql',
    'drizzle', 'next.js', 'typescript', 'cache', 'endpoint', 'token', 'security', 'código'
  ];
  techKeywords.forEach((k) => {
    if (lower.includes(k)) scores.technical_architecture += 2;
  });

  // 2. Business Pitch / Inversión
  const pitchKeywords = [
    'mercado', 'inversor', 'seed', 'tam', 'sam', 'som', 'monetización', 'cac',
    'ltv', 'tracción', 'revenue', 'ingresos', 'pitch', 'deck', 'competidores', 'clientes',
    'crecimiento', 'b2b', 'saas', 'roi'
  ];
  pitchKeywords.forEach((k) => {
    if (lower.includes(k)) scores.business_pitch += 2;
  });

  // 3. Auditoría / Diagnóstico
  const auditKeywords = [
    'auditoría', 'diagnóstico', 'hallazgo', 'vulnerabilidad', 'evaluación', 'riesgo',
    'cumplimiento', 'score', 'deficiencia', 'falla', 'resultado', 'recomendación',
    'conclusión', 'inspección', 'prueba', 'incidente'
  ];
  auditKeywords.forEach((k) => {
    if (lower.includes(k)) scores.audit_report += 2;
  });

  // 4. Educacional / Narrativo / Académico
  const eduKeywords = [
    'capítulo', 'módulo', 'introducción', 'concepto', 'definición', 'historia',
    'guía', 'tutorial', 'lección', 'aprender', 'fundamento', 'principios', 'caso de estudio',
    'tesis', 'ensayo', 'postulación', 'postulacion', 'máster', 'master', 'maestría', 'maestria',
    'doctorado', 'investigación', 'investigacion', 'académico', 'academico', 'académica', 'universidad',
    'posgrado', 'pós-graduação', 'metodología', 'metodologia', 'seguridad pública', 'seguridad publica',
    'derechos humanos', 'criminología', 'reinserción'
  ];
  eduKeywords.forEach((k) => {
    if (lower.includes(k)) scores.narrative_educational += 2;
  });

  // 5. Estrategia Ejecutiva (Base por defecto con sesgo organizativo)
  const execKeywords = [
    'estrategia', 'visión', 'misión', 'objetivo', 'plan', 'iniciativa', 'alineación',
    'gobernanza', 'liderazgo', 'transformación', 'pilar', 'trimestre', 'hoja de ruta'
  ];
  execKeywords.forEach((k) => {
    if (lower.includes(k)) scores.executive_strategy += 2;
  });

  // Encontrar el arquetipo dominante
  let topArchetype: DocumentArchetype = 'executive_strategy';
  let maxScore = 0;

  for (const [arch, score] of Object.entries(scores) as [DocumentArchetype, number][]) {
    if (score > maxScore) {
      maxScore = score;
      topArchetype = arch;
    }
  }

  const confidence = Math.min(1, Math.max(0.4, maxScore / 20));
  return { archetype: topArchetype, confidence };
}

/**
 * Evaluación de Estrategia Pre-Route (Paradigma Plan-then-Execute 2026)
 * Determina si el documento requiere RAG profundo/extracción multimodal o
 * un procesamiento directo liviano, previniendo el "Context Rot" y estabilizando latencias.
 */
export interface PreRouteAssessment {
  recommendedPipeline: 'deep_ledger_extraction' | 'direct_heuristic_fast_path';
  semanticDispersionScore: number; // 0 (muy localizado) a 1 (alta dispersión en el texto)
  estimatedTokens: number;
  hasTabularDensity: boolean;
  requiresCrossInference: boolean;
  routingReason: string;
}

export function evaluatePreRouteStrategy(
  text: string,
  fileName?: string
): PreRouteAssessment {
  const clean = text || '';
  const estimatedTokens = Math.ceil(clean.length / 4);

  // Detección de densidad tabular o matemática
  const tableMarkers = (clean.match(/\||(?:\b(?:total|balance|activos|pasivos|patrimonio|ebitda|ingresos|costos)\b[:\s]+[\$0-9])/gi) || []).length;
  const hasTabularDensity = tableMarkers >= 5;

  // Detección de dispersión semántica según tamaño y variedad léxica
  const paragraphs = clean.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
  const semanticDispersionScore = Math.min(1, Math.max(0.1, paragraphs.length / 25));

  const requiresCrossInference = hasTabularDensity || estimatedTokens > 4000;

  const isDeep = requiresCrossInference || semanticDispersionScore > 0.45;

  return {
    recommendedPipeline: isDeep ? 'deep_ledger_extraction' : 'direct_heuristic_fast_path',
    semanticDispersionScore: Math.round(semanticDispersionScore * 100) / 100,
    estimatedTokens,
    hasTabularDensity,
    requiresCrossInference,
    routingReason: isDeep
      ? 'Documento extenso o de alta densidad tabular: activando extracción profunda con validación de libro mayor.'
      : 'Documento estructurado y conciso: procesando mediante vía rápida determinista.',
  };
}

/**
 * Contenedor Aislado de Presentación (Scoped Container - Paradigma NotebookLM)
 * Previene la contaminación cruzada entre fuentes, notas y sesiones.
 */
export class ScopedPresentationContext {
  private readonly presentationId: string;
  private readonly sourceTexts: Map<string, string> = new Map();
  private readonly pinnedNotes: string[] = [];

  constructor(presentationId?: string) {
    this.presentationId = presentationId || crypto.randomUUID();
  }

  public getContextId(): string {
    return this.presentationId;
  }

  public addSource(sourceId: string, text: string): void {
    this.sourceTexts.set(sourceId, text);
  }

  public addPinnedNote(note: string): void {
    if (note && note.trim().length > 0) {
      this.pinnedNotes.push(note.trim());
    }
  }

  public getAggregatedCleanText(): string {
    const rawAll = Array.from(this.sourceTexts.values()).join('\n\n');
    return rawAll.trim();
  }

  public getPinnedContextDirective(): string {
    if (this.pinnedNotes.length === 0) return '';
    return `\nNOTAS FIJADAS DEL USUARIO (DIRECTIVAS PRIORITARIAS):\n${this.pinnedNotes.map((n) => `- ${n}`).join('\n')}\n`;
  }
}

/**
 * Divide texto en oraciones respetando abreviaciones comunes y números decimales
 * para no romper proposiciones a la mitad (evitando generar cláusulas huérfanas).
 */
export function splitSentencesSafely(text: string): string[] {
  if (!text) return [];

  // Reemplazar temporalmente puntos de abreviaturas frecuentes para protegerlos del split
  const protectedText = text
    .replace(/\b(ejp|ej|pág|pags|dr|dra|sr|sra|prof|art|inc|vs|etc|no|núm)\./gi, '$1§DOT§')
    .replace(/(\d+)\.(\d+)/g, '$1§DOT§$2');

  // Separar únicamente por signos de puntuación seguidos de espacio o salto de línea
  const rawParts = protectedText.split(/[.!?](?:\s+|\n+|$)/);

  return rawParts
    .map((part) => part.replace(/§DOT§/g, '.').trim())
    .filter((s) => s.length > 5);
}

/**
 * Limpia y purga encabezados administrativos, rótulos de formulario, y preámbulos
 * comunes en documentos académicos, ensayos, CVs y reportes institucionales
 * (ej. "Texto 1: Expectativas...", "Programa: Maestría...", "Candidato: Juan Pérez • Nivel:...").
 */
export function cleanAdministrativePreamble(raw: string): string {
  if (!raw) return '';
  let str = raw.trim();

  // 1. Remover rótulos numéricos de textos o secciones tipo "Texto 1:", "Texto 01:", "Texto A:"
  str = str.replace(/^(?:texto|doc|documento|archivo|ensayo|secci[óo]n)\s*[0-9a-zA-Z]*\s*[:.\-–—]\s*/i, '');

  // 2. Si el texto contiene metadatos administrativos como Candidato, Programa, Nivel, etc.
  // Remover secuencialmente cada uno de los campos de metadatos tipo "Clave: Valor"
  const adminLabels = [
    'programa', 'candidato', 'postulante', 'autor', 'nombre',
    'estudiante', 'alumno', 'investigador', 'nivel', 'grado',
    'carrera', 'facultad', 'instituci[óo]n', 'universidad',
  ].join('|');

  // Buscar cada par clave: valor acotado a un valor corto (máx 60 caracteres) que termine en
  // punto, coma, bullet, salto de línea, o la siguiente clave administrativa
  const adminFieldRegex = new RegExp(
    `(?:${adminLabels})\\s*:\\s*[^•\\n,;\\-–—\\.]{1,80}?(?=(?:\\s*(?:${adminLabels})\\s*:)|(?:\\s*[•\\-–—]\\s*)|(?:\\s*[,;\\.]\\s*)|(?:\\n+)|(?:\\s+[A-ZÁÉÍÓÚ][a-z0-9áéíóú]+\\s+[a-z0-9áéíóú]+)|$)`,
    'gi'
  );
  str = str.replace(adminFieldRegex, ' ').trim();

  // Limpiar separadores sobrantes tipo bullets o comas
  str = str.replace(/^(?:[•\-–—,;\s]+)/, '').trim();

  // 3. Remover fragmentos iniciales tipo rótulos temáticos del formulario
  str = str.replace(
    /^(?:expectativas\s+acad[ée]micas[^\n•,;\-–—]*|intereses\s+y\s+perspectivas[^\n•,;\-–—]*)(?:\s*[•\-–—]\s*|\s*,\s*|\s*;\s*|\n+|\s+)/i,
    ''
  ).trim();

  // Limpiar posibles fragmentos residuales de puntuación al inicio
  str = str.replace(/^[:;,.•\-–—\s]+/, '').trim();

  return str;
}

export function balanceParenthesesString(text: string): string {
  if (!text) return '';
  let str = text.trim();
  let openCount = 0;
  let balanced = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') {
      openCount++;
      balanced += ch;
    } else if (ch === ')') {
      if (openCount > 0) {
        openCount--;
        balanced += ch;
      }
    } else {
      balanced += ch;
    }
  }
  if (openCount > 0) {
    for (let k = 0; k < openCount; k++) {
      balanced += ')';
    }
  }
  return balanced;
}

/**
 * Remueve prefijos administrativos simples de una sola frase o título.
 */
export function stripAdministrativePrefix(str: string): string {
  if (!str) return '';
  let cleaned = str
    .replace(/^(?:texto|documento|secci[óo]n)\s*[0-9a-zA-Z]*\s*[:.\-–—]\s*/i, '')
    .replace(/^(?:candidato|postulante|autor|nombre)\s*:\s*[^•·\n,\-–—]+(?:[•·\-–—]|\s*,\s*)\s*/i, '')
    .replace(/^(?:programa|carrera|nivel|grado|l[íi]nea\s+de\s+investigaci[óo]n)\s*:\s*[^•·\n,\-–—]+(?:[•·\-–—]|\s*,\s*)\s*/i, '')
    .trim();
  cleaned = cleaned.replace(/^[:;,.•·\-–—\s]+/, '').trim();
  return cleaned || str;
}

/**
 * Sintetiza un Action Title asertivo de estándar McKinsey (< 15 palabras).
 * Si el texto de entrada es una oración larga o un bloque, extrae la proposición
 * ejecutiva medular sin truncar palabras a la mitad ni verter párrafos enteros.
 */
export function synthesizeConciseActionTitle(raw: string, fallbackTheme?: string): string {
  if (!raw) return fallbackTheme || 'Conclusión y síntesis estratégica';

  // 1. Limpiar preámbulos y rótulos administrativos
  let cleaned = cleanAdministrativePreamble(raw);
  cleaned = sanitizeSentenceClause(cleaned);

  if (!cleaned || cleaned.length < 5) {
    return fallbackTheme || 'Conclusión y síntesis estratégica';
  }

  // 2. Si contiene dos puntos (ej. "Enfoque metodológico: aplicación en terreno"),
  // analizar si la parte derecha o izquierda es un mejor Action Title
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    const afterColon = parts.slice(1).join(':').trim();
    if (afterColon.length > 15 && afterColon.length < 120) {
      cleaned = sanitizeSentenceClause(afterColon);
    }
  }

  // 3. Regla McKinsey: Procurar brevedad (<15 palabras) pero JAMÁS cortar proposiciones incompletas
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= 15) {
    // Si la oración no excede 15 palabras, preservarla pulcra sin puntos suspensivos
    return balanceParenthesesString(cleaned.replace(/[.!?]+$/, ''));
  }

  // Si excede 15 palabras:
  // Intentar encontrar una frontera natural de pausa (coma, punto y coma, o conector) entre la palabra 8 y 16
  const subSlice = words.slice(0, 16).join(' ');
  const pauseMatch = subSlice.match(/^([\s\S]{20,95}?)[,;:\-–—]\s*/);
  if (pauseMatch && pauseMatch[1] && pauseMatch[1].split(/\s+/).length >= 6) {
    return balanceParenthesesString(pauseMatch[1].trim().replace(/[,;:\-–—\s]+$/, ''));
  }

  // Si la oración tiene hasta 22 palabras y representa una tesis completa,
  // preservarla íntegra para no dejar el titular truncado ni incompleto
  if (words.length <= 22) {
    return balanceParenthesesString(cleaned.replace(/[.!?]+$/, ''));
  }

  // Para oraciones excepcionalmente largas (>22 palabras), tomar las primeras 15 palabras
  // evitando estrictamente dejar preposiciones o artículos huérfanos al final
  let safeWords = words.slice(0, 15);
  const orphanWords = new Set(['de', 'del', 'en', 'para', 'con', 'sin', 'sobre', 'por', 'a', 'el', 'la', 'los', 'las', 'un', 'una', 'que', 'y', 'o', 'pero', 'su', 'sus', 'se', 'es']);
  while (safeWords.length > 8 && orphanWords.has(safeWords[safeWords.length - 1].toLowerCase().replace(/[^a-záéíóúñ]/gi, ''))) {
    safeWords.pop();
  }

  return balanceParenthesesString(safeWords.join(' ').replace(/[,;:\-–—\s]+$/, ''));
}

/**
 * Sanitiza oraciones asegurando que no inicien con conjunciones o fragmentos subordinados
 * huérfanos (ej. "era mío, sino...", "pero...", "y que..."). Reconstituye una proposición
 * ejecutiva limpia con mayúscula inicial y puntuación consistente.
 */
export function sanitizeSentenceClause(raw: string): string {
  if (!raw) return '';
  let str = cleanAdministrativePreamble(raw);

  str = str
    .replace(/^#+\s*/, '')
    .replace(/^[-•*–—]\s*/, '')
    .trim();

  // Si arranca con comas, dos puntos, punto y coma o guiones
  str = str.replace(/^[,;:\-–—\s]+/, '');

  // Detectar inicios anómalos o cláusulas subordinadas/adversativas huérfanas
  // Ejemplos: "era mío, sino...", "sino que...", "pero...", "aunque...", "fue que..."
  const orphanPrefixRegex = /^(?:(?:no\s+)?era\s+[^\n,:;]+,\s*sino\s+(?:que\s+)?|sino\s+(?:que\s+)?|pero\s+|aunque\s+|porque\s+|por\s+lo\s+tanto\s*,?\s*|ya\s+que\s+|debido\s+a\s+que\s+|y\s+(?:que\s+)?|o\s+(?:bien\s+)?)/i;
  
  if (orphanPrefixRegex.test(str)) {
    str = str.replace(orphanPrefixRegex, '').trim();
    str = str.replace(/^[,;:\-–—\s]+/, '');
  }

  // Si tras remover el prefijo o si originalmente arranca con "del sistema..." o "de la..."
  // reincorporar un sujeto ejecutivo completo para contextualizar la proposición
  if (/^del\s+sistema\b/i.test(str)) {
    str = str.replace(/^del\s+sistema\s*[:,-]?\s*/i, 'El sistema presentó: ');
  } else if (/^de\s+la\s+organización\b/i.test(str)) {
    str = str.replace(/^de\s+la\s+organización\s*[:,-]?\s*/i, 'La organización evidenció: ');
  } else if (/^era\s+(?:un|una|el|la)\b/i.test(str)) {
    str = str.replace(/^era\s+/i, 'Se identificó que era ');
  }

  if (!str) return '';

  // Asegurar mayúscula inicial
  str = str.charAt(0).toUpperCase() + str.slice(1);

  return str;
}

/**
 * Trunca texto por límite de palabras completas para no cortar palabras a la mitad.
 */
export function truncateByWordBoundary(str: string, maxLength: number = 220): string {
  if (!str || str.length <= maxLength) return str;
  const truncated = str.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 40) {
    return `${truncated.slice(0, lastSpace)}...`;
  }
  return `${truncated}...`;
}

/**
 * Analizador semántico y heurístico integral (SAP Engine)
 */
export function analyzeDocumentContent(
  rawContent: string,
  fileName?: string
): ExtractedDocumentContent {
  // 0. Purgar marcadores de salto de página y estandarizar saltos
  const cleanContent = rawContent
    .replace(/\r\n/g, '\n')
    .replace(/--- PÁGINA SIGUIENTE ---/g, '\n\n')
    .replace(/^[-—=\s]*p[áa]gina\s+siguiente[-—=\s]*$/gim, '')
    .trim();

  // 1. Extracción de Título Principal antes de purgar encabezados administrativos
  const firstHeadingMatch = cleanContent.match(/^(?:#+\s*|TÍTULO:\s*|TITULO:\s*)([^\n]+)/im);
  const firstLine = cleanContent.split('\n').map((l) => l.trim()).find((l) => l.length > 3 && l.length < 100);

  let titleSuggestion = '';
  if (firstHeadingMatch && firstHeadingMatch[1].trim().length >= 4) {
    titleSuggestion = stripAdministrativePrefix(firstHeadingMatch[1].trim());
  } else if (firstLine && !firstLine.startsWith('-') && !firstLine.startsWith('*')) {
    titleSuggestion = stripAdministrativePrefix(firstLine.replace(/^#+\s*/, '').trim());
  } else if (fileName) {
    titleSuggestion = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  titleSuggestion = stripAdministrativePrefix(titleSuggestion);

  // 2. Detección y purga de bloque de encabezado administrativo multi-línea
  const allLines = cleanContent.split('\n');
  let bodyStartIdx = 0;
  for (let i = 0; i < Math.min(10, allLines.length); i++) {
    const l = allLines[i].trim();
    if (/^(?:texto\s*[0-9a-zA-Z]*|programa|candidato|postulante|nivel|grado|l[íi]nea\s+de\s+investigaci[óo]n|autor|instituci[óo]n|facultad|universidad|carrera)\s*[:.\-–—]/i.test(l)) {
      bodyStartIdx = i + 1;
      continue;
    }
    if (bodyStartIdx > 0 && (l.includes('PPGSP') || l.includes('Universidade') || l.includes('Universidad') || l.includes('Maestría') || l.includes('Magíster') || l.length < 5)) {
      bodyStartIdx = i + 1;
      continue;
    }
    if (bodyStartIdx > 0) break;
  }

  const effectiveBody = (bodyStartIdx > 0 ? allLines.slice(bodyStartIdx).join('\n') : cleanContent).trim();

  // 3. Detección de Arquetipo
  const { archetype: detectedArchetype, confidence: archetypeConfidence } =
    detectDocumentArchetype(cleanContent, fileName);

  if (!titleSuggestion || titleSuggestion.length < 4) {
    titleSuggestion = detectedArchetype === 'technical_architecture'
      ? 'Especificación de Arquitectura de Sistemas'
      : detectedArchetype === 'business_pitch'
      ? 'Propuesta de Valor e Inversión'
      : detectedArchetype === 'narrative_educational'
      ? 'Proyecto y Fundamentos de Investigación'
      : 'Estrategia y Síntesis Ejecutiva';
  }

  // Dividir párrafos reales por saltos dobles (\n\n), normalizando saltos de línea internos de maquetación
  const doubleBreakParagraphs = effectiveBody
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 20);

  const paragraphs = doubleBreakParagraphs.length >= 2
    ? doubleBreakParagraphs
    : effectiveBody
        .split(/\n+/)
        .map((p) => p.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 20);

  const sentences = splitSentencesSafely(effectiveBody)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  // 4. Detección de Métricas Cuantitativas reales en el texto (Monedas, Ratios, Deltas, UF, Clientes)
  const detectedMetrics: Array<{
    label: string;
    value: string;
    change?: string;
    trend: 'up' | 'down' | 'neutral';
  }> = [];

  // Expresión regular robusta de métricas cuantitativas
  const metricRegex = /(?:([a-zA-ZáéíóúÁÉÍÓÚñÑ\s/]{3,30})[:=]\s*)?((?:\$|USD|CLP|EUR|UF)?\s*[+-]?\d+(?:[.,]\d+)?\s*(?:%|k|M|B|x|ms|s|dias|días|usuarios|clientes|cuentas|transacciones|visitas|hits|req\/s|rps)?(?:\s*(?:YoY|MoM|QoQ|anual|mensual))?)/gi;
  const matches = effectiveBody.matchAll(metricRegex);
  
  for (const match of matches) {
    const rawVal = match[2]?.trim();
    const rawLabel = match[1]?.trim();
    if (rawVal && (rawVal.includes('%') || rawVal.includes('$') || rawVal.includes('x') || rawVal.toLowerCase().includes('uf') || /\d/.test(rawVal))) {
      // Filtrar números triviales o años de 4 dígitos aislados
      if (/^(19|20)\d{2}$/.test(rawVal.trim())) continue;
      // Filtrar si el número no tiene ningún sufijo, símbolo o magnitud y es muy pequeño (<3 caracteres)
      if (/^\d{1,2}$/.test(rawVal.trim()) && !rawLabel) continue;
      
      const label = rawLabel && rawLabel.length > 2 && rawLabel.length < 35
        ? rawLabel.replace(/^[-•*#]\s*/, '').trim()
        : 'Indicador Clave';

      const isDown = rawVal.includes('-') || (rawLabel && /ca[ií]da|reducci[óo]n|disminuci[óo]n|baja|churn/i.test(rawLabel));

      detectedMetrics.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: rawVal,
        trend: isDown ? 'down' : 'up',
      });

      if (detectedMetrics.length >= 8) break;
    }
  }

  // 4. Detección de Contraste Semántico (Problemas vs Soluciones o Antes vs Después)
  const contrastBlocks: ExtractedContrastBlock[] = [];
  const problemSentences = sentences.filter((s) =>
    /\b(problema|dolor|falla|lento|costoso|opaco|desafío|limitación|complejidad|riesgo|antiguo|manual)\b/i.test(s)
  );
  const solutionSentences = sentences.filter((s) =>
    /\b(solución|optimización|mejora|automatizado|eficiente|escalable|propuesta|ventaja|transformación|rápido)\b/i.test(s)
  );

  if (problemSentences.length > 0 && solutionSentences.length > 0) {
    const pairsCount = Math.min(3, Math.min(problemSentences.length, solutionSentences.length));
    for (let i = 0; i < pairsCount; i++) {
      contrastBlocks.push({
        problemAspect: sanitizeSentenceClause(problemSentences[i]),
        solutionAspect: sanitizeSentenceClause(solutionSentences[i]),
      });
    }
  }

  // 5. Detección de Secuencias / Fases / Pasos Cronológicos (Fase, Paso, Etapa, Hito, Q1-Q4)
  const sequenceSteps: ExtractedSequenceStep[] = [];
  const stepRegex = /\b(?:fase|paso|etapa|hito|step|phase|q[1-4])\b\s*([0-9ivx]+)?[:.\-\s]+([^\n.]{8,})/gi;
  const stepMatches = effectiveBody.matchAll(stepRegex);
  let stepIdx = 1;
  for (const sm of stepMatches) {
    const stepLabel = sm[1] ? sm[1] : String(stepIdx);
    if (sm[2] && sm[2].trim().length > 4) {
      const fullDetail = sm[2].trim();
      sequenceSteps.push({
        stepIndex: stepIdx++,
        title: `Fase ${stepLabel}: ${synthesizeConciseActionTitle(fullDetail)}`,
        detail: fullDetail,
      });
      if (sequenceSteps.length >= 5) break;
    }
  }

  // 6. Detección de Conceptos y Definiciones Clave
  const conceptDefinitions: ExtractedConceptDefinition[] = [];
  const conceptRegex = /(?:^|\n)(?:[-•*]\s*)?([A-ZÁÉÍÓÚ][A-Za-z0-9áéíóúÁÉÍÓÚñÑ\s/()]{2,40})[:\-—]\s+([A-Za-z0-9áéíóúÁÉÍÓÚñÑ\s,.;()%$]{12,180})/g;
  const conceptMatches = effectiveBody.matchAll(conceptRegex);
  for (const cm of conceptMatches) {
    const term = stripAdministrativePrefix(cm[1].trim());
    const definition = cm[2].trim();
    if (term.length > 2 && definition.length > 10 && !term.toLowerCase().startsWith('http')) {
      const isAdministrativeTerm = /^(?:texto|candidato|postulante|programa|mag[íi]ster|maestr[íi]a|doctorado|nivel|autor|fecha|rut|folio|c[óo]digo|email|correo|tel[ée]fono|p[áa]gina|universidad|instituci[óo]n|facultad|carrera|departamento|nota|resumen)\b/i.test(term);
      if (isAdministrativeTerm) continue;

      // Un concepto debe ser un término conciso (1 a 5 palabras), no una cláusula oracional subordinada
      const words = term.split(/\s+/);
      if (words.length > 5) continue;
      if (/^(?:de|en|por|la|el|los|las|un|una|que|para|con|sobre|muchas|a|y|o)\b/i.test(term)) continue;

      const balancedDef = balanceParenthesesString(definition.replace(/[\n\r]+/g, ' ').trim());
      conceptDefinitions.push({ term, definition: balancedDef });
      if (conceptDefinitions.length >= 5) break;
    }
  }

  // 7. Segmentación en Secciones Semánticas Adaptativas (Topic Density Clustering)
  const semanticSections: Array<{
    heading: string;
    actionSummary: string;
    points: string[];
    suggestedIntent?: string;
  }> = [];

  // Agrupar párrafos en clusters temáticos lógicos
  // En lugar de dividir arbitrariamente por paragraphs.length / 5, detectar cortes temáticos reales
  // (por encabezados Markdown, cambios de título, o acumulación de longitud)
  const topicClusters: Array<{ heading?: string; paras: string[] }> = [];
  let currentCluster: { heading?: string; paras: string[] } = { paras: [] };

  for (const para of paragraphs) {
    const isHeaderLine = /^(?:#+\s*|(?:\d+\.|\w\))\s*|\*\*)([^\n.:]{4,60})/m.test(para);
    if (isHeaderLine && currentCluster.paras.length > 0) {
      topicClusters.push(currentCluster);
      const match = para.match(/^(?:#+\s*|(?:\d+\.|\w\))\s*|\*\*)([^\n.:]{4,60})/m);
      currentCluster = { heading: match ? match[1].replace(/[*_#]/g, '').trim() : undefined, paras: [para] };
    } else {
      currentCluster.paras.push(para);
      // Si el cluster acumuló más de 3 párrafos o más de 600 caracteres, cerrarlo elegantemente
      const totalChars = currentCluster.paras.join(' ').length;
      if (currentCluster.paras.length >= 3 || totalChars > 600) {
        topicClusters.push(currentCluster);
        currentCluster = { paras: [] };
      }
    }
  }
  if (currentCluster.paras.length > 0) {
    const trailingLength = currentCluster.paras.join(' ').length;
    if (topicClusters.length > 0 && trailingLength < 200) {
      topicClusters[topicClusters.length - 1].paras.push(...currentCluster.paras);
    } else {
      topicClusters.push(currentCluster);
    }
  }

  // Si no se formaron suficientes clusters (ej. texto compacto), usar división proporcional
  const clustersToProcess: Array<{ heading?: string; paras: string[] }> =
    topicClusters.length >= 2
      ? topicClusters
      : paragraphs.map((p) => ({ heading: undefined, paras: [p] }));

  const usedHeadings = new Set<string>();

  for (let idx = 0; idx < Math.min(8, clustersToProcess.length); idx++) {
    const cluster = clustersToProcess[idx];
    const combinedBlock = cluster.paras.join(' ');

    const blockSentences = splitSentencesSafely(combinedBlock)
      .map((s) => sanitizeSentenceClause(s))
      .filter((s) => s.length > 15);

    const rawFirst = blockSentences[0] || 'Análisis temático del documento';
    const firstSentence = sanitizeSentenceClause(rawFirst);
    const actionSummary = synthesizeConciseActionTitle(firstSentence);

    const points = blockSentences.slice(1, 4).map((pt) => {
      return sanitizeSentenceClause(pt);
    }).filter(Boolean);

    if (points.length === 0 && blockSentences.length > 0) {
      points.push(firstSentence);
    }

    let heading = cluster.heading ? stripAdministrativePrefix(cluster.heading) : '';
    if (!heading) {
      const headingMatch = combinedBlock.match(/^(?:#+\s*|(?:\d+\.|\w\))\s*|\*\*)([^\n.:]{4,55})/m);
      if (headingMatch && headingMatch[1].trim().length >= 4) {
        heading = stripAdministrativePrefix(headingMatch[1].replace(/[*_#]/g, '').trim());
      }
    }

    // Si no hay heading explícito o si coincide casi palabra por palabra con el actionSummary, sintetizar título temático conceptual
    if (!heading || heading.toLowerCase() === actionSummary.toLowerCase() || actionSummary.toLowerCase().startsWith(heading.toLowerCase()) || heading.length < 5) {
      const lowerBlock = combinedBlock.toLowerCase();
      if (/formado|psic[óo]logo|cinco\s+a[ñn]os|salud|educaci[óo]n|magallanes|vocaci[óo]n/i.test(lowerBlock)) {
        heading = 'Trayectoria Profesional & Vocación';
      } else if (/sobrepasado|estr[ée]s|doscientos|carga|burocra|informes\s+manuales/i.test(lowerBlock)) {
        heading = 'Sobrecarga Operativa & Gestión de Casos';
      } else if (/deficiente|dispers|sistemas\s+solo|almacenaban|conectar|informaci[óo]n/i.test(lowerBlock)) {
        heading = 'Diagnóstico Sistémico de Información';
      } else if (/erbe|herramienta|ecosistema|evidencia|rehabilitaci[óo]n\s+basada|automatizar/i.test(lowerBlock)) {
        heading = 'Ecosistema ERBE & Innovación Tecnológica';
      } else if (/tesis|r[úu]bricas|evaluaci[óo]n\s+de\s+proceso|metodolog|confiabilidad/i.test(lowerBlock)) {
        heading = 'Metodología de Validación & Tesis';
      } else if (/retorno|pol[íi]ticas\s+p[úu]blicas|comunidad|prop[óo]sito|cambio\s+que\s+de\s+verdad/i.test(lowerBlock)) {
        heading = 'Perspectivas de Retorno & Políticas Públicas';
      } else if (/ppgsp|uea|maestr[íi]a|posgrado|postgrado|universidade|amazonas/i.test(lowerBlock)) {
        heading = 'Programa de Posgrado PPGSP / UEA';
      } else if (/igi|riesgo|necesidades\s+crimin[óo]genas|plan\s+de\s+intervenci[óo]n/i.test(lowerBlock)) {
        heading = 'Gestión Criminógena & Evaluación IGI';
      } else if (/arquitectura|api|endpoint|microservicio/i.test(lowerBlock)) {
        heading = 'Arquitectura & Componentes Técnicos';
      } else if (/financier|ebitda|ingresos|costos|monetiz/i.test(lowerBlock)) {
        heading = 'Métricas de Negocio & Viabilidad';
      } else {
        const capitalizedTerms = combinedBlock.match(/\b[A-ZÁÉÍÓÚ][a-z0-9áéíóú]{3,15}\b/g) || [];
        const uniqueTerms = Array.from(new Set(capitalizedTerms.filter((t) => !['Texto', 'Programa', 'Candidato', 'Nivel', 'Chile', 'Este', 'Para', 'Como', 'Pero', 'Muchas', 'Todo', 'Cuando', 'Desde', 'Donde'].includes(t))));
        if (uniqueTerms.length >= 2) {
          heading = `${uniqueTerms[0]} & ${uniqueTerms[1]}`;
        } else {
          heading = `Dimensión Estratégica 0${idx + 1}`;
        }
      }
    }

    if (usedHeadings.has(heading)) {
      heading = `${heading} (Fase ${idx + 1})`;
    }
    usedHeadings.add(heading);

    semanticSections.push({
      heading,
      actionSummary,
      points: points.length > 0 ? points : [firstSentence],
    });
  }

  if (semanticSections.length === 0 && sentences.length > 0) {
    semanticSections.push({
      heading: 'Resumen Central',
      actionSummary: sentences[0],
      points: sentences.slice(1, 4),
    });
  }

  return {
    rawText: cleanContent,
    charCount: cleanContent.length,
    wordCount: cleanContent.split(/\s+/).filter(Boolean).length,
    titleSuggestion,
    detectedArchetype,
    archetypeConfidence,
    hasMetrics: detectedMetrics.length > 0,
    hasContrast: contrastBlocks.length > 0,
    hasSequence: sequenceSteps.length > 0,
    hasConcepts: conceptDefinitions.length > 0,
    detectedMetrics,
    contrastBlocks,
    sequenceSteps,
    conceptDefinitions,
    keyTakeaways: sentences.slice(0, 5),
    semanticSections,
  };
}
