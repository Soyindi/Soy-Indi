/**
 * Catálogo Curado de Plantillas y Arquetipos de Diseño para Smart CV (INDI 2026)
 * Estándares: A4 Internacional (ISO 216), Compatibilidad ATS (95-100 Score), 
 * Paletas de contraste accesible WCAG 2.2 AA y armonía tipográfica editorial.
 */

export interface CvDesignTemplate {
  id: string;
  name: string;
  archetype: string;
  category: 'Ejecutivo & Corporativo' | 'Tecnología & Vanguardia' | 'Clínico & Salud' | 'Humanidades & Legal';
  description: string;
  badgeText: string;
  // Tokens cromáticos para la previsualización Web (Tailwind / CSS Tokens)
  webTokens: {
    accentText: string;         // e.g. 'text-indigo-700'
    accentBg: string;           // e.g. 'bg-indigo-50'
    accentBorder: string;       // e.g. 'border-indigo-500'
    headerDivider: string;      // e.g. 'border-zinc-900'
    sectionHeaderBorder: string;// e.g. 'border-zinc-200'
    bulletColor: string;        // e.g. 'text-zinc-400'
    tagBg: string;              // e.g. 'bg-zinc-100'
    tagBorder: string;          // e.g. 'border-zinc-200'
    tagText: string;            // e.g. 'text-zinc-800'
    roleText: string;           // e.g. 'text-indigo-700'
    fontFamily: string;         // e.g. 'font-sans'
  };
  // Tokens cromáticos RGB exactos para el motor vectorial jsPDF
  pdfTokens: {
    headerColor: [number, number, number];       // Color del nombre
    accentColor: [number, number, number];       // Color del rol / empresa / destacados
    dividerColor: [number, number, number];      // Color de divisores de sección
    sectionTitleColor: [number, number, number]; // Color de títulos de sección
    bodyColor: [number, number, number];         // Color de cuerpo
    metaColor: [number, number, number];         // Color de fechas / metadatos
    bulletColor: [number, number, number];       // Color del glifo viñeta
  };
  // Miniatura visual para el selector de plantillas en la barra de herramientas
  previewGlow: string;
  previewRing: string;
}

