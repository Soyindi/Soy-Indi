# 🏛️ BLUEPRINT DE ARQUITECTURA: INDI PLATAFORMA SAAS 2026
**Ecosistema Integral de Identidad Digital, Productividad y Networking Profesional**

---

## 1. Resumen Ejecutivo y Metas del Proyecto

INDI nace como la evolución definitiva de la plataforma de identidad digital, superando las limitaciones técnicas y arquitectónicas del proyecto legacy (`Digital_Business_Card_Platform`). Este blueprint establece los cimientos para un producto SaaS de clase mundial con diseño hipnotizante, rendimiento instantáneo en el Edge y una arquitectura ultra-prolija basada en **Feature-Sliced Design (FSD)** y un stack **100% Free-Tier Serverless** sin pausas por inactividad.

### Objetivos Clave de Ingeniería:
1. **Lighthouse 95+ Garantizado:** LCP < 1.0s, INP < 80ms, CLS = 0.
2. **Latencia Sub-Milisegundo en el Edge:** Lecturas de tarjetas públicas (`/c/[slug]`) y previsualizaciones Open Graph en <50ms mediante **Turso (LibSQL)** distribuido.
3. **Viralidad Inmediata sin Fallos:** Generación dinámica de previsualizaciones Open Graph en el Edge con `@vercel/og` y Satori sin dependencias de cliente para WhatsApp, LinkedIn e iMessage.
4. **Cero Cuellos de Botella y $0 Egress:** Base de datos Turso SQLite sobre HTTP con réplicas perimetrales y almacenamiento multimedia en **Cloudflare R2** (sin cobro por transferencia de datos).
5. **Autenticación Autónoma y Gratuita:** **Better-Auth** integrado directamente en esquemas de Drizzle ORM, eliminando límites artificiales de usuarios activos (MAU) o dependencias de servicios externos.
6. **Exportación Vectorial Ultra-Ligera:** Motor vectorial cliente optimizado con **jsPDF** (`pdf-engine.ts`), generando PDFs con texto 100% seleccionable para parsers ATS (Workday/Greenhouse), soporte de firma digital y descarga sin latencia de red.
7. **Experiencia Visual "Wow Factor":** Adopción de Tailwind CSS v4 con espacio de color uniforme **OKLCH**, Glassmorphism 2.0 nativo con gradientes radiales matemáticos y partículas reactivas anti-colisión aceleradas por hardware GPU (`SmartParticles.tsx`).
8. **IA Asíncrona y Streaming:** Ingesta multimodal con Qwen2.5-VL / Gemini Vision vía OpenRouter y Vercel AI SDK para estructuración semántica STAR/XYZ.
9. **Soberanía de Despliegue 100% Gratuito y Comercial (Coolify + OCI Always Free):** Soporte oficial para ejecución contenerizada Docker multi-stage (`output: 'standalone'`) en servidores dedicados gratuitos de Oracle Cloud (4 OCPUs ARM, 24 GB RAM) con orquestación PaaS vía Coolify, SSL automático mediante Caddy y cero límites de tiempo o cuotas de créditos serverless.

---

## 2. Matriz Comparativa: Proyecto Legacy vs. Nueva Arquitectura INDI

