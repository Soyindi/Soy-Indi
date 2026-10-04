import { z } from 'zod';

/**
 * Esquema de validación y sanitización para los parámetros de redirección y modo de autenticación.
 * Protege contra vulnerabilidades de Open Redirect verificando rutas relativas seguras.
 */
export const AuthRedirectParamsSchema = z.object({
  mode: z.enum(['login', 'signup']).default('login'),
  callbackUrl: z
    .string()
    .optional()
    .default('/dashboard')
    .refine(
      (url) => {
        if (!url) return true;
        // Solo permitir URLs relativas que comiencen con / y no con // (evita protocol-relative URLs)
        return url.startsWith('/') && !url.startsWith('//');
      },
      {
        message: 'La URL de redirección debe ser una ruta relativa interna segura.',
      }
    ),
});

export type AuthRedirectParams = z.infer<typeof AuthRedirectParamsSchema>;

/**
 * Helper para sanitizar de forma determinista la URL de destino post-login.
 */
export function sanitizeCallbackUrl(rawUrl?: string | null, fallback = '/dashboard'): string {
  if (!rawUrl) return fallback;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  return fallback;
}
