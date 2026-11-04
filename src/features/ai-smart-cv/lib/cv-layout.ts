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
  page3Experiences?: DistributedExperienceItem[];
  page1Education?: NonNullable<CVFormValues['content']['education']>;
  page2Education?: NonNullable<CVFormValues['content']['education']>;
  page3Education?: NonNullable<CVFormValues['content']['education']>;
  skillsPage?: 1 | 2 | 3;
  referencesPage?: 1 | 2 | 3;
  signaturePage?: 1 | 2 | 3;
  page1Weight: number;
  page2Weight?: number;
  page3Weight?: number;
  remainingWeight: number;
  capacityUtilizationPct: number;
  page2UtilizationPct?: number;
  page3UtilizationPct?: number;
}

export function cleanBulletText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^[%‰]\s*[ÏïîIíi]?\s*/i, '')
    .replace(/^[\s•\-\*·\u2022\u25cf\u25cb\u25e6\u2219\u22c5\u00b7\u2013\u2014–—\.\d+\)]+\s*/, '')
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
    ? 1.8 + Math.ceil(skillsCount / 9) * 1.25 + 0.6 // Título + renglones de tags compactos + margen
    : 0;

  const eduCount = content.education?.length || 0;
  // Con > 4 ítems educativos, la formación complementaria se renderiza en grilla ejecutiva de 2 columnas
  const eduWeight = eduCount > 0
    ? eduCount <= 4
      ? 1.8 + eduCount * 1.5 + 0.6
      : 1.8 + 1.6 + Math.ceil((eduCount - 1) / 2) * 1.35 + 0.6
    : 0;

  const refCount = content.references?.length || 0;
  const refCols = refCount >= 3 ? 3 : 2;
  const refRowWeight = refCount >= 3 ? 2.6 : 3.0;
  const refWeight = refCount > 0
    ? 1.8 + Math.ceil(refCount / refCols) * refRowWeight + 0.6 // Título + filas de 2 o 3 referencias + margen
    : 0;

  return {
    skillsWeight,
    eduWeight,
    refWeight,
    totalSecondaryWeight: skillsWeight + eduWeight + refWeight,
  };
}

/**
 * Algoritmo maestro de partición y balance armónico A4 (Soporte elástico 1, 2 y 3 hojas)
 */
