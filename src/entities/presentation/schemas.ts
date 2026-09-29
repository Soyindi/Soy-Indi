import { z } from 'zod';

export const presentationSlideSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'El título de la diapositiva es obligatorio'),
  subtitle: z.string().optional(),
  visualType: z.enum(['concept', 'metrics', 'code', 'quote', 'architecture']).default('concept'),
  keyPoints: z.array(z.string()).default([]),
  speakerNotes: z.string().optional(),
});

export const presentationThemeSchema = z.object({
  id: z.string().default('orbital-dark'),
  name: z.string().default('Orbital Cyber'),
  primaryColor: z.string().default('#6366f1'),
  accentColor: z.string().default('#22d3ee'),
  backgroundGradient: z.string().default('radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 70%)'),
  enableParticles: z.boolean().default(true),
});

export const presentationFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z
    .string()
    .min(3, 'El enlace debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo se permiten letras minúsculas, números y guiones'),
  isPublic: z.boolean().default(true),
  themeSettings: presentationThemeSchema,
  slidesData: z.array(presentationSlideSchema).min(1, 'Debe haber al menos 1 diapositiva'),
});

export type PresentationSlide = z.infer<typeof presentationSlideSchema>;
export type PresentationTheme = z.infer<typeof presentationThemeSchema>;
export type PresentationFormValues = z.infer<typeof presentationFormSchema>;
