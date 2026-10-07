<div align="center">

# 🌐 INDI Platform (2026 SaaS)
### **Ecosistema de Identidad Digital, Networking Profesional & Suite Todo-en-Uno**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-304_Passing-success?style=for-the-badge&logo=vitest)](#-pruebas-unitarias-y-calidad)
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

Cuenta con la matriz comercial **"El Semestre Irresistible"**:
- **Plan Starter 🟢**: $2.500 CLP/mes o $6.000 CLP/semestre ($1.000 CLP/mes, 60% OFF).
- **Plan Pro 🔵 (Recomendado)**: $4.990 CLP/mes o $15.000 CLP/semestre ($2.500 CLP/mes, 50% OFF, marca 100% blanca).
- **Plan Max 🟣**: $8.990 CLP/mes o $29.990 CLP/semestre (~$4.990 CLP/mes, 44% OFF, volumen ilimitado).

---

## 🚀 Características Principales

### 1. 📇 Tarjetas Digitales de Presentación (Glassmorphism 2.0 & Living Identity)
- **Compresión Client-Side WebP (Ultra-Ligera & Cero Latencia)**: Pipeline de compresión de imágenes directo en el navegador con HTML5 Canvas y WebP (`compressImageClient`). Reduce hasta un 85% el peso de avatares y fotos antes de enviarse, con feedback en tiempo real y touch targets ergonómicos $\ge 44\text{px}$.
- **Gestión Multi-Tarjeta Independiente & Flujo de Edición**: Crea múltiples identidades digitales independientes para diferentes negocios o roles profesionales. Edición bidireccional segura (`/cards/new?id=...`) con guardrails multi-tenant anti-IDOR.
- **Generación Dinámica Anti-Colisión de Enlaces**: Algoritmo generador de identificadores únicos para tarjetas nuevas que previene reemplazos accidentales de tarjetas existentes.
- **Presets de Diseño Curados (Gamas Claras y Oscuras)**: 7 arquetipos de diseño (*Opal Light Prism*, *Aurora Lumina*, *Cyber Nebula*, *Executive Titanium*, *Emerald Botanical*, *Solar Obsidian*, *Swiss Monochrome*) con paletas OKLCH y Gamut P3 de ultra contraste.
- **Acabados de Material Fotónicos & Texturas**: Acabados *Opal Light Glass*, *Aurora Lumina*, *Classic Glass*, *Holographic*, *Titanium*, *Obsidian* y *Minimal*, combinados con texturas *Prisma Escarchado* (`frosted-prism`), *Dot Grid* y *Resplandor Radial* reactivo.
- **Motor de Contraste Perceptual WCAG 2.2 AA**: Cálculo algorítmico de luminancia W3C y conversor matemático OKLCH a sRGB (`oklchToRgb`, `meetsWcagAaContrast`) para garantizar texto nítido y legible ($\ge 4.5:1$) en cualquier acabado claro u oscuro.
- **SmartParticles v3.0 Fotónico**: Lente especular asimétrica con caja de sombra y halo cáustico volumétrico acelerado por GPU (`will-change: transform, opacity`).
- **Asistente de Biografía con IA Multi-Tono**: Generación instantánea de bios con IA en 3 registros profesionales (*Ejecutivo*, *Innovador*, *Cercano*) directamente en el editor.
- **Ubicación & Mapa Interactivo (Privacy-First)**: Módulo de geolocalización con visor OpenStreetMap embebido (sin API keys) y accesos directos One-Tap a Google Maps y Waze.
- **Perfil Profesional Vivo**: Nombre, especialidad, biografía, enlaces a redes sociales y contacto directo.
- **Botón Guardar Contacto con Foto a Pantalla Completa (vCard 4.0 / RFC 6350)**: Descarga instantánea de archivo `.vcf` con resolución asíncrona de imagen en Base64 (`PHOTO;ENCODING=b;TYPE=JPEG:`), integrando la fotografía del usuario para que la agenda de iOS/Android la despliegue a pantalla completa durante llamadas telefónicas.
- **Bloques Bento Modulares**: Vitrina interactiva para destacar proyectos, métricas cuantitativas (+150 clientes, +25% YoY), enlaces externos y testimonios.
- **Botón de WhatsApp con Tipografía de Alta Estética**: Mensaje estilizado con formato Markdown (*negrita*, _cursiva_, separadores visuales) que levanta en 1 toque la tarjeta con foto y datos verídicos.
- **Código QR Dinámico Integrado**: Listo para escanear en pantalla, imprimir en stickers o proyectar.
- **Web Share Modal Háptico & Selector de Tonos**: Diálogo accesible WCAG 2.2 AA con vibración háptica (`navigator.vibrate`), selector de estilo de mensaje (*Networking*, *Comercial*, *Directo*), fallback seguro al portapapeles y canales de un toque para WhatsApp Web, LinkedIn y X (Twitter).
- **Favicon Vectorial de Clase Mundial (`src/app/icon.svg`)**: Isotipo canónico del Alien futurista de INDI vectorizado con nodo orbital superior, ojos angulados y adaptación bimodal automática (`@media (prefers-color-scheme: dark/light)`).
- **Inteligencia de Posicionamiento SEO & JSON-LD (`Schema.org`)**: Inyección estricta de datos estructurados para Google Rich Snippets: entidades `Organization`, `WebSite` y `FAQPage` en la Home, `ProfilePage` + `Person` en `/c/[slug]`, y `DigitalDocument` en `/cv/[slug]`.
- **Open Graph Dinámico con Safe Zone 1:1 (`/api/og`)**: Generador perimetral Edge ($1200\times630\text{ px}$) con zona central protegida ($630\times630\text{ px}$) para evitar recortes en feeds y chats de WhatsApp, Instagram y Telegram, complementado con auras volumétricas OKLCH y caché de alto rendimiento (`s-maxage=86400`).
- **Copywriting Persuasivo Contextual (AIDA, Hook-Story-Offer, Curiosity Gap)**: Redacción inteligente con UTMs canónicos y atribución de afiliados integrada en un clic.
- **Cabeceras Públicas Adaptativas & Logotipo Horizontal Cinemático**: Las vistas públicas (`/c/[slug]`, `/cv/[slug]`, `/p/[slug]`) incorporan el lockup horizontal con micro-video loop oficial (`<BrandLogo variant="horizontal" size="sm" />`), aportando legibilidad corporativa, integración con la acción contextual del visitante y touch targets $\ge 44\text{px}$.
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
- **Extracción Robusta de Referencias Laborales & Guardrail Anti-Swallow**: Parser determinista y multimodal con IA que extrae íntegramente las referencias personales y de trabajo (Nombre, Cargo, Institución y Teléfono/Email) tanto en bloques monolínea como multilínea. Incorpora un guardrail anti-absorción que evita que una referencia devore los contactos de los referentes siguientes cuando el PDF no incluye viñetas explícitas.
- **Auditoría Algorítmica (0 a 100)**: Evalúa estructura, densidad de palabras clave, impacto de métricas y longitud para superar filtros de software de Recursos Humanos (ATS).
- **Feedback Accionable & Mitigación de Alucinaciones**: Detección de logros sin números (`needs_metric`) según estándares Google XYZ y requerimientos de transparencia de la EU AI Act.

