import { describe, it, expect } from 'vitest';
import { 
  validateChileanRut, 
  formatChileanRut, 
  affiliateBankAccountSchema, 
  CHILEAN_BANKS, 
  ACCOUNT_TYPES,
  calculateNextPayoutDate,
  AFFILIATE_COMMISSION_PERCENTAGE
} from '@/entities/affiliate/schemas';

describe('Programa de Afiliados & Pagos Quincenales (INDI 2026)', () => {
  describe('Algoritmo de Módulo 11 para RUT Chileno', () => {
    it('valida RUTs chilenos reales con formato y sin formato', () => {
      // Casos válidos reales matemáticos (Módulo 11)
      expect(validateChileanRut('11.111.111-1')).toBe(true);
      expect(validateChileanRut('111111111')).toBe(true);
      expect(validateChileanRut('18.000.002-K')).toBe(true);
      expect(validateChileanRut('18000002k')).toBe(true);
      expect(validateChileanRut('18.234.567-9')).toBe(true);
    });

    it('rechaza RUTs con dígito verificador inválido o longitudes erróneas', () => {
      expect(validateChileanRut('11.111.111-2')).toBe(false);
      expect(validateChileanRut('123')).toBe(false);
      expect(validateChileanRut('')).toBe(false);
      expect(validateChileanRut('abcdefgh-1')).toBe(false);
    });

    it('formatea correctamente un RUT limpio a formato estándar con puntos y guión', () => {
      expect(formatChileanRut('18000002K')).toBe('18.000.002-K');
      expect(formatChileanRut('111111111')).toBe('11.111.111-1');
    });
  });

  describe('Contrato Zod para Datos Bancarios', () => {
    it('valida correctamente datos bancarios completos de abono', () => {
      const valid = {
        bankName: 'Banco Estado',
        accountType: 'Cuenta RUT',
        accountNumber: '18000002',
        rut: '18.000.002-K',
        holderName: 'Matías Riquelme',
      };

      const result = affiliateBankAccountSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rechaza bancos no registrados o números de cuenta demasiado cortos', () => {
      const invalid = {
        bankName: 'Banco Imaginario Internacional',
        accountType: 'Cuenta RUT',
        accountNumber: '1',
        rut: '18.234.567-K',
        holderName: 'Matías Riquelme',
      };

      const result = affiliateBankAccountSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Lógica de Negocio y Liquidaciones Quincenales', () => {
    it('fija la comisión oficial en el 25% del cobro aprobado', () => {
      expect(AFFILIATE_COMMISSION_PERCENTAGE).toBe(25);
      
      // Comisión por plan mensual ($2.500 CLP)
      const monthlyCommission = Math.round(2500 * (AFFILIATE_COMMISSION_PERCENTAGE / 100));
      expect(monthlyCommission).toBe(625);

      // Comisión por plan semestral ($6.000 CLP)
      const semiannualCommission = Math.round(6000 * (AFFILIATE_COMMISSION_PERCENTAGE / 100));
      expect(semiannualCommission).toBe(1500);
    });

    it('calcula la próxima fecha de corte quincenal (día 1 o día 15)', () => {
      // Si hoy es día 5 de octubre
      const oct5 = new Date(2026, 9, 5);
      const nextFrom5 = calculateNextPayoutDate(oct5);
      expect(nextFrom5).toContain('15');

      // Si hoy es día 20 de octubre
      const oct20 = new Date(2026, 9, 20);
      const nextFrom20 = calculateNextPayoutDate(oct20);
      expect(nextFrom20).toContain('1');
    });
  });

  describe('Personalización de Códigos de Referido & Contratos Zod', () => {
    it('normaliza y formatea correctamente códigos ingresados por usuarios', async () => {
      const { formatReferralCode } = await import('@/entities/affiliate/schemas');
      expect(formatReferralCode('Matias Riquelme!')).toBe('matias-riquelme');
      expect(formatReferralCode('   dev-chile--2026   ')).toBe('dev-chile-2026');
      expect(formatReferralCode('código_con_acentos')).toBe('codigo-con-acentos');
    });

    it('identifica y protege códigos reservados del sistema', async () => {
      const { isReservedReferralCode } = await import('@/entities/affiliate/schemas');
      expect(isReservedReferralCode('admin')).toBe(true);
      expect(isReservedReferralCode('indi')).toBe(true);
      expect(isReservedReferralCode('pricing')).toBe(true);
      expect(isReservedReferralCode('mi-marca-personal')).toBe(false);
    });

    it('valida con updateReferralCodeSchema códigos válidos y rechaza inválidos o reservados', async () => {
      const { updateReferralCodeSchema } = await import('@/entities/affiliate/schemas');

      // Válidos
      expect(updateReferralCodeSchema.safeParse({ referralCode: 'matias' }).success).toBe(true);
      expect(updateReferralCodeSchema.safeParse({ referralCode: 'startup-pro' }).success).toBe(true);

      // Inválidos: muy corto (<3)
      expect(updateReferralCodeSchema.safeParse({ referralCode: 'ab' }).success).toBe(false);

      // Inválidos: muy largo (>24)
      expect(updateReferralCodeSchema.safeParse({ referralCode: 'este-codigo-es-demasiado-largo-para-el-sistema' }).success).toBe(false);

      // Inválidos: caracteres extraños
      expect(updateReferralCodeSchema.safeParse({ referralCode: 'codigo@123' }).success).toBe(false);

      // Inválidos: código reservado
      const reservedRes = updateReferralCodeSchema.safeParse({ referralCode: 'admin' });
      expect(reservedRes.success).toBe(false);
      if (!reservedRes.success) {
        expect(reservedRes.error.issues[0]?.message).toContain('reservado');
      }
    });
  });
});


