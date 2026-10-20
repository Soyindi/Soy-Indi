# 📱 PROMPT MAESTRO DE DEEP RESEARCH PARA GEMINI: ARQUITECTURA DE BILLETERAS DIGITALES NATIVAS (APPLE WALLET & GOOGLE WALLET 2026)
## CRIPTOGRAFÍA PASSKIT PKCS#7, GOOGLE WALLET GENERIC PASSES RS256 JWT, SERVERLESS SIGNING Y EXPERIENCIA OFFLINE

---

### 📋 INSTRUCCIONES DE EJECUCIÓN PARA GEMINI:
> **Rol Asignado:** Actúa como **Principal Mobile Systems Architect, Staff Cryptography & Security Engineer & Lead Product Designer** especializado en la integración de billeteras digitales móviles nativas (Apple Wallet / PassKit y Google Wallet / Google Pay API). Posees experiencia de grado de producción diseñando e implementando sistemas de emisión de pases en tiempo real, gestión de infraestructura de clave pública (PKI), firma digital X.509 / PKCS#7, tokens JWT firmados con RS256, arquitecturas serverless en Vercel/Node.js, y diseño de interfaces móviles de alta conversión.
> 
> **Objetivo:** Ejecutar una **investigación profunda, rigurosa e industrial (Deep Research)** para auditar, diseñar y documentar la arquitectura de emisión de pases nativos para la plataforma SaaS **INDI** (`https://soyindi.cl`). La investigación debe resolver de forma definitiva:
> 1. Por qué los navegadores móviles (iOS Safari / Android Chrome) rechazan archivos no firmados criptográficamente y qué requiere cada sistema operativo.
> 2. Cómo estructurar la firma de pases en un entorno Next.js 16 / Node.js en Vercel sin depender de dependencias binarias pesadas.
> 3. La viabilidad económica y operativa de operar con cuentas de desarrollador oficiales ($99 USD/año Apple Developer) vs alternativas sin costo ($0 CLP) y pasarelas de terceros.
> 4. La implementación de adaptadores de producción (`applePassSigner.ts`, `googleWalletSigner.ts`) con degradación elegante hacia Contactos vCard 4.0 con foto incrustada y tarjetas gráficas HD 9:16 para pantalla de bloqueo.
> 
> **Nivel de Rigor:** Grado de ingeniería de sistemas de misión crítica. Cero generalidades o código de juguete. Cada recomendación debe incluir contratos tipados en TypeScript, especificaciones criptográficas precisas, manejo de excepciones y análisis de costos.

---

### 💻 CONTEXTO TÉCNICO Y COMERCIAL DE LA PLATAFORMA (INDI):

- **Plataforma:** SaaS de Identidad Digital Profesional, Tarjetas Vivas, Smart CV y Presentaciones Cinemáticas (`https://soyindi.cl`).
- **Público Objetivo:** Profesionales independientes, directores, emprendedores, consultores y empresas en Chile y América Latina.
- **Stack Tecnológico:**
  - **Framework:** Next.js 16 (App Router) + React 19.
  - **Base de Datos:** Turso (LibSQL Serverless SQLite) + Drizzle ORM.
  - **Arquitectura:** Feature-Sliced Design (FSD: `app/` ➔ `features/` ➔ `entities/` ➔ `shared/`).
  - **Infraestructura:** Vercel Serverless / Edge Functions.
  - **Persistencia:** Política Zero-Binary DB (solo texto y JSON estructurado <50KB en base de datos).
- **Problema de Negocio & UX Actual:**
  - Los usuarios profesionales desean pulsar "Guardar en Cartera" en su teléfono móvil y que su tarjeta digital quede instantáneamente registrada en la aplicación nativa **Apple Wallet** (en iPhone/Apple Watch) o **Google Wallet** (en Android).
  - Al no contar con claves criptográficas privadas configuradas en el entorno local/gratuito, un archivo `.pkpass` sin firma PKCS#7 es rechazado inmediatamente por iOS Safari con el error *"El pase no es válido"*.
  - En Google Wallet, se requiere un JWT firmado con RS256 generado por un Service Account de Google Cloud asociado a un ID de emisor registrado.
  - La plataforma necesita tanto la **infraestructura completa de firma lista para cuando se carguen las credenciales en producción**, como una **experiencia de contingencia premium (Fallbacks)** que permita guardar el contacto con foto en la agenda y descargar una tarjeta para pantalla de bloqueo con código QR offline.

