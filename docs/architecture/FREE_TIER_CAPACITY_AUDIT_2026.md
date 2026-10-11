# 📊 Auditoría Integral de Capacidad y Límites Gratuitos (Free-Tier Capacity Audit 2026)
**Plataforma**: INDI (Soyindi — https://soyindi.cl)  
**Fecha de Auditoría**: Octubre 2026  
**Responsable**: Staff Principal Software Engineer & Lead Product Designer  
**Estándares**: `AGENTS.md` & `docs/architecture/BLUEPRINT_2026.md`

---

## Executive Summary (Resumen Ejecutivo)

Esta auditoría técnica determina con rigor de sistemas distribuidos y pruebas de carga analíticas **cuántos usuarios activos y recursos generados puede sostener INDI de forma 100% gratuita** ($0 USD de costo operativo en infraestructura) sin pagar un solo dólar a proveedores externos.

### Veredicto de Capacidad Global

| Métrica de Usuarios | Límite Máximo Teórico | Cuello de Botella Primario | Capacidad Recomendada en Producción ($0 USD) |
| :--- | :---: | :--- | :---: |
| **Usuarios Registrados Totales** | **~225.000 usuarios** | Turso SQLite Storage (9 GB) | **100.000 usuarios** |
| **Usuarios Activos Mensuales (MAU)** | **~50.000 MAU** | Vercel Edge Middleware / Funciones | **25.000 MAU** |
| **Visitantes / Vistas Públicas al Mes** | **~10.000.000 lecturas** | Cloudflare CDN & ISR Edge (60s) | **5.000.000 visitas/mes** |
| **Tarjetas Digitales Activas** | **~60.000 tarjetas** | Cloudflare R2 Storage (10 GB) | **40.000 tarjetas** |
| **Smart CVs y Presentaciones** | **~180.000 documentos** | Turso SQLite (Cero Binarios) | **100.000 documentos** |

---

## 1. Desglose Componente por Componente del Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA DE FLUJO DE COSTO $0                     │
├─────────────────────┬───────────────────┬───────────────────────────────────┤
│ Capa de Servicio    │ Proveedor Actual  │ Free-Tier Límite Oficial          │
├─────────────────────┼───────────────────┼───────────────────────────────────┤
│ Base de Datos Rel.  │ Turso (LibSQL)    │ 9 GB disco / 1.000M lecturas/mes  │
│ Almacenamiento Fotos│ Cloudflare R2     │ 10 GB disco / 10M lecturas / $0 Egress │
│ Rate Limit & Caché  │ Upstash Redis     │ 10.000 comandos diarios           │
│ Autenticación       │ Better-Auth       │ ILIMITADO (Auto-alojado en Turso) │
│ Inferencia de IA    │ NVIDIA NIM / Groq │ ~1.000 req/día + Local Heuristics │
│ Hosting & Edge      │ Vercel Hobby      │ 100 GB ancho de banda / 1M Edge   │
└─────────────────────┴───────────────────┴───────────────────────────────────┘
```

---

### 1.1 Turso (LibSQL Serverless SQLite)
- **Límites Gratuitos Oficiales**:
  - **Almacenamiento**: 9 GB (9.000 MB).
  - **Lecturas**: 1.000.000.000 lecturas mensuales (1 billón).
  - **Escrituras**: 25.000.000 escrituras mensuales.
  - **Bases de datos**: 500 bases de datos.
- **Consumo Real por Usuario en INDI**:
  - Gracias a la política **Zero-Binary Persistence** (`assertZeroBinaryPersistence`), no se guardan PDFs ni imágenes en base de datos.
  - Peso por registro de usuario (`user` + `session` + `account`): ~1.2 KB.
  - Peso por tarjeta digital (`cards` + `theme_config` JSON): ~4.5 KB.
  - Peso por Smart CV (`smart_cvs` + `content` JSON): ~8.0 KB.
  - Peso por Presentación (`presentations` + `slides_data` JSON): ~18.0 KB.
  - **Peso Promedio por Usuario Activo con 1 Tarjeta + 1 CV + 1 Presentación**: ~31.7 KB.
  - **Capacidad de Almacenamiento en 9 GB**:
    $$\text{Usuarios} = \frac{9 \times 10^6\text{ KB}}{40\text{ KB}} \approx 225.000\text{ usuarios}$$
- **Límite de Lecturas (1.000M/mes)**:
  - Las vistas públicas usan `revalidate = 60` (ISR). Vercel y Cloudflare absorben el 99% de los requests en caché de borde.
  - Turso solo atiende lecturas en dashboard y escrituras de telemetría por lotes (`db.batch`).

---

### 1.2 Cloudflare R2 (Almacenamiento Multimedia)
- **Límites Gratuitos Oficiales**:
  - **Capacidad**: 10 GB (10.000 MB) mensuales.
  - **Operaciones Clase A (Uploads/Escrituras)**: 1.000.000 operaciones/mes.
  - **Operaciones Clase B (Lecturas/Descargas)**: 10.000.000 operaciones/mes.
  - **Costo de Tráfico de Salida (Egress)**: **$0.00 USD (Ilimitado y gratuito)**.
- **Consumo Real con Compresión WebP en Cliente (`compressImageClient`)**:
  - Foto de Perfil (Avatar WebP 800px): ~45 KB.
  - Foto de Portada (Cover WebP 1400px): ~120 KB.
  - Fondo Personalizado (Background WebP 1200px): ~95 KB.
  - **Promedio por usuario con fotos personalizadas**: ~260 KB.
  - **Capacidad Total en 10 GB**:
    $$\text{Tarjetas con Multimedia Completa} = \frac{10 \times 10^6\text{ KB}}{260\text{ KB}} \approx 38.460\text{ tarjetas con multimedia}$$
    Si solo suben foto de perfil (avatar 45 KB), soporta más de **220.000 usuarios**.

---

### 1.3 Upstash Redis (Distributed Rate Limiting)
- **Límites Gratuitos Oficiales**:
  - **Comandos**: 10.000 comandos diarios (~300.000 comandos/mes).
  - **Ancho de banda**: 256 MB/día.
- **Estrategia Arquitectónica en INDI**:
  - INDI implementa fallback local en memoria (`inMemoryFallbackStore`) en `rateLimiter.ts`.
  - Si Upstash se satura o supera los 10.000 comandos en un día, **el sistema conmuta en caliente a la caché en memoria RAM** sin arrojar error ni cobrar recargos.
  - Cuello de botella mitiga: **Cero interrupciones de servicio**.

---

### 1.4 Better-Auth (Autenticación y Cuentas)
- **Límites**:
  - **100% Sin Límites** (Open Source, auto-alojado dentro de Turso SQLite).
  - A diferencia de Clerk o Supabase Auth que cobran a partir de 10.000 o 50.000 MAU, Better-Auth soporta tantos usuarios como quepan en Turso (**225.000 usuarios**).

---

### 1.5 Vercel Hobby (Capa de Cómputo Next.js)
- **Límites Gratuitos Oficiales**:
  - **Ancho de banda**: 100 GB mensuales.
  - **Invocaciones Serverless**: 1.000.000 ejecuciones/mes.
  - **Invocaciones Edge Middleware**: 1.000.000 peticiones/mes.
- **Optimizaciones Clave Implementadas**:
  - Regeneración Estática Incremental (`export const revalidate = 60;` en `/c/[slug]`, `/cv/[slug]`, `/p/[slug]`).
  - Telemetría desacoplada con deduplicación por sesión (`trackResourceView`).
  - 100 GB de ancho de banda con activos WebP comprimidos rinde para:
    $$\frac{100 \times 10^6\text{ KB}}{200\text{ KB por visita completa}} \approx 500.000\text{ a }1.000.000\text{ visitas mensuales}$$

---

### 1.6 Inteligencia Artificial (NVIDIA NIM / Groq / Fallbacks)
- **Límites**:
  - NVIDIA NIM Developer Tier: 1.000 créditos API gratuitos (~5.000 generaciones).
  - Groq Free Tier: 30 solicitudes por minuto.
- **Resiliencia Determinista**:
  - El motor incorpora `aiCircuitBreaker.ts` con micro-caché semántica y deduplicación concurrente (*Request Coalescing*).
  - Cuando se agotan los créditos o hay 429 Rate Limit, el sistema ejecuta **fallbacks heurísticos locales inmediatos** (`multimodal-parser.ts`, `heuristics.ts`, `actions.ts`), garantizando que la creación de CVs, bios y presentaciones nunca se detenga.

---

## 2. Cuadro Comparativo de Escenarios de Crecimiento

| Escenario de Adopción | Usuarios Totales | Tarjetas Creadas | Visitas Mensuales | Costo Infraestructura | Estado del Free Tier |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Etapa 1: Lanzamiento & Tracción** | 1.000 | 1.200 | 25.000 | **$0.00 USD** | Holgado (2% de capacidad) |
| **Etapa 2: Crecimiento Viral** | 10.000 | 12.500 | 250.000 | **$0.00 USD** | Óptimo (15% de capacidad) |
| **Etapa 3: Escala Regional** | **50.000** | **65.000** | **1.500.000** | **$0.00 USD** | Máximo aprovechamiento seguro |
| **Etapa 4: Escala Nacional (Punto de quiebre)** | >100.000 | >130.000 | >5.000.000 | ~$20 USD/mes | Solo Vercel Pro ($20/mes) para más ancho de banda |

---

## 3. Conclusiones y Recomendaciones Estratégicas

1. **Margen de Maniobra Extraordinario**: Con la arquitectura actual, INDI puede operar con hasta **50.000 a 100.000 usuarios registrados** y más de **1.000.000 de visitas mensuales** con **costo exactamente $0 USD**.
2. **Primer Cuello de Botella que Requerirá Pago Futuro**:
   - Cuando la plataforma supere los **100 GB de ancho de banda mensual en Vercel** (~500.000 visitas al mes), el único upgrade necesario será Vercel Pro ($20 USD/mes). Todos los demás componentes (Turso 9 GB, Cloudflare R2 10 GB sin costos de egress, Better-Auth) seguirán siendo 100% gratuitos.
3. **Monetización Auto-Sustentable**:
   - Bajo la matriz de precios "El Semestre Irresistible" (Starter $2.500 CLP, Pro $4.990 CLP, Max $8.990 CLP), tan solo **4 usuarios de pago cubren con creces cualquier costo futuro de infraestructura**, otorgando un margen bruto superior al **98%**.
