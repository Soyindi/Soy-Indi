/**
 * ============================================================================
 * INDI SMART CV - MOTOR DE DISTRIBUCIÓN Y BALANCE GEOMÉTRICO A4 (2026)
 * ============================================================================
 * Calcula la distribución exacta de secciones y experiencias laborales
 * entre Hoja 1 y Hoja 2 para el formato unificado A4 Internacional (210 x 297 mm).
 * 
 * Calibración Geométrica Basada en Medición Real en Pantalla:
 * 1. 1 unidad = 1 renglón estándar de texto en text-xs (12px / line-height ~19px).
 * 2. En A4 a 96 DPI (min-h-[1123px]) con padding (96px) y footer (56px),
 *    la altura neta para contenido es ~971px / 19px = ~51 líneas equivalentes.
 * 3. A4_PAGE_MAX_CAPACITY = 46.0 unidades (reserva 5 unidades de holgura estética).
 * 4. Caracteres reales por línea en contenedor A4 (740px texto útil a 12px): ~118 caracteres.
 * 5. Erradicación de doble conteo de viñetas para evitar saltos prematuros de página.
 */

import { CVFormValues } from '@/entities/cv/schemas';

export const A4_PAGE_MAX_CAPACITY = 46.0;

export interface DistributedExperienceItem {
  role: string;
  company: string;
  period: string;
  bullets: string[];
  isContinued?: boolean;
  originalIndex: number;
}

export interface CvPageDistributionResult {
  needsTwoPages: boolean;
  totalPages: number;
  splitExpIndex: number;
  page1Experiences: DistributedExperienceItem[];
  page2Experiences: DistributedExperienceItem[];
  page1Weight: number;
  remainingWeight: number;
  capacityUtilizationPct: number;
}

export function cleanBulletText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^[%‰]\s*[ÏïîIíi]?\s*/i, '')
    .replace(/^[\s•\-\*·\u2022\u25cf\u25cb\u25e6\u2219\u22c5\u00b7\.\d+\)]+\s*/, '')
    .trim();
}

/**
 * Calcula el peso vertical del encabezado del documento
 */
export function getHeaderWeight(content: CVFormValues['content'], targetRole?: string): number {
  let weight = 3.5; // Nombre + cargo + espaciados base
  const contactPartsCount = [
    content.email,
    content.phone,
    content.location,
    content.rut,
    content.linkedinUrl,
    content.websiteUrl,
  ].filter(Boolean).length;

  if (contactPartsCount > 0) {
    weight += contactPartsCount > 4 ? 1.8 : 1.2;
  }
  weight += 0.8; // Divisor inferior y margen
  return weight;
}

/**
 * Calcula el peso del resumen profesional
 */
export function getSummaryWeight(summary?: string): number {
  if (!summary || summary.trim().length === 0) return 0;
  const clean = summary.trim();
  // En contenedor A4 a text-xs caben ~120 caracteres por línea justificada
  const lines = Math.max(1, Math.ceil(clean.length / 120));
  // Título (1.8) + líneas de texto (1.0 c/u) + margen inferior (0.8)
  return 1.8 + lines * 1.0 + 0.8;
}

export type ExperienceLayoutInput = {
  role?: string;
  company?: string;
  period?: string;
  bullets?: string[];
  detailedBullets?: Array<{ text: string; [key: string]: any }>;
};

/**
 * Calcula el peso de una experiencia laboral individual calibrado por líneas reales
 */
export function getSingleExperienceWeight(exp: ExperienceLayoutInput): {
  totalWeight: number;
  headerWeight: number;
  bulletWeights: number[];
} {
  const headerWeight = 2.0; // Cargo + periodo + empresa + espaciado inicial
  const bullets = exp.bullets && exp.bullets.length > 0
    ? exp.bullets
    : (exp.detailedBullets || []).map((b) => b.text);

  const bulletWeights: number[] = [];
  for (const rawBullet of bullets) {
    const cleaned = cleanBulletText(rawBullet);
    if (!cleaned) continue;
    // En lista con sangría y viñeta caben ~118 caracteres por línea
    const lines = Math.max(1, Math.ceil(cleaned.length / 118));
    // Peso de línea real + margen inter-viñeta (space-y-1.5 = 6px = 0.25 unidades)
    bulletWeights.push(lines * 1.0 + 0.25);
  }

  const bulletsTotal = bulletWeights.reduce((acc, w) => acc + w, 0);
  const marginAfterJob = 0.6;
  return {
    totalWeight: headerWeight + bulletsTotal + marginAfterJob,
    headerWeight,
    bulletWeights,
  };
}

