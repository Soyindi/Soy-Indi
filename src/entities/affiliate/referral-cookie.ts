import { z } from 'zod';
import { formatReferralCode, isReservedReferralCode } from './schemas';

export const REFERRAL_COOKIE_NAME = 'indi_ref_code';
export const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 días en segundos

/**
 * Esquema Zod de validación y sanitización para códigos de referido en tránsito
 * (searchParams, cookies, headers)
 */
export const ReferralCodeParamSchema = z
  .string()
  .min(3)
  .max(24)
  .transform((val) => formatReferralCode(val))
  .refine((code) => code.length >= 3 && !isReservedReferralCode(code), {
    message: 'Código de referido inválido o reservado',
  });

/**
 * Sanitiza un código de referido de manera segura. Si es inválido o reservado, retorna null.
 */
export function sanitizeReferralCode(rawCode?: string | null): string | null {
  if (!rawCode) return null;
  const parsed = ReferralCodeParamSchema.safeParse(rawCode);
  if (!parsed.success) return null;
  return parsed.data;
}
