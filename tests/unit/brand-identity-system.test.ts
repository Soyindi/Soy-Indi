import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { BRAND_ASSETS, brandAssetSchema } from '@/entities/brand/schemas';

describe('Brand Identity System & Asset Optimization (WebP First)', () => {
  it('debe validar la integridad de cada recurso en el catálogo canónico BRAND_ASSETS contra el esquema Zod', () => {
    const assetKeys = Object.keys(BRAND_ASSETS);
    expect(assetKeys.length).toBeGreaterThanOrEqual(8);

    for (const key of assetKeys) {
      const asset = BRAND_ASSETS[key];
      const validation = brandAssetSchema.safeParse(asset);
      expect(
        validation.success,
        `El activo ${key} no cumple con el esquema canónico: ${!validation.success ? JSON.stringify(validation.error.issues) : ''}`
      ).toBe(true);

      if (validation.success) {
        expect(validation.data.url).toMatch(/^\/brand\/.+/);
        expect(validation.data.width).toBeGreaterThan(0);
        expect(validation.data.height).toBeGreaterThan(0);
        expect(validation.data.alt.length).toBeGreaterThan(5);
      }
    }
  });

  it('debe verificar la existencia física de los activos generados en public/brand/', () => {
    const publicBrandDir = path.join(process.cwd(), 'public', 'brand');
    expect(fs.existsSync(publicBrandDir), 'El directorio public/brand debe existir').toBe(true);

    for (const [key, asset] of Object.entries(BRAND_ASSETS)) {
      // Remover el prefijo leading slash para resolver en filesystem
      const relPath = asset.url.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), 'public', relPath);

      expect(fs.existsSync(fullPath), `El archivo físico para ${key} (${asset.url}) debe existir`).toBe(true);

      const stats = fs.statSync(fullPath);
      expect(stats.size).toBeGreaterThan(500); // Mínimo 500 bytes para no ser un archivo corrupto
    }
  });

  it('debe verificar que todos los recursos de imagen WebP estén optimizados (<40 KB)', () => {
    const webpAssets = Object.values(BRAND_ASSETS).filter((a) => a.format === 'webp');
    expect(webpAssets.length).toBeGreaterThanOrEqual(6);

    for (const asset of webpAssets) {
      const relPath = asset.url.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), 'public', relPath);
      const stats = fs.statSync(fullPath);
      const sizeKb = stats.size / 1024;

      // Ninguna imagen WebP debe superar los 45 KB (garantía de ultra-baja latencia y Core Web Vitals)
      expect(sizeKb).toBeLessThan(45);
    }
  });

  it('debe contener los arquetipos de diseño oficiales: symbol, lockup, stacked, vector y animation', () => {
    const categories = new Set(Object.values(BRAND_ASSETS).map((a) => a.category));
    expect(categories.has('symbol')).toBe(true);
    expect(categories.has('lockup')).toBe(true);
    expect(categories.has('stacked')).toBe(true);
    expect(categories.has('vector')).toBe(true);
    expect(categories.has('animation')).toBe(true);
  });

  it('debe validar la optimización y formatos duales (MP4 y WebM) del video del logotipo animado viviente', () => {
    const logoAnimated = BRAND_ASSETS.logoAnimated;
    expect(logoAnimated).toBeDefined();
    expect(logoAnimated.format).toBe('mp4');
    expect(logoAnimated.webmUrl).toBe('/brand/indi-logo-animated.webm');
    expect(logoAnimated.fallbackUrl).toBe('/brand/indi-alien-symbol-sm.webp');

    // Verificar archivo MP4
    const mp4Path = path.join(process.cwd(), 'public', 'brand', 'indi-logo-animated.mp4');
    expect(fs.existsSync(mp4Path), 'El archivo MP4 del logo animado debe existir').toBe(true);
    const mp4SizeKb = fs.statSync(mp4Path).size / 1024;
    expect(mp4SizeKb).toBeLessThan(80); // Debe pesar menos de 80 KB para streaming instantáneo

    // Verificar archivo WebM
    const webmPath = path.join(process.cwd(), 'public', 'brand', 'indi-logo-animated.webm');
    expect(fs.existsSync(webmPath), 'El archivo WebM del logo animado debe existir').toBe(true);
    const webmSizeKb = fs.statSync(webmPath).size / 1024;
    expect(webmSizeKb).toBeLessThan(70); // WebM debe pesar menos de 70 KB
  });

  it('debe verificar la existencia y optimización de las variantes de video panorámico 16:9 y poster WebP', () => {
    // Variantes panorámicas para presencia cinemática imponente
    const wideMp4 = path.join(process.cwd(), 'public', 'brand', 'indi-logo-wide-animated.mp4');
    const wideWebm = path.join(process.cwd(), 'public', 'brand', 'indi-logo-wide-animated.webm');
    const poster = path.join(process.cwd(), 'public', 'brand', 'indi-logo-video-poster.webp');

    expect(fs.existsSync(wideMp4), 'indi-logo-wide-animated.mp4 debe existir').toBe(true);
    expect(fs.existsSync(wideWebm), 'indi-logo-wide-animated.webm debe existir').toBe(true);
    expect(fs.existsSync(poster), 'indi-logo-video-poster.webp debe existir').toBe(true);

    const wideMp4Size = fs.statSync(wideMp4).size / 1024;
    const wideWebmSize = fs.statSync(wideWebm).size / 1024;
    const posterSize = fs.statSync(poster).size / 1024;

    expect(wideMp4Size).toBeLessThan(100); // Menos de 100 KB
    expect(wideWebmSize).toBeLessThan(90);  // Menos de 90 KB
    expect(posterSize).toBeLessThan(15);   // Poster WebP ultra liviano (<15 KB)
  });

  it('debe validar la existencia y ratio de área activa del logotipo cinemático tight-crop 3:2', () => {
    const tightMp4 = path.join(process.cwd(), 'public', 'brand', 'indi-logo-tight.mp4');
    const tightWebm = path.join(process.cwd(), 'public', 'brand', 'indi-logo-tight.webm');
    const tightPoster = path.join(process.cwd(), 'public', 'brand', 'indi-logo-tight-poster.webp');

    expect(fs.existsSync(tightMp4), 'indi-logo-tight.mp4 debe existir').toBe(true);
    expect(fs.existsSync(tightWebm), 'indi-logo-tight.webm debe existir').toBe(true);
    expect(fs.existsSync(tightPoster), 'indi-logo-tight-poster.webp debe existir').toBe(true);

    const mp4Size = fs.statSync(tightMp4).size / 1024;
    const webmSize = fs.statSync(tightWebm).size / 1024;
    const posterSize = fs.statSync(tightPoster).size / 1024;

    expect(mp4Size).toBeLessThan(120); // Menos de 120 KB para streaming instantáneo
    expect(webmSize).toBeLessThan(125); // Menos de 125 KB en VP9
    expect(posterSize).toBeLessThan(15); // Poster WebP < 15 KB (Zero CLS)
  });

  it('debe validar la existencia y optimización del backdrop hero de marca (brand-reveal WebM y poster)', () => {
    const brandReveal = BRAND_ASSETS.brandRevealVideo;
    expect(brandReveal.webmUrl).toBe('/brand/indi-brand-reveal.webm');
    expect(brandReveal.fallbackUrl).toBe('/brand/indi-brand-reveal-poster.webp');

    const webmPath = path.join(process.cwd(), 'public', 'brand', 'indi-brand-reveal.webm');
    const posterPath = path.join(process.cwd(), 'public', 'brand', 'indi-brand-reveal-poster.webp');

    expect(fs.existsSync(webmPath), 'indi-brand-reveal.webm debe existir').toBe(true);
    expect(fs.existsSync(posterPath), 'indi-brand-reveal-poster.webp debe existir').toBe(true);

    const webmSizeKb = fs.statSync(webmPath).size / 1024;
    const posterSizeKb = fs.statSync(posterPath).size / 1024;

    expect(webmSizeKb).toBeLessThan(150); // Menos de 150 KB para carga ambiental rápida
    expect(posterSizeKb).toBeLessThan(20); // Poster WebP < 20 KB
  });
});


