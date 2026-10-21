/**
 * Adaptador de Firma Criptográfica para Google Wallet (Generic Passes API & JWT RS256)
 * INDI Platform 2026 - Feature-Sliced Design (@/shared/lib/wallet)
 *
 * Cumple con los estándares oficiales de Google Pay & Wallet Console:
 * - Generación de Generic Class y Generic Object
 * - Firma asimétrica RS256 con Service Account de Google Cloud
 * - Construcción de URL deep link: https://pay.google.com/gp/v/save/<jwt>
 * - Degradación segura cuando las credenciales no están configuradas
 */

import crypto from 'node:crypto';

export interface GoogleWalletInput {
  slug: string;
  title: string;
  profession: string;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  websiteUrl?: string | null;
  address?: string | null;
  backgroundColorHex?: string;
}

export interface GoogleWalletSignerResult {
  success: boolean;
  isSigned: boolean;
  saveUrl: string | null;
  jwt?: string;
  error?: string;
  guidance: string;
}

/**
 * Convierte un string o buffer a formato Base64URL (RFC 7515)
 */
function toBase64Url(input: string | Buffer): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Verifica si las credenciales de Google Wallet están configuradas
 */
export function isGoogleWalletSigningConfigured(): boolean {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const serviceAccountKey = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_WALLET_PRIVATE_KEY;
  return Boolean(issuerId && serviceAccountKey);
}

/**
 * Genera la estructura de Generic Object de Google Wallet
 */
export function generateGoogleWalletGenericObject(input: GoogleWalletInput, issuerId: string) {
  const canonicalUrl = `https://soyindi.cl/c/${input.slug}`;
  const classId = `${issuerId}.indi_business_card_v1`;
  const objectId = `${issuerId}.${input.slug.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  return {
    id: objectId,
    classId: classId,
    logo: {
      sourceUri: {
        uri: 'https://soyindi.cl/brand/indi-logo-1024.png',
      },
      contentDescription: {
        defaultValue: {
          language: 'es-419',
          value: 'INDI • Identidad Digital',
        },
      },
    },
    cardTitle: {
      defaultValue: {
        language: 'es-419',
        value: 'INDI • TARJETA PROFESIONAL',
      },
    },
    header: {
      defaultValue: {
        language: 'es-419',
        value: input.title,
      },
    },
    subheader: {
      defaultValue: {
        language: 'es-419',
        value: input.profession,
      },
    },
    barcode: {
      type: 'QR_CODE',
      value: canonicalUrl,
      alternateText: canonicalUrl,
    },
    hexBackgroundColor: input.backgroundColorHex || '#0f172a',
    linksModuleData: {
      uris: [
        {
          uri: canonicalUrl,
          description: 'Ver Perfil Oficial en INDI',
        },
        ...(input.phone
          ? [
              {
                uri: `https://wa.me/${input.phone.replace(/[^0-9]/g, '')}`,
                description: 'Enviar WhatsApp',
              },
            ]
          : []),
      ],
    },
  };
}

/**
 * Genera la URL de guardado en Google Wallet (Save to Google Wallet)
 * Si hay credenciales de Service Account, firma el JWT con RS256.
 */
export function buildGoogleWalletSaveUrl(input: GoogleWalletInput): GoogleWalletSignerResult {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const privateKeyRaw = process.env.GOOGLE_WALLET_PRIVATE_KEY;
  const serviceAccountJson = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY;

  let clientEmail = process.env.GOOGLE_WALLET_CLIENT_EMAIL;
  let privateKey = privateKeyRaw;

  // Si se proporcionó el archivo JSON del Service Account completo
  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      clientEmail = parsed.client_email || clientEmail;
      privateKey = parsed.private_key || privateKey;
    } catch {
      // Intento de decodificación Base64 si no es JSON directo
      try {
        const decoded = Buffer.from(serviceAccountJson, 'base64').toString('utf8');
        const parsed = JSON.parse(decoded);
        clientEmail = parsed.client_email || clientEmail;
        privateKey = parsed.private_key || privateKey;
      } catch {
        // Ignorar error de parsing
      }
    }
  }

  // Si no contamos con credenciales oficiales de Google Cloud
  if (!issuerId || !clientEmail || !privateKey) {
    return {
      success: false,
      isSigned: false,
      saveUrl: null,
      guidance:
        'Credenciales de Google Wallet no configuradas. Se requiere GOOGLE_WALLET_ISSUER_ID y GOOGLE_WALLET_SERVICE_ACCOUNT_KEY.',
    };
  }

  try {
    const genericObject = generateGoogleWalletGenericObject(input, issuerId);

    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const payload = {
      iss: clientEmail,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: ['https://soyindi.cl'],
      payload: {
        genericObjects: [genericObject],
      },
    };

    const encodedHeader = toBase64Url(JSON.stringify(header));
    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const messageToSign = `${encodedHeader}.${encodedPayload}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(messageToSign);
    const signature = signer.sign(privateKey);
    const encodedSignature = toBase64Url(signature);

    const jwt = `${messageToSign}.${encodedSignature}`;
    const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;

    return {
      success: true,
      isSigned: true,
      saveUrl,
      jwt,
      guidance: 'URL de guardado en Google Wallet firmada criptográficamente con éxito con RS256.',
    };
  } catch (error: any) {
    return {
      success: false,
      isSigned: false,
      saveUrl: null,
      error: error?.message || 'Error al firmar JWT de Google Wallet',
      guidance: 'Falló la firma criptográfica con la clave privada proporcionada.',
    };
  }
}
