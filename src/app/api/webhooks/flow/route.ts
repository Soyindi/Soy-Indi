import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { user, paymentsHistory } from '@/entities/schema';
import { eq, and, desc } from 'drizzle-orm';
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

    // 4. Activación idempotente y atómica de la suscripción
    const paymentId = `flow_${paymentStatus.flowOrder || token}`;
    const { activateSubscriptionFromVerifiedPayment } = await import('@/features/pricing/subscription-activation');
    const activationResult = await activateSubscriptionFromVerifiedPayment({
      paymentId,
      userId: targetUserId,
      provider: 'flow',
      providerPaymentId: String(paymentStatus.flowOrder || token),
      providerSubscriptionId: null,
      planInterval,
      planTier,
      amount,
      currency: 'CLP',
      paymentMethodId: paymentStatus.paymentData?.media || 'flow_webpay',
      externalReference: paymentStatus.commerceOrder || token,
    });

    if (activationResult.outcome === 'rejected') {
      console.error('[Flow Webhook] Activación rechazada:', activationResult.error);
      return NextResponse.json({ success: false, error: activationResult.error }, { status: 400 });
    }

    // 5. Procesar comisión del 25% para el afiliado si aplica (sólo si no fue procesado antes)
    if (activationResult.outcome === 'activated') {
      const { processAffiliateCommissionOnPayment } = await import('@/features/affiliates/commission-engine');
      await processAffiliateCommissionOnPayment(
        paymentId,
        targetUserId,
        amount
      );
    }

    return NextResponse.json({
      success: true,
      message: activationResult.outcome === 'activated'
        ? 'Pago Flow aprobado y suscripción activada.'
        : 'Pago Flow previamente procesado (idempotente).',
      paymentId,
    });
  } catch (error: any) {
    console.error('[Flow Webhook] Error procesando notificación:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
