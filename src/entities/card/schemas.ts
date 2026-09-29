import { z } from 'zod';

export const cardFormSchema = z.object({
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(50, 'El slug no puede superar los 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo se permiten letras minúsculas, números y guiones'),
  title: z
    .string()
    .min(2, 'El nombre o título debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede superar los 80 caracteres'),
  profession: z
    .string()
    .min(2, 'La profesión debe tener al menos 2 caracteres')
    .max(100, 'La profesión no puede superar los 100 caracteres'),
  about: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional()
    .nullable(),
  phone: z.string().max(30).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  emailContact: z.string().email('Email de contacto inválido').optional().nullable().or(z.literal('')),
  websiteUrl: z.string().url('URL de sitio web inválida').optional().nullable().or(z.literal('')),
  linkedinUrl: z.string().url('URL de LinkedIn inválida').optional().nullable().or(z.literal('')),
  instagramUrl: z.string().url('URL de Instagram inválida').optional().nullable().or(z.literal('')),
  photoUrl: z.string().url('URL de foto inválida').optional().nullable().or(z.literal('')),
  themeConfig: z.object({
    themeId: z.string().default('stellar'),
    primaryColorOklch: z.string().default('#6366f1'),
    backgroundColorOklch: z.string().default('#090a10'),
    particleBehavior: z.enum(['static', 'interactive', 'ambient']).default('ambient'),
    particleIntensity: z.enum(['subtle', 'balanced', 'prominent']).default('balanced'),
    fontFamily: z.string().default('Inter'),
    enableGlassRefraction: z.boolean().default(true),
  }),
});

export type CardFormValues = z.infer<typeof cardFormSchema>;
