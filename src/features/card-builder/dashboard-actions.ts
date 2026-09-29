'use server';

import { db } from '@/shared/api/db';
import { cards, user } from '@/entities/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getUserCardsAction(userId?: string) {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      // Buscar usuario demo o el primer usuario disponible
      const defaultUser = await db.query.user.findFirst();
      if (defaultUser) {
        targetUserId = defaultUser.id;
      }
    }

    if (!targetUserId) {
      return { success: true, data: [] };
    }

    const userCards = await db.query.cards.findMany({
      where: eq(cards.userId, targetUserId),
      orderBy: [desc(cards.createdAt)],
    });

    return { success: true, data: userCards };
  } catch (err: any) {
    console.error('Error fetching cards:', err);
    return { success: false, error: err.message, data: [] };
  }
}

export async function deleteCardAction(cardId: string) {
  try {
    await db.delete(cards).where(eq(cards.id, cardId));
    revalidatePath('/cards');
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting card:', err);
    return { success: false, error: err.message };
  }
}

export async function toggleCardActiveAction(cardId: string, currentStatus: boolean) {
  try {
    await db
      .update(cards)
      .set({ isActive: !currentStatus, updatedAt: new Date() })
      .where(eq(cards.id, cardId));
    revalidatePath('/cards');
    return { success: true, newStatus: !currentStatus };
  } catch (err: any) {
    console.error('Error toggling card active status:', err);
    return { success: false, error: err.message };
  }
}
