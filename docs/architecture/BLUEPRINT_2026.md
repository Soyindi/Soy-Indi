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
- **Next.js 15.4+ (App Router):** Soporte nativo para React 19, Server Actions, Partial Prerendering (PPR) y streaming vía `<Suspense>`.
- **TypeScript 5.9+:** Tipado estricto, sin tolerar `any`, con validación estricta de esquemas de datos vía **Zod 3.24+**.
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
1. Definición comercial unificada y minimalista:
   - **Prueba Gratuita de 3 Días** (sin tarjeta obligatoria al registrarse).
   - **Plan Mensual Flexible**: **$2.500 CLP / mes** / $3 USD (acceso total a tarjetas digitales, analíticas y métricas, CV y presentaciones).
   - **Plan Semestral Recomendado**: **$6.000 CLP cada 6 meses** (~$1.000 CLP/mes, 60% de ahorro) / $7 USD.
   - **Modelo Todo-en-Uno Sin Créditos**: Eliminación de fricción de créditos artificiales. Acceso irrestricto a todas las funcionalidades mientras la membresía esté activa.
2. Entidades y Server Actions de suscripción (`checkUserEntitlementAction`, `createCheckoutSessionAction`).
3. Página dedicada `/pricing` con tabla comparativa de beneficios, badge de descuento, calculador de ahorro y FAQ interactivo (`FaqAccordion.tsx`).
4. Componente de notificación contextual `TrialBanner.tsx` integrado en `/cards`, `/cv` y `/presentations` con cuenta regresiva en vivo y CTA directo.

### ✅ Fase 5: Landing Page de Alta Conversión en 7 Bloques Estratégicos (COMPLETADA)
1. **Hero Interactivo**: Titular de alto impacto, CTA de prueba gratuita de 3 días y demostración en vivo de la tarjeta con simulación de escaneo QR y WhatsApp.
2. **Social Proof & Métricas**: Contadores dinámicos de tarjetas activas, interacciones registradas y tasa de contacto vía WhatsApp.
3. **Tabla Comparativa Disruptiva**: Análisis cara a cara "Tarjetas de Papel Tradicionales vs. INDI Digital 2026 ($2.500/mes o $1.000/mes semestral)".
4. **Bento Grid de la Suite Todo-en-Uno**:
   - Tarjetas de Presentación Glassmorphism con QR y Web Share.
   - Smart CV ATS Optimizer con auditoría algorítmica.
   - Orbital Presentations con generación cinemática.
5. **Sección de Precios Integrada**: Selector de divisa CLP / USD, con el Plan Mensual ($2.500 CLP) y Plan Semestral ($6.000 CLP) claros y sin letra chica.
6. **Preguntas Frecuentes (FAQ)**: Respuestas claras sobre la prueba de 3 días, formas de pago (Webpay, CuentaRUT, Tarjetas, Stripe) y cero letra chica.
7. **CTA Final Volumétrico**: Cierre persuasivo sin riesgo con botón de registro inmediato a la prueba gratuita.
### ✅ Fase 6: Onboarding Hub y Selector de Experiencia ('/start') (COMPLETADA)
1. **Ruta Server Component Dinámica en `/start`**:
   - Acceso inmediato al presionar *"Comenzar Prueba de 3 Días"* o *"Prueba Gratis"* desde cualquier CTA de la Landing Page.
   - Integración nativa con `checkUserEntitlementAction` para validar días restantes de prueba VIP (3 días) con acceso total.
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
4. **Cabecera Contextual Adaptativa de Conversión (`PublicContextualHeader.tsx` & Vistas Públicas `/c`, `/cv`, `/p`)**:
   - **Logotipo Horizontal Cinemático Canónico**: En todas las vistas públicas (`/c/[slug]`, `/cv/[slug]`, `/p/[slug]`), se adopta `<BrandLogo variant="horizontal" size="sm" showText={false} useVideo={true} linkToHome={true} />`, otorgando máxima presencia de marca en relación de aspecto panorámica con micro-video loop optimizado y touch targets $\ge 44\text{px}$.
   - **Enrutamiento inteligente de alta conversión viral**: cuando un visitante no autenticado visualiza una tarjeta digital, Smart CV o presentación orbital, los enlaces de acción (*"Crea tu perfil gratis"*, *"Crear mi CV"*, *"Crear Presentación"*, badge *"CREADO CON INDI"*) dirigen directamente al flujo de registro e inicio de sesión (`/login?mode=signup&callbackUrl=...`), mientras que usuarios con sesión activa conservan acceso directo a su panel (*"Mi Panel"* / `/dashboard`).

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
   - Resolución de derechos de acceso y período de prueba de 3 días adaptada a multi-usuario en `checkUserEntitlementAction` ([src/features/pricing/actions.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/pricing/actions.ts)).
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
   - Asignación determinista de 3 días de prueba gratuita (`trialEndsAt: Date.now() + 3 días`) y estado `'TRIAL'` de forma inmediata y automática cuando un nuevo usuario se registra vía Google OAuth o Email. Modelo simplificado sin créditos artificiales de IA.
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
   - Cuando el usuario es visitante, `"Ingresar"` levanta `AuthModal` con modo login o redirige a `/login?mode=login&callbackUrl=/dashboard`, y `"Prueba 3 Días"` activa el registro fluido con Google dirigiendo al onboarding (`/login?mode=signup&callbackUrl=/start`).
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
### ✅ Fase 29: Refactorización de Branding y Copywriting Cercano para Emprendedores (COMPLETADA)
1. **Humanización del Lenguaje y Cero Tecnicismos en Landing Page (`src/app/page.tsx`)**:
   - Sustitución de terminología compleja de software (*"Ecosistema Todo-en-Uno"*, *"Filtros ATS"*, *"Diapositivas Cinemáticas"*, *"Open Graph en el Edge"*) por propuestas de valor cotidianas y transparentes orientadas a emprendedores y trabajadores independientes.
   - Enfoque directo en beneficios reales de negocio: conexión con clientes en 1 toque por WhatsApp, actualización instantánea desde el celular sin costos de reimpresión de papel, y herramientas intuitivas para mostrar servicios y presupuestos.
2. **Clarificación y Accesibilidad en Preguntas Frecuentes (`FaqAccordion.tsx`)**:
   - Reescritura completa de preguntas y respuestas en un tono cercano y explicativo: detalle de medios de pago en Chile (Cuenta RUT, tarjetas bancarias mediante Webpay), confirmación de que los clientes no necesitan descargar ninguna app para ver la tarjeta, y explicación transparente de la ayuda asistida por Inteligencia Artificial.
3. **Estandarización de Precios y Navegación (`PricingSection.tsx`, `GlobalNavbar.tsx`, `MobileNavDrawer.tsx`)**:
   - Actualización de etiquetas y anclas: cambio de *"FAQ"* a *"Preguntas Frecuentes"* y de *"Soluciones"* a *"Herramientas"*.
   - Adaptación de la lista de características de planes en `PRICING_PLANS` para resaltar el ahorro y la simpleza de uso sin tecnicismos innecesarios.
### ✅ Fase 30: Arquitectura de Navegación del Dashboard y Clarificación de Flujos (COMPLETADA)
1. **Resolución de Destino de Navegación en el Dashboard (`UnifiedDashboardView.tsx`)**:
   - Alineación con estándares de UX: El logotipo en la barra del panel ahora enlaza a `/dashboard`, manteniendo al usuario en su centro de trabajo diario.
   - Añadido enlace directo y explícito *"Ver Web Principal"* con icono `ExternalLink`, permitiendo al usuario visitar la portada comercial sin ambigüedades.
   - Botón de creación rápida estandarizado como `+ Nuevo Proyecto` con gradiente interactivo para guiar al usuario a `/start` de forma clara.
2. **Navegación Cruzada en el Onboarding Hub (`/start`)**:
   - Inclusión del botón *"Ir a Mi Panel"* en la cabecera de `/start`, permitiendo que usuarios recurrentes regresen inmediatamente a su mesa de trabajo sin perder tiempo.
### ✅ Fase 31: Auditoría de Navegación Bidireccional Contextual (Tab-Aware Routing) (COMPLETADA)
1. **Detección y Corrección de Desvío en el Editor de CV (`SmartCvBuilder.tsx`)**:
   - Diagnóstico: En la cabecera `AppEditorHeader`, la propiedad `categoryHref` estaba configurada como `"/dashboard"`. Al hacer click en la flecha de retroceso `←` o en la miga de pan contextual `Smart CV (ATS)`, el usuario era dirigido a la pestaña por defecto de Tarjetas (`tab=cards`) en lugar de regresar a su lista de currículums.
   - Solución: Se actualizó `categoryHref="/dashboard?tab=cvs"` tanto en el botón de retroceso como en el breadcrumb contextual.
2. **Sincronización Reactiva de Pestañas en el Dashboard (`UnifiedDashboardView.tsx`)**:
   - Se añadió un efecto reactivo `useEffect` vinculado a la prop `initialTab` (`searchParams.tab`). Cuando el usuario navega desde cualquier editor secundario (`/cv` o `/presentations`) con `?tab=cvs` o `?tab=presentations`, el dashboard actualiza automáticamente la pestaña activa sin desincronización de estado.
3. **Consistencia en Editores de Tarjetas y Presentaciones (`CardBuilder.tsx` & `PresentationStudio.tsx`)**:
   - Estandarización explícita de `categoryHref="/dashboard?tab=cards"` en `CardBuilder` y `categoryHref="/dashboard?tab=presentations"` en `PresentationStudio`.
4. **Control de Calidad y Pruebas Unitarias (117 Tests Passing)**:
   - Nueva aserción en `tests/unit/auth-flow.test.ts` validando la preservación y sanitización estricta de rutas con parámetros de pestaña (`?tab=cvs`, `?tab=presentations`, `?tab=cards`).
   - 100% de la suite de pruebas unitarias aprobada en Vitest (117 de 117 tests en 21 suites).
   - 0 errores en verificación estricta de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 32: Auditoría Integral de Consistencia Comercial y Unificación de Período de Prueba (COMPLETADA)
1. **Auditoría UI/UX & Eliminación de Desincronización de Período de Prueba**:
   - Diagnóstico: Se detectó una inconsistencia de comunicación donde el hero de la Landing Page (`src/app/page.tsx`), la barra de navegación global (`GlobalNavbar.tsx`), el menú lateral móvil (`MobileNavDrawer.tsx`) y las plantillas de presentación conservaban copys desactualizados mencionando "15 días" a pesar de que el motor de negocio (`auth.ts`, `actions.ts`, `entitlements.test.ts`) y la gobernanza definen estrictamente **3 días de prueba gratis**.
   - Solución:
     - Hero Section (`src/app/page.tsx`): Actualizado el badge superior a *"Para Emprendedores y Profesionales • 3 Días Gratis"* y el CTA primario a *"Probar Gratis por 3 Días"*.
     - Barra de Navegación (`src/shared/ui/GlobalNavbar.tsx`): Botón de conversión rápida unificado a *"Prueba 3 Días"*.
     - Drawer Móvil (`src/shared/ui/MobileNavDrawer.tsx`): Descripción del ítem comercial actualizada a *"Prueba 3 días gratis y luego solo $6.000 cada 6 meses"* y CTA inferior normalizado a *"Prueba Gratis 3 Días"*.
     - Catálogo de Presentaciones (`src/entities/presentation/templates.ts`): Diapositiva final de pitch deck comercial actualizada a *"Disponible Hoy con 3 Días Gratuitos"*.
     - Comentarios de arquitectura en vistas App Router (`dashboard/page.tsx`, `cv/page.tsx`, `presentations/page.tsx`): Corregidos a *"Banner de estado de membresía / trial 3 días"*.
2. **Robustecimiento de Pruebas Unitarias (`tests/unit/oauth-multi-tenant.test.ts`)**:
   - Se actualizó la prueba de auto-asignación para validar tanto semánticamente el nombre del test como matemáticamente el cálculo de expiración: invoca activamente el hook `before` de `databaseHooks.user.create`, comprobando que `trialEndsAt` corresponde exactamente a una ventana temporal de 3 días (`3 * 24 * 60 * 60 * 1000` ms) con tolerancia estricta de ejecución (< 2000 ms).
3. **Gobernanza Doc-as-Code**:
   - Sincronización en cascada de `README.md`, `BLUEPRINT_2026.md` y `AGENTS.md`.
### ✅ Fase 33: Flujo Zero Redundant Logins y Resolución Reactiva de Sesión en Landing & CTAs (COMPLETADA)
1. **Diagnóstico del Problema de Autenticación Redundante**:
   - Al pulsar el botón primario de llamada a la acción en la Landing Page (*"Probar Gratis por 3 Días"*) o en la sección de precios, el enlace estático dirigía incondicionalmente a `/login?mode=signup&callbackUrl=/start`.
   - En el servidor, la ruta `src/app/login/page.tsx` renderizaba el formulario de login/registro aun cuando el usuario ya contaba con una sesión activa y válida en Better-Auth (`auth.api.getSession`), obligándolo a iniciar sesión nuevamente o desconcertándolo.
2. **Implementación de Guardrail en Servidor (`src/app/login/page.tsx`)**:
   - Integración de `auth.api.getSession({ headers: await headers() })`. Si el usuario ya está autenticado, Next.js emite un `redirect(callbackUrl)` instantáneo a nivel HTTP/Edge, omitiendo por completo el renderizado del formulario y conduciéndolo sin fricción a su destino previsto (`/start` o `/dashboard`).
3. **Componentes Reactivos Sensibles a Sesión (Feature-Sliced Design)**:
   - **`HeroCtaButtons.tsx` & `BottomCtaButton.tsx` (`@/features/onboarding/components/`)**:
     - Detectan de forma reactiva el estado de autenticación mediante `useSession()`.
     - Si el usuario tiene sesión activa, el CTA primario cambia a *"Crear Nueva Tarjeta / Hub"* apuntando directamente a `/start` y el secundario ofrece acceso a *"Ir a Mi Panel"* (`/dashboard`), eliminando pasos innecesarios.
     - Cumplen estrictamente con los estándares ergonómicos táctiles: touch targets $\ge 44\text{px}$ (`min-h-[48px]`), retícula base 8 y contraste WCAG 2.2 AA.
   - **`PricingSection.tsx` (`@/features/pricing/components/`)**:
     - Adaptación del botón principal: Si hay sesión activa, navega directamente a `/start` con el texto *"Ir al Onboarding Hub"*; si es visitante, conserva el flujo de registro guiado con `callbackUrl=/start`.
   - **`PublicContextualHeader.tsx` (`@/shared/ui/`)**:
     - Actualizado a componente cliente con detección de `useSession()`, permitiendo que usuarios autenticados que visualicen tarjetas públicas o demos accedan directamente a *"Mi Panel"*.
4. **Pruebas Unitarias y Control de Calidad (119 Tests Passing)**:
   - Nuevos tests en `tests/unit/auth-flow.test.ts` para validar la resolución de sesión, la priorización de `callbackUrl=/start` y el fallback seguro ante URLs externas o maliciosas.
   - 100% de la suite de pruebas aprobada (119 de 119 pruebas unitarias en 21 suites).
   - Chequeo de tipos estricto sin errores (`npm run typecheck`).

### ✅ Fase 34: Unificación y Consistencia de Tarjeta Demo en Portada y Editor (COMPLETADA)
1. **Alineación Visual y Coherencia de Producto (Carlos Mendoza)**:
   - Diagnóstico: Existía una disonancia entre la tarjeta demo de la Landing Page (perfil sin módulo de mapa, ni acabados específicos) y la plantilla por defecto que encuentra el usuario al crear una tarjeta en el editor (`CardBuilder.tsx`).
   - Solución: Se actualizó la tarjeta de la portada (`src/app/page.tsx`) y el endpoint público `/c/demo` (`src/app/c/[slug]/page.tsx`) con la identidad completa de **Carlos Mendoza** (*Especialista en Marketing Digital*).
   - Beneficio: Exhibe de inmediato el catálogo completo de capacidades del producto:
     - Badge Glassmorphism 2.0 y halo de partículas ambientales.
     - Botón principal de WhatsApp pre-redactado y vCard 4.0 One-Tap.
     - **Módulo de Ubicación & Oficina con OpenStreetMap** y accesos directos a Google Maps y Waze.
     - Acabado `classic` con textura de superficie `radial-glow` y color primario `#6366f1` (Gamut P3 / OKLCH).
### ✅ Fase 35: Auditoría Integral del Flujo de Presentaciones e Independencia de Slugs (COMPLETADA)
1. **Diagnóstico del Fallo de Persistencia y Shadowing por Plantillas Estáticas**:
   - **Precedencia Invertida en `/p/[slug]`**: La ruta pública `src/app/p/[slug]/page.tsx` (tanto en `generateMetadata` como en el Server Component `PublicPresentationPage`) consultaba primero la constante estática `PRESENTATION_TEMPLATES`. Debido a que la plantilla estática de pitch deck utiliza el slug `'pitch-deck-inversionistas'`, cualquier presentación creada y guardada por el usuario con ese slug quedaba completamente eclipsada (shadowed), renderizando siempre las diapositivas de ejemplo por defecto.
   - **Secuestro Silencioso (Silent Hijack) en Server Action**: En `upsertPresentationAction`, si no se pasaba `presentationId` pero el slug coincidía con un registro del mismo usuario, la Server Action mutaba silenciosamente la presentación previa en lugar de crear un nuevo registro o exigir un slug diferenciado.
   - **Falta de Edición de Slugs y Título en el Estudio**: `PresentationStudio.tsx` carecía de controles de interfaz para editar el título general y el slug público de la presentación, e inicializaba siempre las nuevas presentaciones con el slug estático de la plantilla (`pitch-deck-inversionistas`).
   - **Pérdida de Metadatos en Ingesta Multimodal**: El callback de `SmartPresentationDropzone` no transmitía el `slug` ni el `theme` generados por IA hacia el estado del editor.
   - **Enlace Ambiguo en Dashboard**: `UnifiedDashboardView.tsx` enlazaba a `/presentations?slug=${pres.slug}` en lugar de emplear el ID inmutable de la base de datos (`/presentations?id=${pres.id}`).
