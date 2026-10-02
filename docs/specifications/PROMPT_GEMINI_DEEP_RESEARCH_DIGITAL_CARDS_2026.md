# PROMPT DE INVESTIGACIÓN ESTRATÉGICA Y DEEP RESEARCH (GEMINI 2.5 / ADVANCED)
## SISTEMAS DE IDENTIDAD DIGITAL, NETWORKING DE ALTO RENDIMIENTO & TARJETAS VIVAS (CICLO 2026–2027)

---

### INSTRUCCIONES DE EJECUCIÓN PARA GEMINI:
> **Rol Asignado:** Actúa como Principal Product Architect, VP of Design Systems y Staff Engineer de plataformas de identidad digital globales (benchmark: Linear, Apple, Stripe, Popl, Dot Cards, HiHello, Linktree Pro, Mobilo).
> **Objetivo:** Realizar una **investigación profunda y exhaustiva (Deep Research de Grado Industrial)** sobre el estado del arte mundial, tendencias disruptivas, tecnologías emergentes, modelos de interacción y heurísticas visuales para revolucionar la sección de **Tarjetas Digitales Profesionales** de la plataforma SaaS **INDI** (Next.js 16 App Router, React 19, Tailwind CSS v4, Turso LibSQL, Drizzle ORM, Better-Auth, Cloudflare R2).
> **Nivel de Rigor:** Máximo rigor técnico y de producto. Cero respuestas genéricas, superficiales o de relleno. Cada afirmación debe venir respaldada por estándares de la industria (W3C, IETF, FIDO, APCA, WCAG 2.2), patrones de diseño interactivo de frontera y ejemplos de arquitectura aplicables.

---

### PROMPT MAESTRO PARA GEMINI:

```markdown
Eres el Principal Product Architect & Staff Design Technologist encargado de diseñar la próxima generación de la suite de Identidad Digital y Tarjetas Profesionales Vivas ("Living Digital Business Cards") para la plataforma SaaS corporativa INDI.

La infraestructura objetivo de INDI está cimentada sobre:
- Framework: Next.js 16 App Router + React 19 (Server Components, Partial Prerendering, Actions y Hooks reactivos).
- Estilos y Visión: Tailwind CSS v4 en espacio de color uniforme OKLCH, Gamut P3 Wide Color, Glassmorphism 2.0 y aceleración por GPU.
- Persistencia & Edge: Turso (LibSQL Serverless SQLite) con latencias sub-milisegundo (<15ms) y Cloudflare R2 sin costo de salida (Zero Egress).
- Gobernanza: Feature-Sliced Design (FSD), tipado estricto Zod 3.24+ sin 'any', WCAG 2.2 Nivel AA/AAA, APCA Contrast y Mobile-First Base 8 Grid.

Realiza una INVESTIGACIÓN EXHAUSTIVA Y SISTEMÁTICA dividida obligatoriamente en los siguientes 7 EJES ESTRATÉGICOS:

---

### EJE 1: BENCHMARK MUNDIAL & ANATOMÍA DE LAS TARJETAS DIGITALES DE ÚLTIMA GENERACIÓN (2025–2027)
1. Analiza a fondo las mejores soluciones y productos del mercado global (Popl, Mobilo, Blinq, HiHello, Dot Card, Linq, Switchit, V1CE, y perfiles de desarrollador interactivos estilo Bento.me, Readme y Linear).
2. ¿Cuáles son los defectos estructurales y limitaciones técnicas que sufren las tarjetas digitales tradicionales (PDFs estáticos, enlaces tipo Linktree saturados de botones monótonos o simples vCards 3.0 básicas)?
3. ¿Cómo ha evolucionado la tarjeta digital de una simple "hoja de contactos" hacia un **Hub Dinámico de Identidad Profesional y Conversión Comercial**?
4. Define la matriz comparativa de características clave:
   - Identidad & Biografía Hiper-Estructurada.
   - Acciones de Contacto Instantáneo (One-Tap WhatsApp, llamadas, geolocalización, booking integrado).
   - Portafolio y Vitrina de Logros en Bento Grid interactivo.
   - Prueba Social viva (testimonios verificados, insignias y recomendaciones).
   - Pasarelas y Medios de Pago integrados (Webpay, Stripe, Mercado Pago, crypto/Lightning).

---

### EJE 2: HARDWARE NETWORKING, PROTOCOLOS WEB & ESTÁNDARES DE CONECTIVIDAD
1. **NFC Físico & Web NFC API:**
   - ¿Cuál es el estado del arte de la integración entre tarjetas físicas inteligentes (madera, metal mate, PVC reciclado) y perfiles web en el Edge?
   - ¿Cómo funciona técnicamente la escritura y lectura mediante la Web NFC API (`NDEFReader`) en dispositivos Android y la compatibilidad en ecosistemas iOS sin apps instaladas?
   - Diseña el protocolo de enlace URL y payload NDEF óptimo para garantizar que cualquier chip NTAG213/NTAG215/NTAG216 abra instantáneamente el perfil público (`https://indi.bio/c/[slug]`) en menos de 300ms.
