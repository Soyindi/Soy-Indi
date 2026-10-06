'use server';

import { db } from '@/shared/api/db';
import { cards, user } from '@/entities/schema';
import { 
  cardFormSchema, 
  CardFormValues, 
  CardFormInput, 
  isReservedCardSlug, 
  generateSlugAlternatives 
} from '@/entities/card/schemas';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { assertZeroBinaryPersistence } from '@/shared/lib/fileSecurity';
import { eq, and, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function upsertCardAction(
  values: CardFormInput,
  cardId?: string,
  userId?: string
): Promise<ActionResponse<{ slug: string; id: string }>> {
  try {
    // 1. Validar datos estrictamente con Zod
    const validated = cardFormSchema.safeParse(values);
    if (!validated.success) {
      const errorMsg = validated.error.issues.map((i) => i.message).join(', ');
      return { success: false, error: errorMsg };
    }

    const data = validated.data;

    // Guardrail de Seguridad: Cero Persistencia Binaria en Base de Datos (Anti-DB-Bloat)
    const zeroBinaryCheck = assertZeroBinaryPersistence({
      title: data.title,
      photoUrl: data.photoUrl,
      themeConfig: data.themeConfig,
    });
    if (!zeroBinaryCheck.safe) {
      return { success: false, error: `Rechazado por guardrail: ${zeroBinaryCheck.violations.join(' ')}` };
    }

    // 2. Resolver usuario autenticado con guardrail de seguridad
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    // 2.1 Guardrail de Seguridad: Bloqueo de mutaciones por membresía/trial expirado
    const { assertUserEntitlementAction } = await import('@/features/pricing/actions');
    const entitlementCheck = await assertUserEntitlementAction(targetUserId);
    if (!entitlementCheck.allowed) {
      return { success: false, error: entitlementCheck.error || 'Período de prueba finalizado. Se requiere suscripción activa.' };
    }

    if (cardId) {
      // ================= MODO EDICIÓN EXPLÍCITA =================
      // 3a. Verificar propiedad de la tarjeta (Anti-IDOR)
      const existingCard = await db.query.cards.findFirst({
        where: and(eq(cards.id, cardId), eq(cards.userId, targetUserId)),
      });

      if (!existingCard) {
        return { success: false, error: 'La tarjeta a editar no existe o no tienes permisos sobre ella.' };
      }

      // 3b. Si el slug cambió, verificar que no esté ocupado por otra tarjeta ni reservado
      if (existingCard.slug !== data.slug) {
        if (isReservedCardSlug(data.slug)) {
          return { success: false, error: 'Este identificador está reservado para rutas del sistema. Por favor elige otro.' };
        }
        const slugCollision = await db.query.cards.findFirst({
          where: and(eq(cards.slug, data.slug), ne(cards.id, cardId)),
        });
        if (slugCollision) {
          return { success: false, error: 'Este enlace personalizado ya está en uso por otra tarjeta. Por favor elige otro.' };
        }
      }

      // 3c. Actualizar la tarjeta existente
      await db
        .update(cards)
        .set({
          slug: data.slug,
          title: data.title,
          profession: data.profession,
          about: data.about || null,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          emailContact: data.emailContact || null,
          websiteUrl: data.websiteUrl || null,
          linkedinUrl: data.linkedinUrl || null,
          instagramUrl: data.instagramUrl || null,
          photoUrl: data.photoUrl || null,
          address: data.address || null,
          themeConfig: data.themeConfig,
          updatedAt: new Date(),
        })
        .where(and(eq(cards.id, cardId), eq(cards.userId, targetUserId)));

      revalidatePath(`/c/${data.slug}`);
      if (existingCard.slug !== data.slug) {
        revalidatePath(`/c/${existingCard.slug}`);
      }
      revalidatePath('/cards');
      revalidatePath('/dashboard');

      return { success: true, data: { slug: data.slug, id: cardId } };
    } else {
      // ================= MODO CREACIÓN NUEVA =================
      // 4a. Verificar si el slug está reservado por el sistema
      if (isReservedCardSlug(data.slug)) {
        return { success: false, error: 'Este identificador está reservado para rutas del sistema. Por favor elige otro.' };
      }

      // 4b. Verificar si el slug ya existe globalmente
      const slugCollision = await db.query.cards.findFirst({
        where: eq(cards.slug, data.slug),
      });

      if (slugCollision) {
        return { success: false, error: 'Este enlace personalizado ya está en uso. Por favor elige otro nombre o slug.' };
      }

      const newId = crypto.randomUUID();

      // 4c. Insertar nueva tarjeta con UUID propio
      await db.insert(cards).values({
        id: newId,
        userId: targetUserId,
        slug: data.slug,
        title: data.title,
        profession: data.profession,
        about: data.about || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        emailContact: data.emailContact || null,
        websiteUrl: data.websiteUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        instagramUrl: data.instagramUrl || null,
        photoUrl: data.photoUrl || null,
        address: data.address || null,
        themeConfig: data.themeConfig,
        isActive: true,
        viewsCount: 0,
        clicksCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      revalidatePath(`/c/${data.slug}`);
      revalidatePath('/cards');
      revalidatePath('/dashboard');

      return { success: true, data: { slug: data.slug, id: newId } };
    }
  } catch (err: any) {
    console.error('Error en upsertCardAction:', err);
    return { success: false, error: err.message || 'Error al guardar la tarjeta' };
  }
}

export type SlugAvailabilityResult = {
  available: boolean;
  status: 'available' | 'taken' | 'reserved' | 'invalid';
  message?: string;
  suggestions: string[];
};

/**
 * Server Action en tiempo real para verificar la disponibilidad de un slug público
 * y proveer sugerencias automáticas de desambiguación si está ocupado.
 */
export async function checkCardSlugAvailabilityAction(
  rawSlug: string,
  currentCardId?: string,
  profession?: string
): Promise<SlugAvailabilityResult> {
  try {
    const slug = rawSlug.toLowerCase().trim();

    if (!slug || slug.length < 3) {
      return {
        available: false,
        status: 'invalid',
        message: 'El enlace debe tener al menos 3 caracteres.',
        suggestions: [],
      };
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return {
        available: false,
        status: 'invalid',
        message: 'Solo se permiten letras minúsculas, números y guiones.',
        suggestions: [],
      };
    }

    // 1. Verificar si está en la lista de slugs reservados del sistema
    if (isReservedCardSlug(slug)) {
      const suggestions = generateSlugAlternatives(slug, profession);
      return {
        available: false,
        status: 'reserved',
        message: 'Este identificador está reservado para el sistema.',
        suggestions,
      };
    }

    // 2. Consultar colisión en la base de datos
    const existing = await db.query.cards.findFirst({
      where: currentCardId
        ? and(eq(cards.slug, slug), ne(cards.id, currentCardId))
        : eq(cards.slug, slug),
    });

    if (existing) {
      const suggestions = generateSlugAlternatives(slug, profession);
      return {
        available: false,
        status: 'taken',
        message: 'Este enlace ya está en uso por otro profesional.',
        suggestions,
      };
    }

    return {
      available: true,
      status: 'available',
      message: '¡Enlace disponible!',
      suggestions: [],
    };
  } catch (error) {
    console.error('Error al comprobar disponibilidad de slug:', error);
    return {
      available: true,
      status: 'available',
      suggestions: [],
    };
  }
}