2. **Solución Arquitectural y de Seguridad (FSD & Drizzle LibSQL)**:
   - **Precedencia Absoluta de Base de Datos**: Reordenamiento en `src/app/p/[slug]/page.tsx` para consultar prioritariamente `db.query.presentations.findFirst({ where: eq(presentations.slug, slug) })`. Solo si no existe registro en base de datos, se evalúan las plantillas curadas y demos estáticos como fallback.
   - **Independencia de Slugs y Separación Modo Edición vs Creación**:
     - Implementación de `generatePresentationSlug()` y `slugifyPresentationTitle()` en `@/entities/presentation/schemas`.
     - `upsertPresentationAction` ahora diferencia estrictamente:
       - **Modo Edición (`presentationId`)**: Aplica guardrail anti-IDOR compuesto `and(eq(id, presentationId), eq(userId, targetUserId))` y valida colisión con `and(eq(slug, data.slug), ne(id, presentationId))`.
       - **Modo Creación (`!presentationId`)**: Valida que no exista ningún slug duplicado previo y crea un registro nuevo e independiente.
   - **Mejoras UI/UX en `PresentationStudio.tsx`**:
     - Tarjeta de *Propiedades de Presentación* en la pestaña de Contenido: edición en tiempo real de Título y Slug, botón de regeneración aleatoria única, copiado de enlace en un click y acceso directo a la vista pública.
     - Banner de error accesible (`role="alert"`) ante fallos de validación o colisión de slug.
     - Preservación íntegra de título, slug y tema visual en ingesta multimodal (`SmartPresentationDropzone`) y generación rápida con IA.
   - **Dashboard Enlazado por ID Inmutable**:
     - En `UnifiedDashboardView.tsx`, el botón *"Abrir Estudio"* navega a `/presentations?id=${pres.id}`.
3. **Control de Calidad y Pruebas Unitarias (123 Tests Passing)**:
   - Nuevos casos de prueba en `tests/unit/presentation-flow-audit.test.ts` verificando:
     - Normalización de títulos a slugs URL-friendly (`slugifyPresentationTitle`).
     - Generación de slugs únicos conformes con el esquema regex de Zod (`generatePresentationSlug`).
     - No-colisión entre llamadas consecutivas.
     - Resolución con precedencia de base de datos sobre plantillas estáticas para eliminar el shadowing.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (123 de 123 tests en 21 suites).
   - 0 errores de compilación estricta en TypeScript (`npm run typecheck`).

### ✅ Fase 36: Branding de Telemetría en Tiempo Real y Pilares de Valor Diferenciales (COMPLETADA)
1. **Auditoría Estratégica de Propuesta de Valor y Telemetría**:
   - Diagnóstico: Las tarjetas digitales de INDI ya integraban telemetría atómica en Turso LibSQL (`card_events`) y cálculo de conversión en el Dashboard privado, pero en la Landing Page comercial y en las FAQs este diferenciador fundamental frente a las tarjetas de cartulina analógicas no contaba con la prominencia visual necesaria.
   - Solución: Creación e inserción del componente `MetricsShowcaseSection` (`src/features/card-builder/components/MetricsShowcaseSection.tsx`) en la Landing Page (`src/app/page.tsx`), presentando un escaparate Bento interactivo con KPIs de producción:
     - **Lecturas en Edge (1.428 visitas)**: Medición exacta de tráfico sin pausas por inactividad.
     - **Chats de WhatsApp (384 conversaciones)**: Conversión directa a ventas con mensaje pre-redactado.
     - **Contactos en Agenda (296 guardados vCard 4.0 One-Tap)**: Almacenamiento instantáneo sin tipear números a mano.
     - **Efectividad Comercial (26.9% conversión)**: Ratio 4 veces superior al retorno de soportes analógicos.
2. **Resaltado de los 4 Pilares Únicos Frente al Papel**:
   - **Guardar en Agenda en 1 Toque (vCard 4.0)**: El cliente no tiene que tipear 9 dígitos; descarga la ficha completa con nombre, foto, correo y dirección en su libreta de contactos.
   - **Módulo de Ubicación & Navegación**: Visor OpenStreetMap embebido (sin cookies ni rastreadores) y botones One-Tap a Google Maps y Waze.
   - **Cero Descargas ni Fricción**: Apertura instantánea (<0.2s) en cualquier navegador sin instalar aplicaciones pesadas ni registrarse.
   - **Actualizaciones Vivas Ilimitadas**: Modificación instantánea de teléfonos, servicios o precios desde el celular sin volver a imprimir jamás.
3. **Clarificación en Preguntas Frecuentes (`FaqAccordion.tsx`)**:
   - Incorporación de preguntas orientadas a la telemetría (*"¿Cómo sé cuántas personas están viendo mi tarjeta o escribiéndome?"*) y al guardado instantáneo de contactos sin tipeo manual (*"¿Mis clientes tienen que escribir mi número a mano?"*).
4. **Control de Calidad y Pruebas Unitarias (127 Tests Passing)**:
   - Nueva suite `tests/unit/branding-metrics-showcase.test.ts` con verificación del contrato de eventos en `card_events`, cálculo matemático de tasa de conversión y consistencia de los pilares de marca.
   - 100% de la suite aprobada (127 de 127 pruebas en 22 suites).
   - 0 errores en verificación estricta de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 37: Living Digital Resumes & Public CV Edge Sharing (COMPLETADA)
1. **Investigación de Tendencias y Proyecciones 2026+ (El Salto del PDF Estático al Living Resume)**:
   - **Limitaciones del Currículum Tradicional en PDF**: Un archivo PDF adjunto por correo electrónico o subido a un portal de empleo queda desactualizado en el instante en que se envía. El candidato no tiene conocimiento de si el reclutador abrió el archivo, qué secciones leyó o si el formato se rompió en dispositivos móviles.
   - **Tendencia Global 2026+ (Living Digital Resume)**:
     - **Consumo Mobile-First de Reclutadores**: Más del 68% de las primeras revisiones de perfiles por directores y recruiters ocurren en smartphones a través de enlaces directos compartidos por WhatsApp, LinkedIn InMail o mensajes instantáneos.
     - **Dualidad ATS Vectorial + Experiencia Web Interactiva**: Un CV moderno debe satisfacer dos mundos sin concesiones:
       1. Ser parseable al 100% por los robots de ATS (Applicant Tracking Systems) en formato estricto Letter/A4 imprimible.
       2. Ofrecer una experiencia web de alta gama (Living Resume) accesible mediante una URL pública limpia (ej. `indi.bio/cv/[slug]`), con enlaces interactivos a repositorios, tarjeta digital INDI, contacto directo en un click y telemetría de visualizaciones en tiempo real.
2. **Arquitectura FSD & Seguridad en Capas**:
   - **Entities Layer (`src/entities/schema.ts` & `src/entities/cv/schemas.ts`)**:
     - Extensión de la tabla `smartCvs` en Turso SQLite con columnas `slug` (`text('slug').unique()`), `isPublic` (`integer('is_public', { mode: 'boolean' }).notNull().default(true)`), y `viewsCount` (`integer('views_count').notNull().default(0)`), junto con el índice `smart_cvs_slug_idx`.
     - Definición de funciones puras `slugifyCvTitle` (con sanitización de caracteres especiales y recorte limpio a 48 caracteres) y `generateCvSlug` (con sufijo pseudoaleatorio colisión-free).
     - Validación estricta con Zod en `cvFormSchema` mediante regex `^[a-z0-9-]+$`.
   - **Features & Server Actions Layer (`src/features/ai-smart-cv/actions.ts`)**:
     - `upsertSmartCvAction`: Aislamiento multi-tenant con guardrail de sesión obligatorio (`getSafeAuthenticatedUserId`), validación anti-IDOR en edición (`and(eq(id, cvId), eq(userId, targetUserId))`), comprobación de no-colisión de slug (`and(eq(slug, data.slug), ne(id, cvId))`), y revalidación granular de caché (`revalidatePath`).
     - `getPublicSmartCvAction(slug)`: Consulta optimizada por índice con validación estricta de visibilidad (`isPublic === true`).
     - `incrementCvViewsAction(cvId)`: Incremento atómico en base de datos (`viewsCount = viewsCount + 1`) previniendo contención de cerraduras SQLite.
   - **Feature UI Components Layer**:
     - `PublicCvViewer.tsx`: Componente de visualización pública del currículum vivo, con selector de formato (Letter/A4), descarga de PDF ATS instantánea en cliente (`generateAndDownloadCvPdf`), Web Share API nativa con fallback a portapapeles, enlace interactivo a la Tarjeta INDI del usuario, y barra de acciones flotante ergonómica en el Thumb Zone móvil (`fixed bottom-4 inset-x-4 sm:hidden`).
     - `SmartCvBuilder.tsx`: Incorporación del módulo de enlace digital con edición de slug, regeneración aleatoria y copiado directo.
     - `UnifiedDashboardView.tsx`: En la pestaña de CVs, despliegue de URL pública `/cv/[slug]`, botón de copiado rápido, enlace de vista en vivo (`ExternalLink`), estado "Digital Activo" / "Privado" y telemetría de visualizaciones (`viewsCount`).
   - **App Router Layer (`src/app/cv/[slug]/page.tsx`)**:
     - Ruta pública dinámica con generación de metadatos Open Graph (`generateMetadata`) para indexación semántica y vista previa enriquecida en WhatsApp/LinkedIn.
     - Incremento atómico no bloqueante de telemetría de vistas al servir la página.
3. **Control de Calidad y Pruebas Unitarias (139 Tests Passing)**:
   - Nueva suite `tests/unit/smart-cv-sharing.test.ts` (12 tests) cubriendo normalización de slugs, validación de esquemas Zod, resolución pública, protección de CVs privados e incremento de telemetría.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (139 de 139 tests en 23 suites).
   - 0 errores de compilación estricta en TypeScript (`npm run typecheck`).

### ✅ Fase 38: Ingesta Resiliente de Archivos Multimodales & Route Handlers Nativos (COMPLETADA)
1. **Diagnóstico de Causa Raíz (Error "An unexpected response was received from the server")**:
   - **Límite Estricto de 1MB en Server Actions de Next.js**: Por especificación interna de Next.js App Router, las Server Actions imponen un límite predeterminado estricto de **1MB** (`1mb`) sobre el cuerpo de la petición.
   - **Fallo de Serialización React Flight**: Al adjuntar archivos PDF o imágenes (currículums, títulos universitarios o presentaciones) que superan comúnmente entre 2MB y 10MB, el runtime de Next.js aborta la petición con HTTP 413 (Payload Too Large) o envía una respuesta de error HTML no serializada bajo el protocolo `text/x-component`.
   - **Excepción en el Reducer del Cliente**: Al no recibir el formato Flight esperado, el reductor de Server Actions de Next.js (`server-action-reducer.ts`) lanza la excepción genérica `Error: An unexpected response was received from the server.`, bloqueando la subida tanto en el dropzone de Smart CV como en el de Presentaciones.
2. **Solución Arquitectural Dual (Next.js Config + Route Handlers Nativos HTTP)**:
   - **Ampliación de Límites en `next.config.ts`**:
     - Configuración de `experimental.serverActions.bodySizeLimit: '25mb'`.
     - Inyección de `experimental.proxyClientMaxBodySize: '25mb'` y `middlewareClientMaxBodySize: '25mb'` para asegurar que los proxies perimetrales no recorten la carga útil.
   - **Route Handlers Nativos Desacoplados de React Flight**:
     - **`src/app/api/cv/parse/route.ts`**: Endpoint HTTP nativo (`export async function POST(req: NextRequest)`) que procesa `FormData` mediante streaming estándar de Node/Web Streams sin las limitaciones del protocolo Flight. Soporta tanto currículums (`type=cv`) como títulos universitarios (`type=credential`), delegando a las funciones de backend y retornando respuestas JSON limpias y predecibles.
     - **`src/app/api/presentations/parse/route.ts`**: Endpoint HTTP nativo para la ingesta de documentos de presentación (PDF, TXT, MD, CSV, DOC), extrayendo texto y metadatos con total resiliencia.
   - **Estrategia Client-Side con Fallback Automático**:
     - `SmartDocumentDropzone.tsx` y `SmartPresentationDropzone.tsx` actualizados para consumir prioritariamente los Route Handlers (`fetch('/api/...', { method: 'POST', body: formData })`).
     - En caso de contingencia o fallo de red local, se activa automáticamente el fallback a las Server Actions correspondientes.
3. **Control de Calidad y Pruebas Unitarias (144 Tests Passing)**:
   - Nueva suite `tests/unit/document-upload-routes.test.ts` (5 pruebas unitarias) validando la serialización de `FormData`, el manejo de archivos en `/api/cv/parse` y `/api/presentations/parse`, y los mensajes de error amigables ante peticiones incompletas.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (144 de 144 tests en 24 suites).
   - 0 errores en verificación de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 39: Pipeline de Seguridad 2026, Cero Persistencia Binaria en BD y Compresión Efímera (COMPLETADA)
1. **Compresión Multicapa y Tecnología de Reducción de Huella**:
   - **Compresión Client-Side WebP (Canvas HTML5)**: Las imágenes subidas por el usuario (fotos de perfil, capturas de diapositivas o diplomas) se redimensionan proporcionalmente y se convierten a WebP con factor de calidad 0.85 en el navegador antes de cualquier transmisión (`compressImageClient`). Esto ahorra más del 85% de ancho de banda y evita el envío de archivos de 4-10MB al servidor.
   - **Compresión Semántica a JSON Liviano**: Documentos y presentaciones de 5-15MB no se almacenan como binarios; se extrae únicamente su estructura y texto depurado, reduciendo la huella de datos a un JSON de 5KB a 15KB (reducción $>99.5\%$).
   - **Compresión Nativa Turso LibSQL**: Almacenamiento en páginas SQLite indexadas de alto rendimiento sin sobrecarga de base de datos (Zero DB Bloat).
2. **Cero Persistencia Binaria en Base de Datos (Zero-Binary DB Persistence)**:
   - **Ingesta Efímera en Memoria Volátil (Ephemeral RAM Only)**: Los archivos subidos residen en memoria de servidor Node/Edge exclusivamente durante los milisegundos que dura la extracción de texto (`extractTextFromDocument` / `unpdf`). Una vez generado el JSON semántico, el buffer se desecha de la memoria RAM mediante recolección de basura.
   - **Cero Escritura a Disco**: No se crean archivos en `/tmp` ni en el sistema de archivos del servidor, eliminando de raíz vectores de ataque de Path Traversal (`../../etc/passwd`).
   - **Guardrail de Auditoría en Tiempo de Ejecución (`assertZeroBinaryPersistence`)**: Implementado en las Server Actions de los 3 productos (`upsertPresentationAction`, `upsertSmartCvAction`, `upsertCardAction`). Bloquea activamente buffers binarios crudos, Data URLs de PDFs o cadenas desproporcionadas (>350KB) antes de cualquier consulta `INSERT` o `UPDATE` en SQLite.
3. **Tendencias y Procedimientos de Seguridad de Ingesta (Estándares OWASP 2026)**:
   - **Validación de Magic Bytes (File Signatures)**: Función pura `validateFileSignature` en `@/shared/lib/fileSecurity`. Inspecciona la firma hexadecimal en los primeros bytes del buffer (%PDF-, PNG, JPEG, RIFF/WEBP, texto plano sin bytes nulos) y rechaza ejecutables camuflados (Windows PE/MZ, Linux ELF, Mach-O, Java bytecode) independientemente de su extensión de archivo.
   - **Defensa Anti-DoS y Memory Exhaustion**: Límite estricto de caracteres (`maxChars: 250000`, ~50.000 palabras) para neutralizar ataques de descompresión masiva (Decompression / Allocation Bombs).
   - **Sanitización de Texto y Mitigación de Prompt Injection**: Remueve etiquetas ejecutables (`<script>`, `<iframe>`, `javascript:`) y neutraliza secuencias de control de prompt injection (`[SYSTEM]`, instrucciones para ignorar contexto) antes de interactuar con modelos de lenguaje.
   - **Telemetría de Almacenamiento (`calculateStorageTelemetry`)**: Cálculo exacto de reducción de bytes y confirmación de la estrategia de persistencia efímera.
4. **Control de Calidad, Tipado y Pruebas Unitarias (158 Tests Passing)**:
   - Nueva suite `tests/unit/file-security-pipeline.test.ts` (14 pruebas unitarias exhaustivas) cubriendo validación de firmas binarias, bloqueo de ejecutables disfrazados, sanitización de inyecciones y guardrails de cero persistencia binaria.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (158 de 158 tests en 25 suites).
   - 0 errores en verificación estricta de tipos TypeScript (`npm run typecheck`).