### 3. 📽️ Orbital Presentations Pro (16:9)
- **Persistencia Independiente & Zero Template Shadowing**: Precedencia estricta de base de datos en `/p/[slug]`. Las presentaciones personalizadas de los usuarios tienen prioridad absoluta sobre los templates estáticos por defecto.
- **Gestión Visual de Metadatos & Slugs Dinámicos**: Control en vivo del título y enlace de acceso (`/p/[slug]`) en `PresentationStudio`, con generador automático de sufijos únicos anti-colisión (`generatePresentationSlug`), botón de copiado rápido y regeneración.
- **Separación Robusta Modo Edición vs Creación**: Server Action `upsertPresentationAction` protegida contra sobrescritura silenciosa con validación de identificador primario inmutable (`/presentations?id=...`) y guardrails anti-IDOR.
- **Efectos Cinemáticos & Aura Ambiental Reactiva**: Transiciones fluidas (*Crossfade*, *Slide Keynote*, *Zoom Focus*), auras volumétricas perimetrales (*Backdrop Aura* acelerada por GPU) y modos tipográficos (*Modern Sans*, *Editorial Serif*, *Técnica Mono*).
- **Estudio Cinemático Profesional**: Diapositivas interactivas en relación 16:9 para reuniones de alto impacto, conferencias y videollamadas.
- **Copiloto Granular de IA por Diapositiva (`SlideAiAssistant`)**: Asistente integrado en el editor con touch targets $\ge 44\text{px}$ para optimizar la diapositiva en un toque: genera *Action Titles* ejecutivos (<14 palabras), viñetas de impacto con verbos de acción y guion oral para el presentador (~45-60s).
- **Orquestador Resiliente Multi-Proveedor de IA**: Enrutamiento inteligente con failover automático de 3 capas (NVIDIA NIM ➔ Google Gemini 1.5 Flash ➔ OpenRouter ➔ Motor Heurístico Determinista local) que garantiza alta disponibilidad en todo entorno.
- **Ingesta Exhaustiva de Métricas Cuantitativas & Documentos**: Analizador semántico con soporte para magnitudes monetarias ($/USD/CLP/EUR/UF), deltas (+/-), ratios (4.5x), tráfico (req/s) y cronogramas por fases.
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
- **Arquitectura Zero Redundancy & Command Center**: Unifica en una sola barra de herramientas armónica las pestañas de entidad (*Tarjetas*, *Smart CVs*, *Presentaciones*), el buscador universal con atajo de teclado (`Ctrl + K` / `/`) y la acción primaria de creación 100% contextualizada.
- **Empty States Inductivos & Guiados (`DashboardEmptyState`)**: En lugar de contenedores vacíos estáticos, ofrece guías de inducción progresiva en 3 pasos por vertical con botones magnéticos de acción inmediata.
- **Ergonomía Móvil Thumb Zone & Floating Action Bar**: En dispositivos móviles ($\le 640\text{px}$), ancla una barra inferior flotante con touch target $\ge 48\text{px}$ para crear recursos con una sola mano.
- **Métricas Atómicas Adaptativas**: Monitoreo de Visitas Edge, clicks en WhatsApp, vCard descargadas y Tasa de Conversión (%) con protección anti-división por cero y feedback orientativo en cuentas nuevas.
- **Navegación Bidireccional Contextual & Branding Oficial (`AppEditorHeader`)**: Cabecera universal enriquecida con el Isotipo Oficial INDI en video loop, breadcrumb contextual (`Panel > Entidad`) y botón ergonómico *"← Volver al Panel"* ($\ge 44\text{px}$) que devuelve al usuario a su pestaña correspondiente (`?tab=cvs`, `?tab=presentations` o `?tab=cards`).

