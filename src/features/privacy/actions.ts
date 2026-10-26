'use server';

import { db } from '@/shared/api/db';
import {
  user,
  cards,
  smartCvs,
  presentations,
  cardEvents,
  cardLeads,
  session,
  account,
  affiliateBankAccounts,
} from '@/entities/schema';
import { eq, inArray } from 'drizzle-orm';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { revalidatePath } from 'next/cache';
import {
  exportUserDataInputSchema,
  deleteUserAccountInputSchema,
  rectifyUserDataInputSchema,
  type RectifyUserDataInput,
} from '@/entities/privacy/schemas';

export interface UserDataExport {
  exportedAt: string;
  complianceStandard: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    referralCode: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  cards: any[];
  smartCvs: any[];
  presentations: any[];
  affiliateBankAccount: {
    bankName: string;
    accountType: string;
    accountNumberMasked: string;
    rut: string;
    holderName: string;
    updatedAt: Date;
  } | null;
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
    const parsedInput = exportUserDataInputSchema.safeParse({ userId });
    if (!parsedInput.success) {
      return { success: false, error: 'Parámetros de exportación inválidos.' };
    }

    const sessionResult = await getSafeAuthenticatedUserId(parsedInput.data.userId);
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

    const bankAccount = await db.query.affiliateBankAccounts.findFirst({
      where: eq(affiliateBankAccounts.userId, targetUserId),
    });

    const exportPayload: UserDataExport = {
      exportedAt: new Date().toISOString(),
      complianceStandard: 'Ley N° 21.719 de Protección de Datos Personales (Chile)',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        status: userData.status,
        referralCode: userData.referralCode ?? null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      cards: userCards,
      smartCvs: userSmartCvs,
      presentations: userPresentations,
      affiliateBankAccount: bankAccount
        ? {
            bankName: bankAccount.bankName,
            accountType: bankAccount.accountType,
            accountNumberMasked:
              bankAccount.accountNumber.length > 4
                ? `****${bankAccount.accountNumber.slice(-4)}`
                : '****',
            rut: bankAccount.rut,
            holderName: bankAccount.holderName,
            updatedAt: bankAccount.updatedAt,
          }
        : null,
    };

    return { success: true, data: exportPayload };
  } catch (error) {
    console.error('[Privacy Actions] Error en exportUserDataAction:', error);
    return { success: false, error: 'Error al exportar los datos.' };
  }
}

/**
 * Server Action: Rectificación Directa de Datos Registrales (Derecho de Rectificación - Art. 6 Ley 21.719)
 * Permite al titular corregir su nombre o razón social directamente en Turso SQLite con trazabilidad inmediata.
 */
export async function rectifyUserDataAction(
  input: RectifyUserDataInput
): Promise<{
  success: boolean;
  updatedName?: string;
  error?: string;
}> {
  try {
    const parsed = rectifyUserDataInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Datos de rectificación inválidos.',
      };
    }

    const sessionResult = await getSafeAuthenticatedUserId(parsed.data.userId);
    const targetUserId = sessionResult.userId;

    if (!targetUserId) {
      return { success: false, error: sessionResult.error || 'No autorizado.' };
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, targetUserId),
      columns: { id: true },
    });

    if (!existingUser) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    await db
      .update(user)
      .set({
        name: parsed.data.name,
        updatedAt: new Date(),
      })
      .where(eq(user.id, targetUserId));

    try {
      revalidatePath('/dashboard');
    } catch {
      // Ignorar fuera de contexto de request Next.js (ej. Vitest)
    }

    return { success: true, updatedName: parsed.data.name };
  } catch (error) {
    console.error('[Privacy Actions] Error en rectifyUserDataAction:', error);
    return { success: false, error: 'Error al procesar la rectificación de datos.' };
  }
}

/**
 * Server Action: Anonimización Destructiva y Supresión de Cuenta (Derecho al Olvido - Art. 7 Ley 21.719)
 * Elimina recursos asociados, tokens OAuth, cuentas bancarias de afiliado y anonimiza el registro
 * de forma atómica con db.batch() para cumplir con la legislación chilena sin romper la integridad referencial financiera.
 */
export async function deleteAndAnonymizeUserAccountAction(
  userId?: string,
  confirmationText?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const parsed = deleteUserAccountInputSchema.safeParse({
      userId,
      confirmationText: confirmationText ?? '',
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Debes confirmar escribiendo "ELIMINAR MI CUENTA".',
      };
    }

    const sessionResult = await getSafeAuthenticatedUserId(parsed.data.userId);
    const targetUserId = sessionResult.userId;

    if (!targetUserId) {
      return { success: false, error: sessionResult.error || 'No autorizado.' };
    }

    // Obtener IDs de tarjetas del usuario para purgar su telemetría en bloque sin bucle N+1
    const userCards = await db.query.cards.findMany({
      where: eq(cards.userId, targetUserId),
      columns: { id: true },
    });
    const cardIds = userCards.map((c) => c.id);

    const anonymousEmail = `deleted_${targetUserId.slice(0, 8)}_${Date.now()}@anonymized.soyindi.cl`;

    const batchStatements: any[] = [
      // 1. Revocar sesiones activas y tokens OAuth (Google / credenciales)
      db.delete(session).where(eq(session.userId, targetUserId)),
      db.delete(account).where(eq(account.userId, targetUserId)),
      // 2. Suprimir datos bancarios sensibles (RUT, cuenta bancaria TEF) y prospectos asociados
      db.delete(affiliateBankAccounts).where(eq(affiliateBankAccounts.userId, targetUserId)),
      db.delete(cardLeads).where(eq(cardLeads.ownerUserId, targetUserId)),
      // 3. Suprimir presentaciones y Smart CVs
      db.delete(presentations).where(eq(presentations.userId, targetUserId)),
      db.delete(smartCvs).where(eq(smartCvs.userId, targetUserId)),
    ];

    if (cardIds.length > 0) {
      batchStatements.push(db.delete(cardEvents).where(inArray(cardEvents.cardId, cardIds)));
    }

    batchStatements.push(
      // 4. Suprimir tarjetas digitales
      db.delete(cards).where(eq(cards.userId, targetUserId)),
      // 5. Anonimización destructiva del registro de usuario (preserva FK contable en payments_history)
      db
        .update(user)
        .set({
          name: 'Usuario Anonimizado',
          email: anonymousEmail,
          status: 'CANCELLED',
          image: null,
          referralCode: null,
          referredBy: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, targetUserId))
    );

    await db.batch(batchStatements as [any, ...any[]]);

    return { success: true };
  } catch (error) {
    console.error('[Privacy Actions] Error en deleteAndAnonymizeUserAccountAction:', error);
    return { success: false, error: 'Error al procesar la eliminación de la cuenta.' };
  }
}
