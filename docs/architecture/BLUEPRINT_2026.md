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
   - 49 pruebas unitarias aprobadas al 100% en Vitest (`tests/unit/presentation-flow-audit.test.ts` y `tests/unit/presentation-decomposition.test.ts`).
   - 0 errores en verificación de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 13: Ingesta Real de Archivos (IDP) y Motor Semántico Contextual para Presentaciones (COMPLETADA)
1. **Extracción y Descodificación Real de Documentos (`document-parser.ts` & `unpdf`)**:
   - Superación de placeholders estáticos: los archivos PDF, Word, Markdown, TXT, CSV y JSON son procesados extrayendo su texto íntegro en memoria mediante `extractTextFromDocument`.
   - Nueva Server Action `parsePresentationDocumentAction(formData)` que recibe archivos multipart y extrae el texto puro en el servidor con retroalimentación visual en tiempo real en la dropzone.
2. **Procesamiento Inteligente de Documentos (IDP) y Segmentación SCQA**:
   - Detección algorítmica de métricas cuantitativas reales en el texto ($12k, 340%, 99.98%, 14 días) para poblar automáticamente diapositivas Bento de evidencia numérica.
   - Extracción de títulos a partir del primer encabezado `# Título` del documento o línea principal.
   - División en secciones semánticas coherentes y derivación de *Action Titles* concisos a partir del contenido del archivo subido.
3. **INDI Semantic Heuristics Engine**:
   - El motor de contingencia determinista ya no genera texto genérico: mapea las oraciones, conclusiones y métricas reales del archivo hacia los layouts SCQA (visión, evidencia, comparativa y plan de acción).
4. **Gobernanza de Calidad y Tests**:
   - 49 pruebas unitarias pasando al 100% en Vitest con 0 errores TypeScript.

### ✅ Fase 14: Pipeline Semántico Adaptativo (SAP Engine) y Clasificación de Arquetipos (COMPLETADA)
1. **Profiler Semántico y Detección de Arquetipos (`document-parser.ts`)**:
   - Clasificación probabilística del tipo de documento: `technical_architecture`, `business_pitch`, `audit_report`, `narrative_educational`, o `executive_strategy`.
   - Extracción de polaridad de contrastes: mapeo de oraciones de problemas/dolores frente a soluciones reales extraídas del texto.
   - Extracción de secuencias cronológicas y etapas del proyecto.
   - Extracción de conceptos clave y definiciones para diapositivas de arquitectura o fundamentos técnicos.
2. **Generación con Cero Hardcoding y Fidelidad Extrema al Texto**:
   - Eliminación de la suposición de métricas: si un texto no contiene números, el motor prohíbe generar diapositivas Bento ficticias y adapta la topología a *Conceptos*, *Arquitectura*, *Comparativas* o *Hero Statement*.
   - El selector del Dropzone permite modo `Auto-Adaptativo` o selección explícita del arquetipo.
   - El Meta-Prompt para NVIDIA NIM exige que cada viñeta parafrasee un hecho real del texto y prohíbe textos de relleno.
3. **Validación Exhaustiva con 57 Pruebas Unitarias**:
   - Nueva suite `tests/unit/presentation-adaptive-pipeline.test.ts` con 8 pruebas específicas de arquetipos, contrastes y generación adaptativa.
   - 10 suites de prueba aprobadas al 100% (57/57 tests en Vitest).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### ✅ Fase 15: Auditoría de Grado Corporativo, Calidad Editorial y Scorecard (COMPLETADA)
1. **Auditoría Integral de Presentaciones (Minto Pyramid, SCQA & Ghost Deck)**:
   - Integración formal del informe de auditoría estratégica en `Auditoría Plataforma Presentaciones IA.md`.
   - Validación del método "Ghost Deck": los `actionTitle` conforman una narrativa ejecutiva conectada, eliminando "Topic Titles" pasivos y forzando titulares asertivos con conclusiones explícitas.
   - Evaluación de 4 dimensiones clave: Densidad Cognitiva, Relación Señal/Ruido, Jerarquía Visual y Distribución de Datos.
2. **Refinamiento Ergonómico Táctil Mobile-First (WCAG 2.2 AA)**:
   - Auditoría y ampliación de todos los hit targets de edición (controles de reordenamiento de diapositivas, eliminación de métricas y puntos clave) a $\ge 44\text{px}$ (`min-h-[44px] min-w-[44px]`).
   - Mantenimiento estricto de la zona de pulgar (*Thumb Zone*) con barra flotante móvil inferior.
