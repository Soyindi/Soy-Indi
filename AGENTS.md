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
   - Ninguna Server Action que realice mutaciones (crear, editar, eliminar) puede interactuar directamente con la base de datos sin validar el usuario mediante `getSafeAuthenticatedUserId(userId)` ubicado en `@/shared/lib/session`.
   - En entorno de producción (`NODE_ENV === 'production'`), las acciones anónimas o sin sesión son bloqueadas inmediatamente con error de autorización.
2. **Validación Estricta de Entradas con Zod:**
   - Toda Server Action debe recibir parámetros y validarlos con `schema.safeParse()`.
   - Si la validación falla, retornar `{ success: false, error: ... }` sin exponer trazas de error internas del servidor.
3. **Manejo de Errores Silencioso:**
   - Capturar excepciones con bloques `try/catch` y registrar en consola del servidor antes de responder al cliente.

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
   - Usar `npx drizzle-kit generate` y `npx drizzle-kit push`.

---

## 🎨 5. Sistema Visual y Estándares UI/UX

1. **Espacio de Color OKLCH:**
   - Utilizar las variables `@theme` definidas en [src/app/globals.css](file:///c:/Users/Matías%20Riquelme/Desktop/Indi/src/app/globals.css) con Tailwind CSS v4.
   - Garantizar ratios de contraste accesibles acordes a las directrices WCAG 2.2 Nivel AA/AAA.
2. **Glassmorphism 2.0:**
   - Utilizar las clases utilitarias `.glass-panel` y `.glass-pill`.
   - Efectos de partículas deben emplear `SmartParticles.tsx` con aceleración por hardware (`will-change: transform, opacity`).

---

## 📦 6. Convenciones de Git y Commits Semánticos

Todo cambio debe registrarse siguiendo la convención de [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad para el usuario.
- `fix:` Corrección de errores o vulnerabilidades.
- `refactor:` Mejoras internas de código sin alteración de comportamiento.
- `test:` Inclusión o actualización de pruebas unitarias.
- `docs:` Modificaciones en documentación o blueprints.
- `chore:` Tareas de mantenimiento de configuración o dependencias.
