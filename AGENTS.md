<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🤖 Guía Corporativa de Orquestación y Desarrollo Agéntico: INDI 2026

Bienvenido al repositorio de **INDI (Soyindi)**. Este documento establece los estándares de ingeniería de software, arquitectura y seguridad que **todos los agentes de Inteligencia Artificial y desarrolladores** deben acatar sin excepción.

---

## 🏛️ 1. Arquitectura de Software: Feature-Sliced Design (FSD)

El código fuente en `src/` está organizado bajo una jerarquía unidireccional estricta. **Las capas superiores solo pueden importar de las capas inferiores; nunca en sentido inverso:**

```
src/
├── app/        # 1. Enrutador Next.js App Router (Rutas públicas, páginas y Edge Handlers)
├── features/   # 2. Lógica de negocio interactiva (hooks, componentes UI específicos y Server Actions)
├── entities/   # 3. Modelos de dominio y contratos (Drizzle Schemas, Zod schemas y types de entidades)
└── shared/     # 4. Primitivas reutilizables agnósticas (db client, session guardrails, UI Kit)
```

### Reglas de Dependencias FSD:
- `features/` NUNCA debe importar de otra `features/`. Si dos módulos comparten lógica, debe extraerse a `entities/` o `shared/`.
- `entities/` NUNCA debe importar de `features/` ni de `app/`.
- `shared/` NUNCA debe importar de capas superiores.

---

## 🛡️ 2. Seguridad en Server Actions & Multi-Tenancy

1. **Guardrail de Sesión Obligatorio:**
   - Ninguna Server Action que realice mutaciones (crear, editar, eliminar) o listados de recursos de usuario puede interactuar directamente con la base de datos sin validar el usuario mediante `getSafeAuthenticatedUserId(userId)` ubicado en `@/shared/lib/session`.
   - En entorno de producción (`NODE_ENV === 'production'`), las acciones anónimas o sin sesión son bloqueadas inmediatamente con error de autorización.
2. **Aislamiento Multi-Tenant Estricto (Tenant-Level Ownership):**
   - Toda consulta de modificación (`UPDATE`, `DELETE`) debe incluir obligatoriamente el predicado compuesto `and(eq(table.id, id), eq(table.userId, targetUserId))` para prevenir vulnerabilidades de referencia directa insegura a objetos (IDOR).
   - En entidades con identificador público único (`slug`), se debe auditar que ningún usuario pueda sobreescribir o reclamar un slug previamente registrado por otra cuenta.
3. **Validación Estricta de Entradas con Zod:**
   - Toda Server Action debe recibir parámetros y validarlos con `schema.safeParse()`.
   - Si la validación falla, retornar `{ success: false, error: ... }` sin exponer trazas de error internas del servidor.
4. **Manejo de Errores Silencioso:**
   - Capturar excepciones con bloques `try/catch` y registrar en consola del servidor antes de responder al cliente.
5. **Autenticación Better-Auth & Google OAuth Multi-Cuenta:**
   - Toda resolución de sesión debe aprovechar `auth.api.getSession({ headers })` en `@/shared/lib/session` de forma transparente.
   - Todo nuevo usuario registrado con Google OAuth o credenciales locales debe recibir automáticamente 3 días de prueba gratuita (`trialEndsAt: Date.now() + 3 días`) y estado `'TRIAL'` mediante el hook `databaseHooks.user.create.before`. Tras dicho período, el acceso a tarjetas digitales, métricas, CV y presentaciones se gestiona mediante la suscripción mensual ($2.500 CLP) o semestral ($6.000 CLP) sin restricción por créditos de uso.
   - Las variables de entorno de producción (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) deben configurarse en Vercel con URIs de redirección autorizadas en Google Cloud Console (`https://soyindi.cl/api/auth/callback/google`).
   - Para que la ventana de inicio de sesión de Google no muestre el subdominio de Vercel (`*.vercel.app`), en Google Cloud Console se debe configurar la **Pantalla de Consentimiento (OAuth consent screen)** con **Authorized Domains** fijado a `soyindi.cl` y la URL de la aplicación a `https://soyindi.cl`, suprimiendo cualquier host de Vercel de la lista de orígenes autorizados.
6. **Protección contra Open Redirect & Flujo de Autenticación Contextual:**
   - Todo endpoint o formulario de autenticación que acepte `callbackUrl` debe validar y sanitizar el valor obligatoriamente mediante `AuthRedirectParamsSchema` o `sanitizeCallbackUrl` ubicado en `@/entities/auth/schemas`.
   - Se prohíben estrictamente URLs absolutas o relativas al protocolo (`//`), permitiendo únicamente rutas relativas internas seguras (`/dashboard`, `/start`).
7. **Guardrail de Experiencia para Sesiones Activas (Zero Redundant Logins):**
   - Si un usuario ya autenticado accede a la página de login (`/login`), debe ser redirigido de inmediato en el servidor mediante `auth.api.getSession({ headers })` hacia el `callbackUrl` validado o hacia su panel (`/dashboard`), previniendo formularios de inicio de sesión redundantes.
   - Los componentes de llamada a la acción públicos (Hero CTA, Pricing CTA, Public Contextual Header, Mobile Drawer) deben consumir reactivamente `useSession()` para adaptar sus enlaces directamente hacia `/start` o `/dashboard`, evitando fricción en la navegación del usuario registrado.
8. **Gobernanza de Dominio Canónico Oficial (`https://soyindi.cl`) & Redirección Edge 308:**
   - Todo tráfico que ingrese por dominios de despliegue por defecto (`*.vercel.app`), dominios legacy (`indi.bio`, `www.indi.bio`) o subdominios `www.soyindi.cl` debe ser redirigido de forma inmediata y permanente mediante `src/middleware.ts` (código HTTP 308) hacia `https://soyindi.cl`, preservando la ruta y parámetros de búsqueda.
   - Toda generación de enlaces públicos, códigos QR, Open Graph (`og:url`, `og:image`), Sitemap (`sitemap.xml`), Robots (`robots.txt`), archivos de contacto vCard 3.0 (`URL;TYPE=INDI_PROFILE:`) y documentos ATS debe consumir el dominio canónico centralizado desde `@/entities/brand/domain` (`getAppBaseUrl`, `buildCanonicalUrl`).
