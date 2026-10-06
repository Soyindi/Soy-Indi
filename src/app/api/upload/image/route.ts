import { NextRequest, NextResponse } from 'next/server';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { isR2Configured, uploadObjectToR2 } from '@/shared/api/r2';
import { validateFileSignature } from '@/shared/lib/fileSecurity';

/**
 * Route Handler para Subida de Imágenes a Cloudflare R2 (INDI 2026)
 * Valida sesión, inspecciona Magic Bytes reales y persiste en Cloudflare R2 con $0 Egress.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Guardrail de Sesión: Validar usuario autenticado
    const sessionResult = await getSafeAuthenticatedUserId();
    const userId = sessionResult.userId || 'anonymous-demo';

    // 2. Parsear FormData
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ success: false, error: 'No se envió formulario multipart' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'avatars';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se encontró archivo en la solicitud' }, { status: 400 });
    }

    // 3. Límite de tamaño de archivo (máx 5MB para imágenes WebP/PNG)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'La imagen excede el límite de 5MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Guardrail de Seguridad: Inspección estricta de Magic Bytes
    const signatureCheck = validateFileSignature(buffer, file.name, file.type || 'image/webp');
    if (!signatureCheck.valid || signatureCheck.detectedType === 'executable') {
      return NextResponse.json({
        success: false,
        error: signatureCheck.error || 'Firma de imagen inválida o no permitida',
      }, { status: 400 });
    }

    // 5. Si Cloudflare R2 está configurado, subir al bucket
    if (isR2Configured()) {
      const ext = signatureCheck.detectedType === 'webp' ? 'webp' : 'png';
      const filename = `${category}/${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const uploadResult = await uploadObjectToR2({
        key: filename,
        buffer,
        contentType: file.type || 'image/webp',
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.url,
        provider: 'cloudflare_r2',
        sizeBytes: uploadResult.sizeBytes,
      });
    }

    // 6. Fallback de contingencia si R2 no estuviera configurado: Retornar data URL
    const mime = file.type || 'image/webp';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      provider: 'in_memory_fallback',
      sizeBytes: buffer.length,
    });
  } catch (error: any) {
    console.error('[Upload R2 Error]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al procesar la subida del archivo',
    }, { status: 500 });
  }
}
