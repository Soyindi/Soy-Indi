import { NextRequest, NextResponse } from 'next/server';
import { parseCvDocumentAction, parseCredentialDocumentAction } from '@/features/ai-smart-cv/actions';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { checkAiRateLimit } from '@/shared/lib/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userAuth = await getSafeAuthenticatedUserId();

    if (process.env.NODE_ENV === 'production' && !userAuth.userId) {
      return NextResponse.json(
        { success: false, error: 'Debes iniciar sesión para procesar un documento.' },
        { status: 401 }
      );
    }

    const rateLimit = await checkAiRateLimit(userAuth.userId || 'anonymous-cv-api');
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Has superado el límite de solicitudes. Intenta nuevamente en un minuto.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (file && file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'El archivo excede el tamaño máximo permitido de 10 MB.' },
        { status: 413 }
      );
    }

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
