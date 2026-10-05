import { NextRequest, NextResponse } from 'next/server';
import { preferenceClient, isMercadoPagoConfigured } from '@/shared/lib/mercadopago';
import { PRICING_PLANS, PlanInterval } from '@/entities/subscription/types';
import { createCheckoutPreferenceSchema } from '@/entities/subscription/schemas';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';

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
        { success: false, error: 'Plan seleccionado inválido.' },
        { status: 400 }
      );
    }

    const { planInterval } = parsed.data;
    const plan = PRICING_PLANS[planInterval];
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Configuración de plan no encontrada.' },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin || 'http://localhost:3000';

    // 3. Si no hay credenciales de Mercado Pago configuradas, modo fallback controlado
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({
        success: true,
        checkoutUrl: `${origin}/checkout/success?plan=${planInterval}&demo=true`,
        preferenceId: `pref_mock_${Date.now()}`,
        mode: 'demo_fallback',
      });
    }

    // 4. Crear preferencia oficial con Mercado Pago SDK v2
    const preferenceResponse = await preferenceClient.create({
      body: {
        items: [
          {
            id: plan.id,
            title: `INDI Membresía: ${plan.name}`,
            description: `Acceso total a Tarjetas Digitales, Métricas, CV y Presentaciones en Soyindi (${plan.intervalText})`,
            quantity: 1,
            unit_price: plan.priceClp,
            currency_id: 'CLP',
          },
        ],
        back_urls: {
          success: `${origin}/checkout/success?plan=${planInterval}`,
          failure: `${origin}/pricing?status=failure`,
          pending: `${origin}/pricing?status=pending`,
        },
        auto_return: 'approved',
        metadata: {
          user_id: userId,
          plan_interval: planInterval,
          amount_clp: plan.priceClp,
        },
        external_reference: `indi_${userId}_${planInterval}_${Date.now()}`,
        statement_descriptor: 'SOYINDI PRO',
      },
    });

    const checkoutUrl =
      preferenceResponse.init_point ||
      preferenceResponse.sandbox_init_point ||
      `${origin}/checkout/success?plan=${planInterval}`;

    return NextResponse.json({
      success: true,
      checkoutUrl,
      preferenceId: preferenceResponse.id,
    });
  } catch (error: any) {
    console.error('Error al generar preferencia en Mercado Pago:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al comunicarse con Mercado Pago.',
      },
      { status: 500 }
    );
  }
}
