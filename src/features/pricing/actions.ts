'use server';

import { db } from '@/shared/api/db';
import { user } from '@/entities/schema';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface UserEntitlement {
  hasAccess: boolean;
  isTrial: boolean;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  daysRemaining: number;
}

/**
 * Consulta de derecho de acceso (Entitlement) del usuario
 */
export async function checkUserEntitlementAction(userId?: string): Promise<UserEntitlement> {
  try {
    let targetUser = null;
    if (userId) {
      targetUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });
    } else {
      const sessionResult = await getSafeAuthenticatedUserId();
      if (sessionResult.userId) {
        targetUser = await db.query.user.findFirst({
          where: eq(user.id, sessionResult.userId),
        });
      }
    }

    if (!targetUser) {
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        daysRemaining: 3,
      };
    }

    const now = new Date();
    const trialEndsAt = targetUser.trialEndsAt ? new Date(targetUser.trialEndsAt) : null;
    const subscriptionEndsAt = targetUser.subscriptionEndsAt ? new Date(targetUser.subscriptionEndsAt) : null;

    // Si tiene suscripción activa vigente
    if (targetUser.status === 'ACTIVE') {
      const days = subscriptionEndsAt && now <= subscriptionEndsAt
        ? Math.ceil((subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      return {
        hasAccess: true,
        isTrial: false,
        status: 'ACTIVE',
        daysRemaining: days,
      };
    }

    // Si está en período de prueba (3 días)
    if (targetUser.status === 'TRIAL' && trialEndsAt && now <= trialEndsAt) {
      const days = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        daysRemaining: days,
      };
    }

    // Si no tiene fecha definida o trial vigente pero recién creado
    if (targetUser.status === 'TRIAL' && !trialEndsAt) {
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        daysRemaining: 3,
      };
    }

    // Acceso expirado
    return {
      hasAccess: false,
      isTrial: false,
      status: 'EXPIRED',
      daysRemaining: 0,
    };
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'test' && !err?.message?.includes('no such table')) {
      console.error('Error verificando entitlement:', err);
    }
    return {
      hasAccess: true,
      isTrial: true,
      status: 'TRIAL',
      daysRemaining: 3,
    };
  }
}

/**
 * Simulación de sesión de Checkout (MercadoPago / Stripe)
 */
export async function createCheckoutSessionAction(
  planInterval: 'monthly' | 'semiannual',
  currency: 'CLP' | 'USD' = 'CLP'
) {
  // Simulador estructurado listo para conectar Webhooks
  const amount = planInterval === 'semiannual' ? 6000 : 2500;
  const description =
    planInterval === 'semiannual'
      ? 'INDI Membresía Semestral ($6.000 CLP cada 6 meses)'
      : 'INDI Membresía Mensual ($2.500 CLP / mes)';

  return {
    success: true,
    data: {
      planInterval,
      amount,
      currency,
      description,
      checkoutUrl: `/checkout/success?plan=${planInterval}`,
    },
  };
}