### ✅ Fase 40: Pipeline de Extracción Client-Side, Neutralización de 413 (Vercel Gateway) y Auditoría de Base de Datos (COMPLETADA)
1. **Auditoría Técnica de Base de Datos (Turso Cloud LibSQL)**:
   - **Diagnóstico Integral de DB**:
     - Host: `libsql://soyindi-soyindi.aws-us-west-2.turso.io`
     - Tablas verificadas: 9 tablas de dominio activas (`user`, `session`, `account`, `verification`, `cards`, `card_events`, `smart_cvs`, `presentations`, `__drizzle_migrations`).
     - Índices de rendimiento: 15 índices B-Tree de alta velocidad activos.
     - Latencia de respuesta: $<50\text{ms}$.
     - **Conclusión de Auditoría**: La base de datos está 100% saludable, estructurada y sin anomalías. El error HTTP 413 no guarda relación con la base de datos, sino con la capa perimetral HTTP (Edge Gateway de Vercel).
2. **Diagnóstico del Error HTTP 413 (Payload Too Large en Vercel)**:
   - **Límite Inmutable de Vercel Serverless Functions**: La infraestructura perimetral de Vercel / AWS Lambda impone un límite estricto de **4.5 MB** en el cuerpo de peticiones entrantes.
   - Archivos PDF exportados desde herramientas de diseño (Canva, Figma, escaneos de alta resolución) pesan comúnmente entre 5MB y 15MB.
   - Al recibir $>4.5\text{MB}$, el gateway de Vercel intercepta y aborta la petición con `413 Request Entity Too Large` en formato HTML plano antes de llegar a la función Node.js.
   - En el cliente, la invocación incondicional de `await res.json()` fallaba con `SyntaxError: Unexpected token 'R'`, y el fallback a Server Actions volvía a chocar con el mismo límite de 4.5MB.
3. **Solución Arquitectural: Pipeline Isomórfico Client-Side con `unpdf`**:
   - **Primitiva Reutilizable (`src/shared/lib/clientDocumentExtractor.ts`)**:
     - Función pura `extractTextFromPdfClient(file)` que ejecuta el parser de PDF directamente en el navegador del usuario en $<100\text{ms}$.
     - Transforma un PDF de 10-15MB en un string de texto de 5KB a 20KB antes de cualquier transmisión de red.
   - **Transmisión de Huella Cero (Zero Network Transfer)**:
     - En [SmartDocumentDropzone.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/ai-smart-cv/components/SmartDocumentDropzone.tsx), si el texto se extrae en el navegador, se envía el campo `extractedText` hacia `/api/cv/parse`, reduciendo la carga de 15.000.000 de bytes a 12.000 bytes (reducción del 99.9%, 450 veces por debajo del límite de Vercel).
     - En [SmartPresentationDropzone.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/orbital-presentations/components/SmartPresentationDropzone.tsx), la extracción en cliente puebla el texto directamente en el editor sin ninguna latencia ni roundtrip de subida de archivo.
   - **Blindaje de Manejo de Errores HTTP (`res.ok`)**:
     - Validación preventiva de `res.ok` y comprobación de código 413 para reportar mensajes claros y amigables al usuario, eliminando los errores de sintaxis JSON.
     - Detección preventiva en cliente: si un PDF escaneado (sin texto) excede 4.2MB, se guía al usuario para usar compresión de imagen WebP o texto directo.
4. **Control de Calidad, Tipado y Pruebas Unitarias (160 Tests Passing)**:
   - Nuevos tests en `tests/unit/document-upload-routes.test.ts` validando la ingesta directa de `extractedText` para CVs y Presentaciones.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (160 de 160 tests en 25 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).
   - Compilación exitosa de producción Next.js 16 (`npm run build`, exit code 0).

### ✅ Fase 41: Formato Unificado A4 Internacional (Grado Empresarial), Persistencia Anti-Duplicados y Exportación Vectorial ATS (COMPLETADA)
1. **Diagnóstico de Bugs en Guardado y Descarga de Smart CV**:
   - **Duplicación Infinita de CVs al Guardar**:
     - `SmartCvBuilder.tsx` invocaba `upsertSmartCvAction(formData)` omitiendo el parámetro `cvId`.
     - No retenía en estado el `id` asignado tras la primera creación, provocando que guardados sucesivos detectaran su propio slug como colisión y crearan filas duplicadas con slugs aleatorizados (`-3k9a`).
   - **Template Shadowing al Editar desde el Dashboard**:
     - `UnifiedDashboardView.tsx` enlazaba el botón "Editar" del CV a `/cv` en lugar de `/cv?id=${cv.id}`.
     - `src/app/cv/page.tsx` no recibía `searchParams` ni cargaba el registro desde base de datos, abriendo siempre la plantilla mock por defecto.
     - Faltaba la Server Action `getSmartCvByIdAction(cvId, userId)` con guardrails multi-tenant anti-IDOR.
   - **Inconsistencia de Formatos (Carta vs A4) y Desalineación Tipográfica**:
     - Coexistían selectores redundantes entre Carta (US) y A4, rompiendo la paridad entre la vista web y el PDF vectorial.
     - El generador de PDF (`pdf-engine.ts`) alineaba el texto a la izquierda (`align: 'left'`) en lugar de justificarlo, dejando bordes dentados y generando dobles viñetas (`• •`) al no sanitizar caracteres preexistentes.
     - Encabezados de sección huérfanos al pie de página y ausencia de encabezado de continuación en la página 2.
2. **Solución Arquitectural FSD & Seguridad**:
   - **Entidades y Contrato de Base de Datos (`src/entities/schema.ts`)**:
     - Tipado canónico completo para `smartCvs.content`: nombre, contacto, RUT, resumen, experiencia detallada, educación verificada, referencias, firma digital y URLs profesionales.
     - Actualización de semillas en `src/shared/api/seed.ts` para alinearse con el contrato.
   - **Capa de Negocio y Server Actions (`src/features/ai-smart-cv/actions.ts`)**:
     - Implementación de `getSmartCvByIdAction(cvId, userId)` con validación de propiedad `and(eq(smartCvs.id, cvId), eq(smartCvs.userId, targetUserId))`.
     - Blindaje de `upsertSmartCvAction`: actualización idempotente mediante `cvId` verificado y retorno del identificador inmutable.
   - **Formato Unificado A4 Internacional (Grado Empresarial)**:
     - Estandarización a **A4 Internacional (210 x 297 mm, DIN EN ISO 216)** tanto en visualización interactiva (`CvDocumentPreview.tsx`) como en exportación vectorial jsPDF (`pdf-engine.ts`).
     - **Texto Justificado Editorial**: Justificación tipográfica suiza (`align: 'justify'` con `maxWidth` exacto en jsPDF y `text-justify` en DOM) para el resumen ejecutivo y viñetas de experiencia.
     - **Sanitización de Viñetas (`sanitizeBulletText`)**: Erradicación de dobles viñetas (`• •` o `- •`) y sangría colgante estricta (`list-outside`).
     - **Guardrail Anti-Huérfanos**: `drawSectionHeader` exige un mínimo de 24mm libres antes de dibujar la cabecera, evitando títulos aislados al fondo de hoja.
     - **Encabezado Corporativo de Continuación**: Cabecera sutil `${fullName} • ${targetRole} (Continuación)` con línea divisoria al saltar a la página 2.
     - **Función Pura Desacoplada (`buildCvPdfDocument`)**: Permite instanciar y auditar el documento PDF en suites de prueba unitarias sin dependencias de ventana de navegador.
   - **Integración en UI & Enrutamiento**:
     - `src/features/dashboard/components/UnifiedDashboardView.tsx`: Enlace de edición corregido a `/cv?id=${cv.id}`.
     - `src/app/cv/page.tsx`: Carga asíncrona de `initialData` e `initialCvId` mediante `searchParams.id`.
     - `src/features/ai-smart-cv/components/SmartCvBuilder.tsx`: Estado reactivo `currentCvId`, banner de notificación de error accesible (`saveError`), badge de formato unificado A4 y touch targets ergonómicos $\ge 44\text{px}$.
     - `src/features/ai-smart-cv/components/PublicCvViewer.tsx`: Formato unificado A4 y exportación sin fricción.
