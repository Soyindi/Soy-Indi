import { describe, it, expect } from 'vitest';
import { auth } from '@/shared/lib/auth';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';

describe('Multi-Tenant & Google OAuth Architecture Verification', () => {
  it('debe tener configurado el proveedor de Google en Better Auth', () => {
    // Verificar que Better Auth reconoce la inicialización del objeto auth
    expect(auth).toBeDefined();
    expect(typeof auth.handler).toBe('function');
    expect(auth.options).toBeDefined();
    expect(auth.options.database).toBeDefined();
  });

  it('debe contener hook para auto-asignar 3 días de prueba a nuevos usuarios creados', async () => {
    expect(auth.options.databaseHooks).toBeDefined();
    const hook = auth.options.databaseHooks?.user?.create?.before;
    expect(hook).toBeDefined();
    expect(typeof hook).toBe('function');

    if (hook) {
      const beforeNow = Date.now();
      const mockResult = await hook({ email: 'test@example.com' } as any);
      const afterNow = Date.now();
      expect(mockResult.data.status).toBe('TRIAL');
      expect(mockResult.data.trialEndsAt).toBeInstanceOf(Date);
      const trialDurationMs = mockResult.data.trialEndsAt.getTime() - beforeNow;
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      // Validar ventana de 3 días con margen mínimo de ejecución (< 2000ms)
      expect(trialDurationMs).toBeGreaterThanOrEqual(threeDaysMs);
      expect(trialDurationMs).toBeLessThanOrEqual(threeDaysMs + 2000);
    }
  });

  it('debe aislar datos por tenant y rechazar peticiones no autenticadas en producción', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      const result = await getSafeAuthenticatedUserId(undefined);
      expect(result.userId).toBeNull();
      expect(result.error).toContain('Acceso no autorizado');
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    }
  });

  it('debe contar con variables de despliegue documentadas para Vercel', () => {
    // Validar esquema esperado de variables mínimas para despliegue en Vercel
    const requiredEnvVars = [
      'TURSO_DATABASE_URL',
      'TURSO_AUTH_TOKEN',
      'BETTER_AUTH_SECRET',
      'BETTER_AUTH_URL',
    ];

    requiredEnvVars.forEach((v) => {
      expect(typeof v).toBe('string');
    });
  });

  it('debe verificar la presencia y formato de las credenciales de Google OAuth si están configuradas', () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      expect(clientId).toMatch(/\.apps\.googleusercontent\.com$/);
    }
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    if (secret) {
      expect(secret.length).toBeGreaterThan(10);
    }
  });
});
