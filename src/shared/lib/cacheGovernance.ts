/**
 * Gobernanza de Caché Automatizada & Versionado de Despliegue INDI 2026
 *
 * Provee contratos, cabeceras HTTP RFC 9111, directivas W3C Clear-Site-Data
 * y rutinas de invalidación client/edge sin requerir intervención manual en móviles.
 */

export const APP_CACHE_VERSION = '2026.2.1';

export const CACHE_STORAGE_VERSION_KEY = 'indi_cache_v';
export const CACHE_VERSION_COOKIE_NAME = 'indi_v';

export const PURGE_CACHE_QUERY_PARAMS = ['purge', 'reset_cache', 'v_purge'] as const;

/**
 * Cabecera estándar W3C para purgar exclusivamente la caché HTTP del dispositivo móvil,
 * preservando intactas las cookies de sesión (Better-Auth) y el almacenamiento local persistente.
 */
export const W3C_CLEAR_CACHE_HEADER = '"cache"';

/**
 * Directivas de Cache-Control para activos estáticos inmutables o versionados
 */
export const BRAND_ASSETS_CACHE_CONTROL = 'public, max-age=86400, stale-while-revalidate=604800';

/**
 * Directivas de Cache-Control para rutas públicas dinámicas (/c/[slug], /cv/[slug], /p/[slug]):
 * - max-age=0, must-revalidate: El navegador móvil siempre verifica frescura antes de usar la copia de disco.
 * - s-maxage=60: Los Edge Nodes de Vercel/Cloudflare sirven la respuesta en <15ms durante 60 segundos.
 * - stale-while-revalidate=300: Si el Edge está regenerando, sirve la versión previa mientras actualiza.
 */
export const DYNAMIC_PUBLIC_ROUTE_CACHE_CONTROL = 'public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=300';

/**
 * Evalúa si una URL entrante solicita una purga explícita de caché mediante query parameters.
 */
export function hasPurgeCacheQueryParam(searchParams: URLSearchParams): boolean {
  return PURGE_CACHE_QUERY_PARAMS.some((param) => {
    const val = searchParams.get(param);
    return val === '1' || val === 'true';
  });
}

/**
 * Evalúa si la cookie de versión recibida en la petición HTTP está desactualizada respecto
 * a la versión activa del despliegue.
 */
export function isClientCacheVersionStale(cookieVersion: string | undefined | null): boolean {
  if (!cookieVersion) return true;
  return cookieVersion !== APP_CACHE_VERSION;
}
