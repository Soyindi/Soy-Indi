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
│   │   ├── start/                   # Onboarding Hub interactivo para prueba gratuita de 15 días
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
- **Next.js 15.4+ (App Router):** Soporte nativo para React 19, Server Actions, Partial Prerendering (PPR) y streaming vía `<Suspense>`.
- **TypeScript 5.9+:** Tipado estricto, sin tolerar `any`, con validación estricta de esquemas de datos vía **Zod 3.24+**.
- **Gestor de Paquetes:** `pnpm` o `npm` con directivas de motor precisas (`node >= 20.18.0`).

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
- **Three.js & React Three Fiber (R3F):** Sombreadores WebGL de refracción física (*Glassmorphism 2.0* con `MeshPhysicalMaterial`) que responden a la orientación y movimiento del cursor.
- **Framer Motion:** Coreografía de micro-animaciones, interpolación de layout (`layoutId`) y resortes físicos.

### 4.7 Motor de IA y Streaming
- **Vercel AI SDK 5+:** Streaming UI reactivo con `streamText` y Server-Sent Events (SSE).
- **Anthropic Claude 3.5 Sonnet:** Razonamiento superior para estructuración de presentaciones y optimización ATS de CVs.
- **Prompt Caching (`cache_control: { type: 'ephemeral' }`):** Ahorro superior al 90% en costos de tokens.