9. **Pasarela de Pagos Mercado Pago SDK v2 & Verificación Anti-Spoofing de Webhooks:**
   - La creación de preferencias de pago se realiza exclusivamente del lado del servidor en Route Handlers dedicados (`/api/checkout/mercadopago`), validando la sesión activa y contratos Zod.
   - En el webhook IPN (`/api/webhooks/mercadopago`), se prohíbe confiar en el cuerpo de la notificación entrante. Es obligatorio consultar la API de Mercado Pago (`paymentClient.get({ id })`) para verificar la autenticidad, monto y estado (`approved`) antes de activar la membresía del usuario o extender `subscriptionEndsAt` en Turso.
   - Toda transacción aprobada se registra para trazabilidad contable en `payments_history`.
10. **Enforcement de Entitlements y Cuotas Cuantitativas en Mutaciones Críticas:**
   - En creaciones nuevas, se valida obligatoriamente la cuota cuantitativa por plan mediante ssertQuotaAvailableAction(targetUserId, resourceType). Si el usuario alcanza el límite de su plan (3/10/∞ tarjetas, 1/5/∞ CVs, 2/10/∞ presentaciones), la creación se detiene elegantemente protegiendo la integridad del contrato comercial frente al SERNAC y normativas de consumo.
   -
   - Toda Server Action de mutación estructural (`upsertCardAction`, `upsertSmartCvAction`, `upsertPresentationAction`) debe ejecutar el guardrail server-side `assertUserEntitlementAction(targetUserId)`. Si el período de prueba o suscripción del usuario ha finalizado (`status === 'EXPIRED'`), la mutación se rechaza de forma atómica y segura con mensaje formal de renovación, previniendo bypass por cliente.
   - El período de prueba cuenta con un desglose temporal exacto en milisegundos (`calculateTimeRemaining`), expuesto reactivamente en el cliente mediante `<TrialCountdownTimer />` (`02d : 14h : 35m : 18s`) con prevención de hydration mismatch, sincronización inmediata ante transiciones a 0 (`onExpire` callback acoplado a `router.refresh()`) y presencia consistente en todas las vistas clave del producto (`/dashboard`, `/cards/new`, `/cv`, `/presentations`). Cumplimiento estricto de accesibilidad WCAG 2.2 AA.
11. **Matriz Comercial Multi-Tier "El Semestre Irresistible" (Starter, Pro, Max) & Política Cero Marca de Agua:**
   - Toda la oferta de planes se rige por el catálogo canónico `PRICING_TIERS` en `@/entities/subscription/types` con 3 niveles escalonados (**Starter 🟢**, **Pro 🔵 Recomendado**, **Max 🟣**) y facturación dual (Mensual / Semestral).
   - Los Route Handlers de checkout (`/api/checkout/mercadopago`) validan contratos Zod fuertemente tipados `{ tier, planInterval }` resolviendo precios en CLP ($2.500/$6.000 Starter, $4.990/$15.000 Pro, $8.990/$29.990 Max). Las comisiones de afiliados se liquidan atómicamente al 25% sobre el valor real cobrado.
   - **Cero Marcas de Agua en Todos los Planes (`hasWatermark: false`)**: Para certificar la máxima calidad y profesionalismo desde el nivel inicial, se suprime cualquier marca de agua invasiva o visible en los recursos generados (Tarjetas Digitales, Smart CV y Presentaciones), entregando un producto pulcro y de estándar corporativo sin restricciones cosméticas degradadas.
12. **Gobernanza de Rendimiento Perimetral (ISR 60s & Telemetría Desacoplada):**
   - Las rutas públicas dinámicas (`/c/[slug]`, `/p/[slug]`, `/cv/[slug]`) deben implementar regeneración estática incremental (`export const revalidate = 60;`) para servirse directamente desde el CDN perimetral, reduciendo en un 99% el consumo de funciones serverless en Vercel.
13. **Conversión Viral & Redirección a Login en Vistas Públicas (`/c/[slug]`, `/cv/[slug]`, `/p/[slug]`):**
   - Cuando un tercero/visitante no autenticado interactúa con una tarjeta digital, Smart CV o presentación orbital pública, todos los enlaces de llamada a la acción ("Crea tu perfil gratis", "Crear mi CV", "Crear Presentación", badges de autoría "CREADO CON INDI") deben dirigir obligatoriamente a la pasarela de autenticación con modo registro y destino contextual (`/login?mode=signup&callbackUrl=...`).
   - Se prohíbe derivar a visitantes no autenticados directamente a rutas desprotegidas o genéricas sin pasar por el onboarding de autenticación. Si el usuario ya cuenta con sesión activa, el sistema le proveerá acceso inmediato a su panel (`/dashboard`).
14. **Motor Perimetral Open Graph 1:1 Safe Zone & WebShareModal Háptico:**
   - La generación dinámica de tarjetas Open Graph (`/api/og`) se ejecuta en el Edge perimetral (`runtime = 'edge'`) con cabeceras `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800`.
   - La retícula de composición $1200\times630\text{ px}$ reserva una **Zona Segura Central 1:1 ($630\times630\text{ px}$)** que concentra la tipografía, logotipo canónico y badges verificados, previniendo recortes visuales en feeds móviles e historias (WhatsApp, LinkedIn, Instagram, X).
   - Los módulos de compartir en vistas públicas (`/c/[slug]`, `/cv/[slug]`, `/p/[slug]`) utilizan `<WebShareModal />` con retroalimentación háptica (`navigator.vibrate`), fallback seguro al portapapeles, enlaces directos a WhatsApp/LinkedIn/X y fórmulas persuasivas de copywriting (`AIDA`, `Hook-Story-Offer`, `Curiosity Gap`) parametrizadas con UTMs canónicos y atribución de afiliados.
15. **Favicon Vectorial Adaptativo (Dark/Light Mode) & Foto de Perfil en vCard 4.0:**
   - La aplicación declara un favicon SVG oficial (`src/app/icon.svg`) que vectoriza fielmente la cabeza alienígena oficial de `BRAND_ASSETS.alienSymbol`, con estilización interna mediante `@media (prefers-color-scheme: dark/light)` para contraste cristalino tanto en temas oscuros como claros del sistema operativo o navegador, acompañado de `apple-touch-icon` en `src/app/layout.tsx`.
   - El generador de vCard (`src/shared/lib/vcard.ts`) admite la resolución e incrustación de fotos de contacto (`PHOTO;ENCODING=b;TYPE=JPEG:`) mediante `downloadVCardWithPhoto`, garantizando que la imagen del usuario se guarde en la agenda telefónica (iOS / Android) con degradación silenciosa y sin bloquear la interacción.
