/**
 * ============================================================================
 * DATA PRIVACY & SANITIZATION ENGINE (Ley N° 21.719 - Chile 2026)
 * ============================================================================
 * Funciones de sanitización de datos personales y enmascaramiento antes de
 * enviar texto a modelos externos de IA o logs.
 * Cumplimiento de Principios de Minimización, Finalidad y Confidencialidad.
 * ============================================================================
 */

/**
 * Expresión regular para detectar RUTs chilenos con o sin puntos y con guion.
 * Ejemplos: 12.345.678-9, 12345678-k, 9.876.543-K
 */
export const RUT_REGEX = /\b(\d{1,2}(?:\.?\d{3}){2}-[\dkK])\b/g;

/**
 * Expresión regular para detectar números de teléfono chilenos e internacionales.
 * Ejemplos: +56 9 1234 5678, +56912345678, 912345678, (56) 9 1234-5678
 */
export const PHONE_REGEX = /(?:\+?56\s?9|\+?56\s?2|\b9)\s?\d{4}[-\s]?\d{4}\b/g;

/**
 * Expresión regular estándar para emails
 */
export const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;

export interface SanitizationResult {
  sanitizedText: string;
  maskedCount: {
    ruts: number;
    phones: number;
    emails: number;
  };
}

/**
 * Enmascara RUT, teléfonos y correos electrónicos en un texto libre
 * antes de enviarlo a proveedores de IA (Groq, NVIDIA NIM, OpenAI, etc.).
 * 
 * Reemplaza datos sensibles con tokens semánticos preservando la estructura
 * sintáctica y el contexto para que el LLM no pierda coherencia de redacción.
 */
export function maskSensitiveDataForAi(
  text: string,
  options: {
    maskRut?: boolean;
    maskPhone?: boolean;
    maskEmail?: boolean;
  } = { maskRut: true, maskPhone: true, maskEmail: false }
): SanitizationResult {
  if (!text) {
    return {
      sanitizedText: '',
      maskedCount: { ruts: 0, phones: 0, emails: 0 },
    };
  }

  let sanitized = text;
  let rutMatches = 0;
  let phoneMatches = 0;
  let emailMatches = 0;

  if (options.maskRut) {
    sanitized = sanitized.replace(RUT_REGEX, () => {
      rutMatches++;
      return '[RUT_PROTEGIDO]';
    });
  }

  if (options.maskPhone) {
    sanitized = sanitized.replace(PHONE_REGEX, () => {
      phoneMatches++;
      return '[TELEFONO_PROTEGIDO]';
    });
  }

  if (options.maskEmail) {
    sanitized = sanitized.replace(EMAIL_REGEX, () => {
      emailMatches++;
      return '[EMAIL_PROTEGIDO]';
    });
  }

  return {
    sanitizedText: sanitized,
    maskedCount: {
      ruts: rutMatches,
      phones: phoneMatches,
      emails: emailMatches,
    },
  };
}

/**
 * Inventario canónico de subprocesadores y encargados de datos (DPA - Data Processing Agreement)
 * Exigido formalmente por el Artículo 15 de la Ley 21.719.
 */
export interface DataSubprocessor {
  name: string;
  purpose: string;
  location: string;
  dpaStatus: 'ACTIVE' | 'STANDARD_CONTRACTUAL_CLAUSES' | 'DIRECT_AGREEMENT';
  privacyUrl: string;
}

export const DATA_SUBPROCESSORS_REGISTRY: DataSubprocessor[] = [
  {
    name: 'Turso (ChiselStrike Inc.)',
    purpose: 'Base de datos serverless LibSQL SQLite (persistencia estructurada)',
    location: 'EE.UU. / AWS Edge Réplicas',
    dpaStatus: 'STANDARD_CONTRACTUAL_CLAUSES',
    privacyUrl: 'https://turso.tech/privacy',
  },
  {
    name: 'Vercel Inc.',
    purpose: 'Hosting de aplicaciones Next.js App Router, Edge Middleware y CDN',
    location: 'EE.UU. / Global Edge Network',
    dpaStatus: 'STANDARD_CONTRACTUAL_CLAUSES',
    privacyUrl: 'https://vercel.com/legal/privacy-policy',
  },
  {
    name: 'Cloudflare Inc.',
    purpose: 'Almacenamiento de imágenes R2 y distribución de assets CDN ($0 Egress)',
    location: 'EE.UU. / Global Anycast Network',
    dpaStatus: 'STANDARD_CONTRACTUAL_CLAUSES',
    privacyUrl: 'https://www.cloudflare.com/privacypolicy/',
  },
  {
    name: 'Upstash Inc.',
    purpose: 'Rate limiting distribuido y protección de endpoints vía Redis serverless',
    location: 'EE.UU. (AWS us-east-1)',
    dpaStatus: 'STANDARD_CONTRACTUAL_CLAUSES',
    privacyUrl: 'https://upstash.com/trust/privacy.pdf',
  },
  {
    name: 'Flow Pagos S.A. (Flow.cl)',
    purpose: 'Pasarela de pagos en pesos chilenos (Webpay Plus, Servipag, Multicaja)',
    location: 'Chile (Regulada por CMF)',
    dpaStatus: 'DIRECT_AGREEMENT',
    privacyUrl: 'https://www.flow.cl/terminos.php',
  },
  {
    name: 'Mercado Pago / MercadoLibre Chile Ltda.',
    purpose: 'Pasarela secundaria de suscripciones y pagos recurrentes con tarjeta',
    location: 'Chile / Argentina (Regulada por CMF)',
    dpaStatus: 'DIRECT_AGREEMENT',
    privacyUrl: 'https://www.mercadopago.cl/privacidad',
  },
  {
    name: 'Fintoc SpA',
    purpose: 'Iniciación de transferencias bancarias directas A2A en Chile',
    location: 'Chile (Regulada por CMF)',
    dpaStatus: 'DIRECT_AGREEMENT',
    privacyUrl: 'https://fintoc.com/privacidad',
  },
  {
    name: 'Groq Inc. / NVIDIA Enterprise',
    purpose: 'Inferencia de lenguaje para estructuración de CVs STAR y títulos de diapositivas',
    location: 'EE.UU.',
    dpaStatus: 'STANDARD_CONTRACTUAL_CLAUSES',
    privacyUrl: 'https://groq.com/privacy-policy/',
  },
];
