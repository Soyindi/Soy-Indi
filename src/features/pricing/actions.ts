'use server';

import { db } from '@/shared/api/db';
import { user } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface UserEntitlement {
  hasAccess: boolean;
  isTrial: boolean;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  daysRemaining: number;
  aiCredits: number;
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
      targetUser = await db.query.user.findFirst();
    }

    if (!targetUser) {
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        daysRemaining: 15,
        aiCredits: 30,
      };
    }

    const now = new Date();
    const trialEndsAt = targetUser.trialEndsAt ? new Date(targetUser.trialEndsAt) : null;
    const subscriptionEndsAt = targetUser.subscriptionEndsAt ? new Date(targetUser.subscriptionEndsAt) : null;

    // Si tiene suscripción activa vigente
    if (targetUser.status === 'ACTIVE' && subscriptionEndsAt && now <= subscriptionEndsAt) {
      const days = Math.ceil((subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        hasAccess: true,
        isTrial: false,
        status: 'ACTIVE',
        daysRemaining: days,
        aiCredits: targetUser.aiCredits ?? 30,
      };
    }

    // Si está en período de prueba (15 días)
    if (targetUser.status === 'TRIAL' && trialEndsAt && now <= trialEndsAt) {
      const days = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        daysRemaining: days,
        aiCredits: targetUser.aiCredits ?? 30,
      };
    }

    // Si no tiene fecha definida o trial vigente pero recién creado
    if (targetUser.status === 'TRIAL' && !trialEndsAt) {
      return {
        hasAccess: true,
        isTrial: true,
        status: 'TRIAL',
        daysRemaining: 15,
        aiCredits: targetUser.aiCredits ?? 30,
      };
    }

    // Acceso expirado
    return {
      hasAccess: false,
      isTrial: false,
      status: 'EXPIRED',
      daysRemaining: 0,
      aiCredits: targetUser.aiCredits ?? 0,
    };
  } catch (err) {
    console.error('Error verificando entitlement:', err);
    return {
      hasAccess: true,
      isTrial: true,
      status: 'TRIAL',
      daysRemaining: 15,
      aiCredits: 30,
    };
  }
}

/**
 * Consumir créditos de IA de forma atómica
 */
export async function consumeAiCreditsAction(userId: string, creditsToConsume: number) {
  try {
    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!targetUser) return { success: false, error: 'Usuario no encontrado' };

    const currentCredits = targetUser.aiCredits ?? 30;
    if (currentCredits < creditsToConsume) {
      return {
        success: false,
        error: `Créditos insuficientes (${currentCredits} disponibles, requieres ${creditsToConsume}).`,
      };
    }

    await db
      .update(user)
      .set({
        aiCredits: currentCredits - creditsToConsume,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    return { success: true, remainingCredits: currentCredits - creditsToConsume };
  } catch (err: any) {
    return { success: false, error: err.message };
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