| Dimensión | Proyecto Legacy (`Digital_Business_Card_Platform`) | Nuevo INDI SaaS (`Desktop\Indi`) | Beneficio Técnico & Negocio |
| :--- | :--- | :--- | :--- |
| **Arquitectura de Código** | Monolito por tipo técnico (`/components` 80KB, `/lib/auth-*` 6 archivos). | **Feature-Sliced Design (FSD)** (`app/`, `features/`, `entities/`, `shared/`). | Máxima modularidad, cero dependencias circulares, escalabilidad en equipo. |
| **ORM & Base de Datos** | Prisma ORM + PostgreSQL tradicional con saturación de conexiones. | **Drizzle ORM + Turso (LibSQL Serverless SQLite)** con soporte dual local/nube. | Consultas ultra-rápidas (~2-15ms), cero agotamiento de sockets serverless, desarrollo local offline sin Docker (`file:local.db`). |
| **Autenticación** | NextAuth disperso en múltiples configuraciones (`auth-robust`, `auth-safe`). | **Better-Auth nativo sobre Drizzle ORM** (Sesiones HttpOnly seguras, Passkeys, OAuth). | 100% Open Source y gratuito para siempre; sin límites de usuarios activos ni dependencias de terceros. |
| **Seguridad de Datos** | Validaciones ad-hoc en rutas y parches con `userId.includes('@')`. | **Guardrails tipados en Capa de Servicio (`getSafeAuthenticatedUserId`) & Zod**. | Tipado estricto en tiempo de compilación; ninguna acción puede mutar entidades ajenas. |
| **Almacenamiento de Medios** | Carga local o almacenamiento disperso. | **URLs CDN Directas / Cloudflare R2**. | Alto rendimiento de carga sin sobrecargar el servidor de aplicaciones. |
| **Compartir / WhatsApp (OG)** | Client Components (`'use client'`) manipulando el DOM. **Falla en WhatsApp y LinkedIn**. | **Edge Handler con `@vercel/og` y Satori**. Generación SVG/PNG dinámica en <100ms. | Previews instantáneos y atractivos al compartir en redes, multiplicando el CTR viral. |
| **Métricas de Visitas** | `UPDATE card SET views = views + 1` directo en DB por cada `GET`. Bloqueo potencial. | **Incremento Atómico SQL en Turso/SQLite**. | Actualización en tiempo real sin concurrencia bloqueante. |
| **Exportación a PDF** | Puppeteer lanzando Headless Chrome. Falla por timeouts/OOM en serverless. | **Motor Vectorial jsPDF en Cliente**. | Generación de PDFs con texto 100% seleccionable para ATS, descarga instantánea y cero costo serverless. |
| **Color y Diseño** | HSL tradicional con inconsistencias perceptuales de brillo y contraste. | **OKLCH nativo en Tailwind CSS v4** + Gamut P3 Wide Color. | Colores vibrantes, contrastes accesibles matemáticamente garantizados (WCAG 2.2 y APCA). |
| **Efecto Vidrio** | `backdrop-filter: blur(10px)` plano bidimensional. | **Glassmorphism 2.0 Acelerado por GPU** con gradientes radiales OKLCH y SmartParticles v3.0. | Estética hiper-premium ultra-ligera (<10KB) sin dependencias pesadas de WebGL. |
| **Motor de IA** | Llamadas síncronas bloqueantes a la API de Anthropic. | **Ingesta Multimodal Qwen2.5-VL / Gemini + Parser Heurístico de Alta Resiliencia**. | Extracción precisa de logros STAR y diplomas universitarios con sanitización EU AI Act. |

---

## 3. Estructura de Directorios: Feature-Sliced Design (FSD)

