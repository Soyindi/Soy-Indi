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

    // Manejo de eventos de fallo o expiración con retorno 200 para evitar reintentos innecesarios
    if (type === 'payment_intent.failed' || type === 'invoice.payment_failed' || type === 'checkout_session.expired') {
      console.warn(`[Fintoc Webhook] Evento no exitoso recibido (${type}):`, data.id);
      return NextResponse.json({ success: true, message: `Evento de fallo ${type} registrado` });
    }

    // Procesamos eventos de pago exitoso (facturas, payment intents o checkout sessions completadas)
    const isSuccessfulPayment =
      type === 'invoice.payment_succeeded' ||
      type === 'payment_intent.succeeded' ||
      type === 'checkout_session.finished';

    if (!isSuccessfulPayment) {
      return NextResponse.json({ success: true, message: `Evento ${type} omitido` });
    }

    const targetUserId = typeof data.metadata?.user_id === 'string' ? data.metadata.user_id : String(data.metadata?.user_id || '');
    const planTier = (data.metadata?.plan_tier as any) || 'pro';
    const planInterval = (data.metadata?.plan_interval as any) || 'semiannual';
    const amount = data.amount;

    if (!targetUserId) {
      console.error('[Fintoc Webhook] No se encontró user_id en metadata:', data.metadata);
      return NextResponse.json({ success: false, error: 'Metadata user_id faltante' }, { status: 400 });
    }

    // 3. Activación idempotente y atómica de la suscripción
    const paymentId = `fintoc_${data.id}`;
    const { activateSubscriptionFromVerifiedPayment } = await import('@/features/pricing/subscription-activation');
    const activationResult = await activateSubscriptionFromVerifiedPayment({
      paymentId,
      userId: targetUserId,
      provider: 'fintoc',
      providerPaymentId: data.id,
      providerSubscriptionId: data.subscription_id || null,
      planInterval,
      planTier,
      amount,
      currency: 'CLP',
      paymentMethodId: 'fintoc_a2a',
      externalReference: data.id,
    });

    if (activationResult.outcome === 'rejected') {
      console.error('[Fintoc Webhook] Activación rechazada:', activationResult.error);
      return NextResponse.json({ success: false, error: activationResult.error }, { status: 400 });
    }

    // 4. Procesar comisión de afiliados (sólo si no fue procesado antes)
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
        ? 'Pago Fintoc procesado exitosamente y membresía activada.'
        : 'Pago Fintoc previamente procesado (idempotente).',
      paymentId,
    });
  } catch (error: any) {
    console.error('[Fintoc Webhook] Error crítico:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