export const CV_DESIGN_TEMPLATES: Record<string, CvDesignTemplate> = {
  'executive-modern': {
    id: 'executive-modern',
    name: 'Executive Sapphire',
    archetype: 'Liderazgo & Dirección',
    category: 'Ejecutivo & Corporativo',
    description: 'Elegancia corporativa con acentos azul zafiro e índigo profundo. Ideal para cargos directivos, gestión y consultoría.',
    badgeText: 'Zafiro Ejecutivo',
    webTokens: {
      accentText: 'text-indigo-700',
      accentBg: 'bg-indigo-50',
      accentBorder: 'border-indigo-600',
      headerDivider: 'border-zinc-900',
      sectionHeaderBorder: 'border-zinc-200',
      bulletColor: 'text-zinc-400',
      tagBg: 'bg-zinc-100',
      tagBorder: 'border-zinc-200',
      tagText: 'text-zinc-800',
      roleText: 'text-indigo-700',
      fontFamily: 'font-sans',
    },
    pdfTokens: {
      headerColor: [15, 23, 42],       // Slate 900
      accentColor: [67, 56, 202],      // Indigo 700
      dividerColor: [203, 213, 225],   // Slate 300
      sectionTitleColor: [30, 41, 59], // Slate 800
      bodyColor: [51, 65, 85],         // Slate 700
      metaColor: [100, 116, 139],      // Slate 500
      bulletColor: [148, 163, 184],    // Slate 400
    },
    previewGlow: 'from-indigo-500/20 to-blue-600/20',
    previewRing: 'border-indigo-500',
  },

  'minimal-ats': {
    id: 'minimal-ats',
    name: 'Nordic Monochrome',
    archetype: 'Ingeniería & Consultoría Top',
    category: 'Tecnología & Vanguardia',
    description: 'Minimalismo escandinavo en escala de grises y grafito puro. Máxima legibilidad algorítmica para filtros ATS de alta exigencia.',
    badgeText: 'Monocromo ATS',
    webTokens: {
      accentText: 'text-zinc-900',
      accentBg: 'bg-zinc-100',
      accentBorder: 'border-zinc-900',
      headerDivider: 'border-zinc-950',
      sectionHeaderBorder: 'border-zinc-300',
      bulletColor: 'text-zinc-500',
      tagBg: 'bg-zinc-100',
      tagBorder: 'border-zinc-300',
      tagText: 'text-zinc-900 font-medium',
      roleText: 'text-zinc-800 font-semibold',
      fontFamily: 'font-sans',
    },
    pdfTokens: {
      headerColor: [9, 9, 11],          // Zinc 950
      accentColor: [39, 39, 42],        // Zinc 800
      dividerColor: [161, 161, 170],    // Zinc 400
      sectionTitleColor: [24, 24, 27],  // Zinc 900
      bodyColor: [63, 63, 70],          // Zinc 700
      metaColor: [113, 113, 122],       // Zinc 500
      bulletColor: [113, 113, 122],      // Zinc 500
    },
    previewGlow: 'from-zinc-400/20 to-slate-600/20',
    previewRing: 'border-zinc-400',
  },

  'tech-emerald': {
    id: 'tech-emerald',
    name: 'Clinical Emerald',
    archetype: 'Salud, BioTech & Ciencias',
    category: 'Clínico & Salud',
    description: 'Acentos verde esmeralda y salvia que transmiten bienestar, rigor clínico y evidencia científica. Perfecto para salud y biotech.',
    badgeText: 'Esmeralda Clínico',
    webTokens: {
      accentText: 'text-emerald-700',
      accentBg: 'bg-emerald-50',
      accentBorder: 'border-emerald-600',
      headerDivider: 'border-emerald-950',
      sectionHeaderBorder: 'border-emerald-200/80',
      bulletColor: 'text-emerald-500',
      tagBg: 'bg-emerald-50/70',
      tagBorder: 'border-emerald-200',
      tagText: 'text-emerald-900 font-medium',
      roleText: 'text-emerald-700 font-semibold',
      fontFamily: 'font-sans',
    },
    pdfTokens: {
      headerColor: [6, 78, 59],        // Emerald 900
      accentColor: [5, 150, 105],      // Emerald 600
      dividerColor: [167, 243, 208],   // Emerald 200
      sectionTitleColor: [6, 95, 70],  // Emerald 800
      bodyColor: [51, 65, 85],         // Slate 700
      metaColor: [100, 116, 139],      // Slate 500
      bulletColor: [16, 185, 129],     // Emerald 500
    },
    previewGlow: 'from-emerald-500/20 to-teal-600/20',
    previewRing: 'border-emerald-500',
  },

  'editorial-burgundy': {
    id: 'editorial-burgundy',
    name: 'Editorial Burgundy',
    archetype: 'Legal, Humanidades & Academia',
    category: 'Humanidades & Legal',
    description: 'Acentos vino borgoña clásico con distinción editorial. Ideal para derecho, psicología, educación superior y proyectos culturales.',
    badgeText: 'Borgoña Editorial',
    webTokens: {
      accentText: 'text-rose-900',
      accentBg: 'bg-rose-50',
      accentBorder: 'border-rose-800',
      headerDivider: 'border-rose-950',
      sectionHeaderBorder: 'border-rose-200',
      bulletColor: 'text-rose-400',
      tagBg: 'bg-rose-50/60',
      tagBorder: 'border-rose-200',
      tagText: 'text-rose-950 font-medium',
      roleText: 'text-rose-800 font-semibold',
      fontFamily: 'font-serif',
    },
    pdfTokens: {
      headerColor: [76, 5, 25],        // Rose 950
      accentColor: [159, 18, 57],      // Rose 700
      dividerColor: [254, 205, 211],   // Rose 200
      sectionTitleColor: [136, 19, 55],// Rose 800
      bodyColor: [51, 65, 85],         // Slate 700
      metaColor: [100, 116, 139],      // Slate 500
      bulletColor: [244, 63, 94],      // Rose 500
    },
    previewGlow: 'from-rose-500/20 to-pink-700/20',
    previewRing: 'border-rose-500',
  },
};

/**
 * Resuelve el template de diseño activo con fallback seguro a 'executive-modern'
 */
export function getCvDesignTemplate(templateId?: string): CvDesignTemplate {
  if (templateId && CV_DESIGN_TEMPLATES[templateId]) {
    return CV_DESIGN_TEMPLATES[templateId];
  }
  return CV_DESIGN_TEMPLATES['executive-modern'];
}

export const ALL_CV_DESIGN_TEMPLATES = Object.values(CV_DESIGN_TEMPLATES);
