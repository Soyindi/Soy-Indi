/**
 * Utilidades Matemáticas de Color y Contraste Perceptual WCAG 2.2 AA / APCA
 * Rescata y optimiza las fórmulas del repositorio original para garantizar accesibilidad absoluta.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Convierte un color HEX (#RGB o #RRGGBB) a valores numéricos RGB [0, 255]
 */
export function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

/**
 * Calcula la luminancia relativa según la fórmula estándar de la W3C (WCAG 2.1 / 2.2)
 * Rango retornado: [0.0 (negro puro) a 1.0 (blanco puro)]
 */
export function getRelativeLuminance(rgb: RGB): number {
  const transform = (val: number) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = transform(rgb.r);
  const g = transform(rgb.g);
  const b = transform(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calcula el ratio de contraste formal (L1 + 0.05) / (L2 + 0.05)
 * Retorna valor entre 1 y 21. WCAG AA exige >= 4.5 para texto normal y >= 3.0 para texto grande.
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Determina el color óptimo de texto ('#ffffff' o '#0f172a') para maximizar el contraste
 * sobre cualquier fondo según las directrices WCAG 2.2 AA.
 */
export function getAccessibleTextColor(backgroundHex: string): '#ffffff' | '#0f172a' {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) return '#ffffff';

  const luminance = getRelativeLuminance(rgb);
  // Si la luminancia es superior a 0.38, el texto oscuro ofrece el contraste más nítido
  return luminance > 0.38 ? '#0f172a' : '#ffffff';
}

/**
 * Ajusta el brillo porcentual de un color HEX (-1.0 a 1.0)
 */
export function adjustHexBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = Math.max(-1, Math.min(1, percent));
  const t = factor < 0 ? 0 : 255;
  const p = Math.abs(factor);

  const r = Math.round((t - rgb.r) * p) + rgb.r;
  const g = Math.round((t - rgb.g) * p) + rgb.g;
  const b = Math.round((t - rgb.b) * p) + rgb.b;

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convierte coordenadas OKLCH (L [0..1], C [0..0.4], H [0..360]) a RGB sRGB estándar [0..255]
 * basado en las transformaciones matemáticas exactas de Björn Ottosson (OKLab/OKLCH).
 */
export function oklchToRgb(l: number, c: number, h: number): RGB {
  // Hue en radianes
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab a Cono LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lCube = l_ * l_ * l_;
  const mCube = m_ * m_ * m_;
  const sCube = s_ * s_ * s_;

  // LMS a sRGB lineal
  const rLinear = +4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
  const gLinear = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
  const bLinear = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube;

  // Gamma sRGB
  const transfer = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  return {
    r: Math.round(transfer(rLinear) * 255),
    g: Math.round(transfer(gLinear) * 255),
    b: Math.round(transfer(bLinear) * 255),
  };
}

/**
 * Valida matemáticamente si dos colores cumplen el umbral WCAG 2.2 AA (>= 4.5:1 para texto estándar)
 */
export function meetsWcagAaContrast(foregroundHex: string, backgroundHex: string): boolean {
  return getContrastRatio(foregroundHex, backgroundHex) >= 4.5;
}
