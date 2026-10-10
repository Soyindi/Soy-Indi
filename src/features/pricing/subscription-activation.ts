import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { paymentsHistory, user } from '@/entities/schema';
import { verifiedPaymentActivationSchema } from '@/entities/subscription/schemas';
import { computeSubscriptionActivationWindow } from '@/entities/subscription/proration';
import type { PlanInterval, PlanTier } from '@/entities/subscription/types';

/**
 * Servicio de Activación Idempotente de Suscripciones (server-only).
 *
 * ⚠️ Este módulo NO declara 'use server' de forma deliberada: sus funciones jamás deben
 * exponerse como Server Actions invocables desde el navegador. Sólo lo consumen Route
 * Handlers que YA verificaron el pago contra la API oficial del proveedor.
 *
 * Garantías:
 * 1. Idempotencia fuerte: el pago se "reclama" con INSERT ... ON CONFLICT DO NOTHING RETURNING.
 *    Si el webhook y el retorno del navegador llegan simultáneamente (o el proveedor reintenta),
 *    sólo UNA ejecución extiende `subscriptionEndsAt`. Elimina la doble extensión de vigencia.
 * 2. Prorrateo calculado sobre el estado PREVIO al pago (Regla 19 · Time Credit Engine).
 * 3. Compensación: si la actualización del usuario falla, el reclamo se revierte para que el
 *    reintento del proveedor pueda completar la activación.
 */

export type SubscriptionActivationResult =
  | {
      outcome: 'activated';
      paymentId: string;
      subscriptionEndsAt: Date;
      totalDays: number;
      bonusDays: number;
    }
  | { outcome: 'already_processed'; paymentId: string }
  | { outcome: 'rejected'; error: string };

export async function activateSubscriptionFromVerifiedPayment(
  rawInput: unknown,
  nowMs: number = Date.now()
): Promise<SubscriptionActivationResult> {
  const parsed = verifiedPaymentActivationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { outcome: 'rejected', error: 'Contrato de activación inválido.' };
  }
  const input = parsed.data;

  // 1. Atajo idempotente: pago ya aprobado previamente
  const existingPayment = await db.query.paymentsHistory.findFirst({
    where: eq(paymentsHistory.id, input.paymentId),
    columns: { id: true, status: true },
  });
  if (existingPayment?.status === 'approved') {
    return { outcome: 'already_processed', paymentId: input.paymentId };
  }

  // 2. Snapshot del estado previo del usuario (base del prorrateo)
  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, input.userId),
    columns: { id: true, status: true, subscriptionEndsAt: true },
  });
  if (!existingUser) {
    return { outcome: 'rejected', error: 'Usuario no encontrado para el pago verificado.' };
  }

  let currentTier: PlanTier | null = null;
  let currentInterval: PlanInterval | null = null;
  if (existingUser.status === 'ACTIVE') {
    const lastPayment = await db.query.paymentsHistory.findFirst({
      where: and(eq(paymentsHistory.userId, input.userId), eq(paymentsHistory.status, 'approved')),
      orderBy: [desc(paymentsHistory.createdAt)],
      columns: { planTier: true, planInterval: true },
    });
    if (lastPayment) {
      currentTier = lastPayment.planTier as PlanTier;
      currentInterval = lastPayment.planInterval as PlanInterval;
    }
  }

  const activationWindow = computeSubscriptionActivationWindow({
    currentStatus: existingUser.status,
    currentTier,
    currentInterval,
    currentSubscriptionEndsAt: existingUser.subscriptionEndsAt,
    newTier: input.planTier,
    newInterval: input.planInterval,
    nowMs,
  });

  // 3. Reclamo atómico del pago (exactly-once)
  const claimed = await db
    .insert(paymentsHistory)
    .values({
      id: input.paymentId,
      userId: input.userId,
      provider: input.provider,
      providerPaymentId: input.providerPaymentId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      planInterval: input.planInterval,
      planTier: input.planTier,
      amount: input.amount,
      currency: input.currency,
      status: 'approved',
      paymentMethodId: input.paymentMethodId ?? null,
      externalReference: input.externalReference ?? null,
      createdAt: new Date(nowMs),
    })
    .onConflictDoNothing({ target: paymentsHistory.id })
    .returning({ id: paymentsHistory.id });

  if (claimed.length === 0) {
    return { outcome: 'already_processed', paymentId: input.paymentId };
  }

  // 4. Activación de la membresía con compensación ante fallo
  try {
    await db
      .update(user)
      .set({
        status: 'ACTIVE',
        subscriptionEndsAt: activationWindow.subscriptionEndsAt,
        updatedAt: new Date(nowMs),
      })
      .where(eq(user.id, input.userId));
  } catch (err) {
    await db
      .delete(paymentsHistory)
      .where(and(eq(paymentsHistory.id, input.paymentId), eq(paymentsHistory.userId, input.userId)))
      .catch(() => undefined);
    throw err;
  }

  return {
    outcome: 'activated',
    paymentId: input.paymentId,
    subscriptionEndsAt: activationWindow.subscriptionEndsAt,
    totalDays: activationWindow.totalDays,
    bonusDays: activationWindow.bonusDays,
  };
}
