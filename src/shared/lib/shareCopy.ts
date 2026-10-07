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
  tone?: 'networking' | 'business' | 'minimal';
}

export interface ShareCopyResult {
  headline: string;
  body: string;
  fullMessage: string;
}

/**
 * Genera matrices de copywriting pre-redactadas de alto impacto según la entidad
 * con soporte para tipografía Markdown nativa de WhatsApp (*negrita*, _cursiva_, separadores).
 */
export function generateShareCopy({
  entityType,
  title,
  role,
  url,
  tone = 'networking',
}: ShareCopyParams): ShareCopyResult {
  const roleText = role ? ` (${role})` : '';
  const cleanTitle = title.trim();

  switch (entityType) {
    case 'card': {
      // Formato visual tipográfico optimizado para WhatsApp
      const headline = `Conecta con ${cleanTitle}${roleText}`;
      const body = `Guarda mi contacto profesional en 1 solo clic. Mi tarjeta digital inteligente está viva, siempre actualizada y sin papel.`;
      
      let fullMessage: string;
      if (tone === 'business') {
        fullMessage = `💼 *${cleanTitle.toUpperCase()}*${role ? ` | _${role}_` : ''}\n━━━━━━━━━━━━━━━━━━━━\n⚡ *Propuesta & Contacto Directo:*\nTe comparto mi tarjeta de presentación digital. Aquí puedes guardar mi contacto en tu agenda, ver mis servicios y conectar directamente conmigo.\n\n🔗 *Tarjeta Digital Verificada:*\n${url}\n\n_Sin papel. Siempre actualizada. Creado con INDI_`;
      } else if (tone === 'minimal') {
        fullMessage = `✨ *${cleanTitle}*${role ? ` — _${role}_` : ''}\n\nGuarda mi contacto directo en 1 toque aquí:\n${url}`;
      } else {
        // Tono Networking (predeterminado - Fórmula AIDA enriquecida)
        fullMessage = `👋 ¡Hola! Conecta con *${cleanTitle}*${role ? ` (${role})` : ''}.\n━━━━━━━━━━━━━━━━━━━━\n💼 *Identidad Digital Verificada:*\nGuarda mi contacto directo, portafolio y redes en 1 solo toque:\n\n🔗 *Ver Tarjeta Digital:*\n${url}\n\n⚡ _Sin papel. Siempre actualizado. Creado con INDI_`;
      }

      return { headline, body, fullMessage };
    }

    case 'cv': {
      // Fórmula Hook-Story-Offer (Gancho, Trayectoria, Propuesta)
      const headline = `Currículum Profesional de ${cleanTitle}${roleText}`;
      const body = `Revisa mi trayectoria verificada algorítmicamente y descarga mi CV en formato vectorial ATS de alta resolución.`;
      const fullMessage = `📄 Te comparto el Smart CV de *${cleanTitle}*${role ? ` (${role})` : ''}.\n━━━━━━━━━━━━━━━━━━━━\n🎯 *Perfil Profesional Optimizado para ATS:*\nRevisa mi trayectoria verificada o descarga el currículum en PDF de alta resolución aquí:\n\n🔗 *Ver Currículum Inteligente:*\n${url}\n\n⚡ _Certificado con Estándar Corporativo A4 — INDI_`;
      return { headline, body, fullMessage };
    }

    case 'presentation': {
      // Fórmula Curiosity Gap (Intriga, Valor, Apertura)
      const headline = `${cleanTitle} — Presentación Orbital 16:9`;
      const body = `Descubre esta propuesta comercial y técnica estructurada en formato cinemático interactivo.`;
      const fullMessage = `🚀 Te invito a ver la presentación de impacto: *"${cleanTitle}"*.\n━━━━━━━━━━━━━━━━━━━━\n📽️ *Experiencia Cinemática 16:9:*\nVisualiza la propuesta estructurada en diapositivas interactivas a pantalla completa aquí:\n\n🔗 *Abrir Presentación:*\n${url}\n\n⚡ _Proyectado con INDI Orbital Studio_`;
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
