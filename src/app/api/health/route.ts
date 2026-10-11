import { NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { sql } from 'drizzle-orm';
import { getUpstashRedis } from '@/shared/lib/rateLimiter';
import { getCircuitStateSummary } from '@/shared/lib/aiCircuitBreaker';

/**
 * GET /api/health — Health Check & Infra Telemetry Endpoint (INDI 2026)
 * Permite monitoreo externo (BetterStack, UptimeRobot, Vercel) y diagnóstico rápido de estado.
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: 'healthy' | 'degraded' | 'down'; latencyMs?: number; error?: string }> = {};

  // 1. Verificar Turso SQLite DB
  try {
    const dbStart = Date.now();
    await db.run(sql`SELECT 1`);
    checks.database = {
      status: 'healthy',
      latencyMs: Date.now() - dbStart,
    };
  } catch (err: any) {
    checks.database = {
      status: 'down',
      error: err?.message || 'Database unreachable',
    };
  }

  // 2. Verificar Upstash Redis Rate Limiter
  const redis = getUpstashRedis();
  if (redis) {
    try {
      const redisStart = Date.now();
      await redis.ping();
      checks.redis = {
        status: 'healthy',
        latencyMs: Date.now() - redisStart,
      };
    } catch (err: any) {
      checks.redis = {
        status: 'degraded',
        error: 'Redis error, falling back to in-memory store',
      };
    }
  } else {
    checks.redis = {
      status: 'healthy',
      error: 'Operating with in-memory fallback sentinel',
    };
  }

  // 3. Verificar Circuit Breakers de Proveedores de IA
  const circuits = getCircuitStateSummary();
  const allCircuitsOpen = Object.values(circuits).every((c) => c.isOpen);
  checks.aiProviders = {
    status: allCircuitsOpen ? 'degraded' : 'healthy',
  };

  const isHealthy = checks.database.status === 'healthy';
  const totalLatencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      latencyMs: totalLatencyMs,
      checks,
      aiCircuits: circuits,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
