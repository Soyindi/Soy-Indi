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
  address: z.string().max(200, 'La dirección no puede superar los 200 caracteres').optional().nullable(),
  themeConfig: z.object({
    themeId: z.string().default('stellar'),
    primaryColorOklch: z.string().default('#6366f1'),
    backgroundColorOklch: z.string().default('#090a10'),
    particleBehavior: z.enum(['static', 'interactive', 'ambient']).default('ambient'),
    particleIntensity: z.enum(['subtle', 'balanced', 'prominent']).default('balanced'),
    fontFamily: z.string().default('Inter'),
    enableGlassRefraction: z.boolean().default(true),
    badgeText: z.string().max(40).optional().nullable(),
    ctaLabel: z.string().max(40).optional().nullable(),
    cardFinish: z.enum(['classic', 'holographic', 'titanium', 'obsidian', 'minimal']).default('classic').optional(),
    surfaceTexture: z.enum(['none', 'dot-grid', 'radial-glow']).default('radial-glow').optional(),
  }),
  bentoBlocks: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(['link', 'metric', 'featured_project', 'testimonial']),
        title: z.string().min(1).max(100),
        subtitle: z.string().max(160).optional().nullable(),
        url: z.string().url().optional().nullable().or(z.literal('')),
        metricValue: z.string().max(30).optional().nullable(),
        metricDelta: z.string().max(30).optional().nullable(),
      })
    )
    .optional(),
});

export type CardFormValues = z.infer<typeof cardFormSchema>;
export type CardFormInput = z.input<typeof cardFormSchema>;
export type CardBentoBlock = NonNullable<CardFormValues['bentoBlocks']>[number];
