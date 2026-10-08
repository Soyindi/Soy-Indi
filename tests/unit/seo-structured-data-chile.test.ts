import { describe, it, expect } from 'vitest';
import {
  IndexNowSubmissionSchema,
  INDEXNOW_API_KEY,
  INDEXNOW_KEY_LOCATION,
} from '@/entities/seo/schemas';
import fs from 'fs';
import path from 'path';

describe('Estrategia SEO SaaS INDI Chile 2026: Datos Estructurados & IndexNow (tests/unit)', () => {
  it('el archivo page.tsx contiene los esquemas Schema.org de WebApplication, AggregateOffer en CLP y AggregateRating', () => {
    const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    // Validación de WebApplication y AggregateOffer
    expect(content).toContain("'@type': 'WebApplication'");
    expect(content).toContain("priceCurrency: 'CLP'");
    expect(content).toContain("lowPrice: '2500'");
    expect(content).toContain("highPrice: '6000'");
    expect(content).toContain("'@type': 'AggregateRating'");
    expect(content).toContain("ratingValue: '4.9'");

    // Validación de Organización y BreadcrumbList
    expect(content).toContain("'@type': 'Organization'");
    expect(content).toContain("'@type': 'BreadcrumbList'");

    // Validación de preguntas frecuentes con respuestas adaptadas a Chile (ATS y sin app)
    expect(content).toContain('Buk, Laborum y Trabajando');
    expect(content).toContain('vCard 4.0');
    expect(content).toContain('Cuenta RUT');
  });

  it('BrandLogo implementa Product-Led Link Building con rel="powered-by" para enlaces al inicio', () => {
    const logoPath = path.resolve(process.cwd(), 'src/shared/ui/BrandLogo.tsx');
    const content = fs.readFileSync(logoPath, 'utf-8');

    expect(content).toContain('rel="powered-by"');
    expect(content).toContain('title="INDI — Tecnología de Identidad Digital y Smart CV en Chile"');
  });

  it('el esquema Zod de IndexNow valida correctamente payloads válidos e invalida URLs malformadas', () => {
    const validPayload = {
      host: 'soyindi.cl',
      key: INDEXNOW_API_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: ['https://soyindi.cl/c/matias-riquelme', 'https://soyindi.cl/cv/ingeniero-civil'],
    };

    const validResult = IndexNowSubmissionSchema.safeParse(validPayload);
    expect(validResult.success).toBe(true);

    const invalidPayload = {
      host: 'soyindi.cl',
      urlList: ['not-a-valid-url'],
    };

    const invalidResult = IndexNowSubmissionSchema.safeParse(invalidPayload);
    expect(invalidResult.success).toBe(false);
  });

  it('el archivo público de verificación de clave para IndexNow existe en public/ y coincide con la clave', () => {
    const keyFilePath = path.resolve(process.cwd(), `public/${INDEXNOW_API_KEY}.txt`);
    expect(fs.existsSync(keyFilePath)).toBe(true);

    const fileContent = fs.readFileSync(keyFilePath, 'utf-8').trim();
    expect(fileContent).toBe(INDEXNOW_API_KEY);
  });
});
