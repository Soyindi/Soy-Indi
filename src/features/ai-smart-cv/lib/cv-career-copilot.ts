import {
  CVContent,
  CVFormValues,
  TailoredCvResult,
  ApplicationPitchResult,
  TranslatedCvResult,
} from '@/entities/cv/schemas';
import {
  analyzeCvJobMatchDeterministically,
  hasQuantitativeMetric,
} from '@/features/ai-smart-cv/lib/cv-matching-engine';
import { buildCanonicalUrl } from '@/entities/brand/domain';

/**
 * Motor Determinístico de Empleabilidad Smart CV 2.0 (INDI 2026)
 *
 * Funciones 100% puras (sin I/O) que garantizan:
 * 1. Tailor to Job sin alucinaciones (Zero Hallucination, EU AI Act)
 * 2. Generador de Pitch Multicanal (LinkedIn DM, WhatsApp, Email / Cover Letter)
 * 3. Traducción estructural ES ⇄ EN con preservación de empresas, fechas y métricas
 * 4. Mapeo bidireccional Tarjeta Digital ⇄ Smart CV
 */

function normalizeToken(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .trim();
}

/**
 * 1. TAILOR TO JOB (DETERMINISTA ANTI-ALUCINACIÓN)
 * Adapta el resumen, prioriza logros que coinciden con la oferta y agrega keywords relevantes
 * sin inventar empresas, cargos ni fechas inexistentes.
 */
export function buildDeterministicTailoredCv(
  cvContent: CVContent,
  jobDescriptionText: string,
  targetRole: string = ''
): TailoredCvResult {
  const analysis = analyzeCvJobMatchDeterministically(jobDescriptionText, cvContent, targetRole);
  const jobTokens = new Set(
    normalizeToken(jobDescriptionText)
      .split(/\s+/)
      .filter((t) => t.length >= 4)
  );

  // 1. Inyectar hasta 5 missingKeywords relevantes sin duplicar
  const existingNorm = new Set((cvContent.skills || []).map((s) => normalizeToken(s)));
  const addedSkills: string[] = [];
  for (const kw of analysis.missingKeywords.slice(0, 5)) {
    const normKw = normalizeToken(kw);
    if (normKw && !existingNorm.has(normKw)) {
      addedSkills.push(kw);
      existingNorm.add(normKw);
    }
  }
  const tailoredSkills = [...(cvContent.skills || []), ...addedSkills];

  // 2. Reordenar viñetas dentro de cada experiencia priorizando coincidencia con la oferta + métricas cuantitativas
  const tailoredExperience = (cvContent.experience || []).map((exp) => {
    const scoredBullets = (exp.bullets || []).map((b, idx) => {
      const bTokens = normalizeToken(b).split(/\s+/);
      const overlap = bTokens.filter((t) => jobTokens.has(t)).length;
      const metricBonus = hasQuantitativeMetric(b) ? 3 : 0;
      return { text: b, score: overlap * 2 + metricBonus, idx };
    });

    scoredBullets.sort((a, b) => b.score - a.score || a.idx - b.idx);
    const reorderedBullets = scoredBullets.map((item) => item.text);

    return {
      ...exp,
      bullets: reorderedBullets,
      detailedBullets: reorderedBullets.map((text) => ({
        text,
        needs_metric: !hasQuantitativeMetric(text),
      })),
    };
  });

  // 3. Adaptar el Resumen Ejecutivo alineándolo con el rol y keywords detectadas
  const topKeywords = [...analysis.matchingKeywords.slice(0, 3), ...addedSkills.slice(0, 2)];
  const keywordPhrase =
    topKeywords.length > 0 ? ` con foco en ${topKeywords.join(', ')}` : '';
  const baseSummary = (cvContent.summary || '').trim();
  const effectiveRole = targetRole.trim() || cvContent.experience?.[0]?.role || 'Profesional';

  let tailoredSummary = baseSummary;
  if (!baseSummary) {
    tailoredSummary = `${effectiveRole}${keywordPhrase}. Trayectoria comprobada orientada a resultados medibles, eficiencia operativa y cumplimiento de objetivos estratégicos.`;
  } else if (
    topKeywords.length > 0 &&
    !normalizeToken(baseSummary).includes(normalizeToken(topKeywords[0]))
  ) {
    tailoredSummary = `${baseSummary.replace(/\.$/, '')}. Especialización alineada a la vacante${keywordPhrase}.`;
  }

  const highlightsApplied: string[] = [];
  if (addedSkills.length > 0) {
    highlightsApplied.push(`Se integraron ${addedSkills.length} competencias clave detectadas en la vacante: ${addedSkills.join(', ')}.`);
  }
  if (tailoredExperience.length > 0) {
    highlightsApplied.push('Se priorizaron en primer lugar los logros cuantitativos con mayor afinidad ATS a la oferta.');
  }
  if (tailoredSummary !== baseSummary) {
    highlightsApplied.push('Resumen ejecutivo optimizado para maximizar el puntaje de coincidencia en filtros ATS.');
  }

  return {
    tailoredRole: effectiveRole,
    tailoredSummary,
    addedSkills,
    tailoredSkills,
    tailoredExperience,
    highlightsApplied,
  };
}

