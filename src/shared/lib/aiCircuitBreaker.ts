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

// Estado en memoria de los circuitos por proveedor
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
 * Evalúa si un proveedor está disponible según el Circuit Breaker
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
 * Registra un éxito en el proveedor y resetea el contador de fallas
 */
export function recordProviderSuccess(provider: 'groq' | 'nvidia' | 'gemini' | 'openrouter'): void {
  const circuit = providerCircuits[provider];
  if (circuit) {
    circuit.failures = 0;
    circuit.isOpen = false;
  }
}

/**
 * Registra una falla o timeout en el proveedor e incrementa el contador
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
 * Guarda una respuesta exitosa en micro-caché
 */
export function setCachedResponse(key: string, content: string, modelUsed: string): void {
  if (responseCache.size >= CIRCUIT_CONFIG.CACHE_MAX_ENTRIES) {
    // Eliminar el primer elemento más antiguo
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }

  responseCache.set(key, {
    content,
    modelUsed,
    timestamp: Date.now(),
  });
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