export function calculateCvPageDistribution(
  cv: CVFormValues,
  maxPageCapacity: number = A4_PAGE_MAX_CAPACITY
): CvPageDistributionResult {
  const { content } = cv;
  const experiences = content.experience || [];
  const eduList = content.education || [];

  const headerWeight = getHeaderWeight(content, cv.targetRole);
  const summaryWeight = getSummaryWeight(content.summary);
  const expSectionTitleWeight = experiences.length > 0 ? 1.8 : 0;
  const { skillsWeight, eduWeight, refWeight, totalSecondaryWeight } = getSecondarySectionsWeights(content);

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
      page3Experiences: [],
      page1Education: eduList,
      page2Education: [],
      page3Education: [],
      skillsPage: 1,
      referencesPage: 1,
      signaturePage: 1,
      page1Weight: allContentWeight,
      page2Weight: 0,
      page3Weight: 0,
      remainingWeight: 0,
      capacityUtilizationPct: Math.round((allContentWeight / maxPageCapacity) * 100),
      page2UtilizationPct: 0,
      page3UtilizationPct: 0,
    };
  }

  // 2. Necesita 2+ páginas: distribuir experiencias en Hoja 1 aprovechando hasta el 86%-95% de capacidad
  let accumulatedPage1Weight = headerWeight + summaryWeight + expSectionTitleWeight;
  let splitExpIndex = 0;

  const page1Experiences: DistributedExperienceItem[] = [];
  const postPage1Experiences: DistributedExperienceItem[] = [];

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
      // Solo evitamos subdividir si la Hoja 1 ya está al >= 86% de su capacidad (~39.5 unidades).
      // Debajo del 86% (ej. 73%), subdividimos para eliminar huecos blancos al final de la Hoja 1 y descargar la Hoja 2.
      const isPageSufficientlyFilled = accumulatedPage1Weight >= maxPageCapacity * 0.86;
      const availableSpace = maxPageCapacity - accumulatedPage1Weight;
      const minBulletsRequired = accumulatedPage1Weight >= maxPageCapacity * 0.65 ? 1 : 2;
      const canFitPartial =
        !isPageSufficientlyFilled &&
        availableSpace >= details.headerWeight + 2.2 &&
        bullets.length >= 2;

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

        if (fitBulletCount >= minBulletsRequired && fitBulletCount < bullets.length) {
          page1Experiences.push({
            role: exp.role,
            company: exp.company,
            period: exp.period,
            bullets: bullets.slice(0, fitBulletCount),
            originalIndex: i,
          });
          accumulatedPage1Weight += partialBulletsWeight;

          postPage1Experiences.push({
            role: exp.role,
            company: exp.company,
            period: exp.period,
            bullets: bullets.slice(fitBulletCount),
            isContinued: true,
            originalIndex: i,
          });
          splitExpIndex = i;

          for (let j = i + 1; j < experiences.length; j++) {
            const nextExp = experiences[j];
            postPage1Experiences.push({
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

      // Si no se subdivide, todas las experiencias a partir de `i` van después de Hoja 1
      splitExpIndex = i;
      for (let j = i; j < experiences.length; j++) {
        const nextExp = experiences[j];
        postPage1Experiences.push({
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
    postPage1Experiences.shift();
    accumulatedPage1Weight += expDetails[0].totalWeight;
  }

  // 3. Si todas las experiencias cupieron en Hoja 1 y aún queda espacio en Hoja 1 para Habilidades, adelantarlas a Hoja 1
  let skillsPage: 1 | 2 | 3 = 2;
  if (
    postPage1Experiences.length === 0 &&
    skillsWeight > 0 &&
    accumulatedPage1Weight + skillsWeight <= maxPageCapacity * 0.94
  ) {
    skillsPage = 1;
    accumulatedPage1Weight += skillsWeight;
  }

  // 4. Distribuir contenido restante entre Hoja 2 y Hoja 3 (si excede la capacidad de Hoja 2)
  const page2Experiences: DistributedExperienceItem[] = [];
  const page3Experiences: DistributedExperienceItem[] = [];
  let accumulatedPage2Weight = 1.4; // Cabecera compacta de continuación en Hoja 2
  let accumulatedPage3Weight = 1.4; // Cabecera compacta de continuación en Hoja 3

  if (postPage1Experiences.length > 0) {
    accumulatedPage2Weight += 1.5; // Título de sección de experiencia en Hoja 2
    for (let k = 0; k < postPage1Experiences.length; k++) {
      const item = postPage1Experiences[k];
      const itemDetails = getSingleExperienceWeight(item);

      if (page2Experiences.length === 0 || accumulatedPage2Weight + itemDetails.totalWeight <= maxPageCapacity) {
        page2Experiences.push(item);
        accumulatedPage2Weight += itemDetails.totalWeight;
      } else {
        const avail2 = maxPageCapacity - accumulatedPage2Weight;
        if (avail2 >= itemDetails.headerWeight + 2.2 && item.bullets.length >= 2) {
          let partialWeight = itemDetails.headerWeight;
          let fitCount = 0;
          for (const bw of itemDetails.bulletWeights) {
            if (partialWeight + bw <= avail2) {
              partialWeight += bw;
              fitCount++;
            } else {
              break;
            }
          }
          if (fitCount >= 1 && fitCount < item.bullets.length) {
            page2Experiences.push({
              ...item,
              bullets: item.bullets.slice(0, fitCount),
            });
            accumulatedPage2Weight += partialWeight;
            page3Experiences.push({
              ...item,
              bullets: item.bullets.slice(fitCount),
              isContinued: true,
            });
            accumulatedPage3Weight += 1.5 + (itemDetails.totalWeight - partialWeight);
            for (let m = k + 1; m < postPage1Experiences.length; m++) {
              page3Experiences.push(postPage1Experiences[m]);
              accumulatedPage3Weight += getSingleExperienceWeight(postPage1Experiences[m]).totalWeight;
            }
            break;
          }
        }

        for (let m = k; m < postPage1Experiences.length; m++) {
          page3Experiences.push(postPage1Experiences[m]);
          accumulatedPage3Weight += getSingleExperienceWeight(postPage1Experiences[m]).totalWeight;
        }
        break;
      }
    }
  }

  // Asignar página de Habilidades (si no quedó en Hoja 1)
  if (skillsPage !== 1) {
    if (page3Experiences.length === 0 && (accumulatedPage2Weight + skillsWeight <= maxPageCapacity || skillsWeight === 0)) {
      skillsPage = 2;
      accumulatedPage2Weight += skillsWeight;
    } else {
      skillsPage = 3;
      accumulatedPage3Weight += skillsWeight;
    }
  }

  // Asignar Educación entre Hoja 2 y Hoja 3
  const page1Education: NonNullable<CVFormValues['content']['education']> = [];
  let page2Education: NonNullable<CVFormValues['content']['education']> = [];
  let page3Education: NonNullable<CVFormValues['content']['education']> = [];

  if (eduList.length > 0) {
    if (skillsPage <= 2 && page3Experiences.length === 0 && accumulatedPage2Weight + eduWeight <= maxPageCapacity) {
      page2Education = eduList;
      accumulatedPage2Weight += eduWeight;
    } else if (skillsPage <= 2 && page3Experiences.length === 0 && maxPageCapacity - accumulatedPage2Weight >= 4.5) {
      const availEduSpace = maxPageCapacity - accumulatedPage2Weight - 2.0;
      const perItemWeight = eduList.length <= 4 ? 1.5 : 0.72;
      const fitEduCount = Math.max(1, Math.min(eduList.length, Math.floor(availEduSpace / perItemWeight)));
      if (fitEduCount < eduList.length) {
        page2Education = eduList.slice(0, fitEduCount);
        page3Education = eduList.slice(fitEduCount);
        accumulatedPage2Weight += 2.0 + fitEduCount * perItemWeight;
        accumulatedPage3Weight += 2.0 + (eduList.length - fitEduCount) * perItemWeight;
      } else {
        page2Education = eduList;
        accumulatedPage2Weight += eduWeight;
      }
    } else {
      page3Education = eduList;
      accumulatedPage3Weight += eduWeight;
    }
  }

  // Asignar Referencias entre Hoja 2 y Hoja 3
  let referencesPage: 1 | 2 | 3 = 2;
  if (refWeight === 0) {
    referencesPage = page3Experiences.length > 0 || page3Education.length > 0 || skillsPage === 3 ? 3 : 2;
  } else if (
    page3Experiences.length === 0 &&
    page3Education.length === 0 &&
    skillsPage <= 2 &&
    accumulatedPage2Weight + refWeight <= maxPageCapacity
  ) {
    referencesPage = 2;
    accumulatedPage2Weight += refWeight;
  } else {
    referencesPage = 3;
    accumulatedPage3Weight += refWeight;
  }

  const remainingWeight = postPage1Experiences.reduce((acc, item) => {
    return acc + getSingleExperienceWeight(item as any).totalWeight;
  }, 0) + (skillsPage === 1 ? eduWeight + refWeight : totalSecondaryWeight);

  const hasPage3Content =
    page3Experiences.length > 0 ||
    page3Education.length > 0 ||
    skillsPage === 3 ||
    (referencesPage === 3 && (content.references?.length || 0) > 0);

  const totalPages: 2 | 3 = hasPage3Content ? 3 : 2;
  const signaturePage: 2 | 3 = totalPages;

  return {
    needsTwoPages: true,
    totalPages,
    splitExpIndex,
    page1Experiences,
    page2Experiences,
    page3Experiences,
    page1Education,
    page2Education,
    page3Education,
    skillsPage,
    referencesPage,
    signaturePage,
    page1Weight: accumulatedPage1Weight,
    page2Weight: accumulatedPage2Weight,
    page3Weight: hasPage3Content ? accumulatedPage3Weight : 0,
    remainingWeight,
    capacityUtilizationPct: Math.round((accumulatedPage1Weight / maxPageCapacity) * 100),
    page2UtilizationPct: Math.min(100, Math.round((accumulatedPage2Weight / maxPageCapacity) * 100)),
    page3UtilizationPct: hasPage3Content ? Math.min(100, Math.round((accumulatedPage3Weight / maxPageCapacity) * 100)) : 0,
  };
}
