import { describe, it, expect } from 'vitest';
import { generateApplePassJson, ApplePassInput } from '@/shared/lib/wallet/applePassGenerator';

describe('Apple Pass Generator (applePassGenerator)', () => {
  it('genera estructura pass.json válida con campos requeridos y código QR', () => {
    const input: ApplePassInput = {
      slug: 'matias-indio',
      title: 'Matías Riquelme',
      profession: 'Ingeniero de Software Principal',
    };

    const pass = generateApplePassJson(input);

    expect(pass.formatVersion).toBe(1);
    expect(pass.serialNumber).toBe('INDI-MATIAS-INDIO');
    expect(pass.organizationName).toBe('INDI');
    expect(pass.description).toBe('Tarjeta Digital de Matías Riquelme');
    expect(pass.barcodes).toBeDefined();
    expect(pass.barcodes.length).toBe(1);
    expect(pass.barcodes[0].format).toBe('PKBarcodeFormatQR');
    expect(pass.barcodes[0].message).toBe('https://soyindi.cl/c/matias-indio');
    expect(pass.generic.primaryFields[0].value).toBe('Matías Riquelme');
    expect(pass.generic.secondaryFields[0].value).toBe('Ingeniero de Software Principal');
  });

  it('incluye campos auxiliares (teléfono, correo, dirección) cuando están presentes', () => {
    const input: ApplePassInput = {
      slug: 'valeria-med',
      title: 'Dra. Valeria Gómez',
      profession: 'Neuróloga Clínica',
      phone: '+56912345678',
      email: 'valeria@clinica.cl',
      address: 'Av. Providencia 1234, Santiago',
    };

    const pass = generateApplePassJson(input);

    const auxFields = pass.generic.auxiliaryFields;
    expect(auxFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'phone', value: '+56912345678' }),
        expect.objectContaining({ key: 'email', value: 'valeria@clinica.cl' }),
      ])
    );

    const backFields = pass.generic.backFields;
    expect(backFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'address', value: 'Av. Providencia 1234, Santiago' }),
        expect.objectContaining({ key: 'cardUrl', value: 'https://soyindi.cl/c/valeria-med' }),
      ])
    );
  });

  it('omite campos opcionales limpiamente sin generar llaves nulas', () => {
    const input: ApplePassInput = {
      slug: 'pedro-silva',
      title: 'Pedro Silva',
      profession: 'Consultor Financiero',
      phone: null,
      email: undefined,
      address: null,
    };

    const pass = generateApplePassJson(input);

    expect(pass.generic.auxiliaryFields.length).toBe(0);
    const hasAddressInBack = pass.generic.backFields.some((f: any) => f.key === 'address');
    expect(hasAddressInBack).toBe(false);
  });
});
