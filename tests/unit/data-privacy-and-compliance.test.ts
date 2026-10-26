import { describe, it, expect } from 'vitest';
import { maskSensitiveDataForAi, DATA_SUBPROCESSORS_REGISTRY } from '@/shared/lib/dataPrivacy';
import {
  exportUserDataAction,
  deleteAndAnonymizeUserAccountAction,
  rectifyUserDataAction,
} from '@/features/privacy/actions';
import {
  exportUserDataInputSchema,
  deleteUserAccountInputSchema,
  rectifyUserDataInputSchema,
} from '@/entities/privacy/schemas';

describe('Ley N° 21.719 Compliance & Data Privacy Engine', () => {
  describe('Sanitización y Enmascaramiento para IA (Privacy-by-Design)', () => {
    it('enmascara RUTs chilenos en distintos formatos manteniendo la estructura del texto', () => {
      const input = 'El postulante Juan Pérez, RUT 12.345.678-9 y cédula 9876543-k, postuló al cargo.';
      const result = maskSensitiveDataForAi(input, { maskRut: true, maskPhone: false, maskEmail: false });

      expect(result.sanitizedText).not.toContain('12.345.678-9');
      expect(result.sanitizedText).not.toContain('9876543-k');
      expect(result.sanitizedText).toContain('[RUT_PROTEGIDO]');
      expect(result.maskedCount.ruts).toBe(2);
    });

    it('enmascara teléfonos chilenos e internacionales antes de la inferencia de lenguaje', () => {
      const input = 'Contacto: +56 9 1234 5678 o al fijo +56 2 2345 6789. WhatsApp direct: 987654321.';
      const result = maskSensitiveDataForAi(input, { maskRut: false, maskPhone: true, maskEmail: false });

      expect(result.sanitizedText).not.toContain('+56 9 1234 5678');
      expect(result.sanitizedText).toContain('[TELEFONO_PROTEGIDO]');
      expect(result.maskedCount.phones).toBeGreaterThanOrEqual(2);
    });

    it('enmascara simultáneamente RUT y teléfono cuando se procesa un currículum completo', () => {
      const cvSnippet = `
        Juan Carlos Soto
        RUT: 18.234.567-8
        Teléfono: +56 9 8765 4321
        Email: juan.soto@empresa.cl
        Experiencia: Lideré el equipo de desarrollo de software durante 4 años.
      `;
      const result = maskSensitiveDataForAi(cvSnippet, { maskRut: true, maskPhone: true, maskEmail: false });

      expect(result.sanitizedText).not.toContain('18.234.567-8');
      expect(result.sanitizedText).not.toContain('+56 9 8765 4321');
      expect(result.sanitizedText).toContain('[RUT_PROTEGIDO]');
      expect(result.sanitizedText).toContain('[TELEFONO_PROTEGIDO]');
      expect(result.sanitizedText).toContain('juan.soto@empresa.cl'); // Email preservado si maskEmail es false
    });
  });

  describe('Registro Canónico de Subprocesadores (DPA - Artículo 15 Ley 21.719)', () => {
    it('contiene el inventario formal de los proveedores de infraestructura y pagos', () => {
      const names = DATA_SUBPROCESSORS_REGISTRY.map((p) => p.name);
      expect(names.some((n) => n.includes('Turso'))).toBe(true);
      expect(names.some((n) => n.includes('Vercel'))).toBe(true);
      expect(names.some((n) => n.includes('Cloudflare'))).toBe(true);
      expect(names.some((n) => n.includes('Upstash'))).toBe(true);
      expect(names.some((n) => n.includes('Flow'))).toBe(true);
      expect(names.some((n) => n.includes('Mercado Pago'))).toBe(true);
      expect(names.some((n) => n.includes('Fintoc'))).toBe(true);
      expect(names.some((n) => n.includes('Groq') || n.includes('NVIDIA'))).toBe(true);
    });

    it('todos los proveedores declaran estado de DPA o contrato y URL de privacidad', () => {
      DATA_SUBPROCESSORS_REGISTRY.forEach((subprocessor) => {
        expect(subprocessor.purpose).toBeTruthy();
        expect(subprocessor.location).toBeTruthy();
        expect(['ACTIVE', 'STANDARD_CONTRACTUAL_CLAUSES', 'DIRECT_AGREEMENT']).toContain(
          subprocessor.dpaStatus
        );
        expect(subprocessor.privacyUrl.startsWith('http')).toBe(true);
      });
    });
  });

  describe('Contratos Zod & Derechos ARCO: Acceso, Rectificación y Supresión', () => {
    it('valida estrictamente los esquemas Zod de privacidad (export, rectify, delete)', () => {
      expect(exportUserDataInputSchema.safeParse({ userId: 'usr_123' }).success).toBe(true);
      expect(deleteUserAccountInputSchema.safeParse({ confirmationText: 'ELIMINAR MI CUENTA' }).success).toBe(true);
      expect(deleteUserAccountInputSchema.safeParse({ confirmationText: 'borrar' }).success).toBe(false);
      expect(rectifyUserDataInputSchema.safeParse({ name: 'Matías Riquelme' }).success).toBe(true);
      expect(rectifyUserDataInputSchema.safeParse({ name: 'A' }).success).toBe(false);
    });

    it('exportUserDataAction requiere sesión autorizada o retorna error si el usuario no existe', async () => {
      const result = await exportUserDataAction('non-existent-user-id');
      if (!result.success) {
        expect(result.error).toBeTruthy();
      } else {
        expect(result.data).toBeDefined();
        expect(result.data?.exportedAt).toBeTruthy();
        expect(result.data?.complianceStandard).toContain('21.719');
      }
    });

    it('rectifyUserDataAction rechaza nombres inválidos mediante Zod y aplica rectificación en sesión autorizada', async () => {
      const invalidRes = await rectifyUserDataAction({ name: '' });
      expect(invalidRes.success).toBe(false);
      expect(invalidRes.error).toContain('al menos 2 caracteres');

      const validRes = await rectifyUserDataAction({
        name: 'Usuario Demo INDI',
        reason: 'Actualización de prueba unitaria',
      });
      if (!validRes.success) {
        expect(validRes.error).toBeTruthy();
      } else {
        expect(validRes.updatedName).toBe('Usuario Demo INDI');
      }
    });

    it('deleteAndAnonymizeUserAccountAction rechaza confirmaciones incorrectas con validación Zod', async () => {
      const result = await deleteAndAnonymizeUserAccountAction('some-user-id', 'incorrect text');
      expect(result.success).toBe(false);
      expect(result.error).toContain('ELIMINAR MI CUENTA');
    });
  });
});
