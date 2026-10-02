import { describe, it, expect } from 'vitest';
import { 
  hexToRgb, 
  getRelativeLuminance, 
  getContrastRatio, 
  getAccessibleTextColor, 
  adjustHexBrightness 
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
});
