import { z } from 'zod';

export const cvExperienceSchema = z.object({
  company: z.string().min(1, 'Empresa requerida'),
  role: z.string().min(1, 'Cargo requerido'),
  period: z.string().min(1, 'Período requerido'),
  bullets: z.array(z.string()).default([]),
});

export const cvEducationSchema = z.object({
  degree: z.string().min(1, 'Título requerido'),
  institution: z.string().min(1, 'Institución requerida'),
  year: z.string().min(1, 'Año requerido'),
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
  }),
});

export type CVFormValues = z.infer<typeof cvFormSchema>;

export interface AtsAuditResult {
  score: number;
  strengths: string[];
  improvements: string[];
  keywordMatches: string[];
  missingKeywords: string[];
}
