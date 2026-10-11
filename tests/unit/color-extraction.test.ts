import { describe, it, expect } from 'vitest';
import {
  rgbToHex,
  rgbToHsl,
  hslToHex,
  extractPaletteFromPixelBuffer,
} from '@/shared/lib/colorExtraction';

describe('Adaptive Color Extraction Engine', () => {
  it('convierte correctamente RGB a HEX', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(99, 102, 241)).toBe('#6366f1');
    expect(rgbToHex(2, 132, 199)).toBe('#0284c7');
  });

  it('convierte correctamente RGB a HSL y de vuelta a HEX', () => {
    const hslRed = rgbToHsl(255, 0, 0);
    expect(hslRed.h).toBe(0);
    expect(hslRed.s).toBe(1);
    expect(hslRed.l).toBe(0.5);
    expect(hslToHex(hslRed.h, hslRed.s, hslRed.l)).toBe('#ff0000');

    const hslCyan = rgbToHsl(2, 132, 199);
    expect(hslCyan.h).toBeGreaterThanOrEqual(190);
    expect(hslCyan.h).toBeLessThanOrEqual(210);
    expect(hslCyan.s).toBeGreaterThan(0.9);
  });

  it('extrae paleta armónica y swatches no vacíos a partir de un búfer de píxeles', () => {
    // Generar un buffer simulado de 16x16 píxeles RGBA predominantemente azul (#0284c7)
    const totalPixels = 16 * 16;
    const buffer = new Uint8ClampedArray(totalPixels * 4);

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      if (i < totalPixels * 0.7) {
        // 70% píxeles azul vibrante
        buffer[idx] = 2;
        buffer[idx + 1] = 132;
        buffer[idx + 2] = 199;
        buffer[idx + 3] = 255;
      } else {
        // 30% píxeles dorados cálidos (#f59e0b)
        buffer[idx] = 245;
        buffer[idx + 1] = 158;
        buffer[idx + 2] = 11;
        buffer[idx + 3] = 255;
      }
    }

    const palette = extractPaletteFromPixelBuffer(buffer, 1);

    expect(palette).toBeDefined();
    expect(palette.dominantHex).toMatch(/^#[0-9a-f]{6}$/i);
    expect(palette.vibrantHex).toMatch(/^#[0-9a-f]{6}$/i);
    expect(palette.darkMutedHex).toMatch(/^#[0-9a-f]{6}$/i);
    expect(palette.lightMutedHex).toMatch(/^#[0-9a-f]{6}$/i);
    expect(palette.swatches.length).toBeGreaterThanOrEqual(1);

    // Verificar que los swatches incluyan propiedades cromáticas completas
    const firstSwatch = palette.swatches[0];
    expect(firstSwatch.hex).toMatch(/^#[0-9a-f]{6}$/i);
    expect(firstSwatch.name).toBeDefined();
    expect(firstSwatch.population).toBeGreaterThan(0);
    expect(firstSwatch.saturation).toBeGreaterThanOrEqual(0);
  });

  it('retorna fallback seguro cuando el búfer solo contiene transparencia o negro puro', () => {
    const totalPixels = 10 * 10;
    const buffer = new Uint8ClampedArray(totalPixels * 4); // Todos 0 (transparente)

    const palette = extractPaletteFromPixelBuffer(buffer, 1);
    expect(palette.dominantHex).toBe('#6366f1');
    expect(palette.vibrantHex).toBe('#6366f1');
    expect(palette.swatches).toHaveLength(1);
  });
});
