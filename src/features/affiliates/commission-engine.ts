import { eq } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { affiliateCommissions, user } from '@/entities/schema';
import { AFFILIATE_COMMISSION_PERCENTAGE } from '@/entities/affiliate/schemas';

/**
 * Motor de Liquidación de Comisiones de Afiliados (server-only).
 *
 * ⚠️ SEGURIDAD: Este módulo NO declara 'use server' de forma deliberada. Antes vivía en
 * `actions.ts` ('use server'), lo que exponía `processAffiliateCommissionOnPayment` como
 * endpoint público: cualquier cliente podía fabricar comisiones "payable" con montos
 * arbitrarios. Sólo Route Handlers de webhooks con pago VERIFICADO pueden invocarlo.
 */

/**
 * Registrar comisión (25%) cuando un pago verificado es aprobado.
 */
export async function processAffiliateCommissionOnPayment(paymentId: string, buyerUserId: string, transactionAmount: number) {
  try {
    if (!paymentId || !buyerUserId || !Number.isFinite(transactionAmount)) return;

    const buyer = await db.query.user.findFirst({
      where: eq(user.id, buyerUserId),
    });

    if (!buyer || !buyer.referredBy) {
      // El comprador no fue referido por ningún afiliado
      return;
    }

    const referrerId = buyer.referredBy;

    // Protección anti-auto-comisión si las cuentas son idénticas
    if (referrerId === buyerUserId) {
      return;
    }

    const commissionClp = Math.round(transactionAmount * (AFFILIATE_COMMISSION_PERCENTAGE / 100));

    if (commissionClp <= 0) return;

    // Idempotencia: Verificar si ya existe comisión registrada para este paymentId
    const existingCommission = await db.query.affiliateCommissions.findFirst({
      where: eq(affiliateCommissions.paymentId, paymentId),
    });

    if (existingCommission) {
      return;
    }

    await db.insert(affiliateCommissions).values({
      affiliateUserId: referrerId,
      buyerUserId,
      paymentId,
      amountClp: commissionClp,
      status: 'payable', // Listo para el corte quincenal
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('Error generando comisión de afiliado:', err);
  }
}

/**
 * Reversión de comisión ante reembolsos o contracargos (Refunds / Chargebacks de Mercado Pago)
 */
export async function processAffiliateRefundOnPayment(paymentId: string, reason: 'refunded' | 'charged_back' = 'refunded') {
  try {
    const existing = await db.query.affiliateCommissions.findFirst({
      where: eq(affiliateCommissions.paymentId, paymentId),
    });

    if (!existing) return;

    // Si ya está marcada como reembolsada o contra-cargo, no hacer nada
    if (existing.status === 'refunded' || existing.status === 'charged_back') {
      return;
    }

    await db
      .update(affiliateCommissions)
      .set({
        status: reason,
      })
      .where(eq(affiliateCommissions.id, existing.id));

    console.info(`[Affiliate Refund] Comisión ${existing.id} revertida con estado '${reason}' para pago ${paymentId}`);
  } catch (err) {
    console.error('Error procesando reversión de comisión:', err);
  }
}
