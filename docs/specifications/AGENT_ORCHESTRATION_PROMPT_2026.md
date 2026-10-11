# 🤖 Protocolo Canónico de Orquestación Agéntica: Prompt-to-Push 2026
**Estándar de Ingeniería de Software para Agentes de IA y Desarrollo Autónomo en INDI (`soyindi.cl`)**

---

## 🎯 1. Propósito y Filosofía de Ingeniería

Este documento establece el **Prompt Maestro Canónico** y el ciclo de vida continuo **Prompt-to-Push** para el desarrollo asistido por agentes de Inteligencia Artificial en la plataforma INDI. 

En un entorno de ingeniería Staff-Level, el agente no debe limitarse a modificar archivos aislados: **debe asumir la responsabilidad integral del ciclo de entrega (End-to-End Delivery Lifecycle)**, desde la verificación de contratos FSD hasta la validación automatizada de pruebas, la sincronización de documentación arquitectónica y la publicación final mediante `git commit` y `git push`.

---

## 💎 2. Anatomía del Prompt Maestro 2026 (Análisis Comparativo)

### 2.1 El Problema del Prompt Anterior
El prompt anterior presentaba vacíos críticos que obligaban al usuario a intervenir manualmente al final de cada turno:
- ❌ **Sin Git Push**: Terminaba en "5. Genera el commit", dejando cambios commiteados pero sin subir al remoto (`origin/main`).
- ❌ **Sin Pre-flight Checks**: No verificaba la rama actual ni si existía código sucio previo que pudiera sobreescribirse.
- ❌ **Sin Quality Gates Bloqueantes**: No condicionaba explícitamente el commit/push al éxito absoluto de `typecheck` y `tests`.
- ❌ **Sin Criterios de Rendimiento Perimetral**: Omitía directivas críticas de INDI 2026 como ISR 60s, telemetría desacoplada y almacenamiento cero binario en SQLite.
- ❌ **Sin Cierre Ejecutivo**: No exigía un reporte de entrega con hash de commit y comprobación de árbol limpio.

### 2.2 Las Mejoras Incorporadas en la Versión 2026
- ✅ **Ciclo Completo Prompt-to-Push**: `git add` selectivo + Commit semántico + `git push origin <rama>` verificado.
- ✅ **Quality Gate Innegociable**: Regla estricta de aborto si `npm run typecheck` o `npm test` arrojan el menor error.
- ✅ **Seguridad Multi-Tenant Estricta**: `getSafeAuthenticatedUserId()` y predicados compuestos anti-IDOR.
- ✅ **Ergonomía Base 8 & WCAG 2.2 AA**: Touch targets $\ge 44\text{px}$, Thumb Zone móvil y paleta OKLCH accesible.
- ✅ **Doc-as-Code en Cascada**: Sincronización mandatoria de `README.md`, `BLUEPRINT_2026.md` y `AGENTS.md`.
- ✅ **Executive Delivery Summary**: Cierre estructurado con tabla de impacto y estado de sincronización.

---

## 📋 3. Plantillas de Prompts Listas para Usar

### 🏆 3.1 Prompt Maestro Oficial: Titanium Delivery Flow (Full-Feature & Architecture)
> **Uso recomendado**: Para nuevas funcionalidades, refactorizaciones, cambios de esquema, integraciones de API o módulos completos.

