/**
 * ============================================================================
 * INDI PRESENTATION DOCUMENT EXTRACTOR & SEMANTIC SUMMARIZER
 * ============================================================================
 * Extrae texto real de archivos (PDFs, Markdown, TXT, CSV, JSON) y descompone
 * el contenido en secciones temáticas estructuradas, citas, métricas y listas
 * para alimentar de forma inteligente la generación de diapositivas SCQA.
 */

export interface ExtractedDocumentContent {
  rawText: string;
  charCount: number;
  wordCount: number;
  titleSuggestion: string;
  detectedMetrics: Array<{ label: string; value: string; change?: string; trend: 'up' | 'down' | 'neutral' }>;
  keyTakeaways: string[];
  semanticSections: Array<{
    heading: string;
    actionSummary: string;
    points: string[];
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
      const { extractText } = await import('unpdf');
      const buffer = Buffer.from(fileBase64, 'base64');
      const uint8 = new Uint8Array(buffer);
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
 * Analizador semántico y heurístico de texto para presentaciones ejecutivas
 * Desglosa párrafos, detecta métricas numéricas reales ($10M, 45%, 3x),
 * y segmenta el material en secciones coherentes con títulos de acción.
 */
export function analyzeDocumentContent(
  rawContent: string,
  fileName?: string
): ExtractedDocumentContent {
  const cleanContent = rawContent.replace(/\r\n/g, '\n').trim();
  const paragraphs = cleanContent
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const sentences = cleanContent
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 250);

  // 1. Detección de Métricas Cuantitativas reales en el texto
  const detectedMetrics: Array<{
    label: string;
    value: string;
    change?: string;
    trend: 'up' | 'down' | 'neutral';
  }> = [];

  const metricRegex = /(?:([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,25})[:=]\s*)?(\$?\d+(?:[.,]\d+)?\s*(?:%|k|M|B|x|ms|s|dias|días|usuarios|clientes)?)/gi;
  const matches = cleanContent.matchAll(metricRegex);
  
  for (const match of matches) {
    const rawVal = match[2]?.trim();
    const rawLabel = match[1]?.trim();
    if (rawVal && (rawVal.includes('%') || rawVal.includes('$') || rawVal.includes('x') || /\d/.test(rawVal))) {
      // Filtrar números triviales o años de 4 dígitos
      if (/^(19|20)\d{2}$/.test(rawVal)) continue;
      
      const label = rawLabel && rawLabel.length > 3 && rawLabel.length < 30
        ? rawLabel
        : 'Indicador Clave';

      detectedMetrics.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: rawVal,
        trend: rawVal.includes('-') ? 'down' : 'up',
      });

      if (detectedMetrics.length >= 6) break;
    }
  }

  // 2. Extracción de Título Principal y Takeaways
  // Priorizar encabezado explícito del documento (# Título) o primera línea relevante
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
    titleSuggestion = 'Estrategia y Síntesis Ejecutiva';
  }

  // 3. Segmentación en Secciones Semánticas
  const semanticSections: Array<{
    heading: string;
    actionSummary: string;
    points: string[];
  }> = [];

  // Agrupar contenido en bloques temáticos
  const step = Math.max(1, Math.floor(paragraphs.length / 4));
  for (let i = 0; i < paragraphs.length; i += step) {
    const blockParas = paragraphs.slice(i, i + step);
    const combinedBlock = blockParas.join(' ');
    
    // Obtener los puntos clave del bloque
    const blockSentences = combinedBlock
      .split(/[.!?]\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && s.length < 180);

    const firstSentence = blockSentences[0] || 'Análisis temático del documento';
    const actionSummary = firstSentence.length > 120 ? `${firstSentence.slice(0, 117)}...` : firstSentence;

    const points = blockSentences.slice(1, 4).map((pt) => {
      // Limpiar viñetas previas si existen
      return pt.replace(/^[-•*]\s*/, '').trim();
    });

    if (points.length === 0 && blockSentences.length > 0) {
      points.push(blockSentences[0]);
    }

    semanticSections.push({
      heading: `Eje de Análisis 0${semanticSections.length + 1}`,
      actionSummary,
      points: points.length > 0 ? points : ['Profundización en las conclusiones del documento.'],
    });

    if (semanticSections.length >= 8) break;
  }

  // Si no había suficientes párrafos largos, dividir oraciones directamente
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
    detectedMetrics,
    keyTakeaways: sentences.slice(0, 5),
    semanticSections,
  };
}