---

### 🎯 PROMPT DE INVESTIGACIÓN ESTRUCTURADO EN 6 EJES:

```markdown
Actúa como Principal Mobile Systems Architect & Staff Cryptography Engineer. Realiza un Deep Research exhaustivo para la plataforma SaaS INDI (https://soyindi.cl) cubriendo rigurosamente los siguientes 6 ejes:

---

### EJE 1: ANATOMÍA CRIPTOGRÁFICA Y FORENSE DE APPLE WALLET (PASSKIT)
1. **Estructura Interna del Paquete `.pkpass`:**
   - Detalla la jerarquía exacta de archivos dentro de un archivo `.pkpass` (archivo ZIP con compresión DEFLATE):
     * `pass.json`: Especificación de formato (generic pass vs storeCard vs coupon), claves requeridas (`passTypeIdentifier`, `teamIdentifier`, `serialNumber`, `organizationName`, `description`, `barcodes`, campos `primaryFields`, `secondaryFields`, `backFields`).
     * Activos gráficos: Dimensiones, densidades (`@1x`, `@2x`, `@3x`) y formatos permitidos para `icon.png`, `logo.png`, `thumbnail.png`, `strip.png`.
     * `manifest.json`: Algoritmo de hash exigido (SHA-1 en PassKit tradicional vs soporte de SHA-256 en iOS recientes) y formato JSON de los checksums relativos.
     * `signature`: Firma desprendida PKCS#7 (detached PKCS#7 / CMS signature) codificada en binario DER.
2. **Cadena de Confianza y Certificados de Apple:**
   - ¿Qué certificados específicos emite Apple Developer Portal para PassKit (`pass.cl.soyindi.card`)?
   - ¿Por qué es obligatorio incrustar la cadena intermedia de Apple (Apple Worldwide Developer Relations - WWDR G4 Certificate)?
   - ¿Cómo se convierte y gestiona un archivo `.p12` exportado desde el Llavero de macOS (Keychain) a certificados PEM y clave privada utilizables en Node.js?
3. **Mecanismo de Descarga en iOS Safari:**
   - ¿Cuáles son las cabeceras HTTP obligatorias para que iOS Safari abra automáticamente la hoja nativa de "Añadir a Apple Wallet" en lugar de descargar un archivo genérico?
     * `Content-Type: application/vnd.apple.pkpass`
     * `Content-Disposition: attachment; filename="tarjeta.pkpass"`
     * `Cache-Control: no-cache, no-store, must-revalidate`

---

### EJE 2: ARQUITECTURA GOOGLE WALLET GENERIC PASSES & JWT RS256
1. **Ecosistema Google Pay & Wallet Console:**
   - Proceso de habilitación del **Google Wallet API** en Google Cloud Console.
   - Creación y verificación del **Issuer ID** (Emisor de pases) en Google Pay & Wallet Console.
   - Generación de credenciales del **Service Account** (archivo JSON con `client_email` y `private_key`).
2. **Modelo de Clases y Objetos (Class vs Object):**
   - Definición del `GenericClass` (`issuerId.indi_business_card_class`) y sus propiedades compartidas (logo, colores, política de privacidad).
   - Instanciación del `GenericObject` (`issuerId.indi_card_slug`) para cada usuario individual (nombre, especialidad, avatar, código QR con URL canónica).
3. **Flujo de Firma Save-to-Wallet con JWT RS256:**
   - Estructura del payload JWT (claims `iss`, `aud: 'google'`, `typ: 'savetowallet'`, `iat`, `payload.genericObjects`).
   - Firma criptográfica asimétrica RS256 utilizando la clave privada del Service Account (`crypto.createSign('RSA-SHA256')`).
   - Construcción de la URL de destino: `https://pay.google.com/gp/v/save/<signed_jwt>`.
   - Comportamiento en Android: Deep linking hacia la app nativa de Google Wallet vs visor web en navegadores de escritorio.

---