3. **Control de Calidad y Pruebas Unitarias (59 Passing)**:
   - Nuevos tests en `tests/unit/presentation-flow-audit.test.ts` para validación de Ghost Deck y Scorecard de Calidad de Producción.
   - 100% de la suite de pruebas unitarias aprobada (59 de 59 tests pasando).

### ✅ Fase 16: Inteligencia en Temas Escuetos, Guardrails de Plantillas y Modelos Activos (COMPLETADA)
1. **Auditoría e Investigación Ejecutiva para Temas Escuetos (`generateAiSlidesAction`)**:
   - Diagnóstico del flujo de "Tema Rápido": cuando el usuario ingresa un tema mínimo o escueto (ej. *"Ciberseguridad en Fintechs"*), el sistema anteriormente dependía de un fallback léxico que duplicaba la frase en los títulos.
   - Conexión del generador rápido directamente a **NVIDIA NIM** con meta-prompt de consultoría estratégica senior:
     - El modelo realiza una investigación interna en su base de conocimiento estructurada, complementando con datos normativos (Ley FinTech 21.521, CMF, ISO 27001), terminología técnica de la industria y métricas plausibles.
     - Generación de *Action Titles* con conclusiones concretas bajo el Principio de la Pirámide de McKinsey y hoja de ruta secuencial en la diapositiva de cierre.
2. **Selección y Activación de Modelos de Frontera en NVIDIA NIM**:
   - Detección de obsolescencia: `meta/llama-3.3-70b-instruct` quedó deprecado por NVIDIA (`410 Gone`).
   - Activación de **`meta/llama-3.2-11b-vision-instruct`** como motor de alta velocidad y alta fidelidad en inferencia JSON, con compatibilidad verificada para `meta/llama-3.2-90b-vision-instruct`.
3. **Guardrail Anti-Pérdida de Contenido al Aplicar Plantillas (`PresentationStudio.tsx`)**:
   - Resolución del problema de sobrescritura accidental: al seleccionar una plantilla en el catálogo, se despliega un modal interactivo con dos opciones:
     - *"Conservar mi contenido actual"*: Adapta la tipología visual, los layouts y la paleta de colores sin borrar los textos ni las diapositivas del usuario.
     - *"Reemplazar todo con el ejemplo de la plantilla"*: Carga el conjunto completo de demostración.
4. **Validación y Suite de Pruebas (60 Tests Passing)**:
   - Nuevos tests de auditoría en `tests/unit/presentation-flow-audit.test.ts` para validar el enriquecimiento de temas escuetos.
   - 60 pruebas unitarias aprobadas al 100% en Vitest.
   - 0 errores en verificación de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 17: Modo Ampliación Profesional de Diapositiva Individual y Sincronización Web API (COMPLETADA)
1. **Ampliación Profesional de Diapositiva Individual (`SlideViewer.tsx`)**:
   - Integración de control dedicado de pantalla completa a nivel de contenedor de diapositiva (`slideRef.current.requestFullscreen()`), permitiendo expandir exclusivamente el lienzo 16:9 sin mostrar la barra de navegación del navegador, controles de estudio ni elementos ajenos.
   - Sincronización bidireccional reactiva con el evento nativo `fullscreenchange` de la Web API (`isSlideFullscreen`), adaptando dinámicamente el layout a `w-full h-screen` con paddings ergonómicos y bordes optimizados para proyecciones corporativas.
   - Botón accesible con touch target $\ge 44 \times 44\text{ px}$ (`min-h-[44px] min-w-[44px]`), micro-animación de escala en hover/active, icono contextual (`Maximize2` / `Minimize2`) y label adaptativo para pantallas de escritorio.
2. **Robustez y Resiliencia en CI/CD**:
   - Corrección y blindaje del runner de GitHub Actions (`.github/workflows/ci.yml`): incorporación del paso de inicialización de esquema SQLite (`npx drizzle-kit push --force`) previo a los tests unitarios.
   - Refactorización de resiliencia en `getSafeAuthenticatedUserId` (`src/shared/lib/session.ts`) y `checkUserEntitlementAction` (`src/features/pricing/actions.ts`) con bloques `try/catch` deterministas, evitando que errores de tablas no creadas bloqueen suites aisladas en runners de CI o entornos de desarrollo en frío.
3. **Validación y Suite de Pruebas (61 Tests Passing)**:
   - Nuevos tests de contrato y ergonomía en `tests/unit/presentation-flow-audit.test.ts`.
   - 61 pruebas unitarias aprobadas al 100% en Vitest (10 suites pasando).
   - 0 errores en verificación de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 18: Investigación Profunda (Deep Research), vCard 4.0 One-Tap y Bento Blocks en Tarjetas Vivas (COMPLETADA)
