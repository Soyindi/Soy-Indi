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
  cardFinish: 'classic' | 'holographic' | 'titanium' | 'obsidian' | 'minimal';
  surfaceTexture: 'none' | 'dot-grid' | 'radial-glow';
  accentGlow: string;
}

export const CARD_DESIGN_PRESETS: CardDesignPreset[] = [
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