### EJE 3: IMPLEMENTACIÓN SERVERLESS EN VERCEL / NEXT.JS (NODE.JS VS EDGE)
1. **Restricciones de Entorno de Ejecución:**
   - ¿Por qué la firma PKCS#7 y la compresión ZIP de Apple Wallet deben ejecutarse en el runtime de Node.js (`export const runtime = 'nodejs';`) en lugar de Vercel Edge Runtime?
   - ¿Cómo utilizar el módulo nativo `node:crypto` para generar firmas PKCS#7 / CMS sin invocar procesos externos de OpenSSL mediante `exec()` ni requerir binarios C++ compilados?
2. **Empaquetado ZIP en Memoria (Zero-Binary Temp Files):**
   - Técnicas para comprimir y generar el buffer del archivo `.pkpass` en memoria RAM (<500KB) sin escribir archivos temporales en el sistema de archivos del servidor serverless.
   - Comparativa de soluciones: pure JS / TypeScript zip generators vs streaming.
3. **Seguridad y Gestión de Secretos en Vercel:**
   - Buenas prácticas para almacenar certificados P12 y claves RSA en variables de entorno:
     * Codificación en Base64 (`APPLE_PASS_CERT_P12_BASE64`, `APPLE_PASS_CERT_PASSWORD`).
     * `GOOGLE_WALLET_SERVICE_ACCOUNT_KEY` (JSON stringificado o Base64).
   - Procedimiento de rotación anual de certificados antes de su expiración.

---

### EJE 4: MATRIZ DE COSTOS, SERVICIOS DE TERCEROS Y VIABILIDAD ECONÓMICA
1. **Costos Directos de Emisión Propia:**
   - Cuenta de Desarrollador Apple: **$99 USD / año** (~$95.000 CLP).
   - Google Wallet API: **$0 USD / año** (gratuito para emisión de pases genéricos).
2. **Evaluación de Pasarelas de Pases de Terceros (Pass-as-a-Service):**
   - Comparativa entre:
     * **PassKit.com**: Modelo de precios, límites de pases y SDKs.
     * **Pass2U**: Generación de pases personalizados, importación web y compatibilidad.
     * **WalletPasses**: Generador de pases para Android compatible con `.pkpass`.
     * **MakePass / Tapki**: Servicios emergentes para micro-empresas.
3. **Recomendación para INDI:**
   - ¿Conviene implementar el firmador nativo propio en Node.js o tercerizar en una pasarela de pago de pases? Justificar en base a soberanía de datos, costos a escala y latencia.

---

### EJE 5: ESTRATEGIA DE EXPERIENCIA DE USUARIO (UX) Y FALLBACKS PREMIUM
1. **Diseño del Fallback de Alta Conversión cuando no hay Certificados Activos:**
   - **Contacto vCard 4.0 con Foto HD Incrustada**: Cómo funciona la incrustación `PHOTO;ENCODING=b;TYPE=JPEG:` para que el usuario guarde el contacto directamente en la agenda de iOS/Android con foto y enlaces.
   - **Tarjeta Gráfica HD 9:16 para Pantalla de Bloqueo (Canvas HTML5)**: Cómo el generador cliente genera una tarjeta de diseño elegante con QR en formato 1080x1920 que los usuarios fijan en su pantalla bloqueada para networking sin internet.
   - **PWA Web Clip**: Instrucciones claras de "Añadir a Pantalla de Inicio" para acceso de 1 toque.
2. **Copywriting y Transparencia con el Usuario:**
   - Redacción de micro-copys claros que expliquen: *"Para añadir directamente a la app Cartera nativa con 1 toque sin intermediarios, tu organización requiere certificados oficiales de Apple/Google. Mientras tanto, tu vCard y tu Tarjeta de Bloqueo están 100% listas para usar."*

---

### EJE 6: CÓDIGO DE PRODUCCIÓN Y CONTRATOS ARQUITECTÓNICOS FSD
1. Entrega el código fuente completo, tipado y listo para producción de:
   - `src/shared/lib/wallet/applePassSigner.ts`: Módulo firmador PKCS#7 con soporte para `APPLE_PASS_CERT_P12` y fallback informativo seguro.
   - `src/shared/lib/wallet/googleWalletSigner.ts`: Módulo firmador JWT RS256 con soporte para Service Account de Google Cloud.
   - Adaptaciones a las rutas `/api/wallet/apple/[slug]` y `/api/wallet/google/[slug]` para servir los pases firmados o redirigir transparentemente al perfil con el modal interactivo.
```