/**
 * 2. GENERADOR DE PITCH MULTICANAL (LINKEDIN DM · WHATSAPP · CORREO FORMAL / COVER LETTER)
 */
export function buildDeterministicApplicationPitches(input: {
  cvContent: CVContent;
  targetRole: string;
  cvSlug?: string;
  companyName?: string;
  hiringManagerName?: string;
  language?: 'es' | 'en';
}): ApplicationPitchResult {
  const lang = input.language || input.cvContent.language || 'es';
  const fullName = input.cvContent.fullName || 'Profesional';
  const firstName = fullName.split(/\s+/)[0] || fullName;
  const role = input.targetRole || 'Especialista';
  const company = input.companyName?.trim();
  const manager = input.hiringManagerName?.trim();

  const canonicalCvUrl = input.cvSlug
    ? buildCanonicalUrl(`/cv/${input.cvSlug}`)
    : buildCanonicalUrl('/cv');

  // Extraer el mejor logro cuantitativo del CV para dar prueba social inmediata
  let bestAchievement = '';
  for (const exp of input.cvContent.experience || []) {
    const metricBullet = (exp.bullets || []).find((b) => hasQuantitativeMetric(b));
    if (metricBullet) {
      bestAchievement = metricBullet.replace(/^[•\-\s]+/, '').trim();
      break;
    }
  }
  if (!bestAchievement && input.cvContent.experience?.[0]?.bullets?.[0]) {
    bestAchievement = input.cvContent.experience[0].bullets[0].replace(/^[•\-\s]+/, '').trim();
  }

  const topSkills = (input.cvContent.skills || []).slice(0, 4).join(', ');

  if (lang === 'en') {
    const greeting = manager ? `Hi ${manager},` : 'Hi there,';
    const companyClause = company ? ` at ${company}` : '';
    const achievementLine = bestAchievement ? ` Most recently: ${bestAchievement}` : '';
    const skillsLine = topSkills ? ` Core strengths: ${topSkills}.` : '';

    const linkedinDm = `${greeting} I noticed your opening for ${role}${companyClause} and wanted to reach out directly. I bring hands-on experience aligned with this role.${achievementLine} You can review my interactive ATS CV here: ${canonicalCvUrl} — Would love to connect!`;

    const whatsappPitch = `${greeting} I'm ${fullName}, applying for the ${role} position${companyClause}.${skillsLine} Sharing my interactive digital CV (PDF downloadable) for quick review: ${canonicalCvUrl}. Happy to coordinate a brief call whenever convenient.`;

    const formalEmail = {
      subject: `Application for ${role}${company ? ` — ${company}` : ''} | ${fullName}`,
      body: `Dear ${manager || 'Hiring Team'},\n\nI am writing to express my strong interest in the ${role} position${companyClause}. Throughout my career, I have focused on delivering measurable impact and operational excellence.${achievementLine ? `\n\nKey highlight: ${bestAchievement}` : ''}${skillsLine ? `\n\nKey competencies: ${topSkills}.` : ''}\n\nYou can view and download my verified ATS-ready CV directly at:\n${canonicalCvUrl}\n\nThank you for your time and consideration. I look forward to discussing how I can contribute to your team.\n\nBest regards,\n${fullName}${input.cvContent.phone ? `\n${input.cvContent.phone}` : ''}${input.cvContent.email ? `\n${input.cvContent.email}` : ''}`,
    };

    return { linkedinDm, whatsappPitch, formalEmail, canonicalCvUrl };
  }

  // Versión Español (Chile / LatAm Ejecutivo)
  const greeting = manager ? `Hola ${manager},` : 'Hola,';
  const companyClause = company ? ` en ${company}` : '';
  const achievementLine = bestAchievement ? ` Como referencia reciente: ${bestAchievement}` : '';
  const skillsLine = topSkills ? ` Manejo clave en ${topSkills}.` : '';

  const linkedinDm = `${greeting} vi la búsqueda para ${role}${companyClause} y me gustaría presentarme directamente. Cuento con experiencia comprobada en el área.${achievementLine} Te comparto mi Smart CV interactivo (formato ATS): ${canonicalCvUrl} — ¡Quedo atento a conversar!`;

  const whatsappPitch = `${greeting} te saluda ${fullName}. Postulo al cargo de ${role}${companyClause}.${skillsLine} Te dejo el enlace directo a mi CV interactivo y descargable en PDF para revisión rápida: ${canonicalCvUrl}. Quedo disponible para coordinar una entrevista.`;

  const formalEmail = {
    subject: `Postulación: ${role}${company ? ` — ${company}` : ''} | ${fullName}`,
    body: `Estimado/a ${manager || 'Equipo de Selección'},\n\nJunto con saludar, presento mi postulación para el cargo de ${role}${companyClause}. Mi trayectoria se caracteriza por la orientación a resultados medibles, mejora continua y ejecución de alto estándar.${achievementLine ? `\n\nLogro destacado: ${bestAchievement}` : ''}${skillsLine ? `\n\nCompetencias clave: ${topSkills}.` : ''}\n\nPuede revisar mi perfil profesional actualizado y descargar la versión PDF ATS directamente en el siguiente enlace:\n${canonicalCvUrl}\n\nAgradezco desde ya su tiempo y consideración. Quedo a plena disposición para una entrevista.\n\nSaludos cordiales,\n${fullName}${input.cvContent.phone ? `\nTel: ${input.cvContent.phone}` : ''}${input.cvContent.email ? `\nEmail: ${input.cvContent.email}` : ''}`,
  };

  return {
    linkedinDm,
    whatsappPitch,
    formalEmail,
    canonicalCvUrl,
  };
}

