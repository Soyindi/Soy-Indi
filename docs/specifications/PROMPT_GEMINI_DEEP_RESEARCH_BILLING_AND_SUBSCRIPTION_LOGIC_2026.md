# 💳 PROMPT MAESTRO DE DEEP RESEARCH PARA GEMINI: ARQUITECTURA DE SUSCRIPCIONES MULTI-PLAN, CICLO DE VIDA, COBRO Y SEGURIDAD ANTI-FRAUDE (SAAS 2026)
## INGENIERÍA DE BILLING, STATE MACHINE DE ENTITLEMETS, PRORRATEO, DOWNGRADE/UPGRADE Y VERIFICACIÓN CRIPTOGRÁFICA DE PAGOS

---

### 📋 INSTRUCCIONES DE EJECUCIÓN PARA GEMINI:
> **Rol Asignado:** Actúa como **Principal Billing Architect, Head of Subscription Engineering & Staff Software Engineer** de clase mundial, especializado en el diseño de motores de facturación SaaS, microservicios de entitlements, state machines de suscripción (Stripe Billing, Zuora, Paddle, Recurly) y pasarelas de pago con alta disponibilidad (Flow.cl, Fintoc, Webpay Plus, Mercado Pago).
>
> **Objetivo:** Ejecutar una **investigación exhaustiva, matemáticamente rigurosa y arquitectónicamente blindada (Deep Research de Grado Industrial)** respondiendo a las preguntas críticas de negocio y técnica sobre cómo gestionar un sistema SaaS con múltiples planes (Starter, Pro, Max) con facturación mensual y semestral, garantizando una transición impecable de planes, reglas claras de expiración y un protocolo inviolable de verificación de pagos.
>
> **Nivel de Rigor:** Respuestas con código tipado (TypeScript / SQL / Mermaid State Diagrams), fórmulas matemáticas de cálculo de tiempo y prorrateo, mitigación de vulnerabilidades de concurrencia (Race Conditions, Replay Attacks, Webhook Dropouts), y experiencia de usuario (UX) de estándar internacional.

---

### 💻 CONTEXTO DEL PRODUCTO (INDI SAAS 2026):
- **Plataforma:** SaaS de Identidad Digital, Networking Profesional, Smart CV ATS y Presentaciones Cinemáticas (`https://soyindi.cl`).
- **Pila Tecnológica:** Next.js 16 (App Router), React 19, TypeScript, Turso (LibSQL Serverless SQLite), Drizzle ORM, Better-Auth, Vercel Serverless/Edge, Flow.cl (API / Webhooks / HMAC-SHA256).
- **Catálogo de Planes ("El Semestre Irresistible"):**
  1. **Trial:** 3 Días de acceso total gratuito (sin tarjeta previa).
  2. **Plan Starter 🟢:** $2.500 CLP/mes o $6.000 CLP/semestre ($1.000 CLP/mes, 60% OFF).
  3. **Plan Pro 🔵 (Recomendado):** $4.990 CLP/mes o $15.000 CLP/semestre ($2.500 CLP/mes, 50% OFF).
  4. **Plan Max 🟣:** $8.990 CLP/mes o $29.990 CLP/semestre (~$4.990 CLP/mes, 44% OFF).

---

### 🎯 PROMPT DE INVESTIGACIÓN ESTRUCTURADO EN 6 EJES MAESTROS:

