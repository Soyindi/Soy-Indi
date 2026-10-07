import { describe, it, expect } from 'vitest';
import { normalizeChileanPhone, getWhatsAppDigits } from '@/shared/lib/phone';

describe('Phone Normalization & E.164 Standard (INDI 2026)', () => {
  it('normaliza números móviles chilenos estándar de 9 dígitos a formato E.164 (+569XXXXXXXX)', () => {
    expect(normalizeChileanPhone('912345678')).toBe('+56912345678');
    expect(normalizeChileanPhone(' 9 8765 4321 ')).toBe('+56987654321');
    expect(normalizeChileanPhone('9-8765-4321')).toBe('+56987654321');
  });

  it('respeta números que ya vienen con código de país 56 o +56', () => {
    expect(normalizeChileanPhone('+56912345678')).toBe('+56912345678');
    expect(normalizeChileanPhone('56912345678')).toBe('+56912345678');
    expect(normalizeChileanPhone('+56 9 8888 7777')).toBe('+56988887777');
  });

  it('maneja teléfonos fijos chilenos de 9 dígitos (ej. Santiago 22XXXXXXX o regiones)', () => {
    expect(normalizeChileanPhone('223456789')).toBe('+56223456789');
  });

  it('extrae dígitos limpios para enlaces directos de WhatsApp', () => {
    expect(getWhatsAppDigits('+56 9 1234 5678')).toBe('56912345678');
    expect(getWhatsAppDigits('912345678')).toBe('56912345678');
  });

  it('retorna cadena vacía ante valores nulos, indefinidos o sin dígitos válidos', () => {
    expect(normalizeChileanPhone(null)).toBe('');
    expect(normalizeChileanPhone(undefined)).toBe('');
    expect(normalizeChileanPhone('')).toBe('');
    expect(normalizeChileanPhone('   ---   ')).toBe('');
    expect(getWhatsAppDigits(null)).toBe('');
  });
});
