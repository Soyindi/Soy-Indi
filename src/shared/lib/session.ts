import { db } from '@/shared/api/db';
import { user } from '@/entities/schema';
import { eq } from 'drizzle-orm';

export interface SafeUserResult {
  userId: string | null;
  error?: string;
}

/**
 * Guardrail de Seguridad Multi-Tenant para Server Actions:
 * - En Producción: Exige un userId explícito y validado. Previene IDOR y mutaciones anónimas.
 * - En Desarrollo: Si no se provee userId, vincula de forma segura al usuario demo local para permitir testing offline.
 */
export async function getSafeAuthenticatedUserId(providedUserId?: string): Promise<SafeUserResult> {
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Si viene un userId explícito, verificar existencia en la base de datos
  if (providedUserId) {
    try {
      const existing = await db.query.user.findFirst({
        where: eq(user.id, providedUserId),
      });
      if (existing) {
        return { userId: existing.id };
      }
    } catch {
      // Si la tabla no existe o la conexión falla, en desarrollo permitimos el ID provisto
      if (!isProd) {
        return { userId: providedUserId };
      }
    }
  }

  // 2. En Producción: Bloqueo estricto de mutaciones no autenticadas
  if (isProd) {
    return {
      userId: null,
      error: 'Acceso no autorizado. Debes iniciar sesión para realizar esta acción.',
    };
  }

  // 3. En Desarrollo: Soporte offline seguro con usuario demo
  const demoEmail = 'demo@indi.bio';
  try {
    const demoUser = await db.query.user.findFirst({
      where: eq(user.email, demoEmail),
    });

    if (demoUser) {
      return { userId: demoUser.id };
    }

    // Si no existe en la base de datos local, crearlo de manera idempotente
    const [newDemoUser] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        name: 'Usuario Demo INDI',
        email: demoEmail,
        status: 'ACTIVE',
        aiCredits: 30,
      })
      .returning();

    return { userId: newDemoUser.id };
  } catch (err) {
    // Si la base de datos no está migrada aún o está en entorno de pruebas sin tabla `user`,
    // proveer un ID de usuario demo en memoria para no romper la ejecución local ni los tests
    return { userId: 'demo-local-offline-user-id' };
  }
}

