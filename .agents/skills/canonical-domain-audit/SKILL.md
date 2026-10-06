---
name: canonical-domain-audit
description: Auditoría y gobernanza de dominios canónicos, redirecciones 308 Edge, metadatos SEO y enlaces de documentos en INDI (soyindi.cl).
---

# 🌐 Skill: Auditoría & Gobernanza de Dominio Canónico (soyindi.cl)

Esta habilidad documenta y automatiza el protocolo de control de calidad para garantizar que **el 100% del tráfico web, enlaces compartidos, activos multimedia y documentos generados** operen de manera estricta bajo el dominio oficial:
**`https://soyindi.cl`**.

---

## 🎯 Objetivo de la Gobernanza
Neutralizar accesos fragmentados o rutas abriendo bajo subdominios temporales (`*.vercel.app`, `indi.bio`, `www.soyindi.cl`), colapsando todas las variantes hacia el dominio canónico de producción con códigos de estado HTTP 308 permanentes, metadatos OpenGraph verificados y serialización determinista en documentos exportables.

---

## 📋 Protocolo de Inspección en 5 Niveles

### 1. Nivel Edge & Servidor (Middleware Redirection)
- **Ubicación:** `src/middleware.ts`
- **Comportamiento:**
  - Inspecciona la cabecera `host` de cada solicitud entrante.
  - Detecta patrones: `*.vercel.app`, `indi.bio`, `www.indi.bio`, `www.soyindi.cl`.
  - En producción, ejecuta `NextResponse.redirect` hacia `https://soyindi.cl${pathname}${search}` con código **308 Permanent Redirect**.
  - Permite excepciones seguras: `localhost`, `127.0.0.1` y assets estáticos (`_next/static`, `brand/`).

### 2. Nivel de Contrato y Configuración Central (`src/entities/brand/domain.ts`)
- Centraliza:
  - `PRIMARY_DOMAIN = 'soyindi.cl'`
  - `CANONICAL_ORIGIN = 'https://soyindi.cl'`
  - Funciones helper: `getAppBaseUrl()` y `buildCanonicalUrl()`.
- Garantiza que cualquier generación de enlace que se ejecute en el servidor use `soyindi.cl` como fallback prioritario.

### 3. Nivel de Metadatos SEO, Open Graph & Sitemap
- **Root Layout (`src/app/layout.tsx`):**
  - `metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://soyindi.cl')`
  - `alternates.canonical: 'https://soyindi.cl'`
- **Páginas Dinámicas Públicas:**
  - `/c/[slug]`: `canonical: https://soyindi.cl/c/${card.slug}` y `ogImageUrl` generado bajo `soyindi.cl`.
  - `/p/[slug]`: `canonical: https://soyindi.cl/p/${presentation.slug}`.
  - `/cv/[slug]`: `canonical: https://soyindi.cl/cv/${slug}`.
- **Indexación y Rastreo:**
  - `src/app/robots.ts`: `sitemap: 'https://soyindi.cl/sitemap.xml'` y `host: 'https://soyindi.cl'`.
  - `src/app/sitemap.ts`: Genera las URLs canónicas completas para la landing, planes, onboarding y perfiles dinámicos.

### 4. Nivel de Documentos Generados y Exportables
- **vCard 3.0 / Contactos (`src/shared/lib/vcard.ts`):**
  - Las propiedades `URL;TYPE=INDI_PROFILE:` y `NOTE:` se generan apuntando a `${origin}/c/${card.slug}` con fallback estricto a `https://soyindi.cl/c/${card.slug}`.
- **Smart CV (PDF Vectorial jsPDF):**
  - El encabezado de metadatos, footer ATS y códigos QR incrustados deben referenciar `soyindi.cl`.
- **Dynamic OG Image (`src/app/api/og/route.tsx`):**
  - Muestra el sello de identidad: `SOYINDI.CL • IDENTIDAD DIGITAL EN EL EDGE`.

### 5. Nivel de Interfaz de Usuario & Compartir (Clipboard & Web Share API)
- **Componentes:**
  - `CardBuilder.tsx`: Prefijo visual `soyindi.cl/c/`, botón de copia usa `window.location.origin` (o `https://soyindi.cl`).
  - `SmartCvBuilder.tsx`: Prefijo visual `soyindi.cl/cv/`.
  - `PresentationStudio.tsx`: Prefijo visual `soyindi.cl/p/`.
  - `AffiliateDashboardTab.tsx`: Genera el enlace de referidos como `soyindi.cl/start?ref=CODIGO`.
  - `DigitalCard.tsx` / `PublicCvViewer.tsx`: Web Share API comparte `https://soyindi.cl/...`.

---

## 🔍 Checklist de Verificación en Vercel & Proveedores DNS
1. **Configuración de Dominios en Vercel Project Settings:**
   - Dominio principal: `soyindi.cl` (marcado como **Production Domain**).
   - `www.soyindi.cl`: Configurado con **Redirect to soyindi.cl**.
   - Subdominio Vercel: Activar la opción *"Automatically redirect *.vercel.app to custom production domain"*.
2. **Variables de Entorno en Vercel Dashboard:**
   - `BETTER_AUTH_URL` = `https://soyindi.cl`
   - `NEXT_PUBLIC_APP_URL` = `https://soyindi.cl`
3. **Google Cloud Console (OAuth Credentials):**
   - Orígenes autorizados de JavaScript: `https://soyindi.cl`.
   - URIs de redireccionamiento autorizados: `https://soyindi.cl/api/auth/callback/google`.
4. **Mercado Pago Dashboard:**
   - Webhook IPN URL: `https://soyindi.cl/api/webhooks/mercadopago`.
