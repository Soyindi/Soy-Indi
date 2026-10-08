import { NextRequest, NextResponse } from 'next/server';
import {
  IndexNowSubmissionSchema,
  INDEXNOW_API_KEY,
  INDEXNOW_KEY_LOCATION,
  INDEXNOW_ENDPOINT,
} from '@/entities/seo/schemas';

/**
 * Route Handler para notificar a IndexNow (Bing, Yandex, Naver, etc.)
 * sobre URLs creadas, modificadas o publicadas en https://soyindi.cl
 *
 * Cumple con el estándar W3C/Search Engine Push Indexing:
 * POST https://api.indexnow.org/indexnow
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);

    const parseResult = IndexNowSubmissionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Estructura de petición inválida para IndexNow',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { host, urlList } = parseResult.data;
    const key = parseResult.data.key || INDEXNOW_API_KEY;
    const keyLocation = parseResult.data.keyLocation || INDEXNOW_KEY_LOCATION;

    const payload = {
      host: host || 'soyindi.cl',
      key,
      keyLocation,
      urlList,
    };

    // Despacho a api.indexnow.org
    const indexNowResponse = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!indexNowResponse.ok && indexNowResponse.status !== 202) {
      const errorText = await indexNowResponse.text().catch(() => 'Error de respuesta');
      console.warn(
        `[IndexNow Warning] Estado no satisfactorio de IndexNow API (${indexNowResponse.status}):`,
        errorText
      );
      return NextResponse.json(
        {
          success: false,
          status: indexNowResponse.status,
          message: 'IndexNow no aceptó la petición inmediatamente',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'URLs notificadas exitosamente a IndexNow',
      submittedCount: urlList.length,
      urls: urlList,
    });
  } catch (error) {
    console.error('[IndexNow Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Fallo interno al procesar notificación de IndexNow' },
      { status: 500 }
    );
  }
}

/**
 * GET de estado y diagnóstico para el protocolo IndexNow
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    protocol: 'IndexNow v1.0',
    keyLocation: INDEXNOW_KEY_LOCATION,
    host: 'soyindi.cl',
  });
}