2. **Generación Dinámica de Archivos .vcf (vCard 4.0 / RFC 6350):**
   - Análisis de compatibilidad entre iOS Contacts, Android Google Contacts y Microsoft Outlook.
   - ¿Cómo incrustar metadatos avanzados: foto en base64 optimizada, múltiples números categorizados, notas de contexto de networking, URLs sociales tipadas y prefijo de notas para recordatorios ("Conocido en Evento X")?
   - Diseña un generador determinista RFC 6350 en el Edge que permita la descarga con 1 solo toque y guarde el contacto sin errores de codificación UTF-8.
3. **Apple Wallet Passes (.pkpass) & Google Wallet API:**
   - ¿Cómo implementar la generación de pases digitales de networking para Apple Wallet y Google Wallet?
   - Estructura de manifiestos, certificados criptográficos requeridos, códigos de barras/QR dinámicos dentro del pase y actualización de datos remota mediante Webhooks de Wallet.
4. **Offline PWA & Local-First Networking:**
   - ¿Cómo estructurar un Service Worker con Workbox y Cache Storage para que la tarjeta de un usuario pueda abrirse y mostrar su QR incluso en sótanos de conferencias o eventos sin cobertura celular?

---

### EJE 3: SISTEMA VISUAL, ESTÉTICA "WOW FACTOR" & MICRO-INTERACCIONES
1. **Paletas de Color OKLCH & Gamut P3:**
   - Define arquetipos de diseño y paletas cromáticas para diferentes industrias:
     * *Executive Titanium* (Consultoría, Finanzas, C-Level).
     * *Cyber Nebula / Deep Space* (Tech, Web3, Software Engineers).
     * *Emerald Botanical* (Sustentabilidad, Salud, Wellness).
     * *Solar Obsidian / High Luxury* (Arquitectura, Joyería, Moda de Lujo).
     * *Minimalist Swiss Monochrome* (Diseño Gráfico, Tipógrafos, Editores).
   - Aplica el algoritmo APCA (Accessible Perceptual Contrast Algorithm) para garantizar legibilidad absoluta de textos sobre fondos oscuros o translúcidos.
2. **Glassmorphism 2.0 & Sombreadores WebGL/GPU:**
   - ¿Cómo evolucionar el efecto vidrio más allá de `backdrop-filter: blur(10px)` plano hacia materiales con refracción física, aberración cromática sutil en los bordes y luz volumétrica reactiva al cursor/giroscopio?
   - Optimización de rendimiento para dispositivos de gama baja: técnicas con Canvas/CSS que eviten caídas de FPS y baterías descargadas.
3. **Ergonomía Táctil & Retícula Base 8:**
   - Directrices para navegación con una sola mano (Thumb Zone): ubicación de botones críticos de contacto (WhatsApp, vCard, Compartir).
   - Hit targets $\ge 44 \times 44\text{ px}$ según WCAG 2.2 Criterio 2.5.8 y espaciados armónicos múltiplos de 8px.

---

