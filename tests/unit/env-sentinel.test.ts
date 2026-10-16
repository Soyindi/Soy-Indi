import { describe, it, expect } from 'vitest';
import { validateEnvironment } from '@/shared/lib/envSentinel';

describe('Environment Sentinel (Fail-Fast Env Checker)', () => {
  it('identifica correctamente cuando faltan variables críticas del servidor', () => {
    const mockEnv = {
      BETTER_AUTH_SECRET: '',
      TURSO_DATABASE_URL: '',
    };

    const result = validateEnvironment(mockEnv);
    expect(result.valid).toBe(false);
    expect(result.missingVars).toContain('BETTER_AUTH_SECRET');
    expect(result.missingVars).toContain('TURSO_DATABASE_URL');
  });

  it('valida como exitoso cuando las variables críticas requeridas están presentes', () => {
    const mockEnv = {
      BETTER_AUTH_SECRET: 'test-secret-key-32-chars-length-min',
      TURSO_DATABASE_URL: 'libsql://test-db-turso.io',
    };

    const result = validateEnvironment(mockEnv);
    expect(result.valid).toBe(true);
    expect(result.missingVars).toHaveLength(0);
  });

  it('emite advertencias para variables secundarias recomendadas sin bloquear el inicio', () => {
    const mockEnv = {
      BETTER_AUTH_SECRET: 'test-secret-key',
      TURSO_DATABASE_URL: 'libsql://test.io',
      // MERCADOPAGO_ACCESS_TOKEN y NEXT_PUBLIC_APP_URL ausentes
    };

    const result = validateEnvironment(mockEnv);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('MERCADOPAGO_ACCESS_TOKEN'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('NEXT_PUBLIC_APP_URL'))).toBe(true);
  });

  it('valida exitosamente un entorno completo de producción (Coolify / OCI)', () => {
    const fullProdEnv = {
      BETTER_AUTH_SECRET: '01234567890123456789012345678912',
      TURSO_DATABASE_URL: 'libsql://test.turso.io',
      TURSO_AUTH_TOKEN: 'turso-token',
      NEXT_PUBLIC_APP_URL: 'https://soyindi.cl',
      BETTER_AUTH_URL: 'https://soyindi.cl',
      FLOW_API_KEY: 'flow-key',
      FLOW_SECRET_KEY: 'flow-secret',
      MERCADOPAGO_ACCESS_TOKEN: 'mp-token',
      R2_BUCKET_NAME: 'indi-bucket',
      R2_ACCOUNT_ID: 'r2-acc',
    };

    const result = validateEnvironment(fullProdEnv);
    expect(result.valid).toBe(true);
    expect(result.missingVars).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
