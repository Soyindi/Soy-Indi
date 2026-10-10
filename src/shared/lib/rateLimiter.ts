import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * ============================================================================
 * DISTRIBUTED RATE LIMITER & RESILIENCE SENTINEL (INDI 2026 Standards)
 * ============================================================================
 * Protege contra abusos, ataques DoS y vaciado de créditos de IA en Vercel Edge/Serverless.
 * 
 * Modos de Operación:
 * 1. Con Upstash Redis configurado: Sliding Window distribuido real entre todas las instancias.
 * 2. Sin Upstash o en desarrollo local: Fallback en memoria local determinista sin bloqueos.
 * ============================================================================
 */

let redisClient: Redis | null = null;

export function getUpstashRedis(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && url.startsWith('https://')) {
    try {
      redisClient = new Redis({
        url,
        token,
      });
      return redisClient;
    } catch (err) {
      console.warn('[Redis Sentinel Warning] No se pudo inicializar cliente Redis:', err);
      return null;
    }
  }

  return null;
}

// Limitador de IA: 12 solicitudes por minuto por usuario/IP
let aiRatelimiterInstance: Ratelimit | null = null;
// Limitador de Telemetría: 60 visitas por minuto por IP
let telemetryRatelimiterInstance: Ratelimit | null = null;

// Fallback in-memory LRU para testing y cuando Redis no esté disponible
const inMemoryFallbackStore = new Map<string, { count: number; expiresAt: number }>();

function checkInMemoryLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = inMemoryFallbackStore.get(key);

  if (!entry || entry.expiresAt <= now) {
    inMemoryFallbackStore.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Evalúa el límite de tasa para llamadas de Inteligencia Artificial (Groq / NVIDIA NIM / Gemini)
 * @param identifier Identificador único (userId, IP del cliente o hash de sesión)
 */
export async function checkAiRateLimit(identifier: string): Promise<{ success: boolean; remaining?: number; reset?: number }> {
  const redis = getUpstashRedis();

  if (redis) {
    if (!aiRatelimiterInstance) {
      aiRatelimiterInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(12, '60 s'),
        prefix: 'indi:ratelimit:ai',
        analytics: false,
      });
    }

    try {
      const result = await aiRatelimiterInstance.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (err) {
      console.warn('[RateLimit AI Warning] Error en consulta Redis, aplicando fallback permissive:', err);
      return { success: true };
    }
  }

  // Fallback local determinista: 12 requests / 60s
  const allowed = checkInMemoryLimit(`ai:${identifier}`, 12, 60_000);
  return { success: allowed };
}

/**
 * Evalúa el límite de tasa para peticiones de telemetría (/api/telemetry/view)
 */
export async function checkTelemetryRateLimit(identifier: string): Promise<{ success: boolean }> {
  const redis = getUpstashRedis();

  if (redis) {
    if (!telemetryRatelimiterInstance) {
      telemetryRatelimiterInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '60 s'),
        prefix: 'indi:ratelimit:telemetry',
        analytics: false,
      });
    }

    try {
      const result = await telemetryRatelimiterInstance.limit(identifier);
      return { success: result.success };
    } catch {
      return { success: true };
    }
  }

  const allowed = checkInMemoryLimit(`telemetry:${identifier}`, 60, 60_000);
  return { success: allowed };
}