### 5. 🧭 Navegación Global Reactiva & Scroll Fluido
- **Barra Sticky Glassmorphic (`GlobalNavbar.tsx`)**: Fijada al tope con `backdrop-blur-xl bg-zinc-950/80` y enlaces directos al panel (`/dashboard`), editores de producto o anclas contextuales de la landing page.
- **Retorno Ergonómico al Inicio (`/#inicio`)**: Logotipo interactivo con retorno al ancla superior en un toque, eliminando cortes o bloqueos de scroll (`overflow-hidden` desacoplado a luces perimetrales).
- **Desplazamiento Suave Accesible**: Configuración nativa `scroll-behavior: smooth` y compensación de altura fija (`scroll-padding-top: 5rem`), con compatibilidad automática para usuarios con `prefers-reduced-motion`.

### 6. 🎨 Identidad Visual Corporativa Unificada & Brand Showcase (WebP First)
- **Pipeline de Transcodificación WebP & Video Nativo**: Reducción drástica del payload visual mediante variantes multi-resolución de alta densidad y video nativo ultra-liviano (<56 KB WebM / <67 KB MP4).
- **HeroBrandIdentity & Zero-Box Masking**: Erradicación definitiva de cajas cuadradas rígidas en la portada y precargas mediante máscara radial fotónica (`mask-image: radial-gradient(circle at center, black 60%, transparent 95%)`), fundiendo el video profesional del logo suavemente con el fondo cósmico sin artefactos de recorte.
- **Experiencia de Precarga Cinemática (`SmartPreloader`)**: Pantalla de carga universal con Streaming SSR en `loading.tsx` para `/c/[slug]`, `/cv/[slug]`, `/p/[slug]` y app global. Monta el video oficial con pulso bioluminiscente, micro-barra fotónica y fallback vectorial accesible WCAG 2.2 AA.
- **Sincronización de Viewport y Ergonomía Móvil**: Definición de `viewport` con `themeColor: '#080A12'` en `layout.tsx` para evitar contrastes o parpadeos en barras de navegación móvil, y contenedores con `min-h-dvh` y `overflow-x-hidden` para preservar la interfaz de usuario en iOS y Android.
- **Logotipo Animado Viviente Tight-Crop 3:2 (`<BrandLogo />`)**: Primitiva universal con soporte nativo de video loop en encuadre ceñido 3:2 y contenedores orgánicos desvanecidos con bordes translúcidos y cero cajas negras rígidas.
- **Unificación Transversal del Ecosistema**: Reemplazo absoluto de marcadores de texto o SVGs dispersos en `GlobalNavbar`, `MobileNavDrawer`, `UnifiedDashboardView`, `login` y `start`.

