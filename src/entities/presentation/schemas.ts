import { z } from 'zod';

export const presentationVisualTypeSchema = z.enum([
  'concept',
  'metrics',
  'code',
  'quote',
  'architecture',
  'comparison',
  'timeline',
  'bento',
]);

export const presentationLayoutSchema = z.enum([
  'standard',
  'split-2col',
  'bento-grid',
  'kpi-cards',
  'quote-focus',
  'timeline-steps',
  'layout-hero-statement',
  'layout-kpi-bento',
  'layout-split-comparison',
  'layout-sequential-timeline',
  'layout-masonry-dynamic',
]);

export const semanticIntentSchema = z.enum([
  'executive_scqa',
  'bento_dashboard',
  'timeline_roadmap',
  'testimonial',
  'comparison_delta',
  'hero_statement',
]);

export const targetAudienceSchema = z.enum([
  'investors',
  'b2b_clients',
  'engineering',
  'general',
]);

export const presentationToneSchema = z.enum([
  'orbital_cyber',
  'emerald_aurora',
  'deep_space',
  'solar_obsidian',
]);

export const documentArchetypeSchema = z.enum([
  'business_pitch',
  'technical_architecture',
  'audit_report',
  'narrative_educational',
  'executive_strategy',
]);

export const metricItemSchema = z.object({
  label: z.union([z.string(), z.number()]).nullish().default('Métrica').transform(v => String(v ?? 'Métrica')),
  value: z.union([z.string(), z.number()]).nullish().default('0').transform(v => String(v ?? '0')),
  change: z.union([z.string(), z.number()]).nullish().transform(v => (v != null ? String(v) : undefined)).optional(),
  trend: z.enum(['up', 'down', 'neutral']).nullish().default('up').transform(v => v || 'up').optional(),
  visualWeightDominance: z.number().nullish().default(3).transform(v => v || 3).optional(),
});

export const quoteDataSchema = z.object({
  quote: z.string().nullish().default('').transform(v => v || ''),
  author: z.string().nullish().default('').transform(v => v || ''),
  role: z.string().nullish().transform(v => v || undefined).optional(),
});

export const comparisonDataSchema = z.object({
  beforeTitle: z.string().nullish().default('Enfoque Tradicional').transform(v => v || 'Enfoque Tradicional'),
  beforeItems: z.array(z.any()).nullish().default([]).transform(items => (items || []).map(i => typeof i === 'string' ? i : (i?.text || i?.point || String(i ?? ''))).filter(Boolean)),
  afterTitle: z.string().nullish().default('INDI 2026').transform(v => v || 'INDI 2026'),
  afterItems: z.array(z.any()).nullish().default([]).transform(items => (items || []).map(i => typeof i === 'string' ? i : (i?.text || i?.point || String(i ?? ''))).filter(Boolean)),
});

export const timelineItemSchema = z.object({
  step: z.union([z.string(), z.number()]).nullish().default('Paso').transform(v => (v != null ? String(v) : 'Paso')),
  title: z.union([z.string(), z.number()]).nullish().default('').transform(v => (v != null ? String(v) : '')),
  description: z.union([z.string(), z.number()]).nullish().default('').transform(v => (v != null ? String(v) : '')),
});

