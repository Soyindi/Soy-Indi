/**
 * Auditor de Integridad y Completitud Semántica de Presentaciones (INDI 2026)
 * Valida que ningún título, viñeta o proposición ejecutiva termine incompleta,
 * con palabras mutiladas o preposiciones/artículos huérfanos.
 */

import { PresentationSlide } from '@/entities/presentation/schemas';

// Palabras que NUNCA deben quedar como la última palabra de un título o titular
const ORPHAN_TRAILING_WORDS = new Set([
  'de', 'del', 'en', 'para', 'con', 'sin', 'sobre', 'hacia', 'desde', 'hasta', 'por', 'a',
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'que', 'y', 'o', 'e', 'u', 'pero', 'sino', 'aunque', 'porque',
  'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'nuestro', 'nuestra',
  'se', 'es', 'era', 'fue', 'son', 'ser', 'estar', 'como', 'entre',
  'había', 'habia', 'hubo', 'ha', 'han', 'he', 'tener', 'tiene', 'tenía', 'tenia'
]);

export interface SlideIntegrityIssue {
  slideIndex: number;
  field: 'title' | 'actionTitle' | 'keyPoints' | 'timeline';
  itemIndex?: number;
  text: string;
  reason: string;
  remedyApplied: string;
}

export interface PresentationAuditReport {
  isFullyComplete: boolean;
  repairedCount: number;
  issuesDetected: SlideIntegrityIssue[];
  auditedSlides: PresentationSlide[];
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

  let trimmed = text.trim().replace(/\.{2,}/g, '').trim().replace(/[.!?…]+$/, '').trim();

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
    // Remover paréntesis de cierre que no tengan apertura previa
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
    // Si la última palabra es huérfana, removerla recursivamente hasta encontrar un sustantivo o predicado completo
    let fixedWords = [...words];
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

/**
 * Audita una lista completa de diapositivas y repara proactivamente
 * títulos cortados, duplicados o frases truncadas.
 */
export function auditAndRepairPresentationSlides(
  slides: PresentationSlide[]
): PresentationAuditReport {
  const issues: SlideIntegrityIssue[] = [];

  const auditedSlides: PresentationSlide[] = slides.map((slide, idx) => {
    let repairedTitle = slide.title ? slide.title.trim() : `Eje Temático 0${idx + 1}`;
    // Limpiar prefijos administrativos tipo "Texto 1:", "Tema 1:"
    repairedTitle = repairedTitle.replace(/^(texto|tema|diapositiva|slide|eje)\s*\d+[:.\-\s]*/i, '').trim() || `Eje Temático 0${idx + 1}`;
    let repairedActionTitle = slide.actionTitle ? slide.actionTitle.trim() : undefined;

    // 1. Auditar Action Title
    if (repairedActionTitle) {
      // Eliminar puntos suspensivos que indiquen texto mutilado
      if (repairedActionTitle.includes('...')) {
        const withoutDots = repairedActionTitle.replace(/\.{2,}/g, '').trim();
        issues.push({
          slideIndex: idx,
          field: 'actionTitle',
          text: repairedActionTitle,
          reason: 'Contenía puntos suspensivos que sugerían corte artificial',
          remedyApplied: withoutDots,
        });
        repairedActionTitle = withoutDots;
      }

      // Verificar completitud sintáctica
      const checkAction = assertSyntacticCompleteness(repairedActionTitle);
      if (!checkAction.isComplete && checkAction.repairedText.length > 10) {
        issues.push({
          slideIndex: idx,
          field: 'actionTitle',
          text: repairedActionTitle,
          reason: `Terminaba con la palabra huérfana '${checkAction.orphanWord}'`,
          remedyApplied: checkAction.repairedText,
        });
        repairedActionTitle = checkAction.repairedText;
      }

      // Asegurar punto final elegante en Action Title
      if (repairedActionTitle && !/[.!?]$/.test(repairedActionTitle)) {
        repairedActionTitle = `${repairedActionTitle}.`;
      }
    }

    // 2. Auditar Título Temático
    if (repairedTitle) {
      if (repairedTitle.includes('...')) {
        const withoutDots = repairedTitle.replace(/\.{2,}/g, '').trim();
        issues.push({
          slideIndex: idx,
          field: 'title',
          text: repairedTitle,
          reason: 'Título temático con puntos suspensivos',
          remedyApplied: withoutDots,
        });
        repairedTitle = withoutDots;
      }

      const checkTitle = assertSyntacticCompleteness(repairedTitle);
      if (!checkTitle.isComplete && checkTitle.repairedText.length > 5) {
        issues.push({
          slideIndex: idx,
          field: 'title',
          text: repairedTitle,
          reason: `Título terminaba con preposición huérfana '${checkTitle.orphanWord}'`,
          remedyApplied: checkTitle.repairedText,
        });
        repairedTitle = checkTitle.repairedText;
      }

      // Evitar colisión idéntica entre title y actionTitle
      if (
        repairedActionTitle &&
        (repairedTitle.toLowerCase() === repairedActionTitle.toLowerCase() ||
          repairedActionTitle.toLowerCase().startsWith(repairedTitle.toLowerCase()))
      ) {
        repairedTitle = `Eje Temático 0${idx + 1}`;
      }
    }

    // 3. Auditar viñetas (keyPoints)
    const repairedKeyPoints = (slide.keyPoints || []).map((kp, kpIdx) => {
      let cleanKp = kp.trim().replace(/\.{3,}$/, '').trim();
      const checkKp = assertSyntacticCompleteness(cleanKp);
      if (!checkKp.isComplete && checkKp.cleanText.length > 12) {
        issues.push({
          slideIndex: idx,
          field: 'keyPoints',
          itemIndex: kpIdx,
          text: kp,
          reason: `Viñeta terminaba con '${checkKp.orphanWord}'`,
          remedyApplied: checkKp.cleanText,
        });
        return checkKp.cleanText;
      }
      return cleanKp;
    });

    // 4. Auditar cronograma (timelineData)
    const repairedTimeline = slide.timelineData?.map((step, sIdx) => {
      const rawStep = step.step || (step as any).label || (step as any).phase;
      const cleanStep = rawStep && String(rawStep).trim() ? String(rawStep).trim() : `Hito 0${sIdx + 1}`;
      
      let cleanStepTitle = (step.title || '').trim().replace(/\.{2,}/g, '').trim();
      if (!cleanStepTitle && step.description) {
        const parts = step.description.split(/[:.–—\n]/);
        if (parts[0] && parts[0].trim().length >= 4 && parts[0].trim().length <= 40) {
          cleanStepTitle = parts[0].trim();
        } else {
          cleanStepTitle = step.description.split(/\s+/).slice(0, 4).join(' ');
        }
      }
      if (!cleanStepTitle) {
        cleanStepTitle = `Hito Estratégico 0${sIdx + 1}`;
      }

      const checkStep = assertSyntacticCompleteness(cleanStepTitle);
      if (!checkStep.isComplete && checkStep.cleanText.length > 4) {
        cleanStepTitle = checkStep.cleanText;
      }
      return {
        ...step,
        step: cleanStep,
        title: cleanStepTitle,
        description: step.description && step.description.trim() ? step.description.trim() : cleanStepTitle,
      };
    });

    return {
      ...slide,
      title: repairedTitle,
      actionTitle: repairedActionTitle,
      keyPoints: repairedKeyPoints,
      timelineData: repairedTimeline,
    };
  });

  return {
    isFullyComplete: issues.length === 0,
    repairedCount: issues.length,
    issuesDetected: issues,
    auditedSlides,
  };
}