### 7. 🚪 Onboarding Hub Guiado & Switchboard Sistémico (`/start`)
- **Distribuidor de Tráfico Post-Registro**: Intercambiador de tráfico que conduce al usuario a su primera victoria rápida (*First Value* en 2 a 4 minutos) categorizado según su intención de negocio (*Networking*, *Postulación Laboral*, *Pitches & Clientes*).
- **Dual Layout Móvil/Escritorio**: Visualización en bento grid de 3 columnas para pantallas de escritorio y soporte de carrusel horizontal con `snap-x snap-mandatory` en smartphones para una selección táctil ágil sin fatiga de scroll vertical.
- **Touch Targets Ergonómicos & Válvula de Escape**: Botones de acción principales $\ge 48\text{px}$ y enlace prominente de salto al Dashboard General para usuarios recurrentes.

### 8. 💸 Programa de Afiliados, Liquidaciones Quincenales y Panel Admin (`/admin`)
- **25% de Comisión Recurrente en CLP**: Gana el 25% de comisión ($625 CLP mensual / $1.500 CLP semestral) por cada usuario que se registre con tu enlace (`indi.bio/start?ref=CODIGO`) y complete su suscripción en Mercado Pago.
- **Códigos Personalizables en Tiempo Real**: Todo usuario recibe un código automático al registrarse y puede personalizarlo en cualquier momento desde su panel por uno memorable (`indi.bio/start?ref=mi-marca`) con validación en vivo y protección de rutas del sistema.
- **Atribución Automatizada & Sticky con Cookie First-Party**: Atribución transparente en el onboarding mediante parámetros `?ref=CODIGO` y persistencia de cookie de 30 días (`indi_ref_code`), protegiendo de pérdidas si el visitante navega antes de registrarse.
- **Enlaces Duales de Afiliados (Hub vs Registro Directo)**: El creador puede copiar con 1 clic su enlace al Hub (`soyindi.cl/start?ref=CODIGO`) o directo al formulario de registro (`soyindi.cl/login?mode=signup&ref=CODIGO`).
- **Analíticas de Conversión Pro en Vivo**: Desglose transparente en el panel de afiliados: usuarios en prueba (`TRIAL`), convertidos a Plan Pro (`ACTIVE`), tasa de conversión (%) y saldo acumulado por pagar.
- **Experiencia de Bienvenida Contextual (`ReferralWelcomeBanner`)**: Detección del referente y despliegue de badge visual de confirmación de acceso VIP en el Onboarding Hub (`/start`) y formulario de registro (`/login`).
- **Abono Quincenal a Cuentas Chilenas**: Módulo de datos bancarios para transferencia directa a Cuenta RUT, Cuenta Vista, Corriente o Ahorro en los principales bancos de Chile, con validador de RUT algoritmo Módulo 11.
- **Seguridad Criptográfica & Anti-Gaming**: Verificación de firmas HMAC-SHA256 (`x-signature`) en webhooks de Mercado Pago, heurística anti-auto-referidos con normalización de correos (`+alias` y puntos en Gmail) y reversión atómica de comisiones ante reembolsos/contracargos.
- **Panel de Administración (`/admin`)**: Vista dual con auditoría en tiempo real de usuarios referidos (`TRIAL` y `ACTIVE`), consolidado quincenal de liquidaciones pendientes (días 1 y 15), detalle bancario con copia en 1 clic y confirmación de pago transferido.

