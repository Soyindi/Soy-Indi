'use server';

import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { cardLeads, cards } from '@/entities/schema';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';

const SubmitCardLeadInputSchema = z.object({
  cardId: z.string().min(1, 'El ID de la tarjeta es requerido'),
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email('Formato de correo electrónico inválido').max(100).optional().nullable().or(z.literal('')),
  company: z.string().trim().max(100).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
}).refine(
  (data) => Boolean(data.phone?.trim() || (data.email && data.email.trim())),
  {
    message: 'Debes proporcionar al menos un teléfono de contacto o un correo electrónico',
    path: ['phone'],
  }
);

export type SubmitCardLeadInput = z.infer<typeof SubmitCardLeadInputSchema>;

export interface SubmitCardLeadResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

/**
 * Server Action pública: Permite a un visitante dejar sus datos de contacto en una tarjeta digital
 */
export async function submitCardLeadAction(
  rawInput: SubmitCardLeadInput
): Promise<SubmitCardLeadResult> {
  try {
    const parseResult = SubmitCardLeadInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Datos de contacto inválidos',
      };
    }

    const { cardId, name, phone, email, company, note } = parseResult.data;

    // Obtener el propietario de la tarjeta
    const cardRecord = await db.query.cards.findFirst({
      where: eq(cards.id, cardId),
      columns: {
        id: true,
        userId: true,
        isActive: true,
      },
    });

    if (!cardRecord || !cardRecord.isActive) {
      return {
        success: false,
        error: 'La tarjeta no existe o se encuentra inactiva',
      };
    }

    const newLeadId = crypto.randomUUID();

    await db.insert(cardLeads).values({
      id: newLeadId,
      cardId,
      ownerUserId: cardRecord.userId,
      name,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      company: company?.trim() || null,
      note: note?.trim() || null,
      createdAt: new Date(),
    });

    return {
      success: true,
      leadId: newLeadId,
    };
  } catch (error: any) {
    console.error('[submitCardLeadAction Error]:', error);
    return {
      success: false,
      error: 'No se pudo guardar la información de contacto en este momento',
    };
  }
}

export interface CardLeadItem {
  id: string;
  cardId: string;
  cardTitle: string;
  cardSlug: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  note: string | null;
  createdAt: Date;
}

/**
 * Server Action autenticada: Retorna la lista de leads captados por las tarjetas del usuario (anti-IDOR)
 */
export async function getCardLeadsAction(
  targetUserId?: string
): Promise<{ success: boolean; leads: CardLeadItem[]; error?: string }> {
  try {
    const authResult = await getSafeAuthenticatedUserId(targetUserId);
    if (!authResult.userId) {
      return {
        success: false,
        leads: [],
        error: authResult.error || 'Acceso no autorizado',
      };
    }
    const authUserId = authResult.userId;

    const records = await db
      .select({
        id: cardLeads.id,
        cardId: cardLeads.cardId,
        cardTitle: cards.title,
        cardSlug: cards.slug,
        name: cardLeads.name,
        phone: cardLeads.phone,
        email: cardLeads.email,
        company: cardLeads.company,
        note: cardLeads.note,
        createdAt: cardLeads.createdAt,
      })
      .from(cardLeads)
      .innerJoin(cards, eq(cardLeads.cardId, cards.id))
      .where(eq(cardLeads.ownerUserId, authUserId))
      .orderBy(desc(cardLeads.createdAt));

    return {
      success: true,
      leads: records,
    };
  } catch (error: any) {
    console.error('[getCardLeadsAction Error]:', error);
    return {
      success: false,
      leads: [],
      error: error?.message || 'Error al obtener los contactos captados',
    };
  }
}

/**
 * Server Action autenticada: Elimina un lead con validación de propiedad multi-tenant (anti-IDOR)
 */
export async function deleteCardLeadAction(
  leadId: string,
  targetUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authResult = await getSafeAuthenticatedUserId(targetUserId);
    if (!authResult.userId) {
      return {
        success: false,
        error: authResult.error || 'Acceso no autorizado',
      };
    }
    const authUserId = authResult.userId;

    if (!leadId) {
      return { success: false, error: 'ID de contacto inválido' };
    }

    await db
      .delete(cardLeads)
      .where(and(eq(cardLeads.id, leadId), eq(cardLeads.ownerUserId, authUserId)));

    return { success: true };
  } catch (error: any) {
    console.error('[deleteCardLeadAction Error]:', error);
    return {
      success: false,
      error: error?.message || 'Error al eliminar el contacto',
    };
  }
}
