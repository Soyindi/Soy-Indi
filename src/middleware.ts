import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Gobernanza Canónica de Dominios INDI 2026
 *
 * Objetivo:
 * Redirigir de manera determinista (HTTP 301 Permanente) cualquier petición que
 * provenga de dominios secundarios o despliegues automáticos (ej: *.vercel.app,
 * www.soyindi.cl, indi.bio, www.indi.bio) hacia el dominio canónico principal:
 * https://soyindi.cl
 *
 * Excepciones seguras:
 * - Entornos de desarrollo local (localhost, 127.0.0.1)
 * - Prefetching interno o rutas API de webhooks que requieran compatibilidad
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // 1. Ignorar solicitudes en entorno de desarrollo local
  if (
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    process.env.NODE_ENV === 'development'
  ) {
    return NextResponse.next();
  }

  // 2. Detección de host no canónico:
  // - *.vercel.app (despliegues de preview o producción por defecto)
  // - indi.bio o www.indi.bio (dominio anterior / legacy)
  // - www.soyindi.cl (subdominio www que debe colapsar al apex soyindi.cl)
  const isVercelDomain = host.endsWith('.vercel.app');
  const isLegacyDomain = host === 'indi.bio' || host === 'www.indi.bio';
  const isWwwSubdomain = host === 'www.soyindi.cl';

  if (isVercelDomain || isLegacyDomain || isWwwSubdomain) {
    // Preservar protocolo https y reconstruir destino canónico completo
    const destinationUrl = new URL(`https://soyindi.cl${pathname}${search}`);

    // Redirección HTTP 308 / 301 permanente para SEO y navegadores
    return NextResponse.redirect(destinationUrl, {
      status: 308,
      headers: {
        'x-canonical-redirect': 'true',
        'x-original-host': host,
      },
    });
  }

  return NextResponse.next();
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