---

## 💎 Modelo Comercial Inteligente & Minimalista

INDI implementa un modelo **Todo-en-Uno sin restricciones ocultas ni sistemas artificiales de créditos**:

| Plan | Inversión (CLP / USD) | Cuotas y Beneficios Clave |
| :--- | :--- | :--- |
| **Prueba Gratuita** | **Gratis 3 Días** (Sin tarjeta requerida) | Acceso total a los 3 productos (Tarjetas, Métricas, CV, Presentaciones) para probar la suite completa. |
| **Plan Starter (🟢)** | **$2.500 CLP / mes** o **$6.000 semestral** (60% OFF) | Hasta 3 tarjetas, 1 Smart CV ATS, 2 presentaciones 16:9, copiloto IA y **sin marca de agua** (calidad profesional limpia). |
| **Plan Pro (🔵 Recomendado)** | **$4.990 CLP / mes** o **$15.000 semestral** (50% OFF) | Hasta 10 tarjetas, 5 Smart CVs, 10 presentaciones, analíticas completas, IA Fast-lane y 100% marca blanca. |
| **Plan Max (🟣)** | **$8.990 CLP / mes** o **$29.990 semestral** (44% OFF) | Tarjetas, CVs y presentaciones ilimitadas, métricas avanzadas, modelos NVIDIA NIM Llama 3.3/DeepSeek y soporte VIP. |

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
├── tests/unit/                  # Suite de pruebas unitarias (Vitest - 278 tests pasando al 100%)
│   ├── affiliates-and-payouts.test.ts # Módulo 11 RUT, códigos de referido y liquidaciones
│   ├── auth-flow.test.ts        # Validación de flujo de login, Open Redirect guardrail y sanitización
│   ├── systemic-navigation-audit.test.ts # Auditoría de navegación sistémica y CTAs públicos a login
│   ├── oauth-multi-tenant.test.ts # Aislamiento multi-tenant y Google OAuth
│   ├── card-schema.test.ts      # Validación Zod de tarjetas de presentación
│   ├── cv-schema.test.ts        # Contratos de datos CV y guardrails EU AI Act
│   ├── presentation-schema.test.ts # Contratos de diapositivas, layouts y plantillas
│   ├── presentation-heuristics.test.ts # Motor heurístico determinista y Principio de Pirámide
│   ├── ats-audit.test.ts        # Motor algorítmico de scoring ATS
│   ├── entitlements.test.ts     # Planes comerciales y 3 días de prueba
│   ├── r2-upload.test.ts        # Subida segura de imágenes a Cloudflare R2 con Magic Bytes
│   ├── telemetry-route.test.ts  # Telemetría perimetral desacoplada y protección anti-inflación
│   ├── document-upload-routes.test.ts # Handlers nativos HTTP de subida de archivos (25MB)
│   ├── file-security-pipeline.test.ts # Magic bytes, anti-malware, anti-DoS y cero persistencia binaria
│   └── security-guardrails.test.ts # Protección multi-tenant de Server Actions
├── src/
│   ├── app/                     # Next.js 16 App Router (Rutas y Edge Handlers)
│   │   ├── api/                 # Handlers de Autenticación, Subidas y Open Graph
│   │   │   ├── auth/[...all]/route.ts # Better-Auth universal
│   │   │   ├── cv/parse/route.ts      # Ingesta resiliente de CVs y títulos (25MB)
│   │   │   ├── presentations/parse/route.ts # Ingesta de documentos para diapositivas (25MB)
│   │   │   ├── upload/image/route.ts  # Ingesta de fotos hacia Cloudflare R2 ($0 Egress)
│   │   │   ├── telemetry/view/route.ts # Telemetría de visitas asíncrona sin romper ISR
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
│   │   └── page.tsx             # Landing Page minimalista de 5 secciones con BrandHeroBackdrop zero-media (halo CSS, sin póster/video)
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
8. La arquitectura de base de datos Turso LibSQL: línea base de 11 tablas (`user`, `session`, `account`, `verification`, `cards`, `card_events`, `smart_cvs`, `presentations`, `payments_history`, `affiliate_bank_accounts`, `affiliate_commissions`), sincronización de migraciones y contratos JSON fuertemente tipados.
9. La gobernanza de referidos y auditoría en `/admin`: captura de cookies Edge First-Party (`indi_ref_code`), erradicación de consultas N+1 con batching `inArray`, sincronización en tiempo real y liquidaciones quincenales (25% CLP).

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

