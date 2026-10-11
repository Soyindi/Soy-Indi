/**
 * ============================================================================
 * INDI ADAPTIVE COLOR EXTRACTION ENGINE (Canvas 2D / Perceptual Palette)
 * ============================================================================
 * Motor determinista de extracción cromática en el navegador inspirado en
 * Material You / Apple Ambient Design y adaptado con rigor Staff Engineer.
 * 
 * Permite analizar cualquier foto de perfil, portada o fondo en <20ms y extraer:
 * 1. Color vibrante de acento (vibrantHex) para botones, glows y tipografía de acento.
 * 2. Color dominante representativo (dominantHex).
 * 3. Color de fondo oscuro armónico (darkMutedHex).
 * 4. Color de fondo claro prismático (lightMutedHex).
 * 5. Swatches de los mejores tonos cromáticos detectados.
 */

export interface ExtractedColorSwatch {
  hex: string;
  name: string;
  population: number;
  hue: number;
  saturation: number;
  lightness: number;
}

export interface ExtractedPalette {
  dominantHex: string;
  vibrantHex: string;
  darkMutedHex: string;
  lightMutedHex: string;
  swatches: ExtractedColorSwatch[];
}

/**
 * Convierte RGB [0..255] a HEX (#rrggbb)
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convierte RGB [0..255] a HSL (H [0..360], S [0..1], L [0..1])
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const d = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h: Math.round(h), s, l };
}

/**
 * Convierte HSL (H [0..360], S [0..1], L [0..1]) a HEX (#rrggbb)
 */
export function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rNorm = 0;
  let gNorm = 0;
  let bNorm = 0;

  if (h >= 0 && h < 60) {
    rNorm = c; gNorm = x; bNorm = 0;
  } else if (h >= 60 && h < 120) {
    rNorm = x; gNorm = c; bNorm = 0;
  } else if (h >= 120 && h < 180) {
    rNorm = 0; gNorm = c; bNorm = x;
  } else if (h >= 180 && h < 240) {
    rNorm = 0; gNorm = x; bNorm = c;
  } else if (h >= 240 && h < 300) {
    rNorm = x; gNorm = 0; bNorm = c;
  } else {
    rNorm = c; gNorm = 0; bNorm = x;
  }

  return rgbToHex((rNorm + m) * 255, (gNorm + m) * 255, (bNorm + m) * 255);
}

/**
 * Asigna un nombre humano aproximado al matiz (Hue)
 */
function getHueName(h: number, s: number, l: number): string {
  if (s < 0.12) return l > 0.6 ? 'Gris Claro' : l < 0.25 ? 'Gris Oscuro' : 'Neutro';
  if (h >= 345 || h < 15) return 'Carmesí / Rojo';
  if (h >= 15 && h < 45) return 'Ámbar / Naranja';
  if (h >= 45 && h < 70) return 'Dorado / Amarillo';
  if (h >= 70 && h < 165) return 'Esmeralda / Verde';
  if (h >= 165 && h < 200) return 'Cian / Turquesa';
  if (h >= 200 && h < 255) return 'Zafiro / Azul';
  if (h >= 255 && h < 290) return 'Violeta / Índigo';
  if (h >= 290 && h < 345) return 'Magenta / Rosa';
  return 'Personalizado';
}

/**
 * Analiza el búfer de píxeles en memoria y extrae la paleta cromática perceptualmente equilibrada.
 */
