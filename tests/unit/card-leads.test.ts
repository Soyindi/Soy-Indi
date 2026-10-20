import { describe, it, expect, vi } from 'vitest';
import { submitCardLeadAction } from '@/features/card-builder/lead-actions';

describe('Captura Bidireccional de Leads (Mini-CRM)', () => {
  it('rechaza envíos sin nombre o con nombre menor a 2 caracteres', async () => {
    const res = await submitCardLeadAction({
      cardId: 'card-123',
      name: 'A',
      phone: '+56912345678',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('rechaza envíos que omitan tanto teléfono como email', async () => {
    const res = await submitCardLeadAction({
      cardId: 'card-123',
      name: 'Carolina Gómez',
      phone: '',
      email: '',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Debes proporcionar al menos un teléfono de contacto o un correo electrónico');
  });

  it('rechaza formatos de email inválidos', async () => {
    const res = await submitCardLeadAction({
      cardId: 'card-123',
      name: 'Esteban Lagos',
      email: 'correo-invalido-sin-arroba',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Formato de correo electrónico inválido');
  });

  it('retorna error amigable si la tarjeta no existe o está inactiva', async () => {
    const res = await submitCardLeadAction({
      cardId: 'non-existent-card-id-xyz',
      name: 'Rodrigo Fuentes',
      phone: '+56987654321',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('La tarjeta no existe o se encuentra inactiva');
  });

  it('permite el intercambio de contacto en modo demo sin errores', async () => {
    const res = await submitCardLeadAction({
      cardId: 'demo',
      name: 'Gabriel Oyarzun',
      phone: '+56939540674',
      email: 'gabrieloyarzun1509@gmail.com',
      note: 'Contacto de prueba',
    });

    expect(res.success).toBe(true);
    expect(res.leadId).toBeDefined();
  });
});
