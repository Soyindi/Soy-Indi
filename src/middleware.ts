import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sanitizeReferralCode, REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_MAX_AGE } from '@/entities/affiliate/referral-cookie';
import {
  APP_CACHE_VERSION,
  CACHE_VERSION_COOKIE_NAME,
  W3C_CLEAR_CACHE_HEADER,
  hasPurgeCacheQueryParam,
  isClientCacheVersionStale,
} from '@/shared/lib/cacheGovernance';

/**
 * Middleware de Gobernanza Canónica de Dominios, Atribución & Gestión de Caché Móvil INDI 2026
 *
 * Objetivos:
 * 1. Redirigir de manera determinista (HTTP 308 Permanente) cualquier petición que
 *    provenga de dominios secundarios (ej: *.vercel.app, indi.bio, www.indi.bio)
 *    hacia el dominio canónico principal: https://soyindi.cl
 * 2. Capturar y persistir en cookie First-Party (indi_ref_code) cualquier código
 *    de referido recibido por query param (?ref=CODIGO) para garantizar atribución
 *    idempotente en Better-Auth y flujos de registro.
 * 3. Gobernanza de Caché Móvil Automatizada (Zero Client Intervention):
 *    - Si se invoca ?purge=1 / ?reset_cache=1 o si la versión del cliente está
 *      desactualizada respecto a APP_CACHE_VERSION, inyecta la cabecera W3C
 *      Clear-Site-Data: "cache" para purgar de inmediato la memoria de disco/RAM
 *      en navegadores móviles (iOS Safari / Android Chrome) sin tocar sesiones Better-Auth.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const isDev = host.includes('localhost') || host.includes('127.0.0.1') || process.env.NODE_ENV === 'development';

  // 1. Detección de host no canónico en producción:
  const isVercelDomain = host.endsWith('.vercel.app');
  const isLegacyDomain = host === 'indi.bio' || host === 'www.indi.bio';
  const isWwwSubdomain = host === 'www.soyindi.cl';

  if (!isDev && (isVercelDomain || isLegacyDomain || isWwwSubdomain)) {
    const destinationUrl = new URL(`https://soyindi.cl${pathname}${search}`);
    const response = NextResponse.redirect(destinationUrl, {
      status: 308,
      headers: {
        'x-canonical-redirect': 'true',
        'x-original-host': host,
      },
    });

    // Si viene código de referido en la redirección, persistir cookie
    const rawRef = request.nextUrl.searchParams.get('ref');
    const sanitizedRef = sanitizeReferralCode(rawRef);
    if (sanitizedRef) {
      response.cookies.set(REFERRAL_COOKIE_NAME, sanitizedRef, {
        maxAge: REFERRAL_COOKIE_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: true,
        httpOnly: false,
      });
    }

    return response;
  }

  // 2. Comprobación de purga forzada on-demand (?purge=1 / ?reset_cache=1)
  const isPurgeRequested = hasPurgeCacheQueryParam(request.nextUrl.searchParams);
  if (isPurgeRequested) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete('purge');
    cleanUrl.searchParams.delete('reset_cache');
    cleanUrl.searchParams.delete('v_purge');

    const purgeResponse = NextResponse.redirect(cleanUrl, {
      status: 307,
      headers: {
        'Clear-Site-Data': W3C_CLEAR_CACHE_HEADER,
        'x-indi-cache-purged': 'true',
        'x-indi-app-version': APP_CACHE_VERSION,
      },
    });

    purgeResponse.cookies.set(CACHE_VERSION_COOKIE_NAME, APP_CACHE_VERSION, {
      maxAge: 31536000,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });

    return purgeResponse;
  }

  // 3. Flujo normal con evaluación de frescura de versión del cliente
  const clientVersionCookie = request.cookies.get(CACHE_VERSION_COOKIE_NAME)?.value;
  const isVersionStale = isClientCacheVersionStale(clientVersionCookie);

  const response = NextResponse.next();

  response.headers.set('x-indi-app-version', APP_CACHE_VERSION);

  if (isVersionStale) {
    // Si la versión del cliente móvil es antigua, instruimos al navegador a limpiar
    // únicamente su caché HTTP de recursos antiguos sin invalidar sesiones de usuario
    response.headers.set('Clear-Site-Data', W3C_CLEAR_CACHE_HEADER);
    response.cookies.set(CACHE_VERSION_COOKIE_NAME, APP_CACHE_VERSION, {
      maxAge: 31536000,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
  }

  // 4. Captura determinista de código de referido en cualquier ruta
  const rawRef = request.nextUrl.searchParams.get('ref');
  const sanitizedRef = sanitizeReferralCode(rawRef);
  if (sanitizedRef) {
    response.cookies.set(REFERRAL_COOKIE_NAME, sanitizedRef, {
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - brand (static brand assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|brand/).*)',
  ],
};
