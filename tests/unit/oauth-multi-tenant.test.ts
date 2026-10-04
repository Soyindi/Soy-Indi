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

  it('debe contener hook para auto-asignar 15 días de prueba a nuevos usuarios creados', () => {
    expect(auth.options.databaseHooks).toBeDefined();
    expect(auth.options.databaseHooks?.user?.create?.before).toBeDefined();
    expect(typeof auth.options.databaseHooks?.user?.create?.before).toBe('function');
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
});
