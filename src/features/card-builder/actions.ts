'use server';

import { db } from '@/shared/api/db';
import { cards, user } from '@/entities/schema';
import { cardFormSchema, CardFormValues } from '@/entities/card/schemas';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function upsertCardAction(
  values: CardFormValues,
  userId?: string
): Promise<ActionResponse<{ slug: string }>> {
  try {
    // 1. Validar datos estrictamente con Zod
    const validated = cardFormSchema.safeParse(values);
    if (!validated.success) {
      const errorMsg = validated.error.issues.map((i) => i.message).join(', ');
      return { success: false, error: errorMsg };
    }

    const data = validated.data;

    // 2. Resolver usuario autenticado con guardrail de seguridad
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    // 3. Verificar si el slug ya existe
    const existingCard = await db.query.cards.findFirst({
      where: eq(cards.slug, data.slug),
    });

    if (existingCard && existingCard.userId !== targetUserId) {
      return { success: false, error: 'Este enlace personalizado ya está en uso. Por favor elige otro.' };
    }

    if (existingCard) {
      // Actualizar
      await db
        .update(cards)
        .set({
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
          themeConfig: data.themeConfig,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, existingCard.id));
    } else {
      // Crear nueva tarjeta
      await db.insert(cards).values({
        id: crypto.randomUUID(),
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
        themeConfig: data.themeConfig,
        isActive: true,
        viewsCount: 0,
        clicksCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath(`/c/${data.slug}`);
    revalidatePath('/cards');

    return { success: true, data: { slug: data.slug } };
  } catch (err: any) {
    console.error('Error en upsertCardAction:', err);
    return { success: false, error: err.message || 'Error al guardar la tarjeta' };
  }
}
