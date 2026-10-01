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
  label: z.string().min(1, 'La etiqueta es requerida'),
  value: z.string().min(1, 'El valor métrico es requerido'),
  change: z.string().optional(),
  trend: z.enum(['up', 'down', 'neutral']).default('up'),
  visualWeightDominance: z.number().min(1).max(5).default(3).optional(),
});

export const quoteDataSchema = z.object({
  quote: z.string().min(1, 'La cita es requerida'),
  author: z.string().min(1, 'El autor es requerido'),
  role: z.string().optional(),
});

export const comparisonDataSchema = z.object({
  beforeTitle: z.string().default('Enfoque Tradicional'),
  beforeItems: z.array(z.string()).default([]),
  afterTitle: z.string().default('INDI 2026'),
  afterItems: z.array(z.string()).default([]),
});

export const timelineItemSchema = z.object({
  step: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const presentationSlideSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'El título de la diapositiva es obligatorio'),
  actionTitle: z.string().max(160, 'El Action Title debe ser conciso (máximo 160 caracteres)').optional(),
  subtitle: z.string().optional(),
  semanticIntent: semanticIntentSchema.default('executive_scqa').optional(),
  visualType: presentationVisualTypeSchema.default('concept'),
  layout: presentationLayoutSchema.default('standard'),
  keyPoints: z.array(z.string()).default([]),
  speakerNotes: z.string().optional(),
  badgeText: z.string().optional(),
  estimatedDurationSeconds: z.number().default(60).optional(),
  keyTakeaway: z.string().optional(),
  metricsData: z.array(metricItemSchema).optional(),
  quoteData: quoteDataSchema.optional(),
  comparisonData: comparisonDataSchema.optional(),
  timelineData: z.array(timelineItemSchema).optional(),
});

export const presentationThemeSchema = z.object({
  id: z.string().default('orbital-dark'),
  name: z.string().default('Orbital Cyber'),
  primaryColor: z.string().default('#6366f1'),
  accentColor: z.string().default('#22d3ee'),
  backgroundGradient: z.string().default('radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 75%)'),
  enableParticles: z.boolean().default(true),
  fontFamily: z.string().default('sans').optional(),
  apcaReadabilityTarget: z.number().default(75).optional(),
  oklchHueLock: z.number().min(0).max(360).optional(),
});

export const presentationFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z
    .string()
    .min(3, 'El enlace debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo se permiten letras minúsculas, números y guiones'),
  isPublic: z.boolean().default(true),
  templateCategory: z.string().optional(),
  targetDurationMinutes: z.number().min(1).max(60).default(5).optional(),
  targetAudience: targetAudienceSchema.default('investors').optional(),
  presentationTone: presentationToneSchema.default('orbital_cyber').optional(),
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
