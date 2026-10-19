# **Prompt Maestro de Deep Research (Gemini 2.5 / Advanced): Estilo Visual de Compartir, Favicon de Clase Mundial, Posicionamiento Orgánico en Google (SEO Técnico & Programático) & Estrategia CEO de Crecimiento Acelerado 2026**

## **1\. RESUMEN EJECUTIVO & DIAGNÓSTICO ESTRATÉGICO**

La transición de la identidad profesional estática hacia ecosistemas digitales dinámicos, vivos y de latencia ultra-baja exige una refactorización arquitectónica total. El presente informe establece las especificaciones de grado industrial para la plataforma INDI (Soyindi), proyectada para dominar el mercado latinoamericano y escalar a nivel global. Operando sobre un stack tecnológico de frontera en 2026, la infraestructura se cimenta en Next.js 16 (App Router, Server Components y Server Actions), persistencia *Zero-Binary* mediante réplicas distribuidas de Turso (LibSQL), transacciones atómicas con Drizzle ORM y estilización avanzada con Tailwind CSS v4 sobre el espacio de color OKLCH1.  
El análisis del estado actual del mercado de tarjetas inteligentes y portafolios digitales revela una saturación de plataformas (tales como Popl, Linktree y Bento.me) que padecen de arquitecturas monolíticas acopladas al cliente, generando una carga excesiva de JavaScript que degrada críticamente las métricas de *Core Web Vitals*. Adicionalmente, el diseño visual de los perfiles compartidos a menudo ignora los algoritmos perceptuales modernos, limitándose al obsoleto estándar WCAG 2.x en lugar de adoptar el algoritmo APCA (Accessible Perceptual Contrast Algorithm) para el cálculo de luminancia y legibilidad en entornos oscuros5.  
La estrategia delineada para INDI revierte este paradigma mediante la síntesis dinámica en el perímetro (Edge Runtime), garantizando que las previsualizaciones sociales, el renderizado de tarjetas digitales y la exportación algorítmica de currículums ATS se ejecuten con latencias inferiores a 15 milisegundos y con un peso de carga inicial optimizado a través de la compresión en lado del cliente hacia Cloudflare R28.

| Dimensión Estratégica | Diagnóstico de Plataformas Competidoras | Arquitectura Proyectada para INDI (2026) | Impacto Cuantitativo Esperado |
| :---- | :---- | :---- | :---- |
| **Rendimiento Visual y Estético** | Dependencia de librerías CSS-in-JS, paletas sRGB con difracción de tono, y degradados artificiales. | Tailwind v4, variables CSS nativas, OKLCH volumétrico, y Glassmorphism 2.0 por GPU. | Incremento de retención en primeros 3s; reducción del *Largest Contentful Paint* (LCP) a ![][image1]. |
| **Posicionamiento Orgánico (SEO)** | Renderizado opaco al cliente (CSR), sitemaps estáticos, y microdatos genéricos no tipados. | Datos estructurados JSON-LD inyectados en servidor, protocolo *IndexNow* push en ![][image2]. | Dominio del *Knowledge Graph*; primera posición en búsquedas nominales (*Name SEO*). |
| **Identidad Transaccional y Edge** | Bases de datos relacionales tradicionales con cuellos de botella en conexiones TCP centralizadas. | Turso (LibSQL) con réplicas perimetrales y Better-Auth para sesiones descentralizadas. | Latencia global de lectura ![][image3]; persistencia atómica tolerante a fallos. |
| **Motor de Crecimiento (PLG)** | Adquisición dependiente de pauta publicitaria (CAC alto), modelos de retención débiles. | Red de afiliados (25%), bucle viral nativo (*K-factor*), y anclaje físico mediante códigos QR. | Retención de Ingresos Netos (NRR) ![][image4]; Coeficiente viral ![][image5]; Tasa CTR social ![][image6]. |
| **Compatibilidad Curricular (ATS)** | Currículums basados en plantillas CSS multi-columna ilegibles para analizadores semánticos. | Motor dual: PDF vectorial A4 estricto (ISO 216\) y visor web interactivo paralelo. | Tasa de éxito en análisis ATS del 100%; eliminación de errores de *parsing* estructural. |

La ejecución de los cinco ejes de investigación detallados a continuación transformará a INDI en un foso defensivo comercial inexpugnable, alineando la excelencia técnica del desarrollo Frontend con los imperativos financieros de crecimiento empresarial (PLG, CAC y LTV).

## **2\. ARQUITECTURA VISUAL DE COMPARTIR & SOCIAL PREVIEWS DE ALTO IMPACTO**

La primera interacción que un cliente potencial o reclutador tiene con la plataforma INDI no ocurre en soyindi.cl, sino en el *Social Graph*: un canal de WhatsApp, un mensaje directo en LinkedIn, o un feed de X. La optimización del *Open Graph* (OG) requiere una ingeniería de precisión para dominar la asimetría algorítmica de los distintos clientes de mensajería y redes sociales.

### **2.1. Anatomía Visual y Zonificación de Seguridad (Safe Zones)**

El estándar universal del protocolo Open Graph define un lienzo rectangular de 1200x630 píxeles, estableciendo una relación de aspecto de 1.91:111. Mientras que plataformas de microblogging y redes profesionales (X, LinkedIn, Slack) respetan y renderizan este formato apaisado en su totalidad, las plataformas de mensajería instantánea orientadas a dispositivos móviles (WhatsApp, Telegram, iMessage) aplican recortes (crops) centrales destructivos para forzar una visualización cuadrada o una miniatura en formato de lista11.  
Para resolver este conflicto geométrico, el diseño de INDI implementa una "Matriz de Zona Segura 1:1". El lienzo mantiene la dimensión absoluta de 1200x630 píxeles, pero confina todos los vectores de información semántica, jerarquía tipográfica, avatares y micro-insignias (badges) dentro de un cuadrante inamovible de 630x630 píxeles situado en el eje central absoluto.  
Estructura Geométrica de Open Graph (1200x630) en Retícula Base 8  
\+-----------------------------------------------------------------------+  
| 1200 px | | | | \+---------------------------------------------------+ | | | 630 px | | | | | | | 285 px | ZONA SEGURA CENTRAL 1:1 | 285 px | | (Área | \- Avatar nítido (Border translúcido) | (Área | | Recorte)| \- Tipografía Inter (Grosor 700\) | Recorte)| | | \- Halo de luz OKLCH | | | | \- Micro-badges ('Verified Pro', 'ATS Ready') | | | | | | | \+---------------------------------------------------+ | | | \+-----------------------------------------------------------------------+  
Las áreas laterales de 285 píxeles operan exclusivamente como auras volumétricas generadas mediante gradientes matemáticos interpolados en OKLCH, asegurando que si la imagen sufre un recorte agresivo en WhatsApp, la presentación de la tarjeta de contacto o el Smart CV permanezca visualmente perfecta y persuasiva.

### **2.2. Generación Dinámica en el Edge (Satori \+ @vercel/og)**

La infraestructura de INDI demanda la generación algorítmica de estas imágenes en tiempo de ejecución para reflejar actualizaciones instantáneas de cargo o fotografía. Para ello, se utiliza la librería @vercel/og sustentada en el motor *Satori*. Satori procesa nodos JSX abstrayendo el DOM para sintetizar cadenas SVG vectoriales, delegando la rasterización final a formato PNG mediante *Resvg* (un motor basado en Skia)13.  
Es imperativo reconocer las restricciones del motor *Yoga* subyacente en Satori: no soporta paradigmas modernos como display: grid, funciones CSS dinámicas como calc(), o transformaciones Z tridimensionales complejas, limitándose estrictamente a arquitecturas flexbox13. Adicionalmente, requiere la precarga síncrona de tipografías en formato TTF u OTF convertidas a un ArrayBuffer13.  
A continuación, la especificación de producción TypeScript para el *Edge Route Handler* de INDI, modelado bajo arquitectura FSD para previsualizaciones de tarjetas:

TypeScript  
// src/app/api/og/card/route.tsx  
import { ImageResponse } from '@vercel/og';  
import { NextRequest } from 'next/server';

export const runtime \= 'edge';

// Carga en buffer de la tipografía Inter (evita fuentes WOFF2 no soportadas)  
const interBoldConfig \= fetch(new URL('../../../../shared/assets/fonts/Inter-Bold.ttf', import.meta.url)).then((res) \=\> res.arrayBuffer());  
const interRegularConfig \= fetch(new URL('../../../../shared/assets/fonts/Inter-Regular.ttf', import.meta.url)).then((res) \=\> res.arrayBuffer());

export async function GET(req: NextRequest) {  
  try {  
    const { searchParams } \= new URL(req.url);  
    const fullName \= searchParams.get('n') || 'Perfil Profesional';  
    const role \= searchParams.get('r') || 'Ecosistema INDI';  
    const avatarUrl \= searchParams.get('av');  
    const isVerified \= searchParams.get('v') \=== '1';

    const \[interBold, interRegular\] \= await Promise.all(\[interBoldConfig, interRegularConfig\]);

    return new ImageResponse(  
      (  
        \<div  
          style={{  
            display: 'flex',  
            width: '1200px',  
            height: '630px',  
            background: 'linear-gradient(135deg, \#111111 0%, \#000000 100%)',  
            alignItems: 'center',  
            justifyContent: 'center',  
          }}  
        \>  
          {/\* Implementación de la Zona Segura 630x630 \*/}  
          \<div  
            style={{  
              display: 'flex',  
              flexDirection: 'column',  
              width: '630px',  
              height: '630px',  
              alignItems: 'center',  
              justifyContent: 'center',  
              background: 'rgba(255, 255, 255, 0.04)',  
              borderRadius: '48px',  
              border: '2px solid rgba(255, 255, 255, 0.1)',  
              boxShadow: '0 32px 64px rgba(0,0,0,0.6)',  
            }}  
          \>  
            {avatarUrl && (  
              \<img  
                src={avatarUrl}  
                width={200}  
                height={200}  
                style={{  
                  borderRadius: '100px',  
                  border: '6px solid \#4F46E5', // Fallback sRGB para Satori  
                  marginBottom: '40px',  
                }}  
              /\>  
            )}  
            \<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}\>  
              \<span style={{ fontSize: '56px', fontWeight: 700, color: 'white', fontFamily: 'Inter', letterSpacing: '-0.02em' }}\>  
                {fullName}  
              \</span\>  
              {isVerified && (  
                \<svg width="48" height="48" viewBox="0 0 24 24" fill="\#4F46E5" style={{ marginLeft: '16px' }}\>  
                  \<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /\>  
                \</svg\>  
              )}  
            \</div\>  
            \<span style={{ fontSize: '32px', fontWeight: 400, color: '\#A1A1AA', marginTop: '16px', fontFamily: 'Inter' }}\>  
              {role}  
            \</span\>  
          \</div\>  
        \</div\>  
      ),  
      {  
        width: 1200,  
        height: 630,  
        fonts: \[  
          { name: 'Inter', data: interBold, weight: 700, style: 'normal' },  
          { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },  
        \],  
        headers: {  
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',  
        },  
      }  
    );  
  } catch (error) {  
    return new Response('Failed to generate Social Preview', { status: 500 });  
  }  
}