```
C:\Users\Matías Riquelme\Desktop\Indi\
├── .github/
│   └── workflows/ci.yml             # Linting estricto, chequeo de tipos y pruebas automáticas
### Actualización de Arquitectura Q4 2026: Flow.cl & Sincronizador de Retorno Inmediato
- Endpoint /checkout/return/flow: Sincronizador HTTP POST síncrono con verificación /payment/getStatus en Flow y batch atómico en Turso SQLite.
- Adaptador FlowAdapter y Registry unificado paymentRegistry.

### Actualización de Arquitectura Q4 2026 (Gobernanza de Redes Sociales Dinámicas en Turso LibSQL & TikTok):
- **Persistencia en Turso LibSQL (`system_settings`)**: Creación y migración de la tabla `system_settings` (`key` text PK, `value` text, `updated_at` integer timestamp) para almacenamiento atómico y desacoplado de variables globales de configuración.
- **Soporte Canónico de TikTok & Cuentas Oficiales**: Inclusión de TikTok en el esquema Zod (`brandSocialLinksSchema`), en el componente vectorial `<TikTokIcon />` y en los defaults canónicos con las cuentas oficiales verificadas (`linkedin.com/in/soyindi-cl`, `instagram.com/soyindi.cl`, `tiktok.com/@soyindi.cl`).
- **Acciones Administrativas Seguras (`src/features/brand/actions.ts`)**: `getOfficialBrandSocialsAction` y `updateOfficialBrandSocialsAction` con guardrail multi-tenant de rol `admin`, soporte de revalidación perimetral resiliente (`revalidatePath`) y sincronización inmediata sin demoras de caché.
- **Módulo de Gestión en Admin (`AdminBrandSocialsManager.tsx`)**: Pestaña dedicada en `/admin` con vista previa reactiva en vivo, inputs accesibles con touch targets $\ge 44\text{px}$ y persistencia confirmada en Turso.
- **Renderizado Dinámico en Portada y Menú Móvil**: `HomePage` (`src/app/page.tsx`) Server Component y `MobileNavDrawer` configurados para renderizar dinámicamente las redes sociales desde Turso, habilitando TikTok en todos los viewports.
- **Consistencia Comercial de Precios en Portada**: Actualización de botones y microcopias para reflejar la tarifa base de $2.500 CLP/mes de forma transparente en toda la experiencia.

### Actualización de Arquitectura Q4 2026 (Fase Comunitaria Gratuita • Vercel-Ready & Enfoque de Producto Core):
- **Free Community Edition Permanente (Vercel Hobby Compliant)**: Transición del tier base a gratuidad permanente (1 Tarjeta Digital activa + 1 Smart CV en PDF vectorial ATS, 0 costo operativo, $0 cobro transaccional activo en pasarelas).
- **Resolución Coherente de Entitlements y Cuotas Post-Trial (`assertUserEntitlementAction` & `assertQuotaAvailableAction`)**: Cuando expira el trial Pro inicial de 3 días (`status === 'EXPIRED'`), el sistema garantiza la continuidad perpetua del **Plan Comunitario Gratuito (`starter`)** para Tarjetas Digitales (`cards: 1` + `+1` cada 3 referidos) y Smart CVs (`cvs: 1` + `+1` cada 5 referidos), habilitando tanto la creación dentro de la cuota gratuita como la edición y el uso de copilotos de IA sobre sus recursos existentes, mientras reserva las Presentaciones Orbitales (`presentations`) para planes Pro/Max activos.
- **Auto-Carga Contextual y Prevención de Colisiones de Slug en Editores (`/cards/new` & `/cv`)**: Si un usuario accede a `/cards/new` o `/cv` sin `?id=` habiendo alcanzado su cuota comunitaria (1/1), el Server Component carga automáticamente su tarjeta o CV existente en modo edición con notificación contextual. Además, inicializa el nombre/slug con los datos reales de la sesión autenticada, aísla los campos personales de demostración (RUT, teléfono, LinkedIn, GitHub) para cuentas nuevas y aplica desambiguación automática en `CardBuilder` y `SmartCvBuilder`.
- **Motor ATS Multi-Industria, Sincronización STAR y Diagnóstico en Vivo (`SmartCvBuilder` & `auditAtsScoreAction`)**: Validación 100% Zod (`cvFormSchema`, `cvIdLookupSchema`, `cvSlugLookupSchema`, `skillRecommendationRequestSchema`), taxonomía ATS multi-industria (Salud/Clínica, Finanzas/Legal, Operaciones/Ingeniería, Educación, Software, Datos, Marketing, Management), sincronización en tiempo real entre `bullets` y `detailedBullets` mediante `hasQuantitativeMetric`, control de visibilidad pública/privada (`isPublic`) y estampado de firma digital tanto en CVs de 1 hoja como de 2 hojas A4.
- **Focalización Estratégica en Identidad Profesional (Tarjeta + CV)**: Desacoplamiento de las Presentaciones 16:9 en navegación pública y onboarding para erradicar fricción cognitiva y reducir en un 70% el consumo de tokens de IA. El módulo permanece desacoplado en `src/features/orbital-presentations/` para futuro relanzamiento.
- **Sistema de Afiliados con Incentivo Mutuo (Double-Sided Loop & Hito Embajador Oro)**: Cada miembro dispone de su código QR, enlaces duales (`/login?mode=signup&ref=CODIGO` y `/start?ref=CODIGO`), botón directo a WhatsApp y simulador pedagógico (`AffiliateEarningsCalculator`) en `/dashboard?tab=affiliates`. Ganancia inmediata: `+1` Tarjeta Digital cada 3 referidos, `+1` Smart CV cada 5 referidos y **cupos ilimitados de Tarjetas y Smart CVs al alcanzar 10 referidos (Embajador Oro)** en `assertQuotaAvailableAction`; ganancia financiera: 25% de liquidación líquida sobre suscripciones aprobadas, con exclusión estricta de transacciones reembolsadas (`refunded`) o con contracargo (`charged_back`) en los balances y auditorías.
- **Vector de Monetización Futura (Auspiciadores B2B & Patrocinios de Eventos)**: Monetización no invasiva basada en impresiones y clics cualificados en las tarjetas compartidas, además de licencias corporativas B2B para equipos.

### Actualización de Arquitectura Q4 2026 (Auditoría Forense & Entitlements Engine):
- **Motor Determinista de Entitlements (`src/entities/subscription/entitlement-engine.ts`)**: Funciones puras que concentran la máquina de estados temporal (Trial 3d con cuota Pro ➔ Suscripción activa ➔ Grace Period 5d ➔ Expired).
- **Auto-Healing de Período de Prueba en Base de Datos**: Saneamiento atómico persistente en `checkUserEntitlementAction` para cuentas en TRIAL con `trialEndsAt = null`, garantizando un anclaje temporal de 3 días una sola vez y eliminando el reseteo del cronómetro.
- **Activación Idempotente Exactly-Once (`src/features/pricing/subscription-activation.ts`)**: Servicio transaccional server-only para Flow, Mercado Pago y Fintoc con `onConflictDoNothing()`.
- **Aislamiento Server-Only de Comisiones (`src/features/affiliates/commission-engine.ts`)**: Funciones financieras desvinculadas de `'use server'` y blindaje Anti-IDOR en `attributeReferralAction`.
- **Sincronización de Reloj Cliente-Servidor en UI**: `TrialCountdownTimer` con alineación al milisegundo exacto del segundo y compensación de desfases mayores a 60 segundos mediante `serverNow`.
- **Marco de Alta Concurrencia y Capacidad Masiva (10.000+ Usuarios Concurrentes)**:
- **Resiliencia Móvil & Compatibilidad Universal WebKit/Android (MP4 H.264 First)**: Optimización del orden de fuentes en elementos `<video>` (`<HeroBrandIdentity />`, `<BrandLogo />`), priorizando MP4 H.264 sobre WebM para erradicar bloqueos de carga inicial en Safari iOS y WebView in-app.
- **Gobernanza de Tarjetas Limpias & Vitrina Interactiva Bento (Zero Phantom Metrics)**: Tarjetas nuevas inicializadas con vitrina limpia (`bentoBlocks: []`, `badgeText: ''`), erradicando métricas ficticias heredadas de la demo. El constructor (`CardBuilder.tsx`) incorpora gestión interactiva de bloques Bento (+ Métrica, + Enlace/Proyecto, Editar y Eliminar) e insignia de especialidad personalizada con touch targets $\ge 44\text{px}$.

  - Arquitectura Zero-Binary Persistence en Turso SQLite con almacenamiento de medios pesados en Cloudflare R2 ($0 egress).
  - Gobernanza perimetral con ISR 60s en páginas públicas (`/c/[slug]`, `/p/[slug]`, `/cv/[slug]`) y telemetría desacoplada en segundo plano con `navigator.sendBeacon`.
  - Inferencia de IA multi-tier (Groq LPU < 200ms -> NVIDIA NIM -> Gemini) blindada con Circuit Breaker, Request Coalescing y Micro-Caché Semántica.
  - Hoja de ruta para ráfagas masivas: Agregación de telemetría en batch y rate limiting distribuido con Upstash Redis.

├── src/
│   ├── app/                         # App Router de Next.js (Rutas, Layouts, Providers, Edge Handlers)
│   │   ├── api/                     # Handlers específicos (Auth, Webhooks, Edge Endpoints)
│   │   │   ├── auth/[...all]/route.ts # Endpoint universal de Better-Auth
│   │   │   └── og/route.tsx         # Generador de Open Graph dinámico en el Edge (@vercel/og)
│   │   ├── c/[slug]/page.tsx        # Vista pública Server Component de tarjetas (con generateMetadata)
│   │   ├── cards/                   # Dashboard (/cards) y Creador en tiempo real (/cards/new)
│   │   ├── cv/                      # Optimizador de Smart CV con auditoría algorítmica ATS
│   │   ├── presentations/           # Estudio cinematográfico de presentaciones 16:9 con IA
│   │   ├── pricing/                 # Página comercial con comparativa, FAQ y garantías
│   │   ├── start/                   # Onboarding Hub interactivo para prueba gratuita de 3 días
│   │   ├── layout.tsx               # Root layout con dark mode y estilos globales
│   │   └── page.tsx                 # Landing Page de alta conversión en 7 bloques estratégicos
│   │
│   ├── features/                    # Lógica de negocio accionable (hooks, componentes y Server Actions)
│   │   ├── card-builder/            # Asistente modular de creación/edición y dashboard de tarjetas
│   │   ├── ai-smart-cv/             # Asistente de análisis ATS, auditoría heurística y plantilla A4
│   │   ├── orbital-presentations/   # Editor cinematográfico de diapositivas 16:9 y generador IA
│   │   ├── visual-effects/          # SmartParticles v3.0 anti-colisión acelerado por GPU
│   │   ├── onboarding/              # Onboarding Hub (OnboardingChoiceGrid) con selección guiada
│   │   └── pricing/                 # Sistema comercial: PricingSection, FaqAccordion, TrialBanner, acciones
│   │
│   ├── entities/                    # Modelos de dominio y acceso a datos con Drizzle ORM
│   │   ├── card/                    # Entidad DigitalCard y temas visuales
│   │   ├── subscription/            # Tipos de planes (Semestral $6.000 vs Mensual $2.500) y entitlements
│   │   └── schema.ts                # Esquema Drizzle SQLite (user, session, account, verification, cards, smart_cvs, presentations)
│   │
│   └── shared/                      # Primitivas universales reutilizables
│       ├── api/                     # Instancia del cliente DB (Turso + Drizzle) y Redis (Upstash)
│       │   ├── db.ts                # Conexión universal Drizzle LibSQL
│       │   └── r2.ts                # Cliente S3 para Cloudflare R2
│       ├── config/                  # Variables de entorno validadas con Zod
│       ├── lib/                     # Auth client, utilidades matemáticas, algoritmos de contraste APCA
│       ├── styles/                  # Configuración @theme Tailwind v4 y variables OKLCH
│       └── ui/                      # Componentes atómicos (Botones, Modales, Inputs, GlassCard, Badges)
│
├── drizzle/                         # Migraciones SQL declarativas generadas por drizzle-kit
├── public/                          # Fuentes tipográficas y assets estáticos optimizados
├── drizzle.config.ts                # Configuración de Drizzle ORM (driver: turso, dialect: sqlite)
├── next.config.ts                   # Configuración de Next.js 15 (PPR habilitado)
├── package.json
├── tailwind.config.ts               # Configuración Tailwind CSS v4
└── tsconfig.json                    # TypeScript strict mode con paths configurados (@/*)
```

