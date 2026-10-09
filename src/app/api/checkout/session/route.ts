import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { user } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { createCheckoutPreferenceSchema } from '@/entities/subscription/schemas';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { paymentRegistry } from '@/shared/lib/payments/registry';


export async function POST(req: NextRequest) {
  try {
    // 1. Validar autenticación de usuario
    const sessionResult = await getSafeAuthenticatedUserId();
    if (!sessionResult.userId) {
      return NextResponse.json(
        { success: false, error: 'Inicia sesión para suscribirte a INDI.' },
        { status: 401 }
      );
    }
    const userId = sessionResult.userId;

    // 2. Parsear y validar contrato de entrada con Zod
    const body = await req.json().catch(() => ({}));
    const parsed = createCheckoutPreferenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Parámetros de checkout inválidos.' },
        { status: 400 }
      );
    }

    const { tier, planInterval, provider, affiliateCode } = parsed.data;
    const origin = req.nextUrl.origin || 'http://localhost:3000';

    // Obtener información del usuario autenticado (email y nombre) para Flow y pasarelas
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    // 3. Resolver adaptador a través del Registry unificado
    const adapter = paymentRegistry.getAdapter(provider);
    const result = await adapter.createCheckoutSession({
      userId,
      tier,
      planInterval,
      origin,
      affiliateCode,
      customerEmail: dbUser?.email,
      customerName: dbUser?.name,
    });

    return NextResponse.json({
      success: result.success,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
      provider: result.provider,
      mode: result.mode,
      error: result.error,
    });
  } catch (error: any) {
    console.error('[API Checkout] Error iniciando sesión de pago:', error);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error inesperado al procesar el checkout.' },
      { status: 500 }
    );
  }
}
