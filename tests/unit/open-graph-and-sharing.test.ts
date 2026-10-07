import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@vercel/og', () => {
  return {
    ImageResponse: class MockImageResponse extends Response {
      constructor(element: any, options?: any) {
        super('mock-image-binary', {
          status: 200,
          headers: {
            'content-type': 'image/png',
            ...options?.headers,
          },
        });
      }
    },
  };
});

import {
  buildCanonicalShareUrl,
  generateShareCopy,
  buildWhatsAppShareUrl,
  buildLinkedInShareUrl,
  buildTwitterShareUrl,
} from '@/shared/lib/shareCopy';
import { GET, runtime } from '@/app/api/og/route';

describe('Motor Visual Open Graph y Módulo de Compartir (INDI 2026)', () => {
  describe('Utilidades de Copywriting y Enlaces Canónicos (shareCopy.ts)', () => {
    it('construye URLs canónicas con parámetros UTM y código de afiliado para cada tipo de entidad', () => {
      const cardUrl = buildCanonicalShareUrl({
        entityType: 'card',
        slug: 'matias-dev',
        medium: 'whatsapp',
        referralCode: 'MATIAS25',
      });
      expect(cardUrl).toBe('https://soyindi.cl/c/matias-dev?utm_source=share&utm_medium=whatsapp&ref=MATIAS25');

      const cvUrl = buildCanonicalShareUrl({
        entityType: 'cv',
        slug: 'matias-cv',
        medium: 'linkedin',
      });
      expect(cvUrl).toBe('https://soyindi.cl/cv/matias-cv?utm_source=share&utm_medium=linkedin');

      const presUrl = buildCanonicalShareUrl({
        entityType: 'presentation',
        slug: 'pitch-deck',
        medium: 'native',
      });
      expect(presUrl).toBe('https://soyindi.cl/p/pitch-deck?utm_source=share&utm_medium=native');
    });

    it('genera copywriting persuasivo según la fórmula de la entidad (AIDA, Hook-Story-Offer, Curiosity Gap)', () => {
      // Tarjeta: AIDA
      const cardCopy = generateShareCopy({
        entityType: 'card',
        title: 'Matias Riquelme',
        role: 'Tech Lead',
        slug: 'matias-dev',
        url: 'https://soyindi.cl/c/matias-dev',
      });
      expect(cardCopy.headline).toContain('Conecta con Matias Riquelme');
      expect(cardCopy.body).toContain('Guarda mi contacto profesional');
      expect(cardCopy.fullMessage).toContain('https://soyindi.cl/c/matias-dev');

      // Smart CV: Hook-Story-Offer
      const cvCopy = generateShareCopy({
        entityType: 'cv',
        title: 'Matias Riquelme',
        role: 'Arquitecto Cloud',
        slug: 'matias-cv',
        url: 'https://soyindi.cl/cv/matias-cv',
      });
      expect(cvCopy.headline).toContain('Currículum Profesional');
      expect(cvCopy.body).toContain('ATS');
      expect(cvCopy.fullMessage).toContain('https://soyindi.cl/cv/matias-cv');

      // Presentación: Curiosity Gap
      const presCopy = generateShareCopy({
        entityType: 'presentation',
        title: 'Propuesta Q4',
        slug: 'propuesta-q4',
        url: 'https://soyindi.cl/p/propuesta-q4',
      });
      expect(presCopy.headline).toContain('Presentación Orbital 16:9');
      expect(presCopy.body).toContain('propuesta comercial');
      expect(presCopy.fullMessage).toContain('https://soyindi.cl/p/propuesta-q4');
    });

    it('construye enlaces externos para redes sociales con texto codificado correctamente', () => {
      const waUrl = buildWhatsAppShareUrl('¡Hola mundo! Mira mi tarjeta: https://soyindi.cl/c/demo');
      expect(waUrl).toContain('https://wa.me/?text=');
      expect(waUrl).toContain(encodeURIComponent('¡Hola mundo!'));

      const liUrl = buildLinkedInShareUrl('https://soyindi.cl/cv/demo', 'Mi CV');
      expect(liUrl).toContain('https://www.linkedin.com/sharing/share-offsite/?url=');

      const twUrl = buildTwitterShareUrl('Mira mi presentación', 'https://soyindi.cl/p/demo');
      expect(twUrl).toContain('https://twitter.com/intent/tweet?');
    });
  });

  describe('Edge Route Handler Open Graph (src/app/api/og/route.tsx)', () => {
    it('declara la directiva runtime = "edge"', () => {
      expect(runtime).toBe('edge');
    });

    it('genera una imagen Open Graph con cabecera Cache-Control perimetral s-maxage y status 200', async () => {
      const req = new NextRequest('https://soyindi.cl/api/og?title=Matias&role=Engineer&type=card&verified=1');
      const res = await GET(req);

      expect(res.status).toBe(200);
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toContain('s-maxage=86400');
      expect(cacheControl).toContain('stale-while-revalidate=604800');
    });

    it('procesa correctamente los tipos de entidad cv y presentation', async () => {
      const cvReq = new NextRequest('https://soyindi.cl/api/og?type=cv&n=Ana%20Lopez&r=Doctora&verified=1');
      const cvRes = await GET(cvReq);
      expect(cvRes.status).toBe(200);

      const presReq = new NextRequest('https://soyindi.cl/api/og?type=presentation&title=Pitch%202026&role=Keynote');
      const presRes = await GET(presReq);
      expect(presRes.status).toBe(200);
    });
  });
});
