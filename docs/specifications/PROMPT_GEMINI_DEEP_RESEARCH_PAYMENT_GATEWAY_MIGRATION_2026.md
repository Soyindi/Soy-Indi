# 💳 PROMPT MAESTRO DE DEEP RESEARCH PARA GEMINI: AUDITORÍA Y MIGRACIÓN DE PASARELA DE PAGOS (INDI SAAS 2026)
## ARQUITECTURA FINTECH, CONVERSIÓN EN CHILE/LATAM, REDUCCIÓN DE RECHAZO DE TARJETAS Y ESTRATEGIA DE MIGRACIÓN

---

### 📋 INSTRUCCIONES DE EJECUCIÓN PARA GEMINI:
> **Rol Asignado:** Actúa como **Principal Fintech Architect, Head of Payments Engineering & Staff Software Engineer** especializado en pasarelas de pago, suscripciones SaaS recurrentes y ecosistemas financieros en Chile y América Latina. Cuentas con experiencia directa en integraciones con Stripe, Mercado Pago, Transbank (Webpay Plus), Fintoc, Flow, Kushki, dLocal y transferencias bancarias automatizadas (A2A).
> 
> **Objetivo:** Ejecutar una **investigación profunda, rigurosa y fundamentada (Deep Research de Grado Industrial)** para diagnosticar por qué **Mercado Pago rechaza un porcentaje considerable de tarjetas de débito/crédito en Chile**, identificar las tendencias de pago actuales (2026), evaluar exhaustivamente las mejores alternativas del mercado chileno e internacional, y definir una **hoja de ruta de migración arquitectónica paso a paso** para la plataforma SaaS **INDI** (`https://soyindi.cl`).
> 
> **Nivel de Rigor:** Máximo rigor técnico, financiero y regulatorio. Cero generalidades o respuestas de manual de marketing. Cada conclusión debe estar sustentada en tasas reales de aceptación (authorization rates), costos de adquirencia, soporte para pagos recurrentes/suscripciones en Chile, comisiones fijas/porcentuales, fricción UX (3D Secure / OTP vs One-Click), contratos de webhook idempotentes y compatibilidad con el stack de INDI.

---

### 💻 CONTEXTO TÉCNICO Y COMERCIAL DE LA PLATAFORMA (INDI):

- **Plataforma:** SaaS de Identidad Digital, Tarjetas Digitales Vivas, Smart CV y Presentaciones Cinemáticas (`https://soyindi.cl`).
- **Público Objetivo:** Profesionales independientes, emprendedores, consultores, ejecutivos y empresas en Chile (con proyección a LatAm).
- **Modelo de Precios ("El Semestre Irresistible"):**
  - **Plan Starter 🟢:** $2.500 CLP / mes o $6.000 CLP / semestre.
  - **Plan Pro 🔵 (Recomendado):** $4.990 CLP / mes o $15.000 CLP / semestre.
  - **Plan Max 🟣:** $8.990 CLP / mes o $29.990 CLP / semestre.
- **Programa de Afiliados:** Liquidaciones quincenales del **25% en CLP** sobre transacciones netas aprobadas.
- **Stack Tecnológico:**
  - **Framework:** Next.js 16 (App Router) + React 19 (Server Components & Server Actions).
  - **Base de Datos & Edge:** Turso (LibSQL Serverless SQLite) + Drizzle ORM (Batching multi-statement).
  - **Autenticación:** Better-Auth con soporte Google OAuth multi-cuenta y sesiones HttpOnly.
  - **Infraestructura:** Vercel Edge/Serverless, Cloudflare R2 para multimedia, dominio canónico `soyindi.cl`.
  - **Arquitectura de Software:** Feature-Sliced Design (FSD: `app/` ➔ `features/` ➔ `entities/` ➔ `shared/`).
- **Problema Crítico Actual:**
  - La integración actual con Mercado Pago SDK v2 (`/api/checkout/mercadopago`) presenta **tasas elevadas de rechazo de tarjetas en Chile**, especialmente con tarjetas de débito prepago (Mach, Tenpo, Dale Coopeuch, Mercado Pago Card, CuentaRUT Visa Débito) y ciertas tarjetas bancarias tradicionales emitidas por Banco Santander, BancoEstado, Bci e Itaú.
  - Los usuarios experimentan rechazos con mensajes ambiguos ("No pudimos procesar tu pago", "Usa otro medio de pago") sin código de rechazo claro ni reintento transparente.
  - Mercado Pago Checkout Pro redirige al usuario a una interfaz externa saturada que induce al usuario a iniciar sesión con cuenta de Mercado Pago / Mercado Libre, generando fricción de conversión masiva.

---

### 🎯 PROMPT DE INVESTIGACIÓN ESTRUCTURADO EN 7 EJES:

