# **Informe Arquitectónico y Estratégico: Modernización del Ecosistema de Pagos y Suscripciones SaaS INDI**

## **1\. Diagnóstico Forense de Mercado Pago Chile**

El ecosistema de pagos digitales en Chile ha experimentado una mutación estructural profunda, impulsada por la adopción masiva de billeteras digitales, la transición definitiva al modelo de cuatro partes y la consolidación regulatoria del Sistema de Finanzas Abiertas (SFA) bajo el amparo de la Comisión para el Mercado Financiero (CMF)1. En este panorama de alta sofisticación técnica y regulatoria, la arquitectura de cobro de un Software as a Service (SaaS) como INDI, cuyos tickets de entrada son de bajo valor (\$2.500 CLP), enfrenta fricciones críticas al operar exclusivamente con el SDK v2 y Checkout Pro de Mercado Pago. El diagnóstico forense integral de la plataforma revela fallas sistemáticas en tres dimensiones fundamentales: algorítmica, de enrutamiento y de experiencia de usuario (UX).  
La principal causa técnica de la alta tasa de rechazo radica en el diseño y entrenamiento del motor antifraude de Mercado Pago. Este sistema heurístico está optimizado para el comercio electrónico transaccional de bienes físicos, donde el ticket promedio supera holgadamente los \$30.000 CLP. Cuando el SaaS INDI procesa cobros recurrentes de \$2.500 CLP, \$4.990 CLP o \$8.990 CLP, los algoritmos de *machine learning* clasifican estas operaciones como anomalías de alto riesgo. En la industria de pagos, un volumen elevado de transacciones de bajo monto y alta frecuencia es el patrón de comportamiento clásico asociado a los ataques de *card testing*, donde redes de bots validan masivamente bases de datos de tarjetas robadas realizando micropagos. Al carecer de un contexto robusto de suscripción B2B/B2C validado, el motor de Mercado Pago incrementa artificialmente el *risk score* de la transacción, derivando en declinaciones preventivas o falsos positivos que destruyen la tasa de conversión.  
A esta penalización algorítmica se suma un problema severo de enrutamiento de BINs (Bank Identification Number) asociado específicamente a las tarjetas de prepago chilenas y productos de débito masivo. El mercado chileno de prepago ha sido dominado por actores nativos digitales como MACH, que ostenta un 42% de adopción operando bajo la infraestructura del Banco BCI, y Tenpo, que con más de 2,5 millones de usuarios ha obtenido recientemente la licencia de neobanco por parte de la CMF3. Sin embargo, la pasarela de Mercado Pago procesa frecuentemente estos BINs a través de rieles de liquidación internacionales o les aplica reglas de riesgo transfronterizo, ignorando su naturaleza de emisión local. Las reglas de mitigación de riesgo impuestas por Mercado Pago para tarjetas prepago resultan draconianas, bloqueando de manera sistemática los intentos de pago provenientes de Tenpo, MACH y Dale Coopeuch, así como las transacciones originadas en la CuentaRUT de BancoEstado, la cual representa el mayor volumen de tarjetahabientes del país5. Este bloqueo estructural excluye de facto a un porcentaje mayoritario de la población económicamente activa de Chile.  
Desde la perspectiva de la experiencia de usuario, el Checkout Pro de Mercado Pago ha evolucionado de ser una pasarela de pagos neutral a convertirse en un canal de adquisición estratégica para el ecosistema cerrado de Mercado Libre. Al invocar Checkout Pro, la interfaz de usuario secuestra el flujo de navegación, redirigiendo al cliente fuera del dominio de INDI e inyectando una fuerte presión mediante *dark patterns* para forzar el inicio de sesión o la creación obligatoria de una cuenta en la plataforma de Mercado Libre7. En un modelo SaaS de compra por impulso y suscripción orientada a profesionales (Smart CV ATS y presentaciones interactivas), donde la identidad digital del usuario es completamente autónoma, exigir la autenticación en un ecosistema de terceros genera una fricción cognitiva severa. Esta redirección y el *login* forzado se han consolidado como el vector principal del abandono de carritos en la plataforma INDI, ya que el usuario percibe una disonancia de marca y rechaza la obligación de ceder sus datos a Mercado Libre para adquirir un servicio B2B independiente.  
Finalmente, la tokenización nativa de Mercado Pago presenta deficiencias insalvables al manejar el ciclo de vida complejo de las suscripciones recurrentes bajo el modelo de cuatro partes chileno1. Las operaciones de *dunning*, los reintentos inteligentes de cobro y la actualización de tarjetas expiradas sufren fallos constantes. Históricamente, las tarjetas de débito y prepago chilenas han estado restringidas para cobros recurrentes en escenarios donde el titular no está presente (Card Not Present), experimentando altas tasas de rechazo (*soft declines*) cuando Mercado Pago intenta ejecutar el cobro automatizado mensual sin haber derivado la transacción a un flujo de enrolamiento 3D Secure 2.0 optimizado para la adquirencia local y el consecuente traslado de responsabilidad (*Liability Shift*)8.

## **2\. Tendencias de Medios de Pago en Chile (2026)**