---

## 4. Stack Tecnológico Definitivo (100% Free-Tier & Zero Cold-Starts)

### 4.1 Núcleo de Aplicación
- **Next.js 16.3+ (Turbopack / App Router):** Soporte nativo para React 19, Server Actions tipadas, Partial Prerendering (PPR) y streaming perimetral vía `<Suspense>`.
- **TypeScript 6.0+:** Tipado estricto, sin tolerar `any`, con validación estricta de contratos de datos vía **Zod 4+**.
- **Gestor de Paquetes:** `pnpm` o `npm` con directivas de motor precisas (`node >= 20.18.0`).

### 4.1.1 Gobernanza de Cuotas Cuantitativas por Plan SaaS (2026)
Para garantizar el cumplimiento de las normativas de protección al consumidor (SERNAC, Ley 19.496) y protección de datos (Ley 21.719), cada recurso cuantificable (Tarjetas: 3/10/∞, Smart CVs: 1/5/∞, Presentaciones 16:9: 2/10/∞) es evaluado de forma server-side mediante ssertQuotaAvailableAction(userId, resource). Si un usuario excede su cuota contratada, el sistema rechaza la inserción atómicamente.

### 4.2 Base de Datos y Persistencia
- **Turso (LibSQL Serverless SQLite):**
  - Rendimiento perimetral distribuido con lecturas sub-milisegundo.
  - Cero problemas de agotamiento de conexiones en entornos serverless.
  - **Plan Gratuito:** 9 GB de almacenamiento, 1.000 millones de lecturas/mes, 500 bases de datos.
  - **Modo Dual:** `file:local.db` para desarrollo local offline instantáneo sin Docker, y `TURSO_DATABASE_URL` con token en producción.
