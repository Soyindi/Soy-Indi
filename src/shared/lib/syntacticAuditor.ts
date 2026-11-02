/**
 * ============================================================================
 * INDI SHARED SYNTACTIC COMPLETENESS & GRAMMAR AUDITOR (2026)
 * ============================================================================
 * Primitiva agnóstica de la capa shared/ para garantizar completitud oracional,
 * balanceo de paréntesis, eliminación de preposiciones/artículos huérfanos
 * terminales y reparación de omisiones gramaticales en Smart CV y Orbital Presentations.
 */

export const ORPHAN_TRAILING_WORDS = new Set([
  'de', 'del', 'en', 'para', 'con', 'sin', 'sobre', 'hacia', 'desde', 'hasta', 'por', 'a',
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'que', 'y', 'o', 'e', 'u', 'pero', 'sino', 'aunque', 'porque',
  'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'nuestro', 'nuestra',
  'se', 'es', 'era', 'fue', 'son', 'ser', 'estar', 'como', 'entre',
  'había', 'habia', 'hubo', 'ha', 'han', 'he', 'tener', 'tiene', 'tenía', 'tenia',
]);

/**
 * Repara frases donde un LLM eliminó accidentalmente "años de" al filtrar edad biológica
 * (ej. "con más de cinco trayectoria" -> "con más de cinco años de trayectoria").
 */
export function repairExperienceDurationPhrases(text: string): string {
  if (!text) return '';
  return text
    .replace(
      /\b(m[áa]s\s+de\s+(?:\d+|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte))\s+(?:de\s+)?(trayectoria|experiencia)\b/gi,
      '$1 años de $2'
    )
    .replace(
      /\b(con\s+(?:\d+|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte))\s+(trayectoria|experiencia)\b/gi,
      '$1 años de $2'
    );
}

/**
 * Asegura que una oración o frase tenga sentido completo y no termine
 * en una preposición, conjunción o artículo huérfano.
 */
export function assertSyntacticCompleteness(text: string): {
  isComplete: boolean;
  cleanText: string;
  repairedText: string;
  orphanWord?: string;
} {
  if (!text) return { isComplete: true, cleanText: '', repairedText: '' };

  let trimmed = repairExperienceDurationPhrases(text)
    .trim()
    .replace(/\.{2,}/g, '')
    .trim()
    .replace(/[.!?…]+$/, '')
    .trim();

  // 1. Limpieza y balanceo de paréntesis huérfanos o desbalanceados
  let openCount = 0;
  let hasStrayClosing = false;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '(') openCount++;
    if (trimmed[i] === ')') {
      if (openCount > 0) openCount--;
      else hasStrayClosing = true;
    }
  }

  if (hasStrayClosing) {
    let currentOpen = 0;
    let balanced = '';
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === '(') {
        currentOpen++;
        balanced += ch;
      } else if (ch === ')') {
        if (currentOpen > 0) {
          currentOpen--;
          balanced += ch;
        }
      } else {
        balanced += ch;
      }
    }
    trimmed = balanced.trim();
  }

  // Si quedó un '(' sin cerrar, remover el segmento que quedó abierto
  if (openCount > 0) {
    trimmed = trimmed.replace(/\s*\([^)]*$/, '').trim();
  }

  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length === 0) return { isComplete: true, cleanText: '', repairedText: '' };

  const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-záéíóúñ]/gi, '');

  if (ORPHAN_TRAILING_WORDS.has(lastWord)) {
    const fixedWords = [...words];
    while (fixedWords.length > 0) {
      const checkWord = fixedWords[fixedWords.length - 1].toLowerCase().replace(/[^a-záéíóúñ]/gi, '');
      if (ORPHAN_TRAILING_WORDS.has(checkWord)) {
        fixedWords.pop();
      } else {
        break;
      }
    }

    const reconstructed = fixedWords.join(' ').replace(/[,;:\-–—\s]+$/, '');
    return {
      isComplete: false,
      cleanText: reconstructed,
      repairedText: reconstructed,
      orphanWord: lastWord,
    };
  }

  return {
    isComplete: true,
    cleanText: trimmed,
    repairedText: trimmed,
  };
}