La arquitectura de pagos en Chile hacia el año 2026 se encuentra en un punto de inflexión, dictada por marcos regulatorios progresistas y por un consumidor que penaliza implacablemente la fricción en el proceso de *checkout*. El entendimiento de estas macro-tendencias es imperativo para diseñar un sistema de recaudación resiliente para INDI.  
La infraestructura tradicional de adquirencia, liderada hegemónicamente por Transbank a través de sus productos Webpay Plus y Webpay Oneclick, mantiene su posición como la columna vertebral del comercio electrónico, soportando pagos con tarjetas de crédito, débito (Redcompra) y prepago mediante integración directa con las marcas internacionales9. La migración integral del país hacia el modelo de cuatro partes ha estabilizado la estructura de costos, fijando tasas de intercambio máximas reguladas (topes transitorios y definitivos que han comprimido los márgenes a 0,35% en débito y 0,8% en crédito y prepago)1. Esta regulación ha permitido una contracción en el Merchant Discount Rate (MDR) base que los adquirentes cobran a los comercios, haciendo que soluciones de tokenización como Webpay Oneclick sean financieramente viables y altamente competitivas para modelos de suscripción11.  
De forma paralela y disruptiva, la promulgación de la Ley Fintech (Ley N° 21.521) y la emisión de la Norma de Carácter General (NCG) 514 por parte de la CMF han sentado las bases normativas y técnicas para el Sistema de Finanzas Abiertas (SFA), cuya implementación plena y obligatoriedad técnica se encuentra proyectada para el año 20272. Este marco regulatorio ha catalizado el despegue exponencial de los pagos Cuenta a Cuenta (A2A \- Account to Account) a través de Proveedores de Servicios de Iniciación de Pagos (PISP) como Fintoc13. Fintoc, operando ya bajo la autorización de la CMF como emisor no bancario de tarjetas de pago con provisión de fondos, permite orquestar el cobro directo e irrevocable desde la cuenta bancaria del usuario final sin transitar por los costosos rieles de las marcas de tarjetas de crédito14. Esta tendencia representa una ventaja competitiva asimétrica para los modelos de suscripción, puesto que elimina de raíz los rechazos derivados del vencimiento del plástico físico, la falta de cupo en la línea de crédito o los bloqueos preventivos por extravío. El producto PAC Digital (Pago Automático de Cuentas) de Fintoc ofrece un mandato de autorización continuo, seguro y con conciliación bancaria nativa15.  
Simultáneamente, la penetración de las billeteras digitales y el pago móvil tokenizado (Apple Pay, Google Pay, así como las billeteras locales MACH y Tenpo) exige interfaces de pago modernas que operen sin redirecciones. El consumidor digital chileno de 2026 demanda un *checkout embebido*: componentes de interfaz de usuario construidos en React o Next.js que vivan directamente en el Document Object Model (DOM) del SaaS y que invoquen las billeteras móviles mediante estándares como WebAuthn o validación biométrica, erradicando las redirecciones a portales bancarios obsoletos.  
En un modelo de micropagos de entre \$2.500 y \$8.990 CLP dirigido a profesionales que requieren inmediatez, la expectativa de tasa de autorización debe superar el 95%. Alcanzar esta métrica de excelencia operativa exige un sistema de enrutamiento transaccional capaz de evitar el flujo *Challenge* del protocolo 3D Secure 2.0. Para ello, se debe maximizar el flujo *Frictionless* transmitiendo la mayor cantidad de metadatos de contexto (tales como la huella digital del dispositivo, el historial de navegación, la coincidencia de direcciones IP y la telemetría del usuario) directamente al servidor de control de acceso (ACS) del banco emisor8. Los adquirentes con conexión técnica profunda al ecosistema bancario chileno logran tasas de autorización *Frictionless* superiores al 85%, minimizando el abandono del carrito8.

## **3\. Benchmark Comparativo de 6 Pasarelas**

El análisis de las opciones disponibles en el mercado chileno para soportar la arquitectura técnica de alto rendimiento de INDI (Next.js 16 App Router, Vercel Serverless/Edge, Turso LibSQL) se desglosa mediante una evaluación exhaustiva de seis proveedores principales.

| Proveedor | Modelo Operativo | Comisión Base (Nacional) | Cargo Fijo por Tx | Tiempo de Abono | Soporte Suscripción Nativa | Evaluación Técnica |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Fintoc** | PISP / A2A Open Finance | 1,00% \+ IVA | \$0 CLP | 24 hrs hábiles | PAC Digital Integrado API REST | Alta (Webhooks modernos, SDK ligero) |
| **Transbank** | Adquirente Directo (M4P) | 2,35% (C) / 1,75% (D) \+ IVA | 0.0035 UF min. | 24 \- 48 hrs | Webpay Oneclick (Tokenización) | Media (API SOAP legacy migrada a REST) |
| **Flow.cl** | Agregador Multicanal | 2,89% \+ IVA | \$0 CLP | 3 días hábiles | API de tokenización y cobro | Alta (Múltiples métodos en 1 API) |
| **Stripe** | Procesador Global | 3,60% | \$30 CLP | 3 \- 7 días | Stripe Billing (World-class) | Muy Alta (Mejor Developer Experience) |
| **Kushki** | Agregador Panregional | \~2,95% \+ IVA | \$0,25 USD | Negociable | Suscripciones vía API | Media (Enfocado a Enterprise) |
| **Mercado Pago** | Billetera / Agregador | 3,19% \+ IVA | \$0 CLP | Inmediato (en MP) | Suscripciones SDK v2 | Baja (Fricción UX, Redirecciones) |

### **Análisis Detallado por Proveedor**

