import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { user, paymentsHistory } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { flowAdapter } from '@/shared/lib/payments/flow';

/**
 * Route Handler para Webhooks de Flow.cl
 *
 * Flow invoca este endpoint vía POST con application/x-www-form-urlencoded
 * conteniendo el token de pago. Consultamos /payment/getStatus a Flow para
 * verificar la autenticidad y monto del pago (Anti-Spoofing).
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Extraer token de pago (puede venir en FormData o JSON)
    let token = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData().catch(() => null);
      token = String(formData?.get('token') || '');
    } else {
      const jsonBody = await req.json().catch(() => ({}));
      token = String(jsonBody.token || '');
    }

    if (!token) {
      console.error('[Flow Webhook] Token faltante en la petición');
      return NextResponse.json({ success: false, error: 'Token faltante' }, { status: 400 });
    }

    // 2. Consulta oficial anti-spoofing al API de Flow (/payment/getStatus)
    const paymentStatus = await flowAdapter.getPaymentStatus(token);

    // Flow status: 1: Pendiente, 2: Pagada, 3: Rechazada, 4: Anulada
    if (paymentStatus.status !== 2) {
      console.warn(`[Flow Webhook] Transacción token=${token} no está pagada (status=${paymentStatus.status})`);
      return NextResponse.json({
        success: true,
        message: `Estado registrado: ${paymentStatus.status}`,
      });
    }

    // 3. Extraer metadatos del usuario y del plan
    let metadata: any = {};
    try {
      if (paymentStatus.optional) {
        metadata = JSON.parse(paymentStatus.optional);
      }
    } catch {
      metadata = {};
    }

    const targetUserId = metadata.userId;
    const planTier = metadata.planTier || 'pro';
    const planInterval = metadata.planInterval || 'semiannual';
    const amount = Number(paymentStatus.amount) || 0;

    if (!targetUserId) {
      console.error('[Flow Webhook] No se encontró userId en metadatos de Flow:', paymentStatus);
      return NextResponse.json({ success: false, error: 'UserId no encontrado' }, { status: 400 });
    }

    // Calcular vigencia (30 o 180 días)
    const subscriptionDurationDays = planInterval === 'semiannual' ? 180 : 30;
    const now = Date.now();
    const newSubscriptionEndsAt = new Date(now + subscriptionDurationDays * 24 * 60 * 60 * 1000);

    // 4. Ejecución atómica en Turso SQLite con db.batch()
    const paymentId = `flow_${paymentStatus.flowOrder || token}`;
    await db.batch([
      // Inserción en historial de pagos con proveedor 'flow'
      db.insert(paymentsHistory).values({
        id: paymentId,
        userId: targetUserId,
        provider: 'flow',
        providerPaymentId: String(paymentStatus.flowOrder || token),
        providerSubscriptionId: null,
        planInterval,
        planTier,
        amount,
        currency: 'CLP',
        status: 'approved',
        paymentMethodId: paymentStatus.paymentData?.media || 'flow_webpay',
        externalReference: paymentStatus.commerceOrder || token,
      }).onConflictDoUpdate({
        target: paymentsHistory.id,
        set: { status: 'approved' },
      }),

      // Actualizar usuario a ACTIVE y extender vigencia
      db.update(user)
        .set({
          status: 'ACTIVE',
          subscriptionEndsAt: newSubscriptionEndsAt,
          updatedAt: new Date(),
        })
        .where(eq(user.id, targetUserId)),
    ]);

    // 5. Procesar comisión del 25% para el afiliado si aplica
    const { processAffiliateCommissionOnPayment } = await import('@/features/affiliates/actions');
    await processAffiliateCommissionOnPayment(
      paymentId,
      targetUserId,
      amount
    );

    return NextResponse.json({
      success: true,
      message: 'Pago Flow aprobado y suscripción activada.',
      paymentId,
    });
  } catch (error: any) {
    console.error('[Flow Webhook] Error procesando notificación:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
