import { z } from 'zod';

/**
 * Esquema de Dominio y URLs del Ecosistema INDI (2026)
 * Centraliza la URL canónica de producción (https://soyindi.cl)
 * y la detección dinámica de host/origen en Edge Runtime, SSR y Cliente.
 */
export const PRIMARY_DOMAIN = 'soyindi.cl';
export const CANONICAL_ORIGIN = `https://${PRIMARY_DOMAIN}`;

/** Dominios legacy y aliases autorizados para redirección canónica 301 */
export const LEGACY_DOMAINS = [
  'indi.bio',
  'www.indi.bio',
  'www.soyindi.cl',
] as const;

export const AppUrlSchema = z.string().url();

/**
 * Resuelve la URL base absoluta canónica del entorno.
 * 1. En el navegador (Client-side): window.location.origin
 * 2. En el servidor (SSR / Server Actions / Edge):
 *    - Si se pasa explicitOrigin o Request, utiliza su origen
 *    - Si NEXT_PUBLIC_APP_URL o BETTER_AUTH_URL están definidos, los evalúa
 *    - Fallback predeterminado a producción: https://soyindi.cl
 */
export function getAppBaseUrl(explicitOrigin?: string | null): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  if (explicitOrigin && explicitOrigin.startsWith('http')) {
    return explicitOrigin.replace(/\/+$/, '');
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return CANONICAL_ORIGIN;
}

/**
 * Construye una URL pública canónica para cualquier vertical de INDI.
 */
export function buildCanonicalUrl(
  path: `/c/${string}` | `/p/${string}` | `/cv/${string}` | `/start` | string,
  baseOrigin?: string | null
): string {
  const origin = getAppBaseUrl(baseOrigin);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}
