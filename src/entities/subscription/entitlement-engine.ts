import {
  PRICING_TIERS,
  PlanTier,
  TimeRemainingBreakdown,
  UserEntitlement,
  EntitlementSource,
  calculateTimeRemaining,
} from './types';

/**
 * Motor Determinista de Entitlements (Trial · Suscripción · Gracia · Expiración)
 *
 * Funciones 100% puras (sin I/O) que concentran la máquina de estados temporal de INDI.
 * Toda capa superior (Server Actions, Route Handlers, UI) debe delegar aquí el cómputo
 * de vigencia para garantizar un único origen de verdad y pruebas unitarias exhaustivas.
 *
 * Invariantes:
 * - El trial es SIEMPRE un instante absoluto persistido (`trialEndsAt`). Nunca se recalcula
 *   como "ahora + 3 días" en cada render (anti-patrón "sliding trial" que congelaba el cronómetro).
 * - El período de gracia sólo aplica a suscripciones pagadas vencidas (5 días).
 * - Toda respuesta incluye `serverNow` para que el cliente corrija relojes desfasados.
 */

export const MS_PER_SECOND = 1_000;
export const MS_PER_DAY = 86_400_000;
export const TRIAL_DURATION_DAYS = 3;
export const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * MS_PER_DAY;
export const GRACE_PERIOD_DAYS = 5;
export const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * MS_PER_DAY;
/** Ventana crítica (días) en la que una suscripción activa muestra cronómetro en vivo (Regla 19). */
export const URGENT_COUNTDOWN_THRESHOLD_DAYS = 3;
/** Desfase mínimo de reloj cliente-servidor que se considera un reloj de dispositivo incorrecto. */
export const CLOCK_SKEW_TOLERANCE_MS = 60_000;
/** Durante el trial se otorgan las cuotas del plan Pro. */
export const TRIAL_TIER: PlanTier = 'pro';

export interface EntitlementSubjectSnapshot {
  status: string | null | undefined;
  trialEndsAt: Date | number | null | undefined;
  subscriptionEndsAt: Date | number | null | undefined;
  resolvedTier?: PlanTier | null;
}

/** Normaliza Date | number | null a epoch ms (o null si no es un instante válido). */
export function toEpochMs(value: Date | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const ms = typeof value === 'number' ? value : value.getTime();
  return Number.isFinite(ms) ? ms : null;
}

/** Días restantes redondeados hacia arriba (mínimo 1 mientras quede tiempo; 0 si expiró). */
export function ceilDaysRemaining(expiresAtMs: number | null, nowMs: number): number {
  if (expiresAtMs === null) return 0;
  const diff = expiresAtMs - nowMs;
  if (diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / MS_PER_DAY));
}

/**
 * Política de saneamiento para cuentas legacy con `trialEndsAt = NULL`:
 * se otorga UNA ÚNICA VEZ un trial real de 3 días desde el instante de saneamiento,
 * el cual debe persistirse inmediatamente para que el cronómetro avance de verdad.
 */
export function resolveLegacyTrialAnchor(nowMs: number): number {
  return nowMs + TRIAL_DURATION_MS;
}

function buildEntitlement(params: {
  hasAccess: boolean;
  isTrial: boolean;
  isGracePeriod: boolean;
  status: UserEntitlement['status'];
  tier: PlanTier;
  expiresAt: number | null;
  daysRemaining: number;
  nowMs: number;
  source: EntitlementSource;
}): UserEntitlement {
  const timeRemaining: TimeRemainingBreakdown = calculateTimeRemaining(params.expiresAt, params.nowMs);
  return {
    hasAccess: params.hasAccess,
    isTrial: params.isTrial,
    isGracePeriod: params.isGracePeriod,
    status: params.status,
    tier: params.tier,
    limits: PRICING_TIERS[params.tier].limits,
    daysRemaining: params.daysRemaining,
    expiresAt: params.expiresAt,
    timeRemaining,
    serverNow: params.nowMs,
    source: params.source,
  };
}

/**
 * Entitlement ilustrativo para visitantes sin sesión (`anonymous`) o ante fallas de
 * infraestructura (`fallback`). Expone el contrato del trial (3 días, cuotas Pro) pero se
 * marca con `source` para que la UI NO renderice un cronómetro que se reinicia en cada carga.
 */
export function buildPreviewEntitlement(nowMs: number, source: Exclude<EntitlementSource, 'database'>): UserEntitlement {
  return buildEntitlement({
    hasAccess: true,
    isTrial: true,
    isGracePeriod: false,
    status: 'TRIAL',
    tier: TRIAL_TIER,
    expiresAt: nowMs + TRIAL_DURATION_MS,
    daysRemaining: TRIAL_DURATION_DAYS,
    nowMs,
    source,
  });
}

/**
 * Máquina de estados temporal determinista:
 *
 *   TRIAL ──(now > trialEndsAt)──────────────────────────────▶ EXPIRED
 *   ACTIVE ─(now > subEndsAt)──▶ GRACE_PERIOD ─(+5 días)──────▶ EXPIRED
 */
