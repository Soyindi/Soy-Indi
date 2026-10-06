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
 * Resumen del estado de afiliado para el panel de usuario
 */
export interface AffiliateOverview {
  referralCode: string;
  referralUrl: string;
  commissionPercentage: number;
  totalReferralsCount: number;
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