16. **Inteligencia de Posicionamiento SEO & Datos Estructurados JSON-LD (`Schema.org`):**
   - Todas las rutas públicas principales (`/`, `/c/[slug]`, `/cv/[slug]`) deben inyectar esquemas tipados JSON-LD mediante el componente seguro `@/shared/ui/JsonLd` con sanitización de caracteres (`\u003c`) para prevenir inyecciones XSS.
   - La raíz (`src/app/page.tsx`) declara entidades `Organization`, `WebSite` y `FAQPage` para activar Google Rich Snippets interactivos. Las rutas de perfiles (`/c/[slug]`) inyectan `ProfilePage` y `Person` asociando credenciales y enlaces oficiales (`sameAs`), y los currículums (`/cv/[slug]`) inyectan `DigitalDocument` optimizado para rastreadores de empleo y reclutadores.

17. **Gobernanza de Caché Web Pura & Erradicación de Splash Screens de SO (Anti-PWA / Pure Web Model 2026):**
   - Queda estrictamente prohibido solicitar a los usuarios finales que borren manualmente la caché o datos del navegador en ajustes de sus dispositivos móviles (Safari / Chrome).
   - **Supresión Total de PWA / Manifest**: Se prohíbe el uso de `manifest.ts` o directivas `standalone` que induzcan a los sistemas operativos móviles (iOS / Android) a generar splash screens estáticos sintéticos del sistema operativo o a ocultar la barra de navegación del navegador. INDI opera al 100% como una aplicación web responsiva estándar en el viewport nativo del navegador móvil.
   - Toda actualización o cambio de versión de despliegue (`APP_CACHE_VERSION` en `@/shared/lib/cacheGovernance`) se propaga mediante una arquitectura automatizada de 3 capas:
     1. **Edge Middleware & W3C `Clear-Site-Data: "cache"`**: Si un cliente se conecta con una cookie de versión desactualizada o invoca `?purge=1`, el middleware emite `Clear-Site-Data: "cache"`. El motor del navegador purga su memoria de disco de forma transparente sin cerrar la sesión del usuario ni tocar las cookies de Better-Auth.
     2. **Micro-Guard Client-Side en `<head>` (`src/app/layout.tsx`)**: Script inline ultra-ligero que desregistra activamente cualquier Service Worker previo (`navigator.serviceWorker.getRegistrations() -> unregister()`) e invalida `window.caches` (CacheStorage API) en el primer render si `localStorage` detecta una versión obsoleta.
     3. **Cabeceras HTTP RFC 9111 Estratificadas en `next.config.ts`**: Rutas dinámicas públicas con `Cache-Control: public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=300`. Garantiza que el móvil valide frescura antes de reusar caché local mientras el CDN de Vercel sirve en <15ms.

18. **Sistema de Referidos, Generación de Código QR de Afiliado & Omnipresencia:**
   - Todo usuario dispone de acceso a su Código QR oficial de afiliado (`ReferralQrModal.tsx`) generado con `qrcode.react` (`QRCodeSVG`, `ssr: false`), exportable en PNG 1024x1024 con contraste óptico blanco universal para eventos y presentaciones.
   - El enlace de registro directo (`/login?mode=signup&ref=CODIGO`) y Onboarding Hub (`/start?ref=CODIGO`) preservan la atribución sticky mediante la cookie `indi_ref_code` (30 días).
   - El programa de recomendación (25% CLP) se visibiliza de forma omnipresente en:
     - Navegación autenticada (`GlobalNavbar.tsx` y `MobileNavDrawer.tsx`).
     - Pie de página oficial de la landing page (`src/app/page.tsx` FOOTER_LINKS).
     - Preguntas frecuentes y Google Rich Snippets JSON-LD (`FaqAccordion.tsx` y `HOME_STRUCTURED_DATA`).
     - Pestaña dedicada en el panel unificado (`/dashboard?tab=affiliates`).

---

## 🛠️ 6. Catálogo de Recursos Agénticos y Servidores MCP (Tool Orchestration 2026)

Para maximizar el aprovechamiento de los recursos de ingeniería y automatización del entorno, todo agente debe orquestar activamente las siguientes herramientas integradas:

1. **Chrome DevTools MCP (`chrome-devtools-mcp`):**
   - Utilizar para auditorías de rendimiento en tiempo real (Lighthouse Audit), validación de Core Web Vitals (LCP, INP, CLS) y pruebas visuales de contraste WCAG 2.2 AA en componentes interactivos.
2. **Stitch Design System MCP (`StitchMCP`):**
   - Utilizar para la creación, consulta y sincronización de sistemas de diseño, exportación de tokens de interfaz e iteración de componentes UI de alta fidelidad.
3. **Supabase & Database Advisors (`supabase-mcp-server`):**
   - Utilizar para inspección de esquemas relacionales, análisis de advisors de rendimiento, optimización de índices y telemetría de logs.
4. **Skills Agénticas Especializadas:**
   - `flow-and-persistence-audit`: Auditoría de consistencia entre contratos Zod y esquemas Drizzle SQLite.
   - `canonical-domain-audit`: Verificación de redirecciones Edge 308 y gobernanza canónica (`soyindi.cl`).
   - `ui-ux-pro-max` / `frontend-design`: Aplicación de principios de ergonomía visual, retícula Base 8 y jerarquía tipográfica.

---

## 🧪 3. Suite de Pruebas y Control de Calidad (Testing)

El proyecto utiliza **Vitest** como motor de pruebas unitarias.

- **Ubicación:** Todas las pruebas deben residir en `tests/unit/*.test.ts`.
- **Regla Innegociable:** Antes de realizar cualquier commit o dar por concluida una tarea, se deben ejecutar y aprobar:
  ```bash
  npm run typecheck   # tsc --noEmit (0 errores permitidos)
  npm test            # vitest run (100% pasando)
  ```
- Al agregar una nueva entidad en `src/entities/` o una nueva Server Action crítica, se debe acompañar obligatoriamente de su archivo de prueba correspondiente en `tests/unit/`.

---

## 🗄️ 4. Base de Datos y Persistencia (Turso + Drizzle)

1. **Esquema Único Centralizado:**
   - El único esquema de base de datos autorizado es [src/entities/schema.ts](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/entities/schema.ts).
   - No crear archivos de esquema dispersos o duplicados (como `auth-schema.ts`).
