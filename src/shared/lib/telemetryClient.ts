import { TelemetryViewPayload } from '@/entities/telemetry/schemas';

/**
 * Registra una visualización de recurso en segundo plano.
 * Emplea navigator.sendBeacon con fallback a fetch(..., { keepalive: true }).
 * Incluye protección contra inflación de visitas en la misma sesión de navegador.
 */
export function trackResourceView(payload: TelemetryViewPayload): void {
  if (typeof window === 'undefined') return;

  const storageKey = `indi_view_${payload.entityType}_${payload.slug}`;
  try {
    if (sessionStorage.getItem(storageKey)) {
      // Ya contabilizado en esta sesión de pestaña
      return;
    }
    sessionStorage.setItem(storageKey, '1');
  } catch {
    // Si cookies/storage están deshabilitadas, proceder
  }

  const url = '/api/telemetry/view';
  const data = JSON.stringify(payload);

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    } catch {
      // Fallback a fetch si sendBeacon falla
    }
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
    keepalive: true,
  }).catch(() => {
    // Silencioso: la telemetría no debe romper la experiencia de usuario
  });
}
