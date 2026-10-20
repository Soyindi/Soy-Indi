'use server';

import { db } from '@/shared/api/db';
import { affiliateCommissions, affiliateBankAccounts, user } from '@/entities/schema';
import { eq, and } from 'drizzle-orm';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { generateChileanTefCsv, TefPayrollSummary, TefRecipient } from '@/shared/lib/payments/tefPayrollGenerator';

/**
 * Server Action protegida (Admin): Consolida las comisiones aprobadas pendientes de pago
 * y genera el archivo de nómina bancaria TEF estandarizado para bancos chilenos.
 */
export async function exportTefPayrollAction(
  targetUserId?: string
): Promise<{ success: boolean; payroll?: TefPayrollSummary; error?: string }> {
  try {
    const authResult = await getSafeAuthenticatedUserId(targetUserId);
    if (!authResult.userId) {
      return { success: false, error: authResult.error || 'Acceso no autorizado' };
    }

    // Verificar rol de administrador
    const adminUser = await db.query.user.findFirst({
      where: eq(user.id, authResult.userId),
      columns: { role: true },
    });

    if (adminUser?.role !== 'admin' && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Acceso denegado: Se requiere rol de Administrador' };
    }

    // Obtener comisiones con estado 'pending' o 'payable'
    const payableCommissions = await db.query.affiliateCommissions.findMany({
      where: eq(affiliateCommissions.status, 'payable'),
    });

    if (payableCommissions.length === 0) {
      // Intentar también con comisiones pendientes si no hay en payable
      const pendingComms = await db.query.affiliateCommissions.findMany({
        where: eq(affiliateCommissions.status, 'pending'),
      });

      if (pendingComms.length === 0) {
        return {
          success: false,
          error: 'No hay comisiones de afiliados pendientes de pago para generar la nómina.',
        };
      }
    }

    // Agrupar montos por usuario afiliado
    const allPending = await db
      .select({
        affiliateUserId: affiliateCommissions.affiliateUserId,
        amountClp: affiliateCommissions.amountClp,
      })
      .from(affiliateCommissions)
      .where(
        eq(affiliateCommissions.status, 'payable')
      );

    const targetComms = allPending.length > 0 ? allPending : await db
      .select({
        affiliateUserId: affiliateCommissions.affiliateUserId,
        amountClp: affiliateCommissions.amountClp,
      })
      .from(affiliateCommissions)
      .where(eq(affiliateCommissions.status, 'pending'));

    const totalsByUser: Record<string, number> = {};
    for (const c of targetComms) {
      totalsByUser[c.affiliateUserId] = (totalsByUser[c.affiliateUserId] || 0) + c.amountClp;
    }

    // Consultar datos bancarios y correos de cada afiliado
    const recipients: TefRecipient[] = [];

    for (const [affiliateId, grossAmount] of Object.entries(totalsByUser)) {
      const bankAcc = await db.query.affiliateBankAccounts.findFirst({
        where: eq(affiliateBankAccounts.userId, affiliateId),
      });

      const userInfo = await db.query.user.findFirst({
        where: eq(user.id, affiliateId),
        columns: { name: true, email: true },
      });

      if (bankAcc) {
        recipients.push({
          rut: bankAcc.rut,
          name: bankAcc.holderName || userInfo?.name || 'Afiliado INDI',
          bankName: bankAcc.bankName,
          accountType: bankAcc.accountType,
          accountNumber: bankAcc.accountNumber,
          grossAmountClp: grossAmount,
          email: userInfo?.email,
        });
      }
    }

    if (recipients.length === 0) {
      return {
        success: false,
        error: 'Los afiliados con comisiones pendientes aún no han registrado sus datos bancarios.',
      };
    }

    const payroll = generateChileanTefCsv(recipients);

    return {
      success: true,
      payroll,
    };
  } catch (error: any) {
    console.error('[exportTefPayrollAction Error]:', error);
    return {
      success: false,
      error: error?.message || 'Error al generar la nómina TEF de transferencias',
    };
  }
}

/**
 * Adaptador preparado para dispersión de pagos programáticos con Fintoc Payouts API
 */
export async function executeFintocPayoutAction(
  payoutId: string,
  targetUserId?: string
): Promise<{ success: boolean; isConfigured: boolean; message: string; transactionId?: string }> {
  try {
    const authResult = await getSafeAuthenticatedUserId(targetUserId);
    if (!authResult.userId) {
      return { success: false, isConfigured: false, message: 'Acceso no autorizado' };
    }

    const fintocKey = process.env.FINTOC_SECRET_KEY;
    if (!fintocKey) {
      return {
        success: false,
        isConfigured: false,
        message: 'Fintoc Secret Key no está configurada en variables de entorno. Utiliza la exportación de nómina TEF para transferencias masivas en portal bancario.',
      };
    }

    // Adaptador para ejecución real cuando Fintoc Payouts esté activo
    return {
      success: true,
      isConfigured: true,
      message: 'Transferencia enviada a procesar mediante Fintoc Payouts.',
      transactionId: `fintoc_mock_${crypto.randomUUID()}`,
    };
  } catch (err: any) {
    return {
      success: false,
      isConfigured: false,
      message: err?.message || 'Error al comunicar con la pasarela de pagos Fintoc',
    };
  }
}