```markdown
Actúa como Staff Principal Software Engineer & Lead Product Designer bajo los estándares de AGENTS.md y docs/architecture/BLUEPRINT_2026.md.

TAREA DE ALTO IMPACTO:
[DESCRIBE AQUÍ TU TAREA DETALLADAMENTE]

Ejecuta el protocolo de entrega "Titanium Delivery Flow" en 6 fases:

FASE 0: PRE-FLIGHT, CONTEXTO & ACTIVACIÓN DE SKILLS
- Verifica que el working tree de Git esté limpio y en la rama correspondiente.
- Identifica y lee los SKILL.md pertinentes en .agents/skills/ antes de escribir código:
  * Si impacta UI/UX ➔ Activa 'ui-ux-pro-max' y 'frontend-design'.
  * Si impacta DB/Server Actions ➔ Activa 'flow-and-persistence-audit' y 'drizzle-sqlite'.
  * Si impacta CVs/Presentaciones ➔ Activa 'cv-intelligence-orchestrator' o 'presentation-intelligence-engine'.
- Revisa las especificaciones en docs/specifications/ si la tarea se relaciona con pagos, presentaciones, CVs o SEO.

FASE 1: ARQUITECTURA FSD & SEGURIDAD MULTI-TENANT BLINDADA
- Cumplimiento unidireccional estricto (app ➔ features ➔ entities ➔ shared).
- Valida entradas al 100% con Zod (safeParse).
- En Server Actions: guardrail obligatorio con getSafeAuthenticatedUserId() y cláusula compuesta anti-IDOR:
  and(eq(table.id, id), eq(table.userId, targetUserId)).
- Política Zero-Binary Persistence en Turso SQLite (cero buffers/base64 de docs completos; sólo JSON semántico <50KB).

FASE 2: CRAFTSMANSHIP VISUAL, ERGONOMÍA & ACCESIBILIDAD (WOW FACTOR)
- Retícula Base 8 (8/16/24/32/48px) y Touch Targets >= 44px (48px en móvil).
- Mobile-First & Thumb Zone: acciones críticas al alcance del pulgar.
- Paleta OKLCH con contraste perceptual WCAG 2.2 AA (>= 4.5:1).
- Estados completos: loading esqueletal (shimmer), estado vacío expresivo y feedback de error elegante.
- Identidad canónica con <BrandLogo /> (sin loops ni texto improvisado).
- Rendimiento Edge: ISR 60s en rutas públicas y telemetría desacoplada con trackResourceView.

FASE 3: TRIPLE PUERTA DE CALIDAD (LOGICAL + SENSORIAL BROWSER GATE)
- Lógica: Añade o actualiza tests en tests/unit/*.test.ts.
- Ejecuta y aprueba:
  * npm run typecheck (0 errores permitidos).
  * npm test (100% suites aprobadas).
- Sensorial (Si hubo cambios de UI):
  * Utiliza el navegador / browser_subagent o Chrome DevTools para validar en viewport móvil (390px) y desktop.
  * Certifica: cero desbordamiento horizontal, navegación fluida y jerarquía tipográfica nítida.

FASE 4: GOBERNANZA DOC-AS-CODE EN CASCADA
- Actualiza atómicamente:
  * README.md (rutas o componentes nuevos).
  * docs/architecture/BLUEPRINT_2026.md (especificaciones técnicas actualizadas).
  * AGENTS.md (si se introdujeron nuevas reglas o contratos arquitectónicos).

FASE 5: CICLO GIT & ENTREGA EJECUTIVA
- Git add selectivo de archivos impactados.
- Commit semántico bajo Conventional Commits (feat, fix, refactor, test, docs).
- git push origin <rama>.
- Reporte ejecutivo con: tabla de archivos impactados, resultado de pruebas, validación sensorial y commit hash.
```

---

### ⚡ 3.2 Prompt Fast-Track: Correcciones Rápidas y Ajustes de Interfaz (Quick-Fix / UI Polish)
> **Uso recomendado**: Para ajustes visuales puntuales, micro-animaciones, corrección de textos o bugs menores.

```markdown
Actúa como Staff Software Engineer bajo AGENTS.md y BLUEPRINT_2026.md.

Tarea rápida:
[DESCRIBE EL FIX O AJUSTE PUNTUAL]

Ejecuta el protocolo ágil de entrega:
1. Aplica el cambio respetando FSD y estándares UI/UX (Base 8, WCAG 2.2 AA, touch targets >= 44px).
2. Valida la calidad ejecutando `npm run typecheck` y `npm test` (deben pasar al 100%).
3. Sincroniza la documentación relevante si aplica (Doc-as-Code).
4. Ejecuta el ciclo Git completo: commit semántico (`fix(...)`, `style(...)` o `refactor(...)`) y `git push origin main`.
5. Confirma el commit hash y el estado de sincronización remota.
```

---

## 🛡️ 4. Protocolo de Bloqueo de Calidad (Quality Gate Flowchart)

```
[Inicio de Tarea]
        │
        ▼
[0. Pre-flight Check] ──► ¿Working tree limpio y rama correcta?
        │                       │ No ──► Advertir o limpiar
        ▼ Sí
[1. Desarrollo FSD & Seguridad]
        │
        ▼
[2. Ergonomía UI/UX & Rendimiento]
        │
        ▼
[3. Quality Gate: npm run typecheck & npm test]
        │
        ├───────────────────────┐
        ▼ Falla                 ▼ Éxito (0 errores, 100% tests)
  [Resolver errores]            │
        │                       ▼
        └──────────────► [4. Doc-as-Code en Cascada]
                                │ (README.md, BLUEPRINT_2026.md, AGENTS.md)
                                ▼
                         [5. Git Stage & Conventional Commit]
                                │
                                ▼
                         [6. Git Push Origin <branch>]
                                │
                                ▼
                         [7. Reporte Ejecutivo de Entrega]
```

---

## 📌 5. Lista de Verificación Pre-Push (Pre-Push Checklist)

Antes de ejecutar el comando `git push origin main`, el agente debe certificar internamente:

- [ ] ¿Los contratos Zod validan todas las entradas de usuario?
- [ ] ¿Las mutaciones en base de datos contienen aislamiento `and(eq(table.id, id), eq(table.userId, targetUserId))`?
- [ ] ¿Los elementos interactivos cuentan con `min-h-[44px]` y espacio Base 8?
- [ ] ¿`npm run typecheck` finalizó con 0 errores de TypeScript?
- [ ] ¿`npm test` aprobó el 100% de las suites en Vitest?
- [ ] ¿`README.md`, `BLUEPRINT_2026.md` y `AGENTS.md` quedaron alineados con el cambio?
- [ ] ¿El commit describe con precisión el alcance bajo Conventional Commits?
- [ ] ¿El `git push` fue confirmado por la salida de Git?