### **2.3. Gestión de Caché de Scrapers y Cabeceras HTTP**

Para evitar agotar los recursos de cómputo *Serverless* frente a los picos de lectura de los rastreadores automatizados (Facebook Scraper, Twitterbot, LPLinkMetadata de Apple)17, se define un contrato de almacenamiento en la CDN perimetral de Cloudflare/Vercel.  
La directiva Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800 gobierna este comportamiento. El parámetro s-maxage=86400 instruye al nodo perimetral a conservar el binario compilado durante 24 horas. Crucialmente, la cláusula stale-while-revalidate=604800 permite que si una solicitud llega en los 7 días posteriores a la expiración, la infraestructura sirve instantáneamente la copia obsoleta (asegurando una respuesta ![][image7]) mientras regenera la imagen en segundo plano para futuras peticiones.

### **2.4. Micro-Interacciones de Usuario (Web Share API)**

El acto de compartir debe prescindir de fricciones mecánicas. El componente modal invoca la interfaz navigator.share() cuando el contexto del navegador lo permite, acoplado con retroalimentación háptica mediada por navigator.vibrate(\[15, 30, 15\]) para confirmar la acción muscular del usuario.  
Todos los márgenes y *touch targets* del componente interactivo respetan rigurosamente la Retícula Matemática Base 8, definiendo áreas táctiles con un área mínima de ![][image8] píxeles, cumpliendo la normativa WCAG 2.2 AA.

TypeScript  
// src/features/sharing/ui/WebShareModal.tsx  
'use client';  
import { useState } from 'react';

interface ShareProps {  
  title: string;  
  text: string;  
  slug: string;  
  entityType: 'card' | 'cv' | 'presentation';  
}

