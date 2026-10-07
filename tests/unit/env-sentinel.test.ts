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
      // MP_ACCESS_TOKEN ausente
    };

    const result = validateEnvironment(mockEnv);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('MP_ACCESS_TOKEN'))).toBe(true);
  });
});
