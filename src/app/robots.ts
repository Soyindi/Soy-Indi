import { MetadataRoute } from 'next';

/**
 * Generador de Robots.txt Canónico Oficial INDI 2026
 * Garantiza indexación en https://soyindi.cl y referencia al Sitemap
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/checkout/',
        ],
      },
    ],
    sitemap: 'https://soyindi.cl/sitemap.xml',
    host: 'https://soyindi.cl',
  };
}
