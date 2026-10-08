# 🇨🇱 Prompt Maestro de Deep Research (Gemini 2.5 / Advanced 2026)
## Estrategia Integral para Posicionar a INDI como la Plataforma #1 en Google Chile (google.cl)

Este documento contiene la directiva ejecutiva y el **Prompt Maestro de Deep Research de Grado Industrial** para ser ejecutado en **Gemini 2.5 Pro**, **Gemini Advanced (Deep Research)** o **Google AI Studio / Gemini API**. 

Su objetivo exclusivo es investigar a fondo el ecosistema de búsqueda en Chile para construir la hoja de ruta que coloque a **INDI ([https://soyindi.cl](https://soyindi.cl))** en la **posición #1 orgánica** en Google Chile para sus tres líneas de servicio:
1. **Tarjetas de Presentación Digitales Inteligentes (QR + NFC)**
2. **Smart CVs y Currículum Vitae optimizado para ATS en Chile**
3. **Presentaciones Ejecutivas Orbitales Interactivas (16:9 Pitch Decks)**

Acompaña a la especificación técnica en JSON: [`docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_GOOGLE_CHILE_SEO_NO1_2026.json`](file:///c:/Users/Mat%C3%ADas%20Riquelme/Desktop/Indi/docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_GOOGLE_CHILE_SEO_NO1_2026.json).

---

### 📋 Instrucciones de Ejecución para el Operador

1. **Modo Deep Research (Gemini Advanced)**:
   - Abre [Gemini Advanced](https://gemini.google.com), activa la funcionalidad de **Deep Research** y copia el bloque de prompt maestro que se encuentra a continuación.
2. **Modo Google AI Studio / Gemini API**:
   - Modelo: `gemini-2.5-pro` (o `gemini-2.5-flash` con Thinking activado $\ge 8.192$ tokens).
   - Temperature: `0.25` (Máxima rigurosidad analítica y precisión estratégica).
   - Top_P: `0.95`.
   - System Instruction: Pega el bloque de directivas de rol y contexto de INDI.

---

### 🧠 Bloque Maestro del Prompt para Copiar y Pegar en Gemini

```markdown
Actúa como Principal SEO Architect, Staff Search Engineer y VP de Crecimiento Orgánico con experiencia directa en los equipos de clasificación de Google Search, ingeniería SEO en Vercel y liderazgo de crecimiento para productos SaaS en América Latina.

Estamos escalando la plataforma SaaS de identidad y productividad profesional INDI (sitio web canónico oficial: https://soyindi.cl).
Nuestra infraestructura técnica de vanguardia está compuesta por:
- Framework: Next.js 16 App Router + React 19 (Server Components, Edge Runtime, Partial Prerendering).
- Estética y Rendimiento: Tailwind CSS v4 en espacio de color OKLCH, Core Web Vitals en verde (LCP < 0.8s, INP < 50ms, CLS = 0), Base 8 Grid y WCAG 2.2 AA.
- Persistencia & Base de Datos: Turso LibSQL Serverless SQLite con réplicas de baja latencia en el Edge y Drizzle ORM.
- Modelo de Negocio: 3 días de prueba gratuita completa (sin pedir tarjeta), suscripción mensual de $2.500 CLP o semestral de $6.000 CLP, pagos integrados con Mercado Pago Chile y programa de afiliados (25% de comisión permanente).
- Servicios Centrales:
  1. Tarjetas de presentación digitales inteligentes con código QR dinámico, compatibilidad NFC física y descarga de contacto vCard 4.0 con foto.
  2. Smart CV profesional con auditoría algorítmica ATS (compatible con filtros de reclutamiento de empresas chilenas), exportación vectorial en jsPDF y página web propia /cv/[slug].
  3. Presentaciones orbitales ejecutivas 16:9 con estructuración SCQA, diseño cinematográfico y enlaces públicos /p/[slug].

NUESTRO OBJETIVO:
Convertir a https://soyindi.cl en la página #1 indiscutible en Google Chile (google.cl) dentro de nuestros servicios, superando a cualquier competidor local o multinacional, capturando la máxima cuota de tráfico de profesionales, emprendedores, ejecutivos, médicos, abogados y empresas chilenas.

Realiza una INVESTIGACIÓN PROFUNDA, EXHAUSTIVA Y SISTEMÁTICA (Deep Research de Grado Industrial) estructurada en los siguientes 6 EJES ESTRATÉGICOS:

---

### EJE 1: ARQUEOLOGÍA DE INTENCIÓN DE BÚSQUEDA Y MATRIZ DE PALABRAS CLAVE EN GOOGLE CHILE (google.cl)
1. Analiza el comportamiento de búsqueda específico del usuario en Chile: términos coloquiales chilenos vs. términos formales de negocios en recursos humanos y networking.
2. Construye una matriz clasificada por intención (Transaccional, Comercial, Informacional) con volúmenes estimados, estacionalidad chilena (ej. marzo laboral, post-vacaciones, fin de año corporativo) para:
   - Tarjetas de presentación digitales / virtuales / con QR / NFC en Santiago y regiones de Chile.
   - Currículum Vitae formato chileno, plantillas CV ATS Chile, cómo hacer currículum en Chile.
   - Presentaciones de negocios, pitch deck para startups Corfo/Start-Up Chile, diapositivas ejecutivas.
3. Mapea las SERP Features actuales en Google Chile para estas búsquedas (Local Pack con Google Maps, People Also Ask, Fragmentos Destacados, Google AI Overviews).
4. Realiza un benchmark de los competidores que actualmente aparecen en las primeras 5 posiciones en Chile, identificando sus debilidades en Core Web Vitals, brechas de contenido y falencias en experiencia móvil.

---

### EJE 2: SEO TÉCNICO PERIMETRAL, NEXT.JS 16 Y CORE WEB VITALS AL MÁXIMO NIVEL
1. ¿Cuál es la arquitectura óptima de Next.js 16 App Router para maximizar la velocidad de rastreo e indexación de Googlebot en servidores cercanos a Santiago (nodo SCL)?
2. Estrategia de renderizado: Compara Static Prerendering con revalidación periódica (ISR) frente a Edge Rendering para landing pages de conversión y perfiles públicos (/c/[slug], /cv/[slug]).
3. Implementación y automatización del protocolo IndexNow con los motores de búsqueda para forzar la reindexación perimetral instantánea (<1 hora) ante publicaciones o cambios de perfiles.
4. Gobernanza de cabeceras HTTP RFC 9111 de caché, redirecciones Edge 308 estrictas para evitar canibalización y consolidar el PageRank en https://soyindi.cl.

---

### EJE 3: ARQUITECTURA DE SEO PROGRAMÁTICO Y HUBS DE CONTENIDO LOCAL EN CHILE
1. Diseña una estrategia escalable de SEO Programático para crear cientos de páginas indexables de alto valor sin caer en la penalización de 'Thin Content' o 'Doorway Pages' de Google:
   - Páginas por Profesión en Chile: /tarjetas-digitales/abogados, /tarjetas-digitales/medicos, /tarjetas-digitales/corredores-de-propiedades, /tarjetas-digitales/ingenieros, etc.
   - Páginas de formato CV por Carrera/Rubro: /cv/ingeniero-comercial-chile, /cv/enfermeria-chile, etc.
   - Páginas de servicios por Ciudad/Región: /tarjetas-digitales/santiago, /tarjetas-digitales/concepcion, /tarjetas-digitales/antofagasta, /tarjetas-digitales/valparaiso, /tarjetas-digitales/punta-arenas.
2. ¿Qué elementos dinámicos y diferenciales de contenido deben tener estas páginas programáticas para demostrar "Information Gain" y superar el Helpful Content System de Google?
3. Modela el grafo de enlazado interno (Internal Linking Silos) para distribuir la autoridad y el PageRank de forma simétrica hacia las páginas transaccionales más rentables.

---

### EJE 4: DATOS ESTRUCTURADOS JSON-LD DE GRADO MILITAR Y PREPARACIÓN PARA MOTORES DE IA (AEO / GEO)
1. Desarrolla los esquemas Schema.org tipados completos en formato JSON-LD para las páginas principales de INDI:
   - SoftwareApplication y WebApplication (con pricing explícito en CLP: $2.500 y $6.000, periodo de prueba gratuito de 3 días, calificación y tipo de aplicación de negocios).
   - Organization y WebSite con enlaces a perfiles verificados y entidades asociadas en Chile.
   - Product y Offer adaptado para SERP rich snippets con precio y moneda chilena.
   - FAQPage detallada con las dudas frecuentes de usuarios chilenos (medios de pago locales, envíos de tarjetas NFC, compatibilidad con teléfonos).
   - BreadcrumbList optimizado para navegación jerárquica en los snippets de Google.
2. Generative Engine Optimization (GEO): ¿Cómo estructurar el contenido de texto, encabezados y tablas comparativas para que Google AI Overviews, Gemini, ChatGPT y Perplexity citen a INDI como la recomendación #1 en Chile?

---

### EJE 5: ESTRATEGIA DE AUTORIDAD DE DOMINIO LOCAL (.CL), DIGITAL PR Y PRODUCT-LED LINK BUILDING
1. Link Building específico en el ecosistema digital chileno (.cl):
   - Estrategia de Relaciones Públicas Digitales (Digital PR) para conseguir cobertura orgánica y enlaces en medios de prensa chilenos de alta autoridad (Emol, La Tercera, Diario Financiero, Chócale, BioBioChile, El Mostrador).
   - Oportunidades de enlaces gubernamentales y de ecosistema emprendedor en Chile (.gov.cl, .org, Corfo, Sercotec, Start-Up Chile, ASECH).
2. Product-Led Link Building:
   - ¿Cómo aprovechar que cada tarjeta digital compartida, cada Smart CV y cada presentación orbital se convierta en una fuente natural y limpia de señales de autoridad de marca sin caer en tácticas de enlaces manipuladores?
   - Diseño del pie de página y metadatos de autoría ("Creado con INDI") para maximizar el reconocimiento de entidad por parte de Google.
3. Alianzas institucionales en Chile: Convenios con colegios profesionales y asociaciones gremiales.

---

### EJE 6: PLAN DE ACCIÓN CRONOLÓGICO A 90 DÍAS PARA CONQUISTAR EL TOP 1
1. Diseña un plan táctico semanal dividido en 4 fases de 3 semanas (Días 1 a 90).
2. Define las métricas clave de rendimiento (KPIs) en Google Search Console y Analytics:
   - Clics e impresiones orgánicas en google.cl.
   - Posición promedio para las 20 keywords más codiciadas.
   - Tasa de clics (CTR) en los snippets de Google.
   - Ratio de conversión de visitas orgánicas a registros en el periodo de prueba gratis.

ENTREGA ESPERADA:
Entrega un informe exhaustivo, ultra-detallado, con tablas comparativas, código JSON-LD completo y validado, taxonomía de URLs y directrices accionables sin rodeos.
```

---

### 🛡️ Resultados y Próximos Pasos (De la Investigación al Plan Avanzado)

Una vez completada la investigación con Gemini:
1. Analizaremos las respuestas y los hallazgos competitivos arrojados por el modelo.
2. Desarrollaremos el **Plan Avanzado de Dominancia SEO en Google Chile 2026** integrado en nuestro stack Next.js 16 (`src/app/`, `src/entities/`, `src/features/`).
3. Implementaremos las rutas programáticas, schemas JSON-LD optimizados en CLP y el generador de sitemap para consolidar el primer lugar en Google Chile.
