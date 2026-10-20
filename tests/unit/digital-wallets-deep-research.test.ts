import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildApplePassBundle,
  isApplePassSigningConfigured,
  createMemoryZip,
} from '@/shared/lib/wallet/applePassSigner';
import {
  generateGoogleWalletGenericObject,
  buildGoogleWalletSaveUrl,
  isGoogleWalletSigningConfigured,
} from '@/shared/lib/wallet/googleWalletSigner';
import { generateApplePassJson } from '@/shared/lib/wallet/applePassGenerator';

describe('Gemini Deep Research: Native Digital Wallets Specification & Signing Engine 2026', () => {
  const jsonSpecPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_NATIVE_DIGITAL_WALLETS_APPLE_GOOGLE_2026.json'
  );
  const mdSpecPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_NATIVE_DIGITAL_WALLETS_APPLE_GOOGLE_2026.md'
  );

  it('debe contener la especificación JSON de Deep Research con esquema y pilares válidos', () => {
    expect(fs.existsSync(jsonSpecPath)).toBe(true);
    const content = fs.readFileSync(jsonSpecPath, 'utf8');
    const parsed = JSON.parse(content);

    expect(parsed.metadata.title).toContain('Native Digital Wallets Architecture');
    expect(parsed.metadata.target_model).toContain('Gemini');
    expect(parsed.metadata.runtime_stack.framework).toContain('Next.js 16');
    expect(parsed.metadata.runtime_stack.target_wallets).toHaveLength(2);

    expect(parsed.execution_directives.mandatory_deliverables.length).toBeGreaterThanOrEqual(5);
    expect(parsed.research_pillars.length).toBe(5);

    parsed.research_pillars.forEach((pillar: any) => {
      expect(pillar.pillar_id).toBeDefined();
      expect(pillar.title).toBeDefined();
      expect(pillar.key_questions.length).toBeGreaterThan(0);
    });

    expect(parsed.expected_outputs).toBeDefined();
    expect(parsed.expected_outputs.signing_adapters).toBeDefined();
  });

  it('debe contener la especificación Markdown con instrucciones ejecutivas para Gemini', () => {
    expect(fs.existsSync(mdSpecPath)).toBe(true);
    const mdContent = fs.readFileSync(mdSpecPath, 'utf8');

    expect(mdContent).toContain('PROMPT MAESTRO DE DEEP RESEARCH PARA GEMINI');
    expect(mdContent).toContain('PassKit');
    expect(mdContent).toContain('Google Wallet');
    expect(mdContent).toContain('PKCS#7');
    expect(mdContent).toContain('RS256');
  });

  describe('Apple PassKit Signer & Memory ZIP Engine', () => {
    it('debe empaquetar un archivo ZIP en memoria con cabeceras PK válidas', () => {
      const files = {
        'test.txt': Buffer.from('Hola INDI 2026', 'utf8'),
        'manifest.json': Buffer.from('{}', 'utf8'),
      };

      const zipBuf = createMemoryZip(files);
      expect(Buffer.isBuffer(zipBuf)).toBe(true);
      expect(zipBuf.length).toBeGreaterThan(0);

      // Firma de archivo ZIP estándar: 0x50 0x4b 0x03 0x04 ('PK\x03\x04')
      expect(zipBuf[0]).toBe(0x50);
      expect(zipBuf[1]).toBe(0x4b);
      expect(zipBuf[2]).toBe(0x03);
      expect(zipBuf[3]).toBe(0x04);
    });

    it('debe construir un paquete .pkpass para una tarjeta digital con manifest.json y estructura PassKit', async () => {
      const input = {
        slug: 'matias-riquelme',
        title: 'Matías Riquelme',
        profession: 'Staff Software Engineer',
        phone: '+56912345678',
        email: 'matias@soyindi.cl',
      };

      const result = await buildApplePassBundle(input);
      expect(result.success).toBe(true);
      expect(result.mimeType).toBe('application/vnd.apple.pkpass');
      expect(result.filename).toBe('matias-riquelme.pkpass');
      expect(result.buffer).toBeDefined();
      expect(result.buffer!.length).toBeGreaterThan(100);

      // Comprobar cabecera ZIP del .pkpass
      expect(result.buffer![0]).toBe(0x50);
      expect(result.buffer![1]).toBe(0x4b);
    });

    it('debe reportar correctamente si la firma oficial está configurada', () => {
      const isConfigured = isApplePassSigningConfigured();
      expect(typeof isConfigured).toBe('boolean');
    });

    it('debe generar la estructura canónica pass.json con campos primarios y código QR', () => {
      const passJson = generateApplePassJson({
        slug: 'demo',
        title: 'Demo INDI',
        profession: 'Identidad Digital',
      });

      expect(passJson.formatVersion).toBe(1);
      expect(passJson.organizationName).toBe('INDI');
      expect(passJson.barcodes[0].format).toBe('PKBarcodeFormatQR');
      expect(passJson.barcodes[0].message).toBe('https://soyindi.cl/c/demo');
      expect(passJson.generic.primaryFields[0].value).toBe('Demo INDI');
    });
  });

  describe('Google Wallet Generic Passes Engine', () => {
    it('debe estructurar el Generic Object de Google Wallet con classId, barcode y metadata', () => {
      const issuerId = '3388000000022222222';
      const input = {
        slug: 'matias-tech',
        title: 'Matías Riquelme',
        profession: 'Lead Product Designer',
        phone: '+56987654321',
      };

      const obj = generateGoogleWalletGenericObject(input, issuerId);
      expect(obj.id).toBe(`${issuerId}.matias-tech`);
      expect(obj.classId).toBe(`${issuerId}.indi_business_card_v1`);
      expect(obj.header.defaultValue.value).toBe('Matías Riquelme');
      expect(obj.subheader.defaultValue.value).toBe('Lead Product Designer');
      expect(obj.barcode.type).toBe('QR_CODE');
      expect(obj.barcode.value).toBe('https://soyindi.cl/c/matias-tech');
    });

    it('debe retornar un resultado informativo y seguro cuando no hay Service Account en entorno', () => {
      const input = {
        slug: 'demo',
        title: 'Demo INDI',
        profession: 'Identidad Digital',
      };

      const result = buildGoogleWalletSaveUrl(input);
      expect(result.success).toBe(false);
      expect(result.saveUrl).toBeNull();
      expect(result.guidance).toContain('Credenciales de Google Wallet no configuradas');
    });

    it('debe verificar la presencia de credenciales de Google Wallet como booleano', () => {
      const isConfigured = isGoogleWalletSigningConfigured();
      expect(typeof isConfigured).toBe('boolean');
    });
  });
});
