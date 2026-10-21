import { describe, it, expect } from 'vitest';
import forge from 'node-forge';
import { createPkcs7Signature } from '@/shared/lib/wallet/applePassSigner';

describe('Apple Pass Signer PKCS#7 / CMS DER Detached Test Suite', () => {
  it('genera un contenedor PKCS#7 DER válido con estructura ASN.1', () => {
    // 1. Generar certificados autofirmados para el test
    const keys = forge.pki.rsa.generateKeyPair(1024);
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    const attrs = [{ name: 'commonName', value: 'Pass Type ID: pass.cl.soyindi' }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey);

    const certPem = forge.pki.certificateToPem(cert);
    const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

    const manifestBuf = Buffer.from(JSON.stringify({ 'pass.json': 'fakehash' }), 'utf8');

    // 2. Ejecutar firma
    const signatureDer = createPkcs7Signature(manifestBuf, certPem, keyPem);

    expect(Buffer.isBuffer(signatureDer)).toBe(true);
    expect(signatureDer.length).toBeGreaterThan(100);

    // Cabecera ASN.1 SEQUENCE de PKCS#7 / CMS DER: 0x30 0x82...
    expect(signatureDer[0]).toBe(0x30);
    expect(signatureDer[1]).toBe(0x82);
  });
});
