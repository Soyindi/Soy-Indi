import { NextRequest, NextResponse } from 'next/server';
import { parsePresentationDocumentAction } from '@/features/orbital-presentations/actions';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await parsePresentationDocumentAction(formData);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/presentations/parse] Error procesando presentación:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error procesando archivo de presentación en el servidor.',
      },
      { status: 500 }
    );
  }
}