2. **Modo Dual Local / Nube:**
   - Desarrollo local utiliza `file:local.db` (sin dependencias de Docker ni internet).
   - Producción se conecta mediante `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.
3. **Flujo de Migraciones:**
   - Nunca modificar las tablas SQLite manualmente en producción.
   - Usar `npx drizzle-kit generate` y `npx drizzle-kit migrate` (o `npx drizzle-kit push`).
4. **Batching de Escrituras Multi-Statement (`db.batch`):**
   - En operaciones que ejecutan múltiples escrituras simultáneas (ej. registrar evento en `card_events` e incrementar `viewsCount` en `cards`), utilizar siempre `db.batch([stmt1, stmt2])` de Drizzle LibSQL en lugar de `Promise.all()`. Esto colapsa los roundtrips de red en uno solo y previene contención de cerraduras SQLite (`SQLITE_BUSY`).
5. **Precedencia de Persistencia & Zero Template Shadowing:**
   - En rutas públicas dinámicas (`/p/[slug]`, `/c/[slug]`, `/cv/[slug]`), la consulta a la base de datos (`db.query.*.findFirst`) tiene precedencia absoluta sobre diccionarios o plantillas estáticas de demostración. Los templates curados o mocks en código actúan estrictamente como fallback ante la ausencia de registro en base de datos, garantizando que el contenido generado o editado por los usuarios nunca sea eclipsado por fixtures estáticos.
   - En editores y asistentes de creación, las entidades nuevas deben inicializarse con identificadores o slugs únicos generados dinámicamente (`generatePresentationSlug`, `generateCvSlug`) y los enlaces de apertura desde paneles o dashboards deben vincularse por clave primaria inmutable (`?id=${item.id}`).
6. **Línea Base de 11 Tablas de Dominio & Contratos JSON Fuertemente Tipados:**
   - La base de datos centraliza 11 tablas de dominio: `user`, `session`, `account`, `verification`, `cards`, `card_events`, `smart_cvs`, `presentations`, `payments_history`, `affiliate_bank_accounts` y `affiliate_commissions`.
   - Las columnas JSON en SQLite (`themeConfig`, `content`, `slidesData`, `themeSettings`) deben estar fuertemente tipadas mediante `.$type<...>()` en concordancia con sus esquemas Zod en `src/entities/*/schemas.ts`, admitiendo interoperabilidad con generadores de semillas y pruebas. Toda migración Drizzle debe quedar sincronizada en `drizzle/migrations/`.
   - **Programa de Afiliados & Liquidaciones Quincenales (25% CLP)**: Los usuarios registrados disponen de enlace único (`user.referralCode`), generado por defecto y 100% personalizable por el usuario mediante `updateReferralCodeAction` con validación Zod en tiempo real (`checkReferralCodeAvailabilityAction`) y protección de términos reservados (`RESERVED_REFERRAL_CODES`). La atribución es idempotente y sticky (`attributeReferralAction` previene reescrituras de referentes existentes). El flujo admite destinos duales: Onboarding Hub (`/start?ref=CODIGO`) y Registro Directo (`/login?mode=signup&ref=CODIGO`), persistiendo una cookie First-Party (`indi_ref_code`, 30 días) para evitar pérdidas de atribución si el usuario navega antes de registrarse. El panel de afiliados desglosa en tiempo real: registros totales, usuarios en prueba (`TRIAL`), convertidos a Plan Pro (`ACTIVE`), tasa de conversión (%) y saldo acumulado por liquidar los días 1 y 15 en `/admin`. Todo pago aprobado en Mercado Pago genera una comisión atómica del 25% en `affiliate_commissions`.
   - **Gobernanza Criptográfica & Anti-Gaming en Afiliados 2026**:
     - *Verificación Criptográfica de Webhooks*: La ingestión de eventos de pago valida la firma HMAC-SHA256 en la cabecera `x-signature` (`verifyMercadoPagoWebhookSignature`) previniendo spoofing antes de inspeccionar el estado en Mercado Pago SDK v2.
     - *Prevención de Auto-Referidos & Fraude Sybil*: Normalización algorítmica de correos electrónicos (`normalizeEmailForAntiGaming`) ignorando subdireccionamiento `+alias` y puntos en Gmail/Googlemail tanto en `attributeReferralAction` como en el hook server-side `databaseHooks.user.create.before`.
     - *Digestión de Reembolsos y Contracargos*: La pasarela revierte automáticamente las comisiones (`status: 'refunded' | 'charged_back'`) mediante `processAffiliateRefundOnPayment` ante notificaciones de devolución.
     - *Indexación Rigurosa en Drizzle SQLite*: La tabla `affiliate_commissions` mantiene índices explícitos sobre todas sus claves foráneas (`buyer_user_idx`, `payment_idx`, `affiliate_user_idx`, `status_idx`) erradicando full table scans.
     - *Gobernanza Edge de Cookies & Cero N+1 en Auditoría (/admin)*: Toda captura de cookie de referido (`indi_ref_code`) se ejecuta a nivel de `src/middleware.ts` en la respuesta HTTP perimetral, erradicando fallos silenciosos de `cookies().set()` en Server Components. En Better-Auth, `user.additionalFields` declara explícitamente los campos del modelo y las consultas de auditoría y liquidaciones en `src/features/affiliates/actions.ts` utilizan batching con `inArray` y sincronización en vivo (`getAdminDashboardDataAction`, `<RefreshCw />`), garantizando latencia sub-50ms y cero bloqueos.

---

## 🎨 5. Sistema Visual y Estándares UI/UX

1. **Espacio de Color OKLCH & Contraste Perceptual WCAG 2.2 AA:**
   - Utilizar las variables `@theme` definidas en [src/app/globals.css](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/app/globals.css) con Tailwind CSS v4.
   - En componentes dinámicos con selección de color de usuario, utilizar el motor perceptual de luminancia relativa `@/shared/lib/colorContrast` (`getAccessibleTextColor`, `oklchToRgb`, `meetsWcagAaContrast`) para garantizar ratio $\ge 4.5:1$ en todo botón, badge interactivo o tipografía tanto en temas oscuros como claros.
   - **Acabados Luminous Glass & Aurora Light**: Las tarjetas admiten acabados de alto contraste y fondos claros (`luminous-glass`, `aurora-light`) con textura de prisma escarchado (`frosted-prism`), tipografía adaptativa (`text-slate-900`/`text-slate-600`) y bordes especulares fotónicos sin sacrificar la ergonomía visual ni el estándar WCAG 2.2 AA.
2. **Glassmorphism 2.0 & Micro-Efectos Fotónicos:**
   - Utilizar las clases utilitarias `.glass-panel`, `.glass-panel-light`, `.glass-pill` y `.glass-pill-light`.
   - Efectos de partículas deben emplear `SmartParticles.tsx` con lentes especulares fotónicos (`smart-particle::before`) y halos de dispersión volumétrica cáustica (`smart-particle::after`), acelerados por hardware (`will-change: transform, opacity`).
3. **Ergonomía Táctil & Retícula Base 8 (Mobile-First):**
   - **Touch Targets:** Todos los elementos interactivos (botones, enlaces, iconos de redes) deben tener un tamaño mínimo de **$44 \times 44\text{ px}$** (`min-h-[44px] min-w-[44px]` o `w-11 h-11`).
   - **Thumb Zone Móvil:** En vistas y editores extensos, las acciones primarias deben contar con barras de acción fijas inferiores (`fixed bottom-4 inset-x-4 sm:hidden`) para garantizar operabilidad con una sola mano.
   - **Espaciados:** Todos los márgenes, paddings y gaps deben regirse por múltiplos matemáticos de **8px** (8, 16, 24, 32, 48, 64px) para mantener armonía visual y consistencia de layout.
4. **Cartografía Web y Geolocalización Privacy-First:**
   - La representación de mapas en tarjetas públicas debe priorizar soluciones sin rastreadores ni tokens expuestos en cliente (OpenStreetMap embebido con `loading="lazy"` y `referrerPolicy="no-referrer"`).
   - Los enlaces de navegación externa deben ofrecer compatibilidad universal multilingüe con Google Maps y Waze asegurando touch targets $\ge 44\text{px}$.
5. **Optimización y Compresión Client-Side de Medios (WebP First):**
   - Toda subida de imagen de usuario (foto de perfil en tarjeta, captura de currículum o soporte visual de diapositivas) debe pasar por el motor client-side `@/shared/lib/imageCompression` (`compressImageClient`) antes de enviarse al servidor o serializarse en el estado.
   - Preservar dimensiones proporcionales (`calculateAspectRatioFit`), convertir a WebP con factor de calidad balanceado (0.80 - 0.85) y garantizar retroalimentación visual al usuario en tiempo real con touch targets $\ge 44\text{px}$.
6. **Ingesta de Archivos Grandes y Route Handlers Nativos (HTTP Streaming vs Server Actions):**
   - Toda subida de archivos binarios o documentos que puedan superar 1MB (PDFs, presentaciones, títulos académicos) debe realizarse a través de Route Handlers dedicados (`src/app/api/.../route.ts`) consumidos mediante `fetch(..., { method: 'POST', body: formData })` con streaming HTTP nativo.
   - Se prohíbe el envío directo de archivos pesados en `FormData` hacia React Server Actions debido al límite estricto predeterminado de 1MB y a los fallos de serialización de React Flight (`An unexpected response was received from the server`). Mantener siempre fallback automático en caso de contingencia.
7. **Cero Persistencia Binaria en Base de Datos e Inspección de Magic Bytes (Zero-Binary DB Persistence):**
   - La base de datos SQLite (Turso) solo almacena texto plano y JSON semántico estructurado (<50KB). Se prohíbe terminantemente persistir buffers binarios crudos, blobs pesados o Data URLs de documentos completos (`assertZeroBinaryPersistence`).
   - Todo archivo procesado en servidor debe validar su firma binaria real mediante Magic Bytes (`validateFileSignature`) para neutralizar ejecutables camuflados (PE, ELF, Mach-O) o inyecciones políglotas, procesando los streams en memoria volátil efímera sin escritura en `/tmp`.



8. **Formato Unificado Empresarial A4 y Exportación Vectorial ATS (ISO 216 Standard):**
   - Todo currículum digital (Smart CV) tanto en visualización web (`CvDocumentPreview.tsx`) como en exportación PDF vectorial (`pdf-engine.ts`) se rige bajo el estándar unificado **A4 Internacional (210 x 297 mm, DIN EN ISO 216)** de grado empresarial.
   - Párrafos de resumen profesional y viñetas de experiencia deben estar pulcramente justificados (`text-justify` en cliente web y `{ align: 'justify', maxWidth: ... }` en jsPDF), con sangría colgante y sanitización de caracteres para neutralizar la duplicación de viñetas (`• •` o `- •`) y artefactos de OCR corruptos (`%Ï`, `%ï`).
   - Las cabeceras de sección en PDF deben implementar guardrail anti-huérfanos (mínimo 24mm de espacio vertical libre) y encabezado corporativo de continuación en páginas posteriores.
   - **Referencias Laborales con Contacto Verificable & Guardrail Anti-Swallow:** En PDF, web preview y extracción heurística/multimodal, toda referencia laboral debe mostrar de forma prominente el teléfono o correo de contacto (`Contacto: +56 9... / email`), distribuido en columnas ergonómicas. El analizador heurístico implementa un guardrail anti-absorción (`isPotentialNewReference`, `isJobTitleLine`) que detiene el lookahead inmediatamente tras extraer el contacto del referente actual, impidiendo que una persona absorba los teléfonos de referentes subsiguientes en documentos sin viñetas explícitas.
   - **Guardrail Anti-Página Huérfana de Firma:** El bloque de firma digital en PDF solo se renderiza si existe una rúbrica o firma explícita configurada, previniendo la generación de hojas adicionales vacías con solo una línea de firma al final del documento.
   - Los editores de CV deben enlazar desde paneles mediante clave primaria inmutable (`/cv?id=${cv.id}`) y persistir reactivamente el `cvId` en el estado tras cada guardado para garantizar mutaciones idempotentes y prevenir la duplicación de registros.
9. **Identidad Visual Corporativa Unificada & Activos WebP First:**
   - La identidad gráfica de la plataforma está centralizada en el contrato canónico `@/entities/brand/schemas` (`BRAND_ASSETS`) y se renderiza universalmente a través de `@/shared/ui/BrandLogo` (`<BrandLogo />`).
   - Se prohíbe terminantemente el uso de placeholders genéricos con letras iniciales CSS (`IN`) o inserción de SVGs/imágenes dispersas sin pasar por el componente canónico.
   - Todos los activos estáticos de identidad visual deben residir en `public/brand/` convertidos a formato **WebP** con factor de calidad balanceado (80-85%) y peso ultra-ligero (&lt;45 KB), preservando los archivos fuente 2K sin comprimir en `public/brand/source/`.
   - **Logotipo Animado Viviente (Video Loop Ultra-Ligero)**: `<BrandLogo />` implementa soporte nativo de video loop (`useVideo={true}`) utilizando variantes duales en formato **WebM** (`indi-logo-animated.webm`, &lt;56 KB) y **MP4** (`indi-logo-animated.mp4`, &lt;67 KB), sin audio (`-an`), con reproducción continua silenciada (`muted`, `autoPlay`, `loop`, `playsInline`) **sin `poster` ni imagen de respaldo interna** (evita el flash de imagen estática previo a la reproducción) y desactivación automática ante preferencias de accesibilidad `motion-reduce:hidden` conforme a WCAG 2.2 AA.
   - Elementos multimedia de identidad extendidos (video reveal 1080p) deben contar con controles táctiles ergonómicos $\ge 44\text{px}$ y reproducción controlada.
    - **Hero Zero-Media & HeroBrandIdentity (Zero-Box Masking)**: `BrandHeroBackdrop` es un Server Component 100% CSS (halos + gradiente) y se prohíbe renderizar en él `<img>`, `<video>` o fondos desenfocados que dupliquen la marca. El protagonista central del Hero es `<HeroBrandIdentity />`, el cual erradica cajas cuadradas y recuadros oscuros rígidos mediante máscara radial continua (`mask-image: radial-gradient(circle at center, black 60%, transparent 95%)`) y video profesional nativo (`indi-logo-animated.webm` / `.mp4`) con fallback vectorial transparente para `motion-reduce`. Blindado por `tests/unit/hero-zero-media-backdrop.test.ts`.
    - **Pantalla de Precarga Cinemática (`SmartPreloader`) & Ergonomía Móvil**: Rutas públicas y raíz implementan `loading.tsx` con `<SmartPreloader />`, reproduciendo el video oficial con pulso bioluminiscente y micro-barra fotónica. En vistas móviles (`/c/[slug]`), se utiliza `min-h-dvh` y `overflow-x-hidden` junto con la directiva `viewport: Viewport` (`themeColor: '#080A12'`) en `src/app/layout.tsx`, evitando el colapso o desaparición de la barra del navegador y erradicando splashes toscos del sistema operativo. Blindado por `tests/unit/smart-preloader-and-hero-branding.test.ts`.

10. **Landing Minimalista con Presupuesto de Secciones:**
   - La home (src/app/page.tsx) admite como máximo LANDING_MAX_SECTIONS (5) secciones; toda copia pública se edita en @/entities/landing/schemas (LANDING_CONTENT), nunca hardcodeada en JSX.
   - Vitrinas internas de assets (BrandIdentityShowcase) no se exponen en la landing pública.

11. **Estudio Cinemático Orbital & Copiloto IA de Diapositiva (McKinsey SCQA Standard):**
   - El estudio de presentaciones (`PresentationStudio.tsx`) integra un copiloto IA por diapositiva (`SlideAiAssistant.tsx`) con botones táctiles ergonómicos $\ge 44\text{px}$ para optimizar en un toque: *Action Title McKinsey* (<14 palabras asertivas), *Viñetas de Impacto* con verbos de acción y *Notas del Orador* temporalizadas (~45-60s).
   - Inferencia con orquestador resiliente multi-proveedor (`callNvidiaNimChat`): Failover transparente NVIDIA NIM ➔ Google Gemini 1.5 Flash ➔ OpenRouter ➔ Motor Heurístico Determinista local, garantizando cero caídas en producción y desarrollo offline.
   - Ingesta exhaustiva de documentos (`document-parser.ts`): Extracción algorítmica de métricas complejas (UF, USD, CLP, %, deltas `+`/`-`, ratios `x`, rps, MoM/YoY), cronogramas y pares de contraste semántico problema/solución.

12. **Identificadores Públicos Profesionales, Disponibilidad en Tiempo Real & Protección de Rutas (Homologación Universal de Slugs: Cards, Smart CV y Presentaciones):**
   - **Cero Hashes Aleatorios por Defecto**: Los enlaces públicos para tarjetas digitales (`/c/[slug]`), Smart CV (`/cv/[slug]`) y presentaciones orbitales (`/p/[slug]`) erradican sufijos y hashes aleatorios por defecto (como `cv-profesional-k3p1` o `pitch-deck-9x2a`). Generan URLs ejecutivas limpias derivadas del nombre o título (`matias-riquelme`, `pitch-deck-2026`).
   - **Auto-Sincronización Reactiva**: Tanto `CardBuilder.tsx`, `SmartCvBuilder.tsx` como `PresentationStudio.tsx` implementan auto-sincronización reactiva: al tipear el nombre o título, el slug se actualiza automáticamente a menos que el usuario lo haya editado manualmente (`isSlugManuallyEdited`). Incluyen botones táctiles asistidos $\ge 44\text{px}$ para sincronizar desde el nombre/título y copiar el enlace con feedback inmediato.
   - **Verificación de Disponibilidad en Tiempo Real con Turso**: Mediante `checkCardSlugAvailabilityAction`, `checkCvSlugAvailabilityAction` y `checkPresentationSlugAvailabilityAction`, los editores consultan a Turso con debounce de 350ms, mostrando badges reactivos (`Disponible`, `En uso`, `Reservado`).
   - **Protección de Rutas del Sistema y Sugerencias Ejecutivas en 1 Toque**: Si un slug ya está en uso o colisiona con rutas protegidas (`RESERVED_CARD_SLUGS`, `RESERVED_CV_SLUGS`, `RESERVED_PRESENTATION_SLUGS`), los motores `generateSlugAlternatives`, `generateCvSlugAlternatives` y `generatePresentationSlugAlternatives` generan chips sugeridos ejecutivos seleccionables en 1 toque.

13. **Dashboard Unificado de Alta Densidad, Zero Redundancy & Empty States Inductivos:**
   - **Acción Contextual Única**: Erradicar botones de creación globales duplicados que compitan con la vertical activa. La acción de creación (`+ Nueva Tarjeta`, `+ Crear o Mejorar CV`, `+ Nueva Presentación`) debe ser 100% contextualizada y ubicarse de forma prominente en la barra de herramientas.
   - **Empty States Educativos**: Prohibido el uso de contenedores grises vacíos sin guía. Toda vertical sin registros debe utilizar `DashboardEmptyState` presentando una inducción progresiva en 3 pasos orientada al valor del recurso y un botón magnético de inicio con touch target $\ge 44\text{px}$.
   - **Buscador con Atajo Accesible**: Integrar atajo accesible global (`Ctrl + K` / `/`) y botón de reseteo instantáneo.
14. **Arquitectura de Editores de Subpáginas & Vistas Públicas: Branding Persistente & Horizontal Cinemático:**
   - **Identidad Corporativa en Cabecera (`AppEditorHeader`)**: Toda subpágina de edición debe integrar el Isotipo Oficial INDI en video loop (`<BrandLogo variant="symbol" size="sm" />`) junto al botón de retorno ($\ge 44\text{px}$) y breadcrumbs contextuales.
   - **Branding en Vistas Públicas (`PublicContextualHeader`, `PublicCvViewer`, `PublicPresentationViewer`)**: Las vistas públicas de recursos compartidos (Tarjetas `/c/[slug]`, Smart CV `/cv/[slug]` y Presentaciones `/p/[slug]`) deben incorporar el **Logotipo Oficial Horizontal** (`<BrandLogo variant="horizontal" size="sm" showText={false} useVideo={true} linkToHome={true} />`), ofreciendo un aspecto cinematográfico balanceado, legibilidad óptima de marca, integración con el botón contextual derecho y touch target ergonómico $\ge 44\text{px}$.
   - **Zero Redundancia de IA en Pantalla**: Prohibido fragmentar las llamadas a modelos de IA en múltiples inputs y botones dispersos (evitar cajas como "Tema Rápido" + "Modo Avanzado" + "Botón Cabecera"). Toda interacción de generación debe unificarse en una única acción ejecutiva destacada que active el flujo multimodal completo (SCQA o Dropzone).
   - **Eficiencia Vertical Above-the-Fold**: Mantener la cabecera y pestañas con una altura combinada $\le 120\text{px}$ para que el área de trabajo (lienzo 16:9, vista previa del CV o tarjeta) se visualice inmediatamente sin requerir scroll en portátiles estándar.

15. **Onboarding Hub & Switchboard Sistémico (`/start`):**
   - **Enrutamiento Orientado a Intención (*Job-to-be-Done*)**: El hub de inicio debe estructurarse estrictamente según el caso de uso del usuario (*Networking*, *Postulación Laboral*, *Pitches & Clientes*) con estimaciones explícitas de tiempo ($\le 4\text{ minutos}$) y sin fricción de configuración previa.
   - **Dual Layout Móvil Ergonómico**: En smartphones ($\le 640\text{px}$), el grid debe ofrecer desplazamiento horizontal suave con `snap-x snap-mandatory` para evitar fatiga de scroll vertical y permitir comparar las opciones con el pulgar.
   - **Touch Targets y Válvula de Escape**: Botones de acción principales con altura táctil $\ge 48\text{px}$ (`min-h-[48px]`) y enlace destacado de salto al Dashboard (`/dashboard`) para usuarios recurrentes.

16. **Gobernanza de Navegación Sistémica y Cero Auto-Enlaces (Zero Self-Referential Loops):**
   - **Destino Canónico de Marca**: En aplicaciones autenticadas o hubs internos (`/dashboard`, `/start`, `/login`), el logotipo oficial (`<BrandLogo />`) debe apuntar canónicamente a la raíz pública (`/`) para permitir al usuario explorar la portada o salir del contexto de trabajo, erradicando loops autorreferenciales (ej. enlazar a la misma URL donde se está posicionado).
   - **Erradicación de Acciones Redundantes en Cabeceras**: Se prohíbe duplicar botones de navegación externa (`"Ver Web"`, `"Planes y Membresía"`) cuando la misma funcionalidad ya se encuentra cubierta por el logotipo o banners contextuales prioritarios (`TrialBanner`). Toda barra de herramientas debe preservar máxima pureza visual y ratio de señal-ruido.

17. **Gobernanza del Panel de Administración (`/admin`), Contratos Zod & Modal Accesible de Liquidaciones:**
   - **Validación FSD & Zod Rigurosa**: Toda Server Action administrativa de mutación (`markAffiliateCommissionsAsPaidAction`) valida sus argumentos mediante esquemas Zod dedicados (`MarkAffiliateCommissionsPaidSchema.safeParse()`) antes de ejecutar operaciones sobre Turso SQLite.
   - **Modal Accesible de Confirmación de Liquidación**: Se prohíbe el uso de alertas nativas o diálogos bloqueantes `window.confirm()`. La confirmación de pagos quincenales debe renderizarse en un modal flotante con Glassmorphism 2.0 que desglosa en tiempo real el titular, banco, tipo de cuenta, RUT y monto exacto en CLP.
   - **Filtros Ergonómicos y Píldoras de Segmentación**: La pestaña de auditoría provee píldoras interactivas con conteos reactivos (`Todos`, `Pro Activo`, `Trial`) y touch targets $\ge 36\text{px}$ para segmentación instantánea sin recarga de página.
   - **Protección No-Index de Rutas Administrativas**: Toda ruta de administración debe declarar metadatos `robots: { index: false, follow: false }` para preservar la confidencialidad operativa de la plataforma.

18. **Gobernanza de Compartición Visual, Favicons de Clase Mundial, Schema.org SEO & Playbook CEO 2026:**
   - **Especificación Canónica JSON para Deep Research**: Toda investigación estratégica sobre diseño visual, favicons, SEO y monetización se formaliza en [`docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.json`](docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.json).
   - **Previsualizaciones Open Graph Perimetrales (`/api/og`)**: Generación con `@vercel/og` y Satori respetando la zona segura 1:1 (630x630 px) para listas de chat de WhatsApp/Telegram y relación 1200x630 px para LinkedIn/X, con avatares nítidos, badges de especialidad y contraste WCAG 2.2 AA.
   - **Favicon Multi-Formato & Optical Sizing**: El isotipo oficial debe servirse en SVG vectorial con `@media (prefers-color-scheme: dark/light)`, acompañado de `favicon.ico` multi-resolución, `apple-touch-icon.png` (180x180 px) y PWA manifest con propósito `maskable any`.
   - **Datos Estructurados JSON-LD & Protocolo IndexNow**: Inyección tipada de `Schema.org` (`ProfilePage`, `Person`, `DigitalDocument`, `BreadcrumbList`) en páginas públicas y notificación perimetral en tiempo real mediante IndexNow para indexación instantánea en motores de búsqueda.
   - **Product-Led Growth (PLG) & Coeficiente Viral**: Todo recurso compartido debe incorporar micro-atribución de marca de alta conversión y cookies First-Party (`indi_ref_code`) para canalizar registros con K-factor > 1.2 sin marcas de agua invasivas.

19. **Gobernanza de Seguridad Perimetral, Privacidad & Estándar E.164 (INDI 2026):**
   - **Normalización Telefónica E.164 (+56 Chile)**: Todo número telefónico expuesto en tarjetas de contacto vCard 4.0, llamadas directas (`tel:`) o mensajes de WhatsApp (`wa.me/`) debe procesarse mediante `@/shared/lib/phone` (`normalizeChileanPhone`, `getWhatsAppDigits`). Esto garantiza interoperabilidad nativa con la libreta de direcciones de iOS/Android y mensajería instantánea sin fricción.
   - **Protección de Medios Anti-Arrastre & Anti-Clonación**: Elementos visuales de identidad (retratos, avatares de tarjetas y miniaturas) implementan guardrails silenciosos del lado del cliente (`onContextMenu={(e) => e.preventDefault()}` y `onDragStart={(e) => e.preventDefault()}`) evitando la clonación o descarga accidental por terceros sin alterar la interfaz visual ni comprometer lectores de pantalla.
   - **Cabeceras HTTP de Seguridad RFC 9111**: `next.config.ts` declara obligatoriamente para todas las rutas `X-Frame-Options: DENY` (anti-clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
   - **Fail-Fast Environment Sentinel**: El servidor valida al inicio la integridad de variables críticas (`BETTER_AUTH_SECRET`, `TURSO_DATABASE_URL`) mediante `@/shared/lib/envSentinel` para prevenir fallos silenciosos en producción.

20. **Gobernanza de Ingesta Inteligente de Documentos (Spatial 2D Extraction & Topic Density Clustering):**
   - **Extracción Espacial 2D Layout-Aware (`spatialDocumentExtractor.ts`)**: Se prohíbe la lectura puramente lineal horizontal en PDFs con estructuras de dos columnas (común en plantillas de currículum y reportes ejecutivos). El motor inspecciona las matrices de transformación `[scaleX, skewY, skewX, scaleY, posX, posY]` para ordenar columnas físicas independientes y evitar la mezcla horizontal de habilidades o fechas con oraciones de experiencia.
   - **Cascade AI Router 2026**: Toda inferencia de análisis de currículums o presentaciones orquesta una cascada de alta disponibilidad: **NVIDIA NIM** (Llama 3.3 70B / DeepSeek R1) ➔ **Google Gemini 2.0 Flash** ➔ **OpenRouter** ➔ **Motor Heurístico Determinista**. Cero caídas y tolerancia a rate-limits.
   - **Topic Density Clustering en Presentaciones**: Sustituir divisiones matemáticas fijas (`paragraphs.length / 5`) por agrupación temática guiada por encabezados y densidad argumental, garantizando que los puntos clave y métricas nunca se corten a la mitad.
   - **Skills Agénticas Especializadas**: El comportamiento de estas suites está gobernado por `.agents/skills/cv-intelligence-orchestrator` y `.agents/skills/presentation-intelligence-engine`. Blindado por `tests/unit/spatial-document-extraction.test.ts`.

21. **Gobernanza de Posicionamiento #1 en Google Chile (google.cl) & Deep Research:**
   - **Especificación de Deep Research**: Las pautas de investigación y diseño de prompts para posicionamiento en Chile residen en [`docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_GOOGLE_CHILE_SEO_NO1_2026.json`](docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_GOOGLE_CHILE_SEO_NO1_2026.json) y su guía [`PROMPT_GEMINI_DEEP_RESEARCH_GOOGLE_CHILE_SEO_NO1_2026.md`](docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_GOOGLE_CHILE_SEO_NO1_2026.md).
   - **Enfoque Multi-Pilar E-E-A-T en Chile**: Toda página de producto y cluster programático debe demostrar experiencia, autoridad y confianza adaptada al mercado chileno (precios en CLP, medios de pago locales, compatibilidad ATS en empresas chilenas, integración vCard 4.0 con prefijo +56).
   - **Monitoreo de Calidad**: La integridad del prompt y sus contratos está respaldada por la suite unitaria `tests/unit/google-chile-seo-research-prompt.test.ts`.

---





## 📦 6. Convenciones de Git y Commits Semánticos

Todo cambio debe registrarse siguiendo la convención de [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad para el usuario.
- `fix:` Corrección de errores o vulnerabilidades.
- `refactor:` Mejoras internas de código sin alteración de comportamiento.
- `test:` Inclusión o actualización de pruebas unitarias.
- `docs:` Modificaciones en documentación o blueprints.
- `chore:` Tareas de mantenimiento de configuración o dependencias.

---

## 📚 7. Gobernanza Documental Obligatoria ("Doc-as-Code")

**Principio de Cero Deuda Documental:**
Ninguna tarea que involucre cambios de arquitectura, nuevas entidades, nuevos componentes reutilizables en `src/shared/ui/` o nuevas funcionalidades de usuario se considera terminada sin actualizar la documentación correspondiente antes del commit/push:

1. **Sincronización en Cascada Obligatoria:**
   - **[README.md](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/README.md):** Actualizar si se crean nuevas rutas públicas, componentes compartidos o se altera el árbol de directorios FSD.
   - **[docs/architecture/BLUEPRINT_2026.md](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/docs/architecture/BLUEPRINT_2026.md):** Actualizar la fase correspondiente o registrar una nueva fase completada con sus especificaciones técnicas.
   - **[AGENTS.md](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/AGENTS.md):** Actualizar si el cambio introduce un nuevo estándar de codificación, regla de diseño o protocolo de testing.
2. **Atomicidad:**
   - Los cambios de código y sus respectivas actualizaciones documentales deben incluirse en el mismo ciclo de trabajo o commitearse bajo el prefijo `docs:` inmediatamente después.

---

## 🚀 8. Protocolo de Orquestación Agéntica "Prompt-to-Push" 2026

Todo agente de IA o desarrollador asistido debe operar bajo el protocolo de entrega continua documentado en [docs/specifications/AGENT_ORCHESTRATION_PROMPT_2026.md](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/docs/specifications/AGENT_ORCHESTRATION_PROMPT_2026.md):

1. **Pre-flight & Diagnóstico Inicial**: Inspeccionar siempre el estado de Git (`git status`, `git branch --show-current`) antes de mutar código.
2. **Quality Gate Bloqueante**: Ningún commit ni push puede ejecutarse si `npm run typecheck` o `npm test` contienen errores o advertencias de fallo.
3. **Flujo de Publicación Automatizada**: El agente debe cerrar cada tarea ejecutando `git add`, `git commit` semántico y `git push origin <branch>` de manera autónoma, validando que el repositorio quede en estado limpio.
4. **Reporte Ejecutivo de Entrega**: Toda interacción concluye con un desglose estructurado de cambios, estado de calidad y hash del commit publicado.