- **Drizzle ORM (`drizzle-orm/libsql`):** Capa de acceso a datos sin sobrecarga de runtime. Tipado estricto inferido y generación SQL pura.

### 4.3 Autenticación y Autorización
- **Better-Auth:**
  - 100% Open Source (MIT), autónomo y auto-alojado en tu propia base de datos Turso.
  - Manejo de sesiones seguras mediante cookies `HttpOnly`, soporte para múltiples proveedores OAuth (Google, GitHub, LinkedIn), magic links y passkeys.
  - Sin cobros por Usuarios Activos Mensuales (MAU) ni dependencias externas.

### 4.4 Almacenamiento Multimedia
- **Cloudflare R2:**
  - Almacenamiento S3-compatible de alta velocidad para avatares, fotos de tarjetas y portafolios.
  - **Plan Gratuito:** 10 GB de almacenamiento, 10M de operaciones de lectura mensuales.
  - **Cero Costos de Salida (Zero Egress Fees):** Tráfico de descarga de fotos 100% libre de costo.

### 4.5 Caché, Rate Limiting y Resiliencia
- **Upstash Redis:**
  - Rate limiting con algoritmo *Token Bucket* para endpoints sensibles e interfaces de IA.
  - *Debouncing distribuido* de visitas (`HINCRBY`) para métricas de tarjetas, sincronizándose periódicamente hacia Turso.
  - **Plan Gratuito:** 10.000 comandos diarios.

