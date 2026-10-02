'use server';

import { db } from '@/shared/api/db';
import { cards } from '@/entities/schema';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getUserCardsAction(userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: true, data: [] };
    }
    const targetUserId = sessionResult.userId;

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

export async function deleteCardAction(cardId: string, userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    await db
      .delete(cards)
      .where(and(eq(cards.id, cardId), eq(cards.userId, targetUserId)));

    revalidatePath('/cards');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting card:', err);
    return { success: false, error: err.message };
  }
}

export async function toggleCardActiveAction(cardId: string, currentStatus: boolean, userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    await db
      .update(cards)
      .set({ isActive: !currentStatus, updatedAt: new Date() })
      .where(and(eq(cards.id, cardId), eq(cards.userId, targetUserId)));

    revalidatePath('/cards');
    revalidatePath('/dashboard');
    return { success: true, newStatus: !currentStatus };
  } catch (err: any) {
    console.error('Error toggling card active status:', err);
    return { success: false, error: err.message };
  }
}

export async function getCardByIdAction(cardId: string, userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    const card = await db.query.cards.findFirst({
      where: and(eq(cards.id, cardId), eq(cards.userId, targetUserId)),
    });

    if (!card) {
      return { success: false, error: 'Tarjeta no encontrada o no tienes permisos para acceder' };
    }

    return { success: true, data: card };
  } catch (err: any) {
    console.error('Error fetching card by id:', err);
    return { success: false, error: err.message };
  }
}