/**
 * Calcula el peso de secciones complementarias (Habilidades, Educación, Referencias)
 */
export function getSecondarySectionsWeights(content: CVFormValues['content']): {
  skillsWeight: number;
  eduWeight: number;
  refWeight: number;
  totalSecondaryWeight: number;
} {
  const skillsCount = content.skills?.length || 0;
  const skillsWeight = skillsCount > 0
    ? 1.8 + Math.ceil(skillsCount / 8) * 1.6 + 0.8 // Título + renglones de tags + margen
    : 0;

  const eduCount = content.education?.length || 0;
  const eduWeight = eduCount > 0
    ? 1.8 + eduCount * 1.6 + 0.8 // Título + grados + margen
    : 0;

  const refCount = content.references?.length || 0;
  const refWeight = refCount > 0
    ? 1.8 + Math.ceil(refCount / 2) * 3.2 + 0.8 // Título + filas de 2 referencias + margen
    : 0;

  return {
    skillsWeight,
    eduWeight,
    refWeight,
    totalSecondaryWeight: skillsWeight + eduWeight + refWeight,
  };
}

/**
 * Algoritmo maestro de partición y balance armónico A4
 */
export function calculateCvPageDistribution(
  cv: CVFormValues,
  maxPageCapacity: number = A4_PAGE_MAX_CAPACITY
): CvPageDistributionResult {
  const { content } = cv;
  const experiences = content.experience || [];

  const headerWeight = getHeaderWeight(content, cv.targetRole);
  const summaryWeight = getSummaryWeight(content.summary);
  const expSectionTitleWeight = experiences.length > 0 ? 1.8 : 0;
  const { totalSecondaryWeight } = getSecondarySectionsWeights(content);

  // 1. Caso base: si todo el contenido (incluyendo secundarias) cabe en 1 hoja
  const expDetails = experiences.map((exp) => getSingleExperienceWeight(exp));
  const totalExpWeight = expDetails.reduce((acc, d) => acc + d.totalWeight, 0);

  const allContentWeight = headerWeight + summaryWeight + expSectionTitleWeight + totalExpWeight + totalSecondaryWeight;

  if (allContentWeight <= maxPageCapacity) {
    return {
      needsTwoPages: false,
      totalPages: 1,
      splitExpIndex: experiences.length,
      page1Experiences: experiences.map((exp, idx) => ({
        role: exp.role,
        company: exp.company,
        period: exp.period,
        bullets: exp.bullets || (exp.detailedBullets || []).map((b) => b.text),
        originalIndex: idx,
      })),
      page2Experiences: [],
      page1Weight: allContentWeight,
      remainingWeight: 0,
      capacityUtilizationPct: Math.round((allContentWeight / maxPageCapacity) * 100),
    };
  }

  // 2. Necesita 2 páginas: distribuir experiencias en Hoja 1
  let accumulatedPage1Weight = headerWeight + summaryWeight + expSectionTitleWeight;
  let splitExpIndex = 0;

  const page1Experiences: DistributedExperienceItem[] = [];
  const page2Experiences: DistributedExperienceItem[] = [];

  for (let i = 0; i < experiences.length; i++) {
    const exp = experiences[i];
    const details = expDetails[i];
    const bullets = exp.bullets || (exp.detailedBullets || []).map((b) => b.text);

    // ¿Cabe esta experiencia completa en la Hoja 1?
    if (accumulatedPage1Weight + details.totalWeight <= maxPageCapacity) {
      accumulatedPage1Weight += details.totalWeight;
      page1Experiences.push({
        role: exp.role,
        company: exp.company,
        period: exp.period,
        bullets,
        originalIndex: i,
      });
      splitExpIndex = i + 1;
    } else {
      // No cabe completa.
      // Si la Hoja 1 ya está al menos al 72% de capacidad (~33 unidades), es preferible NO cortar
      // la experiencia por la mitad y dejarla íntegra al inicio de la Hoja 2.
      const isPageSufficientlyFilled = accumulatedPage1Weight >= maxPageCapacity * 0.72;

      // Si la página tiene poco contenido (<72%) y la experiencia tiene suficientes viñetas,
      // evaluamos si cabe la cabecera del cargo + al menos 2 viñetas.
      const availableSpace = maxPageCapacity - accumulatedPage1Weight;
      const canFitPartial = !isPageSufficientlyFilled && availableSpace >= details.headerWeight + 2.5 && bullets.length >= 4;

      if (canFitPartial) {
        let partialBulletsWeight = details.headerWeight;
        let fitBulletCount = 0;

        for (let bIdx = 0; bIdx < details.bulletWeights.length; bIdx++) {
          const bWeight = details.bulletWeights[bIdx];
          if (partialBulletsWeight + bWeight <= availableSpace) {
            partialBulletsWeight += bWeight;
            fitBulletCount++;
          } else {
            break;
          }
        }

        if (fitBulletCount >= 2 && fitBulletCount < bullets.length) {
          // Dividir viñetas entre Hoja 1 y Hoja 2
          page1Experiences.push({
            role: exp.role,
            company: exp.company,
            period: exp.period,
            bullets: bullets.slice(0, fitBulletCount),
            originalIndex: i,
          });
          accumulatedPage1Weight += partialBulletsWeight;

          page2Experiences.push({
            role: exp.role,
            company: exp.company,
            period: exp.period,
            bullets: bullets.slice(fitBulletCount),
            isContinued: true,
            originalIndex: i,
          });
          splitExpIndex = i;

          // Añadir las experiencias restantes a Hoja 2
          for (let j = i + 1; j < experiences.length; j++) {
            const nextExp = experiences[j];
            page2Experiences.push({
              role: nextExp.role,
              company: nextExp.company,
              period: nextExp.period,
              bullets: nextExp.bullets || (nextExp.detailedBullets || []).map((b) => b.text),
              originalIndex: j,
            });
          }
          break;
        }
      }

      // Si no se subdivide, todas las experiencias a partir de `i` van a Hoja 2
      splitExpIndex = i;
      for (let j = i; j < experiences.length; j++) {
        const nextExp = experiences[j];
        page2Experiences.push({
          role: nextExp.role,
          company: nextExp.company,
          period: nextExp.period,
          bullets: nextExp.bullets || (nextExp.detailedBullets || []).map((b) => b.text),
          originalIndex: j,
        });
      }
      break;
    }
  }

  // Guardrail de emergencia: Si no cupo ninguna experiencia (caso extremo de primera exp gigantesca)
  if (page1Experiences.length === 0 && experiences.length > 0) {
    const firstExp = experiences[0];
    page1Experiences.push({
      role: firstExp.role,
      company: firstExp.company,
      period: firstExp.period,
      bullets: firstExp.bullets || (firstExp.detailedBullets || []).map((b) => b.text),
      originalIndex: 0,
    });
    splitExpIndex = 1;
    page2Experiences.shift();
    accumulatedPage1Weight += expDetails[0].totalWeight;
  }

  const remainingWeight = page2Experiences.reduce((acc, item) => {
    return acc + getSingleExperienceWeight(item as any).totalWeight;
  }, 0) + totalSecondaryWeight;

  const totalPages = remainingWeight > maxPageCapacity ? Math.min(3, 2 + Math.ceil((remainingWeight - maxPageCapacity) / maxPageCapacity)) : 2;

  return {
    needsTwoPages: true,
    totalPages,
    splitExpIndex,
    page1Experiences,
    page2Experiences,
    page1Weight: accumulatedPage1Weight,
    remainingWeight,
    capacityUtilizationPct: Math.round((accumulatedPage1Weight / maxPageCapacity) * 100),
  };
}