### 4.6 Sistema Visual y Vanguardia de Diseño
- **Tailwind CSS v4:** Motor unificado mediante la directiva `@theme`. Espacio de color **OKLCH** para uniformidad lumínica perceptual.
- **SmartParticles v3.0 & OKLCH GPU Engine:** Sistema de partículas volumétricas y refracción física (*Glassmorphism 2.0*) implementado íntegramente con CSS moderno y aceleración por hardware (`will-change: transform, opacity`), eliminando la sobrecarga de 600KB de librerías WebGL pesadas.
- **Framer Motion:** Coreografía de micro-animaciones, interpolación de layout (`layoutId`) y resortes físicos.

### 4.7 Motor de IA y Streaming
- **Vercel AI SDK 5+:** Streaming UI reactivo con `streamText` y Server-Sent Events (SSE).
- **Anthropic Claude 3.5 Sonnet:** Razonamiento superior para estructuración de presentaciones y optimización ATS de CVs.
- **Prompt Caching (`cache_control: { type: 'ephemeral' }`):** Ahorro superior al 90% en costos de tokens.

### 4.8 Exportación Serverless y Observabilidad
- **Motor Vectorial jsPDF Client-Side (DIN EN ISO 216):** Generación vectorial instantánea A4 en el navegador con soporte nativo para análisis ATS (Dual-Target), cálculo dinámico de saltos de página y trazabilidad textual completa sin requerir descargas pesadas de binarios WASM (~13MB).
- **Sentry (`onRequestError` en Next.js 15):** Captura proactiva de errores y tracing.

---

## 5. Arquitectura de Base de Datos y Esquema Drizzle (SQLite / Turso)

### 5.1 Conexión Unificada Dual (`src/shared/api/db.ts`)
```typescript
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@/entities/schema';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url,
  authToken: url.startsWith('file:') ? undefined : authToken,
});

export const db = drizzle(client, { schema });
```