```markdown
Actúa como Principal Billing Architect & Staff Software Engineer. Realiza un Deep Research de grado industrial sobre la lógica, arquitectura y mejores prácticas para el sistema de pagos y suscripciones de INDI (https://soyindi.cl), respondiendo con máxima profundidad técnica y matemática a los siguientes 6 ejes:

---

### EJE 1: COEXISTENCIA Y TRANSICIÓN DE PLANES (UPGRADE, DOWNGRADE & CROSSGRADE)
1. **Regla de Exclusividad y Cambio de Plan:**
   - ¿Puede un usuario con un plan activo contratar o activar otro simultáneamente? ¿Por qué la regla dorada en SaaS es "Un usuario = Un plan activo a la vez"?
   - Si un usuario tiene **Plan Starter** activo con 20 días restantes y decide comprar el **Plan Pro**:
     a) ¿Qué ocurre con los 20 días ya pagados del Plan Starter?
     b) ¿Cómo se implementa el prorrateo financiero (*Proration Calculation*) en un entorno de pagos sin tarjeta recurrente guardada (one-off payments tipo Flow/Webpay)?
     c) ¿Debe cobrarse la diferencia inmediatamente o extender proporcionalmente la fecha de vigencia (*Time Credit Conversion*)? Desarrolla la fórmula matemática exacta:
        $$\text{Nuevo Tiempo} = \text{Días Pro Comprados} + \left(\text{Días Starter Restantes} \times \frac{\text{Precio Diario Starter}}{\text{Precio Diario Pro}}\right)$$
     d) ¿Qué sucede si el usuario intenta hacer un Downgrade (de Max a Starter) teniendo recursos creados que superan la cuota del nuevo plan (ej. tiene 8 tarjetas y Starter solo permite 3)? ¿Cómo se bloquea o archiva sin destruir datos?

---

### EJE 2: EL CICLO DE VIDA DEL TEMPORIZADOR Y LA EXPERIENCIA VISUAL (COUNTDOWN DYNAMICS)
1. **¿Tiene un plan activo cuenta regresiva?**
   - Análisis comparativo: ¿Por qué los SaaS modernos muestran cuentas regresivas con horas/minutos/segundos únicamente en períodos de urgencia (Trial de 3 días o últimos 3 días de ciclo) y no durante todo el mes o semestre?
   - ¿Qué impacto psicológico y de fatiga visual genera un reloj corriendo permanentemente frente al usuario?
   - ¿Cómo estructurar el estado visual:
     * *Días 30 a 4*: Badge estático de estado ("Plan Pro Activo • Renueva el 15 de Noviembre").
     * *Últimos 3 días*: Banner dinámico de renovación con cuenta regresiva en vivo.
2. **¿Qué sucede exactamente cuando el tiempo llega a cero ($t = 0$)?**
   - **Período de Gracia (*Grace Period*):** ¿Por qué nunca se debe cortar el servicio en el milisegundo 0? ¿Cuántos días de gracia (ej. 3 a 7 días) recomiendan Stripe y Zuora para permitir al usuario renovar antes de degradar el acceso?
   - **Estado `EXPIRED` vs `LOCKED` vs `READ-ONLY`:**
     a) ¿Se bloquean las tarjetas públicas `/c/[slug]` y currículums `/cv/[slug]` de inmediato, o se mantienen públicos en modo lectura mientras se bloquea la edición y creación en el panel?
     b) ¿Qué mensaje debe recibir un tercero si visita una tarjeta expirada tras el período de gracia?
     c) ¿Cómo se asegura la integridad de los datos para que el usuario no pierda su trabajo y pueda reactivarlo al pagar?

---

### EJE 3: PROTOCOLO DE COMPRA Y VERIFICACIÓN CRIPTOGRÁFICA ANTI-FRAUDE
1. **¿Cómo funciona el flujo técnico al momento de comprar el plan?**
   - Diagrama de secuencia (Mermaid) completo del flujo:
     `Cliente (Browser)` ➔ `Next.js Server (/api/checkout/session)` ➔ `Pasarela (Flow.cl)` ➔ `Redirección Navegador` ➔ `Pasarela (Webpay/Banco)` ➔ `Confirmación Asíncrona (Webhook IPN)` + `Retorno Navegador (POST /checkout/return/flow)` ➔ `Base de Datos (Turso SQLite)`.
2. **¿Cómo se asegura el sistema de que REALMENTE se pagó antes de activar la membresía?**
   - **Vulnerabilidad de Spoofing en el Navegador:** ¿Por qué NUNCA se debe confiar en los parámetros devueltos por la URL (`/checkout/success?status=approved`)?
   - **Consulta Server-to-Server Obligatoria (`/payment/getStatus`):** Explica por qué el backend de INDI debe invocar criptográficamente la API de Flow con `token` y firma HMAC-SHA256 para recibir el estado oficial `status: 2 (Pagada)`.
   - **Idempotencia y Prevención de Doble Acreditación:** Si tanto el Webhook IPN como el POST del retorno del navegador intentan activar al usuario al mismo tiempo, ¿cómo previene Turso SQLite y Drizzle ORM la duplicación mediante operaciones atómicas (`ON CONFLICT DO UPDATE` y transacciones en lote)?
   - **Firma Criptográfica HMAC-SHA256:** Detalla el algoritmo para firmar los parámetros con `secretKey` y verificar que ninguna respuesta o webhook haya sido manipulado por un intermediario (Man-in-the-Middle).

---

### EJE 4: STATE MACHINE DE USUARIO Y SUSCRIPCIÓN (MODELO DE DOMINIO)
1. **Definición de Estados Formales:**
   - Define la máquina de estados finita formal con los siguientes estados:
     * `ANONYMOUS`
     * `TRIAL` (3 días activos)
     * `ACTIVE` (Starter / Pro / Max pagado y vigente)
     * `GRACE_PERIOD` (Vencido pero con tolerancia temporal de 3-5 días)
     * `EXPIRED` (Solo lectura o bloqueado, requiere renovación)
     * `CANCELLED`
2. **Transiciones de Eventos:**
   - Define la tabla de transiciones: qué evento (`PAYMENT_APPROVED`, `TRIAL_EXPIRED`, `SUBSCRIPTION_LAPSED`, `UPGRADE_REQUESTED`, `REFUND_ISSUED`) cambia el estado y qué columnas de base de datos se alteran atómicamente.

---

### EJE 5: GOBERNANZA DE CACHÉ DE SESIÓN Y ACTUALIZACIÓN EN TIEMPO REAL
1. **El Problema del "Stale Session":**
   - En sistemas con autenticación JWT o sesiones cacheadas en cookies (Better-Auth), ¿por qué cuando la base de datos se actualiza a `status = 'ACTIVE'`, el navegador del usuario puede seguir mostrando `status = 'TRIAL'`?
   - Estrategias de invalidación perimetral:
     a) Revalidación en servidor con `revalidatePath('/dashboard')`.
     b) Invocación de `authClient.updateUser()` o refresh de token en cliente.
     c) Edge Middleware inspeccionando frescura de sesión.

---

### EJE 6: ARQUITECTURA DE IMPLEMENTACIÓN RECOMENDADA PARA INDI 2026
1. **Esquema de Base de Datos Óptimo (Drizzle SQLite):**
   - Estructura propuesta para las tablas `user`, `subscriptions`, `payments_history` y `entitlement_logs`.
2. **Checklist de Seguridad y Checklist para el Tech Lead:**
   - 10 mandamientos de ingeniería para garantizar cero fugas de dinero, cero accesos no pagados y cero fricción en la renovación.
```

---

### 📊 FORMATO DE SALIDA EXIGIDO A GEMINI:
1. **Resumen Ejecutivo:** Tabla comparativa de decisiones clave.
2. **Respuestas Técnicas Detalladas (Ejes 1 al 6):** Con diagramas Mermaid, fórmulas matemáticas en LaTeX y bloques de código TypeScript y SQL listos para producción.
3. **Plan de Acción de 3 Fases para INDI:** Paso 1 (Inmediato - Hotfix), Paso 2 (Mediano Plazo - Billing State Machine), Paso 3 (Largo Plazo - Auto-debit recurrente).
