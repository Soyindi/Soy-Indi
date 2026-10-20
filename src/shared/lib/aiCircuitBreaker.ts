/**
 * ============================================================================
 * AI CIRCUIT BREAKER & ADAPTIVE PROVIDER POOL (INDI 2026 Standards)
 * ============================================================================
 * Previene el colapso de las APIs de IA (Groq, NVIDIA NIM, Gemini, OpenRouter)
 * implementando:
 * 1. Circuit Breaker Stateful (CLOSED -> OPEN -> HALF_OPEN).
 *    Si un proveedor acumula fallas consecutivas (ej. 429 Rate Limit, 500, timeouts),
 *    se aísla temporalmente durante un cooldown para no desperdiciar tiempo de respuesta
 *    del usuario ni colapsar las cuotas.
 * 2. Deduplicación In-Flight (Request Coalescing):
 *    Peticiones idénticas simultáneas comparten la misma promesa.
 * 3. Micro-Caché Semántica LRU en Memoria:
 *    Consultas frecuentes del mismo prompt devuelven el resultado instantáneamente (<1ms).
 * ============================================================================
 */

import { getUpstashRedis } from './rateLimiter';

export interface CircuitState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

const CIRCUIT_CONFIG = {
  FAILURE_THRESHOLD: 3,         // Abrir circuito tras 3 fallos consecutivos
  RESET_TIMEOUT_MS: 30000,      // Enfriamiento de 30 segundos antes de reintentar (HALF_OPEN)
  CACHE_MAX_ENTRIES: 100,       // Máximo 100 respuestas en micro-caché
  CACHE_TTL_MS: 10 * 60 * 1000, // 10 minutos de vigencia para prompts idénticos
};

// Estado en memoria de los circuitos por proveedor (fallback local y sincronización ultra-rápida)
const providerCircuits: Record<string, CircuitState> = {
  groq: { failures: 0, lastFailureTime: 0, isOpen: false },
  nvidia: { failures: 0, lastFailureTime: 0, isOpen: false },
  gemini: { failures: 0, lastFailureTime: 0, isOpen: false },
  openrouter: { failures: 0, lastFailureTime: 0, isOpen: false },
};

// In-Flight Promise Registry para deduplicación
const inFlightRequests = new Map<string, Promise<any>>();

// Micro-caché LRU con clave hash
interface CacheEntry {
  content: string;
  modelUsed: string;
  timestamp: number;
}
const responseCache = new Map<string, CacheEntry>();

/**
 * Evalúa síncronamente si un proveedor está disponible según el Circuit Breaker local
 */
export function isProviderAvailable(provider: 'groq' | 'nvidia' | 'gemini' | 'openrouter'): boolean {
  const circuit = providerCircuits[provider];
  if (!circuit) return true;

  if (circuit.isOpen) {
    const elapsed = Date.now() - circuit.lastFailureTime;
    if (elapsed > CIRCUIT_CONFIG.RESET_TIMEOUT_MS) {
      // Estado HALF_OPEN: permite una prueba para ver si el servicio se recuperó
      return true;
    }
    return false;
  }

  return true;
}

/**
 * Evalúa asíncronamente con estado distribuido en Upstash Redis (Serverless/Edge)
 */