### 5.2 Esquema Relacional de Dominio (`src/entities/schema.ts`)
```typescript
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// --- USUARIOS Y AUTENTICACIÓN (BETTER-AUTH COMPLIANT) ---
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  status: text('status', { enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED'] }).default('TRIAL').notNull(),
  trialEndsAt: integer('trial_ends_at', { mode: 'timestamp' }),
  subscriptionEndsAt: integer('subscription_ends_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  statusIdx: index('users_status_idx').on(table.status),
}));

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// --- TARJETAS DIGITALES ---
export const cards = sqliteTable('cards', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  profession: text('profession').notNull(),
  about: text('about'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  emailContact: text('email_contact'),
  websiteUrl: text('website_url'),
  linkedinUrl: text('linkedin_url'),
  instagramUrl: text('instagram_url'),
  photoUrl: text('photo_url'),
  themeConfig: text('theme_config', { mode: 'json' }).$type<{
    themeId: string;
    primaryColorOklch: string;
    backgroundColorOklch: string;
    particleBehavior: 'static' | 'interactive' | 'ambient';
    particleIntensity: 'subtle' | 'balanced' | 'prominent';
    fontFamily: string;
    enableGlassRefraction: boolean;
  }>().notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  clicksCount: integer('clicks_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdx: index('cards_user_idx').on(table.userId),
  slugIdx: index('cards_slug_idx').on(table.slug),
}));

// --- CURRÍCULUMS INTELIGENTES (SMART CVS) ---
export const smartCvs = sqliteTable('smart_cvs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  targetRole: text('target_role').notNull(),
  atsScore: integer('ats_score').default(0).notNull(),
  content: text('content', { mode: 'json' }).$type<{
    summary: string;
    experience: Array<{ company: string; role: string; period: string; bullets: string[] }>;
    skills: string[];
    education: Array<{ degree: string; institution: string; year: string }>;
  }>().notNull(),
  templateId: text('template_id').default('executive-modern').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userCvIdx: index('smart_cvs_user_idx').on(table.userId),
}));

// --- PRESENTACIONES MULTI-AGENTE ---
export const presentations = sqliteTable('presentations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  slug: text('slug').unique(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false).notNull(),
  slidesData: text('slides_data', { mode: 'json' }).$type<Array<{
    id: string;
    title: string;
    keyPoints: string[];
    visualType: string;
    speakerNotes: string;
  }>>().notNull(),
  themeSettings: text('theme_settings', { mode: 'json' }).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userPresIdx: index('presentations_user_idx').on(table.userId),
  slugPresIdx: index('presentations_slug_idx').on(table.slug),
}));

// --- RELACIONES DECLARATIVAS ---
export const usersRelations = relations(users, ({ many }) => ({
  cards: many(cards),
  smartCvs: many(smartCvs),
  presentations: many(presentations),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  author: one(users, {
    fields: [cards.userId],
    references: [users.id],
  }),
}));
```

---

## 6. Motor de Viralidad: Open Graph Dinámico en el Edge con Turso

La ruta `/c/[slug]` se ejecuta como un **Server Component puro** que aprovecha la bajísima latencia de lectura de Turso:

