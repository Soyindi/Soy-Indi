/**
 * Generador de Nómina Bancaria TEF para Bancos Chilenos (INDI 2026)
 * Estándar SBIF / CMF para transferencias masivas en lote:
 * Banco de Chile (Banconexión), Santander (Office Banking), BCI, BancoEstado.
 * 
 * Cumplimiento tributario Ley de Honorarios SII 2026:
 * Retención legal automática del 15,25% con cálculo del monto neto.
 */

export interface TefRecipient {
  rut: string;
  name: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  grossAmountClp: number;
  email?: string | null;
}

export interface TefPayrollSummary {
  csvContent: string;
  recordCount: number;
  totalGrossClp: number;
  totalWithholdingClp: number;
  totalNetClp: number;
  retentionRatePercent: number;
}

export const CHILEAN_BANK_CODES: Record<string, string> = {
  'banco de chile': '001',
  'banco chile': '001',
  'banco edwards': '001',
  'banco internacional': '009',
  'banco estado': '012',
  'bancoestado': '012',
  'scotiabank': '014',
  'scotiabank chile': '014',
  'bci': '016',
  'banco de credito e inversiones': '016',
  'bice': '028',
  'banco bice': '028',
  'santander': '037',
  'banco santander': '037',
  'itau': '039',
  'banco itau': '039',
  'security': '053',
  'banco security': '053',
  'falabella': '051',
  'banco falabella': '051',
  'ripley': '054',
  'banco ripley': '054',
  'consorcio': '055',
  'banco consorcio': '055',
  'tenpo': '071',
  'mach': '072',
  'coopeuch': '073',
};

export function getSbifBankCode(bankName: string): string {
  const normalized = bankName.toLowerCase().trim();
  for (const [key, code] of Object.entries(CHILEAN_BANK_CODES)) {
    if (normalized.includes(key)) return code;
  }
  return '001'; // Default Banco de Chile
}

export function getSbifAccountTypeCode(accountType: string): string {
  const norm = accountType.toLowerCase().trim();
  if (norm.includes('vista') || norm.includes('rut')) return '2'; // Cuenta Vista / CuentaRUT
  if (norm.includes('ahorro')) return '3'; // Cuenta de Ahorro
  return '1'; // Cuenta Corriente
}

export const SII_WITHHOLDING_RATE_2026 = 0.1525; // 15,25% legal 2026

/**
 * Genera el archivo CSV con BOM UTF-8 estructurado para importación directa en portales bancarios
 */
export function generateChileanTefCsv(recipients: TefRecipient[]): TefPayrollSummary {
  let totalGross = 0;
  let totalWithholding = 0;
  let totalNet = 0;

  const headers = [
    'RUT_BENEFICIARIO',
    'NOMBRE_BENEFICIARIO',
    'CODIGO_BANCO_SBIF',
    'TIPO_CUENTA',
    'NUMERO_CUENTA',
    'MONTO_BRUTO_CLP',
    'RETENCION_SII_15_25',
    'MONTO_NETO_A_TRANSFERIR',
    'EMAIL_NOTIFICACION',
    'GLOSA_TRANSFERENCIA',
  ];

  const rows = recipients.map((r) => {
    const gross = Math.max(0, Math.round(r.grossAmountClp));
    const withholding = Math.round(gross * SII_WITHHOLDING_RATE_2026);
    const net = gross - withholding;

    totalGross += gross;
    totalWithholding += withholding;
    totalNet += net;

    const bankCode = getSbifBankCode(r.bankName);
    const typeCode = getSbifAccountTypeCode(r.accountType);
    const cleanRut = r.rut.trim().toUpperCase();
    const cleanAccount = r.accountNumber.trim().replace(/[^0-9kK-]/g, '');
    const cleanEmail = r.email?.trim() || '';

    return [
      `"${cleanRut}"`,
      `"${r.name.trim().replace(/"/g, '""')}"`,
      `"${bankCode}"`,
      `"${typeCode}"`,
      `"${cleanAccount}"`,
      gross,
      withholding,
      net,
      `"${cleanEmail}"`,
      `"Comisiones INDI Afiliados"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  return {
    csvContent,
    recordCount: recipients.length,
    totalGrossClp: totalGross,
    totalWithholdingClp: totalWithholding,
    totalNetClp: totalNet,
    retentionRatePercent: 15.25,
  };
}
