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
  photoUrl: z
    .string()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        if (val.startsWith('data:image/')) return true;
        try {
          const parsed = new URL(val);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'URL o formato de imagen inválido' }
    )
    .optional()
    .nullable()
    .or(z.literal('')),
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

/**
 * Normaliza cualquier nombre o texto a un slug seguro y limpio para tarjetas de presentación
 * Remueve tildes, eñes y caracteres especiales, preservando solo letras minúsculas, números y guiones.
 */
export function slugifyCardName(name: string): string {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve tildes y diacríticos
    .replace(/[^a-z0-9]+/g, '-')     // Reemplaza caracteres no alfanuméricos por guión
    .replace(/(^-|-$)+/g, '');       // Remueve guiones al inicio o final

  return normalized || 'tarjeta';
}

/**
 * Genera un slug profesional para tarjetas de presentación
 * @param name Nombre o título profesional base
 * @param withSuffix Si es true, añade un sufijo aleatorio de 4 caracteres para evitar colisiones
 */
export function generateCardSlug(name: string = 'carlos-mendoza', withSuffix: boolean = false): string {
  const base = slugifyCardName(name);
  if (!withSuffix) {
    return base;
  }
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Slugs reservados del sistema para prevenir colisiones con rutas internas
 */
export const RESERVED_CARD_SLUGS = new Set([
  'admin',
  'api',
  'dashboard',
  'cards',
  'card',
  'cv',
  'presentations',
  'presentation',
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
  'blog',
  'app',
  'explore',
  'search',
  'p',
  'c',
]);

/**
 * Comprueba si un slug pertenece a las rutas del sistema reservadas
 */
export function isReservedCardSlug(slug: string): boolean {
  if (!slug) return false;
  return RESERVED_CARD_SLUGS.has(slug.toLowerCase().trim());
}

/**
 * Genera alternativas ejecutivas y profesionales si un slug ya está tomado
 */
export function generateSlugAlternatives(baseSlug: string, profession?: string): string[] {
  const cleanBase = slugifyCardName(baseSlug);
  const alternatives: string[] = [];

  // 1. Variante con sufijo profesional común
  alternatives.push(`${cleanBase}-pro`);
  alternatives.push(`${cleanBase}-cl`);

  // 2. Variante contextual por profesión si existe
  if (profession) {
    const cleanProf = slugifyCardName(profession).split('-')[0];
    if (cleanProf && cleanProf.length >= 3) {
      alternatives.push(`${cleanBase}-${cleanProf}`);
    }
  }

  // 3. Variante con número o sufijo corto
  alternatives.push(`${cleanBase}-oficial`);

  // Desduplicar y filtrar los que colisionen con reservados
  return Array.from(new Set(alternatives)).filter(
    (alt) => !isReservedCardSlug(alt) && alt !== cleanBase
  ).slice(0, 3);
}


