'use server';

import { db } from '@/shared/api/db';
import { cards, user } from '@/entities/schema';
import { cardFormSchema, CardFormValues, CardFormInput } from '@/entities/card/schemas';
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

    if (cardId) {
      // ================= MODO EDICIÓN EXPLÍCITA =================
      // 3a. Verificar propiedad de la tarjeta (Anti-IDOR)
      const existingCard = await db.query.cards.findFirst({
        where: and(eq(cards.id, cardId), eq(cards.userId, targetUserId)),
      });

      if (!existingCard) {
        return { success: false, error: 'La tarjeta a editar no existe o no tienes permisos sobre ella.' };
      }

      // 3b. Si el slug cambió, verificar que no esté ocupado por otra tarjeta
      if (existingCard.slug !== data.slug) {
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
      // 4a. Verificar si el slug ya existe globalmente
      const slugCollision = await db.query.cards.findFirst({
        where: eq(cards.slug, data.slug),
      });

      if (slugCollision) {
        return { success: false, error: 'Este enlace personalizado ya está en uso. Por favor elige otro nombre o slug.' };
      }

      const newId = crypto.randomUUID();

      // 4b. Insertar nueva tarjeta con UUID propio
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