export const presentationSlideSchema = z.object({
  id: z.string().nullish().default(() => crypto.randomUUID()).transform(v => v || crypto.randomUUID()),
  title: z.string().nullish().default('Diapositiva').transform(v => v || 'Diapositiva'),
  actionTitle: z.string().max(240, 'El Action Title debe ser conciso').nullish().transform(v => v || undefined).optional(),
  subtitle: z.string().nullish().transform(v => v || undefined).optional(),
  semanticIntent: semanticIntentSchema.nullish().default('executive_scqa').transform(v => v || 'executive_scqa').optional(),
  visualType: presentationVisualTypeSchema.nullish().default('concept').transform(v => v || 'concept').optional(),
  layout: presentationLayoutSchema.nullish().default('standard').transform(v => v || 'standard').optional(),
  keyPoints: z.array(z.any()).nullish().default([]).transform((items) => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return item.text || item.point || item.detail || item.title || item.item || JSON.stringify(item);
      }
      return String(item ?? '');
    }).filter(Boolean);
  }),
  speakerNotes: z.string().nullish().transform(v => v || undefined).optional(),
  badgeText: z.string().nullish().transform(v => v || undefined).optional(),
  estimatedDurationSeconds: z.number().nullish().default(60).transform(v => v || 60).optional(),
  keyTakeaway: z.string().nullish().transform(v => v || undefined).optional(),
  metricsData: z.array(metricItemSchema).nullish().transform(v => (v && v.length > 0 ? v : undefined)).optional(),
  quoteData: quoteDataSchema.nullish().transform(v => (v && (v.quote || v.author) ? v : undefined)).optional(),
  comparisonData: comparisonDataSchema.nullish().transform(v => (v && (v.beforeTitle || v.afterTitle || (v.beforeItems && v.beforeItems.length > 0)) ? v : undefined)).optional(),
  timelineData: z.array(timelineItemSchema).nullish().transform(v => (v && v.length > 0 ? v : undefined)).optional(),
  bentoModuleType: z.enum(['hero', 'metric', 'comparison', 'timeline', 'concept']).nullish().transform(v => v || undefined).optional(),
  gridSpan: z.object({
    cols: z.number().min(1).max(12).default(12),
    rows: z.number().min(1).max(6).default(1),
  }).nullish().transform(v => v || undefined).optional(),
  sourceProvenance: z.object({
    sourceParagraphIndex: z.number().optional(),
    snippetExcerpt: z.string().optional(),
    confidenceScore: z.number().optional(),
  }).nullish().transform(v => v || undefined).optional(),
});

export const presentationThemeSchema = z.object({
  id: z.string().default('orbital-dark'),
  name: z.string().default('Orbital Cyber'),
  primaryColor: z.string().default('#6366f1'),
  accentColor: z.string().default('#22d3ee'),
  backgroundGradient: z.string().default('radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 75%)'),
  enableParticles: z.boolean().default(true),
  fontFamily: z.string().nullish().default('sans').transform(v => v || 'sans').optional(),
  apcaReadabilityTarget: z.number().nullish().default(75).transform(v => v || 75).optional(),
  oklchHueLock: z.number().min(0).max(360).nullish().transform(v => v ?? undefined).optional(),
  transitionEffect: z.enum(['fade', 'slide', 'scale']).nullish().default('fade').transform(v => v || 'fade').optional(),
  ambientAuraIntensity: z.enum(['subtle', 'dramatic', 'off']).nullish().default('dramatic').transform(v => v || 'dramatic').optional(),
  fontPairing: z.enum(['sans', 'serif', 'mono']).nullish().default('sans').transform(v => v || 'sans').optional(),
});

export const presentationFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z
    .string()
    .min(3, 'El enlace debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo se permiten letras minúsculas, números y guiones'),
  isPublic: z.boolean().default(true),
  templateCategory: z.string().optional().nullable(),
  targetDurationMinutes: z.number().min(1).max(60).default(5).optional().nullable(),
  targetAudience: targetAudienceSchema.default('investors').optional().nullable(),
  presentationTone: presentationToneSchema.default('orbital_cyber').optional().nullable(),
  themeSettings: presentationThemeSchema,
  slidesData: z.array(presentationSlideSchema).min(1, 'Debe haber al menos 1 diapositiva'),
});

/**
 * Esquema para solicitudes de descomposición e ingesta multimodal
 */
export const presentationDecompositionRequestSchema = z.object({
  rawContent: z.string().min(5, 'Se requiere contenido suficiente para estructurar la presentación'),
  fileName: z.string().optional(),
  durationMinutes: z.number().min(1).max(60).default(5),
  targetAudience: targetAudienceSchema.default('investors'),
  presentationTone: presentationToneSchema.default('orbital_cyber'),
  documentArchetype: documentArchetypeSchema.optional(),
});

