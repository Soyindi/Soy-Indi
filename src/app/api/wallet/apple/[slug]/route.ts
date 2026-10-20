import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { cards } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { OFFICIAL_DEMO_CARD } from '@/entities/card/themes';
import { generateApplePassJson } from '@/shared/lib/wallet/applePassGenerator';
import { buildApplePassBundle, isApplePassSigningConfigured } from '@/shared/lib/wallet/applePassSigner';

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

    const passInput = {
      slug: cardData.slug,
      title: cardData.title,
      profession: cardData.profession,
      phone: cardData.phone || cardData.whatsapp,
      email: cardData.emailContact,
      address: cardData.address,
    };

    const format = request.nextUrl.searchParams.get('format');
    const download = request.nextUrl.searchParams.get('download');
    const acceptHeader = request.headers.get('accept') || '';

    // 1. Si es formato JSON explícito, retornamos la especificación pass.json
    if (format === 'json' || acceptHeader.includes('application/json')) {
      const passJson = generateApplePassJson(passInput);
      return new NextResponse(JSON.stringify(passJson, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${cardData.slug}-pass.json"`,
          'X-Apple-Pass-Type': 'generic',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      });
    }

    // 2. Si los certificados oficiales están configurados o se solicita explícitamente formato binario para pruebas
    const shouldStreamPkPass = isApplePassSigningConfigured() || download === 'pkpass';

    if (shouldStreamPkPass) {
      const passBundleResult = await buildApplePassBundle(passInput);

      if (passBundleResult.success && passBundleResult.buffer) {
        return new NextResponse(new Uint8Array(passBundleResult.buffer), {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.apple.pkpass',
            'Content-Disposition': `attachment; filename="${cardData.slug}.pkpass"`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-PassKit-Signed': passBundleResult.isSigned ? 'true' : 'false',
          },
        });
      }
    }

    // 3. Por defecto en navegador móvil, redirige al perfil con el modal interactivo de Apple Wallet
    return NextResponse.redirect(`https://soyindi.cl/c/${cardData.slug}?wallet=apple`, { status: 307 });
  } catch (error: any) {
    console.error('[Apple Wallet Route Error]:', error);
    return NextResponse.json(
      { error: 'Error al generar el pase de Apple Wallet' },
      { status: 500 }
    );
  }
}
