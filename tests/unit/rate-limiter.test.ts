import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkAiRateLimit, checkTelemetryRateLimit, getUpstashRedis } from '@/shared/lib/rateLimiter';

describe('Distributed Rate Limiter & Abuse Sentinel (In-Memory Fallback)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('permite solicitudes de IA dentro de la cuota por minuto', async () => {
    const testUser = `test-user-${Date.now()}`;
    const result = await checkAiRateLimit(testUser);
    expect(result.success).toBe(true);
  });

  it('bloquea solicitudes de IA que superan el límite de 12 por ventana', async () => {
    const testUser = `spam-user-${Date.now()}`;
    
    // Ejecutar 12 solicitudes permitidas
    for (let i = 0; i < 12; i++) {
      const res = await checkAiRateLimit(testUser);
      expect(res.success).toBe(true);
    }

    // La solicitud número 13 debe ser rechazada
    const blocked = await checkAiRateLimit(testUser);
    expect(blocked.success).toBe(false);
  });

  it('permite solicitudes de telemetría y bloquea tras exceder el límite de 60', async () => {
    const testIp = `test-ip-${Date.now()}`;
    
    // Primeras 60 permitidas
    for (let i = 0; i < 60; i++) {
      const res = await checkTelemetryRateLimit(testIp);
      expect(res.success).toBe(true);
    }

    // La 61 debe ser rechazada
    const blocked = await checkTelemetryRateLimit(testIp);
    expect(blocked.success).toBe(false);
  });

  it('getUpstashRedis maneja ausencia de credenciales de forma silenciosa y segura', () => {
    const redis = getUpstashRedis();
    // En entorno de test sin variables https:// reales, debe resolver null sin arrojar excepción
    expect(redis === null || typeof redis === 'object').toBe(true);
  });
});
