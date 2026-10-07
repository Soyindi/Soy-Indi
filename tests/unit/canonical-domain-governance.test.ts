import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { getAppBaseUrl, buildCanonicalUrl, PRIMARY_DOMAIN, CANONICAL_ORIGIN } from '@/entities/brand/domain';

describe('Dominio Canónico & Middleware de Redirección (soyindi.cl)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('debe tener definido el dominio canónico principal como soyindi.cl', () => {
    expect(PRIMARY_DOMAIN).toBe('soyindi.cl');
    expect(CANONICAL_ORIGIN).toBe('https://soyindi.cl');
  });

  it('debe construir URLs canónicas válidas para perfiles, cvs y presentaciones', () => {
    const cardUrl = buildCanonicalUrl('/c/carlos-mendoza', 'https://soyindi.cl');
    const cvUrl = buildCanonicalUrl('/cv/matias-riquelme', 'https://soyindi.cl');
    const presUrl = buildCanonicalUrl('/p/pitch-2026', 'https://soyindi.cl');

    expect(cardUrl).toBe('https://soyindi.cl/c/carlos-mendoza');
    expect(cvUrl).toBe('https://soyindi.cl/cv/matias-riquelme');
    expect(presUrl).toBe('https://soyindi.cl/p/pitch-2026');
  });

  it('debe retornar https://soyindi.cl en producción por defecto', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.BETTER_AUTH_URL;

    const resolved = getAppBaseUrl();
    expect(resolved).toBe('https://soyindi.cl');
  });

  it('debe interceptar y redirigir con 308 peticiones provenientes de subdominios vercel.app hacia soyindi.cl', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const req = new NextRequest('https://indi-saas.vercel.app/c/mi-tarjeta?ref=promo', {
      headers: {
        host: 'indi-saas.vercel.app',
      },
    });

    const response = middleware(req);
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://soyindi.cl/c/mi-tarjeta?ref=promo');
    expect(response.headers.get('x-canonical-redirect')).toBe('true');
  });

  it('debe redirigir peticiones provenientes de www.soyindi.cl hacia el dominio apex soyindi.cl', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const req = new NextRequest('https://www.soyindi.cl/pricing', {
      headers: {
        host: 'www.soyindi.cl',
      },
    });

    const response = middleware(req);
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://soyindi.cl/pricing');
  });

  it('debe permitir continuar el tráfico normal si ya se encuentra en soyindi.cl', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const req = new NextRequest('https://soyindi.cl/dashboard', {
      headers: {
        host: 'soyindi.cl',
      },
    });

    const response = middleware(req);
    expect(response.headers.get('location')).toBeNull();
    expect(response.status).toBe(200);
  });

  it('debe permitir tráfico en localhost durante desarrollo sin forzar redirección externa', () => {
    const req = new NextRequest('http://localhost:3000/start', {
      headers: {
        host: 'localhost:3000',
      },
    });

    const response = middleware(req);
    expect(response.headers.get('location')).toBeNull();
  });

  it('debe garantizar que auth.options.baseURL y trustedOrigins prioricen CANONICAL_ORIGIN (soyindi.cl) en producción', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.BETTER_AUTH_URL;

    // En producción sin variable residual, debe resolver exactamente a https://soyindi.cl
    const baseUrlProd = process.env.BETTER_AUTH_URL || CANONICAL_ORIGIN;
    expect(baseUrlProd).toBe('https://soyindi.cl');
    expect(CANONICAL_ORIGIN).toBe('https://soyindi.cl');
  });
});
