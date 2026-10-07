import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sanitizeReferralCode, REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_MAX_AGE } from '@/entities/affiliate/referral-cookie';

/**
 * Middleware de Gobernanza Canónica de Dominios & Atribución de Referidos INDI 2026
 *
 * Objetivos:
 * 1. Redirigir de manera determinista (HTTP 308 Permanente) cualquier petición que
 *    provenga de dominios secundarios (ej: *.vercel.app, indi.bio, www.soyindi.cl)
 *    hacia el dominio canónico principal: https://soyindi.cl
 * 2. Capturar y persistir en cookie First-Party (indi_ref_code) cualquier código
 *    de referido recibido por query param (?ref=CODIGO) para garantizar atribución
 *    idempotente en Better-Auth y flujos de registro.
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

  const response = NextResponse.next();

  // 2. Captura determinista de código de referido en cualquier ruta
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

