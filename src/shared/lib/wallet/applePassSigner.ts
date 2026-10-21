/**
 * Adaptador de Firma Criptográfica para Apple Wallet (PassKit PKCS#7)
 * INDI Platform 2026 - Feature-Sliced Design (@/shared/lib/wallet)
 *
 * Cumple con los estándares de seguridad de Apple PassKit:
 * - Estructura pass.json canónica
 * - Generación de manifest.json con hashes SHA-1
 * - Firma desprendida PKCS#7 en contenedor DER (cuando APPLE_PASS_CERT_PEM y KEY están configurados)
 * - Empaquetado ZIP en memoria (Zero-Binary File Persistence)
 */

import crypto from 'node:crypto';
import forge from 'node-forge';
import { generateApplePassJson, ApplePassInput } from './applePassGenerator';

export interface ApplePassSignerResult {
  success: boolean;
  isSigned: boolean;
  buffer?: Buffer;
  mimeType: string;
  filename: string;
  error?: string;
  guidance?: string;
}

/**
 * Verifica si las credenciales de Apple PassKit están configuradas en el entorno
 */
export function isApplePassSigningConfigured(): boolean {
  const hasP12 = Boolean(process.env.APPLE_PASS_CERT_P12 || process.env.APPLE_PASS_CERT_P12_BASE64);
  const hasPem = Boolean(process.env.APPLE_PASS_CERT_PEM && process.env.APPLE_PASS_KEY_PEM);
  return hasP12 || hasPem;
}

/**
 * Genera la firma PKCS#7 / CMS detached en formato DER compatible con Apple PassKit
 */
export function createPkcs7Signature(
  manifestJsonBuffer: Buffer,
  signerCertPem: string,
  signerKeyPem: string,
  wwdrCertPem?: string,
  passphrase?: string
): Buffer {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(manifestJsonBuffer.toString('utf8'), 'utf8');

  const cert = forge.pki.certificateFromPem(signerCertPem);
  const key =
    forge.pki.decryptRsaPrivateKey(signerKeyPem, passphrase || '') ||
    forge.pki.privateKeyFromPem(signerKeyPem);

  p7.addCertificate(cert);

  if (wwdrCertPem) {
    try {
      const wwdr = forge.pki.certificateFromPem(wwdrCertPem);
      p7.addCertificate(wwdr);
    } catch (e) {
      console.warn('[ApplePassSigner] Error al parsear certificado WWDR intermedio:', e);
    }
  }

  p7.addSigner({
    key: key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data,
      },
      {
        type: forge.pki.oids.messageDigest,
      },
      {
        type: forge.pki.oids.signingTime,
        value: new Date().toISOString(),
      },
    ],
  });

  p7.sign({ detached: true });
  const derAsn1 = forge.asn1.toDer(p7.toAsn1());
  return Buffer.from(derAsn1.getBytes(), 'binary');
}

/**
 * Generador de archivo ZIP mínimo en memoria (estándar PKZIP RFC 1951)
 * Permite empaquetar archivos en Node.js sin dependencias binarias pesadas.
 */
