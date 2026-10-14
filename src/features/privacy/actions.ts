'use server';

import { db } from '@/shared/api/db';
import { user, cards, smartCvs, presentations, cardEvents, session } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';

export interface UserDataExport {
  exportedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: Date;
  };
  cards: any[];
  smartCvs: any[];
  presentations: any[];
}

/**
 * Server Action: Exportación de Datos Personales (Derecho de Acceso y Portabilidad - Ley 21.719)
 * Genera un dump estructurado en JSON de todos los datos personales y recursos creados por el usuario.
 */
export async function exportUserDataAction(userId?: string): Promise<{
  success: boolean;
  data?: UserDataExport;
  error?: string;
}> {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    const targetUserId = sessionResult.userId;

    if (!targetUserId) {
      return { success: false, error: sessionResult.error || 'No autorizado.' };
    }

    const userData = await db.query.user.findFirst({
      where: eq(user.id, targetUserId),
    });

    if (!userData) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    const userCards = await db.query.cards.findMany({
      where: eq(cards.userId, targetUserId),
    });

    const userSmartCvs = await db.query.smartCvs.findMany({
      where: eq(smartCvs.userId, targetUserId),
    });

    const userPresentations = await db.query.presentations.findMany({
      where: eq(presentations.userId, targetUserId),
    });

    const exportPayload: UserDataExport = {
      exportedAt: new Date().toISOString(),
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        status: userData.status,
        createdAt: userData.createdAt,
      },
      cards: userCards,
      smartCvs: userSmartCvs,
      presentations: userPresentations,
    };

    return { success: true, data: exportPayload };
  } catch (error) {
    console.error('[Privacy Actions] Error en exportUserDataAction:', error);
    return { success: false, error: 'Error al exportar los datos.' };
  }
}

/**
 * Server Action: Anonimización Destructiva y Supresión de Cuenta (Derecho al Olvido - Ley 21.719)
 * Elimina recursos asociados y anonimiza el registro para cumplir con la legislación chilena
 * sin romper la integridad referencial financiera.
 */
export async function deleteAndAnonymizeUserAccountAction(
  userId?: string,
  confirmationText?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (confirmationText !== 'ELIMINAR MI CUENTA') {
      return { success: false, error: 'Debes confirmar escribiendo "ELIMINAR MI CUENTA".' };
    }

    const sessionResult = await getSafeAuthenticatedUserId(userId);
    const targetUserId = sessionResult.userId;

    if (!targetUserId) {
      return { success: false, error: sessionResult.error || 'No autorizado.' };
    }

    // 1. Eliminar sesiones activas
    await db.delete(session).where(eq(session.userId, targetUserId));

    // 2. Eliminar presentaciones
    await db.delete(presentations).where(eq(presentations.userId, targetUserId));

    // 3. Eliminar Smart CVs
    await db.delete(smartCvs).where(eq(smartCvs.userId, targetUserId));

    // 4. Eliminar eventos de tarjetas antes de las tarjetas
    const userCards = await db.query.cards.findMany({
      where: eq(cards.userId, targetUserId),
      columns: { id: true },
    });
    for (const c of userCards) {
      await db.delete(cardEvents).where(eq(cardEvents.cardId, c.id));
    }

    // 5. Eliminar tarjetas
    await db.delete(cards).where(eq(cards.userId, targetUserId));

    // 6. Anonimización Destructiva del registro de usuario
    const anonymousEmail = `deleted_${targetUserId.slice(0, 8)}_${Date.now()}@anonymized.soyindi.cl`;
    await db
      .update(user)
      .set({
        name: 'Usuario Anonimizado',
        email: anonymousEmail,
        status: 'CANCELLED',
        image: null,
        referralCode: null,
      })
      .where(eq(user.id, targetUserId));

    return { success: true };
  } catch (error) {
    console.error('[Privacy Actions] Error en deleteAndAnonymizeUserAccountAction:', error);
    return { success: false, error: 'Error al procesar la eliminación de la cuenta.' };
  }
}
