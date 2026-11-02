import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cardFormSchema, slugifyCardName, generateCardSlug, isReservedCardSlug, RESERVED_CARD_SLUGS } from '@/entities/card/schemas';
import { generateVCardString, VCARD_SECURITY_LIMITS } from '@/shared/lib/vcard';
import { buildGoogleWalletSaveUrl, generateGoogleWalletGenericObject } from '@/shared/lib/wallet/googleWalletSigner';
import crypto from 'node:crypto';

describe('Tarjetas Digitales - Comprehensive Quality & Resilience Audit (INDI 2026)', () => {
  describe('1. Contratos Zod & Esquema de Tarjeta Digital', () => {
    it('valida exitosamente una tarjeta completa con acabado, textura y bloques bento', () => {
      const validCard = {
        slug: 'carlos-silva',
        title: 'Carlos Silva',
        profession: 'Director de Operaciones & Logística',
        about: 'Liderando cadenas de suministro resilientes y transformación digital en Chile.',
        phone: '+56 9 8765 4321',
        whatsapp: '+56 9 8765 4321',
        emailContact: 'carlos.silva@empresa.cl',
        websiteUrl: 'https://carlossilva.cl',
        linkedinUrl: 'https://linkedin.com/in/carlossilva',
        instagramUrl: 'https://instagram.com/carlossilva',
        address: 'Av. Providencia 1234, Santiago, Chile',
        photoUrl: 'https://assets.soyindi.cl/avatars/carlos.webp',
        themeConfig: {
          themeId: 'stellar',
          primaryColorOklch: '#6366f1',
          backgroundColorOklch: '#090a10',
          particleBehavior: 'ambient' as const,
          particleIntensity: 'balanced' as const,
          cardFinish: 'titanium' as const,
          surfaceTexture: 'radial-glow' as const,
          operationalStatus: 'open_now' as const,
          badgeText: 'DIRECTOR DE OPERACIONES',
          ctaLabel: 'Guardar Contacto Directo',
          bentoBlocks: [
            {
              id: 'bento-1',
              type: 'metric' as const,
              title: 'Eficiencia Operacional',
              subtitle: 'Reducción de costos de transporte',
              metricValue: '+34%',
              metricDelta: '↑ récord 2026',
            },
            {
              id: 'bento-2',
              type: 'link' as const,
              title: 'Portafolio Ejecutivo',
              subtitle: 'Casos de éxito en supply chain',
              url: 'https://carlossilva.cl/portafolio',
            },
          ],
        },
      };

      const result = cardFormSchema.safeParse(validCard);
      expect(result.success).toBe(true);
    });

    it('rechaza slugs con caracteres especiales, mayúsculas o menos de 3 caracteres', () => {
      const invalidSlugs = ['ab', 'Carlos_Silva', 'carlos silva', 'carlos@silva', 'carlos/silva'];
      for (const slug of invalidSlugs) {
        const res = cardFormSchema.safeParse({
          slug,
          title: 'Carlos Silva',
          profession: 'Ingeniero',
          themeConfig: {},
        });
        expect(res.success).toBe(false);
      }
    });

    it('identifica e intercepta correctamente los slugs reservados de rutas del sistema', () => {
      expect(isReservedCardSlug('admin')).toBe(true);
      expect(isReservedCardSlug('api')).toBe(true);
      expect(isReservedCardSlug('dashboard')).toBe(true);
      expect(isReservedCardSlug('cards')).toBe(true);
      expect(isReservedCardSlug('cv')).toBe(true);
      expect(isReservedCardSlug('presentations')).toBe(true);
      expect(isReservedCardSlug('pricing')).toBe(true);
      expect(isReservedCardSlug('login')).toBe(true);
      expect(isReservedCardSlug('carlos-silva')).toBe(false);
    });

    it('slugifyCardName normaliza acentos, diacríticos y espacios en blanco', () => {
      expect(slugifyCardName('Matías Riquelme')).toBe('matias-riquelme');
      expect(slugifyCardName('Ñandú & Cía. Ltda.')).toBe('nandu-cia-ltda');
      expect(slugifyCardName('  José María O\'Higgins  ')).toBe('jose-maria-o-higgins');
    });

    it('generateCardSlug añade sufijo de 4 caracteres cuando se requiere desambiguación', () => {
      const slugWithSuffix = generateCardSlug('carlos-mendoza', true);
      expect(slugWithSuffix).toMatch(/^carlos-mendoza-[a-z0-9]{4}$/);
    });
  });

  describe('2. Generador de vCard 4.0 / RFC 2426 & Seguridad Móvil', () => {
    it('genera una vCard válida con todos los campos sanitizados y límites de buffer', () => {
      const vcard = generateVCardString({
        slug: 'carlos-silva',
        title: 'Carlos Silva',
        profession: 'Director de Operaciones',
        about: 'Profesional en logística estratégica.',
        phone: '+56987654321',
        whatsapp: '+56987654321',
        emailContact: 'carlos@empresa.cl',
        websiteUrl: 'https://carlossilva.cl',
        linkedinUrl: 'https://linkedin.com/in/carlossilva',
        instagramUrl: 'https://instagram.com/carlossilva',
        address: 'Av. Providencia 1234, Santiago',
      });

      expect(vcard).toContain('BEGIN:VCARD');
      expect(vcard).toContain('VERSION:3.0');
      expect(vcard).toContain('FN;CHARSET=UTF-8:Carlos Silva');
      expect(vcard).toContain('N;CHARSET=UTF-8:Silva;Carlos;;;');
      expect(vcard).toContain('TITLE;CHARSET=UTF-8:Director de Operaciones');
      expect(vcard).toContain('TEL;TYPE=CELL,VOICE:+56987654321');
      expect(vcard).toContain('EMAIL;TYPE=PREF,INTERNET:carlos@empresa.cl');
      expect(vcard).toContain('URL;TYPE=WORK:https://carlossilva.cl');
      expect(vcard).toContain('X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/carlossilva');
      expect(vcard).toContain('ADR;TYPE=WORK;CHARSET=UTF-8:;;Av. Providencia 1234\\, Santiago;;;;');
      expect(vcard).toContain('URL;TYPE=INDI_PROFILE:https://soyindi.cl/c/carlos-silva');
      expect(vcard).toContain('END:VCARD');
    });

    it('aplica límites estrictos contra desbordamiento de búfer móvil (CVE-2023-41064)', () => {
      const massiveAbout = 'A'.repeat(2000);
      const vcard = generateVCardString({
        slug: 'test',
        title: 'Test Overflow',
        profession: 'Dev',
        about: massiveAbout,
      });

      // El texto de about debe truncarse a VCARD_SECURITY_LIMITS.MAX_ABOUT_CHARS (500)
      expect(vcard.length).toBeLessThan(1500);
      expect(vcard).toContain('A'.repeat(VCARD_SECURITY_LIMITS.MAX_ABOUT_CHARS));
      expect(vcard).not.toContain('A'.repeat(VCARD_SECURITY_LIMITS.MAX_ABOUT_CHARS + 1));
    });
  });

  describe('3. Google Wallet Signer & Estándares JWT RS256', () => {
    it('genera la estructura Generic Object con logo canónico 1024x1024 y barcode QR', () => {
      const obj = generateGoogleWalletGenericObject(
        {
          slug: 'carlos-silva',
          title: 'Carlos Silva',
          profession: 'Director',
          phone: '+56987654321',
        },
        '3388000000022345678'
      );

      expect(obj.id).toBe('3388000000022345678.carlos-silva');
      expect(obj.classId).toBe('3388000000022345678.indi_business_card_v1');
      expect(obj.logo.sourceUri.uri).toBe('https://soyindi.cl/brand/indi-logo-1024.png');
      expect(obj.barcode.type).toBe('QR_CODE');
      expect(obj.barcode.value).toBe('https://soyindi.cl/c/carlos-silva');
    });

    it('maneja con elegancia y normaliza claves privadas con saltos de línea escapados', () => {
      // Generar un par de claves RSA reales en memoria para prueba exacta de firma
      const { privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });

      // Simular clave con saltos de línea escapados '\\n' como ocurre en Vercel env vars
      const escapedPrivateKey = privateKey.replace(/\n/g, '\\n');

      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        GOOGLE_WALLET_ISSUER_ID: '3388000000022345678',
        GOOGLE_WALLET_CLIENT_EMAIL: 'indi-wallet@soyindi.iam.gserviceaccount.com',
        GOOGLE_WALLET_PRIVATE_KEY: escapedPrivateKey,
      };

      try {
        const result = buildGoogleWalletSaveUrl({
          slug: 'carlos-silva',
          title: 'Carlos Silva',
          profession: 'Director',
          phone: '+56987654321',
        });

        expect(result.success).toBe(true);
        expect(result.isSigned).toBe(true);
        expect(result.saveUrl).toContain('https://pay.google.com/gp/v/save/');
        expect(result.jwt).toBeDefined();

        // Validar formato JWT (tres segmentos separados por puntos)
        const jwtParts = (result.jwt || '').split('.');
        expect(jwtParts).toHaveLength(3);
      } finally {
        process.env = originalEnv;
      }
    });

    it('informa degradación segura cuando no se han configurado credenciales de Google Wallet', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.GOOGLE_WALLET_ISSUER_ID;
      delete process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY;
      delete process.env.GOOGLE_WALLET_PRIVATE_KEY;

      try {
        const result = buildGoogleWalletSaveUrl({
          slug: 'carlos-silva',
          title: 'Carlos Silva',
          profession: 'Director',
        });

        expect(result.success).toBe(false);
        expect(result.isSigned).toBe(false);
        expect(result.saveUrl).toBeNull();
        expect(result.guidance).toContain('Credenciales de Google Wallet no configuradas');
      } finally {
        process.env = originalEnv;
      }
    });
  });
});