1. **Prompt Maestro de Deep Research para Gemini 2.5 / Advanced (`PROMPT_GEMINI_DEEP_RESEARCH_DIGITAL_CARDS_2026.md`)**:
   - Formulación de especificación exhaustiva en 7 ejes estratégicos:
     - Eje 1: Benchmark mundial (Popl, Mobilo, Blinq, HiHello, Bento.me, Linear) y evolución de la tarjeta a Hub de Conversión.
     - Eje 2: Hardware networking, chips NFC (NTAG213/215/216), Web NFC API, Apple Wallet (`.pkpass`), Google Wallet y PWA Local-First.
     - Eje 3: Sistema visual, Gamut P3, espacio OKLCH, algoritmos de contraste APCA y Glassmorphism 2.0 volumétrico.
     - Eje 4: Viralidad en el Edge con `@vercel/og`, mitigación de problemas de caché en WhatsApp y Core Web Vitals (LCP < 0.6s).
     - Eje 5: Inteligencia Artificial generativa, Elevator Pitch adaptativo, QR inteligente y agentes de captura de leads.
     - Eje 6: Métricas avanzadas de networking y privacidad sin cookies (GDPR-compliant).
     - Eje 7: Arquitectura de datos FSD y evolución del esquema de Drizzle SQLite.
2. **Generador Determinista de vCard 3.0 / 4.0 (`src/shared/lib/vcard.ts`)**:
   - Construcción de archivos `.vcf` conformes a RFC 2426 y RFC 6350 con codificación estricta UTF-8 y escape determinista de caracteres reservados.
   - Mapeo automático de nombres, apellidos, teléfonos categorizados, correo, biografía, redes sociales y enlace directo al perfil INDI.
   - Integración nativa de botón *"Guardar en Contactos"* (`UserPlus`) en `DigitalCard.tsx` con touch target accesible $\ge 48\text{px}$.
3. **Evolución del Esquema Zod y Bloques Bento Modulares (`src/entities/card/schemas.ts`)**:
   - Incorporación de `bentoBlocks` (enlaces destacados, métricas cuantitativas, proyectos y testimonios) y campos de personalización de temas (`badgeText`, `ctaLabel`).
   - Mantenimiento estricto de retrocompatibilidad y tipado desacoplado `CardFormInput` para inserciones flexibles.
4. **Control de Calidad y Pruebas Unitarias (67 Tests Passing)**:
   - Nueva suite `tests/unit/vcard-generator.test.ts` (5 pruebas) y ampliación de `tests/unit/card-schema.test.ts` (6 pruebas).
   - 100% de las pruebas aprobadas (67 de 67 tests en 11 suites en Vitest).
   - 0 errores en verificación de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 19: Sistema de Diseño de Lujo, Acabados de Material y Transiciones Cinemáticas (COMPLETADA)
1. **Presets de Diseño Curados OKLCH & Gamut P3 (`src/entities/card/themes.ts`)**:
   - Creación de 5 arquetipos de diseño de élite:
     - *Cyber Nebula*: Índigo estelar con acento cian de alta energía y partículas reactivas.
     - *Executive Titanium*: Gris titanio pulido con elegancia sobria C-Level y textura dot-grid.
     - *Emerald Botanical*: Verde esmeralda orgánico con resplandor para salud y ESG.
     - *Solar Obsidian*: Negro azabache mate con acentos en oro líquido y champaña.
     - *Swiss Monochrome*: Minimalismo suizo de alto contraste y tipografía pura.
2. **Acabados de Material y Texturas de Superficie (`DigitalCard.tsx` & `CardBuilder.tsx`)**:
   - Soporte dinámico de acabados (`cardFinish`): *Classic Glass*, *Holographic*, *Titanium*, *Obsidian* y *Minimal*.
   - Texturas de superficie (`surfaceTexture`): *Radial Glow*, *Dot Grid* y *Liso Minimalista*.
   - Halo de luz reactivo adaptado al color primario y badge contextual de disponibilidad.
   - Pestaña de edición táctil renovada en `CardBuilder` con hit targets ergonómicos $\ge 44\text{px}$.
