import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { cards } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { OFFICIAL_DEMO_CARD } from '@/entities/card/themes';

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

    // Redirige al perfil con el modal de Google Wallet y acceso offline activo
    const redirectUrl = `https://soyindi.cl/c/${cardData.slug}?wallet=google`;
    return NextResponse.redirect(redirectUrl, { status: 307 });
  } catch (error: any) {
    console.error('[Google Wallet Route Error]:', error);
    return NextResponse.json(
      { error: 'Error al generar enlace de Google Wallet' },
      { status: 500 }
    );
  }
}
