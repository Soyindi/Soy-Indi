import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { cards } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { OFFICIAL_DEMO_CARD } from '@/entities/card/themes';
import { buildGoogleWalletSaveUrl, isGoogleWalletSigningConfigured } from '@/shared/lib/wallet/googleWalletSigner';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let cardData: any = null;

    if (slug === 'demo') {
      cardData = OFFICIAL_DEMO_CARD;
    } else {
      cardData = await db.query.cards.findFirst({
        where: eq(cards.slug, slug),
      });
    }

    if (!cardData) {
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 });
    }

    const walletInput = {
      slug: cardData.slug,
      title: cardData.title,
      profession: cardData.profession,
      phone: cardData.phone || cardData.whatsapp,
      email: cardData.emailContact,
      photoUrl: cardData.photoUrl,
      websiteUrl: cardData.websiteUrl,
      address: cardData.address,
    };

    const format = request.nextUrl.searchParams.get('format');
    const action = request.nextUrl.searchParams.get('action');

    // 1. Si las credenciales de Google Wallet están configuradas
    if (isGoogleWalletSigningConfigured()) {
      const googleSignResult = buildGoogleWalletSaveUrl(walletInput);

      if (googleSignResult.success && googleSignResult.saveUrl) {
        if (format === 'json') {
          return NextResponse.json({
            success: true,
            saveUrl: googleSignResult.saveUrl,
            jwt: googleSignResult.jwt,
            guidance: googleSignResult.guidance,
          });
        }

        // Redirige directamente al flujo nativo de Google Wallet
        return NextResponse.redirect(googleSignResult.saveUrl, { status: 307 });
      }
    }

    // 2. Si se solicitó JSON explícito sin credenciales configuradas
    if (format === 'json') {
      return NextResponse.json({
        success: false,
        saveUrl: null,
        isConfigured: false,
        guidance:
          'Credenciales de Google Wallet no configuradas. Configura GOOGLE_WALLET_ISSUER_ID y GOOGLE_WALLET_SERVICE_ACCOUNT_KEY.',
      });
    }

    // 3. Redirige al perfil con el modal de Google Wallet y accesos directos
    const redirectUrl = `https://soyindi.cl/c/${cardData.slug}?wallet=google`;
    return NextResponse.redirect(redirectUrl, { status: 307 });
  } catch (error: any) {
    console.error('[Google Wallet Route Error]:', error);
    return NextResponse.json(
      { error: 'Error al procesar enlace de Google Wallet' },
      { status: 500 }
    );
  }
}
