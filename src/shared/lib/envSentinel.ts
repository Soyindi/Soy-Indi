/**
 * Validador Sentinel de Entorno (Fail-Fast Env Checker) para INDI 2026
 * 
 * Verifica la consistencia y presencia de variables de entorno críticas
 * para mitigar configuraciones erróneas durante despliegues en producción o arranque local.
 */

export interface EnvValidationResult {
  valid: boolean;
  missingVars: string[];
  warnings: string[];
}

const CRITICAL_SERVER_ENV_VARS = [
  'BETTER_AUTH_SECRET',
  'TURSO_DATABASE_URL',
] as const;

const RECOMMENDED_SERVER_ENV_VARS = [
  'BETTER_AUTH_URL',
  'TURSO_AUTH_TOKEN',
  'MP_ACCESS_TOKEN',
  'MP_WEBHOOK_SECRET',
  'CLOUDFLARE_R2_BUCKET_NAME',
] as const;

/**
 * Realiza una inspección determinista de las variables de entorno actuales.
 */
export function validateEnvironment(customEnv: Record<string, string | undefined> = process.env): EnvValidationResult {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  for (const envVar of CRITICAL_SERVER_ENV_VARS) {
    if (!customEnv[envVar] || customEnv[envVar]?.trim() === '') {
      missingVars.push(envVar);
    }
  }

  for (const envVar of RECOMMENDED_SERVER_ENV_VARS) {
    if (!customEnv[envVar] || customEnv[envVar]?.trim() === '') {
      warnings.push(`Variable recomendada no configurada: ${envVar}`);
    }
  }

  const valid = missingVars.length === 0;

  return {
    valid,
    missingVars,
    warnings,
  };
}

/**
 * Ejecución inmediata en el servidor durante la inicialización
 */
export function assertEnvironmentHealthy(): boolean {
  if (typeof window !== 'undefined') {
    return true; // No ejecutar en navegador
  }

  const result = validateEnvironment();

  if (!result.valid && process.env.NODE_ENV === 'production') {
    console.error(`[CRÍTICO - ENV SENTINEL] Variables críticas faltantes: ${result.missingVars.join(', ')}`);
  }

  return result.valid;
}
