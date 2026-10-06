import { z } from 'zod';

/**
 * Entidades y tipos de bancos chilenos soportados
 */
export const CHILEAN_BANKS = [
  'Banco Estado',
  'Banco de Chile / Edwards',
  'Banco Santander',
  'BCI (Banco de Crédito e Inversiones)',
  'Scotiabank Chile',
  'Banco Itaú Chile',
  'Banco BICE',
  'Banco Security',
  'Banco Falabella',
  'Banco Ripley',
  'Banco Consorcio',
  'Tenpo Prepago',
  'Mach (BCI)',
  'Coopeuch',
] as const;

export const ACCOUNT_TYPES = [
  'Cuenta RUT',
  'Cuenta Vista',
  'Cuenta Corriente',
  'Cuenta de Ahorro',
] as const;

/**
 * Porcentaje de comisión estándar del programa de afiliados INDI (25%)
 */
export const AFFILIATE_COMMISSION_PERCENTAGE = 25;

/**
 * Calcula la próxima fecha de corte quincenal (día 1 o día 15 del mes)
 */
export function calculateNextPayoutDate(currentDate: Date = new Date()): string {
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  if (day < 15) {
    const nextDate = new Date(year, month, 15);
    return nextDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  } else {
    // Día 1 del mes siguiente
    const nextDate = new Date(year, month + 1, 1);
    return nextDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

/**
 * Validador estricto de RUT Chileno con algoritmo de dígito verificador módulo 11
 */
export function validateChileanRut(rutString: string): boolean {
  if (!rutString || typeof rutString !== 'string') return false;
  
  // Limpiar puntos, guiones y espacios
  const clean = rutString.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 8 || clean.length > 9) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let expectedDv = '0';
  if (remainder === 11) expectedDv = '0';
  else if (remainder === 10) expectedDv = 'K';
  else expectedDv = remainder.toString();

  return dv === expectedDv;
}

/**
 * Formateador de RUT Chileno (12.345.678-K)
 */
export function formatChileanRut(rutString: string): string {
  const clean = rutString.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

/**
 * Schema de formulario para datos bancarios de abono quincenal
 */
export const affiliateBankAccountSchema = z.object({
  bankName: z.enum(CHILEAN_BANKS, {
    message: 'Selecciona una institución bancaria válida en Chile',
  }),
  accountType: z.enum(ACCOUNT_TYPES, {
    message: 'Selecciona un tipo de cuenta válido',
  }),
  accountNumber: z.string().min(4, 'El número de cuenta debe tener al menos 4 dígitos').max(30),
  rut: z.string().refine((val) => validateChileanRut(val), {
    message: 'El RUT ingresado no es válido (ej: 12.345.678-9)',
  }),
  holderName: z.string().min(3, 'El nombre del titular es requerido').max(100),
});

export type AffiliateBankAccountInput = z.infer<typeof affiliateBankAccountSchema>;

/**
 * Códigos reservados del sistema que no pueden ser reclamados como códigos de referido
 */
export const RESERVED_REFERRAL_CODES = new Set([
  'admin',
  'api',
  'indi',
  'soyindi',
  'pro',
  'vip',
  'support',
  'help',
  'auth',
  'login',
  'signup',
  'start',
  'dashboard',
  'pricing',
  'checkout',
  'billing',
  'official',
  'team',
  'app',
  'null',
  'undefined',
]);

/**
 * Normaliza y formatea un código de referido (minúsculas, alfanumérico y guiones)
 */
export function formatReferralCode(rawCode: string): string {
  if (!rawCode) return '';
  return rawCode
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
}

/**
 * Verifica si un código de referido está en la lista de términos reservados
 */
export function isReservedReferralCode(code: string): boolean {
  if (!code) return false;
  return RESERVED_REFERRAL_CODES.has(code.toLowerCase().trim());
}

/**
 * Schema Zod estricto para validación de código de referido personalizado
 */
export const updateReferralCodeSchema = z.object({
  referralCode: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres.')
    .max(24, 'El código no puede superar los 24 caracteres.')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Solo se permiten letras minúsculas, números y guiones sencillos.')
    .refine((code) => !isReservedReferralCode(code), {
      message: 'Este código está reservado para el sistema.',
    }),
});

export type UpdateReferralCodeInput = z.infer<typeof updateReferralCodeSchema>;

/**
 * Resumen del estado de afiliado para el panel de usuario
 */
export interface AffiliateOverview {
  referralCode: string;
  referralUrl: string;        // Enlace al Onboarding Hub (/start?ref=CODIGO)
  directSignupUrl: string;    // Enlace directo al formulario de Registro (/login?mode=signup&ref=CODIGO)
  commissionPercentage: number;
  totalReferralsCount: number;
  proReferralsCount: number;   // Usuarios referidos que convirtieron a Plan Pro activo
  trialReferralsCount: number; // Usuarios referidos actualmente en prueba gratuita
  conversionRate: number;      // % de conversión a Pro (0 a 100)
  totalEarningsClp: number;
  pendingBalanceClp: number; // Por pagar en el próximo corte quincenal
  paidBalanceClp: number;    // Ya transferido históricamente
  nextPayoutDate: string;    // Próximo día 1 o 15 del mes
  bankAccount: AffiliateBankAccountInput | null;
  recentCommissions: {
    id: string;
    amountClp: number;
    status: 'pending' | 'payable' | 'paid';
    createdAt: Date;
    paidAt?: Date | null;
  }[];
}

/**
 * Resumen consolidado para el panel de administración
 */
export interface AdminAffiliatePayoutItem {
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  totalPayableClp: number;
  pendingCommissionsCount: number;
  bankAccount: AffiliateBankAccountInput | null;
}