3. **Efectos Cinemáticos & Aura Ambiental Reactiva (`SlideViewer.tsx` & `PresentationStudio.tsx`)**:
   - Selector interactivo de transiciones visuales (`transitionEffect`): *Crossfade*, *Slide Keynote* y *Zoom Focus*.
   - Auras de luz volumétrica (`ambientAuraIntensity`): iluminación perimetral acelerada por GPU que muta tonalmente según el arquetipo de diapositiva (Cian/Índigo para métricas, Rosa para comparativas, Ámbar para citas).
   - Selector de emparejamiento tipográfico (`fontPairing`): *Modern Sans*, *Editorial Serif* y *Técnica Mono*.
4. **Suite de Pruebas Unitarias & Calidad (72 Tests Passing)**:
   - Nuevas suites: `tests/unit/card-design-presets.test.ts` (3 tests) y `tests/unit/presentation-effects.test.ts` (2 tests).
   - 72 pruebas unitarias aprobadas al 100% en Vitest (13 suites pasando).
   - 0 errores de compilación TypeScript (`npm run typecheck`).

### ✅ Fase 20: Telemetría Atómica de Eventos, Asistente de Biografías con IA y Motor de Contraste WCAG 2.2 AA (COMPLETADA)
1. **Auditoría e Integración de Tecnologías Clave de `matiquelmec/indi`**:
   - Extracción y modernización de patrones de telemetría de eventos y generación de copys profesionales adaptados a la arquitectura FSD (Turso + Drizzle + Zod).
2. **Persistencia Atómica de Eventos de Conversión (`src/entities/schema.ts` & `analytics-actions.ts`)**:
   - Creación de la tabla `card_events` en Turso con soporte para eventos granulares (`view`, `contact_save`, `whatsapp_click`, `share`, `qr_scan`).
   - Índices optimizados para agregaciones temporales por tarjeta (`card_events_card_idx`, `card_events_card_type_idx`).
   - Server Action `trackCardEventAction` resiliente con validación estricta Zod y fallback silencioso para no degradar la experiencia de usuario.
   - Cálculo automático de Tasa de Conversión en el dashboard unificado (`UnifiedDashboardView.tsx`).
3. **Generador Multi-Variante de Biografías con IA (`src/features/card-builder/ai-bio-actions.ts`)**:
   - Server Action `generateBioVariantsAction` con soporte dual para Google Gemini / OpenRouter y motor heurístico determinista de alta calidad.
   - Generación instantánea de 3 arquetipos de tono: *Ejecutivo C-Level*, *Innovador Tech* y *Cercano Consultivo*.
   - Integración fluida en `CardBuilder.tsx` con cards interactivas y selección en un toque.
4. **Motor Perceptual de Contraste WCAG 2.2 AA (`src/shared/lib/colorContrast.ts`)**:
   - Algoritmo matemático según la especificación W3C para luminancia relativa y ratio de contraste (1:21).
   - Función `getAccessibleTextColor` que garantiza legibilidad óptima (`#ffffff` vs `#0f172a`) en botones primarios, badges y acentos interactivos sin importar el color elegido.
   - Sincronización en `DigitalCard.tsx` para el botón de contacto vCard One-Tap.
5. **Suite de Pruebas Unitarias y Aseguramiento de Calidad (79 Tests Passing)**:
   - Nuevas suites de pruebas: `tests/unit/color-contrast.test.ts` (5 pruebas) y `tests/unit/ai-bio-generator.test.ts` (2 pruebas).
   - 100% de las pruebas aprobadas en Vitest (79 de 79 tests en 15 suites).
   - 0 errores de compilación TypeScript (`npm run typecheck`).

### ✅ Fase 21: Geolocalización, Mapas Interactivos Privacy-First y vCard ADR One-Tap (COMPLETADA)
1. **Investigación de Tendencias 2026 en Cartografía Web para Identidades Digitales**:
   - Adopción de arquitectura *Privacy-First* sin rastreadores invasivos ni claves de API expuestas en cliente: integración de OpenStreetMap renderizado en sandbox seguro con `loading="lazy"` y `referrerPolicy="no-referrer"`.
   - Puente multi-navegador con enlaces universales hacia las principales apps nativas de navegación (Google Maps Universal URI y Waze Deep-link) con touch targets ergonómicos $\ge 44\text{px}$.
2. **Evolución del Modelo de Dominio y Base de Datos (`Turso + Drizzle`)**:
   - Incorporación de columna `address` (`text('address')`) en la tabla `cards` en [src/entities/schema.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/entities/schema.ts) aplicada con `drizzle-kit push --force`.
   - Extensión de [src/entities/card/schemas.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/entities/card/schemas.ts) con validación Zod estricta (máximo 200 caracteres, opcional y nullable).
   - Actualización de Server Action `upsertCardAction` en [src/features/card-builder/actions.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/card-builder/actions.ts) para persistencia atómica.