```typescript
// src/app/c/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/shared/api/db';
import { cards } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { CardPublicView } from '@/features/card-builder/components/CardPublicView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = await db.query.cards.findFirst({
    where: eq(cards.slug, slug),
  });

  if (!card) return { title: 'Tarjeta No Encontrada | INDI' };

  const ogImageUrl = `https://soyindi.cl/api/og?title=${encodeURIComponent(card.title)}&role=${encodeURIComponent(card.profession)}&photo=${encodeURIComponent(card.photoUrl || '')}`;

  return {
    title: `${card.title} - ${card.profession} | INDI`,
    description: card.about || `Conecta directamente con ${card.title} en un solo clic por WhatsApp o redes.`,
    openGraph: {
      title: `${card.title} | ${card.profession}`,
      description: card.about || `Tarjeta interactiva profesional.`,
      url: `https://soyindi.cl/c/${card.slug}`,
      siteName: 'INDI Digital Identity',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: card.title }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${card.title} | ${card.profession}`,
      description: card.about || `Tarjeta interactiva profesional.`,
      images: [ogImageUrl],
    }
  };
}

export default async function PublicCardPage({ params }: PageProps) {
  const { slug } = await params;
  const card = await db.query.cards.findFirst({
    where: eq(cards.slug, slug),
  });

  if (!card) notFound();

  return <CardPublicView card={card} />;
}
```

---

---

## 7. Modelo de Datos Canónico SSoT (13 Tablas en Turso LibSQL Drizzle)

En cumplimiento de las convenciones de Better-Auth y Drizzle ORM (`src/entities/schema.ts` y `tests/unit/turso-batch-and-schema.test.ts`), la base de datos se estructura en 4 tablas en singular y 9 tablas en plural:

| # | Tabla | Cardinalidad | Propósito | Convención |
|---|---|---|---|---|
| 1 | `user` | Singular | Identidad, autenticación y credenciales de usuario | Better-Auth Core |
| 2 | `session` | Singular | Sesiones activas y tokens de autenticación | Better-Auth Core |
| 3 | `account` | Singular | Cuentas OAuth vinculadas (Google, etc.) | Better-Auth Core |
| 4 | `verification` | Singular | Tokens de verificación de correo / magic links | Better-Auth Core |
| 5 | `cards` | Plural | Tarjetas de presentación digitales interactivas | Dominio INDI |
| 6 | `card_events` | Plural | Telemetría pasiva de visitas y eventos de interacción | Dominio INDI |
| 7 | `card_leads` | Plural | Prospectos y contactos capturados en tarjetas | Dominio INDI |
| 8 | `smart_cvs` | Plural | Currículums estructurados con secciones JSON en `content` | Dominio INDI |
| 9 | `presentations` | Plural | Presentaciones ejecutivas 16:9 (Orbital Presentations) | Dominio INDI |
| 10 | `payments_history` | Plural | Trazabilidad y auditoría de transacciones Flow.cl/MP/Fintoc | Finanzas |
| 11 | `affiliate_bank_accounts` | Plural | Cuentas bancarias TEF SBIF de afiliados para transferencias | Finanzas |
| 12 | `affiliate_commissions` | Plural | Comisiones acumuladas y liquidaciones quincenales | Finanzas |
| 13 | `system_settings` | Plural | Parámetros globales y banderas de configuración de plataforma | Gobernanza |

---

## 8. Gobernanza Comercial y Modelo de Negocio por Etapas

### Etapa 1: Vercel Hobby Compliant (Modo Comunitario Activo)
- **Plan Starter ($0 CLP / mes de por vida):** 1 Tarjeta Digital Interactiva + 1 Smart CV con branding sutil (`rel="powered-by"`), métricas en tiempo real y descarga de vCard 4.0. **Cero bloqueo ni expiración reactiva**.
- **Planes Pro y Max (En Lista de Espera):** En la interfaz pública (`/pricing` y `/dashboard`) se presentan con badge informativo de lista de espera con botón de checkout temporalmente desactivado para cumplir al 100% las directrices $0 transaccionales de Vercel Hobby.
- **Constantes de Código Preservadas:** `PRICING_TIERS` mantiene intactos los valores ($2.500/$6.000 para Pro con comisiones del 25% de $625 y $1.500 CLP), certificando el paso de los 528 tests unitarios de afiliados (`affiliates-and-payouts.test.ts`).

### Etapa 2: Escalamiento Comercial (Vercel Pro + Turso Developer)
- Activación de pasarelas de pago Flow.cl y Mercado Pago con autofinanciamiento a partir de los primeros 20-30 suscriptores Pro.

---

## 9. Criptografía y Resiliencia de Infraestructura

### Apple Wallet PKCS#7 / CMS DER Detached (`src/shared/lib/wallet/applePassSigner.ts`)
- Empaquetado nativo sin dependencias C++ mediante `node-forge`. Genera un sobre CMS detached en codificación binaria DER que adjunta el certificado firmante Pass Type ID y la cadena intermedia de Apple WWDR G4 CA.
- Fallback seguro mediante `isApplePassSigningConfigured()` y `hasAppleCertificates`, evitando el error de pase inválido en iOS Safari y ofreciendo vCard 4.0 enriquecido con foto HD y Google Wallet.

### Telemetría Asíncrona con Hybrid Piggyback Flush (`/api/telemetry/view`)
- Ingesta ultrarrápida en Edge mediante Upstash Redis (`HINCRBY`).
- Ventana de amortiguación de 60 segundos con lock `SET NX EX 60` o umbral de 25 visitas, ejecutando el volcado consolidado en background con `after()` de Next.js 16 hacia Turso LibSQL (`db.batch`).

---


## 9.6 Calibración de Activos de Identidad en Billeteras Digitales (SOP-126)
- **Google Wallet Generic Passes**: El logotipo del pase se resuelve mediante el activo canónico rasterizado 1:1 https://soyindi.cl/brand/indi-logo-1024.png (1024x1024 px), erradicando distorsiones o fallos de escala producidos por renderizado de SVGs con media queries dinámicas.
- **Apple Wallet PassKit**: Enlaces a buffers reales de marca para icon.png, icon@2x.png, logo.png y logo@2x.png garantizando nitidez sin interpolación de píxeles vacíos en el header de iOS.