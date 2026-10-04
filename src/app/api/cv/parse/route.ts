import { NextRequest, NextResponse } from 'next/server';
import { parseCvDocumentAction, parseCredentialDocumentAction } from '@/features/ai-smart-cv/actions';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get('type') as string | null;

    if (type === 'credential') {
      const currentEducationRaw = formData.get('currentEducation') as string | null;
      let currentEducation: Array<{ degree: string; institution: string; year: string }> = [];
      if (currentEducationRaw) {
        try {
          currentEducation = JSON.parse(currentEducationRaw);
        } catch {
          currentEducation = [];
        }
      }

      const result = await parseCredentialDocumentAction(formData, currentEducation);
      return NextResponse.json(result);
    }

    // Por defecto procesar como currículum vitae
    const result = await parseCvDocumentAction(formData);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/cv/parse] Error procesando documento:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error procesando documento en el servidor.',
      },
      { status: 500 }
    );
  }
}
