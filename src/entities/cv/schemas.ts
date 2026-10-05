import { z } from 'zod';

/**
 * Viñeta de experiencia laboral con soporte para métricas STAR/XYZ
 * y bandera de mitigación de alucinaciones (EU AI Act).
 */
export const cvBulletSchema = z.object({
  text: z.string().min(1, 'El texto del logro es requerido'),
  needs_metric: z.boolean().default(false), // true si le falta cifra cuantitativa
  action_verb: z.string().optional(),
  impact_score: z.number().min(0).max(100).optional(),
});

export const cvExperienceSchema = z.object({
  company: z.string().min(1, 'Empresa requerida'),
  role: z.string().min(1, 'Cargo requerido'),
  period: z.string().min(1, 'Período requerido'),
  bullets: z.array(z.string()).default([]),
  detailedBullets: z.array(cvBulletSchema).optional().default([]),
});

/**
 * Grado o certificación académica con enlace a credencial verificable
 */
export const cvEducationSchema = z.object({
  degree: z.string().min(1, 'Título requerido'),
  institution: z.string().min(1, 'Institución requerida'),
  year: z.string().min(1, 'Año requerido'),
  verifiedCredentialId: z.string().optional(), // ID de credencial W3C / Hash de verificación
  credentialType: z.enum(['DEGREE', 'CERTIFICATION', 'DIPLOMA', 'UNVERIFIED']).default('UNVERIFIED'),
  confidenceScore: z.number().min(0).max(1).optional(), // Similitud coseno con documento adjunto
});

/**
 * Credenciales y Títulos adjuntos analizados por OCR Multimodal
 */
export const verifiedCredentialSchema = z.object({
  id: z.string(),
  issuingInstitution: z.string(),
  credentialName: z.string(),
  recipientName: z.string().optional(),
  issueDate: z.string().optional(),
  verificationCode: z.string().optional(),
  mappedEducationIndex: z.number().optional(), // Índice en content.education
  validationStatus: z.enum(['CRYPTOGRAPHIC_MATCH', 'SEMANTIC_MATCH', 'MANUAL_REVIEW']),
  documentUrl: z.string().optional(),
});

export type VerifiedCredential = z.infer<typeof verifiedCredentialSchema>;

/**
 * Habilidades estructuradas con taxonomía ESCO / O*NET
 */
export const cvSkillItemSchema = z.object({
  name: z.string(),
  category: z.enum(['TECHNICAL', 'SOFT', 'LANGUAGE', 'TOOL']).default('TECHNICAL'),
  normalizedTaxonomyId: z.string().optional(), // ESCO code
});

/**
 * Referencia laboral o profesional
 */
export const cvReferenceSchema = z.object({
  name: z.string().min(1, 'Nombre de la referencia requerido'),
  role: z.string().min(1, 'Cargo de la referencia requerido'),
  company: z.string().min(1, 'Empresa o institución requerida'),
  contact: z.string().optional(), // Teléfono o Email
});

export type CVReference = z.infer<typeof cvReferenceSchema>;

export const cvFormSchema = z.object({
  title: z.string().min(2, 'El título del CV debe tener al menos 2 caracteres'),
  targetRole: z.string().min(2, 'El rol objetivo debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(3, 'El enlace debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo se permiten letras minúsculas, números y guiones')
    .optional(),
  isPublic: z.boolean().default(true).optional(),
  templateId: z.string().default('executive-modern'),
  content: z.object({
    fullName: z.string().min(1, 'Nombre completo requerido'),
    email: z.string().default(''), // Puede quedar pendiente si no viene en el documento
    phone: z.string().default(''), // Puede quedar pendiente si no viene en el documento
    location: z.string().default(''), // Puede quedar pendiente
    rut: z.string().optional(), // RUT / DNI
    summary: z.string().default(''), // Resumen profesional (puede estar pendiente)
    skills: z.array(z.string()).default([]),
    experience: z.array(cvExperienceSchema).default([]),
    education: z.array(cvEducationSchema).default([]),
    references: z.array(cvReferenceSchema).optional().default([]),
    credentials: z.array(verifiedCredentialSchema).optional().default([]),
    // Enlaces Profesionales Modernos
    linkedinUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
    indiCardSlug: z.string().optional(),
    // Firma Digital Ejecutiva
    signatureUrl: z.string().optional(),
    signatureType: z.enum(['DRAWN', 'UPLOADED', 'TYPOGRAPHIC', 'NONE']).optional().default('NONE'),
    signatureDate: z.string().optional(),
  }),
});

export type CVFormValues = z.infer<typeof cvFormSchema>;

/**
 * Normaliza cualquier nombre o rol a un slug válido para URLs de Smart CV
 */
export function slugifyCvTitle(titleOrRole: string): string {
  const normalized = titleOrRole
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 48)
    .replace(/(^-|-$)+/g, '');
  return normalized || 'cv-profesional';
}