/**
 * 3. TRADUCTOR HEURÍSTICO DE RESPALDO ES ⇄ EN (PRESERVA EMPRESAS, FECHAS Y MÉTRICAS)
 */
const ROLE_TRANSLATIONS_ES_TO_EN: Array<[RegExp, string]> = [
  [/ingenier[oa]\s+de\s+software/gi, 'Software Engineer'],
  [/desarrollador[a]?\s+full\s*stack/gi, 'Full Stack Developer'],
  [/arquitect[oa]\s+cloud/gi, 'Cloud Architect'],
  [/especialista\s+en\s+marketing\s+digital/gi, 'Digital Marketing Specialist'],
  [/gerente\s+comercial/gi, 'Commercial Manager'],
  [/jefe\s+de\s+proyectos/gi, 'Project Manager'],
  [/analista\s+de\s+datos/gi, 'Data Analyst'],
  [/psic[oó]log[oa]/gi, 'Psychologist'],
  [/administrador[a]?\s+de\s+empresas/gi, 'Business Administrator'],
  [/presente|actualidad/gi, 'Present'],
];

const ROLE_TRANSLATIONS_EN_TO_ES: Array<[RegExp, string]> = [
  [/software\s+engineer/gi, 'Ingeniero de Software'],
  [/full\s*stack\s+developer/gi, 'Desarrollador Full Stack'],
  [/cloud\s+architect/gi, 'Arquitecto Cloud'],
  [/digital\s+marketing\s+specialist/gi, 'Especialista en Marketing Digital'],
  [/commercial\s+manager/gi, 'Gerente Comercial'],
  [/project\s+manager/gi, 'Jefe de Proyectos'],
  [/data\s+analyst/gi, 'Analista de Datos'],
  [/psychologist/gi, 'Psicólogo'],
  [/business\s+administrator/gi, 'Administrador de Empresas'],
  [/\bpresent\b/gi, 'Presente'],
];

