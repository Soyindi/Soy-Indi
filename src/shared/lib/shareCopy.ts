/**
 * Motor de Copywriting Persuasivo y Enlaces Canónicos para Compartir (INDI 2026)
 * Implementa fórmulas AIDA (Tarjetas), Hook-Story-Offer (Smart CV) y Curiosity Gap (Presentaciones)
 * con anexión determinista de parámetros UTM para trazabilidad analítica perimetral.
 */

export type ShareEntityType = 'card' | 'cv' | 'presentation';

export type ShareMedium = 'whatsapp' | 'linkedin' | 'twitter' | 'native' | 'clipboard';

export interface BuildShareUrlParams {
  entityType: ShareEntityType;
  slug: string;
  medium?: ShareMedium;
  source?: string;
  referralCode?: string | null;
}

/**
 * Construye la URL canónica absoluta con parámetros UTM y atribución de afiliados
 */
export function buildCanonicalShareUrl({
  entityType,
  slug,
  medium = 'native',
  source = 'share',
  referralCode,
}: BuildShareUrlParams): string {
  const routePrefix = entityType === 'card' ? 'c' : entityType === 'cv' ? 'cv' : 'p';
  const url = new URL(`https://soyindi.cl/${routePrefix}/${slug}`);

  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);

  if (referralCode) {
    url.searchParams.set('ref', referralCode);
  }

  return url.toString();
}

export interface ShareCopyParams {
  entityType: ShareEntityType;
  title: string;
  role?: string;
  slug?: string;
  url: string;
}

export interface ShareCopyResult {
  headline: string;
  body: string;
  fullMessage: string;
}

/**
 * Genera matrices de copywriting pre-redactadas de alto impacto según la entidad
 */
export function generateShareCopy({
  entityType,
  title,
  role,
  url,
}: ShareCopyParams): ShareCopyResult {
  const roleText = role ? ` (${role})` : '';

  switch (entityType) {
    case 'card': {
      // Fórmula AIDA (Atención, Interés, Deseo, Acción)
      const headline = `Conecta con ${title}${roleText}`;
      const body = `Guarda mi contacto profesional en 1 solo clic. Mi tarjeta digital inteligente está viva, siempre actualizada y sin papel.`;
      const fullMessage = `👋 Hola! Conecta con ${title}${roleText}.\n\nGuarda mi contacto directo en 1 toque aquí:\n${url}`;
      return { headline, body, fullMessage };
    }

    case 'cv': {
      // Fórmula Hook-Story-Offer (Gancho, Trayectoria, Propuesta)
      const headline = `Currículum Profesional de ${title}${roleText}`;
      const body = `Revisa mi trayectoria verificada algorítmicamente y descarga mi CV en formato vectorial ATS de alta resolución.`;
      const fullMessage = `📄 Te comparto el Smart CV de ${title}${roleText}.\n\nRevisa mi perfil verificado o descarga el PDF compatible con ATS aquí:\n${url}`;
      return { headline, body, fullMessage };
    }

    case 'presentation': {
      // Fórmula Curiosity Gap (Intriga, Valor, Apertura)
      const headline = `${title} — Presentación Orbital 16:9`;
      const body = `Descubre esta propuesta comercial y técnica estructurada en formato cinemático interactivo.`;
      const fullMessage = `🚀 Mira esta presentación de impacto: "${title}".\n\nVisualízala en pantalla completa 16:9 interactiva aquí:\n${url}`;
      return { headline, body, fullMessage };
    }
  }
}

/**
 * Construye enlace directo para compartir por WhatsApp Web / App
 */
export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Construye enlace directo para compartir en LinkedIn
 */
export function buildLinkedInShareUrl(url: string, title: string, summary?: string): string {
  const linkedIn = new URL('https://www.linkedin.com/sharing/share-offsite/');
  linkedIn.searchParams.set('url', url);
  return linkedIn.toString();
}

/**
 * Construye enlace directo para compartir en X / Twitter
 */
export function buildTwitterShareUrl(text: string, url: string): string {
  const twitter = new URL('https://twitter.com/intent/tweet');
  twitter.searchParams.set('text', text);
  twitter.searchParams.set('url', url);
  return twitter.toString();
}