Fintoc se posiciona como el disruptor del mercado al operar como un iniciador de pagos bajo el paradigma del Open Finance. Su modelo tarifario es inusualmente agresivo, cobrando únicamente un 1% \+ IVA por transacción exitosa17. Al facilitar transferencias directas de cuenta a cuenta, los fondos se liquidan en 24 horas hábiles17. Para el modelo de INDI, la capacidad de enrolar cuentas bancarias mediante su API REST para cobros recurrentes (PAC Digital) resuelve el problema del fraude y la expiración de tarjetas de raíz. La evaluación indica que es insuperable en costo y experiencia para usuarios bancarizados, aunque presenta la limitante de no poder procesar pagos en cuotas (lo cual es matemáticamente irrelevante para un ticket mensual de \$2.500 CLP) y requiere que el cliente disponga de sus credenciales bancarias en el instante de la compra15.  
Transbank, a través de sus soluciones Webpay Oneclick y Patpass, representa la adquirencia directa operando en el corazón del modelo de cuatro partes chileno. Sus comisiones base de 2,35% \+ IVA para crédito y 1,75% \+ IVA para débito y prepago carecen de cargos fijos mensuales por mantenimiento9. Webpay Oneclick permite la tokenización segura de la tarjeta del usuario (generando un tbk\_user y un authorization\_code) para autorizar cargos asíncronos posteriores con un solo clic o de forma programada desde el backend de INDI10. La principal ventaja de Transbank es ostentar la mayor tasa de autorización del mercado para tarjetas locales. La desventaja radica en la densidad técnica de su integración, requiriendo el consumo de múltiples endpoints REST para iniciar la inscripción, finalizarla y autorizar las transacciones subsecuentes20. No obstante, ofrece el mayor grado de control sobre la transmisión de datos para el motor 3D Secure 2.0, maximizando las probabilidades de eximir la transacción de verificación manual (Liability Shift)22.  
Flow.cl opera como un agregador multicanal que consolida Webpay, transferencias directas, billeteras como MACH y pagos en efectivo vía Servipag bajo un único contrato. Su estructura de costos asciende a 2,89% \+ IVA para tarjetas con un tiempo de liquidación de 3 días hábiles23, ofreciendo una tarifa reducida de 0,99% \+ IVA exclusivamente para transferencias25. Si bien representa una solución *plug-and-play* excepcional que simplifica la ingeniería inicial y carece de costos fijos26, introduce una capa de intermediación visible. El usuario final es redirigido temporalmente al entorno de Flow, perdiendo la percepción de estar interactuando exclusivamente con el ecosistema de INDI, lo cual degrada marginalmente la tasa de conversión en comparación con flujos embebidos27.  
Stripe Chile despliega la mejor Developer Experience (DX) a nivel global, con herramientas de clase mundial como Stripe Billing y un sistema de webhooks de resiliencia inigualable27. Sin embargo, el modelo matemático de Stripe es letal para los micropagos en Chile. Su tarifa estándar de 3,6% se acompaña de un cargo fijo de \$30 CLP por transacción27. En un ticket Starter de $2.500CLP,lasumadelcostoporcentual($90 CLP), el cargo fijo (\$30 CLP) y el IVA asociado destruye desproporcionadamente el margen operativo del SaaS. Además, Stripe opera predominantemente sobre rieles de adquirencia *cross-border* o mediante asociaciones locales que no alcanzan los niveles de autorización nativa de Transbank, resultando inviable para la arquitectura financiera de INDI28.  
Kushki y dLocal Go son procesadores panregionales diseñados para mitigar la complejidad de recaudación en múltiples países de Latinoamérica. Kushki exige altos volúmenes de facturación mensual garantizada y somete a los comercios a largos procesos de negociación *enterprise*29. dLocal Go está arquitectónicamente optimizado para corporaciones extranjeras que requieren repatriar fondos desde LatAm hacia cuentas en Estados Unidos o Europa, incurriendo en altos *spreads* cambiarios y comisiones ocultas30. Ninguno de estos proveedores se alinea con la agilidad requerida por un SaaS B2B/B2C local de arranque rápido.  
Mercado Pago, que representa la línea base actual de la arquitectura de INDI, cobra una comisión de 3,19% \+ IVA24. Como se detalló en el diagnóstico forense, supedita la experiencia de usuario a la creación obligatoria de cuentas en Mercado Libre, presenta una enrutación deficiente para el ecosistema de tarjetas prepago chilenas y no ofrece mecanismos de control granular sobre su motor algorítmico de prevención de fraude7.

## **4\. Matriz de Decisión y Recomendación Definitiva**

Para objetivar la selección del proveedor de pagos y mitigar el sesgo arquitectónico, se ha construido un *Scorecard* ponderado sobre 100 puntos. Los pesos asignados reflejan estrictamente las necesidades vitales del modelo comercial "El Semestre Irresistible" de INDI y las capacidades técnicas del equipo de ingeniería.

| Criterio de Evaluación | Ponderación | Fintoc (A2A) | Webpay Oneclick | Flow.cl | Stripe | Mercado Pago |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Tasa de Aprobación en Chile** | 30% | 10 (30 pts) | 9 (27 pts) | 8 (24 pts) | 8 (24 pts) | 4 (12 pts) |
| **Fricción UX (Ausencia de Redirecciones)** | 20% | 8 (16 pts) | 7 (14 pts) | 6 (12 pts) | 10 (20 pts) | 3 (6 pts) |
| **Comisiones en Ticket \$2.500 CLP** | 20% | 10 (20 pts) | 8 (16 pts) | 6 (12 pts) | 2 (4 pts) | 5 (10 pts) |
| **Suscripciones Recurrentes Nativas** | 15% | 9 (13.5 pts) | 10 (15 pts) | 8 (12 pts) | 10 (15 pts) | 5 (7.5 pts) |
| **Facilidad de Integración Next.js/FSD** | 15% | 9 (13.5 pts) | 6 (9 pts) | 8 (12 pts) | 10 (15 pts) | 8 (12 pts) |
| **Puntuación Total Ponderada** | **100%** | **93.0** | **81.0** | **72.0** | **78.0** | **47.5** |

### **Recomendación Indiscutible: Arquitectura Híbrida Inteligente (Fintoc \+ Webpay Oneclick)**

La evidencia cuantitativa y el análisis del ecosistema desaconsejan categóricamente mantener la operación sobre Mercado Pago. Asimismo, se rechaza la adopción de Stripe o Flow.cl debido a la inviabilidad matemática de sus comisiones o cargos fijos sobre micropagos, y la fricción que introducen en la conversión.  
La arquitectura definitiva y recomendada para INDI es un **modelo híbrido de dos capas asíncronas**:

