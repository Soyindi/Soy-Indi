import { z } from 'zod';

/**
 * ============================================================================
 * GOBERNANZA REGULATORIA Y COMPLIANCE LEGAL CHILE 2026
 * ============================================================================
 * Marco normativo cubierto:
 * 1. Ley N° 21.719 sobre Protección de los Datos Personales (Arts. 4, 11, 14 ter,
 *    14 quáter, 14 quinquies, 14 sexies y 15).
 * 2. Reglamento de Comercio Electrónico (Decreto N° 14 del Ministerio de Economía)
 *    y Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
 * 3. Ley Marco de Ciberseguridad N° 21.663 y Decreto N° 662.
 * ============================================================================
 */

export interface LegalEntityIdentification {
  tradeName: string;
  legalName: string;
  rut: string;
  legalAddress: string;
  supportEmail: string;
  dpoEmail: string;
  dpoOfficerName: string;
  legalRepresentative: string;
  contactPhone: string;
  websiteType: string;
  canonicalDomain: string;
  policyVersion: string;
  lastUpdatedDate: string;
}

/**
 * Datos oficiales parametrizables del Responsable del Tratamiento y Proveedor (Decreto N° 14 Art. 3 y Ley 21.719 Art. 14 ter).
 * Puedes actualizar estos valores vía variables de entorno o directamente en este contrato canónico.
 */
export const LEGAL_ENTITY_CONFIG: LegalEntityIdentification = {
  tradeName: 'INDI (Soyindi)',
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || 'INDI SpA (En formalización societaria / Matías Riquelme Cárdenas)',
  rut: process.env.NEXT_PUBLIC_LEGAL_RUT || 'Por completar en registro tributario SII (RUT Empresa / Titular)',
  legalAddress: process.env.NEXT_PUBLIC_LEGAL_ADDRESS || 'Punta Arenas / Santiago, República de Chile',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'contacto@soyindi.cl',
  dpoEmail: process.env.NEXT_PUBLIC_DPO_EMAIL || 'privacidad@soyindi.cl',
  dpoOfficerName: process.env.NEXT_PUBLIC_DPO_NAME || 'Delegado de Protección de Datos (DPO) INDI — Canal ARCOP',
  legalRepresentative: process.env.NEXT_PUBLIC_LEGAL_REP || 'Matías Riquelme Cárdenas',
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+56 9 8535 0038',
  websiteType: 'Plataforma SaaS de Identidad Profesional, Tarjetas Digitales QR/NFC y Smart CV ATS',
  canonicalDomain: 'https://soyindi.cl',
  policyVersion: 'v2026.4',
  lastUpdatedDate: '8 de noviembre de 2026',
};

/**
 * Plazos legales obligatorios de respuesta para solicitudes ARCOP (Ley N° 21.719 Art. 11)
 */
export const ARCOP_LEGAL_SLA = {
  standardResponseCalendarDays: 30,
  maxExtensionCalendarDays: 30,
  temporaryBlockBusinessDays: 2,
  retractPeriodCalendarDays: 10,
  legalWarrantyMonths: 6,
} as const;

/**
 * Esquema Zod para el registro auditable de Consentimiento de Cookies (CMP Opt-In Estricto)
 */
export const cookieConsentCategoriesSchema = z.object({
  strictlyNecessary: z.literal(true),
  functional: z.boolean().default(false),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false),
});

export const cookieConsentRecordSchema = z.object({
  consentId: z.string().min(8),
  policyVersion: z.string().min(1),
  timestampIso: z.string().datetime(),
  anonymizedIp: z.string().default('0.0.0.0/24'),
  userAgentSummary: z.string().max(180).optional(),
  categories: cookieConsentCategoriesSchema,
  interactionMethod: z.enum(['accept_all', 'reject_all', 'custom_granular', 'revoked']),
});

export type CookieConsentCategories = z.infer<typeof cookieConsentCategoriesSchema>;
export type CookieConsentRecord = z.infer<typeof cookieConsentRecordSchema>;

export const COOKIE_CONSENT_STORAGE_KEY = 'indi_cmp_consent_v2026';

/**
 * Anonimiza una dirección IPv4 o IPv6 truncando el último octeto/segmento
 * para cumplir con el principio de minimización en logs de consentimiento.
 */
export function anonymizeIpAddress(rawIp: string | null | undefined): string {
  if (!rawIp || typeof rawIp !== 'string') {
    return '0.0.0.0/24';
  }
  const trimmed = rawIp.split(',')[0]?.trim() || '';
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
    }
  }
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').slice(0, 4);
    return `${parts.join(':')}::/64`;
  }
  return '0.0.0.0/24';
}

/**
 * Construye un registro determinista y auditable de consentimiento CMP Opt-In.
 */
export function buildConsentRecord(params: {
  categories: Omit<CookieConsentCategories, 'strictlyNecessary'>;
  interactionMethod: CookieConsentRecord['interactionMethod'];
  rawIp?: string | null;
  userAgent?: string | null;
}): CookieConsentRecord {
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return {
    consentId: `cmp_${Date.now()}_${randomSuffix}`,
    policyVersion: LEGAL_ENTITY_CONFIG.policyVersion,
    timestampIso: new Date().toISOString(),
    anonymizedIp: anonymizeIpAddress(params.rawIp),
    userAgentSummary: params.userAgent ? params.userAgent.slice(0, 180) : undefined,
    categories: {
      strictlyNecessary: true,
      functional: Boolean(params.categories.functional),
      analytics: Boolean(params.categories.analytics),
      marketing: Boolean(params.categories.marketing),
    },
    interactionMethod: params.interactionMethod,
  };
}