### EJE 4: VIRALIDAD EN EL EDGE, OPEN GRAPH & RENDIMIENTO
1. **Generación Dinámica de Previews Open Graph (`@vercel/og` / Satori):**
   - ¿Cómo diseñar la tarjeta de preview visual (1200x630px) para maximizar el Click-Through Rate (CTR) cuando el enlace se envía por WhatsApp, Telegram, iMessage o LinkedIn?
   - Solución a los problemas de caché de WhatsApp y scrapers de redes sociales mediante encabezados HTTP `Cache-Control` y revalidación perimetral.
2. **Latencia y Core Web Vitals en el Edge:**
   - Estrategia de caching perimetral para lograr LCP < 0.6s, CLS = 0 y INP < 50ms en Turso LibSQL + Cloudflare CDN.
   - Técnicas de optimización de avatares con Cloudflare Images / WebP / AVIF responsivo.

---

### EJE 5: INTELIGENCIA ARTIFICIAL GENERATIVA & AGENTES DE NETWORKING
1. **Asistente de Biografía y Elevator Pitch:**
   - ¿Cómo implementar prompts especializados que conviertan un rol profesional escueto en un titular de alto impacto y una bio persuasiva utilizando fórmulas probadas (AIDA, Hook-Story-Offer)?
2. **Generador Inteligente de Mensajes de WhatsApp Contextuales:**
   - Algoritmos para generar enlaces de WhatsApp con mensajes pre-redactados que se adapten al tipo de visitante (ej. *"Hola [Nombre], vi tu portafolio de Diseño y me gustaría coordinar una cotización para un proyecto"* vs *"Hola [Nombre], te conocí en el evento X y me gustaría conectar"*).
3. **Smart QR Artístico / Generativo:**
   - Técnicas para integrar códigos QR estéticamente superiores (QR con esquinas redondeadas, degradados nativos, micro-logos vectoriales y soporte para códigos QR artísticos generados por IA sin comprometer la escaneabilidad con cámaras de smartphones normales).
4. **Agente de Networking y Lead Capture (IA):**
   - Flujo de captura bidireccional: ¿Cómo permitir que el visitante de la tarjeta deje sus datos (nombre, WhatsApp, email, nota) en 2 toques, guardándolos en el CRM del usuario y disparando una notificación en tiempo real?

---

### EJE 6: ANALÍTICAS AVANZADAS, PRIVACIDAD & TELEMETRÍA (SIN COOKIES)
1. **Métricas en Tiempo Real de Alto Valor para el Profesional:**
   - Más allá de simples "vistas": tasa de conversión a contacto (CTR WhatsApp, descargas de vCard, clics en portafolio, guardados en favoritos).
   - Mapa de calor básico o clics por sección de la tarjeta.
   - Origen del escaneo: distinguir entre escaneo de QR físico, toque NFC, enlace de WhatsApp o perfil de LinkedIn.
2. **Privacidad de Grado Europeo (GDPR & Privacidad por Diseño):**
   - Telemetría sin cookies, respetando la privacidad del visitante mediante hashing de IP diaria anonimizada y User-Agent para conteo de visitantes únicos sin rastreo invasivo.

---

### EJE 7: ARQUITECTURA TÉCNICA RECOMENDADA PARA INDI (FSD & MODELOS DE DATOS)
1. Propón la extensión o evolución del esquema de base de datos Drizzle SQLite (`cards`) para soportar todas estas capacidades avanzadas sin romper compatibilidad con las tarjetas existentes.
2. Define los contratos Zod (`schemas.ts`) para los nuevos módulos:
   - Bloques modulares Bento (enlaces, vitrinas, videos, productos, testimonios).
   - Parámetros de NFC / Wallet / vCard 4.0.
   - Configuración de IA de Lead Capture.
3. Propón la hoja de ruta de implementación estructurada en fases progresivas (Sprint 1: Quick Wins visuales y vCard; Sprint 2: Bento Grid interactivo y Apple Wallet; Sprint 3: NFC y Lead Capture IA).

---
ENTREGA DEL INFORME:
Proporciona el informe completo, estructurado con títulos claros, tablas comparativas, especificaciones técnicas de código (TypeScript, esquemas Zod, ejemplos de headers y payloads) y recomendaciones directas para el equipo de ingeniería de INDI.
```