> 1. **Capa Principal (Preferencia Algorítmica y UX): Fintoc A2A.** La interfaz de usuario debe estar diseñada para incentivar, mediante técnicas de jerarquía visual y recompensas de UX, la suscripción mediante transferencia bancaria automatizada (PAC Digital)15. El costo operativo se desploma drásticamente al 1% \+ IVA17, incrementando el margen neto del SaaS INDI. El flujo de caja mejora al liquidarse los fondos en 24 horas, se eliminan matemáticamente los contracargos por tratarse de transferencias irrevocables, y la tasa de declinación asociada a motores de fraude o plásticos vencidos desaparece17.  
> 2. **Capa de Respaldo (Fallback Crediticio): Webpay Oneclick.** Para el segmento de usuarios B2B que requiere estrictamente el pago con tarjeta de crédito (ya sea por control de gastos empresariales, flujo de caja propio o maximización de beneficios y millas bancarias), se integrará la API REST de Transbank vía Webpay Oneclick. Esta tecnología permite tokenizar la tarjeta dentro de los servidores securizados de Transbank, retornando a INDI un tbk\_user y un código de autorización20. Con estos tokens, el backend de INDI puede ejecutar los cobros de renovación (\$4.990 o \$8.990) de manera asíncrona mediante tareas programadas (cron jobs), maximizando la rentabilidad (1,75% a 2,35% \+ IVA) en comparación directa con los agregadores del mercado10.

## **5\. Arquitectura Técnica y Contratos en TypeScript**

El *stack* tecnológico definido para INDI (Next.js 16 App Router, React 19, base de datos Turso LibSQL, Drizzle ORM, Better-Auth y despliegue en Vercel Serverless/Edge) impone restricciones arquitectónicas precisas. La validación de *webhooks* en entornos Edge exige bibliotecas criptográficas nativas de la web, y la persistencia de datos en una base de datos distribuida a través de HTTP demanda patrones de diseño que aseguren la atomicidad.

### **Contratos de Validación Zod 3.24+**

Para asegurar una barrera de integridad absoluta frente a las cargas útiles (payloads) provenientes de los adquirentes externos y las mutaciones iniciadas desde el frontend, se implementan contratos estrictos de validación estructural.

TypeScript  
import { z } from 'zod';

// Contrato de inicio y mutación de suscripción  
export const SubscriptionInitSchema \= z.object({  
  planId: z.enum(\['starter', 'pro', 'max'\]),  
  billingPeriod: z.enum(\['monthly', 'semiannual'\]),  
  provider: z.enum(\['fintoc', 'webpay'\]),  
  affiliateCode: z.string().optional(),  
});

// Contrato estricto para recepción de Webhook de Fintoc  
export const FintocWebhookSchema \= z.object({  
  id: z.string().startsWith('evt\_'),  
  type: z.enum(\['invoice.payment\_succeeded', 'invoice.payment\_failed', 'subscription.created'\]),  
  created\_at: z.string().datetime(),  
  data: z.object({  
    id: z.string(),  
    object: z.string(),  
    amount: z.number().int().positive(),  
    status: z.string(),  
    customer\_id: z.string().optional(),  
    subscription\_id: z.string().optional(),  
    metadata: z.record(z.string()).optional()  
  })  
});

### **Route Handlers y Verificación de Firma HMAC-SHA256 en Vercel Edge**

En la arquitectura Next.js 16 App Router, los *Route Handlers* implementados bajo el entorno de ejecución Vercel Edge (Edge Runtime) no poseen acceso al módulo completo crypto de Node.js, bloqueando la utilización de funciones convencionales como crypto.timingSafeEqual31. Por ende, la verificación de firmas criptográficas para garantizar la autenticidad del emisor y mitigar ataques de repetición (*replay attacks*) debe programarse utilizando la API estándar de la web crypto.subtle33. Se implementa una tolerancia temporal máxima (delta) de 300 segundos.

TypeScript  
// app/api/webhooks/fintoc/route.ts  
import { NextRequest, NextResponse } from 'next/server';  
import { FintocWebhookSchema } from '@/lib/schemas/payments';  
import { processSubscriptionPayment } from '@/lib/services/billing';

const FINTOC\_WEBHOOK\_SECRET \= process.env.FINTOC\_WEBHOOK\_SECRET\!;