3. **Formateo Estándar vCard RFC 6350 / RFC 2426 (`ADR` y `LABEL`)**:
   - En [src/shared/lib/vcard.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/shared/lib/vcard.ts), mapeo estandarizado de la dirección a los campos universales `ADR;TYPE=WORK` y `LABEL;TYPE=WORK` con escape estricto de caracteres especiales (comas, saltos de línea, barras invertidas).
4. **Experiencia UI/UX en Diseñador y Tarjeta Viva**:
   - En `CardBuilder.tsx`: nuevo campo ergonómico en la pestaña *Contacto* con icono `MapPin` e instrucciones claras.
   - En `DigitalCard.tsx`: tarjeta de ubicación glassmorphic con vista de mapa integrada, indicador de dirección y barra de navegación táctil inferior compatible con la Thumb Zone móvil.
5. **Aseguramiento de Calidad y Suite de Pruebas (81 Tests Passing)**:
   - Ampliación de suites: `tests/unit/card-schema.test.ts` (7 pruebas) y `tests/unit/vcard-generator.test.ts` (6 pruebas).
   - 100% de las pruebas aprobadas en Vitest (81 de 81 tests en 15 suites).
   - 0 errores de compilación TypeScript (`npm run typecheck`).

### ✅ Fase 22: Auditoría Integral Multi-Tenant, Ergonomía Táctil y Gobernanza Zero-Bugs (COMPLETADA)
1. **Auditoría de Seguridad Multi-Tenant y Guardrails Zod**:
   - Protección estricta contra IDOR y mutaciones anónimas en `getUserCardsAction`, `deleteCardAction`, `toggleCardActiveAction` ([src/features/card-builder/dashboard-actions.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/card-builder/dashboard-actions.ts)).
   - Aislamiento multi-cuenta completo en `getUserSmartCvsAction`, `upsertSmartCvAction` y creación de `deleteSmartCvAction` ([src/features/ai-smart-cv/actions.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/ai-smart-cv/actions.ts)) con validación estricta de propiedad contra `getSafeAuthenticatedUserId`.
   - Prevención de colisión y usurpación de URLs (slugs) entre usuarios distintos en `upsertPresentationAction` ([src/features/orbital-presentations/actions.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/orbital-presentations/actions.ts)).
   - Resolución de derechos de acceso y período de prueba de 15 días adaptada a multi-usuario en `checkUserEntitlementAction` ([src/features/pricing/actions.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/pricing/actions.ts)).
2. **Corrección de Persistencia de Ubicación & Datos**:
   - Enlace completo del campo `address` en el payload de guardado de `CardBuilder.tsx` para sincronización bidireccional con SQLite y renderizado del mapa.
3. **Ergonomía Táctil Mobile-First (WCAG 2.2 AA) & Thumb Zone**:
   - Normalización de todos los botones de acción e interruptores a $\ge 44 \times 44\text{ px}$ (`min-h-[44px] min-w-[44px]`) en `CardBuilder.tsx` y `UnifiedDashboardView.tsx`.
   - Integración de botón de eliminación con confirmación interactiva para Smart CVs en el Dashboard.
4. **Control de Calidad y Pruebas Unitarias (85 Tests Passing)**:
   - Nueva suite de pruebas unitarias: `tests/unit/multi-tenant-audit.test.ts` (4 pruebas).
   - 100% de la suite de pruebas unitarias aprobada en Vitest (85 de 85 tests en 16 suites).
   - 0 errores en verificación estricta de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 23: Independencia Multi-Tarjeta y Flujo Explícito de Edición (COMPLETADA)
1. **Resolución de Causa Raíz de Reemplazo Involuntario de Tarjetas**:
   - Eliminación del slug fijo `'mi-tarjeta'` en `CardBuilder.tsx`. Incorporación de generador dinámico aleatorio (`tarjeta-[hash]`) para tarjetas nuevas, impidiendo colisiones involuntarias.
   - Refactorización de `upsertCardAction` en [src/features/card-builder/actions.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/card-builder/actions.ts) diferenciando formalmente entre Creación (`INSERT` con UUID nuevo y verificación de slug libre) y Edición (`UPDATE` con validación estricta de propiedad `and(eq(cards.id, cardId), eq(cards.userId, targetUserId))` y verificación de no-colisión de slug `ne(cards.id, cardId)`).
