import { MetadataRoute } from 'next';
import { db } from '@/shared/api/db';
import { cards, smartCvs, presentations } from '@/entities/schema';
import { eq } from 'drizzle-orm';

/**
 * Generador de Sitemap.xml Canónico Oficial INDI 2026
 * Prioriza rutas públicas bajo https://soyindi.cl
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://soyindi.cl';
  const now = new Date();

  // Rutas estáticas de alto impacto
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/start`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Rutas dinámicas públicas (Tarjetas, CVs y Presentaciones activas)
  try {
    const [publicCards, publicCvs, publicPres] = await Promise.all([
      db.query.cards.findMany({
        where: eq(cards.isActive, true),
        columns: { slug: true, updatedAt: true },
        limit: 100,
      }).catch(() => []),
      db.query.smartCvs.findMany({
        where: eq(smartCvs.isPublic, true),
        columns: { slug: true, updatedAt: true },
        limit: 100,
      }).catch(() => []),
      db.query.presentations.findMany({
        columns: { slug: true, updatedAt: true },
        limit: 100,
      }).catch(() => []),
    ]);

    const cardRoutes: MetadataRoute.Sitemap = publicCards
      .filter((c) => Boolean(c.slug))
      .map((c) => ({
        url: `${baseUrl}/c/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    const cvRoutes: MetadataRoute.Sitemap = publicCvs
      .filter((cv) => Boolean(cv.slug))
      .map((cv) => ({
        url: `${baseUrl}/cv/${cv.slug}`,
        lastModified: cv.updatedAt ? new Date(cv.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    const presRoutes: MetadataRoute.Sitemap = publicPres
      .filter((p) => Boolean(p.slug))
      .map((p) => ({
        url: `${baseUrl}/p/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    return [...staticRoutes, ...cardRoutes, ...cvRoutes, ...presRoutes];
  } catch (err) {
    return staticRoutes;
  }
}
