import { z } from 'zod';

/**
 * Contrato canónico del contenido de la Landing Minimalista INDI 2026.
 * Toda la copia pública vive aquí (no en JSX) para auditar consistencia
 * de precios, longitud de textos y presupuesto de secciones.
 */

export const LANDING_MAX_SECTIONS = 5;

export const landingSectionIdSchema = z.enum(['inicio', 'comparativa', 'soluciones', 'precios', 'faq']);

export const landingProductSchema = z.object({
  id: z.enum(['card', 'cv', 'presentation']),
  title: z.string().min(3).max(32),
  description: z.string().min(10).max(120),
  href: z.string().regex(/^\/(?!\/)[a-z0-9/-]*$/, 'Solo rutas internas relativas'),
  cta: z.string().min(3).max(24),
});

export const landingValuePropSchema = z.object({
  title: z.string().min(3).max(28),
  description: z.string().min(10).max(90),
});

export const landingContentSchema = z.object({
  sections: z.array(landingSectionIdSchema).min(1).max(LANDING_MAX_SECTIONS),
  hero: z.object({
    eyebrow: z.string().max(48),
    title: z.string().max(60),
    highlight: z.string().max(40),
    subtitle: z.string().max(160),
    trustBadges: z.array(z.string().max(24)).max(3),
  }),
  valueProps: z.array(landingValuePropSchema).length(4),
  products: z.array(landingProductSchema).length(3),
  pricing: z.object({
    monthlyClp: z.literal(2500),
    semiannualClp: z.literal(6000),
    trialDays: z.literal(3),
  }),
  closing: z.object({ title: z.string().max(48), subtitle: z.string().max(120) }),
});

export type LandingContent = z.infer<typeof landingContentSchema>;
export type LandingProduct = z.infer<typeof landingProductSchema>;

export const formatClp = (value: number): string => `$${value.toLocaleString('es-CL')}`;

export const LANDING_CONTENT: LandingContent = landingContentSchema.parse({
  sections: ['inicio', 'comparativa', 'soluciones', 'precios', 'faq'],
  hero: {
    eyebrow: 'Identidad profesional · Plan Gratuito',
    title: 'Tu negocio completo',
    highlight: 'en un solo link.',
    subtitle:
      'Tarjeta digital con código QR interactivo y currículum ATS. Tus clientes y reclutadores te contactan en un toque.',
    trustBadges: ['100% Gratuito', 'Sin tarjeta de crédito', 'Listo en 2 minutos'],
  },
  valueProps: [
    { title: 'Siempre actualizada', description: 'Cambia tu foto, número u ofertas en segundos, sin reimprimir papel.' },
    { title: 'WhatsApp en un toque', description: 'Tu cliente presiona un botón y abre la conversación contigo de inmediato.' },
    { title: 'Métricas en tiempo real', description: 'Descubre cuántas personas vieron tu tarjeta y cuántas guardaron tu contacto.' },
    { title: 'Cero gasto en papel', description: 'Acceso 100% gratuito sin costos de impresión, ecológico y siempre en tu celular.' },
  ],
  products: [
    {
      id: 'card',
      title: 'Tarjeta Digital + QR',
      description: 'Tu foto, biografía y enlaces de contacto en un link elegante que se comparte por QR o WhatsApp.',
      href: '/cards/new',
      cta: 'Crear mi tarjeta gratis',
    },
    {
      id: 'cv',
      title: 'Smart CV ATS',
      description: 'Currículum profesional A4 optimizado para sistemas de reclutamiento y listo para exportar en PDF.',
      href: '/cv',
      cta: 'Crear mi CV gratis',
    },
    {
      id: 'presentation',
      title: 'Presentaciones',
      description: 'Propuestas y proyectos en diapositivas limpias para cualquier pantalla (Próximamente).',
      href: '/pricing',
      cta: 'Ver hoja de ruta',
    },
  ],
  pricing: { monthlyClp: 2500, semiannualClp: 6000, trialDays: 3 },
  closing: {
    title: 'Comienza hoy con tu Plan Gratuito',
    subtitle: 'Tu tarjeta y CV estarán listos en 2 minutos. Compártelos y destaca profesionalmente sin costo.',
  },
});