export const WebShareModal \= ({ title, text, slug, entityType }: ShareProps) \=\> {  
  const \[isCopied, setIsCopied\] \= useState(false);

  const handleShare \= async () \=\> {  
    const url \= \`https\://soyindi.cl/\${entityType \=== 'card' ? 'c' : entityType \=== 'cv' ? 'cv' : 'p'}/\${slug}?utm\_source=share\&utm\_medium=native\`;  
      
    // Retroalimentación háptica (Linear Motor Actuation)  
    if (typeof window \!== 'undefined' && navigator.vibrate) {  
      navigator.vibrate(\[15, 30, 15\]);  
    }

    if (navigator.share && navigator.canShare({ title, text, url })) {  
      try {  
        await navigator.share({ title, text, url });  
      } catch (err: any) {  
        if (err.name \!== 'AbortError') console.error('Share API Error', err);  
      }  
    } else {  
      // Fallback a portapapeles con Glassmorphism Feedback  
      await navigator.clipboard.writeText(\`\${text}\\n\\n\${url}\`);  
      setIsCopied(true);  
      setTimeout(() \=\> setIsCopied(false), 2000);  
    }  
  };

  return (  
    \<button  
      onClick={handleShare}  
      className="flex items-center justify-center min-w-\[48px\] min-h-\[48px\] px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium hover:bg-white/15 transition-all active:scale-95"  
      aria-label="Compartir perfil digital"  
    \>  
      {isCopied ? '¡Enlace copiado\!' : 'Compartir en 1 toque'}  
    \</button\>  
  );  
};

### **2.5. Generador Inteligente de Textos Pre-Redactados**

El *copywriting* que se anexa al portapapeles determina la tasa de apertura del receptor. El motor inyecta dinámicamente matrices de texto basadas en fórmulas de redacción publicitaria:

| Entidad INDI | Estructura Persuasiva Utilizada | Ejemplo de Copy Pre-Redactado Inyectado |
| :---- | :---- | :---- |
| **Tarjeta Digital** | **Fórmula AIDA** (Atención, Interés, Deseo, Acción) | "Guarda mi contacto en un toque. Mi tarjeta inteligente está viva, siempre actualizada y libre de papel: \[URL\]" |
| **Smart CV** | **Hook-Story-Offer** | "Identidad verificada algorítmicamente. Descarga mi expediente ATS vectorial o explora mi trayectoria interactiva en INDI: \[URL\]" |
| **Presentación** | **Curiosity Gap** | "Descubre la propuesta comercial estructurada en 16:9 que hemos diseñado. Visualización interactiva completa aquí: \[URL\]" |

## **3\. ESPECIFICACIÓN MAESTRA DE FAVICON & ASSETS DE APLICACIÓN 2026**

La nitidez de la identidad marcaria a escala microscópica en la pestaña del navegador (*Tab Bar*) dictamina la percepción de ingeniería y estatus de INDI. En 2026, la fragmentación de sistemas exige una consolidación absoluta y moderna de archivos estáticos.

### **3.1. Estrategia Multi-Formato Vectorial y Rāster**

Los logotipos con densa información tipográfica fallan catastróficamente bajo la interpolación matemática empleada por los navegadores al renderizar a 16x16 píxeles. La técnica de *Optical Sizing* aplicada al isotipo geométrico de INDI exige engrosar los trazados y aplicar *Pixel-Grid Snapping* (alineación de nodos vectoriales a la cuadrícula dura de píxeles), eliminando el desenfoque de sub-píxeles (anti-aliasing blurring).  
La suite maestra se define por cinco activos fundamentales:

> 1. icon.svg: Favicon vectorial infinitamente escalable que responde dinámicamente al esquema de color del sistema operativo.  
> 2. favicon.ico: Contenedor heredado multi-resolución (16x16, 32x32, 48x48 px) con canales indexados para compatibilidad extrema.  
> 3. apple-touch-icon.png: Imagen estricta de 180x180 px, sin canal alfa (fondo sólido), previniendo los algoritmos de sombreado negro destructivo de iOS.  
> 4. icon-192.png / icon-512.png: Máscaras para Progressive Web Apps (PWA) de Android.

El archivo icon.svg incluye consultas de medios nativas embebidas:

SVG

### **3.2. Web App Manifest Moderno**

En la arquitectura del *Next.js 16 App Router*, la inyección de metadatos de instalación progresiva se define algorítmicamente mediante el archivo manifest.ts. Se exige el uso de la propiedad purpose: 'maskable any' para asegurar la perfecta adaptabilidad dentro de las interfaces de contenedores redondeados de Android.

TypeScript  
// src/app/manifest.ts  
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {  
  return {  
    name: 'INDI Platform',  
    short\_name: 'INDI',  
    description: 'Ecosistema de presencia digital viva e interactiva.',  
    start\_url: '/',  
    display: 'standalone',  
    background\_color: '\#000000',  
    theme\_color: '\#000000',  
    icons: \[  
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },  
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }  
    \],  
    shortcuts: \[  
      { name: 'Crear Tarjeta', short\_name: 'Nueva', url: '/admin/cards/new', icons: \[{ src: '/icons/add.png', sizes: '96x96' }\] },  
      { name: 'Editor Smart CV', short\_name: 'Mi CV', url: '/admin/cv/edit', icons: \[{ src: '/icons/cv.png', sizes: '96x96' }\] }  
    \]  
  };  
}

### **3.3. Favicons Dinámicos y Reactivos (Canvas API)**

Para traccionar la atención del usuario hacia pestañas inactivas en segundo plano, INDI inyecta insignias de notificación en el Favicon durante eventos en tiempo real (ej. cuando se detecta una lectura NFC exitosa).  
Utilizando el API del Canvas bidimensional, se sintetiza un nuevo blob de imagen sobreescribiendo el nodo DOM \<link rel="icon"\>:

TypeScript  
// src/shared/lib/dom/DynamicTabFavicon.ts  
export const updateFaviconBadge \= (count: number) \=\> {  
  if (typeof document \=== 'undefined') return;  
    
  const canvas \= document.createElement('canvas');  
  canvas.width \= 32;  
  canvas.height \= 32;  
  const ctx \= canvas.getContext('2d');  
  if (\!ctx) return;

  const img \= new Image();  
  img.src \= '/favicon-32x32.png'; // Carga síncrona  
  img.onload \= () \=\> {  
    ctx.drawImage(img, 0, 0, 32, 32);  
      
    if (count \> 0) {  
      // Dibuja la esfera de notificación  
      ctx.beginPath();  
      ctx.arc(24, 8, 8, 0, 2 \* Math.PI);  
      ctx.fillStyle \= '\#EF4444'; // Equivalente sRGB a oklch rojo de alerta  
      ctx.fill();  
        
      // Tipografía interna  
      ctx.fillStyle \= '\#FFFFFF';  
      ctx.textAlign \= 'center';  
      ctx.textBaseline \= 'middle';  
      ctx.font \= 'bold 10px Inter, sans-serif';  
      ctx.fillText(count \> 9 ? '9+' : count.toString(), 24, 9);  
    }  
      
    const link \= document.querySelector("link\[rel\~='icon'\]") as HTMLLinkElement;  
    if (link) {  
      link.href \= canvas.toDataURL('image/png');  
    }  
      
    // Manipulación de retención si la pestaña está oculta  
    if (document.visibilityState \=== 'hidden') {  
      document.title \= \`(\${count}) Nueva conexión \- INDI\`;  
    }  
  };  
};

## **4\. SISTEMA DE POSICIONAMIENTO ORGÁNICO EN GOOGLE (SEO TÉCNICO & P-SEO)**

El ecosistema SEO de INDI debe garantizar que el identificador público del usuario asuma un control hegemónico de los resultados de búsqueda, un fenómeno categorizado como *Name SEO*.

### **4.1. Arquitectura de Datos Estructurados JSON-LD**

La desambiguación de entidades algorítmicas requiere el abandono del obsoleto paradigma RDFa a favor de JSON-LD estructurado y tipado mediante TypeScript. Las directrices de Google Search Central exigen estrictamente el uso del esquema ProfilePage, en el cual la propiedad central mainEntity envuelve a la entidad subyacente Person o Organization18.  
El generador inyectable en *React 19 Server Components* procesa los datos expuestos desde Drizzle ORM:

TypeScript  
// src/features/seo/lib/generateProfileSchema.ts  
import { Person, ProfilePage, WithContext } from 'schema-dts';

export const generateProfileSchema \= (userData: any): WithContext\<ProfilePage\> \=\> {  
  return {  
    "@context": "https\://schema.org",  
    "@type": "ProfilePage",  
    "dateCreated": userData.createdAt.toISOString(),  
    "dateModified": userData.updatedAt.toISOString(),  
    "mainEntity": {  
      "@type": "Person",  
      "name": userData.fullName,  
      "alternateName": userData.socialHandle,  
      "jobTitle": userData.headline,  
      "url": \`https\://soyindi.cl/c/\${userData.slug}\`,  
      "image": userData.avatarUrl,  
      "sameAs": userData.verifiedLinks, // e.g., \["https\://linkedin.com/in/user", "https\://github.com/user"\]  
      "address": {  
        "@type": "PostalAddress",  
        "addressLocality": userData.location.city,  
        "addressRegion": userData.location.region,  
        "addressCountry": "CL"  
      },  
      "contactPoint": {  
        "@type": "ContactPoint",  
        "contactType": "professional",  
        "email": userData.publicEmail  
      }  
    }  
  };  
};

Esta semántica permite a Google comprender que la URI no es simplemente un directorio, sino la representación viva del sujeto profesional en el mercado regional chileno y global.

### **4.2. Protocolo IndexNow e Indexación Instantánea**

La dependencia pasiva de los sistemas de rastreo (*pull model*) de sitemaps ha quedado obsoleta frente a ecosistemas dinámicos. INDI integra el protocolo *IndexNow*, un modelo *push* reactivo adoptado por Bing, Yandex y componentes de inteligencia artificial, que notifica a los nodos de búsqueda instantáneamente frente a la creación o mutación de un currículum o tarjeta19.  
La especificación requiere validar el control del dominio alojando una clave criptográfica (API Key) en formato de texto plano en la raíz de la infraestructura (ej. https\://soyindi.cl/una-clave-secreta-hex.txt)19.

TypeScript  
// src/app/actions/indexnow.ts  
'use server';

export async function notifySearchEngines(urlList: string\[\]) {  
  const payload \= {  
    host: "soyindi.cl",  
    key: process.env.INDEXNOW\_API\_KEY,  
    keyLocation: \`https\://soyindi.cl/\${process.env.INDEXNOW\_API\_KEY}.txt\`,  
    urlList: urlList // Batch submission de URIs actualizadas  
  };

  try {  
    const response \= await fetch("https\://api.indexnow.org/indexnow", {  
      method: "POST",  
      headers: { "Content-Type": "application/json; charset=utf-8" },  
      body: JSON.stringify(payload)  
    });  
      
    // Status 200 (Éxito), 202 (Aceptado en cola), 422 (Fallo de verificación de llave)  
    if (response.status \=== 200 || response.status \=== 202) {  
      console.log(\`\[IndexNow\] URLs despachadas exitosamente a los motores. Code: \${response.status}\`);  
    } else if (response.status \=== 429) {  
      console.warn('\[IndexNow\] Advertencia: Límite de cuota excedido. Despacho retenido.');  
    }  
  } catch (error) {  
    console.error('\[IndexNow\] Error fatal de infraestructura en comunicación de socket.', error);  
  }  
}

20

### **4.3. Programmatic SEO (P-SEO) y Core Web Vitals Extremos**

La expansión topológica a escala nacional emplea *Programmatic SEO* (P-SEO). Se construyen de forma automatizada y particionada arquitecturas jerárquicas como /profesionales/\[profesion\]/\[region\]. Estas rutas interconectan el grafo de usuarios mediante Server Components renderizados asíncronamente (ISR con revalidate \= 60).  
Para prevenir penalizaciones algorítmicas por *Doorway Pages* (páginas de entrada vacías o *thin content*), se integran resúmenes generados por inteligencia artificial que amalgaman estadísticas y perfiles laborales sobresalientes por zona geográfica. El rendimiento roza el absolutismo técnico garantizando un **LCP (Largest Contentful Paint) ![][image1]** y un **INP (Interaction to Next Paint) ![][image9]**. Esto se fundamenta en la arquitectura distribuida global de bases de datos Turso sobre LibSQL, la cual aprovisiona réplicas de sólo-lectura insertadas perimetralmente con latencias intrínsecas menores a 15 milisegundos a nivel geográfico3.

## **5\. PLAYBOOK ESTRATÉGICO PARA EL CEO: CRECIMIENTO PRODUCT-LED & UNIT ECONOMICS**

El éxito corporativo de INDI depende de métricas asimétricas de retención y la transformación matemática de los usuarios base en vectores de captación (Product-Led Growth).

### **5.1. Bucle Viral y el Coeficiente Viral (K-Factor)**

La penetración del producto se calcula mediante el Coeficiente Viral ![][image10]. Se define matemáticamente como:  
![][image11]  
Donde ![][image12] es la cantidad de invitaciones o impresiones que cada tarjeta distribuida emite en el mundo atómico y digital (p. ej., lecturas de un código QR, clics en correos electrónicos) y ![][image13] es el ratio de conversión (porcentaje de visualizaciones que devienen en un nuevo usuario activo)25.  
Para sostener una curva epidémica (![][image5]), se inyecta una micro-atribución persuasiva y táctica en el extremo inferior de los perfiles: "*Identidad Verificada con INDI • Crea tu perfil en 30s*". Al minimizar la fricción del embudo (Onboarding) mediante flujos de delegación de identidad nativa de Google OAuth controlados por *Better-Auth*27, el valor ![][image13] se multiplica.

### **5.2. Optimización de Conversión: La Matriz "El Semestre Irresistible"**

El modelo *Freemium* pasivo se reemplaza por un *Free Trial* inmersivo de 3 días que expone toda la potencia de la Inteligencia Artificial y marca blanca. La fijación de precios opera sobre anclaje psicológico profundo (*Price Anchoring*).  
La arquitectura tarifaria se presenta mediante asimetría contable:

* **Plan Pro Mensual:** \$4.990 CLP / mes.  
* **Plan Pro Semestral:** \$15.000 CLP.

Esta disparidad evidencia matemáticamente un ahorro frontal del 50% (\$2.500 CLP / mes), desencadenando una irracionalidad lógica en favor del compromiso a largo plazo. Para la empresa, el flujo de caja adelantado y la mitigación inmediata del *Payback Period* facilitan la reinversión del capital en la infraestructura Cloudflare / Vercel. Adicionalmente, el motor de referidos propulsa una distribución P2P, garantizando un 25% de comisión recurrente líquida, transformando a cada usuario satisfecho en un afiliado orgánico comercial.

### **5.3. Unidad de Negocio B2B e Identidad Adhesiva (Sticky Identity)**

La fuga de usuarios (*Churn Rate*) se paraliza al instituir el "Efecto de Bloqueo" o *Sticky Identity*. Una vez que la tarjeta INDI del profesional se disemina en prospectos comerciales, firmas de correo electrónico y credenciales físicas plastificadas con QR, el costo técnico y reputacional de la desactivación se torna prohibitivo.  
Para escalar la facturación de la organización, se despliega la iniciativa B2B "**INDI for Teams**", dirigida a despachos corporativos, clínicas y agencias inmobiliarias (volúmenes de 10 a 500 colaboradores). Empleando el robusto sistema de Control de Acceso Basado en Roles (RBAC) que suministra Better-Auth27, los gerentes de Recursos Humanos adquieren la potestad de administrar centralizadamente los enlaces de los empleados y unificar la facturación en contratos de carácter anual.

### **5.4. Cuadro de Mando Ejecutivo (North Star Metrics)**

El panel de gobierno (*Dashboard*) ejecutivo que el CEO debe monitorizar semanalmente se conforma de:

| Métrica Ejecutiva | Expresión Funcional | Umbral de Salud Financiera 2026 |
| :---- | :---- | :---- |
| **Relación LTV:CAC** | (Vida Útil ![][image14] Margen Contribución) / Costo de Adquisición Total | ![][image15]. Indicador absoluto del poder del embudo viral orgánico (Product-Led). |
| **Payback Period** | CAC / (ARPU ![][image14] Margen Bruto) | ![][image16]. El flujo de caja generado se reinvierte aceleradamente. |
| **Net Revenue Retention (NRR)** | (MRR Inicial \+ Expansión \- Contracción \- Fuga) / MRR Inicial | ![][image4]. Un valor superior a 100% implica que los usuarios actuales generan rentabilidad creciente por cuenta propia (B2B Up-selling). |

## **6\. EXPERIENCIA INTEGRADA DE CV ATS & PRESENTACIONES ORBITALES**

La dualidad entre la evaluación humana superficial y el filtrado paramétrico de sistemas de reclutamiento subyace en el corazón del módulo *Smart CV*.

### **6.1. Dicotomía ATS Vectorial vs Web Interactivo Vivo**

Los analizadores sintácticos de los sistemas ATS corporativos (*Applicant Tracking Systems* como Workday, Greenhouse y Taleo) procesan secuencias de datos siguiendo trayectorias lineales de izquierda a derecha y de arriba hacia abajo. Consecuentemente, el uso de currículums de múltiples columnas o aquellos estructurados empleando tablas anidadas provoca un fallo de disección estructural crítico; las fechas se amalgaman erróneamente con las descripciones, y los registros enteros quedan omitidos en la base de datos30.  
El modelo INDI disuelve esta vulnerabilidad proveyendo dos perfiles paralelos que coexisten:

> 1. **PDF Vectorial ATS-Friendly:** Un formato PDF de exportación rígido diseñado estrictamente bajo el estándar DIN EN ISO 216 para formato A4 (dimensiones algorítmicas de ![][image17], rasterizado ideal a ![][image18] en resoluciones profundas de ![][image19])34. Elimina las divisiones horizontales por columnas y asegura la inyección en las capas de texto legibles, estructurando logros bajo sintaxis *STAR* o métodos multimodales *XYZ*.  
> 2. **Visor Web Vivo (/cv/\[slug\]):** La cara pública e interactiva renderizada dinámicamente en el navegador que exuda interactividad y deleita al *Hiring Manager* en los primeros 10 segundos, cargando repositorios, métricas interactivas y gráficos de competencias.

### **6.2. Arquitectura de Exportación vCard 4.0**

El ecosistema de tarjeta de contacto culmina con la integración indolora a las libretas de direcciones nativas de smartphones a través de la síntesis programática del formato .vcf. Para garantizar una compatibilidad semántica irrestricta, se emplea estrictamente el protocolo IETF RFC 6350 (vCard 4.0)35.  
Esta iteración de 2011 sobrepasa sustancialmente la limitación del legado 3.0 al forzar codificación UTF-8 innegociable, eliminando corrupciones de caracteres con acentos o símbolos fonéticos en apellidos latinoamericanos37. Más importante aún, permite la segregación organizacional y la multiplicidad de entidades paramétricas mediante propiedades como ORG, la asociación funcional ROLE y el contexto geográfico GEO36.

### **6.3. Presentaciones Orbitales y Protocolo de Enlaces Protegidos**

El visor de presentaciones comerciales en proporción cinematográfica 16:9 (/p/\[slug\]) es potenciado por auras volumétricas calculadas de los esquemas OKLCH, empleando la nueva sintaxis *Tailwind CSS v4* con integración nativa a propiedades CSS de interpolación color-mix()1.  
Para expedientes de cotizaciones comerciales B2B o carteras confidenciales, se estructura una matriz de protección contextual sin fricciones extremas:

* **Capas de Expiración:** Generación de enlaces efímeros o temporizados que invalidan la lectura asíncrona de Drizzle ORM luego de cumplir el parámetro de fecha establecido en la consulta SQL41.  
* **Accesos con Cifrado Temporal:** Contraseñas de acceso (PIN) procesados mediante el middleware de la infraestructura *Better-Auth* y su capacidad de gestionar *Cookies de Sesión* de caché persistente (getCookieCache) sobre el Edge Runtime de Next.js 16 (la antigua middleware.ts, refactorizada ahora como la capa de proxy.ts)43.

## **7\. ROADMAP TÉCNICO DE IMPLEMENTACIÓN EN 4 FASES (SPRINTS DE INGENIERÍA)**

Para orquestar el despliegue hacia la plataforma de INDI sin comprometer la estabilidad y escalabilidad, la arquitectura se ajusta a la estricta doctrina de *Feature-Sliced Design* (FSD), segregando el código en entidades de dominio (Entities), lógica encapsulada (Features), y orquestación de vista (Widgets).  
La telemetría de tipos atómicos es garantizada a nivel de contrato mutuo entre cliente y base de datos con *Zod*:

TypeScript  
// src/shared/api/contracts/profile.schema.ts  
import { z } from 'zod';

export const ProfileSchema \= z.object({  
  slug: z.string().min(3).max(48).regex(/^\[a-z0-9-\]+\$/),  
  fullName: z.string().min(2).max(128),  
  role: z.string().max(100),  
  avatarUrl: z.string().url().optional(),  
  themeColor: z.string().regex(/^oklch\\(\[\\d.\]+\\s\[\\d.\]+\\s\[\\d.\]+\\)\$/).default('oklch(0.5 0.1 260)'),  
  vCardConfig: z.object({  
    organization: z.string().optional(),  
    role: z.string().optional(),  
  }).optional()  
});  
export type Profile \= z.infer\<typeof ProfileSchema\>;

### **Matriz de Prioridad, Impacto y Esfuerzo (Tabla de Fases)**

| Sprint de Ingeniería | Ámbito y Ejecución Estructural FSD | Complejidad | Impacto en KPIs |
| :---- | :---- | :---- | :---- |
| **Fase 1: Transición Visual & Tipografía** | Migración profunda de la directiva @theme en Tailwind CSS v4 para estandarizar el espacio de color OKLCH y la validación APCA Lc 75 para legibilidad de accesibilidad1. | Baja | Extremadamente Alto (LCP, INP y Retención visual). |
| **Fase 2: Motor *Edge* Open Graph y Assets** | Despliegue de los manejadores /api/og de Satori en Node/Edge Runtime. Incorporación de los archivos maestros SVG con *prefers-color-scheme* y PWA Manifest.ts13. | Media | Alto (CTR social masivo en LinkedIn/WhatsApp). |
| **Fase 3: Transacciones y Posicionamiento** | Generadores estáticos JSON-LD e inyección atómica *Server Actions* de IndexNow. Refactorización a lotes transaccionales masivos mediante el *Batch API* de Drizzle ORM19. | Alta | Crítico (Posicionamiento absoluto de *Name SEO* e indexación ![][image2]). |
| **Fase 4: Modelo B2B y Telemetría PLG** | Implementación del muro de cobro asimétrico de Mercado Pago SDK v2 y asignación de suscripciones recurrentes, anidando RBAC y autenticaciones sin contraseña (Passkeys / WebAuthn) mediante el plugin de *Better-Auth*47. | Extrema | Vital (Rentabilidad del negocio, NRR ![][image4], ![][image5]). |

La adherencia inquebrantable a esta arquitectura asegura que INDI consolide su preeminencia como el ecosistema definitivo de presencia profesional digital del 2026\. La reducción de dependencias de terceros, la exclusión estricta de bases de datos centralizadas de alta latencia y la capitalización sobre la capa perimetral (Edge) reafirman a la compañía como el estándar tecnológico a batir en el segmento de capitalización B2B y SaaS latinoamericano.

#### **Obras citadas**

> 1. Upgrade guide \- Getting started \- Tailwind CSS, [https\://tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)  
> 2. A dev's guide to Tailwind CSS in 2026 \- LogRocket Blog, [https\://blog.logrocket.com/tailwind-css-guide/](https://blog.logrocket.com/tailwind-css-guide/)  
> 3. SQLite on the Edge: Prisma Support for Turso is in Early Access, [https\://www\.prisma.io/blog/prisma-turso-ea-support-rXGd\_Tmy3UXX](https://www.prisma.io/blog/prisma-turso-ea-support-rXGd_Tmy3UXX)  
> 4. Turso Has a Free Edge SQLite Database That Puts Data Closer to, [https\://dev.to/0012303/turso-has-a-free-edge-sqlite-database-that-puts-data-closer-to-users-4c38](https://dev.to/0012303/turso-has-a-free-edge-sqlite-database-that-puts-data-closer-to-users-4c38)  
> 5. Generating accessible color palettes for design systems … inspired, [https\://ubuntu.com/blog/generating-color-palettes-for-design-systems-inspired-by-apca](https://ubuntu.com/blog/generating-color-palettes-for-design-systems-inspired-by-apca)  
> 6. Luminance and Color Contrast \- The Quorum Programming Language, [https\://quorumlanguage.com/tutorials/accessibility/luminanceandcolorcontrast.html](https://quorumlanguage.com/tutorials/accessibility/luminanceandcolorcontrast.html)  
> 7. APCA and the WCAG 3 draft \- Colourwise, [https\://colourwise.app/accessibility/apca-and-wcag-3-draft](https://colourwise.app/accessibility/apca-and-wcag-3-draft)  
> 8. Optimize images · Cloudflare use cases, [https\://developers.cloudflare.com/use-cases/performance/image-optimization/](https://developers.cloudflare.com/use-cases/performance/image-optimization/)  
> 9. Is client-side image compression a good idea for an image-heavy, [https\://www\.reddit.com/r/nextjs/comments/1wr5zbi/is\_clientside\_image\_compression\_a\_good\_idea\_for/](https://www.reddit.com/r/nextjs/comments/1wr5zbi/is_clientside_image_compression_a_good_idea_for/)  
> 10. Serverless SQL: Supabase & Neon B2B Guide | Pragma-Code, [https\://www\.pragma-code.de/en/blog-supabase-neon-serverless-sql-databases-b2b](https://www.pragma-code.de/en/blog-supabase-neon-serverless-sql-databases-b2b)  
> 11. Free OG Image Generator | CommonNinja, [https\://www\.commoninja.com/free-tools/website-tools/og-image-generator](https://www.commoninja.com/free-tools/website-tools/og-image-generator)  
> 12. Resize Image to 1200x675 Pixels Online \- ImageXyz, [https\://imagexyz.net/resize-image-1200x675](https://imagexyz.net/resize-image-1200x675)  
> 13. vercel/satori: Enlightened library to convert HTML and CSS to SVG, [https\://github.com/vercel/satori](https://github.com/vercel/satori)  
> 14. Functions: ImageResponse | Next.js, [https\://nextjs.org/docs/app/api-reference/functions/image-response](https://nextjs.org/docs/app/api-reference/functions/image-response)  
> 15. Satoru Wasm: High-Performance HTML to SVG/PNG/PDF Engine, [https\://github.com/SoraKumo001/satoru](https://github.com/SoraKumo001/satoru)  
> 16. Open Graph (OG) Image Generation \- Vercel, [https\://vercel.com/docs/og-image-generation](https://vercel.com/docs/og-image-generation)  
> 17. LPLinkMetadata | Apple Developer Documentation, [https\://developer.apple.com/documentation/linkpresentation/lplinkmetadata](https://developer.apple.com/documentation/linkpresentation/lplinkmetadata)  
> 18. Profile Page (ProfilePage) Schema Markup | Google Search Central, [https\://developers.google.com/search/docs/appearance/structured-data/profile-page](https://developers.google.com/search/docs/appearance/structured-data/profile-page)  
> 19. IndexNow: Instant Search Engine Indexing for Your Website, [https\://asepalazhari.com/blog/indexnow-instant-search-engine-indexing](https://asepalazhari.com/blog/indexnow-instant-search-engine-indexing)  
> 20. IndexNow Integration: Developer's Guide to Instant Indexing \- Pristren, [https\://pristren.com/blog/indexnow-integration-submitting-content-instantly/](https://pristren.com/blog/indexnow-integration-submitting-content-instantly/)  
> 21. API Documentation \- Instant IndexNow, [https\://instantindexnow.com/docs](https://instantindexnow.com/docs)  
> 22. Integrating IndexNow with Optimizely Publishing, [https\://world.optimizely.com/blogs/kennyg/dates/2024/10/integrating-indexnow-with-optimizely-publishing/](https://world.optimizely.com/blogs/kennyg/dates/2024/10/integrating-indexnow-with-optimizely-publishing/)  
> 23. IndexNow API Implementation Guide: Fast Setup Tips \- Sight AI, [https\://www\.trysight.ai/blog/indexnow-api-implementation-guide](https://www.trysight.ai/blog/indexnow-api-implementation-guide)  
> 24. 8 Edge Database Choices for Global Millisecond Reads \- Medium, [https\://medium.com/@ThinkingLoop/8-edge-database-choices-for-global-millisecond-reads-aa468b9cc8d1](https://medium.com/@ThinkingLoop/8-edge-database-choices-for-global-millisecond-reads-aa468b9cc8d1)  
> 25. VC & PE Glossary: Investment… \- Venture Capital Tracker, [https\://venturecapitaltracker.com/glossary](https://venturecapitaltracker.com/glossary)  
> 26. Insights | Ranit Sanyal, [https\://www\.ranitsanyal.com/insights](https://www.ranitsanyal.com/insights)  
> 27. Installation | Better Auth, [https\://better-auth.com/docs/installation](https://better-auth.com/docs/installation)  
> 28. ShipSasS \- AI-Powered Productivity Platform, [https\://www\.shipsaas.net/](https://www.shipsaas.net/)  
> 29. Blog | StackNotice, [https\://stacknotice.com/blog](https://stacknotice.com/blog)  
> 30. Rejected in 5 Minutes: Did an AI Actually Read My Resume?, [https\://leonstaff.com/blogs/rejected-in-5-minutes-did-ai-read-my-resume/](https://leonstaff.com/blogs/rejected-in-5-minutes-did-ai-read-my-resume/)  
> 31. Why Your Resume Gets Rejected by ATS (And How to Fix It), [https\://www\.resumerefiner.ai/blog/why-ats-rejects-your-resume](https://www.resumerefiner.ai/blog/why-ats-rejects-your-resume)  
> 32. ATS Formatting Guides for Recruitment Agencies \- Distill.cv, [https\://distill.cv/guides/ats-guides](https://distill.cv/guides/ats-guides)  
> 33. Can ATS Read Two-Column Resumes? | IsMyResumeGood, [https\://ismyresumegood.com/blog/can-ats-read-two-column-resumes](https://ismyresumegood.com/blog/can-ats-read-two-column-resumes)  
> 34. A4 Paper Size: The World's Most Popular Sheet, [https\://www\.designyourway.net/blog/a4-paper-size/](https://www.designyourway.net/blog/a4-paper-size/)  
> 35. Python vObject 1.0.0 documentation \- Read the Docs, [https\://vobject.readthedocs.io/latest/](https://vobject.readthedocs.io/latest/)  
> 36. RFC 6350: vCard Format Specification, [https\://www\.rfc-editor.org/rfc/rfc6350](https://www.rfc-editor.org/rfc/rfc6350)  
> 37. vCard 2.1 vs 3.0 vs 4.0: Every Difference That Matters \- Univik, [https\://univik.com/blog/vcard-21-vs-30-vs-40-differences/](https://univik.com/blog/vcard-21-vs-30-vs-40-differences/)  
> 38. vCard 4.0 Multi-Organization Support \- Jevid, [https\://jevid.com/blog/vcard-4-0-multi-organization-support-role-based-visibility/](https://jevid.com/blog/vcard-4-0-multi-organization-support-role-based-visibility/)  
> 39. vCard 4.0 Format Specifications and Examples \- VCF Converter, [https\://www\.vcfconverter.com/blog/vcard-4-0-format-specifications](https://www.vcfconverter.com/blog/vcard-4-0-format-specifications)  
> 40. Color Formats in 2026: HEX, RGB, HSL, and Why OKLCH Matters, [https\://www\.devtoolnow.com/guides/color-formats-hex-rgb-hsl-oklch](https://www.devtoolnow.com/guides/color-formats-hex-rgb-hsl-oklch)  
> 41. Nitish Sharma, Author at LogRocket Blog, [https\://blog.logrocket.com/author/nitishsharma/feed/](https://blog.logrocket.com/author/nitishsharma/feed/)  
> 42. Batch API \- Drizzle ORM, [https\://orm.drizzle.team/docs/batch-api](https://orm.drizzle.team/docs/batch-api)  
> 43. Next.js integration \- Better Auth, [https\://better-auth.com/docs/integrations/next](https://better-auth.com/docs/integrations/next)  
> 44. Next.js authentication: patterns that hold up in production \- Arc, [https\://arc.dev/employer-blog/nextjs-app-router-authentication/](https://arc.dev/employer-blog/nextjs-app-router-authentication/)  
> 45. WCAG Contrast or APCA: Which Should You Design To?, [https\://phoenix.studio/blog/color-contrast-wcag-vs-apca-2026](https://phoenix.studio/blog/color-contrast-wcag-vs-apca-2026)  
> 46. Batch API \- Drizzle ORM, [https\://orm.drizzle.team/docs/sqlite/batch-api](https://orm.drizzle.team/docs/sqlite/batch-api)  
> 47. Integración Mercado Pago Chile: API y Checkout | Blackend, [https\://www\.blackend.dev/integracion-mercado-pago-chile](https://www.blackend.dev/integracion-mercado-pago-chile)  
> 48. 8 Best Better Auth Starter Kits & Templates (2026) \- AdminLTE, [https\://adminlte.io/blog/better-auth-starter-kits/](https://adminlte.io/blog/better-auth-starter-kits/)  
> 49. Subscription management \- Mercado Pago Developers, [https\://www\.mercadopago.com.br/developers/en/docs/subscriptions/subscription-management](https://www.mercadopago.com.br/developers/en/docs/subscriptions/subscription-management)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAZCAYAAABkdu2NAAACVklEQVR4Xu2WTYhOYRTH/2LK12byMTSkbORjI0VNNmNhrWaKhSxYsJOEjZ0kFpLGLCayHFJKks0s3hWLqVmJEoWNImShpHz8/87z9J45c6/33terxP3Vv/c959x7n+ec59znuUBDQ8O/zGrqOHWZ2h1indC9E9Q4tSTE/gpGYBPsS/Y66mn67cRrasjZV6kPzv6jLIiOAgaoJ9SW4P9OXQq+yDLqVPDl51UZuyvULleo29SmECviOiyZ2FqfqG/BF9mGuSvdT01TC52vZ2ygvsImXZUWLMGIWq/I71kPu+YtNS/59sLm4JlPHaIuwlZ91+zwr9lBPaROw26uy0sUJ1Lmj9yCXScpsf2whDJ3qRlna77qjo7oIarER+poiNWhLJEyf2QxbGPJSd6h1ri4ntNytl6FKWfPYZR6Q+1De9f7HcoSKfN7lsJ2zO2wgh9EO9GV6ZpJ53sGe29zOxeyBzZ4rxJ8juJEqiR4BNaSHq2O7tP8xCrny7qRYqWoWtqKtZKLQqwuLdigsarvkr8MrV6LGizw34N9MGQ037PUI7STjOOVkjeZ8+huk1GlNaC2d498L5ytQg47Ox8Hy50vs5M6nP4/TnYmF0bHWWVUjfvUF9S8EdUPeu2G8m1NtsZUXMeCR/4z1OZkq9XH2uGf56NWOBa0MkpQ540Oep2LVdCktMWrhdQJ2pk3zroCOAa7ZkXwP4Alfo26CSvyARfXh8A56j31ivpMnXDxrjmJet+Eam8dxhdgbV8VvV8qhr5l9d7FL6K16VfPV/F7sTE2NDQ0NPx//AAOVX8jT35bRQAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAWCAYAAACWl1FwAAAAlElEQVR4Xu3WIQ7CQBBG4WloBRqFrOUC+J4BwS3qUFwD3RvUknABjoCuxRAsoQmPTNU0HIDM/yXP7LjJJrtmIiIi8ocO9IiHWa3pRD1twiyVgi70Nl9Kelu60pFWYZZKRQPdaRlmKe3Ml7E3X45MFnQz3ZSZ72IaelIbZmL++pzpZXp9ZmoaqYsDcfrR/lDGAxGRyQfT4xIgQLsylQAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAAYCAYAAABDX1s+AAACS0lEQVR4Xu2WTUgVURTHT5hkGCYlalSUoIvCheCivYtE+nATaOsg2kg7BWnTwkW2ySAEESIiEhW3RQS1KxB0E7jJRYsIEokWbaTS/59zp3fm0sy8N47xnt0f/Hhvzr135s65XyMSCAQC1c8IPOcHwUU46MWOwh4vVvM0wjm4DX+63yuxGspD0TLraqxGlTMKv/nBDHolOSFj8IkfrAVOwEdwCZ73yrLYNwk5AF+JTnkmJC/lJOQ2fO9+j5tytomW0id4D27Azy52CrbDL/Cti02zoYH70Rt4Ay7AX6J9qogL8B28I/EO5iErIeuie8k1+BH+MOUN8Ixo+6/wLjwM6+E8fA5fiA4e4b1YN6IVfhCtHzEkZSaEjTgKfDAfWhRpCeHJw+RHHISL8KXE+8Ak2RclvN+mxE8vzjZbj89m20tSSgqfcexPjQQ4OkzEsMSzWQRpCfkbnC18CTuKSQnhANrl7CeERziXImNcKhOw05SnUgfX5N/OkC244sW4jPz6TIhdSiQtIZwFlj445crorXhxMkwKG38X3eCKICkh3B+iDlrGXWzAxCpNyBF3fVbiL98En8HXot9KFcGNihsWR3GvThlueCfNdZvoLH0gpY2SVLpkooREe4ilRXSf8mdR2XSIrr/HfkEGzaKf5vdFO8nOsvP21OJIPTXXs6J1ufYJZ1EX/O3i/M+X7Rb9LuLL3oSHRO+77OpdFj1hooT0iyaYXodXpSDyfKlmwWU6CWfgaa9st3BZcNbxGUwQ5f9CyT3VAoFAIBD4v9kBVKSKjrLOQHAAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAWCAYAAACYPi8fAAAAlklEQVR4Xu2WIQ7CUBAFlxAsHonCYeu5UC/ADZCEBMcNOAAX6CUwWHRFRZt0Nk3NHmH3TTLqqZ/9+7JmQgghRBru+MVdDLKzxQv+sQ1ZGTb4wREPISvBESd8xaASNxywseVHlGKPPXYxyMw68bMVmbiX2wPfeApZOtZW9wmXaXUvL9/hqy07nZ4n/qzg5eYP9utNCJGLGXueEjNlR0E+AAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAXCAYAAAC74kmRAAABY0lEQVR4Xu2WPUsDQRCGX/EDAxaCggiCaG0rNlZWVlpqbWMj8Q9YpEll5x9IaSP+ALGwsrEWxUasRBuxsFDx432ZDTmGSIi3cJdjH3gIN5NAZnZ294BEIpFhnE76YA/0m8pwRH+6OB3yQ7TlchchVyk+YcV51IANWqfDLlcp2qvrOaD3PtgDNW2g0Lj70V6mt3Q0E+sHbZsPuuATZUTFqgHN8KwVfIKNfh5mYU04RYmnYoSe0Ee6SC9hzTgOuVjs01e6hpKdJRr/a3oOW/EGvaIvdKnztSjU6DN9wP+3VnRWYTfAG70LsT3YFDTCc0xU+DasETsuVwgafxU7l4lpv/51K8Rik97QLRR8Pmj8Vah/u3sP8QkXz0t7ArQN9Fk4KvLbB2F/LuZhWMpDUIWpSN0AnhnYiOY9DKfoIT2jKy5XGPPo7PGsuyE/1iXX7yS06BcG5EUoNuuwVdfqJxKJRKJM/ALgoE7QV3PdsAAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAZCAYAAAB6v90+AAACP0lEQVR4Xu2WzyttURTHl1AG8iOhV8TAROINxMyQMnkDBv4AhfTmplf5A2RA3iNR/gQZmFwTGbx6FDJkotDrZcDglfh+23u766537r3n3MtAnU99a+91zu3u7157r3VEUlJSIliD/kJN0C7Ukf/4jVtoygY/mjZow8S40O9QlYpVQzNQnYo9Qxk/7vTzdXHvkn5oB9qCan2sLBpsoASj4hazbeK90B/oRYnv6cXVQ0/QkIoxa3ozmMFTNS+bBRsowZm4RVtjX6Ar6J84Q0s+puH8ERpUsaw4w4Ef4rJVMUmMjUAD4hYTZezExCw14jZlXMVW1LhL3vFexTXWAh2L292slGeM0NisHzdC3/yYR5bZquheaeIaO4d6pLixC+gXNA39FGeCi9fwDh1Bd+LeD/BeTap5xcQxxsXN+XExY9eS23EWhGWJzgKftau4zRYLWhZa9POirIr7sRV32MaoVvczGZb8nS1kLApWSmatWDHoFncaAmwjN35Mo5nco2jKNXYguWyRJMaYRRrLmriGpvl/AbaMPTU/hJrVPDaljiLLs+5NVqF074sr87onxTHG9sFqGOD7etN+Q1/VPDaljFnCXbIZCxvAkh5gI2Yso2IBHjNmy94/a4wnRve92LyXMbYCflJpOL+H+kycsF8xWxZrjFeFdzUxSYzxDwsdRR7BeegS2vTPHnzcwizxY1hnN8A4s090NU5MEmNxYA9jMRiT/49ZYEIKf9XTDO8rN4cZ1Z9bidBf3ikpKSkpn5ZXPpGJrEYIDcoAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAAYCAYAAABDX1s+AAACg0lEQVR4Xu2WTchNQRjHHyHkM698RF2KBSlKsbGSWPjYUFgr2RHFxsbCghXqTdnIQgrZWCgpFwvKVimlUFIkWdj4/v88M++ZO91733OuIy/Or37dO8+cc++Z58w8M2YNDQ0NY5d18pQ8KzdlfSmH5XnzayZmff8EM+VtOSW0F8l78r1cGy8SO+RXK5LQkk/D51/BEfNBjcZF+V3uTmITQuxzEqN9P2nDevlcLsziY4oFclhelyuyvm5cMx8sSyWFGMK48J2ZlLJGfpMbs/gfhwe+Jb+YJ+RXmWyegI+hzW/SZjalxDjJ3Ba+4wt5Ur6Vr0KMpThfvpbtEDtnnayWd+ReedV8iZL0SlAMH8hjcijrG5SV5g98I7RHSwhxktgK7TfyuHldouZckZflTfOXB8/CtZG58rF1FupdVjIh3MRb4I9jMayLWDzTglomIRFmVTpQYPa8k8uTWKxdEQbOvVusSAq1bPbIFT3YaZ4IiuDv2PYoxC+zWLeB94r3SggvMF3OeULY7R6GGC/khFya9PdlvHxi9c6QuP2yziOzwuc08we9lPQBb5z4oSRGQmLtifRLCLMgZYM8E/pwf2d3b0gKN3+QB7K+QaCIscYj0+XdpM3DtZM2dNtlqiaEZMNi6xz8DPMXwEuamsRLQaFiMJ+s+i7DvZxZ+HNOoFEKNYOIMCPzc81RedqKQglVl0xMSKwhKXPMjwX5LCrNEvP1dyHv6MNBK6Znbru4bKTYxiW6ynzJtkKbXWaZ+YzhXr4zWHYszkUMdp+cZL4bPgrXbTXfYWJCNpsnGPfI7VYTZU+qVeGMwAxiu2fZ1gXLYp75b5IgrPP3fzLwVGtoaGhoaPi/+QHIpJxxZuaETwAAAABJRU5ErkJggg==>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAACiklEQVR4Xu2Xz8sNURjHH2GhhCIl6pVQsrBQROwoJTZSQhY2LCSlyO6WfwALSkpWslNiZTFZiRLl10axspCsbMiP78eZkzPPnJm5V6+XxfnUtzvznHtnnvme5zxnrlmhUChMzlLpuQ/WzJYuSVeltdKs5vA/4ZO0wQfFMum0dFna78bG4pv0wwfFfelacr7VQhJzk9hMMk+6I32WNrqxfRbyi/Bdct2UxHqhGjAhZ8QbabmLnZC2uNhMcdxCnt6IxdKz5DzySrrpgzm2S0+lyvJGEDvjYoekHS7mWSRd9MEEltspHxyAKjwn7bW2ERwTm0pi8Fi662JZHkqHrd8ItKA+Xyg9qD/7IOmRtROLjCzM1iSQJzO/x9pGrJLeSx+knUmcJX8gOc+yWVpdH1eWN2K3hZtGQ+5JKxrf6OeKNR94yKAurkvn6+OcEcDkxDwxgO9Qeb3woyo55zhnBNCA4g24+MHmcC88OGbEBx/Z5JUATyz0MugyAmjsMVc0OGkvpfXJeWV5I75Y2DaBi8Yb0LQmATO+2+8KHBeM5P7plp0zYr6Fao07xFELuZNr12vBr2rwD1JZ2whm4JGFdRmJN6C3DPWJlD81gi2RhpeSM4Ln4fop6cRl4QJp+XhxE6A7n62PU3ZJH6V1fqADZpXlsKb+nGoO93LD2vmlYhwq6W19nMKO0WlEjnfW/gHb5DEXgznSC2mJH8gwXc0yhcnxFUHVkJNnm/TVB/vIGUEPyW2VlPcFG37VjpXgH7orPi45I8jHLw1gp2FLHSRXenFpwEkLPeG2habFOK/dQ/yNF6rcko5LA1bWsdfSLQuv10dseMLGhor43/50dUHf4k2YfGmqhUKhUCgUpo+f7K6pNQZpZ5EAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAAYCAYAAABDX1s+AAAChUlEQVR4Xu2XT6hNURTGlxAiCj2EHoUiRRmYGEkM/BmgUEaUzBTFxMTAgBGvpKRkIIXMRFJeGVCmSokwkCLJwET+fb+39vb22fee++7hysP+1de9Z+197tn723utfa5ZoVAojE7WSxOz2G5pZRaDQ9I583vGZ23/DAPSt0xLKj3MtklfbNiEfulJ+PwrOCy9z4M1HMkDbcCke1lsjfRCmpvFRxVzpDPSdWlZ1lbHSIaMMTfkThZfJX2V1mXxPw4Dvi19NjekKRgyVTogPQifKfwmhlysiZNym8N39FI6Ib2VXoXYPGm29FoaDLGzVoWadVfaK101T1FMb8Rq6b50VJqRtXULhjw3n9g+6am0MWkfyRDiFGXqCddvpGPSJPOac0W6LN00Xzx4FvpG+qRHVi3UO6xLQ7iJVeDBPPRXWZpdjzMf7K1w3Y0hkY8hlsLueWfV53BP2o+Jcy8LEU1hHNN/9Khhu7kRO+33HnsMlgFCu4nXxesMYQHTdM4NmWaersRIlePSoqS9I2Olx9abHbJV+mStxycDiwOeEr5fGm4eghUnfjCJYUg0MtLJEHZBylrpdGhD+6vN9WAKN3+w1iLYhBvmD96TxVND4vVgcg3tTpmmhmA2LLDq5CnyLAAn2+Qk3hUUKgoWK930lCH1KGYps8wHeyqJsSPz9xqKMX1ioYSmKRMNiTUkZaZ0zVp3UdcsNM+/C3lDB8jddBVIwfMhRlskvqnGFF1hnrL94ZpTZrH5jmGifGeyy83fi5gsJ9gE89PwYei3yfyEiYZsMDcY7ZK2WI9o8qYKHN8nzf+rzM/aUnhH4L8M/UnbXsGCsDP5TQxCvfz9IX56qxUKhUKh8H/zHZoBl5qavhQRAAAAAElFTkSuQmCC>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAAA9UlEQVR4Xu2TwQoBURSGj1hQFkJhSdnJUilLa6+h8AgWnsCTsJKdxay8gchOKVlYWin8p3OmrtsdM5OVmq++pvufuWfmztxLlPArWViwwxB4jhMu1OANvmBbx+YDSnAFT3AE80bNyYOkmYsBvMK0XXCRIWnEb2dShEu9RqZM0syz8gOcWlkoQ5JmvJwcnOs4NrzEBbzABtySNGK5Foseyce/w6NmE5JmMx1Hxl/iBlY1q8Mz3MOKZpHYkTSzN2JXc8/KvxK0v/hHcP60C0H4+4s/vgteJtdbdsEkBTtwTHIz76cmfR4TPkJ8fLi+hn2SeQkJ/80byEkv/usHTksAAAAASUVORK5CYII=>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAxCAYAAABnGvUlAAABo0lEQVR4Xu3bvS5EQRgG4COhk4goRKXRuAAK0bkDGoViS4VOoVCrdKJ3A5QSNyIaEhGJik4lfr6JgzHZHGuzm7D7PMmbMz+7p/4y852qAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABtV85DXLh8c2a72wWS4AAPCz0ch9sXZSzHthuup9AQgAMBSWIwf1eCRyWz8BAPgjziPjkYXIRLHXK0eRy8hquVHbiixm81Y2bmc/8hC5LtYBAAZSuqZMBdVu5LDYa2c7ctOQqa+ffpqL7EROy41Mem/Sqr4Xb6XZyFo9vopMZnsAAAMnXYfmfWVp3I9TtnTFmt6d+uWaPEeWysVM+r8+OABgqBxH7rL5S+Qsm7fTzQnbeuSiau6N6+SEbaZSsAEAQ+YpspfNUy9ZKoiaCqtupKIwneZtlBu1TnvYyhO2sao/J4IAAEOp6arzt1aq9w8lAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4Z94A2bE4MxMujj4AAAAASUVORK5CYII=>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAcCAYAAACtQ6WLAAAAm0lEQVR4XmNgGAIgGYiV0QVBQByI/wNxA5o4HNgAMTO6IE7ACMRqQOyLLgECPUD8EojvALELsgTIETpQdjkQL2WAmAQGnkDMAcT8QHwCiCNgEiAAkgABSyD+CcSKSHJgIALEV4H4H7oECHgwQCSuM0DsE0KWnM8ACZlWIFZigNgNByAjHwKxJBBfBGIVZMkCBoixr4HYG1lixAMAW/sWLMVTccYAAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAbCAYAAACuj6WAAAAAgElEQVR4XmNgGAU0BTxAbAbECkDMiCrFwOAExHeBWA/K7wHi/whpiM73UBoGQApQFIE4IEU4AQcDRNEBNHEUIMkAUdSKLoEMxBkginzRJYBACMZgYYAoCkLIgYEMEJ9CFvAE4o9A/AiInwDxLyDWQlYAA6xAbM8AMQHkmVFAIgAA1JYUI235l48AAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAAAb0lEQVR4XmNgGAXDDHAAsQG6IBJgBOJMdEFkAFLwBIhN0CUYIHIJQGyGJo4BQAqLGVAVgsSeo4nhBSANrxkgGoi2GR3AXPIOiK3Q5IgCFBsA0gzyRgIDxP9EA4oDMYcBu40JDNjFUQDFCWkUjFwAABYcELVKOgITAAAAAElFTkSuQmCC>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAZCAYAAACPQVaOAAABg0lEQVR4Xu2WO0sEMRSFr6ggKCpoI9hoYyHY2guC9lrZi4VoL7ZWtr46sfIPWInFdoK9pYWCjYIgiIjg4xxi4HqZ2U1m4uJCPvhYuBkmOUk2E5FMJpMR6YOrsFvVuuA6HFa1lPD9K7bYDkbhNfwy9uuHEvEkv/toCVeAM5OKAdiAL+IGcASn9AMJWYLT8FYiws7BB7hp2qrgw7aT4LCeWXgJt+GIaYuhI8JqJuAHPLYNAfiwN3AD7sB3OK6eKWNR3KA5+DHT1oxaYQk724fncMa0NcOHHVK1NXhhakVMwjtxffI9odQOqxkUd+Bwm1eBJzQH05C4EKEkD/sKr2xDIAxYZXuGkizsLnwTt5VDPlGH8BP2qtq/DlvngPId6+3Kw4m1U9ij6kVwMmIvIJXCcuV4OHAlq64AA+2Z2oK4yZs3dQsvCI/yhweUv1Q8S5pLBeEn5B6eiAvJT4++K5fB0/oMbknrHUAYsMjSheJ1jjOj/2MpWIYHP7+x2zKTyWQymU7nGwLcWyB8CFEJAAAAAElFTkSuQmCC>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGkAAAAZCAYAAAAyoAD7AAADpUlEQVR4Xu2YS6iNURTHl1BElNfNI688IpIMbhQhAwYeeXQNhLFupERKcQcGDIS8kpKRkhgoSuIkeY/kMaEQBhQRA/Jav7v3dta3nXO+87hXt+xf/Tvf3mvv/X3fXnutvb8jkkgkEonE/8UWVd+4sgy9VFNV3U3daFWrKSc6ACb5oeqX6rvqhWpopkV5BonrZ3VY1cc2SlSmR1xRggGqpaqBqm1Sm5OIuPeqz+L6HcuaE+VgglnN51STI1se9ThpcVyZqMxE1Q/VydhQJf/CSd3ERe141Wxx0c44c1XDvD20W+bryzFftVc1R9UzslHeIM7eT7U8a25njeqIaoIU7xvor2pTbRWX1ldnzbXRrLql2iHu5RuhHifdUT1TrVTtVt1TjbCNIuiDg9i/2AtvSPHgcdfXUzfL1/F+X1UzfRlWiFuMpGqgzRfVKF9m3PP+GlrEpeXAcXH3Cffd7svB0Yy93l8Di75gylXDDVhJH1WbIlu91OOkK+JWXYCXpS6PcNDYb+pwMnVMaoB7UMezBd6ofpoy0XhatcuXcdipP1aRJtV9U2a8J6Y8RvVKigsBu80Qi1TXTDkXVuxbceEXh3ij1OqkUjwS95J5x3jaMJkzTB33j/vGTuLYT/mpuLkI2iMuonHIbd+GiHigGtfe0zHJ285Itv911QnfhsilDQciFhzpsibI00xkV3VSQdwL5o1Bm0+qaaauGieF8jtxactqp7fjCCKFdkE4EVgUlImsuH/Yd9aqvvl2iGxFNNUEqY6HIKJ6R7ZGqMVJLJCjqkP+OlCQ6p0U36uSk0iFtlwIDcrAMx1QPZfiZENwkk2fpWB/PysumsKiqJtmcQcHVkpnHhxYDPNMmTa0vSjZSSW381J532i1OsnuMexHpKQYDk+kpseqsaZ+uDhnMRanOMYjJcas8784xz7/Eik6uW648SVxIVpqgqulkpMuiHvQ6b4cNuvYGUwge0EejFXLnmSddNnX2QhmDohqfhm31dg4QrNXhmf9INmDB7DAF/pr7FOMbYH83b4hmOB94j5m+W7KI0RESAlWNiVsFjf5g00dkK9fq66Ks2+U7H95McERVpykcIKt45ni5ypI0YFEDPejnpTE8T3AAaJN3HbwUtwzthg78KFPX8ZgcR80tpviUiVZgf6MzbdUh8NHGCuis+F/ulXiPgr5/ZcQSSPFRQERFGjyv0PELcJyiwaHEzE2ciH890jfUlklkUgkEolEIpFIdA1+A+ji8n/TsX+7AAAAAElFTkSuQmCC>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHkAAAAZCAYAAAAVDoETAAAEXklEQVR4Xu2ZT6hXRRTHT1RQGGQUalT0LAtEMdDykbh4ixIijKCkwJ0tdPEWoqAgLX4u3IigSSRIIRKhQQQibiT0RwgGrYIoMYIUq4WoIBhp+Od8nDn+5p47856/33tPnjEf+PK8Z+Z375lz5p6ZuYpUKpVKpVKZbjyg2qraq1qlmtFsbrFI9ZA3Rh5UvSHhXhtd271kWLVdtVu1wrWlMNbPJPibGze/f0n1iG+4n2Bwx5Lrr1Q3Ve8lNvgr2q/Hv481m2/zuOqSamm8ZvLcUG2602PqwYfvVI/G62dV30vTL4Ox0GacjjKeUP0oYbw5vdnrOr25olqTXD+n+k11TjU3sb+vGlHtl3KSR1WfSkiu8avqfHI91XykuihNH5ZI8PkHCZMA5kXbauskwX9s9lsmyBkJL0Kqg6qrSb9pj83KtBwxcGybE5tRSjKBZMK85ezWf7xy94mEoJZYr3rbGzN8I+F5lNkUG+dKCUsN/fAXvw0bwzvxmr5Hes13+F3CJLlv+FP1j7MNkmQCgj0NGmyL9tnO7umofvLGyMMSKsLzviEDE4HxvOrsaZLxvSvlJG+J1/Sb2Wu+Dcn1S9nTUc/E6xdV70pzYvNvbLSlUA34Leu+7XNGJPhplYK/Q9Hu4z4QJIOA/qya5dqglGQmRC7JJXuOXDI70TYRFkrw4bD01urPpZ1kqhD92JfkSvE6CctYChvNDySs+ZTxo0kb9zolocTzXMa3T3VAegkljl/HvickLDfwZLTtVC2LNjaT+Px6vB4YS8py3xCZyiTDHuklNZf0fiGYJPSs6oXE/qHqP2mO03ztSnt8wF6FPYfHKgN7jwWJ/W8J97N9APCGss7z9qY2+u2S5uTCxsbVsOfg58AQTGbKWGvfVCcZSC6Dm+gbDLxhJDgHO2naCSzHp28llHrG6JmtuqCa7xukF3z/O5LJ2FPGSrKPkU04Y8JJtqPHa77BUUryhmj3jlqSc8EpMVlJZtJyBBpydmOO6gsJ/pFcymC6JqewGWPDRbI9FnwqRkq/SX4lscGkJ5l1g0EY3NAnEkpJNkf9JGGXiz0XnBwkmJLNRqQjg5dqm7Qk0mATNdYun484TC7+ehhHV9rjhlLwS0mmjKdLh8UuTTyUksxmti8oVXysSIMBvAE83FNKMkHlHJqeO4FA+4GWyK3BnWjrB+7zpTS/YBHUX6RXafAXv1gHDTZEOV/5LYnx5djoN8l+w9dvkkt+FOE4wEP9gf+ytEsvlJIMo9L+GPKH3N3HEBKzQ9pvLvZOxl7CJi075HQ8J6VZJl+WdhCJA6cKD3GgrRTcUvD7TbKPt/ev9Jxx4UY5daWZSBzzfZB/26kA11RrVcdVH0tI1HhM1seQrrR9NPng/CvhiHNIwifO0r6BtZovXH7NBSaNf86ItONle5NUxC5ntxfJxGRZnOmXe9HuCZwbhyW8PXbmm65wFsVH/iMDn0swJireU76hUqlUKpVKpVKpVCr/G24Brw5IRx93R3MAAAAASUVORK5CYII=>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAAAZCAYAAAD9ovZ9AAAFZklEQVR4Xu2ZW6hVVRSGR1iQdKMLWWR4ChNKIcEKCgOJlMAuDyVB9VREPogvQWGE2EMPXR60wocI4jxIF4WCCCIiNhURCflSFF1ApRKKCqOCrjY+xxruscaea7f3OcdzgjM/+Nl7jbX2XPMy5phjzi1SqVQqlUqlMpwTVI+onlVtUJ3Svl1ku+qrbFQWqK4XK4syKbvEKtXjYs8sS/dmk3Wqp1QPqC5N94D7tyTbGaqVyQani7V7p3T3Ic/cI/Ycn/8bqNDb4XqX6ojq1mDLnCv2zIFkp4OeUy0Mtp/E3uGc1FzH8vmOjXuzxYTqM9WJzfXZqg9VH4u1z8FJaGvUvnDfoZ1vhWu+Y4tcpbpd+pODSfOnDO/rWeNX1d3h+kLVF6qvVRcFu0MjiAYlR8DDL0i2Tarfw/UNqn+k7Sx8/1u1NtiON/eJtWFjsD3U2O4MtgdVfzT2H1XrxQYwQv1pE21zcjtPVr0igxHyDdUHyTYnuJdTUYeOwEYnZN4T8+qSI0yKhdjYWMqiQ5z9Yr/NYPskGwvcK4OdGdmhOjUbC1yh+l51U7A9KlYPnMShD2jXMHiGZXJRsJ0v1j9ell8TFSJ7ZLR2H3e+Uf2WbF2OwAC8LBbCS47gHRk77h1pezwRqMsRfs7GAp+r7s/GBtb47IijgvP0ZDASjuII3O9J2wHPVO0VWyrjNdElRmD6Y1u4xmEWSz+yrlDdJrO7bB4Fr/5UBtdK1v9euC45AvhAo7/EGhXxe5kuewlmcx7wLxvbuJAbrBEboMMy6EQ+28kVGBDeQxsddyAUHaFk9wmEiJK8My6R3N8stkzyzNbGTp2wIQeH8cjMZINLmus3xcYuL2FjQcMpbHWyb1G9Fq67HOEa1S/Sb/Ad0q5Q14B32bv4TvoDP51I8KLqoFge82S6B/RHTPqWiy0pHuJLAz7M7nmI67JwD3wJeUza7SGy8Dzvj+AcXj8m8VT7ocUSMW8nIYoQDWJSBSVHYL317J9IQOacBzhfO132YRAZmFk46Uxwl1gd+BwG0YF+YgvcNeDZzu7kGenvEEiMcSjex6fjjpCXZV9a6NO4NWVssB0Si+TTxgu8MtnxLrwshjDIjkAoYjkh1DpEAs+4KR+6BhxbTCpHYaYdgchCPf6rQz1q4vgMCv3Wk7IjvC6WiDPwzN44WzlTyP3R5QheXk5KgehEGSTS04aZHA+IeLGrJ/0Kl0Slb26+Z9hG0QF+WDPdZNHBCVgeCJWs2+OGQzr8xoItOySO/FG4hugIMKl6V3XasSdEzhHbDRDS4Xlp5xbO02Jl+a5tKo6wRKyMGFnGxmf8eclOGIpbqwwvjhHBdxoZQuIesY6BF6T8HDY6axRmIll0Jya8O5c3th+CLXcw79wl7d3F1WKh+WJ/SKwsHNvLpw9iuQ6/4bdOlyOQs3H4tCnZaTMOhzOwoyI6jjspjsKahacSEaJiI0pkR/AkypcAZ6nqW+lXLh+0AN4+6oESR7v7ZbCxRJxxIgMJFm2I9fWohrM6LHfxkIzZyNLBoZq/q3Sg5GV5O8mxuM71Ix9hgJ2uZJFtO7+POzmgHdc23335mdJJpc+MrJ601zwnP4fcez0nQDiTJzc52tD5/G53IzoxJkDDmKkDJQboCbFzlEmxrSN1ynUl6X1f9arqJbFnGJTMerEJxa4AMSmuaz0hcpbY7/2dfD4s7TMCdwTqhkOyo2EXxjupi5PHCiizNC5zAoPsu4ccviPLxP5w4nCIY+25ghm5U6weE+1bx8DB+YOMNg2rK85MWewqug6AJsROG3mutDvJS8OKRpV5RnaEyjyF8E8iyvJSmaeQQ3CMHVWpVCqVSqUyJ/wLxR2IH1TAt0QAAAAASUVORK5CYII=>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAZCAYAAAB9/QMrAAAC9klEQVR4Xu2XT6hNURTGP0n5Lz2RMqEMSBn4lzKSQmLyBhQzAwZv5BWRwTMwM5JHycTUwERmYpeJMFIyoZAyMBBlwADra+113r7LXvc49zGQ86uv7l573b3v+s6+e+8D9PT0/GeMiVYHasPnl1pc5BlzRQt9UFgkmuODNSZF10UHRctcn7EUmnMVOnAN/pA90DyO2UYS/WjRtGhtzi/xeV53RRubbDXvTSUvoW5qw1nRs6J9DPrFk0WMfBTdK9r8zFgJzWVse27z6XwXnW4yYhJ0Xhbh2Qsd95JonusjVqznMGbmL1fKFtEX/IY5xnPoBCtze43oneiJaHmOLYBOti+3CT8zxj5jQnQFgz/ohehD0Y5IiE0i49B+PkRPZNIKaH00eFMR72zSNegElrxO9B46OCchZ0SvRKtym9jSPZHbNvH+JkO5CR1/vot7EoabRCIzojhrStA+1mB0NslzCDroVBFjoQmDA3KVcbXdyG3uZfwef0DJxRwvDa6R0G7SZ2iO3zMjk5aIHkL7WJcxsknrRUegA94q4vY0qHJAH+eTqpkUxT0J7SbxoTDHr9bIpDvQ+FYXH9mkt1lPRQeKuDcjikdmRHFPQrtJCZrDVVtiJvFENd3PsdtFnjGyScaY6HEWP3szDB+PzIjinoR2k+z43uzi0UqKmLVJ5DJ00gnofYjHfULdJN5FuCmfQt0MM2mDi3sS2k2yPclOXeOvm7Qrq8QKowGEGzc3QG6Ehh2vfuPe1mQoZvif2LgjM6J4RCeTmFCbgIUzxgLJTui1gNcDg0ueT9ZWDk+cR6KjTYbCVejHr5Ew3KRxaL+/5JJaDcPoZBIvfRz8WxGzv9FXqDmkdpm0q0LbZfI1Zn+Z5FwsagrdbtwRnUwi/Hu8hJ4GPBU42Sf8+sLHE48Dn8ti4bsHMhQe0zSdl8wHovOoF2YkzBQZaRL63ujxeW1mjfzuRvhSegFqEldLdDvmJs6XW/4No8I51g7oWMddX09PT09PT0/Pv8BPeooPRW2z3E8AAAAASUVORK5CYII=>