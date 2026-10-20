'use server';

import { z } from 'zod';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { isR2Configured, getPresignedR2UploadUrl } from '@/shared/api/r2';

const PresignedAvatarInputSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(['image/webp', 'image/jpeg', 'image/png']),
  sizeBytes: z.number().max(2 * 1024 * 1024, 'El archivo excede el límite máximo de 2 MB'),
});

export type PresignedAvatarInput = z.infer<typeof PresignedAvatarInputSchema>;

export interface PresignedAvatarResult {
  success: boolean;
  uploadUrl?: string;
  publicUrl?: string;
  key?: string;
  error?: string;
  isFallbackRequired?: boolean;
}

/**
 * Server Action: Genera una URL prefirmada PUT para subida directa de avatares a Cloudflare R2
 */
export async function getPresignedAvatarUploadUrlAction(
  rawInput: PresignedAvatarInput,
  targetUserId?: string
): Promise<PresignedAvatarResult> {
  try {
    const authResult = await getSafeAuthenticatedUserId(targetUserId);
    if (!authResult.userId) {
      return {
        success: false,
        error: authResult.error || 'Acceso no autorizado',
      };
    }
    const authUserId = authResult.userId;

    if (!isR2Configured()) {
      return {
        success: false,
        isFallbackRequired: true,
        error: 'Cloudflare R2 no está configurado. Se activará el almacenamiento local optimizado.',
      };
    }

    const parseResult = PresignedAvatarInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Parámetros de subida inválidos',
      };
    }

    const { contentType } = parseResult.data;
    const extension = contentType === 'image/webp' ? 'webp' : contentType === 'image/png' ? 'png' : 'jpg';
    const key = `avatars/${authUserId}/${crypto.randomUUID()}.${extension}`;

    const presigned = await getPresignedR2UploadUrl({
      key,
      contentType,
      expiresInSeconds: 300, // 5 minutos
    });

    return {
      success: true,
      uploadUrl: presigned.uploadUrl,
      publicUrl: presigned.publicUrl,
      key: presigned.key,
    };
  } catch (error: any) {
    console.error('[getPresignedAvatarUploadUrlAction Error]:', error);
    return {
      success: false,
      error: error?.message || 'Error al autorizar la subida de imagen',
      isFallbackRequired: !isR2Configured(),
    };
  }
}
