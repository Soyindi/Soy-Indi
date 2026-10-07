/**
 * Catálogo Curado de Presets de Diseño y Acabados de Material para Tarjetas Digitales INDI 2026
 * Espacio de Color OKLCH, Gamut P3 y Ratios de Contraste Perceptual APCA / WCAG 2.2 AA.
 */

export interface CardDesignPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  primaryColorOklch: string;
  backgroundColorOklch: string;
  particleBehavior: 'static' | 'interactive' | 'ambient';
  particleIntensity: 'subtle' | 'balanced' | 'prominent';
  fontFamily: string;
  cardFinish: 'classic' | 'holographic' | 'titanium' | 'obsidian' | 'minimal' | 'luminous-glass' | 'aurora-light';
  surfaceTexture: 'none' | 'dot-grid' | 'radial-glow' | 'frosted-prism';
  accentGlow: string;
}

export const CARD_DESIGN_PRESETS: CardDesignPreset[] = [
  {
    id: 'luminous-opal',
    name: 'Opal Light Prism',
    category: 'Vanguardia & Editorial',
    description: 'Estética clara prismática con refracción translúcida, blanco escarchado y contraste perfecto.',
    primaryColorOklch: '#4f46e5',
    backgroundColorOklch: '#f8fafc',
    particleBehavior: 'interactive',
    particleIntensity: 'balanced',
    fontFamily: 'Inter',
    cardFinish: 'luminous-glass',
    surfaceTexture: 'frosted-prism',
    accentGlow: 'from-indigo-500/25 via-sky-300/35 to-transparent',
  },
  {
    id: 'aurora-lumina',
    name: 'Aurora Lumina',
    category: 'Creatividad & Nuevos Medios',
    description: 'Gradiente de luz nórdica esmeralda y turquesa sobre base cristalina ultra iluminada.',
    primaryColorOklch: '#0284c7',
    backgroundColorOklch: '#f0fdfa',
    particleBehavior: 'ambient',
    particleIntensity: 'prominent',
    fontFamily: 'Inter',
    cardFinish: 'aurora-light',
    surfaceTexture: 'radial-glow',
    accentGlow: 'from-cyan-400/35 via-teal-300/30 to-transparent',
  },
  {
    id: 'cyber-nebula',
    name: 'Cyber Nebula',
    category: 'Tech & Engineering',
    description: 'Estética estelar con acentos cian y resplandor reactivo de alta energía.',
    primaryColorOklch: '#6366f1',
    backgroundColorOklch: '#090a10',
    particleBehavior: 'interactive',
    particleIntensity: 'balanced',
    fontFamily: 'Inter',
    cardFinish: 'holographic',
    surfaceTexture: 'radial-glow',
    accentGlow: 'from-indigo-500/30 via-cyan-400/20 to-transparent',
  },
  {
    id: 'executive-titanium',
    name: 'Executive Titanium',
    category: 'C-Level & Advisory',
    description: 'Gris titanio pulido con bordes nítidos y elegancia corporativa sobria.',
    primaryColorOklch: '#06b6d4',
    backgroundColorOklch: '#0c0e14',
    particleBehavior: 'ambient',
    particleIntensity: 'subtle',
    fontFamily: 'Inter',
    cardFinish: 'titanium',
    surfaceTexture: 'dot-grid',
    accentGlow: 'from-cyan-500/20 via-slate-400/15 to-transparent',
  },
  {
    id: 'emerald-botanical',
    name: 'Emerald Botanical',
    category: 'Salud, Sostenibilidad & ESG',
    description: 'Verde esmeralda orgánico con vibración luminosa y armonía natural.',
    primaryColorOklch: '#10b981',
    backgroundColorOklch: '#041611',
    particleBehavior: 'ambient',
    particleIntensity: 'balanced',
    fontFamily: 'Inter',
    cardFinish: 'classic',
    surfaceTexture: 'radial-glow',
    accentGlow: 'from-emerald-500/30 via-teal-400/15 to-transparent',
  },
  {
    id: 'solar-obsidian',
    name: 'Solar Obsidian',
    category: 'Luxury & Finanzas',
    description: 'Negro obsidiana mate con acentos en oro líquido y champaña.',
    primaryColorOklch: '#f59e0b',
    backgroundColorOklch: '#0d0b07',
    particleBehavior: 'static',
    particleIntensity: 'subtle',
    fontFamily: 'Inter',
    cardFinish: 'obsidian',
    surfaceTexture: 'radial-glow',
    accentGlow: 'from-amber-500/30 via-yellow-400/15 to-transparent',
  },
  {
    id: 'swiss-monochrome',
    name: 'Swiss Monochrome',
    category: 'Diseño & Arquitectura',
    description: 'Minimalismo suizo de alto contraste, tipografía limpia y sin distracciones.',
    primaryColorOklch: '#ffffff',
    backgroundColorOklch: '#000000',
    particleBehavior: 'static',
    particleIntensity: 'subtle',
    fontFamily: 'Inter',
    cardFinish: 'minimal',
    surfaceTexture: 'dot-grid',
    accentGlow: 'from-white/20 via-zinc-400/10 to-transparent',
  },
];
