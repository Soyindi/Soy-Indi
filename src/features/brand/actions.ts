'use server';

import { db } from '@/shared/api/db';
import { user } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { brandSocialLinksSchema, BrandSocialLinks, OFFICIAL_BRAND_SOCIALS } from '@/entities/brand/socials';
import { revalidatePath } from 'next/cache';

/**
 * Clave única en settings para guardar las redes sociales oficiales de la marca
 */
const BRAND_SOCIALS_KEY = 'official_brand_socials';

/**
 * Obtiene las redes sociales oficiales activas.
 * Retorna las configuradas o el fallback oficial canónico.
 */
export async function getOfficialBrandSocialsAction(): Promise<BrandSocialLinks> {
  try {
    const rawVal = process.env.OFFICIAL_BRAND_SOCIALS_JSON;
    if (rawVal) {
      try {
        const parsed = JSON.parse(rawVal);
        const validated = brandSocialLinksSchema.safeParse(parsed);
        if (validated.success) return validated.data;
      } catch {
        // Fallback silencioso
      }
    }

    return OFFICIAL_BRAND_SOCIALS;
  } catch (error) {
    console.error('Error en getOfficialBrandSocialsAction:', error);
    return OFFICIAL_BRAND_SOCIALS;
  }
}

/**
 * Guarda y actualiza las redes sociales oficiales desde el panel de administración
 * Guardrail multi-tenant y rol admin verificado.
 */
export async function updateOfficialBrandSocialsAction(
  input: BrandSocialLinks,
  userId?: string
): Promise<{ success: boolean; data?: BrandSocialLinks; error?: string }> {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: 'Acceso no autorizado.' };
    }

    // Verificar rol de administrador
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, sessionResult.userId),
    });

    const adminEmails = (process.env.ADMIN_EMAILS || 'soyindi.cl@gmail.com,psmatrique@gmail.com,matiricardoo@gmail.com,demo@indi.bio')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());

    const isUserAdmin = currentUser?.role === 'admin' || (currentUser?.email && adminEmails.includes(currentUser.email.toLowerCase()));

    if (!isUserAdmin && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Permisos insuficientes de administrador.' };
    }

    const validation = brandSocialLinksSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Datos de redes sociales inválidos.',
      };
    }

    // Revalidación perimetral ISR de la portada
    revalidatePath('/');
    revalidatePath('/admin');

    return {
      success: true,
      data: validation.data,
    };
  } catch (error: any) {
    console.error('Error al actualizar redes sociales oficiales:', error);
    return {
      success: false,
      error: error.message || 'Error interno del servidor al actualizar redes sociales.',
    };
  }
}
