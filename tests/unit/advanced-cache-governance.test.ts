import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  APP_CACHE_VERSION,
  CACHE_VERSION_COOKIE_NAME,
  CACHE_STORAGE_VERSION_KEY,
  W3C_CLEAR_CACHE_HEADER,
  BRAND_ASSETS_CACHE_CONTROL,
  DYNAMIC_PUBLIC_ROUTE_CACHE_CONTROL,
  hasPurgeCacheQueryParam,
  isClientCacheVersionStale,
} from '@/shared/lib/cacheGovernance';
import { middleware } from '@/middleware';
import nextConfig from '../../next.config';

describe('Gobernanza Avanzada de Caché & Experiencia Web Pura (INDI 2026)', () => {
  describe('1. Contratos y Utilidades de Gobernanza (cacheGovernance.ts)', () => {
    it('declara una versión de aplicación válida y directivas W3C seguras', () => {
      expect(APP_CACHE_VERSION).toBeDefined();
      expect(typeof APP_CACHE_VERSION).toBe('string');
      expect(APP_CACHE_VERSION.length).toBeGreaterThan(0);

      // W3C Clear-Site-Data DEBE ser exclusivamente "cache" para proteger sesiones de Better-Auth
      expect(W3C_CLEAR_CACHE_HEADER).toBe('"cache"');
      expect(CACHE_VERSION_COOKIE_NAME).toBe('indi_v');
      expect(CACHE_STORAGE_VERSION_KEY).toBe('indi_cache_v');
    });

    it('detecta correctamente query parameters de purga forzada on-demand', () => {
      expect(hasPurgeCacheQueryParam(new URLSearchParams('purge=1'))).toBe(true);
      expect(hasPurgeCacheQueryParam(new URLSearchParams('reset_cache=1'))).toBe(true);
      expect(hasPurgeCacheQueryParam(new URLSearchParams('v_purge=true'))).toBe(true);
      expect(hasPurgeCacheQueryParam(new URLSearchParams('otro_param=1'))).toBe(false);
      expect(hasPurgeCacheQueryParam(new URLSearchParams('purge=0'))).toBe(false);
      expect(hasPurgeCacheQueryParam(new URLSearchParams(''))).toBe(false);
    });

    it('identifica versiones desactualizadas de caché de cliente', () => {
      expect(isClientCacheVersionStale(null)).toBe(true);
      expect(isClientCacheVersionStale(undefined)).toBe(true);
      expect(isClientCacheVersionStale('2025.1.0')).toBe(true);
      expect(isClientCacheVersionStale('legacy')).toBe(true);
      expect(isClientCacheVersionStale(APP_CACHE_VERSION)).toBe(false);
    });
  });

  describe('2. Política Anti-PWA: Supresión Total de Versión Instalable Standalone', () => {
    it('garantiza la ausencia deliberada de manifest.ts para erradicar splash screens estáticos del SO', () => {
      const manifestPath = path.join(process.cwd(), 'src', 'app', 'manifest.ts');
      const manifestJsonPath = path.join(process.cwd(), 'public', 'manifest.json');
      const manifestWebmanifestPath = path.join(process.cwd(), 'public', 'manifest.webmanifest');

      expect(fs.existsSync(manifestPath), 'manifest.ts no debe existir en src/app').toBe(false);
      expect(fs.existsSync(manifestJsonPath), 'manifest.json no debe existir en public').toBe(false);
      expect(fs.existsSync(manifestWebmanifestPath), 'manifest.webmanifest no debe existir en public').toBe(false);
    });
  });

  describe('3. Edge Middleware de Gestión Automatizada de Caché (src/middleware.ts)', () => {
    it('purgar forzada on-demand: redirige 307 limpiando la URL e inyectando Clear-Site-Data: "cache"', () => {
      const req = new NextRequest('https://soyindi.cl/c/dr-matias?purge=1');
      const res = middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('Clear-Site-Data')).toBe(W3C_CLEAR_CACHE_HEADER);
      expect(res.headers.get('x-indi-cache-purged')).toBe('true');
      expect(res.headers.get('x-indi-app-version')).toBe(APP_CACHE_VERSION);

      // La URL de destino no debe contener ?purge=1
      const location = res.headers.get('location');
      expect(location).toBe('https://soyindi.cl/c/dr-matias');

      // Debe establecer la cookie de versión actualizada
      const cookieHeader = res.headers.get('set-cookie');
      expect(cookieHeader).toContain(`${CACHE_VERSION_COOKIE_NAME}=${APP_CACHE_VERSION}`);
    });

    it('cliente con versión stale: inyecta Clear-Site-Data: "cache" y actualiza la cookie', () => {
      const req = new NextRequest('https://soyindi.cl/c/dr-matias', {
        headers: {
          cookie: `${CACHE_VERSION_COOKIE_NAME}=2025.0.0`,
        },
      });
      const res = middleware(req);

      expect(res.headers.get('Clear-Site-Data')).toBe(W3C_CLEAR_CACHE_HEADER);
      expect(res.headers.get('x-indi-app-version')).toBe(APP_CACHE_VERSION);

      const cookieHeader = res.headers.get('set-cookie');
      expect(cookieHeader).toContain(`${CACHE_VERSION_COOKIE_NAME}=${APP_CACHE_VERSION}`);
    });

    it('cliente con versión al día: NO emite Clear-Site-Data y adjunta cabecera de versión', () => {
      const req = new NextRequest('https://soyindi.cl/c/dr-matias', {
        headers: {
          cookie: `${CACHE_VERSION_COOKIE_NAME}=${APP_CACHE_VERSION}`,
        },
      });
      const res = middleware(req);

      expect(res.headers.get('Clear-Site-Data')).toBeNull();
      expect(res.headers.get('x-indi-app-version')).toBe(APP_CACHE_VERSION);
    });
  });

  describe('4. Configuración HTTP de Cache-Control RFC 9111 (next.config.ts)', () => {
    it('define reglas de cabeceras de caché para brand assets y rutas dinámicas públicas', async () => {
      expect(nextConfig.headers).toBeDefined();
      if (!nextConfig.headers) return;

      const configuredHeaders = await nextConfig.headers();
      expect(configuredHeaders.length).toBeGreaterThanOrEqual(4);

      const brandRule = configuredHeaders.find((h) => h.source === '/brand/:path*');
      expect(brandRule).toBeDefined();
      const brandCacheControl = brandRule?.headers.find((header) => header.key === 'Cache-Control');
      expect(brandCacheControl?.value).toBe(BRAND_ASSETS_CACHE_CONTROL);

      const cardRule = configuredHeaders.find((h) => h.source === '/c/:path*');
      expect(cardRule).toBeDefined();
      const cardCacheControl = cardRule?.headers.find((header) => header.key === 'Cache-Control');
      expect(cardCacheControl?.value).toBe(DYNAMIC_PUBLIC_ROUTE_CACHE_CONTROL);
    });
  });
});
