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

  // 4. Educacional / Narrativo
  const eduKeywords = [
    'capítulo', 'módulo', 'introducción', 'concepto', 'definición', 'historia',
    'guía', 'tutorial', 'lección', 'aprender', 'fundamento', 'principios', 'caso de estudio'
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
 * Sanitiza oraciones asegurando que no inicien con conjunciones o fragmentos subordinados
 * huérfanos (ej. "era mío, sino...", "pero...", "y que..."). Reconstituye una proposición
 * ejecutiva limpia con mayúscula inicial y puntuación consistente.
 */
export function sanitizeSentenceClause(raw: string): string {
  if (!raw) return '';
  let str = raw
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
  const cleanContent = rawContent.replace(/\r\n/g, '\n').trim();
  
  // 1. Detección de Arquetipo
  const { archetype: detectedArchetype, confidence: archetypeConfidence } =
    detectDocumentArchetype(cleanContent, fileName);

  // Dividir párrafos por doble salto o salto simple de longitud sustancial
  const rawParagraphs = cleanContent.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 20);
  const paragraphs = rawParagraphs.length >= 2
    ? rawParagraphs
    : cleanContent.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 20);

  const sentences = splitSentencesSafely(cleanContent)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  // 2. Detección de Métricas Cuantitativas reales en el texto (Monedas, Ratios, Deltas, UF, Clientes)
  const detectedMetrics: Array<{
    label: string;
    value: string;
    change?: string;
    trend: 'up' | 'down' | 'neutral';
  }> = [];

  // Expresión regular robusta de métricas cuantitativas
  const metricRegex = /(?:([a-zA-ZáéíóúÁÉÍÓÚñÑ\s/]{3,30})[:=]\s*)?((?:\$|USD|CLP|EUR|UF)?\s*[+-]?\d+(?:[.,]\d+)?\s*(?:%|k|M|B|x|ms|s|dias|días|usuarios|clientes|cuentas|transacciones|visitas|hits|req\/s|rps)?(?:\s*(?:YoY|MoM|QoQ|anual|mensual))?)/gi;
  const matches = cleanContent.matchAll(metricRegex);
  
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

  // 3. Extracción de Título Principal y Takeaways
  const firstHeadingMatch = cleanContent.match(/^(?:#+\s*|TÍTULO:\s*|TITULO:\s*)([^\n]+)/im);
  const firstLine = cleanContent.split('\n').map((l) => l.trim()).find((l) => l.length > 3 && l.length < 80);

  let titleSuggestion = '';
  if (firstHeadingMatch && firstHeadingMatch[1].trim().length >= 4) {
    titleSuggestion = firstHeadingMatch[1].trim();
  } else if (firstLine && !firstLine.startsWith('-') && !firstLine.startsWith('*')) {
    titleSuggestion = firstLine.replace(/^#+\s*/, '').trim();
  } else if (fileName) {
    titleSuggestion = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  if (!titleSuggestion || titleSuggestion.length < 4) {
    titleSuggestion = detectedArchetype === 'technical_architecture'
      ? 'Especificación de Arquitectura de Sistemas'
      : detectedArchetype === 'business_pitch'
      ? 'Propuesta de Valor e Inversión'
      : 'Estrategia y Síntesis Ejecutiva';
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
        problemAspect: problemSentences[i].slice(0, 100),
        solutionAspect: solutionSentences[i].slice(0, 100),
      });
    }
  }

  // 5. Detección de Secuencias / Fases / Pasos Cronológicos (Fase, Paso, Etapa, Hito, Q1-Q4)
  const sequenceSteps: ExtractedSequenceStep[] = [];
  const stepRegex = /(?:fase|paso|etapa|hito|step|phase|q[1-4])\s*([0-9ivx]+)?[:.\-\s]+([^\n.]+)/gi;
  const stepMatches = cleanContent.matchAll(stepRegex);
  let stepIdx = 1;
  for (const sm of stepMatches) {
    const stepLabel = sm[1] ? sm[1] : String(stepIdx);
    if (sm[2] && sm[2].trim().length > 4) {
      sequenceSteps.push({
        stepIndex: stepIdx++,
        title: `Fase ${stepLabel}: ${sm[2].trim().slice(0, 35)}`,
        detail: sm[2].trim(),
      });
      if (sequenceSteps.length >= 5) break;
    }
  }

  // 6. Detección de Conceptos y Definiciones Clave
  const conceptDefinitions: ExtractedConceptDefinition[] = [];
  const conceptRegex = /(?:^|\n)(?:[-•*]\s*)?([A-Za-z0-9áéíóúÁÉÍÓÚñÑ\s/]{3,35})[:\-—]\s+([A-Za-z0-9áéíóúÁÉÍÓÚñÑ\s,.;()%$]{12,160})/g;
  const conceptMatches = cleanContent.matchAll(conceptRegex);
  for (const cm of conceptMatches) {
    const term = cm[1].trim();
    const definition = cm[2].trim();
    if (term.length > 2 && definition.length > 10 && !term.toLowerCase().startsWith('http')) {
      conceptDefinitions.push({ term, definition });
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
    topicClusters.push(currentCluster);
  }

  // Si no se formaron suficientes clusters (ej. texto compacto), usar división proporcional
  const clustersToProcess: Array<{ heading?: string; paras: string[] }> =
    topicClusters.length >= 2
      ? topicClusters
      : paragraphs.map((p) => ({ heading: undefined, paras: [p] }));

  for (let idx = 0; idx < Math.min(8, clustersToProcess.length); idx++) {
    const cluster = clustersToProcess[idx];
    const combinedBlock = cluster.paras.join(' ');

    const blockSentences = splitSentencesSafely(combinedBlock)
      .map((s) => sanitizeSentenceClause(s))
      .filter((s) => s.length > 15);

    const rawFirst = blockSentences[0] || 'Análisis temático del documento';
    const firstSentence = sanitizeSentenceClause(rawFirst);
    const actionSummary = truncateByWordBoundary(firstSentence, 200);

    const points = blockSentences.slice(1, 4).map((pt) => {
      return sanitizeSentenceClause(pt);
    }).filter(Boolean);

    if (points.length === 0 && blockSentences.length > 0) {
      points.push(firstSentence);
    }

    let heading = cluster.heading || '';
    if (!heading) {
      const headingMatch = combinedBlock.match(/^(?:#+\s*|(?:\d+\.|\w\))\s*|\*\*)([^\n.:]{4,55})/m);
      if (headingMatch && headingMatch[1].trim().length >= 4) {
        heading = headingMatch[1].replace(/[*_#]/g, '').trim();
      } else {
        const cleanFirst = firstSentence.replace(/^[^a-zA-ZáéíóúÁÉÍÓÚñÑ]+/, '');
        const words = cleanFirst.split(/\s+/).slice(0, 6).join(' ');
        heading = words.length > 5 ? words : `Sección 0${idx + 1}`;
      }
    }

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
