/**
 * Normalización determinista de números telefónicos en estándar E.164
 * Especializado en números de Chile (+56) con tolerancia a prefijos internacionales.
 */

/**
 * Normaliza un número telefónico a formato internacional estándar E.164.
 * - Limpia cualquier caracter no numérico (espacios, guiones, paréntesis).
 * - Si comienza con 56, antepone '+'.
 * - Si es un móvil o fijo chileno de 9 dígitos (ej. 912345678), antepone '+56'.
 * - Si ya incluye código de país válido, antepone '+' si no lo tuviera.
 * - Si está vacío o es inválido, retorna cadena vacía.
 */
export function normalizeChileanPhone(rawPhone?: string | null): string {
  if (!rawPhone) return '';

  const cleaned = rawPhone.trim().replace(/\D/g, '');
  if (!cleaned) return '';

  // Caso: Ya tiene código de Chile '56'
  if (cleaned.startsWith('56')) {
    return `+${cleaned}`;
  }

  // Caso: Formato nacional chileno estándar (9 dígitos, ej: 987654321 o 223456789)
  if (cleaned.length === 9) {
    return `+56${cleaned}`;
  }

  // Caso: Formato local antiguo de 8 dígitos (ej: fijos antiguos 23456789) -> anteponer 562 o +56
  if (cleaned.length === 8) {
    return `+569${cleaned}`;
  }

  // Fallback para otros números internacionales
  return `+${cleaned}`;
}

/**
 * Extrae solo los dígitos para enlaces directos de WhatsApp (wa.me/XXXXXXXXXXX)
 */
export function getWhatsAppDigits(rawPhone?: string | null): string {
  const normalized = normalizeChileanPhone(rawPhone);
  return normalized.replace(/\D/g, '');
}