function applyDictionary(text: string, dict: Array<[RegExp, string]>): string {
  let result = text || '';
  for (const [pattern, replacement] of dict) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function translateCvDeterministically(
  cvContent: CVContent,
  targetRole: string,
  targetLanguage: 'es' | 'en'
): TranslatedCvResult {
  const dict = targetLanguage === 'en' ? ROLE_TRANSLATIONS_ES_TO_EN : ROLE_TRANSLATIONS_EN_TO_ES;

  return {
    language: targetLanguage,
    targetRole: applyDictionary(targetRole, dict),
    summary: applyDictionary(cvContent.summary || '', dict),
    skills: (cvContent.skills || []).map((s) => applyDictionary(s, dict)),
    experience: (cvContent.experience || []).map((exp) => ({
      ...exp,
      role: applyDictionary(exp.role, dict),
      period: applyDictionary(exp.period, dict),
      bullets: (exp.bullets || []).map((b) => applyDictionary(b, dict)),
      detailedBullets: (exp.detailedBullets || []).map((db) => ({
        ...db,
        text: applyDictionary(db.text, dict),
      })),
    })),
    education: (cvContent.education || []).map((edu) => ({
      ...edu,
      degree: applyDictionary(edu.degree, dict),
      year: applyDictionary(edu.year, dict),
    })),
  };
}

/**
 * 4. MAPEO BIDIRECCIONAL TARJETA DIGITAL ⇄ SMART CV
 */
export function mapCardToCvPatch(card: {
  slug: string;
  title: string;
  profession: string;
  about?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  emailContact?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  address?: string | null;
}): {
  targetRole: string;
  contentPatch: Partial<CVContent>;
} {
  return {
    targetRole: card.profession || '',
    contentPatch: {
      fullName: card.title || '',
      email: card.emailContact || '',
      phone: card.phone || card.whatsapp || '',
      location: card.address || '',
      summary: card.about || '',
      linkedinUrl: card.linkedinUrl || undefined,
      websiteUrl: card.websiteUrl || undefined,
      indiCardSlug: card.slug,
    },
  };
}

export function mapCvToCardDraft(cv: CVFormValues): {
  title: string;
  profession: string;
  about: string;
  phone: string;
  whatsapp: string;
  emailContact: string;
  websiteUrl: string;
  linkedinUrl: string;
  address: string;
} {
  const { content } = cv;
  return {
    title: content.fullName || cv.title || 'Profesional',
    profession: cv.targetRole || 'Profesional Independiente',
    about: (content.summary || '').slice(0, 320),
    phone: content.phone || '',
    whatsapp: content.phone || '',
    emailContact: content.email || '',
    websiteUrl: content.websiteUrl || '',
    linkedinUrl: content.linkedinUrl || '',
    address: content.location || '',
  };
}
