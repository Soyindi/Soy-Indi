# 📊 Auditoría Integral de Capacidad y Límites de Infraestructura (2026 Update)
**Plataforma**: INDI (Soyindi — https://soyindi.cl)  
**Fecha de Actualización**: Octubre 2026 (Revisión de Cumplimiento Comercial, Legal & Multi-Tier)  
**Responsable**: Staff Principal Software Engineer & Lead Product Designer  
**Estándares**: `AGENTS.md` & `docs/architecture/BLUEPRINT_2026.md`

---

## Executive Summary (Resumen Ejecutivo de Gobernanza)

Esta actualización recalibra los supuestos técnicos del plan de infraestructura de INDI bajo tres vectores críticos:
1. **Gobernanza de Hosting Comercial**: Cumplimiento de términos comerciales de Vercel (Requerimiento de Vercel Pro $20 USD/mes para actividades de cobro y monetización SaaS, evitando pausas operativas de 30 días).
2. **Realidad de Cuotas Turso 2026**: Ajuste al esquema oficial vigente de Turso (Free Tier: 5 GB disco, 100 DBs, 500M lecturas, 10M escrituras vs Developer Tier: $4.99 USD/mes con 9 GB disco, 1.000M lecturas, 25M escrituras y 10 días de Point-in-Time Recovery).
3. **Privacidad y Cumplimiento Normativo Ley N° 21.719**: Implementación de controles Privacy-by-Design para el tratamiento de currículums, teléfonos y RUTs previo a la inferencia LLM, junto al inventario de subprocesadores con contratos DPA.

### Matriz de Costo Realista vs Auto-Sustentabilidad

| Concepto de Infraestructura | Plan Gratuito (Dev/Staging) | Plan Recomendado en Producción | Justificación Técnica & Normativa |
| :--- | :---: | :---: | :--- |
| **Hosting & Edge Routing** | Vercel Hobby ($0) | **Vercel Pro ($20 USD/mes)** | Cumplimiento de Fair Use para cobro comercial; funciones hasta 60s, sin freeze de 30 días. |
| **Base de Datos Distribuida** | Turso Free ($0 - 5 GB) | **Turso Developer ($4.99 USD/mes)** | 9 GB, 25M escrituras (telemetría), 10 días Point-in-Time Recovery y SLA garantizado. |
| **Almacenamiento Multimedia** | Cloudflare R2 ($0) | **Cloudflare R2 ($0 USD)** | 10 GB almacenamiento, $0 costos de salida (Zero Egress). |
| **Rate Limiting & Caché** | Upstash Redis Free ($0) | **Upstash Free ($0 USD)** | 500.000 comandos/mes con fallback de memoria local ante contingencias. |
| **Inferencia de IA** | NVIDIA NIM / Groq Free | **Groq Paid / OpenAI Tier 1 (~$5 USD variable)** | Términos comerciales sin retención ni uso de datos de usuarios para entrenamiento. |
| **TOTAL COSTO BASE PRODUCCIÓN** | **$0.00 USD/mes** | **~$25 - $30 USD/mes** | Financiado íntegramente con **5 a 6 suscripciones Starter** ($2.500 CLP). |

---

## 1. Desglose Detallado de Proveedores y Cuotas Oficiales 2026

### 1.1 Vercel: Gobernanza de Términos Comerciales & Fair Use
- **Vercel Hobby**:
  - Restricción formal: Uso exclusivamente personal o no comercial.
  - Riesgo operativo: Proyectos que superan límites en Hobby quedan pausados por hasta 30 días sin opción de sobrefacturación elástica.
- **Vercel Pro ($20/mes por asiento)**:
  - Habilitación de actividad comercial SaaS y cobro de suscripciones.
  - Concurrencia de despliegues preview (Staging automático en cada Pull Request).
  - Tiempo de ejecución de Serverless Functions ampliado de 10s hasta 60s (esencial para ingesta multimodal de CVs).
  - 1 TB de ancho de banda y 1.000.000 de llamadas a funciones serverless por mes.

### 1.2 Turso LibSQL: Cuotas Reales 2026
- **Turso Free Tier (Límites Oficiales 2026)**:
  - 5 GB de almacenamiento total.
  - 100 bases de datos.
  - 500.000.000 lecturas mensuales.
  - 10.000.000 escrituras mensuales.
  - 1 día de Point-in-Time Recovery (PITR).
- **Turso Developer Tier ($4.99/mes)**:
  - 9 GB de almacenamiento total.
  - 500 bases de datos.
  - 1.000.000.000 lecturas mensuales.
  - 25.000.000 escrituras mensuales.
  - 10 días de PITR (crítico para auditoría y recuperación ante desastres).
- **Análisis de Consumo por Escrituras de Telemetría**:
  - El cuello de botella principal de Turso en SaaS de alto tráfico no es el disco sino las **escrituras concurrentes de telemetría**.
  - Mitigación en INDI: Uso estricto de `db.batch` en `src/entities/telemetry/actions.ts` y deduplicación por sesión (`trackResourceView`), reduciendo escrituras en un 80%.

### 1.3 Inteligencia Artificial y Privacidad de Datos
- **Entornos de Desarrollo vs Producción**:
  - Las capas gratuitas de evaluación (como NVIDIA NIM Developer) están limitadas a ~40 RPM y sus términos de uso no otorgan las garantías de retención cero requeridas para datos sensibles en producción.
  - En producción, INDI opera con proveedores con API comercial de pago (Groq, OpenAI o Anthropic vía contratos comerciales) donde las entradas y salidas **NO se utilizan para reentrenar modelos fundacionales**.
- **Sanitización Privacy-by-Design (`dataPrivacy.ts`)**:
  - Enmascaramiento preventivo de RUTs (`[RUT_PROTEGIDO]`) y teléfonos chilenos (`[TELEFONO_PROTEGIDO]`) antes de enviar texto a modelos externos.

### 1.4 Cumplimiento Normativo Ley N° 21.719 (Chile)
- **Entrada en vigor**: 1 de diciembre de 2026.
- **Obligaciones implementadas en código**:
  - **Derecho de Acceso y Portabilidad**: Server Action `exportUserDataAction` en `/dashboard?tab=privacy`.
  - **Derecho al Olvido**: Server Action `deleteAndAnonymizeUserAccountAction` con confirmación destructiva explícita.
  - **Inventario Canónico de Subprocesadores (Artículo 15)**: Declaración transparente de Turso, Vercel, Cloudflare, Upstash, Flow, Mercado Pago y Fintoc con DPA y enlaces a políticas oficiales.

---

## 2. Plan de Acción y Hoja de Ruta Priorizada

### Prioridad 1: Inmediato (Antes del 1 de Diciembre)
1. **Migración a Vercel Pro**: Regularizar la cuenta de Vercel para cumplimiento de términos comerciales.
2. **Upgrade a Turso Developer ($4.99/mes)**: Habilitar PITR de 10 días y cuota de 25M de escrituras para absorber telemetría.
3. **Respaldo Automatizado a Cloudflare R2**: Configurar script de snapshot lógico diario de SQLite hacia bucket R2.
4. **Activación del Panel de Privacidad**: Vista interactiva en `/dashboard?tab=privacy` con exportación JSON y supresión de cuenta.

### Prioridad 2: Próximos 90 Días
5. **Colas Asíncronas con Upstash QStash**: Encolado de eventos de telemetría y tareas de IA para evitar bloqueos en requests de usuario.
6. **Alertas Proactivas de Consumo**: Configuración de webhooks de notificación al 70% y 90% de cuota en Turso y Vercel.
7. **Pruebas E2E de Flujo Crítico**: Cobertura con Playwright para el ciclo Checkout Flow -> Retorno -> Activación de Membresía.
8. **Reconciliación Automática de Pagos**: Cron diario de verificación entre transacciones de Flow/Mercado Pago y registros en `payments_history`.
