'use server';

import { db } from '@/shared/api/db';
import { user, systemSettings } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { brandSocialLinksSchema, BrandSocialLinks, OFFICIAL_BRAND_SOCIALS } from '@/entities/brand/socials';
import { revalidatePath } from 'next/cache';

/**
 * Clave única en system_settings para persistir las redes sociales oficiales de la marca en Turso SQLite
 */
const BRAND_SOCIALS_KEY = 'official_brand_socials';

/**
 * Obtiene las redes sociales oficiales activas directamente desde Turso SQLite.
 * Si no están creadas aún en la BD, retorna el catálogo oficial canónico.
 */
export async function getOfficialBrandSocialsAction(): Promise<BrandSocialLinks> {
  try {
    const setting = await db.query.systemSettings.findFirst({
      where: eq(systemSettings.key, BRAND_SOCIALS_KEY),
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        const validated = brandSocialLinksSchema.safeParse(parsed);
        if (validated.success) return validated.data;
      } catch (err) {
        console.warn('[Brand Socials] Error al parsear JSON de BD:', err);
      }
    }

    // Fallback secundario si existe variable de entorno o defaults canónicos
    const rawEnv = process.env.OFFICIAL_BRAND_SOCIALS_JSON;
    if (rawEnv) {
      try {
        const parsedEnv = JSON.parse(rawEnv);
        const validatedEnv = brandSocialLinksSchema.safeParse(parsedEnv);
        if (validatedEnv.success) return validatedEnv.data;
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
 * Guarda y actualiza las redes sociales oficiales en Turso SQLite desde el panel de administración
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

    // Persistencia real y atómica en Turso SQLite con upsert
    const jsonValue = JSON.stringify(validation.data);

    await db
      .insert(systemSettings)
      .values({
        key: BRAND_SOCIALS_KEY,
        value: jsonValue,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: jsonValue,
          updatedAt: new Date(),
        },
      });

    // Revalidación perimetral ISR de la portada y rutas del sistema (resiliente)
    try {
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath('/dashboard');
    } catch (revalidateErr) {
      console.warn('[Brand Socials] Revalidación perimetral diferida:', revalidateErr);
    }

    return {
      success: true,
      data: validation.data,
    };
  } catch (error: any) {
    console.error('Error al actualizar redes sociales oficiales en Turso:', error);
    return {
      success: false,
      error: error.message || 'Error interno del servidor al actualizar redes sociales.',
    };
  }
}
