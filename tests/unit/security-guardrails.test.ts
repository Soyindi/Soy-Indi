import { describe, it, expect, vi, afterEach } from 'vitest';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';

describe('Security Guardrails & Multi-Tenant Protection', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
  });

  it('debe bloquear llamadas sin autenticación cuando NODE_ENV es production', async () => {
    // Simular entorno de producción
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

    const result = await getSafeAuthenticatedUserId(undefined);
    expect(result.userId).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Acceso no autorizado');
  });

  it('debe proveer un usuario de prueba en entorno de desarrollo local si no se provee userId', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';

    const result = await getSafeAuthenticatedUserId(undefined);
    expect(result.userId).toBeDefined();
    expect(typeof result.userId).toBe('string');
  });
});