2. **Arquitectura de Edición Bidireccional (`App Router + Server Actions`)**:
   - Soporte de consulta segura `getCardByIdAction` en [src/features/card-builder/dashboard-actions.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/card-builder/dashboard-actions.ts) validando pertenencia multi-tenant.
   - Habilitación del parámetro de consulta `?id=[cardId]` en [src/app/cards/new/page.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/app/cards/new/page.tsx) con soporte asíncrono para Next.js 15 (`searchParams: Promise<{ id?: string }>`).
   - Actualización dinámica de encabezados en `CardBuilder.tsx` ("Modo Edición" vs "Crear Tarjeta INDI").
3. **UX & Ergonomía Táctil en Dashboard Unificado**:
   - Incorporación de botón interactivo "Editar Tarjeta" con icono `Edit3` (`lucide-react`) en cada tarjeta de [UnifiedDashboardView.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/dashboard/components/UnifiedDashboardView.tsx), con touch target garantizado $\ge 44 \times 44\text{ px}$ (`min-h-[44px] min-w-[44px]`).
4. **Aseguramiento de Calidad y Suite de Pruebas Unitarias (90 Tests Passing)**:
   - Nueva suite de pruebas: `tests/unit/card-builder-independence.test.ts` (5 pruebas).
   - 100% de la suite de pruebas unitarias aprobada en Vitest (90 de 90 tests en 17 suites).
   - 0 errores en verificación estricta de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 24: Transición a Turso Cloud Oficial, Pipeline de Lotes `db.batch()` y Resolución Centralizada de Sesiones Better-Auth (COMPLETADA)
1. **Conexión & Sincronización a Turso Cloud Oficial (`libsql://soyindi-soyindi.aws-us-west-2.turso.io`)**:
   - Integración oficial de credenciales remotas en `.env.local` y actualización dinámica de `drizzle.config.ts` (`dialect: isTurso ? 'turso' : 'sqlite'` con inyección de `authToken` y carga de `.env.local`).
   - Generación y ejecución de la migración faltante `0002_sharp_korath.sql` (creación de tabla `card_events` con índices de agregación y adición de columna `address` en `cards`).
   - Migración 100% exitosa de las 8 tablas de dominio sobre Turso Cloud (`user`, `session`, `account`, `verification`, `cards`, `card_events`, `smart_cvs`, `presentations`, `__drizzle_migrations`).
   - Creación del script de sembrado idempotente `src/shared/api/seed.ts` y script npm `"db:seed"`. Sembrado exitoso de usuario demo, tarjeta insignia `/c/matias-riquelme`, Smart CV con score ATS 94 y presentación interactiva `/p/pitch-deck-2026`.
2. **Optimización de Telemetría con Pipeline de Lotes `db.batch()` (Turso LibSQL)**:
   - Eliminación de escrituras paralelas con contención `Promise.all([db.update, db.insert])` en [src/app/c/[slug]/page.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/app/c/%5Bslug%5D/page.tsx) y [src/features/card-builder/analytics-actions.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/card-builder/analytics-actions.ts).
   - Sustitución por transacciones por lotes `db.batch()` nativas de `drizzle-orm/libsql`, colapsando 2 roundtrips de red en 1 solo request HTTP perimetral atómico y eliminando riesgos de bloqueos `SQLITE_BUSY`.
3. **Resolución Centralizada de Sesiones Better-Auth en Guardrails de Servidor**:
   - Actualización de `getSafeAuthenticatedUserId` en [src/shared/lib/session.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/shared/lib/session.ts) para extraer de forma segura y transparente la sesión autenticada desde los encabezados de Next.js (`auth.api.getSession({ headers })`) con fallback resiliente para pruebas unitarias.
4. **Control de Calidad, Resiliencia y Pruebas Unitarias (95 Tests Passing)**:
   - Nueva suite `tests/unit/turso-batch-and-schema.test.ts` (5 pruebas).
   - Mock determinista de inferencia externa en `tests/unit/presentation-adaptive-pipeline.test.ts` para ejecución offline instantánea (<20ms).
   - 100% de las pruebas aprobadas en Vitest (95 de 95 tests en 18 suites).
   - 0 errores en verificación estricta de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 25: Pipeline de Compresión Client-Side WebP & Validación Polimórfica de Medios (COMPLETADA)