export const refineSlideRequestSchema = z.object({
  slide: presentationSlideSchema,
  action: z.enum(['action_title', 'punchy_bullets', 'speaker_notes', 'all_enhancements']),
  presentationContext: z.object({
    presentationTitle: z.string().optional(),
    targetAudience: targetAudienceSchema.optional(),
    tone: presentationToneSchema.optional(),
  }).optional(),
});

export const refineSlideSuggestionSchema = z.object({
  actionTitle: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
  speakerNotes: z.string().optional(),
  suggestedVisualType: presentationVisualTypeSchema.optional(),
  rationale: z.string().optional(),
});

export type PresentationVisualType = z.infer<typeof presentationVisualTypeSchema>;
export type PresentationLayout = z.infer<typeof presentationLayoutSchema>;
export type SemanticIntent = z.infer<typeof semanticIntentSchema>;
export type TargetAudience = z.infer<typeof targetAudienceSchema>;
export type PresentationTone = z.infer<typeof presentationToneSchema>;
export type DocumentArchetype = z.infer<typeof documentArchetypeSchema>;
export type MetricItem = z.infer<typeof metricItemSchema>;
export type QuoteData = z.infer<typeof quoteDataSchema>;
export type ComparisonData = z.infer<typeof comparisonDataSchema>;
export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type PresentationSlide = z.infer<typeof presentationSlideSchema>;
export type PresentationTheme = z.infer<typeof presentationThemeSchema>;
export type PresentationFormValues = z.infer<typeof presentationFormSchema>;
export type PresentationDecompositionRequest = z.infer<typeof presentationDecompositionRequestSchema>;
export type RefineSlideRequest = z.infer<typeof refineSlideRequestSchema>;
export type RefineSlideSuggestion = z.infer<typeof refineSlideSuggestionSchema>;

/**
 * Normaliza cualquier título a un slug válido URL-friendly para presentaciones
 */
export function slugifyPresentationTitle(title: string): string {
  const normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return normalized || 'presentacion';
}

/**
 * Genera un slug profesional para una presentación orbital
 * @param title Título base de la presentación
 * @param withSuffix Si es true, añade un sufijo aleatorio de 4 caracteres para evitar colisiones
 */
export function generatePresentationSlug(title: string = 'presentacion', withSuffix: boolean = false): string {
  const base = slugifyPresentationTitle(title);
  if (!withSuffix) {
    return base;
  }
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Slugs reservados del sistema para Presentaciones
 */
export const RESERVED_PRESENTATION_SLUGS = new Set([
  'admin',
  'api',
  'dashboard',
  'cards',
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
  'slides',
  'export',
  'pdf',
  'new',
  'parse',
  'studio',
  'templates',
  'present',
]);

export function isReservedPresentationSlug(slug: string): boolean {
  if (!slug) return false;
  return RESERVED_PRESENTATION_SLUGS.has(slug.toLowerCase().trim());
}

/**
 * Genera alternativas ejecutivas y profesionales si un slug de presentación ya está tomado
 */
export function generatePresentationSlugAlternatives(baseSlug: string): string[] {
  const cleanBase = slugifyPresentationTitle(baseSlug);
  const alternatives: string[] = [];

  // 1. Variantes ejecutivas
  alternatives.push(`${cleanBase}-pitch`);
  alternatives.push(`${cleanBase}-deck`);
  alternatives.push(`${cleanBase}-2026`);

  return Array.from(new Set(alternatives)).filter(
    (alt) => !isReservedPresentationSlug(alt) && alt !== cleanBase
  ).slice(0, 3);
}

/**
 * Esquema de validación Zod para el Asistente Granular de IA por Diapositiva (Slide-Level AI Copilot)
 */
export const refineSlideWithAiSchema = z.object({
  slide: presentationSlideSchema,
  action: z.enum(['action_title', 'punchy_bullets', 'speaker_notes', 'all_enhancements']),
  presentationContext: z
    .object({
      presentationTitle: z.string().optional(),
      targetAudience: targetAudienceSchema.optional(),
      tone: presentationToneSchema.optional(),
      slideIndex: z.number().optional(),
      totalSlides: z.number().optional(),
    })
    .optional(),
  userId: z.string().optional(),
});

export type RefineSlideWithAiInput = z.infer<typeof refineSlideWithAiSchema>;

