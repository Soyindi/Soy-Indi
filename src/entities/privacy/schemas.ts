import { z } from 'zod';

/**
 * ============================================================================
 * CONTRATOS DE DOMINIO Y VALIDACIÓN ZOD — PRIVACIDAD & DERECHOS ARCO (LEY 21.719)
 * ============================================================================
 */

export const exportUserDataInputSchema = z.object({
  userId: z.string().trim().min(1).optional(),
});

export const deleteUserAccountInputSchema = z.object({
  userId: z.string().trim().min(1).optional(),
  confirmationText: z
    .string()
    .trim()
    .refine((val) => val === 'ELIMINAR MI CUENTA', {
      message: 'Debes confirmar escribiendo exactamente "ELIMINAR MI CUENTA".',
    }),
});

export const rectifyUserDataInputSchema = z.object({
  userId: z.string().trim().min(1).optional(),
  name: z
    .string()
    .trim()
    .min(2, 'El nombre o razón social debe tener al menos 2 caracteres.')
    .max(120, 'El nombre no puede exceder los 120 caracteres.'),
  reason: z
    .string()
    .trim()
    .max(500, 'El motivo no puede exceder los 500 caracteres.')
    .optional(),
});

export type ExportUserDataInput = z.infer<typeof exportUserDataInputSchema>;
export type DeleteUserAccountInput = z.infer<typeof deleteUserAccountInputSchema>;
export type RectifyUserDataInput = z.infer<typeof rectifyUserDataInputSchema>;
