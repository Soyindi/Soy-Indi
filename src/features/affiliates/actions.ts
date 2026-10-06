'use server';

import { db } from '@/shared/api/db';
import { user, affiliateBankAccounts, affiliateCommissions, paymentsHistory } from '@/entities/schema';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq, desc, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { 
  affiliateBankAccountSchema, 
  AffiliateBankAccountInput, 
  AffiliateOverview,
  AdminAffiliatePayoutItem
} from '@/entities/affiliate/schemas';

/**
 * Porcentaje de comisión estándar del programa de afiliados INDI (25%)
 */
export const AFFILIATE_COMMISSION_PERCENTAGE = 25;

/**
 * Calcula la próxima fecha de corte quincenal (día 1 o día 15 del mes)
 */
export function calculateNextPayoutDate(currentDate: Date = new Date()): string {
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  if (day < 15) {
    const nextDate = new Date(year, month, 15);
    return nextDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  } else {
    // Día 1 del mes siguiente
    const nextDate = new Date(year, month + 1, 1);
    return nextDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

/**
 * Consulta de Resumen de Afiliado para el usuario conectado
 */
export async function getAffiliateOverviewAction(userId?: string): Promise<{
  success: boolean;
  data?: AffiliateOverview;
  error?: string;
}> {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: 'Debes iniciar sesión para acceder a tu programa de afiliados.' };
    }
    const currentUserId = sessionResult.userId;

    // Obtener datos del usuario
    let targetUser = await db.query.user.findFirst({
      where: eq(user.id, currentUserId),
    });

    if (!targetUser) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    // Si el usuario no tiene referralCode aún, generarlo de forma retrocompatible
    let referralCode = targetUser.referralCode;
    if (!referralCode) {
      const cleanName = (targetUser.name || 'user')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 10);
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      referralCode = `${cleanName || 'indi'}-${randomSuffix}`;

      await db
        .update(user)
        .set({ referralCode })
        .where(eq(user.id, currentUserId));
    }

    // Obtener cuenta bancaria si existe
    const bankRecord = await db.query.affiliateBankAccounts.findFirst({
      where: eq(affiliateBankAccounts.userId, currentUserId),
    });

    // Obtener comisiones históricas del afiliado
    const commissions = await db.query.affiliateCommissions.findMany({
      where: eq(affiliateCommissions.affiliateUserId, currentUserId),
      orderBy: [desc(affiliateCommissions.createdAt)],
      limit: 50,
    });

    // Calcular balances
    let totalEarningsClp = 0;
    let pendingBalanceClp = 0;
    let paidBalanceClp = 0;

    for (const c of commissions) {
      totalEarningsClp += c.amountClp;
      if (c.status === 'paid') {
        paidBalanceClp += c.amountClp;
      } else {
        pendingBalanceClp += c.amountClp;
      }
    }

    // Contar total de usuarios que fueron referidos por este usuario
    const referredUsers = await db.query.user.findMany({
      where: eq(user.referredBy, currentUserId),
    });

    const origin = process.env.BETTER_AUTH_URL || 'https://indi.bio';
    const referralUrl = `${origin}/start?ref=${referralCode}`;

    const overview: AffiliateOverview = {
      referralCode,
      referralUrl,
      commissionPercentage: AFFILIATE_COMMISSION_PERCENTAGE,
      totalReferralsCount: referredUsers.length,
      totalEarningsClp,
      pendingBalanceClp,
      paidBalanceClp,
      nextPayoutDate: calculateNextPayoutDate(),
      bankAccount: bankRecord ? {
        bankName: bankRecord.bankName as any,
        accountType: bankRecord.accountType as any,
        accountNumber: bankRecord.accountNumber,
        rut: bankRecord.rut,
        holderName: bankRecord.holderName,
      } : null,
      recentCommissions: commissions.map((c) => ({
        id: c.id,
        amountClp: c.amountClp,
        status: c.status as 'pending' | 'payable' | 'paid',
        createdAt: new Date(c.createdAt),
        paidAt: c.paidAt ? new Date(c.paidAt) : null,
      })),
    };

    return { success: true, data: overview };
  } catch (error: any) {
    console.error('Error obteniendo resumen de afiliados:', error);
    return { success: false, error: error.message || 'Error al cargar resumen de afiliados.' };
  }
}

/**
 * Guardar o Actualizar Datos Bancarios para Transferencias Quincenales
 */