export function extractPaletteFromPixelBuffer(
  pixels: Uint8ClampedArray,
  sampleStep: number = 4
): ExtractedPalette {
  // Cuantización rápida en histograma de buckets de color
  const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < pixels.length; i += 4 * sampleStep) {
    const a = pixels[i + 3];
    if (a < 128) continue; // Ignorar píxeles transparentes

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const { h, s, l } = rgbToHsl(r, g, b);

    // Filtrar blancos deslumbrantes extremos y negros opacos sin croma
    if (l > 0.94 || (l < 0.08 && s < 0.15)) continue;

    // Cuantizar en 16 pasos por canal
    const qR = Math.round(r / 16) * 16;
    const qG = Math.round(g / 16) * 16;
    const qB = Math.round(b / 16) * 16;
    const key = `${qR},${qG},${qB}`;

    const existing = colorBuckets.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorBuckets.set(key, { r: qR, g: qG, b: qB, count: 1 });
    }
  }

  // Si no hay píxeles válidos detectados, retornar fallback elegante
  if (colorBuckets.size === 0) {
    return {
      dominantHex: '#6366f1',
      vibrantHex: '#6366f1',
      darkMutedHex: '#090a10',
      lightMutedHex: '#f8fafc',
      swatches: [
        { hex: '#6366f1', name: 'Índigo Primario', population: 1, hue: 239, saturation: 0.84, lightness: 0.67 },
      ],
    };
  }

  // Ordenar buckets por población
  const sorted = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

  const swatches: ExtractedColorSwatch[] = [];
  let vibrantCandidate: { hex: string; score: number } | null = null;
  let dominantCandidate: string = rgbToHex(sorted[0].r, sorted[0].g, sorted[0].b);
  let bestHue = 240;

  for (const bucket of sorted.slice(0, 30)) {
    const hex = rgbToHex(bucket.r, bucket.g, bucket.b);
    const { h, s, l } = rgbToHsl(bucket.r, bucket.g, bucket.b);

    // Calcular score de vivacidad (premio a la saturación y luminosidad intermedia para UI)
    // l ideal ~ 0.50 a 0.65 (perfecto para botones sobre fondo oscuro)
    const lightnessScore = 1 - Math.abs(l - 0.55) * 1.8;
    const vibrantScore = s * 1.5 + lightnessScore + (bucket.count / sorted[0].count) * 0.4;

    if (!vibrantCandidate || vibrantScore > vibrantCandidate.score) {
      vibrantCandidate = { hex, score: vibrantScore };
      bestHue = h;
    }

    // Evitar duplicados visuales muy cercanos en los swatches
    const isDistinct = !swatches.some((existing) => {
      const diffHue = Math.abs(existing.hue - h);
      const minHueDiff = Math.min(diffHue, 360 - diffHue);
      return minHueDiff < 20 && Math.abs(existing.lightness - l) < 0.2;
    });

    if (isDistinct && swatches.length < 5) {
      swatches.push({
        hex,
        name: getHueName(h, s, l),
        population: bucket.count,
        hue: h,
        saturation: Math.round(s * 100) / 100,
        lightness: Math.round(l * 100) / 100,
      });
    }
  }

  const vibrantHex = vibrantCandidate?.hex || dominantCandidate;

  // Derivar fondos coordinados a partir del matiz (Hue) predominante de la imagen
  // darkMuted: L ~ 0.06 - 0.08, con tinte ambiental del color de la foto
  const darkMutedHex = hslToHex(bestHue, 0.35, 0.07);
  // lightMuted: L ~ 0.97, con tinte opalino claro de la foto
  const lightMutedHex = hslToHex(bestHue, 0.25, 0.97);

  return {
    dominantHex: dominantCandidate,
    vibrantHex,
    darkMutedHex,
    lightMutedHex,
    swatches,
  };
}

/**
 * Extrae la paleta cromática en el navegador a partir de una URL, Data URL o File.
 * Utiliza un canvas offscreen minúsculo de 64x64px para garantizar rendimiento instantáneo (<20ms).
 */
export async function extractPaletteFromImage(
  source: string | File
): Promise<ExtractedPalette> {
  // Fallback para entornos SSR o Node.js sin DOM
  if (typeof window === 'undefined' || !window.HTMLCanvasElement) {
    return {
      dominantHex: '#6366f1',
      vibrantHex: '#6366f1',
      darkMutedHex: '#090a10',
      lightMutedHex: '#f8fafc',
      swatches: [],
    };
  }

  let srcUrl = '';
  if (typeof source === 'string') {
    srcUrl = source;
  } else {
    srcUrl = URL.createObjectURL(source);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const cleanup = () => {
      if (typeof source !== 'string' && srcUrl) {
        URL.revokeObjectURL(srcUrl);
      }
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const targetSize = 64; // 64x64px es suficiente para muestra representativa
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return resolve({
            dominantHex: '#6366f1',
            vibrantHex: '#6366f1',
            darkMutedHex: '#090a10',
            lightMutedHex: '#f8fafc',
            swatches: [],
          });
        }

        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
        const palette = extractPaletteFromPixelBuffer(imgData.data, 2);

        cleanup();
        resolve(palette);
      } catch (err) {
        console.warn('Error al extraer paleta de imagen:', err);
        cleanup();
        resolve({
          dominantHex: '#6366f1',
          vibrantHex: '#6366f1',
          darkMutedHex: '#090a10',
          lightMutedHex: '#f8fafc',
          swatches: [],
        });
      }
    };

    img.onerror = () => {
      cleanup();
      resolve({
        dominantHex: '#6366f1',
        vibrantHex: '#6366f1',
        darkMutedHex: '#090a10',
        lightMutedHex: '#f8fafc',
        swatches: [],
      });
    };

    img.src = srcUrl;
  });
}