```markdown
Actúa como Principal Payments Architect & Staff Software Engineer. Realiza un Deep Research exhaustivo y un plan maestro de migración de pasarela de pago para el SaaS INDI (https://soyindi.cl) cubriendo rigurosamente los siguientes 7 ejes:

---

### EJE 1: DIAGNÓSTICO FORENSE DE RECHAZOS EN MERCADO PAGO CHILE
1. **Razones Técnicas del Rechazo de Tarjetas:**
   - ¿Cuáles son las causas fundamentales por las que Mercado Pago rechaza transacciones en Chile con tarjetas de débito, prepago (Mach, Tenpo, Coopeuch) y CuentaRUT Débito?
   - ¿Qué papel juegan los algoritmos antifraude de Mercado Pago (Machine Learning score), las banderas de riesgo por IPs de data center/VPN y los rechazos directos del switch adquirente local?
   - ¿Por qué Checkout Pro exige forzosamente o induce al inicio de sesión de Mercado Libre/Mercado Pago para tarjetas locales y cómo impacta esto en el abandono del carrito?
   - ¿Qué limitaciones presenta Mercado Pago para modelos de suscripción SaaS recurrente con tarjeta de débito en Chile (tokenización, 3DS v2.2, cobros diferidos)?

---

### EJE 2: TENDENCIAS DEL ECOSISTEMA FINTECH & MÉTODOS DE PAGO EN CHILE (2026)
1. **Adopción de Métodos Alternativos:**
   - ¿Cuál es la penetración actual y preferencia de los usuarios chilenos entre:
     a) Webpay Plus (Transbank - Débito/Crédito Redcompra y Prepago).
     b) Pagos cuenta a cuenta (A2A) e iniciación de transferencias bancarias vía Open Finance / APIs (Fintoc, Khipu, Floid).
     c) Billeteras digitales (Apple Pay, Google Pay, Mercado Pago Wallet).
     d) Tarjetas de crédito internacionales tradicionales (Visa, Mastercard, Amex).
2. **Impacto en Conversión (Checkout Friction vs Authorization Rate):**
   - Comparativa de tasas de autorización reales en Chile: ¿Qué método tiene la mayor tasa de éxito (95%+) en transacciones de ticket bajo/medio ($2.500 CLP a $30.000 CLP)?
   - Análisis de fricción: Tiempos de checkout, pasos requeridos (redirección a banco vs One-Click / Guardar tarjeta).

---

### EJE 3: BENCHMARK Y EVALUACIÓN COMPARATIVA DE PASARELAS PARA CHILE & LATAM
Analiza y califica en una matriz técnica detallada las siguientes opciones:
1. **Fintoc (Iniciación de Pagos A2A & Débito Directo):**
   - Pros y contras para suscripciones SaaS mensuales/semestrales.
   - Costos por transacción (comisión fija vs porcentual).
   - Tasa de rechazo y compatibilidad bancaria (BancoEstado, Santander, Chile, Bci, etc.).
   - Capacidad de cobro recurrente automático (Suscripciones bancarias / Débito en cuenta).
2. **Webpay Plus / Transbank (Vía Webpay Direct o Integradores):**
   - Tasas de adquirencia reguladas en Chile.
   - Experiencia de usuario (Onepay, Webpay Mall, Webpay Plus Tokenización/PatPass).
   - Dificultades operativas (contratos, tiempos de liquidación a cuenta corriente, soporte técnico).
3. **Flow.cl:**
   - Modelo de agregador multicanal (Webpay, Servipag, Mach, Chek, Crypto, Fintoc).
   - Experiencia de API, estabilidad de webhooks y costos por transacción.
   - Soporte para cobros recurrentes y planes de suscripción.
4. **Stripe Chile:**
   - Estado de soporte oficial de Stripe para empresas y cuentas en Chile (CLP nativo, cuentas bancarias chilenas, adquirencia local).
   - Stripe Billing / Customer Portal para SaaS recurrente en pesos chilenos.
   - Tasas de autorización con tarjetas chilenas (¿sigue tratando las tarjetas locales como cross-border si la cuenta no es local?).
5. **Kushki / dLocal Go:**
   - Especialización en pagos recurrentes en LatAm.
   - Requisitos de volumen mínimo, costos y facilidad de integración para startups/SaaS.

---

### EJE 4: MATRIZ DE DECISIÓN & RECOMENDACIÓN TÉCNICA DEFINITIVA PARA INDI
1. **Puntaje Ponderado (Scorecard):**
   - Evalúa cada opción según:
     - Tasa de éxito/autorización de pagos en Chile (30%).
     - Fricción de usuario y UX moderna (20%).
     - Costos de comisión y comisiones fijas sobre tickets de $2.500 CLP (20%).
     - Soporte para suscripciones recurrentes y semestrales (15%).
     - Facilidad de integración técnica en Next.js 16 / TypeScript / FSD (15%).
2. **Arquitectura Recomendada:**
   - ¿Debemos reemplazar completamente Mercado Pago o adoptar una estrategia híbrida/dual (ej. Pasarela Primaria de Alta Tasa + Fallback inteligente)?
   - ¿Cuál es la pasarela #1 indiscutible para maximizar los ingresos y la satisfacción de los clientes de INDI?

---

### EJE 5: DISEÑO DE LA ARQUITECTURA DE INTEGRACIÓN Y CONTRATOS TÉCNICOS
Diseña la arquitectura de integración para la opción ganadora respetando la arquitectura de INDI:
1. **Capa Entities (`src/entities/subscription/`):**
   - Contratos Zod para creación de intenciones de pago, checkout sessions y payloads de webhook.
   - Esquema de base de datos Drizzle ORM para trazabilidad de pagos (`payments_history`) y suscripciones (`subscriptionStatus`, `subscriptionEndsAt`, `paymentProvider`, `providerSubscriptionId`).
2. **Capa Shared (`src/shared/lib/payments/`):**
   - Cliente SDK tipado o cliente HTTP nativo con reintentos y timeouts.
   - Verificación criptográfica de firma de webhooks (HMAC-SHA256) con protección contra replay attacks (delta timestamp $\le 300\text{s}$).
3. **Capa App / Route Handlers (`src/app/api/checkout/...` y `/api/webhooks/...`):**
   - Endpoint de inicio de checkout con validación de sesión (`getSafeAuthenticatedUserId`).
   - Webhook handler asíncrono con `db.batch()` para activar suscripción y registrar comisión de afiliados (25% CLP) de forma atómica.
4. **Capa Features UI (`src/features/pricing/`):**
   - Flujo de checkout con estados de carga claros, manejo de errores descriptivos y touch targets ergonómicos ($\ge 44\text{px}$).

---

### EJE 6: IMPACTO EN EL PROGRAMA DE AFILIADOS Y REPORTABILIDAD FINANCIERA
1. **Liquidación del 25% de Comisiones:**
   - ¿Cómo impactan las comisiones de la nueva pasarela en el cálculo del 25% neto para afiliados?
   - Conciliación de montos brutos vs netos en la tabla `affiliate_commissions`.
2. **Gestión de Reembolsos, Devoluciones y Chargebacks:**
   - Protocolo automatizado para procesar eventos de reembolso (`refunded`) o disputa (`dispute_created`) revirtiendo el estado de suscripción y cancelando la comisión de afiliados asociada.

---

### EJE 7: PLAN DE MIGRACIÓN PASO A PASO (ROLLOUT DEGRADADO Y CERO DOWNTIME)
1. **Fase 1: Preparación y Abstracción:**
   - Creación de una interfaz agnóstica de pagos (`PaymentProviderAdapter`).
2. **Fase 2: Implementación en Paralelo (Feature Flag / Canario):**
   - Cómo testear en staging y habilitar el nuevo método para un porcentaje de usuarios sin romper los enlaces activos de Mercado Pago.
3. **Fase 3: Migración de Suscripciones Activas:**
   - Cómo manejar a los usuarios que ya pagaron por Mercado Pago (respetar su `subscriptionEndsAt` hasta el fin del ciclo).
4. **Fase 4: Deprecación Segura:**
   - Retiro progresivo del SDK de Mercado Pago manteniendo únicamente los endpoints de webhook históricos para eventos tardíos.
5. **Fase 5: Métricas de Éxito:**
   - Indicadores clave de rendimiento (KPIs): Tasa de aprobación post-migración, reducción del abandono de checkout, tiempo medio de confirmación de pago y NPS del cliente.
```

---

### 📤 ESTRUCTURA REQUERIDA DE LA RESPUESTA DE GEMINI:
1. **Resumen Ejecutivo:** Veredicto claro con la recomendación número 1 y el análisis del porqué.
2. **Análisis Forense Detallado de Mercado Pago en Chile:** Causas técnicas de rechazo por tipo de tarjeta y banco emisor.
3. **Tabla Comparativa Completa:** Comparativa técnica y económica de las 6 pasarelas evaluadas (Fintoc, Webpay Plus, Flow, Stripe Chile, Kushki, Mercado Pago).
4. **Arquitectura y Código Fuente de Referencia:**
   - Contratos Zod para entrada y webhook.
   - Validador criptográfico de firma.
   - Endpoint Route Handler de checkout.
   - Webhook Handler con transacción atómica en base de datos.
5. **Hoja de Ruta de Migración (Gantt Conceptual en 5 Pasos):** Pasos concretos para ejecutar el cambio sin interrumpir el servicio.
