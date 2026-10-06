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
   - Las variables de entorno de producción (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) deben configurarse en Vercel con URIs de redirección autorizadas en Google Cloud Console.
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
   - **Programa de Afiliados & Liquidaciones Quincenales (25% CLP)**: Los usuarios registrados disponen de enlace único (`user.referralCode`), generado por defecto y 100% personalizable por el usuario mediante `updateReferralCodeAction` con validación Zod en tiempo real (`checkReferralCodeAvailabilityAction`) y protección de términos reservados (`RESERVED_REFERRAL_CODES`). La atribución es idempotente y sticky (`attributeReferralAction` previene reescrituras de referentes existentes). El flujo de entrada (`/start?ref=CODIGO`) persiste una cookie First-Party (`indi_ref_code`, 30 días) para evitar pérdidas de atribución si el usuario navega antes de registrarse, propaga el código en `AuthModal` y muestra un banner de bienvenida reactivo (`ReferralWelcomeBanner`) con los días de prueba y nombre del anfitrión. Todo pago aprobado en Mercado Pago genera una comisión atómica del 25% en `affiliate_commissions`. Los afiliados ingresan sus datos bancarios validados con Módulo 11 chileno en `affiliate_bank_accounts` y los cortes se liquidan los días 1 y 15 en `/admin`.

---

## 🎨 5. Sistema Visual y Estándares UI/UX

1. **Espacio de Color OKLCH & Contraste Perceptual WCAG 2.2 AA:**
   - Utilizar las variables `@theme` definidas en [src/app/globals.css](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/app/globals.css) con Tailwind CSS v4.
   - En componentes dinámicos con selección de color de usuario, utilizar el motor perceptual de luminancia relativa `@/shared/lib/colorContrast` (`getAccessibleTextColor`) para garantizar ratio $\ge 4.5:1$ en todo botón o badge interactivo.
2. **Glassmorphism 2.0:**
   - Utilizar las clases utilitarias `.glass-panel` y `.glass-pill`.
   - Efectos de partículas deben emplear `SmartParticles.tsx` con aceleración por hardware (`will-change: transform, opacity`).
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
   - **Logotipo Animado Viviente (Video Loop Ultra-Ligero)**: `<BrandLogo />` implementa soporte nativo de video loop (`useVideo={true}`) utilizando variantes duales en formato **WebM** (`indi-logo-animated.webm`, &lt;56 KB) y **MP4** (`indi-logo-animated.mp4`, &lt;67 KB), sin audio (`-an`), con reproducción continua silenciada (`muted`, `autoPlay`, `loop`, `playsInline`), `poster` WebP instantáneo (Zero CLS) y desactivación automática ante preferencias de accesibilidad `motion-reduce:hidden` conforme a WCAG 2.2 AA.
   - Elementos multimedia de identidad extendidos (video reveal 1080p) deben contar con controles táctiles ergonómicos $\ge 44\text{px}$ y reproducción controlada.

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
14. **Arquitectura de Editores de Subpáginas: Branding Persistente & Single AI Entrypoint:**
   - **Identidad Corporativa en Cabecera (`AppEditorHeader`)**: Toda subpágina de edición debe integrar el Isotipo Oficial INDI en video loop (`<BrandLogo variant="symbol" size="sm" />`) junto al botón de retorno ($\ge 44\text{px}$) y breadcrumbs contextuales.
   - **Zero Redundancia de IA en Pantalla**: Prohibido fragmentar las llamadas a modelos de IA en múltiples inputs y botones dispersos (evitar cajas como "Tema Rápido" + "Modo Avanzado" + "Botón Cabecera"). Toda interacción de generación debe unificarse en una única acción ejecutiva destacada que active el flujo multimodal completo (SCQA o Dropzone).
   - **Eficiencia Vertical Above-the-Fold**: Mantener la cabecera y pestañas con una altura combinada $\le 120\text{px}$ para que el área de trabajo (lienzo 16:9, vista previa del CV o tarjeta) se visualice inmediatamente sin requerir scroll en portátiles estándar.

15. **Onboarding Hub & Switchboard Sistémico (`/start`):**
   - **Enrutamiento Orientado a Intención (*Job-to-be-Done*)**: El hub de inicio debe estructurarse estrictamente según el caso de uso del usuario (*Networking*, *Postulación Laboral*, *Pitches & Clientes*) con estimaciones explícitas de tiempo ($\le 4\text{ minutos}$) y sin fricción de configuración previa.
   - **Dual Layout Móvil Ergonómico**: En smartphones ($\le 640\text{px}$), el grid debe ofrecer desplazamiento horizontal suave con `snap-x snap-mandatory` para evitar fatiga de scroll vertical y permitir comparar las opciones con el pulgar.
   - **Touch Targets y Válvula de Escape**: Botones de acción principales con altura táctil $\ge 48\text{px}$ (`min-h-[48px]`) y enlace destacado de salto al Dashboard (`/dashboard`) para usuarios recurrentes.

16. **Gobernanza de Navegación Sistémica y Cero Auto-Enlaces (Zero Self-Referential Loops):**
   - **Destino Canónico de Marca**: En aplicaciones autenticadas o hubs internos (`/dashboard`, `/start`, `/login`), el logotipo oficial (`<BrandLogo />`) debe apuntar canónicamente a la raíz pública (`/`) para permitir al usuario explorar la portada o salir del contexto de trabajo, erradicando loops autorreferenciales (ej. enlazar a la misma URL donde se está posicionado).
   - **Erradicación de Acciones Redundantes en Cabeceras**: Se prohíbe duplicar botones de navegación externa (`"Ver Web"`, `"Planes y Membresía"`) cuando la misma funcionalidad ya se encuentra cubierta por el logotipo o banners contextuales prioritarios (`TrialBanner`). Toda barra de herramientas debe preservar máxima pureza visual y ratio de señal-ruido.

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