/**
 * Genera un slug profesional para un Smart CV
 * @param nameOrRole Nombre profesional o rol base
 * @param withSuffix Si es true, añade un sufijo aleatorio de 4 caracteres para evitar colisiones
 */
export function generateCvSlug(nameOrRole: string = 'cv', withSuffix: boolean = false): string {
  const base = slugifyCvTitle(nameOrRole);
  if (!withSuffix) {
    return base;
  }
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Slugs reservados del sistema para CV
 */
export const RESERVED_CV_SLUGS = new Set([
  'admin',
  'api',
  'dashboard',
  'cards',
  'cv',
  'presentations',
  'pricing',
  'start',
  'login',
  'register',
  'auth',
  'settings',
  'account',
  'billing',
  'help',
  'terms',
  'privacy',
  'download',
  'pdf',
  'export',
  'ats',
  'parse',
  'new',
  'preview',
]);

export function isReservedCvSlug(slug: string): boolean {
  if (!slug) return false;
  return RESERVED_CV_SLUGS.has(slug.toLowerCase().trim());
}

/**
 * Genera alternativas ejecutivas y profesionales si un slug de CV ya está tomado
 */
export function generateCvSlugAlternatives(baseSlug: string, role?: string): string[] {
  const cleanBase = slugifyCvTitle(baseSlug);
  const alternatives: string[] = [];

  // 1. Variantes profesionales
  alternatives.push(`${cleanBase}-pro`);
  alternatives.push(`${cleanBase}-cv`);

  // 2. Variante contextual por cargo si existe
  if (role) {
    const cleanRole = slugifyCvTitle(role).split('-')[0];
    if (cleanRole && cleanRole.length >= 3) {
      alternatives.push(`${cleanBase}-${cleanRole}`);
    }
  }

  // 3. Variante territorial o formal
  alternatives.push(`${cleanBase}-cl`);

  return Array.from(new Set(alternatives)).filter(
    (alt) => !isReservedCvSlug(alt) && alt !== cleanBase
  ).slice(0, 3);
}


export interface AtsAuditResult {
  score: number;
  strengths: string[];
  improvements: string[];
  keywordMatches: string[];
  missingKeywords: string[];
  hallucinationWarnings?: string[];
  apcaContrastPass?: boolean;
}

/**
 * Esquema de respuesta devuelto por el motor de visión multimodal (Qwen2.5-VL / Gemini)
 */
export const multimodalCvExtractionSchema = z.object({
  fullName: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  rut: z.string().optional(),
  linkedinUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  targetRole: z.string().default(''),
  summary: z.string().default(''),
  skills: z.array(z.string()).default([]),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string(),
      rawAchievements: z.array(z.string()),
      xyzBullets: z.array(
        z.object({
          text: z.string(),
          needs_metric: z.boolean(),
        })
      ),
    })
  ).default([]),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string(),
    })
  ).default([]),
  references: z.array(cvReferenceSchema).default([]),
});

export type MultimodalCvExtraction = z.infer<typeof multimodalCvExtractionSchema>;
