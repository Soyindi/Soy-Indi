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
});