export function createMemoryZip(files: Record<string, Buffer | string>): Buffer {
  const fileEntries: Array<{
    name: Buffer;
    data: Buffer;
    crc: number;
    compressedData: Buffer;
    offset: number;
  }> = [];

  function crc32(buf: Buffer): number {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        const mask = -(byte & 1);
        byte = (byte >>> 1) ^ (0xEDB88320 & mask);
      }
      crc = (crc >>> 8) ^ byte;
    }
    return (crc ^ -1) >>> 0;
  }

  const parts: Buffer[] = [];
  let currentOffset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBuf = Buffer.from(name, 'utf8');
    const dataBuf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const crc = crc32(dataBuf);
    const compressedData = dataBuf;

    fileEntries.push({
      name: nameBuf,
      data: dataBuf,
      crc,
      compressedData,
      offset: currentOffset,
    });

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedData.length, 18);
    localHeader.writeUInt32LE(dataBuf.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    parts.push(localHeader, nameBuf, compressedData);
    currentOffset += localHeader.length + nameBuf.length + compressedData.length;
  }

  const centralDirOffset = currentOffset;
  let centralDirSize = 0;

  for (const entry of fileEntries) {
    const cdHeader = Buffer.alloc(46);
    cdHeader.writeUInt32LE(0x02014b50, 0);
    cdHeader.writeUInt16LE(20, 4);
    cdHeader.writeUInt16LE(20, 6);
    cdHeader.writeUInt16LE(0, 8);
    cdHeader.writeUInt16LE(0, 10);
    cdHeader.writeUInt16LE(0, 12);
    cdHeader.writeUInt16LE(0, 14);
    cdHeader.writeUInt32LE(entry.crc, 16);
    cdHeader.writeUInt32LE(entry.compressedData.length, 20);
    cdHeader.writeUInt32LE(entry.data.length, 24);
    cdHeader.writeUInt16LE(entry.name.length, 28);
    cdHeader.writeUInt16LE(0, 30);
    cdHeader.writeUInt16LE(0, 32);
    cdHeader.writeUInt16LE(0, 34);
    cdHeader.writeUInt16LE(0, 36);
    cdHeader.writeUInt32LE(0, 38);
    cdHeader.writeUInt32LE(entry.offset, 42);

    parts.push(cdHeader, entry.name);
    centralDirSize += cdHeader.length + entry.name.length;
  }

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(fileEntries.length, 8);
  eocd.writeUInt16LE(fileEntries.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);

  parts.push(eocd);
  return Buffer.concat(parts);
}

/**
 * Genera el paquete .pkpass para Apple Wallet
 * Si existen certificados configurados, aplica la firma criptográfica PKCS#7.
 * Si no existen, genera el paquete estructurado con manifest.json y provee advertencia.
 */
export async function buildApplePassBundle(input: ApplePassInput): Promise<ApplePassSignerResult> {
  try {
    const passJsonObj = generateApplePassJson(input);
    const passJsonStr = JSON.stringify(passJsonObj, null, 2);
    const passJsonBuf = Buffer.from(passJsonStr, 'utf8');

    const minimalPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const passFiles: Record<string, Buffer> = {
      'pass.json': passJsonBuf,
      'icon.png': minimalPng,
      'icon@2x.png': minimalPng,
      'logo.png': minimalPng,
      'logo@2x.png': minimalPng,
    };

    const manifest: Record<string, string> = {};
    for (const [filename, buf] of Object.entries(passFiles)) {
      const hash = crypto.createHash('sha1').update(buf).digest('hex');
      manifest[filename] = hash;
    }

    const manifestBuf = Buffer.from(JSON.stringify(manifest, null, 2), 'utf8');
    passFiles['manifest.json'] = manifestBuf;

    let isSigned = false;
    let signatureBuf: Buffer = Buffer.alloc(0);

    if (isApplePassSigningConfigured()) {
      try {
        const certPem = process.env.APPLE_PASS_CERT_PEM;
        const keyPem = process.env.APPLE_PASS_KEY_PEM;
        const wwdrPem = process.env.APPLE_WWDR_CERT_PEM;

        if (certPem && keyPem) {
          signatureBuf = createPkcs7Signature(manifestBuf, certPem, keyPem, wwdrPem);
          isSigned = true;
        }
      } catch (signingErr) {
        console.warn('[ApplePassSigner] Error al aplicar firma PKCS#7:', signingErr);
      }
    }

    if (!isSigned) {
      signatureBuf = Buffer.from('INDI_UNCONFIGURED_PASSKIT_SIGNATURE');
    }

    passFiles['signature'] = signatureBuf;
    const zipBuffer = createMemoryZip(passFiles);

    return {
      success: true,
      isSigned,
      buffer: zipBuffer,
      mimeType: 'application/vnd.apple.pkpass',
      filename: `${input.slug}.pkpass`,
      guidance: isSigned
        ? 'Pase de Apple Wallet firmado criptográficamente con éxito (PKCS#7 DER).'
        : 'Pase generado en modo desarrollo sin firma oficial. Para abrir en iOS Safari se requiere APPLE_PASS_CERT_PEM y KEY.',
    };
  } catch (error: any) {
    return {
      success: false,
      isSigned: false,
      mimeType: 'application/vnd.apple.pkpass',
      filename: `${input.slug}.pkpass`,
      error: error?.message || 'Error desconocido al empaquetar pase Apple Wallet',
    };
  }
}
