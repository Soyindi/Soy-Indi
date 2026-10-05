---
name: flow-and-persistence-audit
description: Auditoría integral de flujo de usuario, contratos de datos Zod vs Drizzle ORM, multi-tenancy, y consistencia de experiencia de usuario en INDI 2026.
---

# 🛡️ Skill: Auditoría Integral de Flujo & Persistencia (INDI 2026)

Esta habilidad formaliza el protocolo de control de calidad arquitectónica, validación de persistencia y consistencia de interfaz de usuario para el ecosistema **INDI (Soyindi)**.

---

## 🎯 Objetivo
Garantizar que todo el recorrido del usuario (desde la landing pública, onboarding en `/start`, creación en editores `/c`, `/cv`, `/p`, gestión en `/dashboard`, hasta la experiencia del visitante en enlaces públicos) funcione sin fricción, respetando el contrato de datos en Turso SQLite / Drizzle ORM y los estándares de seguridad de `AGENTS.md`.

---

## 📋 Protocolo de Auditoría en 5 Pasos

### 1. Alineación Estricta: Drizzle ORM vs Contratos Zod & Migraciones
- **Esquema Único y Centralizado**: Todo modelo de base de datos reside exclusivamente en `src/entities/schema.ts`. Prohibido crear esquemas dispersos.
- **Línea Base de 9 Tablas de Dominio**:
  1. `user`: Usuarios Better-Auth con suscripciones Mercado Pago y campos de prueba (`trialEndsAt`, `subscriptionEndsAt`, `planInterval`).
  2. `session`: Sesiones Better-Auth.
  3. `account`: Cuentas OAuth (Google multi-cuenta).
  4. `verification`: Tokens de verificación y recuperación.
  5. `cards`: Tarjetas digitales con geolocalización (`address`), telemetría y `theme_config` JSON.
  6. `card_events`: Registro de eventos de telemetría analítica (view, contact_save, whatsapp_click, share, qr_scan).
  7. `smart_cvs`: Resúmenes ATS ejecutivos con `content` JSON, calibración de score y slugs dinámicos.
  8. `presentations`: Presentaciones orbitales 16:9 con `slides_data` JSON y `theme_settings` JSON.
  9. `payments_history`: Bitácora inmutable de transacciones Mercado Pago (IPN webhook auditoría).
- **Tipado de Modos JSON**: En columnas SQLite con `mode: 'json'`, el tipo `$type<...>()` debe reflejar la totalidad de propiedades aceptadas por el schema Zod de la feature (`src/entities/*/schemas.ts`) permitiendo interoperabilidad segura con semillas y fixtures.
- **Cero Persistencia Binaria**: Turso almacena exclusivamente texto plano y JSON semántico (<50KB). Se prohíbe persistir buffers o base64 de documentos completos (`assertZeroBinaryPersistence`).
- **Sincronización de Migraciones**: Toda tabla y columna en `schema.ts` debe poseer su correspondiente snapshot en `drizzle/migrations/` (incluyendo migración `0004` para `payments_history`).
- **Idempotencia de Identificadores**: Todo identificador público (`slug`) debe validarse contra las listas de rutas reservadas (`RESERVED_*_SLUGS`).

### 2. Multi-Tenancy & Aislamiento de Datos
- **Filtro Compuesto Obligatorio**:
  ```ts
  and(eq(table.id, id), eq(table.userId, targetUserId))
  ```
  Ninguna Server Action de edición o eliminación puede omitir la verificación de pertenencia del recurso.
- **Guardrail de Sesión**:
  Toda mutación en producción debe invocar `getSafeAuthenticatedUserId(userId)` antes de contactar a la base de datos.

### 3. Rendimiento en Escrituras: LibSQL `db.batch`
- Al registrar analíticas y métricas concurrentes (por ejemplo en accesos públicos `/c/[slug]`):
  - **Requerido**: `db.batch([stmt1, stmt2])`
  - **Prohibido**: `Promise.all([db.insert(...), db.update(...)])` (provoca bloqueos `SQLITE_BUSY` en SQLite).

### 4. Estándares UI/UX & Identidad Visual Canónica
- **Cero Placeholders Ad-hoc**: Toda presencia de marca debe instanciar `<BrandLogo />` (`@/shared/ui/BrandLogo`). Prohibido renderizar contenedores CSS improvisados con letras `"IN"`.
- **Touch Targets**: Tamaño mínimo $\ge 44 \times 44\text{ px}$ en cualquier botón o control interactivo.
- **Espaciados Base 8**: Paddings, márgenes y gaps múltiplos de 8px (8, 16, 24, 32, 48px).
- **Contraste Perceptual**: WCAG 2.2 AA ($\ge 4.5:1$).

### 5. Navegación Sistémica Sin Bucles
- El logo canónico en paneles autenticados (`/dashboard`, `/start`) enlaza siempre a la raíz pública (`/`) para permitir explorar o salir del entorno de trabajo, erradicando auto-enlaces circulares.
- Los banners y cabeceras contextuales consumen reactivamente `useSession()` para adaptar el destino del usuario (`/dashboard` vs `/start`).
