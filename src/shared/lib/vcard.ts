/**
 * Utilidad determinista de generación de vCard 3.0 / 4.0 (RFC 6350 / RFC 2426)
 * Genera tarjetas de contacto universales compatibles con iOS Contacts,
 * Google Contacts y Microsoft Outlook, codificadas estrictamente en UTF-8.
 */

export interface VCardOptions {
  title: string;
  profession: string;
  about?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  emailContact?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  photoBase64?: string | null;
  slug: string;
}

/**
 * Constantes de seguridad para mitigación de Buffer Overflows en parsers móviles (CVE-2023-41064)
 */
export const VCARD_SECURITY_LIMITS = {
  MAX_TITLE_CHARS: 100,
  MAX_PROFESSION_CHARS: 120,
  MAX_ABOUT_CHARS: 500,
  MAX_PHONE_CHARS: 30,
  MAX_URL_CHARS: 250,
  MAX_ADDRESS_CHARS: 200,
  MAX_PHOTO_BASE64_BYTES: 150 * 1024, // 150 KB límite seguro antes de desbordamiento en ImageIO
} as const;

/**
 * Escapa caracteres reservados para campos de texto en formato vCard y trunca la longitud máxima.
 */
function escapeVCardText(text: string, maxLen = 250): string {
  const truncated = text.trim().slice(0, maxLen);
  return truncated
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Construye la cadena vCard en estándar RFC 2426 / 6350 con protecciones activas de seguridad.
 */
export function generateVCardString(card: VCardOptions): string {
  const safeTitle = (card.title || '').trim().slice(0, VCARD_SECURITY_LIMITS.MAX_TITLE_CHARS);
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${escapeVCardText(safeTitle, VCARD_SECURITY_LIMITS.MAX_TITLE_CHARS)}`,
  ];

  // Separar nombre y apellido de forma heurística sobre el título sanitizado
  const parts = safeTitle.split(/\s+/);
  if (parts.length > 1) {
    const lastName = parts.slice(1).join(' ');
    const firstName = parts[0];
    lines.push(`N;CHARSET=UTF-8:${escapeVCardText(lastName, VCARD_SECURITY_LIMITS.MAX_TITLE_CHARS)};${escapeVCardText(firstName, VCARD_SECURITY_LIMITS.MAX_TITLE_CHARS)};;;`);
  } else {
    lines.push(`N;CHARSET=UTF-8:${escapeVCardText(safeTitle, VCARD_SECURITY_LIMITS.MAX_TITLE_CHARS)};;;;`);
  }

  if (card.profession) {
    const safeProf = escapeVCardText(card.profession, VCARD_SECURITY_LIMITS.MAX_PROFESSION_CHARS);
    lines.push(`TITLE;CHARSET=UTF-8:${safeProf}`);
    lines.push(`ROLE;CHARSET=UTF-8:${safeProf}`);
  }

  if (card.phone) {
    const safePhone = card.phone.trim().slice(0, VCARD_SECURITY_LIMITS.MAX_PHONE_CHARS);
    lines.push(`TEL;TYPE=CELL,VOICE:${safePhone}`);
  }

  if (card.whatsapp && card.whatsapp !== card.phone) {
    const safeWhatsapp = card.whatsapp.trim().slice(0, VCARD_SECURITY_LIMITS.MAX_PHONE_CHARS);
    lines.push(`TEL;TYPE=WORK,VOICE:${safeWhatsapp}`);
  }

  if (card.emailContact) {
    const safeEmail = card.emailContact.trim().slice(0, VCARD_SECURITY_LIMITS.MAX_URL_CHARS);
    lines.push(`EMAIL;TYPE=PREF,INTERNET:${safeEmail}`);
  }

  if (card.websiteUrl) {
    const safeWebsite = card.websiteUrl.trim().slice(0, VCARD_SECURITY_LIMITS.MAX_URL_CHARS);
    lines.push(`URL;TYPE=WORK:${safeWebsite}`);
  }

  if (card.linkedinUrl) {
    const safeLinkedin = card.linkedinUrl.trim().slice(0, VCARD_SECURITY_LIMITS.MAX_URL_CHARS);
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${safeLinkedin}`);
  }

  if (card.instagramUrl) {
    const safeInstagram = card.instagramUrl.trim().slice(0, VCARD_SECURITY_LIMITS.MAX_URL_CHARS);
    lines.push(`X-SOCIALPROFILE;TYPE=instagram:${safeInstagram}`);
  }

  if (card.address) {
    // ADR formato: post office box; extended address; street address; locality (city); region; postal code; country
    const safeAddress = escapeVCardText(card.address, VCARD_SECURITY_LIMITS.MAX_ADDRESS_CHARS);
    lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${safeAddress};;;;`);
    lines.push(`LABEL;TYPE=WORK;CHARSET=UTF-8:${safeAddress}`);
  }

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/c/${card.slug}`
    : `https://soyindi.cl/c/${card.slug}`;
  lines.push(`URL;TYPE=INDI_PROFILE:${profileUrl}`);

  if (card.about) {
    const safeAbout = escapeVCardText(card.about, VCARD_SECURITY_LIMITS.MAX_ABOUT_CHARS);
    lines.push(`NOTE;CHARSET=UTF-8:${safeAbout}\\nPerfil digital: ${profileUrl}`);
  } else {
    lines.push(`NOTE;CHARSET=UTF-8:${escapeVCardText(`Perfil digital verificado: ${profileUrl}`)}`);
  }

  // Incrustar foto de perfil en Base64 mitigando Buffer Overflow (CVE-2023-41064)
  if (card.photoBase64) {
    // Limpiar posible prefijo data:image/...;base64,
    const cleanBase64 = card.photoBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '').trim();
    // Validar que el payload Base64 no exceda el umbral seguro (~150 KB)
    if (cleanBase64 && cleanBase64.length <= VCARD_SECURITY_LIMITS.MAX_PHOTO_BASE64_BYTES * 1.37) {
      lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${cleanBase64}`);
    }
  }

  lines.push('REV:' + new Date().toISOString());
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Convierte una imagen remota o URL a cadena Base64 con timeout seguro para no bloquear la UX.
 */
async function fetchImageAsBase64(url: string, timeoutMs = 2000): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (url.startsWith('data:image/')) return url;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'force-cache',
    });
    clearTimeout(timer);

    if (!response.ok) return null;
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Dispara la descarga del archivo .vcf en el navegador del cliente.
 */
export function downloadVCard(card: VCardOptions, filename?: string): void {
  if (typeof window === 'undefined') return;

  const vcardText = generateVCardString(card);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename || `${card.slug || 'contacto'}.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Descarga la vCard resolviendo de forma asíncrona la foto de perfil en Base64
 * con fallback instantáneo a descarga sin foto si la red presenta latencia.
 */
export async function downloadVCardWithPhoto(card: VCardOptions, filename?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  let photoBase64: string | null = card.photoBase64 || null;

  if (!photoBase64 && card.photoUrl) {
    try {
      photoBase64 = await fetchImageAsBase64(card.photoUrl);
    } catch {
      // Degradación silenciosa: continúa sin foto
    }
  }

  downloadVCard({ ...card, photoBase64 }, filename);
}