1. **Arquitectura FSD & Primitiva Reutilizable (`src/shared/lib/imageCompression.ts`)**:
   - Extracción, modernización y tipado riguroso del algoritmo de compresión de imágenes derivado del proyecto de referencia (`JoyasJP_Definitive`).
   - Función pura y universal `compressImageClient` basada en la API de HTML5 Canvas y WebP con preservación matemática de relación de aspecto (`calculateAspectRatioFit`).
   - Cero sobrecarga de red al servidor: conversión en tiempo de ejecución en el navegador, reduciendo fotos de 4-10MB a menos de 150KB (ahorro de hasta un 85%).
   - Retorno dual: objeto `File` comprimido para uploads binarios y cadena `dataUrl` en base64 para previsualizaciones instantáneas reactivas.
2. **Validación Polimórfica de Contratos Zod (`src/entities/card/schemas.ts`)**:
   - Flexibilización y robustecimiento de `photoUrl` para admitir tanto URLs web públicas (`http://`, `https://`) como Data URLs en formato Base64 (`data:image/...`), manteniendo la sanitización estricta contra inyecciones de scripts (`javascript:`).
3. **Ergonomía Táctil Mobile-First (WCAG 2.2 AA) & Feedback en Tiempo Real**:
   - Actualización de `CardBuilder.tsx` con zona de carga de fotos integrada, botón interactivo con touch target $\ge 44 \times 44\text{ px}$, indicador visual de carga con micro-animación `Loader2` y badge de telemetría de compresión (KB original vs KB optimizado y porcentaje de ahorro).
   - Integración sinérgica en la ingesta multimodal de CVs y diplomas (`SmartDocumentDropzone.tsx`), firma digital en PDF (`SignatureModal.tsx`) y presentaciones (`SmartPresentationDropzone.tsx`).
4. **Control de Calidad y Pruebas Unitarias (105 Tests Passing)**:
   - Nueva suite de pruebas unitarias: `tests/unit/image-compression.test.ts` (10 pruebas unitarias).
   - 100% de la suite de pruebas unitarias aprobada en Vitest (105 de 105 tests en 19 suites).
   - 0 errores en verificación estricta de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 26: Autenticación Multi-Cuenta (Google OAuth + Better-Auth), Lifecycle Hooks y Preparación para Vercel (COMPLETADA)
