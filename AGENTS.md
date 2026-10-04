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
