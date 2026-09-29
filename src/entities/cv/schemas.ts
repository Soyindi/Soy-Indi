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

export const cvFormSchema = z.object({
  title: z.string().min(2, 'El título del CV debe tener al menos 2 caracteres'),
  targetRole: z.string().min(2, 'El rol objetivo debe tener al menos 2 caracteres'),
  templateId: z.string().default('executive-modern'),
  content: z.object({
    fullName: z.string().min(2, 'Nombre completo requerido'),
    email: z.string().email('Email válido requerido'),
    phone: z.string().min(6, 'Teléfono requerido'),
    location: z.string().default('Chile'),
    summary: z.string().min(10, 'El resumen debe tener al menos 10 caracteres'),
    skills: z.array(z.string()).default([]),
    experience: z.array(cvExperienceSchema).default([]),
    education: z.array(cvEducationSchema).default([]),
    credentials: z.array(verifiedCredentialSchema).optional().default([]),
  }),
});

export type CVFormValues = z.infer<typeof cvFormSchema>;

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
});

export type MultimodalCvExtraction = z.infer<typeof multimodalCvExtractionSchema>;
