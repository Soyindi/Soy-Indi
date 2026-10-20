import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { cards } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { OFFICIAL_DEMO_CARD } from '@/entities/card/themes';
import { generateApplePassJson } from '@/shared/lib/wallet/applePassGenerator';

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

    const passJson = generateApplePassJson({
      slug: cardData.slug,
      title: cardData.title,
      profession: cardData.profession,
      phone: cardData.phone || cardData.whatsapp,
      email: cardData.emailContact,
      address: cardData.address,
    });

    // En producción con certificados configurados, aquí se firma el .pkpass binario.
    // En ausencia de certificado Apple Developer, se emite el payload estructurado con cabecera de compatibilidad.
    return new NextResponse(JSON.stringify(passJson, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${cardData.slug}-pass.json"`,
        'X-Apple-Pass-Type': 'generic',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (error: any) {
    console.error('[Apple Wallet Route Error]:', error);
    return NextResponse.json(
      { error: 'Error al generar el pase de Apple Wallet' },
      { status: 500 }
    );
  }
}
