import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Auditoría de Identidad Visual y SEO JSON-LD (INDI 2026)', () => {
  describe('Favicon Vectorial Oficial de la Marca (src/app/icon.svg)', () => {
    it('existe físicamente en src/app/icon.svg', () => {
      const iconPath = path.resolve(process.cwd(), 'src/app/icon.svg');
      expect(fs.existsSync(iconPath)).toBe(true);
    });

    it('contiene la silueta oficial del Alien con nodo superior y gradiente oficial', () => {
      const iconPath = path.resolve(process.cwd(), 'src/app/icon.svg');
      const content = fs.readFileSync(iconPath, 'utf-8');

      // Verifica que tiene los componentes anatómicos del Alien oficial de INDI
      expect(content).toContain('viewBox="0 0 64 64"');
      expect(content).toContain('id="alien-grad"');
      expect(content).toContain('id="node-glow"');
      expect(content).toContain('prefers-color-scheme: light');
      expect(content).toContain('#818CF8');
      expect(content).toContain('#22D3EE');
      expect(content).toContain('#2DD4BF');
    });
  });

  describe('Metadatos Open Graph y Twitter Globales (src/app/layout.tsx)', () => {
    it('declara la imagen de lockup maestro oficial en la raíz', () => {
      const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');

      expect(content).toContain('indi-tech-lockup.webp');
      expect(content).toContain('/icon.svg');
      expect(content).toContain('indi-alien-symbol-sm.webp');
    });
  });

  describe('Estructuras de Datos JSON-LD Schema.org', () => {
    it('el componente JsonLd genera un script con type application/ld+json sanitizado', () => {
      const jsonLdPath = path.resolve(process.cwd(), 'src/shared/ui/JsonLd.tsx');
      expect(fs.existsSync(jsonLdPath)).toBe(true);
      const content = fs.readFileSync(jsonLdPath, 'utf-8');
      expect(content).toContain('application/ld+json');
      expect(content).toContain('replace(/</g');
    });

    it('la página principal page.tsx inyecta Organization, WebSite y FAQPage', () => {
      const homePath = path.resolve(process.cwd(), 'src/app/page.tsx');
      const content = fs.readFileSync(homePath, 'utf-8');

      expect(content).toContain("HOME_STRUCTURED_DATA");
      expect(content).toContain("'@type': 'Organization'");
      expect(content).toContain("'@type': 'WebSite'");
      expect(content).toContain("'@type': 'FAQPage'");
      expect(content).toContain('<JsonLd data={HOME_STRUCTURED_DATA} />');
    });

    it('la ruta pública de tarjeta c/[slug]/page.tsx inyecta ProfilePage y Person', () => {
      const cardPagePath = path.resolve(process.cwd(), 'src/app/c/[slug]/page.tsx');
      const content = fs.readFileSync(cardPagePath, 'utf-8');

      expect(content).toContain("'@type': 'ProfilePage'");
      expect(content).toContain("'@type': 'Person'");
      expect(content).toContain('<JsonLd data={cardJsonLd} />');
    });

    it('la ruta pública de Smart CV cv/[slug]/page.tsx inyecta ProfilePage y DigitalDocument', () => {
      const cvPagePath = path.resolve(process.cwd(), 'src/app/cv/[slug]/page.tsx');
      const content = fs.readFileSync(cvPagePath, 'utf-8');

      expect(content).toContain("'@type': 'ProfilePage'");
      expect(content).toContain("'@type': 'DigitalDocument'");
      expect(content).toContain('<JsonLd data={cvJsonLd} />');
    });
  });
});
