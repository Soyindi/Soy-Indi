import { describe, it, expect } from 'vitest';
import { 
  hexToRgb, 
  getRelativeLuminance, 
  getContrastRatio, 
  getAccessibleTextColor, 
  adjustHexBrightness,
  oklchToRgb,
  meetsWcagAaContrast
} from '@/shared/lib/colorContrast';

describe('WCAG 2.2 AA Contrast & Color Utilities', () => {
  it('debe parsear colores HEX a RGB correctamente', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#6366f1')).toEqual({ r: 99, g: 102, b: 241 });
    expect(hexToRgb('fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('invalido')).toBeNull();
  });

  it('debe calcular la luminancia relativa conforme a W3C', () => {
    const whiteLum = getRelativeLuminance({ r: 255, g: 255, b: 255 });
    const blackLum = getRelativeLuminance({ r: 0, g: 0, b: 0 });
    expect(whiteLum).toBeCloseTo(1.0, 2);
    expect(blackLum).toBeCloseTo(0.0, 2);
  });

  it('debe calcular el ratio de contraste matemático exacto (1 a 21)', () => {
    const maxContrast = getContrastRatio('#ffffff', '#000000');
    expect(maxContrast).toBeCloseTo(21, 0);

    const sameColorContrast = getContrastRatio('#6366f1', '#6366f1');
    expect(sameColorContrast).toBeCloseTo(1, 0);
  });

  it('debe determinar texto blanco o negro garantizando legibilidad accesible', () => {
    // Fondo oscuro (#000000, #090a10, #1e1b4b) -> Texto blanco
    expect(getAccessibleTextColor('#000000')).toBe('#ffffff');
    expect(getAccessibleTextColor('#090a10')).toBe('#ffffff');
    expect(getAccessibleTextColor('#1e1b4b')).toBe('#ffffff');

    // Fondo muy claro (#ffffff, #fef08a amarillo claro) -> Texto oscuro
    expect(getAccessibleTextColor('#ffffff')).toBe('#0f172a');
    expect(getAccessibleTextColor('#fef08a')).toBe('#0f172a');
  });

  it('debe ajustar el brillo porcentual de forma determinista', () => {
    const brightened = adjustHexBrightness('#000000', 0.5);
    expect(brightened).toBe('#808080');

    const darkened = adjustHexBrightness('#ffffff', -0.5);
    expect(darkened).toBe('#808080');
  });

  it('debe convertir coordenadas OKLCH a RGB matemáticamente en gamut sRGB', () => {
    // Blanco puro: L=1, C=0, H=0 -> ~255, 255, 255
    const whiteRgb = oklchToRgb(1.0, 0, 0);
    expect(whiteRgb.r).toBeGreaterThanOrEqual(250);
    expect(whiteRgb.g).toBeGreaterThanOrEqual(250);
    expect(whiteRgb.b).toBeGreaterThanOrEqual(250);

    // Negro puro: L=0, C=0, H=0 -> 0, 0, 0
    const blackRgb = oklchToRgb(0, 0, 0);
    expect(blackRgb).toEqual({ r: 0, g: 0, b: 0 });

    // Tono azul/índigo L=0.6, C=0.2, H=260
    const blueRgb = oklchToRgb(0.6, 0.2, 260);
    expect(blueRgb.b).toBeGreaterThan(blueRgb.r);
  });

  it('debe validar matemáticamente si se cumple el estándar WCAG 2.2 AA (>= 4.5:1)', () => {
    // Blanco sobre negro: contraste máximo 21:1 -> Cumple AA
    expect(meetsWcagAaContrast('#ffffff', '#000000')).toBe(true);

    // Texto oscuro sobre acabado claro (slate-900 #0f172a sobre blanco #ffffff): ~18:1 -> Cumple AA
    expect(meetsWcagAaContrast('#0f172a', '#ffffff')).toBe(true);

    // Gris bajo contraste sobre blanco (#94a3b8 sobre #ffffff) -> Falla AA
    expect(meetsWcagAaContrast('#94a3b8', '#ffffff')).toBe(false);
  });
});