| Variable | Propósito | Ejemplo / Valor Recomendado |
| :--- | :--- | :--- |
| `TURSO_DATABASE_URL` | Endpoint de tu base de datos Turso Cloud distribuida | `libsql://soyindi-soyindi.aws-us-west-2.turso.io` |
| `TURSO_AUTH_TOKEN` | Token de autenticación de Turso generado con `turso db tokens create` | `eyJhbGciOi...` |
| `BETTER_AUTH_SECRET` | Clave secreta criptográfica (mínimo 32 caracteres) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL canónica de producción en Vercel | `https://soyindi.cl` |
| `NEXT_PUBLIC_APP_URL` | Misma URL pública para el cliente React | `https://soyindi.cl` |
| `ADMIN_EMAILS` | Lista de correos autorizados para gestionar liquidaciones en `/admin` | `soyindi.cl@gmail.com,psmatrique@gmail.com,matiricardoo@gmail.com` |
| `GOOGLE_CLIENT_ID` | Client ID obtenido en Google Cloud Console | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret obtenido en Google Cloud Console | `GOCSPX-xxxxxxxxxxxxx` |
| `NVIDIA_API_KEY` | Clave de API de NVIDIA NIM para inferencia de IA | `nvapi-...` |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acceso de producción de Mercado Pago | `APP_USR-...` |
| `MERCADOPAGO_PUBLIC_KEY` | Clave pública de Mercado Pago | `APP_USR-...` |
| `MERCADOPAGO_CLIENT_ID` | Client ID de la integración de Mercado Pago | `7318955796450757` |
| `MERCADOPAGO_CLIENT_SECRET` | Client Secret de la integración de Mercado Pago | `uKLwObXXrKbfcQOh...` |