export function resolveEntitlementState(subject: EntitlementSubjectSnapshot, nowMs: number): UserEntitlement {
  const tier: PlanTier = subject.resolvedTier && subject.resolvedTier in PRICING_TIERS ? subject.resolvedTier : 'pro';
  const trialEndsAtMs = toEpochMs(subject.trialEndsAt);
  const subscriptionEndsAtMs = toEpochMs(subject.subscriptionEndsAt);

  // 1. Suscripción pagada
  if (subject.status === 'ACTIVE') {
    if (subscriptionEndsAtMs === null) {
      // Anomalía de datos (ACTIVE sin vencimiento): acceso sin cronómetro, nunca bloquea al cliente pagador.
      return buildEntitlement({
        hasAccess: true,
        isTrial: false,
        isGracePeriod: false,
        status: 'ACTIVE',
        tier,
        expiresAt: null,
        daysRemaining: 30,
        nowMs,
        source: 'database',
      });
    }

    if (nowMs <= subscriptionEndsAtMs) {
      return buildEntitlement({
        hasAccess: true,
        isTrial: false,
        isGracePeriod: false,
        status: 'ACTIVE',
        tier,
        expiresAt: subscriptionEndsAtMs,
        daysRemaining: ceilDaysRemaining(subscriptionEndsAtMs, nowMs),
        nowMs,
        source: 'database',
      });
    }

    const graceEndsAtMs = subscriptionEndsAtMs + GRACE_PERIOD_MS;
    if (nowMs <= graceEndsAtMs) {
      return buildEntitlement({
        hasAccess: true,
        isTrial: false,
        isGracePeriod: true,
        status: 'GRACE_PERIOD',
        tier,
        expiresAt: graceEndsAtMs,
        daysRemaining: ceilDaysRemaining(graceEndsAtMs, nowMs),
        nowMs,
        source: 'database',
      });
    }

    return buildEntitlement({
      hasAccess: false,
      isTrial: false,
      isGracePeriod: false,
      status: 'EXPIRED',
      tier,
      expiresAt: graceEndsAtMs,
      daysRemaining: 0,
      nowMs,
      source: 'database',
    });
  }

  // 2. Período de prueba
  if (subject.status === 'TRIAL') {
    if (trialEndsAtMs === null) {
      // El saneamiento persistente falló: se informa el contrato sin cronómetro engañoso.
      return buildPreviewEntitlement(nowMs, 'fallback');
    }

    if (nowMs <= trialEndsAtMs) {
      return buildEntitlement({
        hasAccess: true,
        isTrial: true,
        isGracePeriod: false,
        status: 'TRIAL',
        tier: TRIAL_TIER,
        expiresAt: trialEndsAtMs,
        daysRemaining: ceilDaysRemaining(trialEndsAtMs, nowMs),
        nowMs,
        source: 'database',
      });
    }

    return buildEntitlement({
      hasAccess: false,
      isTrial: false,
      isGracePeriod: false,
      status: 'EXPIRED',
      tier,
      expiresAt: trialEndsAtMs,
      daysRemaining: 0,
      nowMs,
      source: 'database',
    });
  }

  // 3. EXPIRED / CANCELLED / estados desconocidos: bloqueo seguro (fail-closed)
  return buildEntitlement({
    hasAccess: false,
    isTrial: false,
    isGracePeriod: false,
    status: 'EXPIRED',
    tier,
    expiresAt: subscriptionEndsAtMs ?? trialEndsAtMs,
    daysRemaining: 0,
    nowMs,
    source: 'database',
  });
}

/**
 * Regla 19 (UX No Invasiva): el cronómetro en vivo sólo se muestra cuando los datos son
 * reales (`source === 'database'`) y estamos en trial, gracia o ventana crítica (≤ 3 días).
 */
export function shouldDisplayLiveCountdown(entitlement: UserEntitlement): boolean {
  if (entitlement.expiresAt === null) return false;
  if ((entitlement.source ?? 'database') !== 'database') return false;
  if (entitlement.status === 'TRIAL' || entitlement.status === 'GRACE_PERIOD') return true;
  if (entitlement.status === 'ACTIVE') return entitlement.daysRemaining <= URGENT_COUNTDOWN_THRESHOLD_DAYS;
  return false;
}

/**
 * Corrección de reloj del dispositivo: si el reloj del cliente difiere del servidor más allá
 * de la tolerancia (60s), se devuelve el desfase a sumar a `Date.now()` del cliente.
 * Desfases menores (latencia de red / hidratación) se ignoran para no introducir saltos.
 */
export function computeClockSkewMs(
  serverNowMs: number | null | undefined,
  clientNowMs: number,
  toleranceMs: number = CLOCK_SKEW_TOLERANCE_MS
): number {
  if (typeof serverNowMs !== 'number' || !Number.isFinite(serverNowMs)) return 0;
  const skew = serverNowMs - clientNowMs;
  return Math.abs(skew) > toleranceMs ? skew : 0;
}

/** Milisegundos hasta el próximo borde de segundo (ticks alineados sin deriva acumulada). */
export function msUntilNextSecondBoundary(nowMs: number): number {
  const remainder = nowMs % MS_PER_SECOND;
  return remainder === 0 ? MS_PER_SECOND : MS_PER_SECOND - remainder;
}