export async function saveAffiliateBankAccountAction(
  data: AffiliateBankAccountInput,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: 'Acceso no autorizado.' };
    }
    const currentUserId = sessionResult.userId;

    const parsed = affiliateBankAccountSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos bancarios inválidos.' };
    }

    const { bankName, accountType, accountNumber, rut, holderName } = parsed.data;

    // Buscar si ya tiene una cuenta registrada
    const existing = await db.query.affiliateBankAccounts.findFirst({
      where: eq(affiliateBankAccounts.userId, currentUserId),
    });

    const now = new Date();

    if (existing) {
      await db
        .update(affiliateBankAccounts)
        .set({
          bankName,
          accountType,
          accountNumber,
          rut,
          holderName,
          updatedAt: now,
        })
        .where(eq(affiliateBankAccounts.userId, currentUserId));
    } else {
      await db.insert(affiliateBankAccounts).values({
        userId: currentUserId,
        bankName,
        accountType,
        accountNumber,
        rut,
        holderName,
        updatedAt: now,
      });
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error guardando cuenta bancaria de afiliado:', error);
    return { success: false, error: error.message || 'Error al guardar los datos bancarios.' };
  }
}

/**
 * Atribuir referido mediante código de referido
 */
export async function attributeReferralAction(newUserId: string, referralCode: string) {
  try {
    if (!referralCode || !newUserId) return;

    const referrer = await db.query.user.findFirst({
      where: eq(user.referralCode, referralCode),
    });

    if (referrer && referrer.id !== newUserId) {
      await db
        .update(user)
        .set({ referredBy: referrer.id })
        .where(eq(user.id, newUserId));
    }
  } catch (err) {
    console.error('Error atribuyendo referido:', err);
  }
}

/**
 * Registrar comisión cuando un pago es aprobado (Invocado desde el Webhook de Mercado Pago)
 */
export async function processAffiliateCommissionOnPayment(paymentId: string, buyerUserId: string, transactionAmount: number) {
  try {
    const buyer = await db.query.user.findFirst({
      where: eq(user.id, buyerUserId),
    });

    if (!buyer || !buyer.referredBy) {
      // El comprador no fue referido por ningún afiliado
      return;
    }

    const referrerId = buyer.referredBy;
    const commissionClp = Math.round(transactionAmount * (AFFILIATE_COMMISSION_PERCENTAGE / 100));

    if (commissionClp <= 0) return;

    await db.insert(affiliateCommissions).values({
      affiliateUserId: referrerId,
      buyerUserId,
      paymentId,
      amountClp: commissionClp,
      status: 'payable', // Listo para el corte quincenal
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('Error generando comisión de afiliado:', err);
  }
}

/**
 * Panel de Administración: Listar Liquidaciones Quincenales Pendientes
 */
export async function getAdminAffiliatePayoutsAction(userId?: string): Promise<{
  success: boolean;
  data?: AdminAffiliatePayoutItem[];
  error?: string;
}> {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: 'Acceso no autorizado.' };
    }

    // Verificar rol admin
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, sessionResult.userId),
    });

    if (currentUser?.role !== 'admin' && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Permisos insuficientes de administrador.' };
    }

    // Obtener comisiones 'payable' agrupadas
    const payableCommissions = await db.query.affiliateCommissions.findMany({
      where: eq(affiliateCommissions.status, 'payable'),
    });

    // Agrupar por afiliado
    const map = new Map<string, { totalPayableClp: number; count: number }>();
    for (const c of payableCommissions) {
      const current = map.get(c.affiliateUserId) || { totalPayableClp: 0, count: 0 };
      current.totalPayableClp += c.amountClp;
      current.count += 1;
      map.set(c.affiliateUserId, current);
    }

    const results: AdminAffiliatePayoutItem[] = [];

    for (const [affiliateId, stats] of map.entries()) {
      const affiliateData = await db.query.user.findFirst({
        where: eq(user.id, affiliateId),
      });
      const bankData = await db.query.affiliateBankAccounts.findFirst({
        where: eq(affiliateBankAccounts.userId, affiliateId),
      });

      if (affiliateData) {
        results.push({
          affiliateId,
          affiliateName: affiliateData.name,
          affiliateEmail: affiliateData.email,
          totalPayableClp: stats.totalPayableClp,
          pendingCommissionsCount: stats.count,
          bankAccount: bankData ? {
            bankName: bankData.bankName as any,
            accountType: bankData.accountType as any,
            accountNumber: bankData.accountNumber,
            rut: bankData.rut,
            holderName: bankData.holderName,
          } : null,
        });
      }
    }

    return { success: true, data: results };
  } catch (error: any) {
    console.error('Error en getAdminAffiliatePayoutsAction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Panel de Administración: Marcar comisiones de un afiliado como pagadas
 */
export async function markAffiliateCommissionsAsPaidAction(affiliateUserId: string, userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: 'Acceso no autorizado.' };
    }

    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, sessionResult.userId),
    });

    if (currentUser?.role !== 'admin' && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Permisos insuficientes de administrador.' };
    }

    const now = new Date();
    await db
      .update(affiliateCommissions)
      .set({
        status: 'paid',
        paidAt: now,
      })
      .where(and(
        eq(affiliateCommissions.affiliateUserId, affiliateUserId),
        eq(affiliateCommissions.status, 'payable')
      ));

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error marcando comisiones como pagadas:', error);
    return { success: false, error: error.message };
  }
}
