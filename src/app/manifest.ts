import type { MetadataRoute } from 'next';
import { APP_CACHE_VERSION } from '@/shared/lib/cacheGovernance';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `https://soyindi.cl/?v=${APP_CACHE_VERSION}`,
    name: 'INDI — Plataforma SaaS de Identidad Digital y Networking',
    short_name: 'INDI',
    description: 'Tarjetas digitales inteligentes, Smart CVs y presentaciones interactivas con rendimiento Edge ultra-rápido.',
    start_url: '/start',
    display: 'standalone',
    background_color: '#080A12',
    theme_color: '#080A12',
    icons: [
      {
        src: `/brand/indi-alien-symbol-sm.webp?v=${APP_CACHE_VERSION}`,
        sizes: '192x192',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: `/brand/indi-isotipo-transparent.svg?v=${APP_CACHE_VERSION}`,
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: `/brand/indi-tech-lockup.webp?v=${APP_CACHE_VERSION}`,
        sizes: '1376x768',
        type: 'image/webp',
        purpose: 'any',
      },
    ],
  };
}
