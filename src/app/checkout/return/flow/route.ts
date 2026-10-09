import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { user, paymentsHistory } from '@/entities/schema';
import { eq, and, desc } from 'drizzle-orm';
import { flowAdapter } from '@/shared/lib/payments/flow';

/**
 * Route Handler: POST /checkout/return/flow
 *
 * Flow.cl redirige al navegador del pagador mediante POST a esta URL conteniendo el token.
 * 1. Extraemos el token del FormData.
 * 2. Consultamos de forma segura y anti-spoofing getPaymentStatus(token).
 * 3. Si está pagada (status === 2), activamos inmediatamente al usuario en la BD de Turso
 *    y registramos el pago en payments_history.
 * 4. Redirigimos vía HTTP 303 (See Other) a /checkout/success con los parámetros correspondientes.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);
    const token = String(formData?.get('token') || '');

    if (!token) {
      console.error('[Flow Return Handler] No se recibió token en POST');
      return NextResponse.redirect(new URL('/checkout/success?error=missing_token', req.url), 303);
    }

    // Consultar estado oficial a Flow
    const paymentStatus = await flowAdapter.getPaymentStatus(token);

    // Flow status: 1: Pendiente, 2: Pagada, 3: Rechazada, 4: Anulada
    if (paymentStatus.status === 2) {
      // Extraer metadatos
      let metadata: any = {};
      try {
        if (paymentStatus.optional) {
          metadata = typeof paymentStatus.optional === 'string'
            ? JSON.parse(paymentStatus.optional)
            : paymentStatus.optional;
        }
      } catch {
        metadata = {};
      }

      const targetUserId = metadata.userId;
      const planTier = metadata.planTier || 'starter';
      const planInterval = metadata.planInterval || 'monthly';
      const amount = Number(paymentStatus.amount) || 2500;

      if (targetUserId) {
        // Consultar usuario actual para cálculo de prorrata de crédito de tiempo
        const existingUser = await db.query.user.findFirst({
          where: eq(user.id, targetUserId),
          columns: {
            status: true,
            subscriptionEndsAt: true,
          },
        });

        // Consultar último plan para conocer tier previo
        let currentTier: any = null;
        let currentInterval: any = null;
        if (existingUser?.status === 'ACTIVE') {
          const lastPayment = await db.query.paymentsHistory.findFirst({
            where: and(eq(paymentsHistory.userId, targetUserId), eq(paymentsHistory.status, 'approved')),
            orderBy: [desc(paymentsHistory.createdAt)],
          });
          if (lastPayment) {
            currentTier = lastPayment.planTier;
            currentInterval = lastPayment.planInterval;
          }
        }

        const now = Date.now();
        let remainingDays = 0;
        if (existingUser?.subscriptionEndsAt) {
          const remainingMs = new Date(existingUser.subscriptionEndsAt).getTime() - now;
          if (remainingMs > 0) {
            remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
          }
        }

        const { calculateUpgradeTimeCredit } = await import('@/entities/subscription/proration');
        const proration = calculateUpgradeTimeCredit(
          currentTier,
          currentInterval,
          remainingDays,
          planTier,
          planInterval
        );

        const newSubscriptionEndsAt = new Date(now + proration.totalDays * 24 * 60 * 60 * 1000);
        const paymentId = `flow_${paymentStatus.flowOrder || token}`;

        // Sincronización atómica inmediata
        try {
          await db.batch([
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
              paymentMethodId: paymentStatus.paymentData?.media || 'Webpay Mall',
              externalReference: paymentStatus.commerceOrder || token,
            }).onConflictDoUpdate({
              target: paymentsHistory.id,
              set: { status: 'approved' },
            }),

            db.update(user)
              .set({
                status: 'ACTIVE',
                subscriptionEndsAt: newSubscriptionEndsAt,
                updatedAt: new Date(),
              })
              .where(eq(user.id, targetUserId)),
          ]);

          // Procesar comisión si aplica
          const { processAffiliateCommissionOnPayment } = await import('@/features/affiliates/actions');
          await processAffiliateCommissionOnPayment(paymentId, targetUserId, amount).catch(() => {});
        } catch (dbErr) {
          console.error('[Flow Return Handler] Error sincronizando pago en DB:', dbErr);
        }
      }

      const returnUrl = new URL(
        `/checkout/success?tier=${planTier}&plan=${planInterval}&provider=flow&token=${token}&flowOrder=${paymentStatus.flowOrder || ''}`,
        req.url
      );
      return NextResponse.redirect(returnUrl, 303);
    } else {
      console.warn(`[Flow Return Handler] Pago no completado: status=${paymentStatus.status}`);
      const returnUrl = new URL(
        `/checkout/success?provider=flow&status=${paymentStatus.status}&token=${token}`,
        req.url
      );
      return NextResponse.redirect(returnUrl, 303);
    }
  } catch (error: any) {
    console.error('[Flow Return Handler] Excepción:', error);
    return NextResponse.redirect(
      new URL(`/checkout/success?provider=flow&error=server_error`, req.url),
      303
    );
  }
}

/**
 * Fallback GET por si algún intermediario o browser transforma el redirect
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (token) {
    return NextResponse.redirect(
      new URL(`/checkout/success?provider=flow&token=${token}`, req.url),
      303
    );
  }
  return NextResponse.redirect(new URL('/checkout/success', req.url), 303);
}
