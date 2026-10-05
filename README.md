<div align="center">

# 🌐 INDI Platform (2026 SaaS)
### **Ecosistema de Identidad Digital, Networking Profesional & Suite Todo-en-Uno**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-177_Passing-success?style=for-the-badge&logo=vitest)](#-pruebas-unitarias-y-calidad)
[![Turso](https://img.shields.io/badge/Turso-LibSQL_Serverless-4ade80?style=for-the-badge&logo=sqlite)](https://turso.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4_OKLCH-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](#)

<p align="center">
  <b>Reemplaza las tarjetas de papel tradicionales por una presencia digital viva en el celular de tus clientes, prepara tu currículum profesional y proyecta tus propuestas comerciales sin complicaciones técnicas.</b>
</p>

[Explorar Landing Page](#-características-principales) • [Arquitectura Técnica](#-arquitectura-de-clase-mundial) • [Documentación Oficial](#-documentación-técnica-y-gobernanza) • [Pruebas & Calidad](#-pruebas-unitarias-y-calidad) • [Instalación Local](#-puesta-en-marcha-local)

---

</div>

## 📌 ¿Qué es INDI?

**INDI** es una plataforma diseñada para emprendedores, trabajadores independientes y profesionales que buscan captar más clientes y proyectar una imagen impecable de manera sencilla.

A diferencia de las tarjetas de papel —que se pierden, se agotan o terminan en la basura—, INDI proporciona un **link personalizado y código QR** con botón directo a WhatsApp, catálogo de servicios y estadísticas claras, todo por solo **$1.000 CLP al mes**.

---

## 🚀 Características Principales

### 1. 📇 Tarjetas Digitales de Presentación (Glassmorphism 2.0 & Living Identity)
- **Compresión Client-Side WebP (Ultra-Ligera & Cero Latencia)**: Pipeline de compresión de imágenes directo en el navegador con HTML5 Canvas y WebP (`compressImageClient`). Reduce hasta un 85% el peso de avatares y fotos antes de enviarse, con feedback en tiempo real y touch targets ergonómicos $\ge 44\text{px}$.
- **Gestión Multi-Tarjeta Independiente & Flujo de Edición**: Crea múltiples identidades digitales independientes para diferentes negocios o roles profesionales. Edición bidireccional segura (`/cards/new?id=...`) con guardrails multi-tenant anti-IDOR.
- **Generación Dinámica Anti-Colisión de Enlaces**: Algoritmo generador de identificadores únicos para tarjetas nuevas que previene reemplazos accidentales de tarjetas existentes.
- **Presets de Diseño de Lujo**: 5 arquetipos curados (*Cyber Nebula*, *Executive Titanium*, *Emerald Botanical*, *Solar Obsidian*, *Swiss Monochrome*) con paletas OKLCH y Gamut P3.
- **Acabados de Material & Texturas**: Acabados *Classic Glass*, *Holographic*, *Titanium*, *Obsidian* y *Minimal*, combinados con textura *Dot Matrix Grid* y halo de resplandor radial reactivo.
- **Motor de Contraste Perceptual WCAG 2.2 AA**: Cálculo algorítmico de luminancia W3C para garantizar texto nítido y legible (`#ffffff` vs `#0f172a`) en cualquier tono primario.
- **Asistente de Biografía con IA Multi-Tono**: Generación instantánea de bios con IA en 3 registros profesionales (*Ejecutivo*, *Innovador*, *Cercano*) directamente en el editor.
- **Ubicación & Mapa Interactivo (Privacy-First)**: Módulo de geolocalización con visor OpenStreetMap embebido (sin API keys) y accesos directos One-Tap a Google Maps y Waze.
- **Perfil Profesional Vivo**: Nombre, especialidad, biografía, enlaces a redes sociales y contacto directo.
- **Botón Guardar Contacto (vCard 4.0 / RFC 6350 One-Tap con ADR)**: Descarga instantánea de archivo `.vcf` compatible con iOS Contacts, Google Contacts y Microsoft Outlook con codificación estricta UTF-8 y componente físico `ADR/LABEL`.
- **Bloques Bento Modulares**: Vitrina interactiva para destacar proyectos, métricas cuantitativas (+150 clientes, +25% YoY), enlaces externos y testimonios.
- **Botón de WhatsApp Pre-redactado**: Inicia conversaciones comerciales con un mensaje personalizado en 1 toque.
- **Código QR Dinámico Integrado**: Listo para escanear en pantalla, imprimir en stickers o proyectar.
- **Web Share API**: Comparte instantáneamente en el menú nativo de iOS y Android.
- **Open Graph Dinámico en el Edge (`/api/og`)**: Previews visuales automáticos y de alta definición al enviar el enlace por WhatsApp, LinkedIn o Telegram.
- **Telemetría Atómica en Turso**: Registro granular de eventos (`view`, `contact_save`, `whatsapp_click`, `share`, `qr_scan`) y Tasa de Conversión en tiempo real.


### 2. 📄 Smart CV ATS Optimizer & Living Digital Resume
- **Living Digital Resume con URL Propia (`/cv/[slug]`)**: Acceso web público instantáneo para compartir en un toque por WhatsApp, correo o LinkedIn, eliminando la dependencia de enviar archivos PDF adjuntos pesados u obsoletos.
- **Persistencia Idempotente & Cero Duplicación**: Edición segura por identificador primario inmutable (`/cv?id=...`) y Server Action `upsertSmartCvAction` protegida con guardrail multi-tenant anti-IDOR. Actualiza el registro existente en base de datos sin generar registros duplicados ni desincronizar slugs.
- **Telemetría de Lectura en Tiempo Real**: Contador atómico perimetral de visualizaciones (`viewsCount`) para que el postulante sepa con certeza cuándo los reclutadores abren y revisan su perfil.
- **Descarga ATS Vectorial en 1 Clic**: Motor client-side para generar y descargar el currículum en PDF nativo de alta resolución con texto 100% seleccionable e indexable por software ATS.
- **Formato Unificado Empresarial A4 (DIN EN ISO 216)**: Estandarización de alta fidelidad (210 x 297 mm) con texto completamente justificado (Swiss typography), márgenes armónicos de 15 mm e interlineado optimizado tanto en la vista previa interactiva como en la exportación vectorial.
- **Sanitización de Viñetas & Encabezados Corporativos Continuos**: Filtro algorítmico que elimina viñetas redundantes (`• •`) y agrega de forma automática encabezados corporativos con separadores en páginas secundarias (`${fullName} • ${targetRole} (Continuación)`).
- **Protección Anti-Huérfanos**: Cálculo de clearance vertical dinámico ($\ge 24\text{mm}$) que previene títulos de sección aislados al final de una página.
- **Ergonomía Móvil en el Thumb Zone**: Barra inferior de acciones anclada (`fixed bottom-4 inset-x-4 sm:hidden`) con botones táctiles $\ge 44\text{px}$ para contacto telefónico directo, correo electrónico, compartir y enlace directo a la Tarjeta Digital INDI del usuario.
- **Auditoría Algorítmica (0 a 100)**: Evalúa estructura, densidad de palabras clave, impacto de métricas y longitud para superar filtros de software de Recursos Humanos (ATS).
- **Feedback Accionable & Mitigación de Alucinaciones**: Detección de logros sin números (`needs_metric`) según estándares Google XYZ y requerimientos de transparencia de la EU AI Act.

### 3. 📽️ Orbital Presentations Pro (16:9)
- **Persistencia Independiente & Zero Template Shadowing**: Precedencia estricta de base de datos en `/p/[slug]`. Las presentaciones personalizadas de los usuarios tienen prioridad absoluta sobre los templates estáticos por defecto.
- **Gestión Visual de Metadatos & Slugs Dinámicos**: Control en vivo del título y enlace de acceso (`/p/[slug]`) en `PresentationStudio`, con generador automático de sufijos únicos anti-colisión (`generatePresentationSlug`), botón de copiado rápido y regeneración.
- **Separación Robusta Modo Edición vs Creación**: Server Action `upsertPresentationAction` protegida contra sobrescritura silenciosa con validación de identificador primario inmutable (`/presentations?id=...`) y guardrails anti-IDOR.
- **Efectos Cinemáticos & Aura Ambiental Reactiva**: Transiciones fluidas (*Crossfade*, *Slide Keynote*, *Zoom Focus*), auras volumétricas perimetrales (*Backdrop Aura* acelerada por GPU) y modos tipográficos (*Modern Sans*, *Editorial Serif*, *Técnica Mono*).
- **Estudio Cinemático Profesional**: Diapositivas interactivas en relación 16:9 para reuniones de alto impacto, conferencias y videollamadas.
- **Ampliación Profesional de Diapositiva Individual**: Botón ergonómico dedicado en cabecera de `SlideViewer` para proyectar únicamente el lienzo de la diapositiva en pantalla completa nativa sin barras de navegación del navegador ni distracciones del estudio.
- **Deconstrucción Inteligente Multimodal & Pacing**: Extracción real de texto y analítica semántica desde archivos subidos (PDF con `unpdf`, TXT, Markdown, CSV, JSON) o conceptos libres, calculando el pacing y ritmo por diapositiva (3, 5, 10 o 20 min).
- **Pipeline Semántico Adaptativo (SAP Engine)**: Detección automática del arquetipo del documento (*Pitch Deck*, *Arquitectura Técnica*, *Informe de Auditoría*, *Estrategia Ejecutiva*, *Educacional*), extracción de polaridad de contrastes (problema/solución), pasos de procesos y conceptos técnicos reales sin alucinaciones numéricas.
- **Procesamiento Inteligente de Documentos (IDP)**: Detección automática de métricas numéricas reales ($10M, 45%, 3x), extracción de citas y segmentación en ejes temáticos estructurados con Action Titles ejecutivos.
- **Modelos de Frontera NVIDIA NIM**: Integración con endpoints de ultra-baja latencia (Llama 3.3 70B y DeepSeek-R1) respaldados por el motor semántico resiliente `INDI Semantic Heuristics Engine` que garantiza síntesis real del archivo aún sin conexión externa.
- **Catálogo de Plantillas Profesionales 2026**: Acceso instantáneo a Pitch Decks estilo YC, Lanzamientos de Producto (Keynote), Revisiones de Arquitectura de Sistemas y Balances Trimestrales (QBR).
- **Motor Heurístico y Multi-Layout**: Algoritmo determinista (`inferOptimalLayoutStrategy`) que resuelve la topología visual ideal según la entropía de datos (KPI Bento Grid, Split Comparison, Sequential Timeline, Hero Statement).
- **Principio de la Pirámide de McKinsey (SCQA)**: Generación deductiva con *Action Titles* ejecutivos (<15 palabras activas) y argumentación estructurada.
- **Presentación en Vivo In-Situ**: Proyección en pantalla completa instantánea desde la memoria del estudio (eliminando errores de páginas no publicadas) y modo público resiliente en `/p/[slug]`.
- **Modo Presentador y Web APIs**: Sincronización en vivo, cronómetro del orador, notas confidenciales, soporte de *Screen Wake Lock API* y hápticos móviles (*Vibration API*).
- **Ergonomía Móvil & Thumb Zone**: Barra de acción flotante inferior (`fixed bottom-4`) y touch targets $\ge 44\text{px}$ para presentar y editar fluidamente desde smartphones.
- **Temas Volumétricos OKLCH**: Paletas oscuras inmersivas (*Orbital Cyber*, *Emerald Aurora*, *Deep Space*, *Solar Obsidian*) con iluminación reactiva acelerada por GPU y ratios APCA.

### 4. 🎛️ Dashboard Unificado Multientidad (`/dashboard`)
- **Gestión Centralizada con Pestañas**: Monitorea y administra en un solo panel tus Tarjetas Digitales, Smart CVs y Presentaciones.
- **Métricas Agregadas**: Visitas globales en Edge, clicks en WhatsApp e interacciones directas.
- **Navegación Bidireccional Contextual (Tab-Aware)**: Cabecera universal `AppEditorHeader` con botón *"← Volver al Panel"* que devuelve al usuario exactamente a la pestaña correspondiente (`?tab=cvs`, `?tab=presentations` o `?tab=cards`).

### 5. 🧭 Navegación Global Reactiva & Scroll Fluido
- **Barra Sticky Glassmorphic (`GlobalNavbar.tsx`)**: Fijada al tope con `backdrop-blur-xl bg-zinc-950/80` y enlaces directos al panel (`/dashboard`), editores de producto o anclas contextuales de la landing page.
- **Retorno Ergonómico al Inicio (`/#inicio`)**: Logotipo interactivo con retorno al ancla superior en un toque, eliminando cortes o bloqueos de scroll (`overflow-hidden` desacoplado a luces perimetrales).
- **Desplazamiento Suave Accesible**: Configuración nativa `scroll-behavior: smooth` y compensación de altura fija (`scroll-padding-top: 5rem`), con compatibilidad automática para usuarios con `prefers-reduced-motion`.

### 6. 🎨 Identidad Visual Corporativa Unificada & Brand Showcase (WebP First)
- **Pipeline de Transcodificación WebP**: Reducción drástica del 98.3% en el payload visual de la plataforma (de 6.15 MB a 104 KB) mediante variantes multi-resolución de alta densidad (`indi-alien-symbol`, `indi-tech-lockup`, `indi-vector-light`, `indi-stacked-hero`, `indi-vector-mark`) con tiempos de carga instantáneos (LCP < 0.8s).
- **Logotipo Animado Viviente Tight-Crop 3:2 (`<BrandLogo />`)**: Primitiva universal con soporte nativo de video loop en encuadre ceñido 3:2 (`indi-logo-tight.webm` y `indi-logo-tight.mp4`) que elimina el 76% de espacio negro muerto y cuadruplica el tamaño del isotipo y texto en la barra de navegación, con `poster` WebP instantáneo (Zero CLS, 7.2 KB) y desactivación automática ante preferencias de accesibilidad `motion-reduce:hidden` conforme a WCAG 2.2 AA.
- **Brand Showcase Interactivo**: Sección dedicada en la página de inicio con reproductor de video corporativo 1080p ambient background, visor técnico de activos en tiempo real con descarga directa y badges de telemetría de rendimiento Core Web Vitals.
- **Unificación Transversal del Ecosistema**: Reemplazo absoluto de marcadores de texto o SVGs dispersos en `GlobalNavbar`, `MobileNavDrawer`, `UnifiedDashboardView`, `login` y `start`.

### 7. 🚪 Onboarding Hub Guiado (`/start`)
- Al iniciar la prueba de 3 días, el usuario accede a un selector interactivo (*Job-to-be-Done*) que le permite elegir por dónde empezar (Tarjeta, CV o Presentación) con estimaciones de tiempo (2 a 4 minutos).

---

## 💎 Modelo Comercial Inteligente & Minimalista

INDI implementa un modelo **Todo-en-Uno sin restricciones ocultas ni sistemas artificiales de créditos**:

| Plan | Inversión | Beneficios Incluidos |
| :--- | :--- | :--- |
| **Prueba Gratuita** | **Gratis 3 Días** (Sin tarjeta requerida) | Acceso total a los 3 productos (Tarjetas, Métricas, CV, Presentaciones). |
| **Plan Mensual Flexible** | **$2.500 CLP / mes** o **$3 USD** | Tarjetas digitales ilimitadas, métricas en tiempo real, CV y presentaciones sin permanencia. |
| **Plan Semestral (Recomendado)** | **$6.000 CLP / 6 meses** (~$1.000 CLP/mes) o **$7 USD** | **60% de Ahorro**. Mismos beneficios con el máximo ahorro anual. |

---

## 🏛️ Arquitectura de Clase Mundial

El proyecto está construido bajo una arquitectura **100% Free-Tier Serverless** que garantiza cero pausas por inactividad, lecturas sub-milisegundo y costo de infraestructura prácticamente nulo:

```
INDI/
├── .github/workflows/ci.yml     # Pipeline automatizado (Typecheck, Vitest, Build)
├── docs/                        # Documentación técnica oficial y gobernanza
│   ├── architecture/            # Blueprints de arquitectura (BLUEPRINT_2026.md)
│   ├── specifications/          # Especificaciones de ingeniería (SMART_CV_ENGINE.md)
│   └── archive/                 # RFCs y propuestas históricas archivadas
├── tests/unit/                  # Suite de pruebas unitarias (Vitest - 160 tests pasando)
│   ├── auth-flow.test.ts        # Validación de flujo de login, Open Redirect guardrail y sanitización
│   ├── oauth-multi-tenant.test.ts # Aislamiento multi-tenant y Google OAuth
│   ├── card-schema.test.ts      # Validación Zod de tarjetas de presentación
│   ├── cv-schema.test.ts        # Contratos de datos CV y guardrails EU AI Act
│   ├── presentation-schema.test.ts # Contratos de diapositivas, layouts y plantillas
│   ├── presentation-heuristics.test.ts # Motor heurístico determinista y Principio de Pirámide
│   ├── ats-audit.test.ts        # Motor algorítmico de scoring ATS
│   ├── entitlements.test.ts     # Planes comerciales y 3 días de prueba
│   ├── document-upload-routes.test.ts # Handlers nativos HTTP de subida de archivos (25MB)
│   ├── file-security-pipeline.test.ts # Magic bytes, anti-malware, anti-DoS y cero persistencia binaria
│   └── security-guardrails.test.ts # Protección multi-tenant de Server Actions
├── src/
│   ├── app/                     # Next.js 16 App Router (Rutas y Edge Handlers)
│   │   ├── api/                 # Handlers de Autenticación, Subidas y Open Graph
│   │   │   ├── auth/[...all]/route.ts # Better-Auth universal
│   │   │   ├── cv/parse/route.ts      # Ingesta resiliente de CVs y títulos (25MB)
│   │   │   ├── presentations/parse/route.ts # Ingesta de documentos para diapositivas (25MB)
│   │   │   └── og/route.tsx     # Generador de Open Graph en Edge con @vercel/og
│   │   ├── c/[slug]/page.tsx    # Vista pública de tarjeta con métricas atómicas
│   │   ├── p/[slug]/page.tsx    # Vista pública interactiva de presentaciones 16:9
│   │   ├── cards/               # Redirección a /dashboard?tab=cards
│   │   ├── cards/new/           # Creador en tiempo real con AppEditorHeader
│   │   ├── cv/                  # Optimizador de Smart CV ATS con AppEditorHeader
│   │   ├── dashboard/           # Panel central unificado con pestañas (/dashboard)
│   │   ├── login/               # Portal de autenticación Google OAuth y Email (/login)
│   │   ├── presentations/       # Estudio cinematográfico 16:9 con AppEditorHeader
│   │   ├── pricing/             # Página comercial con comparativa, FAQ y garantías
│   │   ├── start/               # Onboarding Hub interactivo (Prueba 3 días)
│   │   └── page.tsx             # Landing Page minimalista de 5 secciones con BrandHeroBackdrop
│   ├── features/                # Módulos de lógica de negocio (FSD)
│   │   ├── card-builder/        # Formularios reactivos, dashboard actions y temas
│   │   ├── ai-smart-cv/         # Auditoría heurística ATS y motor vectorial jsPDF
│   │   ├── dashboard/           # UnifiedDashboardView (Tarjetas, CVs y Presentaciones)
│   │   ├── orbital-presentations/ # Estudio 16:9, multi-layout viewer y actions con guardrails
│   │   ├── visual-effects/      # SmartParticles v3.0 anti-colisión acelerado por GPU
│   │   ├── onboarding/          # Grid interactivo de selección de proyectos
│   │   └── pricing/             # Actions de suscripción, FaqAccordion y TrialBanner
│   ├── entities/                # Modelos de dominio y acceso a datos (landing/: contrato Zod de la home minimalista)
│   │   ├── auth/                # Schemas Zod de redirección y Open Redirect guardrail
│   │   ├── card/                # Entidad DigitalCard y temas
│   │   ├── cv/                  # Tipado de Smart CV y contratos
│   │   ├── presentation/        # Schemas Zod de diapositivas y catálogo de plantillas 2026
│   │   ├── schema.ts            # Esquemas Drizzle SQLite (user, session, cards, cvs, presentations)
│   │   └── subscription/        # Tipos de membresía y entitlements
│   └── shared/                  # Primitivas transversales reutilizables
│       ├── api/db.ts            # Cliente unificado Turso LibSQL (dual local/nube)
│       ├── lib/auth.ts          # Configuración Better-Auth
│       ├── lib/session.ts       # Guardrail de seguridad multi-tenant para Server Actions
│       ├── lib/fileSecurity.ts  # Validación Magic Bytes, Anti-DoS y Cero Persistencia Binaria en BD
│       ├── lib/clientDocumentExtractor.ts # Extracción de texto PDF en navegador (anti-413)
│       ├── lib/imageCompression.ts # Compresión client-side WebP / Canvas 2D
│       └── ui/                  # UI Kit (GlobalNavbar, BrandHeroBackdrop, BrandLogo, MobileNavDrawer)
├── AGENTS.md                    # Guía corporativa de orquestación agéntica (FSD, WCAG, Base-8)
└── SECURITY.md                  # Política de seguridad y reporte de vulnerabilidades
```

### Tecnologías & Estándares Clave:
- **Framework**: [Next.js 16 (Turbopack)](https://nextjs.org/) con React 19 y Server Actions tipadas.
- **Base de Datos**: [Turso (LibSQL Serverless SQLite)](https://turso.tech/) con soporte dual: `file:local.db` (desarrollo local offline sin Docker) y conexión HTTP distribuida en la nube.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) con validación de esquemas Zod y migraciones declarativas.
- **Estilos & Diseño**: Tailwind CSS v4 con espacio de color **OKLCH**, modo oscuro nativo, acabados Glassmorphism 2.0 y retícula matemática **Base 8**.
- **Ergonomía Móvil & Accesibilidad**: Directrices WCAG 2.2 AA con touch targets mínimos de **$44\text{px}$** y optimización para el pulgar (**Thumb Zone**).
- **Motor Visual**: `SmartParticles v3.0` con aceleración GPU (`will-change: transform, opacity`) y zonas seguras anti-colisión.
- **Autenticación**: [Better-Auth](https://better-auth.com/) montado sobre Drizzle SQLite (sesiones seguras HttpOnly).
- **Testing Unitario**: [Vitest](https://vitest.dev/) con suite exhaustiva de esquemas, seguridad y algoritmos ATS.

---

## 📚 Documentación Técnica y Gobernanza

La documentación del proyecto se encuentra estructurada y sincronizada en el directorio [`/docs`](docs/):

- 🏛️ [Blueprint de Arquitectura 2026](docs/architecture/BLUEPRINT_2026.md): Visión técnica, rendimiento perimetral y stack serverless.
- 📄 [Especificación de Motor de CV & ATS](docs/specifications/SMART_CV_ENGINE.md): Procesamiento documental IDP, fórmulas Google XYZ y cumplimiento EU AI Act.
- 📽️ [Especificación de Motor de Presentaciones 2026](docs/specifications/ORBITAL_PRESENTATIONS_ENGINE_2026.md): AST semántico, heurísticas de layout, McKinsey SCQA y telemetría edge.
- 🤖 [Guía de Agentes y Convenciones de Código](AGENTS.md): Reglas de arquitectura FSD, seguridad en Server Actions y flujo de trabajo.
- 🔒 [Política de Seguridad](SECURITY.md): Prácticas de aislamiento multi-tenant y reporte responsable de vulnerabilidades.
- 📜 [Archivo Histórico (RFC Fase 1 - Supabase)](docs/archive/RFC_LEGACY_SUPABASE.md): Registro archivado de la propuesta de base de datos previa.

---

## 🧪 Pruebas Unitarias y Calidad

El proyecto cuenta con una suite automatizada de pruebas unitarias con **Vitest**:

```bash
# Ejecutar todas las pruebas unitarias
npm test

# Modo observador (Watch Mode)
npm run test:watch

# Verificación estricta de tipos TypeScript
npm run typecheck
```

Las pruebas validan de forma continua:
1. La integridad de esquemas de datos Zod y restricciones de slugs.
2. Los contratos de datos de currículums y la mitigación de alucinaciones (`needs_metric`).
3. El motor heurístico y ponderación algorítmica de puntaje ATS.
4. Las reglas comerciales de suscripción y 3 días de prueba.
5. El aislamiento multi-tenant y bloqueo de llamadas no autorizadas en producción.
6. El flujo CRUD de Smart CV, persistencia multi-tenant anti-IDOR y renderizado vectorial A4 justificado (DIN EN ISO 216).
7. El sistema de identidad visual corporativa unificada, contratos Zod de marca, logotipo viviente por video loop WebM/MP4, integridad física de assets y guardrails de peso (<45 KB en WebP y <80 KB en video).

---

## 🛠️ Puesta en Marcha Local

### Prerrequisitos:
- [Node.js](https://nodejs.org/) v20.18 o superior.
- Gestor de paquetes `npm` o `pnpm`.

### 1. Clonar el repositorio
```bash
git clone https://github.com/Soyindi/Soy-Indi.git
cd Soy-Indi
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
El proyecto incluye soporte local out-of-the-box con SQLite local (`local.db`):
```bash
cp .env.example .env.local
```

### 4. Ejecutar migraciones y sembrado de datos (Turso LibSQL)
```bash
npm run db:migrate
npm run db:seed
```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la plataforma en vivo.

---

## ☁️ Guía de Despliegue en Vercel & Google OAuth (Producción Multi-Cuenta)

INDI está 100% optimizado para desplegarse en **Vercel** con rendimiento perimetral sub-milisegundo gracias a Turso LibSQL Serverless y Better-Auth.

### 1. Variables de Entorno Requeridas en Vercel Dashboard
En la sección **Project Settings > Environment Variables** de tu proyecto en Vercel, agrega:

| Variable | Descripción / Origen | Ejemplo |
| :--- | :--- | :--- |
| `TURSO_DATABASE_URL` | Endpoint de tu base de datos Turso Cloud distribuida | `libsql://soyindi-soyindi.aws-us-west-2.turso.io` |
| `TURSO_AUTH_TOKEN` | Token de autenticación de Turso generado con `turso db tokens create` | `eyJhbGciOi...` |
| `BETTER_AUTH_SECRET` | Clave secreta criptográfica (mínimo 32 caracteres) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL canónica de producción en Vercel | `https://indi.bio` o `https://tu-proyecto.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Misma URL pública para el cliente React | `https://indi.bio` o `https://tu-proyecto.vercel.app` |
| `GOOGLE_CLIENT_ID` | Client ID obtenido en Google Cloud Console | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret obtenido en Google Cloud Console | `GOCSPX-xxxxxxxxxxxxx` |
| `NVIDIA_API_KEY` | Clave de API de NVIDIA NIM para inferencia de IA | `nvapi-...` |

### 2. Configurar Google Cloud Console (OAuth 2.0)
1. Ve a [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services > Credentials**.
2. Crea unas nuevas credenciales de tipo **OAuth 2.0 Client ID** (Web Application).
3. En **Authorized JavaScript origins**, añade:
   - `http://localhost:3000` (desarrollo local)
   - `https://tu-proyecto.vercel.app` (preview Vercel)
   - `https://indi.bio` (dominio de producción)
4. En **Authorized redirect URIs**, añade la ruta oficial de callback de Better Auth:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://tu-proyecto.vercel.app/api/auth/callback/google`
   - `https://indi.bio/api/auth/callback/google`
5. Guarda y copia el **Client ID** y **Client Secret** en las variables de entorno de Vercel.

---

## ⚡ Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo local con Turbopack en el puerto 3000.
- `npm run build`: Compila la aplicación para producción verificando tipos TypeScript estrictos.
- `npm run start`: Inicia el servidor de producción.
- `npm test`: Ejecuta la suite de pruebas unitarias con Vitest (170 pruebas en 26 suites).
- `npm run typecheck`: Valida el tipado estricto de TypeScript en todo el proyecto (`tsc --noEmit`).
- `npm run db:generate`: Genera archivos de migración SQL basados en el esquema de Drizzle.
- `npm run db:migrate`: Aplica las migraciones declarativas sobre la base de datos Turso LibSQL (Local o Nube).
- `npm run db:seed`: Siembra datos iniciales de demostración (Usuario demo, Tarjeta digital, Smart CV, Presentación).
- `npm run db:studio`: Abre la interfaz visual de Drizzle Studio para explorar tablas y registros en vivo.

---

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la licencia MIT.

---

<div align="center">
  <b>Diseñado con pasión para Punta Arenas y toda Latinoamérica • INDI 2026</b>
</div>
