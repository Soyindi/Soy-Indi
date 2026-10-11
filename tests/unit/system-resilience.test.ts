import { describe, it, expect } from 'vitest';
import { GET as healthHandler } from '@/app/api/health/route';
import { isProviderAvailable, recordProviderFailure, recordProviderSuccess, getCircuitStateSummary } from '@/shared/lib/aiCircuitBreaker';

describe('System Resilience & Error Governance (INDI 2026)', () => {
  it('GET /api/health retorna diagnóstico estructurado del sistema', async () => {
    const res = await healthHandler();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBeDefined();
    expect(data.checks).toBeDefined();
    expect(data.checks.database).toBeDefined();
    expect(data.checks.aiProviders).toBeDefined();
    expect(data.aiCircuits).toBeDefined();
  });

  it('Circuit Breaker de IA aísla proveedores tras fallos consecutivos', () => {
    // Al inicio está disponible
    expect(isProviderAvailable('groq')).toBe(true);

    // Simular fallas consecutivas
    recordProviderFailure('groq');
    recordProviderFailure('groq');
    recordProviderFailure('groq');

    const summary = getCircuitStateSummary();
    expect(summary.groq.isOpen).toBe(true);

    // Cuando el circuito está abierto, el proveedor se marca como no disponible
    expect(isProviderAvailable('groq')).toBe(false);

    // Restablecer éxito
    recordProviderSuccess('groq');
    expect(isProviderAvailable('groq')).toBe(true);
  });
});
