import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { user, paymentsHistory, affiliateCommissions } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { fintocWebhookPayloadSchema } from '@/entities/subscription/schemas';
import { fintocAdapter } from '@/shared/lib/payments/fintoc';

/**
 * Route Handler para Webhooks de Fintoc (Iniciación de Pagos A2A & PAC Digital)
 * Verificación WebCrypto HMAC-SHA256 y persistencia atómica con db.batch()
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('Fintoc-Signature') || req.headers.get('fintoc-signature');

    // 1. Verificación Criptográfica WebCrypto con protección anti-replay
    const isValidSignature = await fintocAdapter.verifyWebhookSignature({
      rawBody,
      signatureHeader,
      maxToleranceSeconds: 300,
    });

    if (!isValidSignature) {
      console.error('[Fintoc Webhook] Firma criptográfica inválida o expirada.');
      return NextResponse.json({ success: false, error: 'Firma inválida' }, { status: 401 });
    }

    // 2. Parseo y validación de contrato Zod
    const jsonBody = JSON.parse(rawBody || '{}');
    const parsed = fintocWebhookPayloadSchema.safeParse(jsonBody);
    if (!parsed.success) {
      console.warn('[Fintoc Webhook] Payload no reconocido o estructura omitida:', parsed.error.format());
      return NextResponse.json({ success: true, message: 'Evento ignorado de forma segura' });
    }

    const { type, data } = parsed.data;

    // Solo procesamos pagos exitosos de facturas o intenciones de pago
    if (type !== 'invoice.payment_succeeded' && type !== 'payment_intent.succeeded') {
      return NextResponse.json({ success: true, message: `Evento ${type} recibido` });
    }

    const targetUserId = typeof data.metadata?.user_id === 'string' ? data.metadata.user_id : String(data.metadata?.user_id || '');
    const planTier = (data.metadata?.plan_tier as any) || 'pro';
    const planInterval = (data.metadata?.plan_interval as any) || 'semiannual';
    const amount = data.amount;

    if (!targetUserId) {
      console.error('[Fintoc Webhook] No se encontró user_id en metadata:', data.metadata);
      return NextResponse.json({ success: false, error: 'Metadata user_id faltante' }, { status: 400 });
    }

    // Calcular extensión de período de suscripción (30 o 180 días)
    const subscriptionDurationDays = planInterval === 'semiannual' ? 180 : 30;
    const now = Date.now();
    const newSubscriptionEndsAt = new Date(now + subscriptionDurationDays * 24 * 60 * 60 * 1000);

    // 3. Preparar sentencias atómicas de db.batch()
    const paymentId = `fintoc_${data.id}`;
    await db.batch([
      // Inserción en historial de pagos con proveedor fintoc
      db.insert(paymentsHistory).values({
        id: paymentId,
        userId: targetUserId,
        provider: 'fintoc',
        providerPaymentId: data.id,
        providerSubscriptionId: data.subscription_id || null,
        planInterval,
        planTier,
        amount,
        currency: 'CLP',
        status: 'approved',
        paymentMethodId: 'fintoc_a2a',
        externalReference: data.id,
      }).onConflictDoUpdate({
        target: paymentsHistory.id,
        set: { status: 'approved' },
      }),

      // Actualización de estado y vigencia de membresía del usuario
      db.update(user)
        .set({
          status: 'ACTIVE',
          subscriptionEndsAt: newSubscriptionEndsAt,
          updatedAt: new Date(),
        })
        .where(eq(user.id, targetUserId)),
    ]);

    // 4. Procesar comisión de afiliados mediante la acción canónica
    const { processAffiliateCommissionOnPayment } = await import('@/features/affiliates/actions');
    await processAffiliateCommissionOnPayment(
      paymentId,
      targetUserId,
      amount
    );

    return NextResponse.json({
      success: true,
      message: 'Pago Fintoc procesado exitosamente y membresía activada.',
      paymentId,
    });
  } catch (error: any) {
    console.error('[Fintoc Webhook] Error crítico:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
