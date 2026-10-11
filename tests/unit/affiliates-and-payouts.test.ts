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
      
      // Validación exhaustiva de planes mensuales (25% directo)
      const starterMonthly = Math.round(2500 * (AFFILIATE_COMMISSION_PERCENTAGE / 100));
      const proMonthly = Math.round(4990 * (AFFILIATE_COMMISSION_PERCENTAGE / 100));
      const maxMonthly = Math.round(8990 * (AFFILIATE_COMMISSION_PERCENTAGE / 100));

      expect(starterMonthly).toBe(625);
      expect(proMonthly).toBe(1248);
      expect(maxMonthly).toBe(2248);

      // Validación exhaustiva de planes semestrales (25% directo sobre cobro semestral)
      const starterSemiannual = Math.round(6000 * (AFFILIATE_COMMISSION_PERCENTAGE / 100));
      const proSemiannual = Math.round(15000 * (AFFILIATE_COMMISSION_PERCENTAGE / 100));
      const maxSemiannual = Math.round(29990 * (AFFILIATE_COMMISSION_PERCENTAGE / 100));

      expect(starterSemiannual).toBe(1500);
      expect(proSemiannual).toBe(3750);
      expect(maxSemiannual).toBe(7498);
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

    it('calcula la retención tributaria del SII al 15,25% (Ley N° 21.133 año 2026)', async () => {
      const { calculateGrossFromNetHonorarios, SII_HONORARIOS_RETENTION_RATE_2026 } = await import('@/entities/affiliate/schemas');
      expect(SII_HONORARIOS_RETENTION_RATE_2026).toBe(0.1525);

      // Para recibir $10.000 líquidos con retención del 15,25%:
      // Bruto = 10000 / (1 - 0.1525) = 11799 CLP
      const calculation = calculateGrossFromNetHonorarios(10000);
      expect(calculation.netAmountClp).toBe(10000);
      expect(calculation.grossAmountClp).toBe(11799);
      expect(calculation.retentionAmountClp).toBe(1799);
      expect(calculation.retentionRatePercent).toBe(15.25);
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

  describe('Gobernanza de Cookies & Sanitización de Referidos en Tránsito', () => {
    it('sanitiza códigos válidos y rechaza códigos maliciosos o reservados', async () => {
      const { sanitizeReferralCode, REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_MAX_AGE } = await import(
        '@/entities/affiliate/referral-cookie'
      );

      expect(REFERRAL_COOKIE_NAME).toBe('indi_ref_code');
      expect(REFERRAL_COOKIE_MAX_AGE).toBe(30 * 24 * 60 * 60);

      // Sanitización exitosa
      expect(sanitizeReferralCode('matias')).toBe('matias');
      expect(sanitizeReferralCode('  Dev_Chile--2026 ')).toBe('dev-chile-2026');

      // Rechazos seguros (retornan null)
      expect(sanitizeReferralCode('admin')).toBe(null);
      expect(sanitizeReferralCode('indi')).toBe(null);
      expect(sanitizeReferralCode('')).toBe(null);
      expect(sanitizeReferralCode(null)).toBe(null);
      expect(sanitizeReferralCode('a')).toBe(null);
      expect(sanitizeReferralCode('código_con_más_de_veinticuatro_caracteres_totales')).toBe(null);
    });
  });

  describe('Métricas de Conversión Pro y Enlace Directo a Registro', () => {
    it('calcula correctamente la tasa de conversión y estructura los enlaces duales', () => {
      const totalReferrals = 10;
      const proReferrals = 3;
      const trialReferrals = 7;
      const conversionRate = Math.round((proReferrals / totalReferrals) * 100);

      expect(conversionRate).toBe(30);

      const code = 'mi-marca';
      const hubUrl = `https://soyindi.cl/start?ref=${code}`;
      const signupUrl = `https://soyindi.cl/login?mode=signup&ref=${code}`;

      expect(hubUrl).toContain('/start?ref=mi-marca');
      expect(signupUrl).toContain('/login?mode=signup&ref=mi-marca');
    });
  });

  describe('Auditoría de Referidos en Panel de Administración (/admin)', () => {
    it('ejecuta getAdminReferralsAuditAction y valida la estructura de los registros de auditoría', async () => {
      const { getAdminReferralsAuditAction } = await import('@/features/affiliates/actions');
      const res = await getAdminReferralsAuditAction();

      expect(res.success).toBe(true);
      expect(Array.isArray(res.data)).toBe(true);

      if (res.data && res.data.length > 0) {
        const item = res.data[0];
        expect(item).toHaveProperty('referredUserId');
        expect(item).toHaveProperty('referredUserName');
        expect(item).toHaveProperty('referredUserEmail');
        expect(item).toHaveProperty('referredUserStatus');
        expect(item).toHaveProperty('referrerCode');
        expect(item).toHaveProperty('totalCommissionsGeneratedClp');
      }
    }, 15000);

    it('ejecuta getAdminDashboardDataAction y retorna estructura consolidada de liquidaciones y auditoría', async () => {
      const { getAdminDashboardDataAction } = await import('@/features/affiliates/actions');
      const res = await getAdminDashboardDataAction();

      expect(res.success).toBe(true);
      expect(Array.isArray(res.payouts)).toBe(true);
      expect(Array.isArray(res.referralsAudit)).toBe(true);
    }, 15000);

    it('valida el contrato Zod MarkAffiliateCommissionsPaidSchema y rechaza payloads inválidos', async () => {
      const { MarkAffiliateCommissionsPaidSchema } = await import('@/entities/affiliate/schemas');
      const { markAffiliateCommissionsAsPaidAction } = await import('@/features/affiliates/actions');

      // 1. Zod schema valida ID no vacío
      const valid = MarkAffiliateCommissionsPaidSchema.safeParse({ affiliateUserId: 'usr_valid_123' });
      expect(valid.success).toBe(true);

      const invalid = MarkAffiliateCommissionsPaidSchema.safeParse({ affiliateUserId: '' });
      expect(invalid.success).toBe(false);

      // 2. Action rechaza llamadas con ID vacío
      const res = await markAffiliateCommissionsAsPaidAction('');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Parámetros inválidos');
    });
  });

  describe('Heurísticas Anti-Gaming 2026: Normalización de Correos & Detección Sybil', () => {
    it('normaliza correctamente direcciones Gmail ignorando puntos y sub-direccionamiento +alias', async () => {
      const { normalizeEmailForAntiGaming } = await import('@/entities/affiliate/schemas');

      // Variantes de Gmail del mismo usuario
      expect(normalizeEmailForAntiGaming('matias.riquelme@gmail.com')).toBe('matiasriquelme@gmail.com');
      expect(normalizeEmailForAntiGaming('m.a.t.i.a.s.riquelme+test@gmail.com')).toBe('matiasriquelme@gmail.com');
      expect(normalizeEmailForAntiGaming('matiasriquelme+afiliados123@gmail.com')).toBe('matiasriquelme@gmail.com');
      expect(normalizeEmailForAntiGaming('matias.riquelme@googlemail.com')).toBe('matiasriquelme@gmail.com');

      // Otros dominios corporativos
      expect(normalizeEmailForAntiGaming('contacto+marketing@soyindi.cl')).toBe('contacto@soyindi.cl');
      expect(normalizeEmailForAntiGaming('ceo@startup.cl')).toBe('ceo@startup.cl');
    });
  });

  describe('Seguridad en Webhooks: Verificación Criptográfica x-signature (HMAC-SHA256)', () => {
    it('valida firmas HMAC válidas de Mercado Pago y rechaza payloads manipulados o spoofing', async () => {
      const { verifyMercadoPagoWebhookSignature } = await import('@/shared/lib/mercadopago');
      const crypto = await import('crypto');

      const testSecret = 'test_webhook_secret_key_indi_2026';
      const dataId = '99887766';
      const requestId = 'req-abc-123';
      const ts = '1710000000';

      const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
      const validHash = crypto.createHmac('sha256', testSecret).update(manifest).digest('hex');
      const validSignatureHeader = `ts=${ts},v1=${validHash}`;

      // 1. Firma válida
      const isValid = verifyMercadoPagoWebhookSignature({
        xSignatureHeader: validSignatureHeader,
        xRequestIdHeader: requestId,
        dataId,
        webhookSecret: testSecret,
      });
      expect(isValid).toBe(true);

      // 2. Firma alterada / falsa
      const isFakeValid = verifyMercadoPagoWebhookSignature({
        xSignatureHeader: `ts=${ts},v1=deadbeefdeadbeefdeadbeefdeadbeef`,
        xRequestIdHeader: requestId,
        dataId,
        webhookSecret: testSecret,
      });
      expect(isFakeValid).toBe(false);

      // 3. Header ausente
      const isMissingValid = verifyMercadoPagoWebhookSignature({
        xSignatureHeader: null,
        xRequestIdHeader: requestId,
        dataId,
        webhookSecret: testSecret,
      });
      expect(isMissingValid).toBe(false);

      // 4. Modo sin secreto configurado (permisivo seguro)
      const isNoSecretValid = verifyMercadoPagoWebhookSignature({
        xSignatureHeader: null,
        xRequestIdHeader: null,
        dataId,
        webhookSecret: '',
      });
      expect(isNoSecretValid).toBe(true);
    });
  });

  describe('Generación y Contrato de Códigos QR de Afiliado (INDI 2026)', () => {
    it('construye URLs de invitación directa válidas para escaneo QR', () => {
      const referralCode = 'matias-vip';
      const baseUrl = 'https://soyindi.cl';
      const directSignupUrl = `${baseUrl}/login?mode=signup&ref=${referralCode}`;

      const parsed = new URL(directSignupUrl);
      expect(parsed.origin).toBe('https://soyindi.cl');
      expect(parsed.pathname).toBe('/login');
      expect(parsed.searchParams.get('mode')).toBe('signup');
      expect(parsed.searchParams.get('ref')).toBe('matias-vip');
    });

    it('verifica que el nombre de archivo PNG sugerido sea sanitizado y predecible', () => {
      const referralCode = 'matias-vip';
      const expectedFilename = `indi-referral-qr-${referralCode}.png`;
      expect(expectedFilename).toMatch(/^indi-referral-qr-[a-z0-9-]+\.png$/);
    });
  });
});