export async function isProviderAvailableAsync(provider: 'groq' | 'nvidia' | 'gemini' | 'openrouter'): Promise<boolean> {
  const redis = getUpstashRedis();
  if (!redis) {
    return isProviderAvailable(provider);
  }

  try {
    const isOpen = await redis.get<boolean>(`indi:circuit:${provider}:is_open`);
    if (isOpen) {
      providerCircuits[provider].isOpen = true;
      return false;
    }

    if (providerCircuits[provider].isOpen) {
      const elapsed = Date.now() - providerCircuits[provider].lastFailureTime;
      if (elapsed > CIRCUIT_CONFIG.RESET_TIMEOUT_MS) {
        return true;
      }
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[CircuitBreaker Redis Warning] Fallback a memoria local:', err);
    return isProviderAvailable(provider);
  }
}

/**
 * Registra un éxito en el proveedor y resetea el contador de fallas (local + Redis)
 */
export function recordProviderSuccess(provider: 'groq' | 'nvidia' | 'gemini' | 'openrouter'): void {
  const circuit = providerCircuits[provider];
  if (circuit) {
    circuit.failures = 0;
    circuit.isOpen = false;
  }

  const redis = getUpstashRedis();
  if (redis) {
    redis.del(`indi:circuit:${provider}:is_open`).catch(() => {});
    redis.del(`indi:circuit:${provider}:failures`).catch(() => {});
  }
}

/**
 * Registra una falla o timeout en el proveedor e incrementa el contador (local + Redis)
 */
export function recordProviderFailure(provider: 'groq' | 'nvidia' | 'gemini' | 'openrouter'): void {
  const circuit = providerCircuits[provider];
  if (circuit) {
    circuit.failures += 1;
    circuit.lastFailureTime = Date.now();
    if (circuit.failures >= CIRCUIT_CONFIG.FAILURE_THRESHOLD) {
      circuit.isOpen = true;
      console.warn(`[AI Circuit Breaker] ⚠️ Circuito ABIERTO para "${provider}". Aislado por ${CIRCUIT_CONFIG.RESET_TIMEOUT_MS / 1000}s.`);
    }
  }

  const redis = getUpstashRedis();
  if (redis) {
    redis.incr(`indi:circuit:${provider}:failures`).then(async (fails) => {
      if (fails >= CIRCUIT_CONFIG.FAILURE_THRESHOLD) {
        await redis.set(`indi:circuit:${provider}:is_open`, true, { ex: Math.floor(CIRCUIT_CONFIG.RESET_TIMEOUT_MS / 1000) });
        console.warn(`[AI Circuit Breaker Redis] ⚠️ Circuito ABIERTO en Redis para "${provider}".`);
      }
    }).catch((err) => {
      console.warn('[CircuitBreaker Redis Warning]:', err);
    });
  }
}

/**
 * Genera una clave hash liviana para deduplicación y micro-caché
 */
export function generateRequestKey(messages: Array<{ role: string; content: string }>, options: any = {}): string {
  const serializedMsgs = messages.map((m) => `${m.role}:${m.content}`).join('|');
  const optKey = options.responseFormat?.type || 'default';
  return `${optKey}::${serializedMsgs.slice(0, 500)}::${serializedMsgs.length}`;
}

/**
 * Obtiene una respuesta en caché si existe y no ha expirado
 */
export function getCachedResponse(key: string): { content: string; modelUsed: string } | null {
  const entry = responseCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CIRCUIT_CONFIG.CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }

  return { content: entry.content, modelUsed: `${entry.modelUsed} (cache)` };
}

/**
 * Obtiene una respuesta en micro-caché semántica distribuida (Redis + Memoria)
 */
export async function getCachedResponseAsync(key: string): Promise<{ content: string; modelUsed: string } | null> {
  const local = getCachedResponse(key);
  if (local) return local;

  const redis = getUpstashRedis();
  if (!redis) return null;

  try {
    const cached = await redis.get<{ content: string; modelUsed: string }>(`indi:cache:ai:${key.slice(0, 80)}`);
    if (cached && cached.content) {
      setCachedResponse(key, cached.content, cached.modelUsed);
      return { content: cached.content, modelUsed: `${cached.modelUsed} (redis-cache)` };
    }
  } catch (err) {
    console.warn('[Cache Redis Warning]:', err);
  }
  return null;
}

/**
 * Guarda una respuesta exitosa en micro-caché (local + Redis distribuido)
 */
export function setCachedResponse(key: string, content: string, modelUsed: string): void {
  if (responseCache.size >= CIRCUIT_CONFIG.CACHE_MAX_ENTRIES) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }

  responseCache.set(key, {
    content,
    modelUsed,
    timestamp: Date.now(),
  });

  const redis = getUpstashRedis();
  if (redis) {
    redis.set(`indi:cache:ai:${key.slice(0, 80)}`, { content, modelUsed }, { ex: 3600 }).catch(() => {});
  }
}

/**
 * Envoltorio para deduplicar peticiones concurrentes idénticas (In-Flight Coalescing)
 */
export async function withInFlightCoalescing<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing;
  }

  const promise = fetchFn().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Retorna el estado consolidado de todos los circuitos de IA para telemetría
 */
export function getCircuitStateSummary(): Record<string, { isOpen: boolean; failures: number }> {
  return Object.entries(providerCircuits).reduce((acc, [provider, circuit]) => {
    acc[provider] = {
      isOpen: circuit.isOpen,
      failures: circuit.failures,
    };
    return acc;
  }, {} as Record<string, { isOpen: boolean; failures: number }>);
}