1. **Configuración Oficial de Better-Auth con Google OAuth (`src/shared/lib/auth.ts`)**:
   - Activación de proveedor `google` con enlace declarativo de credenciales desde variables de entorno (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
   - Soporte automático para fallback en entornos donde las credenciales sociales no estén configuradas aún, manteniendo activo el flujo de correo y contraseña sin fallos de compilación ni ejecución.
2. **Hook de Ciclo de Vida de Usuario (`databaseHooks.user.create.before`)**:
   - Asignación determinista de 15 días de prueba gratuita (`trialEndsAt: Date.now() + 15 días`), 30 créditos de IA para inferencia de modelos de frontera y estado `'TRIAL'` de forma inmediata y automática cuando un nuevo usuario se registra vía Google OAuth o Email.
3. **UI/UX: Componente Accesible `AuthModal.tsx`, Ruta `/login` & Navegación Global**:
   - Creación de [src/features/dashboard/components/AuthModal.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/dashboard/components/AuthModal.tsx) con soporte dual Google OAuth One-Click y formulario de Email/Contraseña.
   - Creación de ruta pública dedicada [src/app/login/page.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/app/login/page.tsx) con metadata SEO y retorno inteligente.
   - Enlace directo "Ingresar" en el Navbar de escritorio ([src/app/page.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/app/page.tsx)) y en el drawer móvil táctil ([src/shared/ui/MobileNavDrawer.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/shared/ui/MobileNavDrawer.tsx)) con touch targets ergonómicos $\ge 44\text{px}$.
   - Integración del avatar de usuario autenticado y botón de cierre de sesión seguro en la barra de navegación del Dashboard ([UnifiedDashboardView.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/dashboard/components/UnifiedDashboardView.tsx)).
4. **Verificación de Calidad y Pruebas Unitarias (110 Tests Passing)**:
   - Nueva suite de pruebas unitarias: `tests/unit/oauth-multi-tenant.test.ts` (5 pruebas unitarias).
   - 100% de la suite de pruebas unitarias aprobada en Vitest (110 de 110 tests en 20 suites).
   - 0 errores en verificación estricta de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 27: Flujo de Inicio de Sesión Unificado, Navbar Global Reactivo y Protección Open Redirect (COMPLETADA)
1. **Unificación de la Experiencia de Autenticación & Detección de Sesión**:
   - Creación del componente transversal [GlobalNavbar.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/shared/ui/GlobalNavbar.tsx) en `@/shared/ui` que sustituye el header estático por una barra reactiva consciente del estado del usuario (`useSession`).
   - Cuando el usuario está autenticado, la barra muestra su avatar de Google, botón directo a *"Mi Panel"* (`/dashboard`), acción rápida *"Nuevo"* (`/start`) y botón ergonómico de desconexión.
   - Cuando el usuario es visitante, `"Ingresar"` levanta `AuthModal` con modo login o redirige a `/login?mode=login&callbackUrl=/dashboard`, y `"Prueba 15 Días"` activa el registro fluido con Google dirigiendo al onboarding (`/login?mode=signup&callbackUrl=/start`).
2. **Sincronización en Cascada de Navegación & Mobile Drawer (`MobileNavDrawer.tsx`)**:
   - Integración de sesión Better-Auth en el menú móvil: muestra avatar y perfil del usuario, acceso directo a `/dashboard` y logout rápido táctil ($\ge 44\text{px}$). Para visitantes, ofrece botones separados para inicio de sesión y registro de prueba.
   - Estandarización de botones de conversión en la Landing Page (`/`), sección de precios (`PricingSection.tsx`), Onboarding (`/start`) y Dashboard para redirigir contextualmente preservando el parámetro seguro de retorno `callbackUrl`.
3. **Guardrail de Seguridad Zod contra Open Redirect & Protección de `/dashboard`**:
   - Creación del contrato `AuthRedirectParamsSchema` y la función pura `sanitizeCallbackUrl` en `src/entities/auth/schemas.ts`.
   - Bloqueo estricto de redirecciones externas arbitrarias (`https://...`, `//evil.com`), garantizando que sólo se permitan rutas relativas internas validadas.
   - Protección perimetral en Server Component de [src/app/dashboard/page.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/app/dashboard/page.tsx): redirección inmediata y segura a `/login?callbackUrl=/dashboard` para cualquier visitante no autenticado, eliminando vistas de paneles privados vacíos o desprotegidos.
4. **Control de Calidad, Resiliencia y Pruebas Unitarias (116 Tests Passing)**:
   - Suite de pruebas unitarias: `tests/unit/auth-flow.test.ts` (6 pruebas unitarias, incluyendo protección y redirección de dashboard).
   - 100% de la suite de pruebas unitarias aprobada en Vitest (116 de 116 tests en 21 suites).
### ✅ Fase 28: Solución al Desbordamiento de Scroll, Navegación Sticky Glassmorphic y Ancla Superior (COMPLETADA)
1. **Diagnóstico y Eliminación del Conflicto de Desbordamiento (`src/app/page.tsx`)**:
   - Identificación de la causa raíz: la clase `overflow-hidden` aplicada sobre el contenedor flex principal de la landing page capturaba y recortaba el contexto de scroll vertical de la ventana al navegar mediante fragmentos hash (`#soluciones`, `#comparativa`, `#precios`, `#faq`).
   - Aislamiento arquitectónico: se extrajeron los elementos visuales perimetrales (luces volumétricas con `blur-[140px]`) dentro de un sub-contenedor dedicado `absolute inset-0 overflow-hidden pointer-events-none`. Esto previene el desbordamiento horizontal sin interferir con el scroll vertical de la ventana.
   - Creación del ancla superior `#inicio`: se añadió `<div id="inicio" className="absolute top-0 left-0 w-0 h-0 pointer-events-none opacity-0" aria-hidden="true" />` en la raíz del hero section para permitir el retorno instantáneo y accesible al tope de la página.
2. **Navegación Sticky Glassmorphic & Ergonomía de Retorno (`GlobalNavbar.tsx`)**:
   - Reconfiguración de la barra de navegación global como `sticky top-0 z-40 w-full backdrop-blur-xl bg-zinc-950/80 border-b border-white/5`. Permanece visible y accesible en cualquier punto del recorrido de la página.
   - El logotipo de la marca INDI enlaza directamente a `/#inicio`, permitiendo al usuario volver al punto de partida con un solo toque desde cualquier profundidad de lectura.
3. **Comportamiento de Scroll Suave y Respeto a Preferencias de Movimiento (`globals.css`)**:
   - Reglas globales `html { scroll-behavior: smooth; scroll-padding-top: 5rem; }` para asegurar que el contenido anclado no quede oculto detrás de la barra pegajosa.
   - Soporte de accesibilidad para reducción de movimiento: `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`.
4. **Control de Calidad y Pruebas Unitarias (116 Tests Passing)**:
   - 100% de la suite de pruebas unitarias aprobada en Vitest (116 de 116 tests en 21 suites).
   - 0 errores en verificación estricta de tipos TypeScript (`npm run typecheck`).