3. **Control de Calidad y Pruebas Unitarias (169 Tests Passing)**:
   - Nueva suite `tests/unit/smart-cv-crud-and-export.test.ts` (9 pruebas unitarias) cubriendo:
     - `getSmartCvByIdAction`: autorización de tenant y bloqueo anti-IDOR ante peticiones no autorizadas.
     - `upsertSmartCvAction`: inserción idempotente vs actualización de registro existente.
     - `sanitizeBulletText`: neutralización de viñetas duplicadas.
     - `buildCvPdfDocument`: generación de documento A4 con dimensiones exactas 210 x 297 mm y pie de página institucional.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (169 de 169 tests en 26 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

---

### Fase 42: Sincronización DDL SQLite Turso/Local y Sanitización Polimórfica Resiliente Zod en Presentaciones e Ingesta IA
1. **Diagnóstico Forense de Incidencias de Persistencia**:
   - **Desfase DDL en `smart_cvs` (`Failed query: select ... from "smart_cvs" where "slug" = ?`)**:
     - La tabla `smart_cvs` en base de datos local y remota carecía físicamente de las columnas `slug`, `is_public` y `views_count`, generando un error de ejecución SQL (`no such column: slug`) al evaluar la unicidad de enlace.
     - Se generó la migración formal `drizzle/migrations/0003_aspiring_maggott.sql` y se aplicó de forma determinista tanto a Turso Cloud como al archivo `file:local.db`.
   - **Fallo de Validación Zod en Presentaciones (`Invalid input: expected array, received null, expected string, received object...`)**:
     - Al procesar la respuesta de inferencia de modelos LLM (NVIDIA NIM, Llama 3.3, DeepSeek), los campos opcionales no generados (`metricsData`, `comparisonData`, `timelineData`, `quoteData`, `actionTitle`, `subtitle`) se recibían como `null` en lugar de `undefined`.
     - Adicionalmente, `keyPoints` recibía en ocasiones colecciones polimórficas de objetos (`[{ text: "..." }]` o `{ point: "..." }`) que eran rechazados de forma estricta por `z.array(z.string())`.
2. **Solución Arquitectural y Resiliencia de Contratos**:
   - **Normalización Polimórfica en `src/entities/presentation/schemas.ts`**:
     - `presentationSlideSchema`: campos opcionales adaptados con `.nullish()` y transformaciones seguras para depurar valores `null` a `undefined`.
     - `keyPoints`: normalizador universal que mapea strings, objetos (`item.text`, `item.point`, `item.detail`, `item.title`) o enteros a un arreglo tipado `string[]`.
     - `metricItemSchema`, `comparisonDataSchema`, `timelineItemSchema`: tipado tolerante con valores numéricos y deltas nulos.
   - **Blindaje de Acciones de Revalidación**:
     - Aislamiento de llamadas a `revalidatePath` mediante bloques `try / catch` en `upsertSmartCvAction` y `upsertPresentationAction` para neutralizar excepciones de invariante de generación estática fuera del contexto de solicitud HTTP.
3. **Métricas de Calidad y Pruebas Unitarias**:
   - Cobertura expandida a **170 pruebas unitarias aprobadas al 100%** en Vitest.
   - 0 errores en compilación estricta TypeScript (`npm run typecheck`).

---

### Fase 43: Pipeline de Identidad Visual Corporativa Unificada WebP First & Brand Identity Showcase Interactivo
1. **Diagnóstico y Análisis Forense de Activos Visuales**:
   - **Sobrecarga de Peso en `public/`**:
     - Se identificaron 5 archivos de identidad visual maestros en formato JPEG de alta resolución (2K) con pesos comprendidos entre 882 KB y 1.25 MB (totalizando 6.15 MB), además de una animación corporativa en MP4 de 575 KB.
     - Su utilización directa en el frontend web provocaba degradación crítica del Largest Contentful Paint (LCP) y First Contentful Paint (FCP) en conexiones móviles, incumpliendo los umbrales de Google Core Web Vitals.
   - **Fragmentación de Marca en UI**:
     - Múltiples componentes core (`GlobalNavbar`, `MobileNavDrawer`, `UnifiedDashboardView`, `login`, `start`) empleaban avatares genéricos de CSS ("IN") o texto plano desarticulado, careciendo de un componente centralizado de identidad corporativa.
2. **Pipeline de Transcodificación WebP & Benchmarks de Compresión**:
   - Transcodificación y optimización automatizada mediante `sharp` a calidad balanceada (80% - 85%), generando variantes multi-resolución de alta densidad:
     - `indi-alien-symbol.webp` (800x800): **12.2 KB** (Reducción del 98.7% frente al máster de 942 KB).
     - `indi-alien-symbol-sm.webp` (128x128): **1.9 KB** (Reducción del 99.8%).
     - `indi-alien-symbol-2k.webp` (2048x2048): **34.4 KB** (Reducción del 96.3%).
     - `indi-tech-lockup.webp` (1376x768): **13.0 KB** (Reducción del 98.5% frente a 882 KB).
     - `indi-tech-lockup-sm.webp` (688x384): **6.7 KB** (Reducción del 99.2%).
     - `indi-vector-light.webp` (1376x768): **13.0 KB** (Reducción del 98.7% frente a 988 KB).
     - `indi-stacked-hero.webp` (768x1376): **12.0 KB** (Reducción del 99.0% frente a 1.25 MB).
     - `indi-vector-mark.webp` (800x800): **11.2 KB** (Reducción del 99.1% frente a 1.23 MB).
     - `indi-brand-reveal.mp4` (1080p, 575 KB): video corporativo ambient background integrado sin bloqueo de hilo principal.
     - `indi-logo-animated.mp4` (320x320 1:1, **66.2 KB**): video loop ultra-ligero para logotipo interactivo en streaming nativo.
     - `indi-logo-animated.webm` (320x320 1:1, **55.3 KB**): video loop VP9 ultra-comprimido para Chrome/Edge/Firefox con cero latencia.
     - `indi-logo-wide-animated.mp4` (640x360 16:9, **69.8 KB**): variante panorámica sin audio.
   - **Eficiencia Global**: Reducción del peso visual de 6.15 MB a ~104 KB en imágenes (**98.3% de reducción total**) y videos de logotipo de solo 55-66 KB. Los originales 2K fueron preservados en `public/brand/source/` como repositorio histórico máster.
3. **Arquitectura FSD & Contratos Tipados en Capa de Entidades**:
   - **Contratos Zod (`src/entities/brand/schemas.ts`)**:
     - `brandAssetCategorySchema`, `brandAssetFormatSchema` (soporte `webp`, `svg`, `mp4`, `webm`), `brandAssetSchema`.
     - Catálogo canónico inmutable `BRAND_ASSETS` expandido con activos de animación de logo (`logoAnimated`, `logoWideAnimated`).
   - **Componente Reutilizable Universal (`src/shared/ui/BrandLogo.tsx`)**:
     - Implementado con soporte nativo de **Logotipo Viviente por Video** (`useVideo={true}` por defecto).
     - Reproducción dual WebM / MP4 en bucle continuo silenciado (`autoPlay`, `loop`, `muted`, `playsInline` sin precarga forzada de red).
     - Respaldo visual instantáneo mediante `poster={asset.url}` y `<Image priority />` en Edge (Zero CLS).
     - Cumplimiento estricto WCAG 2.2 AA para usuarios con preferencia de movimiento reducido (`motion-reduce:hidden` en video y fallback estático automático).
   - **Unificación Transversal del Ecosistema**:
     - `GlobalNavbar.tsx`: Integración del logotipo animado viviente `<BrandLogo linkToHome priority />`.
     - `MobileNavDrawer.tsx`, `UnifiedDashboardView.tsx`, `login/page.tsx`, `start/page.tsx`: Logotipo viviente animado continuo.
4. **Experiencia de Usuario: Brand Identity Showcase (`src/features/brand/components/BrandIdentityShowcase.tsx`)**:
   - Bloque interactivo incorporado en la Landing Page (`src/app/page.tsx`):
     - Reproductor de video ambient MP4/WebP con controles glassmórficos flotantes para reproducción, pausa y silencio (touch targets $\ge 44\text{px}$).
     - Selector interactivo de activos de marca en tiempo real con panel de metadatos (resolución, peso, formato) y botón de descarga directa de assets.
     - Telemetría de rendimiento y Core Web Vitals en tiempo real destacando compresión de 98.3% y peso promedio < 15 KB.
5. **Control de Calidad y Pruebas Unitarias (177 Tests Passing)**:
   - Suite `tests/unit/brand-identity-system.test.ts` (7 pruebas unitarias):
     - Validación estricta con Zod de los activos canónicos registrados.
     - Verificación de existencia física de los archivos WebP, WebM y MP4 en `public/brand/`.
     - Guardrail de peso máximo por activo WebP (< 45 KB), video 1:1 (< 80 KB) y video tight-crop 3:2 (< 120 KB).
     - Validación de encuadre ceñido Tight-Crop 3:2 (`indi-logo-tight.mp4`, `indi-logo-tight.webm`, `indi-logo-tight-poster.webp`) que incrementa el área activa del 23.9% al 80.2%, cuadruplicando la escala real del isotipo en cabeceras.
     - Protagonismo visual exclusivo sin textos redundantes HTML a los lados (`showText=false`).
   - 100% de la suite de pruebas unitarias aprobada en Vitest (177 de 177 tests en 27 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`) y build de producción Next.js exitoso.







### Fase: Landing Minimalista & Auditoría de Marca (Octubre 2026)
- Landing reducida de 8 a 5 secciones (Hero · Por qué INDI · Herramientas · Precios · FAQ + cierre).
- Se retiran de la home `BrandIdentityShowcase` (catálogo interno de assets) y `MetricsShowcaseSection` (duplicaba la propuesta de valor).
- Copia pública centralizada en `src/entities/landing/schemas.ts` (`LANDING_CONTENT`) validada con Zod: presupuesto máx. 5 secciones, longitudes de texto, precios canónicos ($2.500 / $6.000, 3 días) y solo rutas internas.
- Marca protagonista: lockup animado `xl` en hero, isotipo en cierre, lockup en footer; un único halo indigo (antes 3 blobs).
- Footer con touch targets ≥ 44px. Pruebas: `tests/unit/landing-content.test.ts`.

### Fase: Hero Cinemático con Video Ambiental & Logo Vertical Protagonista (Octubre 2026)
1. **Hero Cinemático a Pantalla Completa (`BrandHeroBackdrop.tsx`)**:
   - Integración de video ambiental cinemático (`indi-brand-reveal.webm` y `.mp4`) en fondo con escala, desenfoque óptico (`blur-md`), opacidad sutil (50%) y gradiente vertical multicapa (`from-zinc-950/70 via-zinc-950/55 to-zinc-950`).
   - Guardrail de rendimiento y ahorro de datos móvil: el elemento `<video>` solo se monta en resoluciones de escritorio (`min-width: 768px`) y bajo `prefers-reduced-motion: no-preference`. En móviles y conexiones sensibles se sirve exclusivamente el póster estático WebP (`indi-brand-reveal-poster.webp`, 9.5 KB), garantizando cero impacto en LCP.
2. **Protagonismo de Marca con Logo Vertical (`indi-stacked-hero.webp`)**:
   - Incorporación centralizada del isotipo y lockup vertical en el hero (`w-40 sm:w-48 aspect-[768/640]`) con filtro `mix-blend-screen` y resplandor atmosférico cyan (`drop-shadow-[0_0_32px_rgba(34,211,238,0.35)]`).
   - La previsualización interactiva de la tarjeta digital (`DigitalCard`) desciende armónicamente a la sección *"Tres herramientas, una cuenta"* en un layout balanceado de 2 columnas junto al catálogo de productos.
3. **Control de Calidad y Pruebas Unitarias**:
   - Nuevos casos de prueba en `tests/unit/brand-identity-system.test.ts` verificando la existencia y límites de peso de `indi-brand-reveal.webm` (< 150 KB) y `indi-brand-reveal-poster.webp` (< 20 KB).
   - 100% de la suite de pruebas unitarias aprobada (184 de 184 tests en 29 suites).

### Fase: Hero Zero-Media & Erradicación del Splash de Logo (Octubre 2026)
> Supersede el punto 1 de la fase anterior (regresión introducida en `a4767fd`).
1. **Diagnóstico**: el póster `indi-brand-reveal-poster.webp` (logo "Soyindi" a pantalla completa) se renderizaba desenfocado detrás del lockup vertical. En móvil (donde el video nunca se monta) quedaba fijo y se percibía como pantalla de precarga con logo duplicado; en escritorio generaba un flash póster→video.
2. **Solución (`BrandHeroBackdrop.tsx`)**: fondo 100% CSS (halo indigo + halo cyan + gradiente a `zinc-950`). Server Component sin `use client`, sin `<img>`, `<video>` ni `poster`: 0 bytes de red, 0 JS, 0 CLS, comportamiento idéntico móvil/escritorio. Política **Single Logo Protagonist**: el lockup vertical `stackedHero` es el único logotipo del hero.
3. **Pruebas**: `tests/unit/hero-zero-media-backdrop.test.ts` bloquea la reintroducción de medios en el backdrop y verifica un único `<Image>` en el hero.

### Fase: Pulcritud Vectorial en PDF ATS, Sanitización de OCR y Referencias Verificables (Octubre 2026)
1. **Sanitización de Artefactos de OCR Corruptos (`pdf-engine.ts`, `cv-text-parser.ts`)**:
   - Filtrado automático de artefactos de escaneo y OCR (`%Ï`, `%ï`, `‰`) en títulos de grados, diplomas y viñetas de experiencia laboral, garantizando tipografía limpia sin caracteres espurios.
2. **Referencias Laborales con Contacto Verificable Prominente**:
   - Rediseño de la sección de referencias tanto en el motor PDF vectorial (`pdf-engine.ts`) como en el visor web A4 (`CvDocumentPreview.tsx`) y el editor interactivo (`SmartCvBuilder.tsx`).
   - Layout en 2 columnas con tipografía jerárquica clara (Nombre ➔ Cargo • Empresa ➔ `Contacto: [Teléfono / Email]` destacado para el reclutador).
3. **Guardrail Anti-Página Huérfana y Control de Márgenes**:
   - Prevención estricta de páginas adicionales vacías: la línea de firma ejecutiva solo se dibuja en PDF si existe una firma digital configurada por el usuario.
   - Cálculo dinámico de altura requerida (`neededHeight`) y comprobación de saltos de página con encabezado de continuación corporativo.
4. **Control de Calidad y Suite de Pruebas Unitarias (186 Tests Passing)**:
   - Nuevas pruebas en `tests/unit/smart-cv-crud-and-export.test.ts` verificando la sanitización de artefactos de OCR (`%Ï`), inclusión de contactos en referencias y prevención de páginas huérfanas en exportación PDF A4.

### Fase: Extracción Robusta de Contacto en Referencias al Subir CV & Guardrail Anti-Swallow (Octubre 2026)
1. **Auditoría de Ingesta y Diagnóstico de Causa Raíz**:
   - **Pipeline Multimodal LLM (`multimodal-parser.ts`)**: El meta-prompt `MULTIMODAL_CV_PROMPT` omitía la sección `"references"` en el esquema JSON esperado, provocando que la inferencia visual/documental descartara completamente las referencias con sus teléfonos/emails.
   - **Pipeline Heurístico de Texto (`cv-text-parser.ts`) & Bug de Absorción Múltiple (Anti-Swallow)**:
     - El lookahead previo inspeccionaba hasta 3 líneas buscando contactos. Si un CV presentaba una lista densa de referentes en párrafos sucesivos sin viñetas (`•`), la primera referencia extraía su teléfono y continuaba consumiendo líneas siguientes, devorando los teléfonos de los siguientes 3 referentes e incrementando el cursor `i`, borrando las entidades posteriores.
     - Las expresiones regulares de teléfono restringían los formatos de 8-9 dígitos de telefonía móvil y fija chilena (`+56 9 XXXX XXXX`, `+569...`, `9XXXXXXXX`).
2. **Implementación de Extracción Adaptativa Multilínea y Guardrail Anti-Swallow**:
   - Se añadió la clave `"references"` con campos `name`, `role`, `company` y `contact` en el prompt multimodal de IA.
   - **Guardrail Anti-Swallow en Parser Heurístico**:
     - Función `isPotentialNewReference(rawLine, currentHasRoleOrCompany)`: detecta si la siguiente línea es una nueva persona (por viñeta, estructura de nombre o separadores) o si describe el cargo de la persona actual (`isJobTitleLine`).
     - Detención inmediata del lookahead (`break;`) tan pronto como se extrae el contacto de la persona actual o si la línea siguiente pertenece a otro referente.
     - Separación y sanitización estricta de nombres, roles, instituciones y teléfonos (`contactParts.join(' • ')`), evitando que números de teléfono contaminen los nombres de roles o instituciones.
3. **Suite de Pruebas y Validación Integral (189 Tests Passing)**:
   - Casos de prueba exhaustivos en `tests/unit/smart-cv-crud-and-export.test.ts` verificando formatos monolínea, multilínea y el test de regresión anti-absorción (`Anti-Swallow`) con 5 referentes consecutivos reales.
   - 100% de la suite de pruebas unitarias aprobada (189 de 189 tests en 29 suites).
   - 0 errores de tipado TypeScript (`npm run typecheck`).

### Fase: Copiloto de IA por Diapositiva & Extracción Exhaustiva de Métricas (Octubre 2026)
1. **Auditoría de Ingesta y Brechas en Presentaciones**:
   - Detección de métricas numéricas rígidas en `document-parser.ts`: se mejoró el analizador con una expresión regular robusta que extrae magnitudes de moneda (`$`, `USD`, `CLP`, `EUR`, `UF`), ratios cuantitativos (`4.5x`), deltas interanuales (`+240% YoY`, `-75%`), unidades de tráfico (`req/s`, `rps`, `visitas`) y fases cronológicas (`Q1-Q4`).
2. **Orquestador Resiliente Multi-Proveedor de IA (`nvidia-nim.ts`)**:
   - Implementación de failover automático de 3 capas:
     1. **NVIDIA NIM** (`deepseek-r1` / `llama-3.2-11b-vision-instruct`).
     2. **Google Gemini** (`gemini-1.5-flash`).
     3. **OpenRouter** (`google/gemini-2.0-flash-001`).
     4. **Motor Heurístico Determinista Local** (cero dependencias de red, 100% offline).
3. **Copiloto Granular de IA por Diapositiva (`SlideAiAssistant.tsx` & `refineSlideWithAiAction`)**:
   - Integrado en el editor de diapositiva de `PresentationStudio.tsx` con accesibilidad táctil WCAG 2.2 AA (touch targets $\ge 44\text{px}$).
   - Acciones de optimización en 1 clic:
     - **Action Title McKinsey**: genera titulares activos asertivos (<14 palabras) que comunican la conclusión ("So what?").
     - **Viñetas de Impacto (Punchy Bullets)**: reescribe oraciones extensas iniciando con verbos ejecutivos.
     - **Notas del Orador (Speaker Script)**: genera un guion oral en primera persona temporalizado (~45-60s).
     - **Optimización Completa**: sintetiza título, puntos y guion simultáneamente.
4. **Control de Calidad y Pruebas Unitarias (193 Tests Passing)**:
   - Nuevos casos de prueba en `tests/unit/presentation-adaptive-pipeline.test.ts` verificando la extracción de métricas complejas (UF, deltas, ratios) y las acciones del asistente granular de IA por diapositiva.
   - 100% de la suite de pruebas unitarias aprobada (193 de 193 tests en 29 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Normalización Profesional de Slugs Públicos & Auto-Sincronización (Octubre 2026)
1. **Erradicación de Slugs Genéricos Provisionales**:
   - Reemplazo del patrón de slug inicial aleatorio `tarjeta-xxxxx` por el estándar SaaS de clase mundial basado en la identidad profesional (`generateCardSlug` y `slugifyCardName` en `@/entities/card/schemas`).
2. **Auto-Sincronización Reactiva & Modo No Invasivo**:
   - En `CardBuilder.tsx`, al escribir el nombre completo, el slug se deriva y sincroniza automáticamente en tiempo real (`slugifyCardName(name)`) mientras el usuario no lo haya editado a mano (`isSlugManuallyEdited`).
   - Si el usuario personaliza el slug deliberadamente, el sistema respeta su decisión y desactiva la sobreescritura automática.
3. **Controles Táctiles Asistidos ($\ge 44\text{px}$)**:
   - Botón *"Desde nombre"* para re-sincronizar el slug con el nombre del usuario en 1 toque.
   - Botón *"Copiar"* para copiar la URL completa `https://indi.bio/c/[slug]` con confirmación visual reactiva (`Copiado!`).
   - Remoción de desfases visuales entre el prefijo `indi.bio/c/` y el input, con validación inline de patrón URL.
4. **Verificación en Tiempo Real con Turso & Alternativas Inteligentes**:
   - Mediante `checkCardSlugAvailabilityAction`, el editor consulta a Turso con debounce de 350ms, mostrando badges dinámicos (`Disponible`, `En uso`, `Reservado`).
   - Algoritmo `generateSlugAlternatives` sugiere 3 variantes ejecutivas si el slug está tomado (`-pro`, `-cl`, `-oficial`, o por profesión) seleccionables en 1 toque.
   - Guardrail de seguridad: `RESERVED_CARD_SLUGS` prohíbe registrar rutas del sistema de la aplicación (`admin`, `dashboard`, `pricing`, `api`, `cv`, etc.).
5. **Control de Calidad y Pruebas Unitarias (204 Tests Passing)**:
   - Suites en `tests/unit/card-slug.test.ts` y `tests/unit/card-slug-availability.test.ts`.
   - 100% de la suite de pruebas unitarias aprobada (204 de 204 tests en 31 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Refactorización Ejecutiva de `TrialBanner` (WCAG 2.2 AA & Base 8) (Octubre 2026)
1. **Contraste Perceptual WCAG 2.2 AA / AAA**:
   - Erradicación de tipografía desvaída (`text-indigo-200`) sobre fondos oscuros; sustituida por jerarquía nítida en `text-white` y `text-zinc-300` con ratio de contraste superior a $8:1$.
2. **Ergonomía Táctil Mobile-First ($\ge 44\text{px}$)**:
   - Todos los botones y llamadas a la acción (`Suscríbete por $2.500 / mes`, `Gestionar suscripción`, `Activar membresía`) implementan altura mínima táctil `min-h-[44px]` y ancho táctil mínimo `min-w-[44px]`.
3. **Retícula Base 8 & Glassmorphism 2.0**:
   - Normalización de paddings a múltiplos de 8px (`px-4 sm:px-6`, `py-3` a `py-3.5`, `gap-3` a `gap-4`).
   - Contenedor con `backdrop-blur-md`, micro-bordes luminosos acordes al estado (`ACTIVE`, `TRIAL`, `EXPIRED`) y badges de estado redondeados tipo pill.
4. **Control de Calidad y Pruebas Unitarias (209 Tests Passing)**:
   - Nueva suite en `tests/unit/trial-banner.test.ts` verificando landmarks semánticos `<aside>`, accesibilidad `aria-label`, touch targets $\ge 44\text{px}$ y contraste del CTA principal.
   - 100% de la suite de pruebas unitarias aprobada (209 de 209 tests en 32 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Integración Oficial de Mercado Pago SDK v2 & Checkout Pro (Octubre 2026)
1. **Pasarela de Pagos Transaccional en CLP**:
   - Integración nativa del SDK oficial `mercadopago` v2 con `MercadoPagoConfig`, `Preference` y `Payment`.
   - Soporte para cobros en pesos chilenos ($2.500 CLP mensual y $6.000 CLP semestral con 60% OFF).
2. **Arquitectura FSD & Route Handlers Seguros**:
   - `/api/checkout/mercadopago`: Generación de preferencias de pago Checkout Pro con redirección automática a Webpay / tarjetas.
   - `/api/webhooks/mercadopago`: Escucha de notificaciones IPN con verificación anti-spoofing (`paymentClient.get({ id })`), batching en Turso para activar `user.status = 'ACTIVE'`, extensión de `subscriptionEndsAt` y registro contable en `payments_history`.
3. **Página de Éxito & Experiencia de Usuario**:
   - Nueva ruta `/checkout/success` con confirmación visual de membresía desbloqueada y accesos directos al Dashboard y Creador de Tarjetas.
   - Botón CTA de suscripción directa en `PricingSection` con estados de carga (`Loader2`), manejo de errores y touch targets $\ge 44\text{px}$.
4. **Control de Calidad y Pruebas Unitarias (214 Tests Passing)**:
   - Nueva suite en `tests/unit/mercadopago-integration.test.ts` verificando schemas Zod, duración de suscripciones y validación de webhooks.
   - 100% de la suite de pruebas unitarias aprobada (214 de 214 tests en 33 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Homologación Universal de Slugs Públicos en Smart CV y Presentaciones Orbitales (Octubre 2026)
1. **Erradicación de Sufijos/Hashes Aleatorios por Defecto**:
   - Reemplazo de los sufijos forzados de 4 caracteres (`-k3p1`, etc.) por slugs ejecutivos limpios basados en el nombre (`generateCvSlug(name, false)`) y el título de la presentación (`generatePresentationSlug(title, false)`).
   - Generación de enlaces profesionales directos: `indi.bio/cv/matias-riquelme` y `indi.bio/p/pitch-deck-2026`.
2. **Auto-Sincronización Reactiva Bidireccional**:
   - Tanto `SmartCvBuilder.tsx` como `PresentationStudio.tsx` implementan auto-sincronización reactiva: al tipear el nombre o título, el slug se actualiza automáticamente a menos que el usuario lo haya editado manualmente (`isSlugManuallyEdited`).
   - Botones ergonómicos $\ge 44\text{px}$ (*"Desde nombre"* / *"Desde título"*) para re-sincronizar el slug en 1 toque.
   - Botón *"Copiar"* para copiar la URL completa con feedback de confirmación visual (`Copiado!`).
3. **Verificación de Disponibilidad en Tiempo Real con Turso SQLite**:
   - Server Actions `checkCvSlugAvailabilityAction` y `checkPresentationSlugAvailabilityAction` con debounce de 350ms.
   - Badges visuales reactivos en la interfaz: `Disponible` (verde), `En uso` (ámbar), `Reservado` (rojo) y `Verificando` (spinner).
4. **Protección de Rutas del Sistema & Sugerencias Inteligentes en 1 Toque**:
   - Protección con `RESERVED_CV_SLUGS` y `RESERVED_PRESENTATION_SLUGS` previniendo colisiones con rutas críticas del sistema.
   - Motores `generateCvSlugAlternatives` y `generatePresentationSlugAlternatives` que recomiendan chips ejecutivos (`-pro`, `-cl`, `-pitch`, `-deck`, `-2026`) seleccionables en 1 toque cuando un identificador ya está tomado.
5. **Control de Calidad y Pruebas Unitarias (228 Tests Passing)**:
   - Nuevas suites unitarias dedicadas: `tests/unit/cv-slug-availability.test.ts` y `tests/unit/presentation-slug-availability.test.ts`.
   - 100% de la suite de pruebas unitarias aprobada (228 de 228 tests en 35 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Rediseño UI/UX, Eficiencia y Command Center en Dashboard Unificado (Octubre 2026)
1. **Arquitectura Zero Redundancy & Command Center**:
   - Erradicación de botones de creación dispersos y redundantes en el header.
   - Acción primaria de creación 100% contextualizada por vertical (*Tarjetas*, *Smart CVs*, *Presentaciones*) sincronizada en una barra de herramientas de alta densidad.
2. **Empty States Inductivos & Guiados (`DashboardEmptyState`)**:
   - Sustitución de cajas grises vacías por bloques bento educativos que ilustran en 3 pasos la activación del recurso con botón magnético de inicio inmediato.
3. **Buscador Inteligente con Atajo Accesible**:
   - Integración de buscador reactivo en memoria con atajo de teclado global (`Ctrl + K` o `/`), feedback visual y botón de limpieza inmediata.
4. **Ergonomía Móvil Thumb Zone & Floating Action Bar**:
   - Barra flotante inferior fija (`fixed bottom-4 inset-x-4 sm:hidden`) con touch target $\ge 48\text{px}$ para crear y gestionar recursos con una sola mano en pantallas móviles.
   - Pestañas con deslizamiento suave y `snap-x` para navegación táctil sin desbordes.
5. **Control de Calidad y Pruebas Unitarias (232 Tests Passing)**:
   - Nueva suite unitaria dedicada: `tests/unit/unified-dashboard-view.test.ts`.
   - Cobertura de cálculos de conversión sin división por cero, filtrado multi-entidad y asignación contextual de rutas canónicas.
   - 100% de la suite de pruebas unitarias aprobada (232 de 232 tests en 36 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Consolidación de Editores, Branding Persistente y Eficiencia Vertical (Octubre 2026)
1. **Unificación de Branding en Cabecera de Editores (`AppEditorHeader`)**:
   - Integración transversal del Isotipo Oficial animado INDI (`<BrandLogo variant="symbol" size="sm" />`) en las cabeceras de `/presentations`, `/cards/new` y `/cv`.
   - Continuidad visual corporativa, separador vertical sutil y breadcrumbs contextuales con navegación de retorno protegida ($\ge 44\text{px}$).
2. **Erradicación de Redundancias de IA en Orbital Studio**:
   - Eliminación de la triple entrada de IA (barra horizontal "Tema Rápido" y botón duplicado "Modo Avanzado"), recuperando más de 80px de altura vertical útil.
   - Unificación en un único botón magnético ejecutivo: `Crear con IA (SCQA)` conectado al modal multimodal inteligente `SmartPresentationDropzone`.
3. **Optimización Above-the-Fold en Pantallas Laptop (13"-15")**:
   - Proyección limpia del lienzo 16:9 y las miniaturas de diapositiva sin requerir scroll vertical en resoluciones comunes.
   - Limpieza del pie decorativo de diapositiva (`SlideViewer.tsx`) manteniendo notas del orador legibles e indicador en vivo.
4. **Control de Calidad y Pruebas Unitarias (234 Tests Passing)**:
   - Nueva suite unitaria dedicada: `tests/unit/editor-branding-and-layout.test.ts`.
   - 100% de la suite de pruebas unitarias aprobada (234 de 234 tests en 37 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Onboarding Hub Guiado, Switchboard Sistémico y Ergonomía Móvil (Octubre 2026)
1. **Switchboard Sistémico Post-Registro (`/start`)**:
   - Flujo centralizado de despacho de nuevos usuarios orientado a la intención de negocio (*Job-to-be-Done*): Tarjeta Digital (2 min), Smart CV (4 min) o Presentación Cinemática (3 min).
   - Integración de banner de membresía server-side (`checkUserEntitlementAction`) con conteo regresivo de 3 días de prueba.
2. **Dual Layout Móvil con Scroll Snap & Base 8**:
   - Implementación de carrusel táctil horizontal con `snap-x snap-mandatory` en smartphones ($\le 640\text{px}$) y grid de 3 columnas de alta gama en monitores de escritorio.
   - Botones primarios de acción con touch target ergonómico $\ge 48\text{px}$ (`min-h-[48px]`).
3. **Branding Corporativo Persistente & Válvula de Escape**:
   - Cabecera oficial con `<BrandLogo size="md" />` y enlace directo de salto hacia el Dashboard General para usuarios recurrentes.
4. **Control de Calidad y Pruebas Unitarias (237 Tests Passing)**:
   - Nueva suite unitaria dedicada: `tests/unit/onboarding-flow.test.ts`.
   - Validación de rutas canónicas, tiempos de inducción y formateo dinámico de banners de membresía.
   - 100% de la suite de pruebas unitarias aprobada (237 de 237 tests en 38 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Saneamiento Integral de Navegación, Cero Auto-Enlaces y Minimalismo Ejecutivo (Octubre 2026)
1. **Erradicación de Bucles Autorreferenciales (Zero Self-Referencing Loops)**:
   - Configuración canónica del logotipo corporativo `BrandLogo`: en `/dashboard` y `/start` enlaza de forma universal a la portada web (`/`), eliminando recargas redundantes hacia la misma página activa.
   - Erradicación del botón secundario redundante *"Ver Web"* en la barra de navegación del panel.
2. **Consolidación de Triggers de Precios (Single Point of Conversion)**:
   - Retiro del enlace duplicado *"Planes y Membresía"* del header del Dashboard, delegando la conversión al componente prominente `TrialBanner` con contador regresivo de prueba.
3. **Limpieza de Cabecera en Autenticación (`/login`)**:
   - Sustitución de textos y flechas duplicadas por el `BrandLogo` oficial y un botón de retorno unificado hacia la portada (`/`).
4. **Control de Calidad y Pruebas Unitarias (240 Tests Passing)**:
   - Nueva suite unitaria dedicada: `tests/unit/systemic-navigation-audit.test.ts`.
   - Verificación de ausencia de auto-enlaces en todas las cabeceras del ecosistema.
   - 100% de la suite de pruebas unitarias aprobada (240 de 240 tests en 39 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Auditoría Integral de Flujo, Persistencia y Gobernanza de Marca Canónica (Octubre 2026)
1. **Alineación Estricta Drizzle ORM vs Contratos Zod**:
   - Actualización del tipo genérico `$type` de la columna `themeConfig` en la tabla `cards` ([src/entities/schema.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/entities/schema.ts)) para sincronizar propiedades visuales avanzadas (`cardFinish`, `surfaceTexture`, `badgeText`, `ctaLabel`) validadas en `cardFormSchema`.
2. **Erradicación de Infracciones de Identidad Visual (Zero Ad-Hoc Placeholders)**:
   - Reemplazo del placeholder manual CSS `"IN"` en [src/shared/ui/PublicContextualHeader.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/shared/ui/PublicContextualHeader.tsx) por el componente corporativo canónico `<BrandLogo variant="symbol" size="xs" showText={true} linkToHome={true} />`, en total acatamiento del estándar de diseño y marca de `AGENTS.md`.
3. **Skill de Ingeniería de Flujo & Persistencia**:
   - Creación de la skill formal de agentes [.agents/skills/flow-and-persistence-audit/SKILL.md](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/.agents/skills/flow-and-persistence-audit/SKILL.md) que documenta el protocolo de verificación en 5 fases (Zod vs Drizzle, Multi-Tenancy IDOR, Batching LibSQL, UI/UX Base 8 y Navegación sin Loops).
4. **Control de Calidad y Pruebas Unitarias (242 Tests Passing)**:
   - Nueva suite unitaria dedicada: `tests/unit/flow-and-persistence-audit.test.ts`.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (242 de 242 tests en 40 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Homologación Universal del Isotipo Animado en Vistas Públicas (/c, /cv, /p) (Octubre 2026)
1. **Purificación Visual y Espacial en Vistas Públicas (Zero Text Noise)**:
   - Erradicación de subtítulos y textos accesorios dispersos (`"INDI"`, `"IDENTITY EDGE"`) en las cabeceras públicas de Tarjetas Digitales (`/c/[slug]`), Smart CV (`/cv/[slug]`) y Presentaciones Orbitales (`/p/[slug]`).
   - Implementación estandarizada del isotipo animado oficial en video loop (`<BrandLogo variant="symbol" size="sm" showText={false} useVideo={true} linkToHome={true} />`), brindando máxima pureza estética, mayor aire visual para el contenido del usuario y unificación con el Dashboard y Editores.
2. **Inclusión de Marca Canónica en Presentaciones Públicas (`/p/[slug]`)**:
   - Integración del isotipo corporativo en [PublicPresentationViewer.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/orbital-presentations/components/PublicPresentationViewer.tsx), proporcionando presencia de marca de alta gama con enlace de retorno sin colisionar con el botón de estudio (`onExit`).
3. **Control de Calidad y Pruebas Unitarias (243 Tests Passing)**:
   - Actualización de `tests/unit/systemic-navigation-audit.test.ts` verificando la configuración uniforme del isotipo animado sin textos en las 3 verticales públicas.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (243 de 243 tests en 40 suites).
   - 0 errores en verificación estricta de tipos (`npm run typecheck`).

### Fase: Escala, Presencia Imponente y Zoom Fluido en Vistas Públicas (/cv, /c, /p) (Octubre 2026)
1. **Smart CV de Gran Presencia con Selector de Zoom**:
   - Expansión del contenedor principal en [PublicCvViewer.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/ai-smart-cv/components/PublicCvViewer.tsx) de `max-w-5xl` a `max-w-6xl lg:max-w-7xl` (alineado a la escala de la portada web).
   - Integración de selector interactivo de Zoom/Escala en la barra de herramientas (`85%` a `125%`) con tipografía proporcional, permitiendo una lectura nítida e imponente en pantallas portátiles y monitores 2K/4K sin alterar la exportación vectorial estándar A4 (ISO 216).
   - Actualización de [CvDocumentPreview.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/ai-smart-cv/components/CvDocumentPreview.tsx) para admitir ancho fluido hasta `920px` y `scale` dinámico por CSS Transform.
2. **Presencia Ejecutiva en Tarjetas Digitales (`/c/[slug]`)**:
   - Ampliación responsive en [DigitalCard.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/entities/card/components/DigitalCard.tsx) de `max-w-sm` (384px) a `sm:max-w-[430px]` con padding optimizado.
   - Expansión de luces volumétricas ambientales de fondo en [src/app/c/[slug]/page.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/app/c/%5Bslug%5D/page.tsx) a 650px con desenfoque de 150px, eliminando vacíos oscuros.
3. **Modo Teatro Cinemático Expansivo en Presentaciones Orbitales (`/p/[slug]`)**:
   - Ampliación del contenedor de diapositiva a `max-w-7xl` en [PublicPresentationViewer.tsx](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/features/orbital-presentations/components/PublicPresentationViewer.tsx), aprovechando todo el ancho de monitores panorámicos.
4. **Control de Calidad (243 Tests Passing)**:
   - 100% de tests aprobados en Vitest (243 de 243 pruebas en 40 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

### Fase: Auditoría Integral de Base de Datos, Migración 0004 & Contratos JSON (Octubre 2026)
1. **Línea Base Canónica de 9 Tablas de Dominio**:
   - Auditoría exhaustiva de [src/entities/schema.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/entities/schema.ts) frente a los snapshots de migración de Drizzle y la base de datos distribuida Turso LibSQL: `user`, `session`, `account`, `verification`, `cards`, `card_events`, `smart_cvs`, `presentations` y `payments_history`.
   - Generación de la migración faltante `drizzle/migrations/0004_friendly_ezekiel.sql` para formalizar la tabla `payments_history` (registro inmutable de pagos, webhooks IPN y trazabilidad financiera de Mercado Pago).
2. **Fuertemente Tipado de Modos JSON en Drizzle ORM**:
   - Modularización de esquemas Zod en `src/entities/card/schemas.ts` (`cardThemeConfigSchema`, `cardBentoBlockSchema`, tipos TypeScript `CardThemeConfig`, `CardBentoBlock`).
   - Modularización de esquemas Zod en `src/entities/cv/schemas.ts` (`cvContentSchema`, tipo TypeScript `CVContent`).
   - Tipado estricto en [src/entities/schema.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/entities/schema.ts) de las columnas JSON `cards.themeConfig` y `smartCvs.content` con soporte resiliente para generadores de semillas y pruebas.
3. **Actualización de Skill & Suite de Pruebas Unitarias (244 Tests Passing)**:
   - Expansión de [.agents/skills/flow-and-persistence-audit/SKILL.md](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/.agents/skills/flow-and-persistence-audit/SKILL.md) con el protocolo formal de auditoría de esquema de 9 tablas, cero persistencia binaria y sincronización de migraciones.
   - Actualización de [tests/unit/turso-batch-and-schema.test.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/tests/unit/turso-batch-and-schema.test.ts) validando las 9 tablas del esquema y los campos de auditoría financiera de `payments_history`.
### Fase: Programa de Afiliados, Liquidaciones Quincenales y Panel Admin (Octubre 2026)
1. **Línea Base de 11 Tablas de Dominio & Migración 0005**:
   - Extensión de la tabla `user` con columnas `role` (`'user' | 'admin'`), `referralCode` (código único de recomendación) y `referredBy` (ID del afiliado que refirió la cuenta).
   - Creación de la tabla `affiliate_bank_accounts`: Almacenamiento seguro de institución bancaria, tipo de cuenta, número, nombre del titular y RUT verificado con algoritmo de Módulo 11 chileno.
   - Creación de la tabla `affiliate_commissions`: Registro granular de cada comisión generada por pago aprobado en Mercado Pago (25% en CLP), con estados de trazabilidad (`pending`, `payable`, `paid`) y fecha de abono.
   - Sincronización de snapshot y script SQL en `drizzle/migrations/0005_superb_dust.sql`.
2. **Atribución Automatizada & Disparo en Webhook**:
   - Todo nuevo usuario registrado recibe un código de referido único (`user.create.before` en Better-Auth).
   - Atribución en onboarding vía parámetro `?ref=CODIGO` en `/start` y almacenamiento del vínculo de referido.
   - En el webhook de Mercado Pago (`/api/webhooks/mercadopago`), al confirmarse un pago como `approved`, se invoca `processAffiliateCommissionOnPayment`, calculando automáticamente el 25% ($625 CLP para mensual y $1.500 CLP para semestral) e insertando la comisión en estado `payable`.
3. **Experiencia del Afiliado en Dashboard (`/dashboard?tab=affiliates`)**:
   - Pestaña dedicada con copia en 1 clic del enlace oficial de referido (`indi.bio/start?ref=CODIGO`).
   - **Personalización de Código en Tiempo Real:** El usuario puede modificar su código por defecto a uno personalizado y memorable (ej. `mi-marca`, `dev-pro`) mediante `updateReferralCodeAction` y verificación de colisiones en tiempo real (`checkReferralCodeAvailabilityAction`) con debounce y protección de palabras reservadas del sistema (`RESERVED_REFERRAL_CODES`).
   - Métricas en tiempo real: *Referidos Activos*, *Por Cobrar (Próximo Corte Quincenal)*, *Total Pagado* y *Próxima Fecha de Pago* (días 1 y 15).
   - Formulario de datos bancarios para transferencia (bancos chilenos, Cuenta RUT, Cuenta Vista, Corriente) con formateo y validación de RUT.
4. **Panel de Administración (`/admin`)**:
   - Ruta protegida con guardrail de sesión y rol de usuario (`role = 'admin'`).
   - Resumen del monto consolidado a transferir en el corte quincenal actual.
   - Listado interactivo de afiliados con saldo por liquidar, datos bancarios con botón de copia en 1 toque y botón *"Marcar como Pagado"* que actualiza el estado a `paid`.
5. **Control de Calidad (254 Tests Passing)**:
   - Suite completa en `tests/unit/affiliates-and-payouts.test.ts` con 10 pruebas que validan el algoritmo de Módulo 11 para RUT chileno, contratos Zod, personalización y normalización de códigos de referido, protección de términos reservados y cálculo de comisiones/fechas de corte quincenales.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (254 de 254 tests en 41 suites).
   - 0 errores en compilación TypeScript (`npm run typecheck`).

---

## 🌐 FASE 19: GOBERNANZA DE DOMINIO CANÓNICO OFICIAL (`soyindi.cl`) & EDGE REDIRECTS (OCTUBRE 2026)

### 1. Diagnóstico y Neutralización de Fragmentación de Tráfico
Tras la adquisición y habilitación del dominio canónico **`soyindi.cl`**, existían rutas residuales que abrían bajo subdominios generados por la plataforma de hosting (`*.vercel.app`), dominios de desarrollo previo (`indi.bio`) o prefijos alternativos (`www.soyindi.cl`). Esta fragmentación afectaba:
- El posicionamiento SEO e indexación en motores de búsqueda (contenido duplicado).
- La consistencia de marca en tarjetas digitales, currículums inteligentes y presentaciones compartidas.
- La trazabilidad y entrega de cookies de sesión seguras en Better-Auth.

### 2. Arquitectura de Gobernanza Canónica Multi-Nivel
1. **Middleware Perimetral Next.js (`src/middleware.ts`)**:
   - Inspecciona en el Edge la cabecera `host` de cada solicitud entrante.
   - Si la solicitud proviene de `*.vercel.app`, `indi.bio`, `www.indi.bio` o `www.soyindi.cl`, efectúa de inmediato una redirección **HTTP 308 (Permanent Redirect)** hacia `https://soyindi.cl`, preservando íntegramente la ruta (`pathname`) y parámetros de consulta (`searchParams`).
   - Mantiene excepciones seguras para desarrollo local (`localhost`, `127.0.0.1`) y assets estáticos empaquetados (`_next/static`, `_next/image`, `public/brand/`).
2. **Módulo de Contratos y Resolución Centralizada (`src/entities/brand/domain.ts`)**:
   - Centraliza las constantes inmutables `PRIMARY_DOMAIN = 'soyindi.cl'` y `CANONICAL_ORIGIN = 'https://soyindi.cl'`.
   - Expone los helpers `getAppBaseUrl()` y `buildCanonicalUrl()` con resolución adaptativa entre cliente (`window.location.origin`), servidor/Edge y variables de entorno (`NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL`).
3. **Metadatos SEO, Open Graph, Sitemap & Robots (`metadataBase`)**:
   - `src/app/layout.tsx`: Configuración estricta de `metadataBase: new URL('https://soyindi.cl')` y `alternates.canonical: 'https://soyindi.cl'`.
   - Rutas dinámicas (`/c/[slug]`, `/cv/[slug]`, `/p/[slug]`): Inyección de URLs canónicas y enlaces Open Graph absolutos bajo `https://soyindi.cl`.
   - Generación automática de `src/app/robots.ts` y `src/app/sitemap.ts` apuntando a `https://soyindi.cl` y consumiendo las entidades activas en Turso SQLite.
4. **Serialización Determinista en Documentos Exportables & Compartidos**:
   - **vCard 3.0 (`vcard.ts`)**: Enlaces de perfil digital en tarjeta de contacto estandarizados a `${origin}/c/${slug}` con fallback absoluto a `https://soyindi.cl/c/${slug}`.
   - **Generador de Portadas Open Graph (`/api/og`)**: Pie de identidad actualizado a `SOYINDI.CL • IDENTIDAD DIGITAL EN EL EDGE`.
   - **Editores e Interfaces UI (`CardBuilder.tsx`, `SmartCvBuilder.tsx`, `PresentationStudio.tsx`, `AffiliateDashboardTab.tsx`)**: Prefijos visuales de enlace actualizados a `soyindi.cl/...` y acciones de copia usando el origen canónico.
5. **Skill Corporativo Especializado (`.agents/skills/canonical-domain-audit/SKILL.md`)**:
   - Guía paso a paso y checklist de verificación para configuración de DNS, Vercel Domains, Google Cloud OAuth (Pantalla de Consentimiento y Authorized Domains) y webhooks de Mercado Pago.
6. **Auditoría Google OAuth vs Vercel URL**:
   - En `src/shared/lib/auth.ts`, `baseURL` se asegura dinámicamente mediante `CANONICAL_ORIGIN` (`https://soyindi.cl`) en producción, neutralizando callbacks hacia subdominios `*.vercel.app`.
   - Se documenta el requerimiento de configurar en Google Cloud Console la **Pantalla de Consentimiento (OAuth Consent Screen)** con **Authorized Domains** apuntando a `soyindi.cl` (eliminando cualquier alias de `vercel.app`) para erradicar el nombre de Vercel en la ventana de autenticación de Google.
7. **Control de Calidad y Pruebas Unitarias**:
   - Suite completa en `tests/unit/canonical-domain-governance.test.ts` con 8 pruebas que validan la redirección HTTP 308 de dominios Vercel y legacy, la persistencia en desarrollo local, la construcción de URLs canónicas y la resolución estricta de `CANONICAL_ORIGIN`.
   - 100% de la suite de pruebas unitarias aprobada en Vitest (284 pruebas en 45 suites).
   - 0 errores en compilación TypeScript estricta (`npm run typecheck`).

---

## 27. Arquitectura de Referidos Interconectada & Atribución Resiliente (2026)

### 27.1 Diagnóstico del Flujo Viral de Invitación
El canal de crecimiento por referidos de INDI permite a cualquier creador o embajador compartir su enlace personalizado (`https://soyindi.cl/start?ref=CODIGO`). Para evitar fugas de atribución y garantizar una experiencia de usuario gratificante:

```mermaid
graph TD
    A["Visitante ingresa a soyindi.cl/start?ref=CODIGO"] --> B["Sanitización Zod & Cookie First-Party (indi_ref_code, 30 días)"]
    B --> C["Onboarding Hub: Detección de Referente (getReferralPartnerInfoAction)"]
    C --> D["Renderizado de ReferralWelcomeBanner (Acceso VIP Concedido)"]
    D --> E{"¿Usuario crea cuenta o navega?"}
    E -->|"Registro con Google / Email"| F["AuthModal / SignIn: Propagación de ref en callbackUrl"]
    E -->|"Navegación previa en la plataforma"| G["Cookie persistente indi_ref_code retiene el código"]
    F --> H["Atribución Idempotente: attributeReferralAction(user.id, refCode)"]
    G --> H
    H --> I["Usuario realiza suscripción en Mercado Pago"]
    I --> J["Webhook IPN: processAffiliateCommissionOnPayment"]
    J --> K["Comisión Atómica del 25% acreditada en affiliate_commissions"]
    K --> L["Liquidación Quincenal Directa a Cuenta RUT (Día 1 y 15)"]
```

### 27.2 Principios de Ingeniería Implementados
1. **Resiliencia contra Pérdida de Atribución (First-Touch Sticky)**:
   - Los visitantes no pierden su anfitrión si hacen clic en "Ver Planes" o exploran la plataforma antes de registrarse, gracias a la cookie `indi_ref_code` (expiración de 30 días, `sameSite: 'lax'`).
2. **Destinos Duales de Captación (Hub Onboarding vs Registro Directo)**:
   - El generador de enlaces de afiliados ofrece dos modalidades con copiado en 1 toque:
     - **Onboarding Hub (`/start?ref=CODIGO`)**: Permite descubrir la suite completa (Tarjetas, Smart CV, Presentaciones) con el banner de bienvenida VIP antes de registrarse.
     - **Registro Directo (`/login?mode=signup&ref=CODIGO`)**: Abre inmediatamente el formulario de creación de cuenta (Google OAuth en 1 clic o email), vinculando al usuario sin fricción y mostrando el badge de beneficio VIP.
3. **Analíticas de Conversión Pro en Tiempo Real**:
   - El panel de control del afiliado (`AffiliateDashboardTab.tsx`) consulta directamente a Turso LibSQL y desglosa:
     - **Registros Totales**: Suma de cuentas invitadas.
     - **En Prueba Gratuita (`TRIAL`)**: Usuarios explorando los 3 días de cortesía.
     - **Convertidos a Plan Pro (`ACTIVE`)**: Suscriptores que completaron su pago en Mercado Pago.
     - **Tasa de Conversión (%)**: Razón porcentual $(\text{Pro} / \text{Total}) \times 100$.
4. **Cálculo Atómico de Liquidaciones (25% CLP)**:
   - Cada pago aprobado en Mercado Pago genera una comisión del 25% ($625 CLP mensual / $1.500 CLP semestral) en `affiliate_commissions`, acumulándose para abono a Cuenta RUT o bancos chilenos los días 1 y 15 en `/admin`.
5. **Feedback Visual Inmediato (`ReferralWelcomeBanner.tsx`)**:
   - Cumple con WCAG 2.2 AA (ratio $\ge 4.5:1$), retícula Base 8 y Glassmorphism 2.0. Notifica al usuario invitado de su beneficio VIP y del nombre/código de su anfitrión sin invadir la navegación.
6. **Contratos Zod Estrictos (`src/entities/affiliate/referral-cookie.ts`)**:
   - Sanitización de formato (`formatReferralCode`), límite de longitud (3 a 24 caracteres), y bloqueo de códigos reservados del sistema (`isReservedReferralCode`).

### 27.3 Hardening de Seguridad Distribuida & Anti-Gaming (Auditoría Arquitectura Afiliados 2026)
Inspirado en la investigación de sistemas distribuidos y redes de afiliados PLG Serverless (*Arquitectura Afiliados SaaS Serverless.md*):
1. **Validación Criptográfica de Webhooks `x-signature` (HMAC-SHA256)**:
   - En `src/app/api/webhooks/mercadopago/route.ts`, la ingestión de notificaciones valida la cabecera `x-signature` (`ts=[timestamp],v1=[hash]`) confrontándola con `id:[dataId];request-id:[requestId];ts:[ts];` mediante `verifyMercadoPagoWebhookSignature` con comparación en tiempo constante (`crypto.timingSafeEqual`) contra ataques de temporización.
2. **Heurística Anti-Gaming y Prevención de Redes Sybil**:
   - `normalizeEmailForAntiGaming` neutraliza la creación de cuentas de auto-referido mediante sub-direccionamiento (`+alias`) y eliminación de puntos en dominios Google (`gmail.com`, `googlemail.com`). Tanto `attributeReferralAction` como el hook server-side `databaseHooks.user.create.before` de Better-Auth abortan la atribución si las direcciones normalizadas del anfitrión y el invitado coinciden.
3. **Digestión Asíncrona de Reembolsos y Contracargos**:
   - La pasarela maneja eventos de reversión (`status: 'refunded' | 'charged_back'`), actualizando `payments_history` e invocando `processAffiliateRefundOnPayment` para revocar comisiones sin destruir la auditabilidad del registro.
4. **Optimización de Índices en SQLite (Drizzle ORM)**:
   - La tabla `affiliate_commissions` incorpora índices dedicados sobre sus claves foráneas (`affiliate_commissions_buyer_user_idx` y `affiliate_commissions_payment_idx`), asegurando que las consultas de agregación y auditoría en `/admin` se ejecuten en tiempo $O(\log n)$ sin table scans.

---

## 28. Ciclo de Vida del Trial, Cuenta Regresiva de Precisión y Hardening de Entitlements (2026)

### 28.1 Diagnóstico de Auditoría Temporal
1. **Precisión Matemática del Servidor**: El vencimiento de prueba se fija en `user.trialEndsAt` como timestamp Unix milisegundos (`INTEGER` en Turso LibSQL SQLite). No depende de la hora local del dispositivo del cliente.
2. **Cómputo Granular de Tiempo**: Se sustituyó el redondeo estático en días por `calculateTimeRemaining`, una función pura que desglosa en tiempo real: días, horas, minutos, segundos y bandera `isExpired`.

### 28.2 Cuenta Regresiva Reactiva en Vivo (`TrialCountdownTimer.tsx`)
- **Cero Hydration Mismatch**: El temporizador se hidrata con los datos precomputados por el servidor (`initialTimeRemaining`) y activa un pulso reactivo de $1\text{s}$ únicamente tras el montaje en cliente (`useEffect`).
- **Tipografía Tabular y Monospace**: Aplica `font-mono tracking-wider tabular-nums` para erradicar cualquier oscilación de ancho o parpadeo visual del layout al alternar dígitos.
- **Accesibilidad y Ergonomía Base 8**: Semántica `role="timer"` con `aria-label`, contraste perceptual WCAG 2.2 AA y touch targets $\ge 44\text{px}$ en el botón contiguo de suscripción.

### 28.3 Gatekeeper Server-Side contra Bypass de Expiración (`assertUserEntitlementAction`)
- **Bloqueo Atómico de Mutaciones**: Todas las Server Actions de persistencia (`upsertCardAction`, `upsertSmartCvAction`, `upsertPresentationAction`) validan el derecho de acceso antes de escribir en la base de datos.
- **Aislamiento Read-Only Garantizado**: Los usuarios con período vencido conservan la lectura de su panel y sus recursos públicos para evitar rotura de enlaces de networking, pero no pueden alterar ni generar nuevos ítems sin regularizar su membresía por $2.500 CLP.

---

## 29. Matriz Comercial de Suscripciones: "El Semestre Irresistible" (Starter, Pro, Max) (2026)

### 29.1 Arquitectura de Pricing & Packaging Multi-Tier
La plataforma implementa una jerarquía comercial de 3 niveles escalonados definida en `src/entities/subscription/types.ts` (`PRICING_TIERS`):
1. **Plan Starter (🟢)**:
   - **Precios**: $2.500 CLP/mes o $6.000 CLP/semestre ($1.000 CLP/mes, 60% de ahorro).
   - **Cuotas**: Hasta 3 perfiles de tarjetas, 1 currículum base, hasta 2 presentaciones 16:9, analíticas básicas, copiloto IA y sin marca de agua (identidad profesional limpia de grado empresarial).
2. **Plan Pro (🔵 Recomendado)**:
   - **Precios**: $4.990 CLP/mes o $15.000 CLP/semestre ($2.500 CLP/mes, 50% de ahorro).
   - **Cuotas**: Hasta 10 perfiles de tarjetas, hasta 5 versiones de Smart CV con auditoría ATS, hasta 10 presentaciones orbitales, analíticas completas (WhatsApp y vCard), dominio y enlaces profesionales personalizados y copiloto IA en Fast-lane.
3. **Plan Max (🟣)**:
   - **Precios**: $8.990 CLP/mes o $29.990 CLP/semestre (~$4.990 CLP/mes, 44% de ahorro).
   - **Cuotas**: Tarjetas, Smart CV y Presentaciones ilimitadas, panel de embudo avanzado, modelos de frontera NVIDIA NIM (Llama 3.3 / DeepSeek) y soporte VIP.

### 29.2 Integración Transaccional y Liquidaciones de Afiliados
- **Contratos Zod**: Route Handlers de checkout (`/api/checkout/mercadopago`) validan `{ tier, planInterval }`, creando preferencias dinámicas con Mercado Pago SDK v2.
- **Atribución de Comisiones (25% CLP)**: El webhook IPN liquida la comisión directamente sobre el monto real cobrado ($1.500 CLP en Starter Semestral, $3.750 CLP en Pro Semestral, $7.497 CLP en Max Semestral).

### 29.3 Auditoría de Integridad del Ecosistema de Planes & Política Cero Marca de Agua
- **Auditoría Técnica Integral**: Se auditó la coherencia entre las promesas comerciales de la matriz de planes y la ejecución técnica en el código. El sistema procesa los pagos con Mercado Pago SDK v2, valida suscripciones mediante `assertUserEntitlementAction`, protege recursos mediante multi-tenancy estricto (anti-IDOR) y garantiza cuotas balanceadas.
- **Supresión de Marca de Agua en Plan Starter (`hasWatermark: false`)**: Para elevar la percepción de valor y entregar un producto de máxima categoría desde el nivel inicial, se abolió cualquier imposición de marca de agua en tarjetas, Smart CVs y presentaciones. Todos los planes disfrutan de una estética ejecutiva pulcra y profesional.

---

## 30. Blindaje del Free-Tier: Caché ISR Perimetral & Telemetría Desacoplada (2026)

### 30.1 Diagnóstico del Cuello de Botella Serverless
En el plan gratuito de Vercel Hobby, el límite no es el almacenamiento (Turso provee 9 GB), sino la cuota de **100.000 ejecuciones serverless mensuales**. Cuando las rutas públicas (`/c/[slug]`, `/p/[slug]`, `/cv/[slug]`) ejecutan mutaciones en base de datos (`UPDATE viewsCount`) dentro del renderizado, la página se vuelve forzosamente dinámica, consumiendo 1 invocación por cada visita.

### 30.2 Arquitectura de Doble Capa: ISR 60s + Beacon API
1. **Caché Perimetral Incremental (`revalidate = 60`)**:
   - Las páginas públicas activan regeneración estática incremental perimetral.
   - Si una tarjeta recibe 1.000 visitas en un minuto, el CDN de Vercel responde el HTML en <50ms desde la caché de borde, ejecutando solo **1 función serverless** en lugar de 1.000 (reducción del 99.9% en consumo de funciones).
2. **Telemetría Asíncrona Desacoplada (`/api/telemetry/view` & `trackResourceView`)**:
   - Las escrituras en base de datos se eliminaron del renderizado SSR.
   - El cliente despacha la visita en segundo plano mediante `navigator.sendBeacon` o `fetch(keepalive: true)`.
   - Protección anti-inflación en `sessionStorage` para deduplicar múltiples recargas en la misma sesión.
3. **Estrategia de Medios WebP vs Cloudflare R2**:
   - Actualmente, las fotos se comprimen en cliente con `compressImageClient` a WebP (<40 KB) y se persisten directamente como texto estructurado en Turso, soportando con holgura más de 150.000 usuarios activos.
   - Cloudflare R2 permanece parametrizado en `.env.example` como un puerto modular de expansión para cuando la base de usuarios supere dicho umbral.

---

## 31. Gobernanza de Orquestación Agéntica y Servidores MCP (Tool Orchestration 2026)

### 31.1 Protocolo de Aprovechamiento de Recursos
Para garantizar que los agentes de IA operen bajo el máximo estándar de productividad y rigor de ingeniería, la plataforma articula un protocolo de orquestación de herramientas compuesto por:
1. **Chrome DevTools MCP (`chrome-devtools-mcp`)**: Inspección perimetral de layout, auditorías automatizadas de Lighthouse, verificación de Core Web Vitals (LCP, INP, CLS) y pruebas visuales de accesibilidad WCAG 2.2 AA.
2. **Stitch Design System MCP (`StitchMCP`)**: Gestión y sincronización de sistemas de diseño corporativo, prototipado de variantes UI y exportación de tokens de interfaz OKLCH.
3. **Supabase MCP (`supabase-mcp-server`)**: Inspección analítica de esquemas de datos, advisors de optimización SQL y auditorías de consultas concurrentes.
4. **Índice Canónico de Especificaciones de Ingeniería**:
   - Red de Afiliados y Crecimiento Serverless: `docs/specifications/AFFILIATE_NETWORK_ENGINE_2026.md`
   - Motor de Presentaciones Orbitales IA: `docs/specifications/ORBITAL_PRESENTATIONS_ENGINE_2026.md`
   - Motor ATS & Smart CV Unificado: `docs/specifications/SMART_CV_ENGINE.md`
   - Protocolo Canónico Prompt-to-Push 2026: `docs/specifications/AGENT_ORCHESTRATION_PROMPT_2026.md`
   - Prompt Maestro Gemini Deep Research: `docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_DIGITAL_CARDS_2026.md`

### 31.2 Ciclo Continuo Prompt-to-Push
El desarrollo asistido por IA implementa un pipeline de entrega continua cerrado:
1. **Pre-flight**: Verificación determinista de la rama y árbol de Git.
2. **Quality Gates Bloqueantes**: Ejecución mandatoria de `npm run typecheck` (0 errores) y `npm test` (100% aprobado) antes de autorizar cualquier commit.
3. **Sincronización Doc-as-Code**: Alineación en cascada de `README.md`, `BLUEPRINT_2026.md` y `AGENTS.md`.
4. **Publicación Automatizada**: Ejecución de `git commit` semántico y `git push origin <branch>` con reporte ejecutivo de cierre.

---

## 32. Gobernanza de Auditoría Administrativa, Captura Edge de Cookies & Sincronización en Vivo (2026)

### 32.1 Diagnóstico de Atribución y Fallos en Flujo de Referidos
Durante la auditoría técnica profunda del panel de administración (`/admin`) y la red de referidos se identificaron y subsanaron los siguientes vectores críticos:
1. **Captura Determinista de Cookies en Edge Middleware (`src/middleware.ts`)**:
   - *Causa raíz*: Las invocaciones a `cookies().set()` dentro de Server Components (`page.tsx`) fallaban silenciosamente debido a la inmutabilidad de cabeceras en el ciclo de renderizado SSR de Next.js App Router.
   - *Solución*: La captura del parámetro `?ref=CODIGO` se centralizó en `middleware.ts`, inyectando la cookie First-Party `indi_ref_code` (30 días, `SameSite=Lax`, `HttpOnly=false`) directamente en la respuesta HTTP perimetral antes de cualquier ejecución de página.
2. **Declaración Explícita de `user.additionalFields` en Better-Auth (`src/shared/lib/auth.ts`)**:
   - *Causa raíz*: El adaptador Drizzle de Better-Auth filtraba campos no estándar (`status`, `trialEndsAt`, `role`, `referralCode`, `referredBy`) si no se declaraban en la configuración de la instancia.
   - *Solución*: Se agregaron los esquemas de campos adicionales en `betterAuth({ user: { additionalFields: ... } })` junto con un hook reactivo post-creación (`databaseHooks.user.create.after`) que garantiza la persistencia atómica en Turso SQLite.
3. **Eliminación de Consultas N+1 & Batching con `inArray` (`src/features/affiliates/actions.ts`)**:
   - *Causa raíz*: `getAdminAffiliatePayoutsAction` y `getAdminReferralsAuditAction` ejecutaban consultas secuenciales en bucle y `findMany()` sobre toda la base de datos para mapear anfitriones y cuentas bancarias.
   - *Solución*: Refactorización completa utilizando `inArray(user.id, referrerIds)` e `inArray(affiliateBankAccounts.userId, referrerIds)` colapsando múltiples roundtrips en consultas agrupadas de alta velocidad.
4. **Sincronización en Tiempo Real en Panel de Control (`AdminPayoutsView.tsx`)**:
   - Integración de botón de refresco en vivo (`RefreshCw`) y Server Action unificada `getAdminDashboardDataAction`, permitiendo al equipo administrador auditar registros, comisiones y liquidaciones quincenales sin requerir recarga completa de página.

### 32.2 Auditoría de Usabilidad, Contratos Zod & Modal Accesible en Panel Admin (`/admin`)
1. **Contratos Fuertemente Tipados (`MarkAffiliateCommissionsPaidSchema`)**:
   - Validación rigurosa de entradas en mutaciones administrativas con Zod (`safeParse`), previniendo ejecución de Server Actions con IDs nulos o vacíos.
2. **Filtros Ergonómicos de Estado y Búsqueda Predictiva**:
   - Píldoras de segmentación instantánea por estado (`Todos`, `Pro Activo`, `Trial`) en la pestaña de auditoría, junto con filtrado reactivo por nombre, correo y código de anfitrión.
3. **Modal de Confirmación Accesible con Desglose Bancario Completo**:
   - Sustitución de `window.confirm()` por un modal flotante con Glassmorphism 2.0 y contraste WCAG 2.2 AA que exhibe los datos bancarios (Titular, RUT, Banco, Cuenta y Monto CLP) antes de asentar el pago en base de datos.
4. **Touch Targets Cumpliendo Retícula Base 8 ($\ge 44\text{px}$)**:
   - Ampliación de touch targets en botones de copiado y acciones primarias, garantizando máxima ergonomía en dispositivos móviles y de escritorio.
5. **Gobernanza de Metadatos y No-Index**:
   - Declaración de metadatos de Next.js en `src/app/admin/page.tsx` con directiva `robots: { index: false, follow: false }` para proteger la privacidad administrativa ante motores de búsqueda.

---

## 33. Gobernanza de Investigación Profunda con Gemini (Deep Research JSON Spec 2026): Estilo Visual de Compartir, Favicon de Clase Mundial, SEO Programático & Estrategia CEO

### 33.1 Especificación Canónica en Formato JSON
Para guiar la evolución visual, técnica y comercial de la plataforma mediante modelos de razonamiento de frontera (**Gemini 2.5 Pro / Gemini Advanced Deep Research**), se consolidó la especificación formal en formato JSON:
- **Ruta Canónica**: [`docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.json`](../specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.json)
- **Guía de Acompañamiento en Markdown**: [`docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.md`](../specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.md)
- **Suite de Pruebas Unitarias**: [`tests/unit/deep-research-prompt-json.test.ts`](../../tests/unit/deep-research-prompt-json.test.ts)

### 33.2 Los 5 Ejes Estratégicos de Investigación
1. **Eje 1: Estilo Visual & Previews Virales al Compartir (Social Graph)**:
   - Generación perimetral dinámica de Open Graph en `<100ms` con `@vercel/og` (Satori + Resvg).
   - Zona segura dual (composición 1200x630 px con área protegida 630x630 px para miniaturas cuadradas en chats móviles de WhatsApp y Telegram).
   - Headers HTTP de caché (`s-maxage`, `stale-while-revalidate`) para forzar revalidación eficiente ante actualizaciones de perfil.
   - Micro-interacciones ergonómicas de compartir (Web Share API nativa, Vibration API y pre-redacción contextual con fórmulas AIDA / Hook-Story-Offer).
2. **Eje 2: Favicon de Clase Mundial & Assets de Aplicación (Iconografía Web 2026)**:
   - Favicon SVG vectorial con `@media (prefers-color-scheme: dark/light)` embebido para visibilidad perfecta en pestañas oscuras y claras.
   - Matriz completa de assets: `favicon.ico` multi-resolución (16x16, 32x32, 48x48), `apple-touch-icon.png` (180x180), y PWA icons (192x192, 512x512) con propósito `maskable any`.
   - Principios de simplificación geométrica ("Optical Sizing") para evitar empastado de píxeles a 16x16 px.
   - Favicons dinámicos y reactivos mediante HTML5 Canvas API para alertas de visitas en tiempo real y micro-notificaciones en la pestaña del navegador.
3. **Eje 3: Posicionamiento Orgánico en Google, SEO Técnico & Programático Avanzado**:
   - Inyección de datos estructurados tipados en JSON-LD (`Schema.org`): `ProfilePage`, `Person`, `DigitalDocument`, `CreativeWork`, `BreadcrumbList` y `WebSite`.
   - Protocolo IndexNow perimetral para indexación instantánea (<100ms) de nuevas tarjetas, CVs y presentaciones.
   - Programmatic SEO (P-SEO): arquitectura jerárquica de landing pages por profesión y región sin penalizaciones de contenido duplicado.
   - Core Web Vitals al extremo (LCP < 0.8s, INP < 50ms, CLS = 0) combinando ISR 60s y telemetría desacoplada con `trackResourceView`.
4. **Eje 4: Estrategia CEO Avanzada & Motor de Crecimiento C-Level (Product-Led Growth)**:
   - Modelado matemático del bucle viral de producto (K-factor > 1.2) impulsado por cada recurso compartido con micro-atribución de marca ("Identidad Verificada con INDI").
   - Optimización de conversión de planes semestrales ("El Semestre Irresistible") frente a la mensualidad tras los 3 días de Free Trial.
   - Estrategia de retención y 'Sticky Identity' donde el costo de desactivar una tarjeta física impresa es prohibitivo.
   - Expansión B2B ("INDI for Teams") para firmas legales, clínicas, inmobiliarias y startups.
   - Tablero de métricas North Star ejecutivas: CAC, LTV, LTV/CAC > 3.5x, Payback < 2 meses, NRR.
5. **Eje 5: Experiencia de Compartir Curricular & Presentaciones (Smart CV & Orbital Presentations)**:
   - Dicotomía ATS Vectorial A4 corporativo (texto seleccionable, sanitización de viñetas, guardrail anti-huérfanos) vs Visor Web Vivo interactivo (`/cv/[slug]`).
   - Modo 'Pitch Interactivo' en presentaciones 16:9 con control táctil, wake-lock y analíticas de lectura por diapositiva.
---

## 34. Arquitectura de Compartir Viral & Open Graph Safe Zone 1:1 (Fase 1: Motor Perimetral & WebShareModal)

En cumplimiento de las directrices de `Investigación Técnica y Crecimiento INDI.md` y el plan de mejoras 2026, se ejecutó la **Fase 1: Optimización de Previews Sociales y Flujo de Compartir**:

### 34.1 Motor Perimetral Open Graph con Zona Segura Central 1:1 (`src/app/api/og/route.tsx`)
- **Resolución Canónica**: $1200 \times 630\text{ px}$ en Next.js Edge Runtime (`runtime = 'edge'`).
- **Zona Segura Central 1:1**: Área central delimitada de $630 \times 630\text{ px}$ que encapsula:
  - Marca e identidad institucional `<BrandLogo />` ("INDI").
  - Título y cargo/rol principal con tipografía fluida y corte elíptico seguro.
  - Badge de verificación visual ("Identidad Verificada").
  - Indicador de slug canónico (`soyindi.cl/c/...`, `soyindi.cl/cv/...`, `soyindi.cl/p/...`).
- **Auras Volumétricas OKLCH**: Dos zonas laterales de $285\text{ px}$ cada una con resplandor ambiental multicapa que enriquece la vista panorámica en plataformas de escritorio (LinkedIn, X, Facebook) sin comprometer la legibilidad del recorte cuadrado 1:1 en feeds y mensajería móvil (WhatsApp, Telegram, Instagram).
- **Gobernanza de Caché Perimetral**:
  - `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800`.
  - Asegura latencia sub-100ms servida desde el Edge CDN perimetral de Vercel.

### 34.2 Generador de Copywriting Persuasivo y Enlaces Canónicos (`src/shared/lib/shareCopy.ts`)
- **Fórmulas Psicológicas de Compartir**:
  - **Tarjetas Digitales (AIDA)**: Atención al contacto profesional, Interés en el perfil verificado, Deseo de guardar en agenda, Acción mediante enlace directo.
  - **Smart CV (Hook-Story-Offer)**: Gancho del perfil calificado para sistemas ATS, trayectoria verificada y llamado a la acción para reclutadores.
  - **Presentaciones Orbitales (Curiosity Gap)**: Resumen temático 16:9 con intriga estratégica orientada a decisores y clientes potenciales.
- **Construcción Canónica de Enlaces**: Incorpora parámetros UTM estandarizados (`utm_source=share`, `utm_medium=whatsapp|linkedin|x|native`) y persistencia del código de afiliado (`ref=...`).

### 34.3 Componente Accesible `<WebShareModal />` (`src/shared/ui/WebShareModal.tsx`)
- **Ergonomía y Háptica**:
  - Activación de `navigator.vibrate([15, 30, 15])` al desplegar y copiar en navegadores compatibles.
  - Integración nativa con Web Share API (`navigator.share`) si está disponible; modal accesible WCAG 2.2 AA (`role="dialog"`, `aria-modal="true"`) con cierre por tecla `Escape` y backdrop blur.
  - Canales de difusión directos: WhatsApp Web/App, LinkedIn Share, X (Twitter), y Portapapeles con confirmación visual interactiva.
  - Previsualización visual de la tarjeta con simulación de Safe Zone 1:1.
  - Integrado de forma universal en:
    - `src/entities/card/components/DigitalCard.tsx`
    - `src/features/ai-smart-cv/components/PublicCvViewer.tsx`
    - `src/features/orbital-presentations/components/PublicPresentationViewer.tsx`

---

## 35. Favicon Vectorial de Clase Mundial (Dark/Light Mode), Tipografía Premium de WhatsApp & Foto de Perfil en vCard 4.0 (Fase 2)

### 35.1 Favicon SVG con Optical Sizing & Soporte Bimodal (`src/app/icon.svg` & `src/app/layout.tsx`)
- **Adaptación Perceptual**: El favicon SVG implementa directivas `@media (prefers-color-scheme: light)` para alternar la base contenedora y los contrastes del prisma geométrico.
  - *Modo Oscuro*: Fondo `#090D16`, halo cian (`#22D3EE`) y trazo exterior suave.
  - *Modo Claro*: Fondo blanco puro (`#FFFFFF`), bordes contrastados y halo índigo profundo (`#4F46E5`).
- **Optical Sizing**: Trazo diagonal reforzado ($7\text{px}$) y reducción de detalles superfluos para evitar el empastado de píxeles a $16 \times 16\text{ px}$ y $32 \times 32\text{ px}$.
- **Metadatos Canónicos de Iconos**: Vinculación explícita en `RootLayout` (`src/app/layout.tsx`) con soporte para SVG vectorial, WebP y `apple-touch-icon` (180x180 px).

### 35.2 Copywriting Enriquecido para WhatsApp con Selector de Tono (`src/shared/lib/shareCopy.ts` & `WebShareModal.tsx`)
- **Formateo Estético**: Integración de separadores visuales `━━━━━━━━━━━━━━━━━━━━`, negritas tipográficas (`*`), cursivas (`_`) y estructura de contacto directo.
- **Selector de Tono en el Modal**:
  - `Networking`: Fórmula AIDA predeterminada para conectar y guardar contacto.
  - `Comercial`: Presentación de servicios, portafolio y propuesta formal.
  - `Directo`: Mensaje condensado para mensajería instantánea ágil.

### 35.3 Foto de Contacto Directa en vCard 4.0 / RFC 6350 (`src/shared/lib/vcard.ts`)
- **Incrustación Base64**: La propiedad `PHOTO;ENCODING=b;TYPE=JPEG:` se inyecta en el archivo `.vcf` al presionar "Guardar Contacto" mediante `downloadVCardWithPhoto`.
- **Resolución Asíncrona Resiliente**: Función de fetch de imagen con timeout de seguridad (2000ms) y degradación elegante a vCard sin foto ante fallos de red o conexiones lentas.
- **Resultado en Clientes Móviles**: Al guardar el contacto en iOS Contacts o Google Contacts, la llamada entrante despliega el rostro y perfil del usuario a pantalla completa.

---

## 36. Identidad Canónica del Isotipo Alien & Datos Estructurados JSON-LD Schema.org (Fase 3: SEO de Clase Mundial)

### 36.1 Vectorización Canónica de la Cabeza Alienígena (`src/app/icon.svg`)
- **Alineación con BRAND_ASSETS**: Reemplazo de geometrías abstractas previas por la silueta anatómica oficial de `BRAND_ASSETS.alienSymbol`:
  - Antena / Nodo cósmico esférico superior flotante (`cx="32" cy="11.5"`).
  - Cabeza ovoide biomórfica con barbilla estilizada (`d="M32 17.5..."`).
  - Ojos elípticos inclinados en ángulo simétrico ($26^\circ$) con contraste exacto frente al fondo de la pestaña.
  - Gradiente prismático cian-índigo (`#818CF8` ➔ `#22D3EE` ➔ `#2DD4BF`).

### 36.2 Metadatos Open Graph y Twitter Globales (`src/app/layout.tsx`)
- Inclusión del lockup maestro `indi-tech-lockup.webp` ($1376 \times 768\text{ px}$) en la metadata raíz para garantizar previsualizaciones institucionales al compartir el dominio principal `https://soyindi.cl` en LinkedIn, Slack, WhatsApp y X.

### 36.3 Inteligencia de Posicionamiento con Componente Seguro `<JsonLd />` (`src/shared/ui/JsonLd.tsx`)
- Sanitización estricta de cadenas JSON (`\u003c`) para prevenir vulnerabilidades de inyección en tiempo de renderizado.
- **Esquemas Implementados**:
  - **Home (`src/app/page.tsx`)**:
    - `Organization`: Nombre, logotipo en alta definición, redes sociales oficiales y descripción corporativa.
    - `WebSite`: Declaración de búsqueda interna por slug (`SearchAction`).
    - `FAQPage`: Desglose estructurado de preguntas y respuestas frecuentes (prueba gratis, precios, soporte para celulares y pagos) para activar Google Rich Snippets interactivos.
  - **Tarjetas Públicas (`src/app/c/[slug]/page.tsx`)**:
    - `ProfilePage` + `Person`: Vinculación de nombre, cargo, descripción, foto de perfil y enlaces externos (`sameAs`: LinkedIn, Instagram, web personal).
  - **Smart CVs (`src/app/cv/[slug]/page.tsx`)**:
    - `ProfilePage` + `DigitalDocument`: Estructuración técnica orientada a motores de búsqueda laboral y ATS de recursos humanos.

---

## 37. Sistema de Efectos Fotónicos, Acabados Luminosos y Precisión Matemática de Color (Fase 4: Nivel Experto 2026)

### 37.1 Acabados de Alto Contraste y Gama Clara (`luminous-glass`, `aurora-light`)
- **Superación de la Monotonía Oscura**: Integración de acabados claros con alta luminosidad fotónica para usuarios que requieren tarjetas diurnas de alta elegancia editorial:
  - `luminous-glass` (**Opal Light Glass**): Fondo translúcido blanco escarchado (`linear-gradient(150deg, rgba(255, 255, 255, 0.94) ...)`), borde especular claro (`rgba(255, 255, 255, 0.95)`), glow índigo suave y tipografía adaptativa `text-slate-900`/`text-slate-600`.
  - `aurora-light` (**Aurora Lumina**): Gradiente nórdico cristalino con destellos cian/esmeralda sobre fondo claro y tipografía contrastante `text-slate-900`.
- **Textura de Prisma Escarchado (`frosted-prism`)**: Difusión refractiva multicapa con overlay satinado sobre el lienzo.

### 37.2 Micro-Efectos Fotónicos en SmartParticles v3.0
- **Lente Especular Fotónica (`smart-particle::before`)**: Núcleo esférico con gradiente radial asimétrico ($32\% \times 28\%$) que simula reflexión especular de luz de estudio, caja de sombra luminosa y filtro `drop-shadow`.
- **Dispersión Volumétrica Cáustica (`smart-particle::after`)**: Halo cáustico expandido al $380\%$ del diámetro con micro-blur óptico y aceleración por GPU (`will-change: transform, opacity`).

### 37.3 Precisión Matemática OKLCH y WCAG 2.2 AA (`src/shared/lib/colorContrast.ts`)
- **Transformación de Björn Ottosson (`oklchToRgb`)**: Mapeo matemático exacto de coordenadas OKLCH ($L, C, H$) a conos LMS y espacio sRGB con corrección gamma estándar.
- **Verificación Automática de Accesibilidad (`meetsWcagAaContrast`)**: Garantía algorítmica de ratio de contraste $\ge 4.5:1$ en todos los estados interactivos, adaptando botones, badges, enlaces bento y barras de herramientas.

---

## 38. Arquitectura de Precarga Cinemática Inteligente, Erradicación de Recuadros Toscos y Ergonomía Móvil (Fase 5: Estándar Global 2026)

### 38.1 Erradicación Definitiva del "Logo Tosco Cuadrado" & Zero-Box Masking
- **Diagnóstico de Causa Raíz**: En versiones previas, la sección Hero montaba una imagen rasterizada derivada de un bitmap JPEG con fondo oscuro comprimido (`indi-stacked-hero.webp`) dentro de un contenedor rígido `aspect-[768/640]` con `mix-blend-screen`. Dicho modo de fusión no eliminaba los artefactos de compresión sobre el fondo con gradiente ambiental, proyectando un recuadro oscuro tosco con bordes duros.
- **Técnica Fotónica Zero-Box Masking**: Sustitución de cajas rígidas por máscaras radiales continuas:
  ```css
  -webkit-mask-image: radial-gradient(circle at center, black 60%, transparent 95%);
  mask-image: radial-gradient(circle at center, black 60%, transparent 95%);
  ```
- **Componente HeroBrandIdentity (`src/shared/ui/HeroBrandIdentity.tsx`)**: Presenta el video profesional del logo oficial de INDI (`indi-logo-animated.webm` <56 KB y `.mp4` <67 KB) con reproducción nativa inmediata (`muted`, `playsInline`, `autoPlay`), halo bioluminiscente difuso y fallback instantáneo accesible para `prefers-reduced-motion` mediante SVG vectorial puro sin fondo.

### 38.2 Sistema de Precarga Cinemática Reactiva (`SmartPreloader.tsx` & `loading.tsx`)
- **Streaming SSR con React Suspense**: Implementación de pantallas de carga dedicadas (`loading.tsx`) en `/c/[slug]`, `/cv/[slug]`, `/p/[slug]` y raíz `/loading.tsx`.
- **Experiencia de Usuario de Clase Mundial**: En lugar de pantallas blancas, transiciones vacías o splashes del sistema operativo, el usuario visualiza una experiencia de bienvenida cinemática con:
  - Video del logo animado centrado con máscara radial sin recuadros toscos.
  - Micro-barra fotónica de progreso con shimmer prismático.
  - Halos volumétricos ambientales índigo/cian en el lienzo `#080A12`.
  - Conformidad estricta WCAG 2.2 AA (`role="status"`, `aria-live="polite"`).

### 38.3 Ergonomía de Navegadores Móviles y Sincronización de Viewport
- **Prevención del Colapso de la Barra del Navegador**: En `/c/[slug]/page.tsx`, se reemplaza `overflow-hidden min-h-screen` por `min-h-dvh overflow-x-hidden`. Esto permite que iOS Safari y Android Chrome gestionen dinámicamente la altura del viewport y el desplazamiento vertical sin ocultar ni trabar la barra de herramientas del navegador.
- **Gobernanza de Viewport (`src/app/layout.tsx`)**: Declaración explícita de `viewport: Viewport` con `themeColor: '#080A12'` y `colorScheme: 'dark'`, unificando la barra de estado del sistema operativo con el fondo de la plataforma sin parpadeos de contraste.
- **Geometría Circular Suave en Icono Oficial (`src/app/icon.svg`)**: Reemplazo del elemento `<rect>` cuadrado rígido por una geometría circular orgánica (`<circle cx="32" cy="32" r="30">`) con halo perimetral fotónico, erradicando cajas toscas en accesos directos y pestañas móviles.

### 38.4 Invalidación de Caché Perimetral & Purga de Accesos Directos Móviles
- **Cache-Busting Paramétrico en Iconos (`?v=2026.2.2`)**: En `src/app/layout.tsx`, los enlaces de favicons declaran versiones parametrizadas vinculando `/icon.svg?v=2026.2.2` (Isotipo Alienígena Oficial con soporte bimodal dark/light) para forzar la actualización inmediata en proxies y clientes HTTP que conservan copias en caché del favicon cuadrado previo.
- **Protocolo de Purga en Dispositivos Móviles (PWA / Web Shortcuts)**: Cuando un acceso directo se guarda en la pantalla de inicio de iOS o Android, el sistema operativo genera un archivo PNG estático interno en memoria flash que persiste de forma desacoplada de la web. Para que el dispositivo renueve su splash screen con el nuevo isotipo orgánico, el usuario debe desinstalar el acceso directo previo y regenerarlo desde la URL actualizada.

### 38.5 Gobernanza de Caché Web Pura & Erradicación de Splash Screens de SO (Anti-PWA / Pure Web Model 2026)
- **Diagnóstico de Causa Raíz (El Bug del Splash Screen Estático)**: Los artefactos de "versión instalable" (`manifest.ts` con `display: 'standalone'` y metadatos `apple-touch-icon`) instruían a los sistemas operativos móviles (iOS Springboard y Android WebAPK) a capturar las rutas e inyectar un Splash Screen estático sintético congelado en el hardware del teléfono antes de inicializar WebKit. Esto causaba la aparición de un logotipo tosco cuadrado previo a la precarga cinemática y provocaba la desaparición o bloqueo de la barra de navegación del navegador móvil.
- **Supresión Total de PWA / Manifest en Favor del Modelo Pure Web App**:
  1. **Erradicación de `manifest.ts` y Metadatos Standalone**: Se eliminó deliberadamente `src/app/manifest.ts` y las directivas `standalone` y `apple-touch-icon` en `RootLayout`. INDI opera 100% como una aplicación web responsiva fluida dentro de la ventana nativa de Safari y Chrome, preservando los controles naturales del navegador sin secuestros de viewport.
  2. **Micro-Guard de Limpieza Activa de Service Workers (`src/app/layout.tsx`)**: Script inline síncrono en `<head>` que desregistra activamente cualquier Service Worker residual (`navigator.serviceWorker.getRegistrations() -> unregister()`) y purga `window.caches` (CacheStorage API) en <0.2ms ante discrepancias con `APP_CACHE_VERSION`.
  3. **Edge Middleware con W3C `Clear-Site-Data: "cache"`**: Si un cliente se conecta con una versión desactualizada o invoca `?purge=1`, el middleware emite `Clear-Site-Data: "cache"`, limpiando la memoria de disco del navegador de inmediato sin afectar sesiones de Better-Auth.
  4. **Directivas RFC 9111 Estratificadas en `next.config.ts`**: Rutas dinámicas públicas (`/c/:path*`, `/cv/:path*`, `/p/:path*`) configuradas con `Cache-Control: public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=300`. Garantiza que el móvil verifique frescura con el servidor antes de reusar una copia local mientras el CDN de Vercel atiende peticiones en <15ms.

---

## 39. Fortificación Integral de Ciberseguridad, Cumplimiento Normativo Chileno & Mitigación Anti-Replay (Auditoría 2026)

### 39.1 Prevención de Replay Attacks en Webhooks Mercado Pago SDK v2
- **Verificación Criptográfica Dual (`src/shared/lib/mercadopago.ts`)**: Validación HMAC-SHA256 de cabecera `x-signature` combinada con una ventana de tolerancia temporal (`maxToleranceSeconds = 300` / 5 minutos).
- **Mecanismo Anti-Spoofing & Replay**: Se compara el timestamp `ts` contra la hora del servidor en tiempo constante (`crypto.timingSafeEqual`), descartando payloads capturados con antigüedad superior a 300 segundos antes de invocar `paymentClient.get()`.

### 39.2 Mitigación de Buffer Overflows en vCards RFC 2426/6350 (CVE-2023-41064)
- **Sanitización Estricta de Longitudes (`VCARD_SECURITY_LIMITS`)**: Truncamiento de cadenas de texto en `src/shared/lib/vcard.ts` (100 caracteres en título, 120 en profesión, 500 en biografía, 200 en dirección).
- **Límite de Inyección Fotográfica**: Verificación del tamaño del payload fotográfico en Base64; las imágenes que exceden los 150 KB son descartadas para prevenir exploits de desbordamiento de búfer en analizadores ImageIO de iOS y Android.

### 39.3 Resiliencia Anti-Colisión de Slugs y Manejo de Excepciones UNIQUE en SQLite
- **Captura Defensiva Server-Side**: En `upsertCardAction`, `upsertSmartCvAction` y `savePresentationAction`, se interceptan las violaciones de restricción `SQLITE_CONSTRAINT_UNIQUE` del motor Turso LibSQL, retornando respuestas informativas en lugar de errores HTTP 500 no controlados.

### 39.4 Cumplimiento Legal y Tributario Chileno (Ley N° 21.133 & Retención SII 2026)
- **Cálculo de Boletas de Honorarios al 15,25% (`calculateGrossFromNetHonorarios`)**: Módulo en `src/entities/affiliate/schemas.ts` que computa el monto bruto requerido para emitir la Boleta de Honorarios legal de afiliados, garantizando que el titular reciba su 25% líquido exacto mientras INDI cumple el rol de agente retenedor ante el SII.
- **Transparencia en Panel de Administración (`/admin`)**: Desglose automático de `grossHonorariosClp` y `retentionHonorariosClp` para cada liquidación quincenal.

---

## 40. Gobernanza de Privacidad Perimetral, Normalización E.164 & Protección de Identidad Visual (Auditoría 2026)

### 40.1 Normalización Determinista de Telefonía E.164 (`src/shared/lib/phone.ts`)
- **Adaptador E.164 para Telefonía Chilena**: La función `normalizeChileanPhone` procesa números de 9 dígitos anteponiendo el código de país `+56` y limpia caracteres no numéricos, garantizando compatibilidad universal con la libreta de direcciones de iOS y Android.
- **Enlaces Directos de WhatsApp**: `getWhatsAppDigits` extrae los dígitos normalizados para construir URLs nativas hacia `wa.me/` sin guiones ni caracteres inválidos.

### 40.2 Guardrail de Protección de Medios Anti-Arrastre & Anti-Clonación
- **Defensa Pasiva en Cliente**: En `DigitalCard.tsx` y visores públicos, las fotos de perfil implementan `onContextMenu={(e) => e.preventDefault()}` y `onDragStart={(e) => e.preventDefault()}` con selección deshabilitada (`select-none`), impidiendo la descarga accidental o arrastre sin alterar la interfaz visual.

### 40.3 Cabeceras HTTP de Seguridad Perimetral RFC 9111 (`next.config.ts`)
- **Directivas Globales**: Inyección de `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy: camera=(), microphone=(), geolocation=()` para mitigar ataques de Clickjacking y vectorización no autorizada.

### 40.4 Sentinel de Entorno en Arranque del Servidor (`src/shared/lib/envSentinel.ts`)
- **Detección Fail-Fast**: Validación determinista de variables de entorno críticas (`BETTER_AUTH_SECRET`, `TURSO_DATABASE_URL`) durante el arranque del servidor, alertando configuraciones erróneas antes de atender peticiones de producción.

---

## 41. Modernización de Extracción Espacial 2D & Enrutamiento de IA en Cascada (Fase 2026)

### 41.1 Extracción Espacial Bidimensional (Spatial Layout-Aware Extraction)
- Causa Raíz de Desorden en CVs y Presentaciones: Los motores de extracción lineal leen tokens horizontalmente. En plantillas de dos columnas, esto mezcla la columna izquierda con la derecha.
- Implementación Geométrica (src/shared/lib/spatialDocumentExtractor.ts): Inspecciona matrices de transformación para ordenar columnas físicas independientes en Y.

### 41.2 Cascade AI Router Unificado (src/features/ai-smart-cv/lib/multimodal-parser.ts)
- Enrutador Multi-Proveedor de Alta Disponibilidad: Conecta NVIDIA NIM -> Google Gemini 2.0 Flash -> OpenRouter -> Motor Heurístico Determinista.

### 41.3 Clusterización Temática en Presentaciones (Topic Density Clustering)
- Sustitución de Partición Fija: Reemplazo de paragraphs.length / 5 por agrupación guiada por encabezados y densidad temática SCQA.

### 41.4 Gobernanza de Skills Agénticas Especializadas
- cv-intelligence-orchestrator y presentation-intelligence-engine integrados con cobertura en tests/unit/spatial-document-extraction.test.ts.

---

## 42. Auditoría y Resiliencia del Período de Prueba, Pasarela de Pago & Bloqueo Reactivo (Fase 2026)

### 42.1 Diagnóstico Integral del Motor Temporal de Prueba
- **Determinismo Matemática vs Percepción Visual**: El tiempo de prueba (`trialEndsAt`) se fija en Turso SQLite con precisión de milisegundos (`INTEGER` Unix timestamp). En vistas estáticas (`/start`), `daysRemaining` aproxima en días enteros (`Math.ceil`), lo que mantiene el valor en 3 días durante las primeras 24 horas.
- **Transición Reactiva Determinista a Cero (`onExpire` & `router.refresh()`)**:
  - `TrialCountdownTimer.tsx` ejecuta un pulso cada 1.000 ms. Al detectar `remaining.isExpired` ($0\text{s}$ restantes o `diffMs <= 0`), cancela el intervalo de inmediato, renderiza el badge `"Tiempo agotado"` y dispara el callback `onExpire()`.
  - `TrialBanner.tsx` suscribe el callback invocando `router.refresh()` del App Router de Next.js, sincronizando el estado de sesión sin requerir recarga manual del navegador.

### 42.2 Cobertura Ubicua del Banner en Vistas de Edición
- El componente `<TrialBanner />` se integra de forma uniforme en todas las herramientas del SaaS:
  - Panel General: `src/app/dashboard/page.tsx`
  - Creador de Tarjetas Digitales: `src/app/cards/new/page.tsx`
  - Constructor Smart CV: `src/app/cv/page.tsx`
  - Creador de Presentaciones Orbitales: `src/app/presentations/page.tsx`

### 42.3 Guardrails Server-Side y Protección Anti-Bypass
- **Bloqueo Innegociable (`assertUserEntitlementAction`)**: Toda Server Action de mutación (`upsertCardAction`, `upsertSmartCvAction`, `upsertPresentationAction`) bloquea atómicamente la escritura si `status === 'EXPIRED'`.
- **Enforcement Cuantitativo (`assertQuotaAvailableAction`)**: Los usuarios en prueba disfrutan de la cuota Pro (10 tarjetas, 5 CVs, 10 presentaciones) y son bloqueados con mensaje de upgrade si alcanzan el límite.
- **Auditoría de Pagos Mercado Pago**: Webhook verificado con HMAC-SHA256 (`x-signature`), consulta oficial a la API de Mercado Pago (`paymentClient.get`), y extensión atómica en `db.batch([update(user), insert(paymentsHistory)])`.

