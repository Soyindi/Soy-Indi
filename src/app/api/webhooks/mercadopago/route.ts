import { NextRequest, NextResponse } from 'next/server';
import { paymentClient, isMercadoPagoConfigured } from '@/shared/lib/mercadopago';
import { db } from '@/shared/api/db';
import { user, paymentsHistory } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { mercadopagoWebhookPayloadSchema } from '@/entities/subscription/schemas';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    let bodyData: any = {};
    try {
      bodyData = await req.json();
    } catch {
      // algunos webhooks de Mercado Pago envían datos por query params
    }

    const paymentId = id || bodyData?.data?.id;

    // Solo procesamos eventos de pago
    if (!paymentId) {
      return NextResponse.json({ received: true, ignored: 'No payment id' }, { status: 200 });
    }

    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({ received: true, mode: 'demo_fallback' }, { status: 200 });
    }

    // 1. Obtener la información del pago directamente de Mercado Pago (Anti-Spoofing)
    const payment = await paymentClient.get({ id: String(paymentId) });

    if (!payment) {
      return NextResponse.json({ error: 'Pago no encontrado en Mercado Pago' }, { status: 404 });
    }

    const { status, metadata, transaction_amount, payment_method_id, external_reference } = payment;
    const targetUserId = metadata?.user_id;
    const planInterval = (metadata?.plan_interval as 'monthly' | 'semiannual') || 'monthly';

    if (!targetUserId) {
      return NextResponse.json({ received: true, warning: 'Sin user_id en metadatos' }, { status: 200 });
    }

    // 2. Si el pago fue aprobado, extender o activar suscripción
    if (status === 'approved') {
      const durationDays = planInterval === 'semiannual' ? 180 : 30;
      const now = new Date();
      const subscriptionEndsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      // Batching o actualización en Turso
      await db.batch([
        // a. Activar estado de usuario
        db
          .update(user)
          .set({
            status: 'ACTIVE',
            subscriptionEndsAt,
            updatedAt: now,
          })
          .where(eq(user.id, targetUserId)),

        // b. Registrar transacción para auditoría contable
        db
          .insert(paymentsHistory)
          .values({
            id: String(paymentId),
            userId: targetUserId,
            planInterval,
            amount: Math.round(transaction_amount || 0),
            currency: 'CLP',
            status: 'approved',
            paymentMethodId: payment_method_id || null,
            externalReference: external_reference || null,
            createdAt: now,
          })
          .onConflictDoNothing(),
      ]);

      // c. Procesar comisión de afiliados si el usuario fue referido
      const { processAffiliateCommissionOnPayment } = await import('@/features/affiliates/actions');
      await processAffiliateCommissionOnPayment(
        String(paymentId),
        targetUserId,
        Math.round(transaction_amount || 0)
      );
    }

    return NextResponse.json({ success: true, paymentId, status }, { status: 200 });
  } catch (error: any) {
    console.error('Error procesando webhook de Mercado Pago:', error);
    // Responder 200 para evitar que Mercado Pago reintente infinitamente ante errores internos
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
