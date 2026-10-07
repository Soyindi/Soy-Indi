'use server';

import { db } from '@/shared/api/db';
import { user, affiliateBankAccounts, affiliateCommissions, paymentsHistory } from '@/entities/schema';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq, desc, and, ne, sql, inArray, isNotNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { 
  affiliateBankAccountSchema, 
  AffiliateBankAccountInput, 
  AffiliateOverview,
  AdminAffiliatePayoutItem,
  AdminReferralAuditItem,
  MarkAffiliateCommissionsPaidSchema,
  AFFILIATE_COMMISSION_PERCENTAGE,
  calculateNextPayoutDate,
  formatReferralCode,
  isReservedReferralCode,
  updateReferralCodeSchema
} from '@/entities/affiliate/schemas';

export interface ReferralCodeAvailabilityResult {
  available: boolean;
  status: 'available' | 'taken' | 'reserved' | 'invalid';
  message: string;
}

/**
 * Comprueba disponibilidad de un código de referido personalizado en tiempo real
 */
export async function checkReferralCodeAvailabilityAction(
  rawCode: string,
  userId?: string
): Promise<ReferralCodeAvailabilityResult> {
  try {
    const formatted = formatReferralCode(rawCode);

    if (!formatted || formatted.length < 3) {
      return {
        available: false,
        status: 'invalid',
        message: 'El código debe tener al menos 3 caracteres alfanuméricos.',
      };
    }

    if (formatted.length > 24) {
      return {
        available: false,
        status: 'invalid',
        message: 'El código no puede superar los 24 caracteres.',
      };
    }

    if (isReservedReferralCode(formatted)) {
      return {
        available: false,
        status: 'reserved',
        message: 'Este código está reservado por el sistema.',
      };
    }

    const sessionResult = await getSafeAuthenticatedUserId(userId);
    const currentUserId = sessionResult.userId;

    // Verificar colisión en la base de datos
    const existing = await db.query.user.findFirst({
      where: currentUserId
        ? and(eq(user.referralCode, formatted), ne(user.id, currentUserId))
        : eq(user.referralCode, formatted),
    });

    if (existing) {
      return {
        available: false,
        status: 'taken',
        message: 'Este código ya está en uso por otro miembro.',
      };
    }

    return {
      available: true,
      status: 'available',
      message: '¡Código disponible!',
    };
  } catch (error: any) {
    console.error('Error comprobando disponibilidad de código de referido:', error);
    return {
      available: false,
      status: 'invalid',
      message: 'Error al comprobar disponibilidad del código.',
    };
  }
}

/**
 * Actualiza el código de referido del usuario autenticado
 */
