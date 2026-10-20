import { describe, it, expect } from 'vitest';
import {
  generateChileanTefCsv,
  getSbifBankCode,
  getSbifAccountTypeCode,
  SII_WITHHOLDING_RATE_2026,
} from '@/shared/lib/payments/tefPayrollGenerator';

describe('Generador de Nómina Bancaria TEF & Cumplimiento SII (Chile)', () => {
  it('resuelve correctamente los códigos de banco según estándar SBIF / CMF', () => {
    expect(getSbifBankCode('Banco de Chile')).toBe('001');
    expect(getSbifBankCode('BancoEstado')).toBe('012');
    expect(getSbifBankCode('BCI')).toBe('016');
    expect(getSbifBankCode('Banco Santander')).toBe('037');
    expect(getSbifBankCode('Banco BICE')).toBe('028');
    expect(getSbifBankCode('Banco Falabella')).toBe('051');
    expect(getSbifBankCode('Scotiabank')).toBe('014');
  });

  it('resuelve los tipos de cuenta (1=Corriente, 2=Vista/RUT, 3=Ahorro)', () => {
    expect(getSbifAccountTypeCode('Cuenta Corriente')).toBe('1');
    expect(getSbifAccountTypeCode('Cuenta Vista')).toBe('2');
    expect(getSbifAccountTypeCode('CuentaRUT')).toBe('2');
    expect(getSbifAccountTypeCode('Cuenta de Ahorro')).toBe('3');
  });

  it('calcula con precisión matemática la retención del 15,25% del SII para el año 2026', () => {
    expect(SII_WITHHOLDING_RATE_2026).toBe(0.1525);

    const recipients = [
      {
        rut: '12.345.678-9',
        name: 'Ana María Solar',
        bankName: 'Banco de Chile',
        accountType: 'Cuenta Corriente',
        accountNumber: '00-12345-67',
        grossAmountClp: 100000,
        email: 'ana@ejemplo.cl',
      },
      {
        rut: '9.876.543-2',
        name: 'Carlos Mendoza',
        bankName: 'Banco Santander',
        accountType: 'Cuenta Vista',
        accountNumber: '98765432',
        grossAmountClp: 50000,
        email: 'carlos@ejemplo.cl',
      },
    ];

    const result = generateChileanTefCsv(recipients);

    expect(result.recordCount).toBe(2);
    expect(result.totalGrossClp).toBe(150000);
    // 100.000 * 0.1525 = 15.250; 50.000 * 0.1525 = 7.625 -> Total retención = 22.875
    expect(result.totalWithholdingClp).toBe(22875);
    // 150.000 - 22.875 = 127.125
    expect(result.totalNetClp).toBe(127125);
    expect(result.retentionRatePercent).toBe(15.25);
  });

  it('incluye BOM UTF-8 y cabeceras obligatorias para compatibilidad bancaria', () => {
    const recipients = [
      {
        rut: '11.222.333-4',
        name: 'Valeska Peña',
        bankName: 'BCI',
        accountType: 'Cuenta Corriente',
        accountNumber: '12345678',
        grossAmountClp: 20000,
      },
    ];

    const { csvContent } = generateChileanTefCsv(recipients);

    expect(csvContent.startsWith('\uFEFF')).toBe(true);
    expect(csvContent).toContain('RUT_BENEFICIARIO,NOMBRE_BENEFICIARIO,CODIGO_BANCO_SBIF');
    expect(csvContent).toContain('MONTO_BRUTO_CLP,RETENCION_SII_15_25,MONTO_NETO_A_TRANSFERIR');
    expect(csvContent).toContain('"016"'); // BCI
    expect(csvContent).toContain('"11.222.333-4"');
  });
});