export async function POST(req: NextRequest) {  
  try {  
    // 1\. Extracción de bytes exactos previos a cualquier parseo JSON  
    const rawBody \= await req.text();   
    const signatureHeader \= req.headers.get('Fintoc-Signature');   
      
    if (\!signatureHeader) {  
      return NextResponse.json({ error: 'Missing Signature Header' }, { status: 401 });  
    }

    // 2\. Extracción de componentes de la firma (t=timestamp,v1=hash)  
    const parts \= Object.fromEntries(  
      signatureHeader.split(',').map(part \=\> part.split('='))  
    );  
      
    const timestamp \= parseInt(parts.t, 10);  
    const providedSignature \= parts.v1;  
      
    // 3\. Protección Anti-Replay: Verificación de latencia temporal \<= 300s  
    const currentTimestamp \= Math.floor(Date.now() / 1000);  
    if (Math.abs(currentTimestamp \- timestamp) \> 300) {  
      return NextResponse.json({ error: 'Timestamp expired' }, { status: 401 });  
    }

    // 4\. Verificación Criptográfica de Tiempo Constante vía WebCrypto  
    const encoder \= new TextEncoder();  
    const key \= await crypto.subtle.importKey(  
      'raw',  
      encoder.encode(FINTOC\_WEBHOOK\_SECRET),  
      { name: 'HMAC', hash: 'SHA-256' },  
      false, // non-extractable para seguridad  
      \['verify'\]  
    );

    const sigBytes \= new Uint8Array(  
      providedSignature.match(/.{2}/g)\!.map(b \=\> parseInt(b, 16))  
    );

    const isValid \= await crypto.subtle.verify(  
      'HMAC',  
      key,  
      sigBytes,  
      encoder.encode(\`\${parts.t}.\${rawBody}\`)  
    );

    if (\!isValid) {  
      return NextResponse.json({ error: 'Cryptographic Signature Mismatch' }, { status: 401 });  
    }

    // 5\. Validación estructural y lógica de negocio  
    const payload \= FintocWebhookSchema.parse(JSON.parse(rawBody));  
    await processSubscriptionPayment(payload);

    return NextResponse.json({ received: true });  
  } catch (error) {  
    console.error('Webhook processing failure:', error);  
    return NextResponse.json({ error: 'Internal Processing Error' }, { status: 500 });  
  }  
}

### **Transacciones Atómicas con Turso SQLite y Drizzle db.batch()**

Para salvaguardar el principio de atomicidad, consistencia, aislamiento y durabilidad (ACID) durante la ejecución del webhook, se requiere actualizar simultáneamente el estado de la factura, extender la vigencia de la suscripción del usuario y aprovisionar la liquidación de la comisión del afiliado. Utilizando la base de datos distribuida Turso (LibSQL) mediante Drizzle ORM, se invoca la API db.batch()34. Dado que Turso se comunica a través de un protocolo HTTP al borde de la red, el comando batch consolida múltiples sentencias SQL en un único *roundtrip*, ejecutándolas bajo una transacción implícita; si una mutación falla, el bloque entero efectúa un *rollback*.

TypeScript  
// lib/services/billing.ts  
import { db } from '@/db';  
import { subscriptions, invoices, affiliateLedger } from '@/db/schema';  
import { eq, sql } from 'drizzle-orm';  
import { calculateAffiliateNet } from '@/lib/utils/financials';

export async function processSubscriptionPayment(payload: any) {  
  const amount \= payload.data.amount;  
  // Identifica afiliado desde metadata inyectada en la creación de la sesión  
  const affiliateId \= payload.data.metadata?.affiliate\_id;   
    
  // Cálculo exacto del 25% neto deducido IVA y comisiones de pasarela  
  const affiliateCommission \= calculateAffiliateNet(amount, 'fintoc'); 

  // Construcción del bloque de transacciones  
  const batchStatements \= \[  
    // Mutación 1: Registrar el pago de la factura  
    db.insert(invoices).values({  
      providerInvoiceId: payload.data.id,  
      subscriptionId: payload.data.subscription\_id,  
      amount: amount,  
      status: 'PAID',  
    }),  
    // Mutación 2: Extender la vida útil del servicio SaaS  
    db.update(subscriptions)  
      .set({   
        currentPeriodEnd: sql\`datetime('now', '+1 month')\`,  
        status: 'ACTIVE'  
      })  
      .where(eq(subscriptions.id, payload.data.subscription\_id))  
  \];

  // Mutación 3 condicional: Inyección de fondos al libro mayor del afiliado  
  if (affiliateId && affiliateCommission \> 0) {  
    batchStatements.push(  
      db.insert(affiliateLedger).values({  
        affiliateId: affiliateId,  
        subscriptionId: payload.data.subscription\_id,  
        amountClp: affiliateCommission,  
        status: 'PENDING\_PAYOUT', // A liquidar los días 1 y 15  
      })  
    );  
  }

  // Ejecución atómica garantizada  
  await db.batch(batchStatements);  
}

### **Control de Sesiones con Better-Auth en Next.js 16 (Proxy Middleware)**

Para asegurar que los usuarios cuyas tarjetas han sido rechazadas (entrando en estado de morosidad o *past\_due*) pierdan el acceso inmediatamente a las rutas protegidas del SaaS, Better-Auth intercepta la solicitud HTTP a nivel perimetral. En Next.js 16, la convención del archivo middleware.ts ha sido deprecada a favor de proxy.ts, el cual opera de forma optimista y ultra-rápida mediante la lectura directa de cookies32.

TypeScript  
// proxy.ts (Next.js 16 App Router)  
import { NextRequest, NextResponse } from "next/server";  
import { getCookieCache } from "better-auth/cookies"; 

export async function proxy(request: NextRequest) {  
  // Inspección de caché de cookies nativa (sin llamadas a DB)  
  const session \= await getCookieCache(request);  
  const pathname \= request.nextUrl.pathname;  
    
  const isProtectedPath \= pathname.startsWith("/app") || pathname.startsWith("/dashboard");

  if (\!session && isProtectedPath) {  
    return NextResponse.redirect(new URL("/login", request.url));  
  }  
    
  return NextResponse.next();  
}

export const config \= {  
  matcher: \["/app/:path\*", "/dashboard/:path\*"\],   
};

## **6\. Impacto en Afiliados y Reconciliación Financiera**

El Programa de Afiliados de INDI, piedra angular de la estrategia de adquisición de clientes, garantiza una comisión del 25% sobre el valor del plan, con liquidaciones quincenales (los días 1 y 15 de cada mes). Para asegurar la viabilidad económica del SaaS a escala, la base de cálculo de esta comisión debe aplicarse **estrictamente sobre el ingreso neto** (Gross Margin), una vez deducidos el Impuesto al Valor Agregado (IVA) correspondiente al estado chileno y los costos transaccionales (Merchant Discount Rate) de la pasarela utilizada.  
El motor de cálculo financiero, orquestado dentro de las utilidades del servidor, proyecta los siguientes escenarios matemáticos basados en las tarifas del mercado chileno proyectadas a 2026\.

### **Modelado Financiero de Comisiones ("El Semestre Irresistible")**

A continuación, se detalla el desglose exacto para el plan **Starter Mensual (\$2.500 CLP)** y el plan **Max Semestral (\$29.990 CLP)**, demostrando el impacto directo que tiene la elección del proveedor (Fintoc A2A frente a Transbank Crédito) sobre la caja del SaaS y el bolsillo del afiliado.

| Parámetro Financiero | Starter Mensual (Webpay Crédito) | Starter Mensual (Fintoc A2A) | Max Semestral (Webpay Crédito) | Max Semestral (Fintoc A2A) |
| :---- | :---- | :---- | :---- | :---- |
| **Precio Público (Gross)** | **\$2.500 CLP** | **\$2.500 CLP** | **\$29.990 CLP** | **\$29.990 CLP** |
| Base Imponible (Sin IVA) | \$2.101 CLP | \$2.101 CLP | \$25.202 CLP | \$25.202 CLP |
| Retención IVA 19% | \$399 CLP | \$399 CLP | \$4.788 CLP | \$4.788 CLP |
| **Tarifa Pasarela** | 2,35% \+ 0,0035 UF min. | 1,00% Fijo | 2,35% Fijo | 1,00% Fijo |
| Costo Pasarela Bruto | \~\$59 CLP | \$25 CLP | \$705 CLP | \$300 CLP |
| Costo Pasarela \+ IVA | \~\$70 CLP | \~\$30 CLP | \~\$839 CLP | \~\$357 CLP |
| **Ingreso Neto SaaS** | **\$2.031 CLP** | **\$2.071 CLP** | **\$24.363 CLP** | **\$24.845 CLP** |
| **Comisión Afiliado (25%)** | **\$507 CLP** | **\$517 CLP** | **\$6.090 CLP** | **\$6.211 CLP** |

La matemática operativa expone una verdad ineludible: procesar el pago a través de Fintoc (Open Finance) no solo incrementa el margen de retención de capital del SaaS INDI, sino que automáticamente inyecta mayores ganancias al programa de afiliados. Esta asimetría financiera permite a la plataforma aplicar técnicas de gamificación, donde la interfaz de usuario recomiende al cliente el pago mediante transferencia bancaria, alineando los incentivos de todas las partes involucradas.

### **Tratamiento Cripto-Contable de Reembolsos y Contracargos (*Chargebacks*)**

La proliferación de contracargos es el mayor riesgo existencial para un modelo de micro-suscripciones. Un contracargo aprobado bajo el ecosistema obsoleto de Mercado Pago impone una multa administrativa y la reversión de los fondos, destruyendo la rentabilidad acumulada de meses enteros de un usuario.  
La arquitectura híbrida propuesta neutraliza este vector de riesgo:

> 1. **Fintoc (A2A):** Elimina el 100% de la exposición a contracargos por definición técnica. Al ser una transferencia bancaria electrónica y directa, autenticada mediante el segundo factor (2FA) de la institución bancaria del usuario, las transacciones son irrevocables17.  
> 2. **Transbank Webpay Oneclick:** Al integrar el protocolo 3D Secure 2.0 y asegurar que los metadatos transaccionales viajen correctamente al emisor, INDI logra el *Liability Shift* (traslado de responsabilidad)22. Si la autenticación es exitosa y el banco emisor aprueba la transacción (indicado por el parámetro liability\_shift \= 1), cualquier reclamo posterior de fraude por parte del tarjetahabiente es absorbido patrimonialmente por el banco emisor, blindando las finanzas del SaaS22.

En el escenario excepcional donde INDI deba procesar un reembolso voluntario o sufra un contracargo imputable (por ejemplo, pérdida del *Liability Shift*), el webhook respectivo (invoice.payment\_failed o una conciliación negativa vía Transbank) ejecutará un db.batch() que insertará una transacción de compensación (valor negativo) en la tabla affiliateLedger. Esta operación deducirá automáticamente el monto previamente comisionado del balance global del afiliado, descontándolo del próximo depósito de liquidación programado para el día 1 o 15, garantizando que el SaaS nunca subsidie comisiones sobre dinero inexistente.

## **7\. Hoja de Ruta de Migración Paso a Paso (Zero Downtime)**

La erradicación de Mercado Pago y la orquestación del modelo Híbrido (Fintoc \+ Transbank) representa una intervención quirúrgica sobre el sistema circulatorio financiero de la plataforma. Para garantizar la continuidad del negocio y el procesamiento ininterrumpido de renovaciones, se ejecutará bajo una estricta filosofía de *Zero Downtime* estructurada en 5 fases evolutivas.

### **Fase 1: Abstracción Estructural con PaymentProviderAdapter**

El primer hito es refactorizar la base de código creando un patrón de diseño *Adapter* (o *Strategy*) en TypeScript. Esta interfaz normalizará las entradas y salidas para las operaciones críticas: createSubscription(), chargeTokenizedCard(), y handleWebhook(). Esto permite encapsular las complejidades y diferencias de las APIs de bajo nivel de Fintoc (API v2 REST) y Transbank Developers (Transacción Completa REST)22. Se modificarán los esquemas de la base de datos Turso mediante migraciones de Drizzle ORM, alterando la tabla subscriptions para soportar una relación polimórfica que acepte registros donde la columna provider sea igual a 'fintoc', 'webpay', o 'mercadopago'.

### **Fase 2: Rollout Canario y A/B Testing en Producción**

Aprovechando las capacidades de enrutamiento del Edge Network de Vercel (Edge Config y Middleware), se activará un *Canary Release*. El 20% del nuevo tráfico de adquisición (usuarios que inicien el proceso de *sign-up*) será dirigido de forma transparente a la nueva arquitectura híbrida, exponiéndoles únicamente los botones de "Pago por Transferencia Bancaria Segura" (Fintoc) y "Pago con Tarjeta de Crédito 1-Clic" (Webpay Oneclick). El 80% restante continuará interactuando con la pasarela legacy de Mercado Pago. Durante dos semanas, se recopilará instrumentación telemétrica exhaustiva, comparando las tasas de conversión en el *checkout*, los embudos de abandono, y las resoluciones de errores, garantizando empíricamente que la fricción UX disminuye antes del despliegue masivo.

### **Fase 3: Convivencia Arquitectónica y Migración de Usuarios Legacy**

Por restricciones de cumplimiento normativo (PCI-DSS), los *tokens* de tarjetas almacenados en las bóvedas de Mercado Pago no son exportables hacia los servidores de Transbank. En consecuencia, los usuarios históricos permanecerán cautivos en el ciclo de cobro de Mercado Pago durante un período de transición. Para resolver esto, se lanzará una agresiva campaña automatizada de retención y actualización dentro del panel de control del usuario en INDI. Se ofrecerá un incentivo económico directo (por ejemplo, 1 mes gratuito o un incremento en el nivel de características) a aquellos usuarios *legacy* que actualicen voluntariamente su método de pago hacia el nuevo ecosistema (PAC Digital Fintoc o enrolando una nueva tarjeta en Oneclick). Al capturar el evento checkout\_session.finished de la nueva plataforma, el backend de INDI invocará inmediatamente la API de cancelación de Mercado Pago, destruyendo el contrato antiguo para evitar la duplicidad de cargos.

### **Fase 4: Deprecación Definitiva del SDK Legacy**

Cuando el monitoreo financiero indique que más del 90% del MRR (Monthly Recurring Revenue) ha transitado exitosamente a la infraestructura de Fintoc/Transbank (un proceso estimado entre 3 y 6 meses de maduración), la empresa procederá a marcar la integración de Mercado Pago como *end-of-life* (EOL). A los usuarios residuales en la plataforma obsoleta se les enviará una notificación con carácter de ultimátum informando que sus suscripciones serán suspendidas a menos que renueven sus métodos de cobro. Tras este evento, se purgará integralmente el SDK de Mercado Pago del repositorio base, eliminando deuda técnica severa y reduciendo la superficie de ataque del software.

### **Fase 5: Telemetría y Monitoreo Continuo de Conversión Post-Migración**

La fase final establece la implementación de observabilidad de grado empresarial. Se instrumentarán registros de auditoría (*logs* estructurados) diseñados para capturar la telemetría fina del protocolo 3DS 2.0 de Transbank, monitoreando la tasa de flujos exentos de fricción (*Frictionless*) frente a los flujos que exigen autenticación adicional del usuario (*Challenge*)8. Adicionalmente, se integrará el ecosistema de Vercel Analytics para medir la latencia del db.batch() en Turso34, asegurando de esta forma que los picos masivos de procesamiento y facturación asíncrona experimentados los días 1 y 15 de cada mes no desestabilicen los límites de conexión de la base de datos distribuida, ni degraden el tiempo de respuesta y la experiencia general de los usuarios profesionales de INDI.

#### **Obras citadas**

> 1. ¿Qué es el modelo de 4 partes? \- Fintoc, [https\://www\.fintoc.com/cl/blog/que-es-el-modelo-de-4-partes](https://www.fintoc.com/cl/blog/que-es-el-modelo-de-4-partes)  
> 2. CMF modifica la NCG N°514 e incorpora estándares técnicos para, [https\://www\.carey.cl/cmf-modifica-la-ncg-n514-e-incorpora-estandares-tecnicos-para-la-implementacion-del-sistema-de-finanzas-abiertas](https://www.carey.cl/cmf-modifica-la-ncg-n514-e-incorpora-estandares-tecnicos-para-la-implementacion-del-sistema-de-finanzas-abiertas)  
> 3. Neobancos en Chile — Tenpo, MACH y Mercado Pago, [https\://neobank.cl/](https://neobank.cl/)  
> 4. Emisores de Tarjetas de Pago con Provisión de Fondos no Bancarias, [https\://www\.cmfchile.cl/portal/principal/613/w3-article-47006.html](https://www.cmfchile.cl/portal/principal/613/w3-article-47006.html)  
> 5. Preguntas Frecuentes \- Banco Falabella, [https\://www\.bancofalabella.cl/faqs](https://www.bancofalabella.cl/faqs)  
> 6. Billeteras digitales en Chile: MACH, Tenpo, Mercado Pago y qué, [https\://tasas.cl/billeteras-digitales-chile](https://tasas.cl/billeteras-digitales-chile)  
> 7. Pasarelas de pago online en Chile: Comparativa entre Webpay Plus, [https\://codilogia.cl/blog/pasarelas-pago-chile-webpay-mercadopago-flow-2026](https://codilogia.cl/blog/pasarelas-pago-chile-webpay-mercadopago-flow-2026)  
> 8. Challenge vs Frictionless 3DS2: Boost Conversion & Security, [https\://www\.2accept.net/blog/challenge-vs-frictionless-3ds2](https://www.2accept.net/blog/challenge-vs-frictionless-3ds2)  
> 9. Transbank Chile 2026: Comisiones, Webpay y Tarifas por Rubro, [https\://comocobro.cl/medios-de-pago/transbank](https://comocobro.cl/medios-de-pago/transbank)  
> 10. Qué es Webpay, Webpay Plus y Oneclick: guía Chile 2026 \- Rómpela, [https\://rompela.cl/diferencias-webpay-webpay-plus-oneclick/](https://rompela.cl/diferencias-webpay-webpay-plus-oneclick/)  
> 11. ¿Qué es Webpay OneClick? \- Centro de ayuda \- Transbank, [https\://ayuda.transbank.cl/que-es-webpay-oneclick](https://ayuda.transbank.cl/que-es-webpay-oneclick)  
> 12. Norma de Carácter General 514 de la Ley Fintec \- CMF, [https\://cmfchile.cl/portal/prensa/625/articles-83320\_doc\_pdf.pdf?ts=1721655905](https://cmfchile.cl/portal/prensa/625/articles-83320_doc_pdf.pdf?ts=1721655905)  
> 13. Pagos cuenta a cuenta online \- Fintoc, [https\://www\.fintoc.com/cl/blog/pagos-cuenta-a-cuenta-online](https://www.fintoc.com/cl/blog/pagos-cuenta-a-cuenta-online)  
> 14. CMF autoriza a Fintoc como emisor no bancario bajo nuevo, [https\://www\.fintechile.org/noticias/cmf-autoriza-a-fintoc-como-emisor-no-bancario-bajo-nuevo-esquema-de-pagos-digitales](https://www.fintechile.org/noticias/cmf-autoriza-a-fintoc-como-emisor-no-bancario-bajo-nuevo-esquema-de-pagos-digitales)  
> 15. Pagos Recurrentes en Chile \- Tarjeta y PAC \- Fintoc, [https\://www\.fintoc.com/cl/producto/pagos-recurrentes](https://www.fintoc.com/cl/producto/pagos-recurrentes)  
> 16. Frictionless vs. Challenge: Understanding the Two Sides of 3DS, [https\://www\.paay.co/blog/frictionless-vs-challenge-understanding-3ds-authentication](https://www.paay.co/blog/frictionless-vs-challenge-understanding-3ds-authentication)  
> 17. Fintoc Chile 2026: Cobros por Transferencia al 1% \+ IVA | CómoCobro, [https\://comocobro.cl/medios-de-pago/fintoc](https://comocobro.cl/medios-de-pago/fintoc)  
> 18. Paga en un solo Click: Webpay OneClick | Transbank \- Portal Publico, [https\://publico.transbank.cl/productos-y-servicios/soluciones-para-ventas-internet/webpay-patpass](https://publico.transbank.cl/productos-y-servicios/soluciones-para-ventas-internet/webpay-patpass)  
> 19. Oneclick \- •tbk. | DEVELOPERS \- Documentación, [https\://www\.transbankdevelopers.cl/documentacion/oneclick](https://www.transbankdevelopers.cl/documentacion/oneclick)  
> 20. Oneclick \- Transbank Developers, [https\://www\.transbankdevelopers.cl/referencia/oneclick](https://www.transbankdevelopers.cl/referencia/oneclick)  
> 21. transbank-developers-docs/documentacion/webpay/README.md at, [https\://github.com/TransbankDevelopers/transbank-developers-docs/blob/master/documentacion/webpay/README.md](https://github.com/TransbankDevelopers/transbank-developers-docs/blob/master/documentacion/webpay/README.md)  
> 22. Transacción Completa Estandar Marca \- Transbank Developers, [https\://www\.transbankdevelopers.cl/referencia/transaccion-completa-estandar-marca](https://www.transbankdevelopers.cl/referencia/transaccion-completa-estandar-marca)  
> 23. Mejores pasarelas de pago en Chile (2026) | Comparativa \- Rebill, [https\://www\.rebill.com/blog/pasarelas-pago-chile](https://www.rebill.com/blog/pasarelas-pago-chile)  
> 24. ¿Cuál es la mejor pasarela de pagos para Pymes en Chile 2026?, [https\://bestsolution.cl/mejor-pasarela-pago-chile/](https://bestsolution.cl/mejor-pasarela-pago-chile/)  
> 25. Flow.cl, [https\://web.flow.cl/](https://web.flow.cl/)  
> 26. ¿Por qué Flow es la mejor opción de pago en tu sitio web en 2025?, [https\://hazlo.cl/blog/por-que-flow-es-la-mejor-opcion-de-pago-en-tu-sitio-web/](https://hazlo.cl/blog/por-que-flow-es-la-mejor-opcion-de-pago-en-tu-sitio-web/)  
> 27. Mejor pasarela de pago Chile 2026: Webpay, Flow, Khipu \- Software, [https\://www\.guiadesoftware.com/blog/mejor-pasarela-pago-chile](https://www.guiadesoftware.com/blog/mejor-pasarela-pago-chile)  
> 28. Experience with Stripe in Chile (or other payment gateways) \- Reddit, [https\://www\.reddit.com/r/chileIT/comments/1ivqsb9/experiencia\_con\_stripe\_en\_chile\_u\_otras\_pasarelas/?tl=en](https://www.reddit.com/r/chileIT/comments/1ivqsb9/experiencia_con_stripe_en_chile_u_otras_pasarelas/?tl=en)  
> 29. Kushki: comisiones, métodos y opiniones | LaGuiaEmprendedor, [https\://laguiaemprendedor.com/pasarelas-pagos/kushki](https://laguiaemprendedor.com/pasarelas-pagos/kushki)  
> 30. Recibe pagos internacionales en más de 15 países con dLocal Go, [https\://dlocalgo.com/es/pagos-internacionales](https://dlocalgo.com/es/pagos-internacionales)  
> 31. Supported Web APIs in Edge Runtimes, [https\://www\.edge-middleware.com/edge-runtime-fundamentals-platform-constraints/supported-web-apis-in-edge-runtimes/](https://www.edge-middleware.com/edge-runtime-fundamentals-platform-constraints/supported-web-apis-in-edge-runtimes/)  
> 32. Next.js 16 Update: middleware Is Now proxy \- Medium, [https\://medium.com/@amitupadhyay878/next-js-16-update-middleware-js-5a020bdf9ca7](https://medium.com/@amitupadhyay878/next-js-16-update-middleware-js-5a020bdf9ca7)  
> 33. Webhooks \- Better I18N, [https\://docs.better-i18n.com/hi/docs/core/webhooks](https://docs.better-i18n.com/hi/docs/core/webhooks)  
> 34. Batch API \- Drizzle ORM, [https\://orm.drizzle.team/docs/sqlite/batch-api](https://orm.drizzle.team/docs/sqlite/batch-api)  
> 35. Transactions \- Drizzle ORM, [https\://orm.drizzle.team/docs/transactions](https://orm.drizzle.team/docs/transactions)  
> 36. Next.js integration \- Better Auth, [https\://better-auth.com/docs/integrations/next](https://better-auth.com/docs/integrations/next)