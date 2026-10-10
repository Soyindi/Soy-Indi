import { describe, it, expect, beforeEach } from 'vitest';
import {
  isProviderAvailable,
  recordProviderFailure,
  recordProviderSuccess,
  generateRequestKey,
  getCachedResponse,
  setCachedResponse,
  withInFlightCoalescing,
} from '@/shared/lib/aiCircuitBreaker';

describe('AI Circuit Breaker & Adaptive Provider Pool (INDI 2026)', () => {
  it('inicializa los proveedores en estado disponible (CLOSED)', () => {
    expect(isProviderAvailable('groq')).toBe(true);
    expect(isProviderAvailable('nvidia')).toBe(true);
  });

  it('abre el circuito tras alcanzar el umbral de fallas consecutivas', () => {
    // Simular 3 fallas consecutivas
    recordProviderFailure('nvidia');
    recordProviderFailure('nvidia');
    recordProviderFailure('nvidia');

    // Debe abrirse y no permitir peticiones inmediatas
    expect(isProviderAvailable('nvidia')).toBe(false);

    // Tras registrar éxito, el circuito se restablece a cerrado
    recordProviderSuccess('nvidia');
    expect(isProviderAvailable('nvidia')).toBe(true);
  });

  it('genera claves de request deterministas para el mismo prompt', () => {
    const key1 = generateRequestKey(
      [{ role: 'user', content: 'Optimiza mi CV' }],
      { responseFormat: { type: 'json_object' } }
    );
    const key2 = generateRequestKey(
      [{ role: 'user', content: 'Optimiza mi CV' }],
      { responseFormat: { type: 'json_object' } }
    );
    const key3 = generateRequestKey(
      [{ role: 'user', content: 'Otro texto' }],
      { responseFormat: { type: 'json_object' } }
    );

    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
  });

  it('almacena y recupera respuestas desde la micro-caché semántica', () => {
    const testKey = 'test-cache-key-1';
    setCachedResponse(testKey, '{"suggestions": ["Opción 1"]}', 'groq/qwen3.8-27b');

    const cached = getCachedResponse(testKey);
    expect(cached).not.toBeNull();
    expect(cached?.content).toBe('{"suggestions": ["Opción 1"]}');
    expect(cached?.modelUsed).toContain('(cache)');
  });

  it('coalesce y deduplica llamadas concurrentes in-flight a la misma petición', async () => {
    let executionCount = 0;
    const fetchSimulator = async () => {
      executionCount++;
      await new Promise((r) => setTimeout(r, 20));
      return { result: 'ok' };
    };

    // Disparar 3 promesas idénticas en paralelo
    const [res1, res2, res3] = await Promise.all([
      withInFlightCoalescing('coalesce-key', fetchSimulator),
      withInFlightCoalescing('coalesce-key', fetchSimulator),
      withInFlightCoalescing('coalesce-key', fetchSimulator),
    ]);

    expect(res1.result).toBe('ok');
    expect(res2.result).toBe('ok');
    expect(res3.result).toBe('ok');
    // Solo se debe haber ejecutado 1 llamada real
    expect(executionCount).toBe(1);
  });
});