### 2. Configurar Webhook IPN en Mercado Pago Developers
1. Ve a tu aplicación en [Mercado Pago Developers](https://www.mercadopago.cl/developers/panel/app).
2. En la sección **Webhooks / Notificaciones IPN**, agrega tu URL pública de producción:
   - `https://soyindi.cl/api/webhooks/mercadopago`
3. Selecciona el evento **Pagos (`payment`)**.

### 3. Configurar Google Cloud Console (OAuth 2.0 & Pantalla de Consentimiento)
1. Ve a [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services > OAuth consent screen (Pantalla de consentimiento de OAuth)**.
   - **App name**: INDI (o Soyindi).
   - **User support email**: tu email de contacto corporativo.
   - **Authorized domains**: agrega obligatoriamente `soyindi.cl` (elimina cualquier referencia a `vercel.app`).
   - **Application home page**: `https://soyindi.cl`
   - **Application privacy policy link**: `https://soyindi.cl` (o enlace a política).
   - **Application terms of service link**: `https://soyindi.cl`
2. Ve a **APIs & Services > Credentials**.
3. Crea o edita las credenciales de tipo **OAuth 2.0 Client ID** (Web Application).
4. En **Authorized JavaScript origins**, añade únicamente:
   - `http://localhost:3000` (desarrollo local)
   - `https://soyindi.cl` (dominio de producción oficial)
   *(Elimina subdominios `*.vercel.app` para que Google no muestre la URL de Vercel en el diálogo de inicio de sesión)*.
5. En **Authorized redirect URIs**, añade:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://soyindi.cl/api/auth/callback/google`
6. Guarda y asegúrate de que en Vercel Dashboard las variables `BETTER_AUTH_URL` y `NEXT_PUBLIC_APP_URL` estén configuradas como `https://soyindi.cl`.


---

## ⚡ Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo local con Turbopack en el puerto 3000.
- `npm run build`: Compila la aplicación para producción verificando tipos TypeScript estrictos.
- `npm run start`: Inicia el servidor de producción.
- `npm test`: Ejecuta la suite de pruebas unitarias con Vitest (288 pruebas en 46 suites al 100% PASS).
- `npm run typecheck`: Valida el tipado estricto de TypeScript en todo el proyecto (`tsc --noEmit`).
- `npm run db:generate`: Genera archivos de migración SQL basados en el esquema de Drizzle.
- `npm run db:migrate`: Aplica las migraciones declarativas sobre la base de datos Turso LibSQL (Local o Nube).
- `npm run db:seed`: Siembra datos iniciales de demostración (Usuario demo, Tarjeta digital, Smart CV, Presentación).
- `npm run db:studio`: Abre la interfaz visual de Drizzle Studio para explorar tablas y registros en vivo.

---

## 📚 Documentación Técnica & Especificaciones de Arquitectura

- **Blueprint Maestro de Arquitectura**: [docs/architecture/BLUEPRINT_2026.md](docs/architecture/BLUEPRINT_2026.md)
- **Protocolo de Orquestación Agéntica**: [AGENTS.md](AGENTS.md)
- **Protocolo Canónico Prompt-to-Push 2026**: [docs/specifications/AGENT_ORCHESTRATION_PROMPT_2026.md](docs/specifications/AGENT_ORCHESTRATION_PROMPT_2026.md)
- **Prompt Maestro de Deep Research Visual, Favicon, SEO & CEO (JSON Spec)**: [docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.json](docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.json) / [Guía Markdown](docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.md)
- **Motor de Afiliados y Crecimiento Serverless**: [docs/specifications/AFFILIATE_NETWORK_ENGINE_2026.md](docs/specifications/AFFILIATE_NETWORK_ENGINE_2026.md)
- **Motor de Presentaciones Orbitales IA**: [docs/specifications/ORBITAL_PRESENTATIONS_ENGINE_2026.md](docs/specifications/ORBITAL_PRESENTATIONS_ENGINE_2026.md)
- **Motor ATS & Smart CV Unificado**: [docs/specifications/SMART_CV_ENGINE.md](docs/specifications/SMART_CV_ENGINE.md)

---

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la licencia MIT.

---

<div align="center">
  <b>Diseñado con pasión para Punta Arenas y toda Latinoamérica • INDI 2026</b>
</div>