export async function updateReferralCodeAction(
  newCode: string,
  userId?: string
): Promise<{ success: boolean; referralCode?: string; error?: string }> {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: 'Debes iniciar sesión para personalizar tu código.' };
    }
    const currentUserId = sessionResult.userId;

    const formatted = formatReferralCode(newCode);
    const validation = updateReferralCodeSchema.safeParse({ referralCode: formatted });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Código de referido inválido.',
      };
    }

    const targetCode = validation.data.referralCode;

    // Verificar si ya está en uso por otro usuario
    const collision = await db.query.user.findFirst({
      where: and(eq(user.referralCode, targetCode), ne(user.id, currentUserId)),
    });

    if (collision) {
      return { success: false, error: 'El código seleccionado ya está ocupado.' };
    }

    // Actualizar en base de datos
    await db
      .update(user)
      .set({ referralCode: targetCode, updatedAt: new Date() })
      .where(eq(user.id, currentUserId));

    revalidatePath('/dashboard');
    return { success: true, referralCode: targetCode };
  } catch (error: any) {
    console.error('Error actualizando código de referido:', error);
    return { success: false, error: error.message || 'Error al actualizar el código de referido.' };
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

    // Clasificar usuarios referidos (Totales, Pro Activos, En Trial)
    const referredUsers = await db.query.user.findMany({
      where: eq(user.referredBy, currentUserId),
    });

    let proReferralsCount = 0;
    let trialReferralsCount = 0;

    for (const refUser of referredUsers) {
      if (refUser.status === 'ACTIVE') {
        proReferralsCount += 1;
      } else {
        trialReferralsCount += 1;
      }
    }

    const totalReferralsCount = referredUsers.length;
    const conversionRate = totalReferralsCount > 0 
      ? Math.round((proReferralsCount / totalReferralsCount) * 100) 
      : 0;

    const origin = process.env.BETTER_AUTH_URL || 'https://soyindi.cl';
    const referralUrl = `${origin}/start?ref=${referralCode}`;
    const directSignupUrl = `${origin}/login?mode=signup&ref=${referralCode}`;

    const overview: AffiliateOverview = {
      referralCode,
      referralUrl,
      directSignupUrl,
      commissionPercentage: AFFILIATE_COMMISSION_PERCENTAGE,
      totalReferralsCount,
      proReferralsCount,
      trialReferralsCount,
      conversionRate,
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

export interface ReferralPartnerInfo {
  valid: boolean;
  referralCode: string;
  partnerName?: string;
}

/**
 * Obtiene información pública del referente para mostrar bienvenida personalizada
 */
export async function getReferralPartnerInfoAction(rawCode?: string | null): Promise<ReferralPartnerInfo | null> {
  try {
    const { sanitizeReferralCode } = await import('@/entities/affiliate/referral-cookie');
    const sanitized = sanitizeReferralCode(rawCode);
    if (!sanitized) return null;

    const referrer = await db.query.user.findFirst({
      where: eq(user.referralCode, sanitized),
      columns: {
        id: true,
        name: true,
        referralCode: true,
      },
    });

    if (!referrer || !referrer.referralCode) return null;

    // Extraer primer nombre o alias público para privacidad
    const firstName = referrer.name ? referrer.name.trim().split(' ')[0] : undefined;

    return {
      valid: true,
      referralCode: referrer.referralCode,
      partnerName: firstName,
    };
  } catch (err) {
    console.error('Error obteniendo información de referente:', err);
    return null;
  }
}

/**
 * Atribuir referido mediante código de referido (con soporte de sanitización y cookies)
 */
export async function attributeReferralAction(newUserId: string, rawReferralCode: string) {
  try {
    const { sanitizeReferralCode } = await import('@/entities/affiliate/referral-cookie');
    const { normalizeEmailForAntiGaming } = await import('@/entities/affiliate/schemas');
    const referralCode = sanitizeReferralCode(rawReferralCode);
    if (!referralCode || !newUserId) return;

    // Verificar que el usuario no tenga ya un referente asignado (first-touch / sticky attribution)
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, newUserId),
    });

    if (!currentUser || currentUser.referredBy) {
      return;
    }

    const referrer = await db.query.user.findFirst({
      where: eq(user.referralCode, referralCode),
    });

    if (!referrer || referrer.id === newUserId) {
      return;
    }

    // Heurística Anti-Gaming 2026: Detección de auto-referidos por normalización de correo
    if (currentUser.email && referrer.email) {
      const normalizedCurrent = normalizeEmailForAntiGaming(currentUser.email);
      const normalizedReferrer = normalizeEmailForAntiGaming(referrer.email);
      if (normalizedCurrent === normalizedReferrer) {
        console.warn(`[Anti-Gaming] Intento de auto-referido bloqueado para usuario ${newUserId} con email derivado ${currentUser.email}`);
        return;
      }
    }

    await db
      .update(user)
      .set({ referredBy: referrer.id })
      .where(eq(user.id, newUserId));
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

    // Protección anti-auto-comisión si las cuentas son idénticas
    if (referrerId === buyerUserId) {
      return;
    }

    const commissionClp = Math.round(transactionAmount * (AFFILIATE_COMMISSION_PERCENTAGE / 100));

    if (commissionClp <= 0) return;

    // Idempotencia: Verificar si ya existe comisión registrada para este paymentId
    const existingCommission = await db.query.affiliateCommissions.findFirst({
      where: eq(affiliateCommissions.paymentId, paymentId),
    });

    if (existingCommission) {
      return;
    }

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
 * Reversión de comisión ante reembolsos o contracargos (Refunds / Chargebacks de Mercado Pago)
 */
export async function processAffiliateRefundOnPayment(paymentId: string, reason: 'refunded' | 'charged_back' = 'refunded') {
  try {
    const existing = await db.query.affiliateCommissions.findFirst({
      where: eq(affiliateCommissions.paymentId, paymentId),
    });

    if (!existing) return;

    // Si ya está marcada como reembolsada o contra-cargo, no hacer nada
    if (existing.status === 'refunded' || existing.status === 'charged_back') {
      return;
    }

    await db
      .update(affiliateCommissions)
      .set({
        status: reason,
      })
      .where(eq(affiliateCommissions.id, existing.id));

    console.info(`[Affiliate Refund] Comisión ${existing.id} revertida con estado '${reason}' para pago ${paymentId}`);
  } catch (err) {
    console.error('Error procesando reversión de comisión:', err);
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

    // Verificar rol admin (por base de datos o correos autorizados)
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

    const affiliateIds = Array.from(map.keys());
    if (affiliateIds.length === 0) {
      return { success: true, data: [] };
    }

    // Batching sin consultas N+1
    const [affiliatesList, bankAccountsList] = await Promise.all([
      db.query.user.findMany({
        where: inArray(user.id, affiliateIds),
      }),
      db.query.affiliateBankAccounts.findMany({
        where: inArray(affiliateBankAccounts.userId, affiliateIds),
      }),
    ]);

    const affiliatesMap = new Map<string, any>();
    for (const u of affiliatesList) affiliatesMap.set(u.id, u);

    const banksMap = new Map<string, any>();
    for (const b of bankAccountsList) banksMap.set(b.userId, b);

    const results: AdminAffiliatePayoutItem[] = [];

    for (const [affiliateId, stats] of map.entries()) {
      const affiliateData = affiliatesMap.get(affiliateId);
      const bankData = banksMap.get(affiliateId);

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
    const parseResult = MarkAffiliateCommissionsPaidSchema.safeParse({ affiliateUserId });
    if (!parseResult.success) {
      return { success: false, error: 'Parámetros inválidos: ID del afiliado es requerido.' };
    }

    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: 'Acceso no autorizado.' };
    }

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

/**
 * Panel de Administración: Auditoría en tiempo real de todos los usuarios registrados con código de referidos
 */
export async function getAdminReferralsAuditAction(userId?: string): Promise<{
  success: boolean;
  data?: AdminReferralAuditItem[];
  error?: string;
}> {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: 'Acceso no autorizado.' };
    }

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

    // Obtener todos los usuarios que fueron referidos por alguien (filtrando nulos y cadenas vacías)
    const referredUsers = await db.query.user.findMany({
      where: and(isNotNull(user.referredBy), ne(user.referredBy, '')),
      orderBy: [desc(user.createdAt)],
      limit: 200,
    });

    // Obtener comisiones para calcular el aporte por usuario
    const allCommissions = await db.query.affiliateCommissions.findMany();
    const commissionsByBuyer = new Map<string, number>();
    for (const comm of allCommissions) {
      const current = commissionsByBuyer.get(comm.buyerUserId) || 0;
      commissionsByBuyer.set(comm.buyerUserId, current + comm.amountClp);
    }

    // Mapear referentes y sus datos bancarios de manera eficiente con inArray
    const referrerIds = Array.from(new Set(referredUsers.map((u) => u.referredBy).filter(Boolean))) as string[];
    const referrersMap = new Map<string, any>();
    const bankAccountsMap = new Map<string, any>();

    if (referrerIds.length > 0) {
      const [allReferrerUsers, allBankAccounts] = await Promise.all([
        db.query.user.findMany({
          where: inArray(user.id, referrerIds),
        }),
        db.query.affiliateBankAccounts.findMany({
          where: inArray(affiliateBankAccounts.userId, referrerIds),
        }),
      ]);

      for (const u of allReferrerUsers) {
        referrersMap.set(u.id, u);
      }

      for (const b of allBankAccounts) {
        bankAccountsMap.set(b.userId, {
          bankName: b.bankName as any,
          accountType: b.accountType as any,
          accountNumber: b.accountNumber,
          rut: b.rut,
          holderName: b.holderName,
        });
      }
    }

    const auditList: AdminReferralAuditItem[] = referredUsers.map((u) => {
      const referrer = u.referredBy ? referrersMap.get(u.referredBy) : null;
      const bankAccount = u.referredBy ? bankAccountsMap.get(u.referredBy) || null : null;
      return {
        referredUserId: u.id,
        referredUserName: u.name || 'Usuario sin nombre',
        referredUserEmail: u.email || 'Sin correo',
        referredUserStatus: (u.status as any) || 'TRIAL',
        registeredAt: new Date(u.createdAt),
        trialEndsAt: u.trialEndsAt ? new Date(u.trialEndsAt) : null,
        referrerId: u.referredBy || '',
        referrerName: referrer?.name || 'Afiliado desconocido',
        referrerEmail: referrer?.email || '',
        referrerCode: referrer?.referralCode || 'sin-codigo',
        referrerBankAccount: bankAccount,
        totalCommissionsGeneratedClp: commissionsByBuyer.get(u.id) || 0,
      };
    });

    return { success: true, data: auditList };
  } catch (error: any) {
    console.error('Error en getAdminReferralsAuditAction:', error);
    return { success: false, error: error.message || 'Error al obtener auditoría de referidos.' };
  }
}

/**
 * Panel de Administración: Consulta consolidada para sincronización en tiempo real
 */
export async function getAdminDashboardDataAction(userId?: string): Promise<{
  success: boolean;
  payouts: AdminAffiliatePayoutItem[];
  referralsAudit: AdminReferralAuditItem[];
  error?: string;
}> {
  try {
    const [payoutsRes, auditRes] = await Promise.all([
      getAdminAffiliatePayoutsAction(userId),
      getAdminReferralsAuditAction(userId),
    ]);

    if (!payoutsRes.success) {
      return { success: false, payouts: [], referralsAudit: [], error: payoutsRes.error };
    }
    if (!auditRes.success) {
      return { success: false, payouts: payoutsRes.data || [], referralsAudit: [], error: auditRes.error };
    }

    return {
      success: true,
      payouts: payoutsRes.data || [],
      referralsAudit: auditRes.data || [],
    };
  } catch (error: any) {
    console.error('Error en getAdminDashboardDataAction:', error);
    return { success: false, payouts: [], referralsAudit: [], error: error.message };
  }
}