### 4.8 Exportación Serverless y Observabilidad
- **Typst (WASM):** Generación de PDFs profesionales en 20-40ms sin dependencias nativas de navegadores Chromium.
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

  const ogImageUrl = `https://indi.bio/api/og?title=${encodeURIComponent(card.title)}&role=${encodeURIComponent(card.profession)}&photo=${encodeURIComponent(card.photoUrl || '')}`;

  return {
    title: `${card.title} - ${card.profession} | INDI`,
    description: card.about || `Conecta directamente con ${card.title} en un solo clic por WhatsApp o redes.`,
    openGraph: {
      title: `${card.title} | ${card.profession}`,
      description: card.about || `Tarjeta interactiva profesional.`,
      url: `https://indi.bio/c/${card.slug}`,
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

## 7. Hoja de Ruta de Implementación y Estado en Vivo

### ✅ Fase 0: Setup y Fundaciones Arquitectónicas (COMPLETADA)
1. Repositorio Next.js 16 / React 19 en `C:\Users\Matías Riquelme\Desktop\Indi` con TypeScript estricto.
2. Tailwind CSS v4 con variables semánticas `@theme inline` en espacio de color `oklch()` y utilidades Glassmorphism 2.0.
3. Drizzle ORM + Turso (LibSQL Serverless) con soporte dual local/nube (`file:local.db`). Migraciones automáticas activas.
4. Better-Auth integrado directamente sobre Drizzle SQLite con endpoint `/api/auth/[...all]`.
5. Feature-Sliced Design (FSD) estructurado con alias `@/*` y 12 skills activas en `.agents/skills/`.

### ✅ Fase 1: Motor Visual, SmartParticles v3.0, Tarjetas y Dashboard (COMPLETADA)
1. Entidad `cards` con esquemas Drizzle SQLite y Server Actions validados por Zod.
2. Motor **SmartParticles v3.0 Anti-Colisión** con aceleración GPU (`will-change: transform, opacity`) en 3 modos (`ambient`, `interactive`, `static`).
3. Componente `DigitalCard` con acabado Glassmorphism 2.0, QR interactivo (`qrcode.react`), WhatsApp con mensaje dinámico y Web Share API.
4. Generador dinámico de previsualizaciones Open Graph en el Edge con `@vercel/og` (`/api/og`).
5. Vista pública Server Component en `/c/[slug]` y perfil de muestra `/c/demo`.
6. Dashboard interactivo de gestión en `/cards` con métricas de visitas/clicks, búsqueda en tiempo real y selector de estado.
7. Editor en tiempo real en `/cards/new` con sincronización a 60 FPS y selector de temas.

### ✅ Fase 2: Módulo Smart CV con Calibración ATS (COMPLETADA)
1. Entidad `smart_cvs` con persistencia en Turso y relaciones relacionales con usuarios.
2. Motor de auditoría heurística ATS (`auditAtsScoreAction`) que evalúa densidad de palabras clave, logros y estructura.
3. Editor interactivo en `/cv` con cálculo de score (0 a 100), detección de fortalezas y oportunidades de mejora.
4. Previsualización de documento profesional A4 (`CvDocumentPreview`) listo para impresión y exportación a PDF.

### ✅ Fase 3: Presentaciones Cinematográficas Multi-Agente (COMPLETADA)
1. Entidad `presentations` con almacenamiento JSON de diapositivas y temas visuales.
2. Estudio cinematográfico interactivo en `/presentations` con relación 16:9 (`SlideViewer`).
3. Asistente generador por IA (`generateAiSlidesAction`) para estructurar diapositivas automáticamente según el tema ingresado.
4. Paleta de temas orbitales (`Orbital Cyber`, `Emerald Aurora`, `Deep Space`) con iluminación volumétrica reactiva.
5. Controles de navegación y guardado directo en la base de datos Turso SQLite.

### ✅ Fase 4: Estrategia Comercial, Modelo Todo-en-Uno y Pricing (COMPLETADA)
1. Definición comercial unificada:
   - **Prueba VIP Gratuita de 15 Días** (sin tarjeta obligatoria al inicio).
   - **Plan Semestral Recomendado**: **$6.000 CLP cada 6 meses** (~$1.000 CLP/mes, 60% de ahorro) / $7 USD.
   - **Plan Mensual Flexible**: **$2.500 CLP / mes** / $3 USD.
   - **Modelo Todo-en-Uno**: Tarjetas, visitas, QR y hosting ilimitados, con **30 créditos de IA mensuales** para ATS CV y Presentaciones.
2. Entidades y Server Actions de suscripción (`checkUserEntitlementAction`, `consumeAiCreditsAction`, `createCheckoutSessionAction`).
3. Página dedicada `/pricing` con tabla comparativa de beneficios, badge de descuento, calculador de ahorro y FAQ interactivo (`FaqAccordion.tsx`).
4. Componente de notificación contextual `TrialBanner.tsx` integrado en `/cards`, `/cv` y `/presentations` con cuenta regresiva en vivo y CTA directo.

### ✅ Fase 5: Landing Page de Alta Conversión en 7 Bloques Estratégicos (COMPLETADA)
1. **Hero Interactivo**: Titular de alto impacto, CTA de prueba gratuita de 15 días y demostración en vivo de la tarjeta con simulación de escaneo QR y WhatsApp.
2. **Social Proof & Métricas**: Contadores dinámicos de tarjetas activas, interacciones registradas y tasa de contacto vía WhatsApp.
3. **Tabla Comparativa Disruptiva**: Análisis cara a cara "Tarjetas de Papel Tradicionales vs. INDI Digital 2026".
4. **Bento Grid de la Suite Todo-en-Uno**:
   - Tarjetas de Presentación Glassmorphism con QR y Web Share.
   - Smart CV ATS Optimizer con auditoría algorítmica.
   - Orbital Presentations con generación cinematográfica por IA.
5. **Sección de Precios Integrada**: Selector de divisa CLP / USD, con el Plan Semestral destacado como la opción más inteligente.
6. **Preguntas Frecuentes (FAQ)**: Respuestas claras sobre la prueba de 15 días, formas de pago (Webpay, CuentaRUT, Tarjetas, Stripe) y créditos de IA.
7. **CTA Final Volumétrico**: Cierre persuasivo sin riesgo con botón de registro inmediato a la prueba VIP.
### ✅ Fase 6: Onboarding Hub y Selector de Experiencia ('/start') (COMPLETADA)
1. **Ruta Server Component Dinámica en `/start`**:
   - Acceso inmediato al presionar *"Comenzar Prueba de 15 Días"* o *"Prueba Gratis"* desde cualquier CTA de la Landing Page.
   - Integración nativa con `checkUserEntitlementAction` para validar días restantes de prueba VIP (15 días) y créditos de IA (30 créditos).
2. **Componente de Decisión Intuitiva `OnboardingChoiceGrid`**:
   - Tarjeta 1: **Crear mi Tarjeta Digital** (Networking, QR dinámico, WhatsApp, 2 min) -> `/cards/new`.
   - Tarjeta 2: **Optimizar o Crear Smart CV** (Filtros ATS, formato A4 imprimible, 4 min) -> `/cv`.
   - Tarjeta 3: **Elaborar Presentación Cinemática** (IA estructuradora, formato 16:9, 3 min) -> `/presentations`.
3. **Atajo Directo al Dashboard**: Enlace alternativo para usuarios recurrentes hacia `/cards`.
### ✅ Fase 7: Flujo Continuo, Navegación Bidireccional y Dashboard Unificado (COMPLETADA)
1. **Componente Universal `AppEditorHeader.tsx`**:
   - Integrado en `/cards/new`, `/cv` y `/presentations`.
   - Botón *"← Volver al Panel"* con micro-animación en hover, breadcrumbs interactivos y área para botones de acción.
2. **Redirección Post-Creación al Dashboard**:
   - En `/cards/new`, al guardar con éxito, redirige a `/dashboard?created=true&slug=[slug]`.
   - Banner de confirmación visual en el Dashboard con botón para ver la tarjeta en vivo.
3. **Suite Unificada en `/dashboard` (`UnifiedDashboardView.tsx`)**:
   - Pestaña 1: **Tarjetas Digitales** (métricas de visitas, clicks, switch de activación, copia rápida de URL, previsualización en vivo y borrado).
   - Pestaña 2: **Smart CVs (ATS)** (listado con badge de puntaje ATS 0 a 100, fecha de actualización y acceso al editor imprimible A4).
   - Pestaña 3: **Presentaciones Cinemáticas** (listado con contador de diapositivas 16:9, vistas y acceso al estudio interactivo).
   - Botones contextuales de creación rápida según la pestaña activa ("Nueva Tarjeta", "Crear o Mejorar CV", "Nueva Presentación").
4. **Navegación en Tarjeta Pública (`/c/[slug]`)**:
   - Barra superior flotante con acceso directo de retorno *"← Volver a mi Panel"*.
5. **Enrutamiento Coherente**:
   - `/cards` redirige limpiamente a `/dashboard?tab=cards`.
   - Barra de navegación global en `src/app/page.tsx` actualizada con *"Panel General"*.
6. **Compilación Verificada**: `npm run build` exitoso con 0 errores TypeScript.

### ✅ Fase 8: Ingesta Documental Multimodal, Qwen2.5-VL y Dual-Target ATS (COMPLETADA)
1. **Ingesta Inteligente de Documentos Multimodal (`SmartDocumentDropzone.tsx`)**:
   - Soporte dual para carga interactiva de **Currículums existentes** (PDF/imagen) y **Títulos Universitarios / Certificaciones** (PDF/imagen).
   - Inferencia con modelos de frontera visuales: **Qwen2.5-VL** (resolución dinámica nativa NaViT y bounding boxes de layouts) con fallback resiliente a **Gemini 2.0 Flash**.
2. **Sanitización Regulatoria (EU AI Act & Antisesgo)**:
   - Filtrado automático de atributos protegidos (edad, estado civil, fotografía no reglamentaria, religión y género) para garantizar cumplimiento estricto con la Ley de Inteligencia Artificial europea.
3. **Reescritura STAR / Google XYZ con Mitigación Activa de Alucinaciones**:
   - Reformulación de cada viñeta bajo la estructura: *"Logré [X], medido por [Y], haciendo [Z]"*.
   - Detección algorítmica de viñetas sin métricas cuantitativas (`needs_metric: true`), alertando al usuario en la UI para evitar que la IA invente datos falsos.
4. **Validación y Mapeo Semántico de Títulos Universitarios**:
   - Extracción de entidad emisora, nombre del título, año y folio/código de verificación.
   - Algoritmo de similitud semántica para emparejar automáticamente diplomas con las entradas correspondientes en la sección `Educación`, agregando el sello de validación documental.
5. **Arquitectura Dual-Target ATS**:
   - Generación de capa semántica lineal serializada en el AST del documento para parseo determinista en sistemas ATS globales (Workday, Greenhouse, Lever, Taleo) combinada con visualización tipográfica de alta fidelidad.

### ✅ Fase 9: Ergonomía Táctil Móvil, Retícula Base 8 y Navegación Matemática (COMPLETADA)
1. **Drawer de Navegación Móvil (`MobileNavDrawer.tsx`)**:
   - Menú lateral deslizante con desenfoque de fondo (`backdrop-blur-2xl`) y target táctil accesible de 44x44px en la Landing Page.
   - Acceso universal a todos los productos y planes comerciales desde pantallas reducidas.
2. **Ergonomía de Pulgar (Thumb Zone) en Editores**:
   - Barras de acción flotantes fijas (`fixed bottom-4 inset-x-4 sm:hidden`) en `CardBuilder` y `SmartCvBuilder` para guardar y descargar sin scroll repetitivo.
3. **Normalización a Retícula Base 8 y Touch Targets $\ge 44\text{px}$**:
   - Redimensionamiento de iconos sociales a 44x44px (`w-11 h-11`) y botones de contacto a `min-h-[44px]` / `min-h-[48px]`.
   - Conversión de paddings a múltiplos de 8 (`p-6 sm:p-8`, `gap-4`).
4. **Cabecera Contextual Adaptativa de Conversión (`PublicContextualHeader.tsx`)**:
   - Enrutamiento inteligente en tarjetas públicas: visitantes anónimos ven CTA de conversión viral (*"Crea tu perfil gratis →"*), mientras que el propietario autenticado ve acceso rápido a su panel (*"← Panel"*).

### ✅ Fase 10: Estudio Cinemático de Presentaciones Orbitales Pro, Plantillas y Generación IA (COMPLETADA)
1. **Motor Multi-Layout Reactivo y Heurístico (`SlideViewer.tsx` & `heuristics.ts`)**:
   - Implementación del algoritmo determinista `inferOptimalLayoutStrategy(slide)` derivado de la investigación profunda de arquitectura:
     - `HERO_STATEMENT`: Síntesis ejecutiva de alto impacto (SCQA) con $\le 2$ nodos.
     - `KPI_BENTO_GRID`: Cuadros de mando cuantitativos para $\ge 3$ métricas con deltas de crecimiento.
     - `SPLIT_COMPARISON`: Tensión semántica o comparativa A/B (Antes vs Después / Solución Tradicional vs INDI 2026).
     - `SEQUENTIAL_TIMELINE`: Continuidad histórica y roadmaps secuenciales con progreso visual.
     - `MASONRY_DYNAMIC`: Topología asimétrica mixta de alta entropía.
   - Renderizado condicional con soporte de *Action Titles* (máximo 15 palabras activas según el Principio de la Pirámide de McKinsey) y relaciones de aspecto 16:9 y 9:16 responsivas.
2. **Catálogo de Plantillas Profesionales 2026 (`templates.ts`)**:
   - 4 plantillas completas curadas listas para usar:
     - *Pitch Deck para Inversionistas* (YC Style, 5 diapositivas).
     - *Lanzamiento de Producto & Keynote* (Apple/Linear Style, 4 diapositivas).
     - *Revisión de Arquitectura de Software* (Staff Lead, 4 diapositivas).
     - *Revisión Trimestral de Negocio (QBR)* (Estrategia & OKRs, 4 diapositivas).
3. **Malla de Generación IA con Principio de Pirámide (`actions.ts`)**:
   - `generateAiSlidesAction`: Orquestación semántica adaptativa que formula problemas y respuestas bajo el marco deductivo SCQA (Situación, Complicación, Pregunta, Respuesta) y regla MECE (Mutuamente Excluyentes, Colectivamente Exhaustivos).
   - `upsertPresentationAction` y `deletePresentationAction`: Protección multi-tenant con validación estricta de propiedad contra `getSafeAuthenticatedUserId` y contratos Zod.
4. **Modo Presentador y Web APIs Nativas (`PublicPresentationViewer.tsx`)**:
   - **Screen Wake Lock API**: Mantiene la pantalla activa durante disertaciones sin suspensión inoportuna.
   - **Vibration API**: Retroalimentación háptica en smartphones del orador al avanzar diapositivas.
   - **Fullscreen API & Cronómetro en Vivo**: Vista de telemetría con notas confidenciales del orador desplegables.
   - **Ergonomía Táctil Móvil (Thumb Zone)**: Barra de acción inferior flotante fija (`fixed bottom-4 inset-x-4 sm:hidden`) con touch targets $\ge 44\text{px}$.
5. **Suite de Pruebas Unitarias Automatizadas (`tests/unit/`)**:
   - `presentation-schema.test.ts` (9 tests) y `presentation-heuristics.test.ts` (6 tests).
6. **Especificación Técnica Completa**:
   - Preservada y documentada en [`docs/specifications/ORBITAL_PRESENTATIONS_ENGINE_2026.md`](../specifications/ORBITAL_PRESENTATIONS_ENGINE_2026.md).

### ✅ Fase 11: Deconstrucción Multimodal SCQA, Modelos de Frontera NVIDIA NIM y Presentación en Vivo Resiliente (COMPLETADA)
1. **Cliente de Inferencia NVIDIA NIM (`src/shared/api/nvidia-nim.ts`)**:
   - Conexión a la red de microservicios de aceleración de NVIDIA NIM (`integrate.api.nvidia.com/v1/chat/completions`).
   - Soporte para modelos de frontera: `meta/llama-3.3-70b-instruct` y `deepseek-ai/deepseek-r1`.
   - Sistema de failover inteligente: si no existe API key o falla la red, conmuta de forma transparente al motor determinista SCQA local, garantizando 100% de disponibilidad sin caídas de cara al usuario.
2. **Asistente Multimodal y Dropzone Inteligente (`SmartPresentationDropzone.tsx`)**:
   - Procesamiento directo de archivos fuente: PDF, TXT, Markdown, CSV, Word o capturas de datos.
   - Calibración de ritmo (*pacing*) según tiempo de exposición:
     - **3 min**: 3 diapositivas (~40-60s por diapositiva) - Lightning / Elevator pitch.
     - **5 min**: 5 diapositivas (~60s por diapositiva) - Reunión ejecutiva.
     - **10 min**: 8 diapositivas (~75s por diapositiva) - Keynote / Demo Day.
     - **20 min**: 12 diapositivas (~100s por diapositiva) - Masterclass / Deep Dive.
   - Modulación por audiencia (*investors*, *b2b_clients*, *engineering*, *general*) y tono visual (*orbital_cyber*, *emerald_aurora*, *deep_space*, *solar_obsidian*).
3. **Resolución Resiliente de Presentación en Vivo (Cero Errores 404)**:
   - **Modo In-Situ en el Estudio**: Proyección directa en pantalla completa desde el estado reactivo en memoria mediante `<PublicPresentationViewer onExit={...}>`, permitiendo proyectar sin obligar a guardar primero en la base de datos.
   - **Multi-Source Resolver en `/p/[slug]`**: Resolución en cascada: (1) Entidades persistidas en Turso SQLite $\rightarrow$ (2) Plantillas curadas `PRESENTATION_TEMPLATES` $\rightarrow$ (3) Vista elegante de borrador en vivo en lugar de pantalla de error 404.
### ✅ Fase 12: Auditoría Integral y Perfeccionamiento de Presentaciones Orbitales (COMPLETADA)
1. **Persistencia Idempotente en SQLite (`actions.ts`)**:
   - Corrección del bloqueo de unicidad de slug: si el usuario guarda repetidas veces sin recargar la página, `upsertPresentationAction` resuelve de forma inteligente entidades preexistentes por slug y actualiza el registro (`UPDATE`) retornando `{ success: true, id, slug }`.
   - `PresentationStudio` retiene y actualiza `presentationId` en su estado local, garantizando consistencia absoluta en el guardado.
2. **Rehidratación Bidireccional de Estado (`PresentationsPage` & `UnifiedDashboardView`)**:
   - Soporte para parámetros `searchParams: { slug?: string; id?: string }` en la ruta `/presentations`.
   - Enlace optimizado en el Dashboard: al presionar *"Abrir Estudio"*, se carga la presentación específica seleccionada con todas sus diapositivas y temas en lugar de la plantilla por defecto.
3. **Editor de Diapositivas Integral (SCQA & Sub-editores)**:
   - Habilitación de edición de **Action Title** (titular activo de McKinsey con pauta <15 palabras).
   - Editor interactivo de **Key Points** (adición y supresión de viñetas dinámicas).
   - Sub-editores contextuales para **Métricas/KPIs** (etiqueta, valor y delta), **Comparativas** (listas A/B antes/después), **Timelines** (fases de roadmap) y **Citas** (autor, cargo y testimonio).
   - Botones de **reordenamiento secuencial de diapositivas** (`← Mover Antes` y `Mover Después →`).
4. **Inmersión, Gestos Táctiles y Telemetría en el Visor (`PublicPresentationViewer.tsx`)**:
   - **Touch Swipe Gestures**: Detección de deslizamiento horizontal con umbral de 50px para presentar fluidamente desde iPads y smartphones.
   - **Escape Handler In-Situ**: Tecla `Escape` vinculada al cierre del overlay de presentación en vivo devolviendo al usuario al estudio de edición.
   - **Barra de Progreso Cinemática Superior**: Indicador visual continuo con gradiente OKLCH (`from-indigo-500 via-cyan-400 to-emerald-400`).
   - **Acción Rápida de Copiar Enlace**: Botón con portapapeles y retroalimentación en la barra superior.
5. **Gestión Completa de Ciclo de Vida en Dashboard**:
   - Incorporación de botón *"Copiar Link"* y botón *"Eliminar"* con confirmación modal y guardrails multi-tenant.
6. **Validación y Suite de Pruebas**:
   - 47 pruebas unitarias aprobadas al 100% en Vitest (`tests/unit/presentation-flow-audit.test.ts`).
   - 0 errores en verificación de tipos TypeScript (`npm run typecheck`).




