# **Arquitectura de Sistemas Distribuidos para Crecimiento Liderado por Producto y Redes de Afiliados en Entornos Serverless**

El diseño de una plataforma de Crecimiento Liderado por Producto (PLG, por sus siglas en inglés) acoplada a un sistema de afiliados de alta escala en 2026 exige una reevaluación fundamental de los paradigmas de ingeniería de software. Para el ecosistema de INDI (soyindi.cl), un entorno SaaS B2B/B2C operando en el mercado chileno bajo la divisa CLP, la convergencia de Next.js 16 (App Router), la base de datos distribuida en el borde Turso (LibSQL), el mapeador relacional de objetos Drizzle ORM, la gestión de identidades Better-Auth y la pasarela de pagos Mercado Pago SDK v2 representa una pila tecnológica de vanguardia. Sin embargo, esta combinación introduce desafíos arquitectónicos significativos que abarcan desde la degradación del seguimiento web debido a políticas de privacidad agresivas, hasta la contención transaccional en bases de datos SQLite y la sofisticación de las redes de fraude.  
Este documento presenta una investigación arquitectónica exhaustiva sobre los patrones más resilientes y eficientes de la industria para resolver la retención de la atribución, el modelado inmutable de datos financieros, la neutralización de ataques de abuso y el procesamiento seguro y concurrente de eventos de pago distribuidos.

## **Arquitectura de Atribución Robusta en Entornos Restrictivos**

El ecosistema de atribución digital ha experimentado un colapso de los métodos tradicionales de rastreo en el cliente. La dependencia histórica de parámetros de URL persistentes y cookies de terceros ha sido erradicada por los esfuerzos concertados de los proveedores de navegadores y la adopción masiva de herramientas de bloqueo de rastreo.

### **Modelos de Atribución: First-Touch versus Multi-Touch en SaaS PLG**

En el contexto de un SaaS PLG, la elección entre un modelo de atribución de Primer Toque (First-Touch) y uno de Múltiples Toques (Multi-Touch) dicta la complejidad de la arquitectura de almacenamiento y la lógica de liquidación. La atribución Multi-Touch captura cada interacción del usuario con la marca (blogs, anuncios, enlaces de afiliados) asignando un peso fraccional a cada canal en el momento de la conversión. Aunque este modelo es invaluable para la inteligencia de marketing interna, introduce una fricción extrema en los programas de afiliados, donde los creadores de contenido demandan previsibilidad y reclaman la propiedad total de la conversión si introdujeron al cliente a la plataforma.  
Por consiguiente, el patrón de la industria para sistemas de afiliados SaaS en 2026 adopta un enfoque híbrido. El sistema mantiene un registro Multi-Touch interno en el almacenamiento analítico, pero ejecuta la liquidación de comisiones basada en un modelo First-Touch modificado con una ventana temporal de atribución (por ejemplo, 60 o 90 días). Este modelo consagra al primer promotor que generó la visita inicial, almacenando su identificador de forma inmutable, independientemente de si el usuario finaliza la compra posteriormente a través de una búsqueda orgánica o un anuncio de retargeting, garantizando la confianza del afiliado.

### **Mitigación de Prevención de Rastreo (ITP) y Bloqueadores de Anuncios**

La Prevención Inteligente de Rastreo (ITP) de Safari y las políticas de Protección de Rastreo de Enlaces (LTP) han modificado la persistencia de la identidad en la web. Safari restringe la vida útil de las cookies generadas en el cliente (mediante JavaScript y document.cookie) a un máximo de 7 días, reduciéndose a 24 horas si el navegador detecta que el usuario proviene de un dominio clasificado con capacidades de rastreo cruzado, o si la URL contiene parámetros de decoración asociados a clics publicitarios1. En 2026, Apple expandió el LTP a toda la navegación estándar, eliminando proactivamente los parámetros de clic de las URL, lo que invalida las estrategias que dependen de la lectura asíncrona de la URL en el cliente4. Simultáneamente, más del 40% de las sesiones en segmentos tecnológicos emplean bloqueadores de anuncios a nivel de red o navegador, los cuales interceptan las solicitudes a dominios de análisis conocidos1.  
Para evitar la fuga de atribución, la infraestructura debe adoptar el Rastreo del Lado del Servidor (Server-Side Tracking) como estándar base. Cuando un visitante llega a soyindi.cl a través de un enlace de afiliado, el Middleware de Next.js 16 (ejecutándose en el Edge) intercepta la solicitud antes de que se renderice el cliente. Este middleware lee el parámetro del afiliado y establece una cookie de primera parte (First-Party Cookie) mediante las cabeceras de respuesta HTTP (usando Set-Cookie). Al ser generada por el servidor del mismo dominio y poseer los atributos HttpOnly y Secure, esta cookie elude las restricciones de ITP que penalizan la creación de estado en el cliente, logrando persistir durante la ventana de atribución definida1.

### **Análisis Comparativo de Mecanismos de Persistencia**

El almacenamiento del origen de la referencia debe sobrevivir a navegaciones prolongadas, cambios de contexto y actualizaciones del navegador. Diversos mecanismos presentan diferentes grados de resiliencia frente a los vectores de bloqueo modernos.

| Mecanismo de Persistencia | Resiliencia ante ITP/Ad Blockers | Persistencia Multi-Dispositivo | Riesgo de Fuga de Atribución | Aplicabilidad Arquitectónica en 2026 |
| :---- | :---- | :---- | :---- | :---- |
| **LocalStorage / SessionStorage** | Baja (Purgado tras 7 días de inactividad estricta en Safari) | Nula (Estrictamente confinado al navegador y dispositivo actual) | Crítico (Vulnerable a scripts de limpieza y bloqueadores) | Obsoleto para la memoria de atribución a largo plazo; útil únicamente para el estado efímero de la interfaz de usuario. |
| **Cookies First-Party HttpOnly** | Alta (Sobreviven a las purgas de ITP al ser emitidas por el servidor base) | Nula (Confinadas al navegador de origen) | Medio (Incapaz de seguir al usuario si cambia de móvil a escritorio antes de registrarse) | Estándar fundacional para capturar el First-Touch en tráfico no autenticado. |
| **Edge Key-Value (Upstash/Redis)** | Muy Alta (Inmune a purgas del cliente) | Parcial (Requiere reconciliación basada en la huella digital del dispositivo o IP) | Medio (La resolución de identidad es probabilística sin autenticación) | Complementario; útil para persistir metadatos de sesión efímeros vinculados a un identificador de sesión anónimo. |
| **Stateful Session Tokens (Base de Datos)** | Máxima (Datos custodiados en el servidor) | Máxima (Vinculación determinista de la cuenta del usuario en cualquier dispositivo) | Mínimo | Estándar dorado. Requiere la transición del identificador del afiliado a la tabla relacional de usuarios en el instante del registro. |

La persistencia óptima requiere un relevo del estado. El identificador del afiliado reside en la cookie HttpOnly durante la fase de exploración anónima, y se consolida en el esquema relacional de Turso en el milisegundo exacto en que el usuario transiciona a un estado autenticado (Lead).

### **Preservación de la Atribución en Flujos de Autenticación Social (OAuth)**

Un punto crítico de fuga de atribución ocurre durante el registro mediante proveedores de identidad (OAuth con Google o Apple). En un flujo tradicional de correo y contraseña, el cliente envía la carga útil junto con la cookie de atribución directamente al servidor. Sin embargo, en un flujo OAuth, el usuario abandona el dominio del SaaS y es redirigido al dominio del proveedor. Si el usuario utiliza modos de privacidad estrictos, navegadores in-app (como los incrustados en Instagram o LinkedIn), o finaliza el flujo en un dispositivo diferente, el contexto de la cookie inicial se pierde al regresar al *callback* de redirección.  
Para neutralizar esta fuga, la arquitectura explota el parámetro state del protocolo OAuth 2.0. El ecosistema Better-Auth proporciona mecanismos nativos para incrustar metadatos personalizados, como el identificador del afiliado, directamente en el ciclo de vida de la transacción OAuth6. Empleando la estrategia de estado en cookies (storeStateStrategy: "cookie" o delegándolo al almacenamiento secundario), la carga útil del estado OAuth, que incluye el affiliate\_id, se encripta firmemente y se valida contra el servidor de autorización7.  
Para consolidar esta información, la arquitectura utiliza el sistema de "Hooks" del ciclo de vida de Better-Auth. Estos ganchos permiten ejecutar lógica personalizada antes (before) o después (after) de que se invoque un punto final de autenticación9. Configurando un middleware de autenticación en la creación del usuario, el servidor extrae el identificador de referencia del contexto de la solicitud (ctx)—ya sea de la cookie de primera parte o del estado OAuth desencriptado—y lo inyecta permanentemente en la base de datos relacional asociándolo al identificador del nuevo usuario9. Este enfoque garantiza una cristalización determinista de la relación entre el creador y el cliente, sin latencia añadida ni dependencias de rastreo asíncronas en el navegador.

## **Modelo de Datos y Separación de Conceptos**

La adopción de Turso, una base de datos distribuida construida sobre LibSQL (una bifurcación de SQLite), combinada con Drizzle ORM, impone un rigor de diseño superlativo. Aunque SQLite presenta una tipificación dinámica y permisiva por defecto, Drizzle ORM impone seguridad de tipos en la capa de TypeScript, exigiendo que el arquitecto defina explícitamente las restricciones, claves foráneas e índices para mantener el rendimiento a escala10.  
El diseño del esquema relacional debe establecer límites transaccionales estrictos entre la conversión de registro (la métrica de crecimiento), los eventos de liquidez (la contabilidad) y la topología de la red (el árbol de creadores).

### **Arquitectura de Libro Mayor de Doble Entrada (Atomic Ledger)**

En el dominio de la gestión de comisiones, liquidaciones y pasarelas de pago, los diseños ingenuos basados en columnas de saldo estático (e.g., actualizar una columna balance sumando la nueva comisión) constituyen un antipatrón arquitectónico letal. Este enfoque de "estado actual" destruye el historial de mutaciones, imposibilita la auditoría forense durante disputas financieras y expone el sistema a condiciones de carrera donde operaciones concurrentes de lectura y escritura corrompen el saldo real12.  
La arquitectura estándar ineludible en 2026 para plataformas SaaS financieras es el modelo de Libro Mayor de Doble Entrada Inmutable (Immutable Double-Entry Ledger). En este paradigma, el saldo no es un estado almacenado, sino una derivación matemática calculada (o materializada asíncronamente) a partir de un registro de eventos financieros inmutables12.  
El diseño se compone de entidades entrelazadas:

> 1. **Cuentas del Libro Mayor (Ledger Accounts):** Representan el contenedor financiero del afiliado, rastreando métricas de forma materializada.  
> 2. **Transacciones (Ledger Transactions):** Agrupan el evento financiero subyacente (por ejemplo, el pago procesado por Mercado Pago).  
> 3. **Entradas (Ledger Entries):** Cada transacción genera obligatoriamente dos o más entradas, un débito y un crédito compensatorios, garantizando que el sistema global mantenga un balance estricto de cero (el principio fundamental de conservación financiera)12.

Para evitar el problema de cuentas "calientes" (hot accounts) donde múltiples conversiones simultáneas colisionan intentando actualizar la proyección del saldo, se emplea el Bloqueo Optimista (Optimistic Locking). Cada cuenta del libro mayor posee una columna lock\_version. Cualquier escritura debe declarar sobre qué versión está operando; si otra transacción modificó la cuenta en el ínterin, la versión de la base de datos se incrementa, provocando que la transacción original aborte y se reintente con los datos más recientes12.

### **Esquema Relacional Optimizado en Drizzle ORM**

El modelado en Drizzle ORM requiere atención a los detalles específicos del motor SQLite. Notoriamente, las declaraciones de claves foráneas (references) en Drizzle no generan índices de base de datos de manera implícita. Las operaciones de *JOIN* sobre columnas de claves foráneas no indexadas degeneran en escaneos completos de tabla (full table scans), lo que destruye el rendimiento de lectura a medida que la base de datos crece10. Es mandatorio declarar índices usando la función index() en la devolución de llamada del tercer argumento de la definición de la tabla13.  
Asimismo, las divisas (como el peso chileno, CLP) jamás deben almacenarse utilizando tipos de punto flotante (real o float), debido a los errores de precisión inherentes al estándar IEEE 754\. Las monedas deben almacenarse como enteros (integer), representando la unidad fraccional más pequeña de la moneda (en el caso de CLP, al no existir centavos en la práctica comercial, el peso entero es la unidad base)10.  
El esquema se segrega limpiamente en dominios:

* **Dominio de Creadores (affiliates):** Contiene la identidad, el código único de afiliado y la tasa de comisión aplicable (almacenada en puntos base para precisión, e.g., 2000 representa un 20%).  
* **Dominio de Atribución (referrals):** Registra el mapeo uno-a-uno entre un usuario recién registrado (Lead) y el afiliado. Mantiene una máquina de estados del embudo (trial, active, suspended, churned).  
* **Dominio Financiero (ledger\_transactions, ledger\_entries):** Almacena de forma inmutable los eventos de liquidez. Los estados de las entradas transicionan desde pending (mientras se consolida el pago), a payable (comisión lista para liquidación), hasta paid (transferencia emitida al creador) o chargeback (contracargo recibido por Mercado Pago).

### **Estructuración del Panel de Administración y Métricas de Crecimiento**

El panel de administración (/admin) en un entorno SaaS debe satisfacer dos mandatos diametralmente opuestos: la auditoría contable rigurosa y la visualización de métricas de crecimiento analíticas de alta velocidad (Costo de Adquisición de Clientes \- CAC, Valor del Ciclo de Vida \- LTV, y análisis de cohortes).  
Calcular el CAC orgánico frente al CAC de afiliados, o proyectar el LTV en tiempo real realizando consultas de agregación sobre millones de filas inmutables del libro mayor, degradará severamente la latencia del servidor Edge. En lugar de realizar agregaciones en tiempo real, la arquitectura confía en vistas materializadas (materialized views) o tablas de proyección asíncronas.  
Mediante el uso de trabajos de fondo o eventos despachados por un corredor de mensajes, el sistema procesa los registros inmutables de atribución y los pagos del libro mayor, y actualiza periódicamente una tabla de análisis de cohortes. Esto permite que el panel de control consuma métricas de LTV y embudos de deserción (churn) con tiempos de respuesta sub-milisegundo, aislando la carga de análisis de las tablas operacionales críticas que procesan los pagos y registros.

## **Detección de Fraude y Anti-Gaming**

El éxito de una red de referidos está inexorablemente ligado a su capacidad para repeler incentivos perversos. A medida que el Crecimiento Liderado por Producto eleva el volumen de registros y Mercado Pago procesa la liquidez, la superficie de ataque para el auto-referido, las granjas de prueba y la colusión se expande dramáticamente.

### **Redes Neuronales de Grafos (GNN) y Topología de Ataques Sybil**

Las estrategias deterministas de prevención de fraude, como las listas de bloqueo de direcciones IP o el *fingerprinting* del dispositivo, resultan trivialmente eludibles frente a redes privadas virtuales (VPN) residenciales o entornos emulados. El abuso sistémico frecuentemente asume la forma de ataques Sybil, en los cuales un actor fraudulento inyecta identidades apócrifas en el sistema, creando granjas de cuentas de prueba que simulan conversiones orgánicas para enriquecer a un nodo afiliado primario15.  
La innovación arquitectónica para 2026 radica en evaluar el fraude no como eventos aislados, sino como un problema de topología estructural mediante Redes Neuronales de Grafos (Graph Neural Networks o GNN). En este modelo, los usuarios y creadores constituyen los "nodos" del grafo, mientras que las referencias y los flujos de capital constituyen las "aristas" direccionales15.  
Modelos de aprendizaje profundo especializados como SybilGAT o arquitecturas de atención (Graph Attention Networks) superan las heurísticas al analizar la densidad y centralidad de la red. Si el sistema observa un subgrafo altamente denso de cuentas (leads) que interactúan exclusivamente con un único afiliado y exhiben una interconectividad nula con el resto del ecosistema orgánico de la aplicación, el algoritmo clasifica esta topología como anómala15.  
Estas redes neuronales de grafos proyectan el contexto topológico en "embeddings" (vectores numéricos de alta densidad que representan la propensión matemática al fraude de una entidad). Estos vectores se suministran a clasificadores como XGBoost para emitir un puntaje de riesgo probabilístico17. Este pipeline asíncrono identifica anillos colusorios invisibles a la inspección transaccional estándar, permitiendo congelar los saldos del libro mayor antes del ciclo de pago.

### **Heurísticas Transaccionales y Prevención de Colusión en Mercado Pago**

Como capa de primera línea, la aplicación debe implementar heurísticas deterministas integradas directamente en el flujo transaccional y el ciclo de vida del pago.

* **Bloqueo Estricto de Auto-Referencia:** El sistema ejecuta validaciones cruzadas entre los datos del instrumento de pago del afiliado y los de la cuenta referida. Si la pasarela de pagos (Mercado Pago o Stripe) devuelve el mismo identificador o *hash* criptográfico de la tarjeta de crédito, o si coinciden atributos unívocos como el identificador fiscal (RUT en Chile), la atribución se rechaza instantáneamente a nivel de aplicación. Adicionalmente, el sistema aplica la normalización de correos electrónicos (ignorando modificadores de sub-direccionamiento \+ y puntos en dominios como Gmail) para abortar los intentos de granjas de cuentas básicas.  
* **Período de Maduración (Vesting Period) Alineado al Riesgo:** La colusión frecuentemente implica pagos efectuados con tarjetas de crédito comprometidas o intención de disputa, seguidos de solicitudes rápidas de retiro de comisiones. Las comisiones insertadas en el Libro Mayor inician en estado pending y se someten a un período de maduración estricto (frecuentemente 30 o 45 días). Este período está matemáticamente diseñado para superar la ventana temporal estándar en la que los procesadores de pago o emisores bancarios inician disputas.  
* **Digestión Asíncrona de Disputas (Chargebacks):** El diseño contempla la reversión probabilística de pagos. La plataforma consume los Webhooks de Mercado Pago correspondientes a las devoluciones (refunds) y disputas (chargebacks)19. Cuando una transacción original es revocada, el Libro Mayor inmutable no borra la comisión inicial, sino que emite una nueva entrada compensatoria de débito vinculada a la transacción disputada, deduciendo el valor del saldo del creador de forma transparente y auditable.

## **Ingestión de Pagos y Webhooks Resilientes**

El manejo del SDK v2 de Mercado Pago y la orquestación de Notificaciones de Pago Instantáneas (IPN) o Webhooks exigen un diseño de sistemas distribuidos impecable para garantizar la sincronización entre el estado de la suscripción del usuario, el cálculo de comisiones y las notificaciones asíncronas.

### **El Patrón Transactional Outbox y la Resolución de Escritura Dual**

Al procesar una notificación de pago exitoso proveniente de Mercado Pago, el sistema típicamente requiere realizar una mutación en su base de datos local (crear la transacción en el libro mayor y actualizar la suscripción) e invocar un efecto secundario en un sistema externo (enviar un correo electrónico, actualizar el CRM, o notificar a un bus de eventos). Intentar ejecutar estas dos operaciones secuencialmente introduce el "Problema de la Escritura Dual" (Dual-Write Problem). Si la actualización de la base de datos se confirma pero el servicio de correo o el corredor de mensajes sufre un error de red, el sistema sufre una inconsistencia silenciosa donde el pago se procesó pero el efecto secundario se perdió en el éter (o viceversa)20.  
Dado que protocolos como el Compromiso de Dos Fases (Two-Phase Commit o 2PC) son excesivamente acoplados, lentos e incompatibles con bases de datos servidoras, el estándar de la industria es el Patrón Transactional Outbox21.  
Este patrón estipula que el sistema debe almacenar las modificaciones del negocio (los asientos contables) y la intención del evento (el mensaje a publicar) en la *misma base de datos* dentro de una única transacción atómica21. En la base de datos Turso, una tabla auxiliar outbox\_events captura el evento "PagoProcesado" simultáneamente a la inserción del pago.  
Posteriormente, un proceso desacoplado—un trabajador basado en sondeo (polling) o un sistema de Captura de Cambios de Datos (CDC)—lee asíncronamente los registros no procesados de la tabla outbox\_events y los emite al proveedor de mensajería, marcando la fila como completada. Este diseño garantiza una publicación segura y una semántica de entrega de "al menos una vez" (at-least-once delivery), desvinculando por completo los fallos de red externos del ciclo de la base de datos22.

### **Idempotencia Estricta y Validación Criptográfica (x-signature)**

Las arquitecturas de entrega garantizada implican que los webhooks pueden recibirse múltiples veces. Por ende, la idempotencia es obligatoria22. Mercado Pago exige que el servidor receptor valide la notificación y responda con un código HTTP 200 en un plazo perentorio de 22 segundos; de lo contrario, el proveedor retransmitirá el evento aplicando tiempos de espera exponenciales24.  
Antes del procesamiento, el sistema valida el origen de la carga útil empleando una firma criptográfica (HMAC SHA-256) presente en la cabecera HTTP x-signature proporcionada por Mercado Pago. El valor se presenta concatenado, incluyendo una marca de tiempo y el hash firmado de los datos del evento (e.g., ts=...,v1=...)25. Comparar este hash contra un cómputo local basado en el token secreto de la aplicación (almacenado en variables de entorno y jamás expuesto al cliente) repele cualquier intento de suplantación27.  
Una vez verificada la autenticidad, la base de datos aprovecha el identificador único del evento (mp\_event\_id) asignándolo a una columna con una restricción UNIQUE11. Si un evento duplicado intenta procesarse, la restricción de la base de datos detiene la inserción. El controlador de Next.js captura este error de violación de restricción única y lo maneja de manera inofensiva, devolviendo inmediatamente un estado HTTP 200 a Mercado Pago sin alterar los balances financieros ni disparar lógica duplicada.

### **Contención de Bloqueos en SQLite (SQLITE\_BUSY) y Concurrencia Multiversión (MVCC)**

Las implementaciones clásicas de SQLite se ven obstaculizadas por un modelo de concurrencia pesimista que permite un único escritor a la vez (Write-Ahead Logging estándar o bloqueos exclusivos), lo que produce el error SQLITE\_BUSY ante picos de concurrencia (por ejemplo, cortes de comisiones de fin de mes o picos de tráfico en Black Friday)30.  
Sin embargo, LibSQL (el motor detrás de Turso) ha diseñado extensiones experimentales críticas para mitigar esto. La activación del Control de Concurrencia Multiversión (MVCC) a través de la instrucción PRAGMA journal\_mode \= mvcc; permite que transacciones concurrentes operen optimísticamente sobre distintas ramas de los datos, mejorando radicalmente la capacidad de escritura (throughput) en arquitecturas serverless distribuidas31.  
Cuando MVCC se activa, las transacciones pueden instanciarse empleando la sintaxis BEGIN CONCURRENT. Si ocurre una colisión genuina a nivel de fila, Drizzle ORM y el cliente LibSQL implementan configuraciones de tiempo de espera de ocupación (PRAGMA busy\_timeout) y un mecanismo de retroceso exponencial (exponential backoff) transparente para reintentar la transacción antes de que el error permee hasta la interfaz del usuario o cancele el webhhok31. Esta amalgama de bloqueos de base de datos optimistas y bloqueos optimistas a nivel de aplicación (el lock\_version de las cuentas) forja un sistema de liquidación altamente resiliente.

## **Benchmark y Nuevas Tendencias 2026: La Era de los Referidos "Headless"**

La evolución del software B2B en la segunda mitad de la década exige que los servicios de apoyo a las aplicaciones se integren invisiblemente en lugar de desviar al usuario hacia portales operados por terceros. Proveedores de referencia como Tolt, Rewardful y FirstPromoter han consolidado las arquitecturas API "Headless" (sistemas sin interfaz gráfica forzada), en las cuales el motor de afiliados, el rastreo lógico y el cálculo de comisiones se exponen puramente como puntos finales RESTful o GraphQL e integraciones de Webhooks34.  
Este paradigma desacoplado permite al desarrollador integrar un panel de afiliados completo directamente dentro de la interfaz de la aplicación de Next.js (bajo la ruta /admin/referrals o /dashboard/affiliate), controlando la estética, el esquema de rutas y el sistema de autorización35. Rewardful y plataformas afines en 2026 distribuyen SDKs (kits de desarrollo de software) que leen silenciosamente el contexto de atribución en el cliente y envían el identificador asíncronamente mediante Server Actions del App Router de Next.js. Las Server Actions abstraen las llamadas a la API sin revelar secretos (tokens de acceso), ejecutando la comunicación con las pasarelas o los motores Headless de forma segura y tipada en el servidor28.

### **Diagrama de Arquitectura de Sistemas Distribuidos**

El siguiente diagrama detalla la orquestación asíncrona robusta que interconecta la interceptación del seguimiento, la creación segura de identidades mediante hooks, el consumo idempotente de webhooks a través del Transactional Outbox y las políticas de liquidación.

Fragmento de código  
sequenceDiagram  
    participant Visitante as Visitante (Cliente)  
    participant NextJS as Next.js 16 (Edge/Server Actions)  
    participant Turso as Base de Datos Turso (LibSQL)  
    participant Relay as Outbox Polling Worker  
    participant MP as Mercado Pago (IPN)  
      
    %% Flujo de Atribución y Memoria  
    Visitante-\>\>NextJS: Petición Inicial (URL con ?ref=AF\_ID)  
    NextJS-\>\>Visitante: Respuesta HTTP (Set-Cookie: HttpOnly Firmada)  
      
    %% Flujo de Registro Autenticado (Better-Auth)  
    Visitante-\>\>NextJS: Inicia Registro (OAuth Google / Email)  
    Note over NextJS: Better-Auth cifra el State para OAuth  
    NextJS-\>\>Turso: Hook (after\_signup): Extrae AF\_ID de Cookie/State  
    Turso--\>\>NextJS: Inserta Usuario y Mapeo en tabla 'referrals'  
      
    %% Flujo de Monetización e Ingestión de Pagos  
    Visitante-\>\>MP: Completa Pago de Subscripción SaaS (CLP)  
    MP-\>\>NextJS: Webhook asíncrono (Evento: payment.created)  
    NextJS-\>\>NextJS: Valida HMAC-SHA256 (Cabecera x-signature)  
      
    %% Transacción Atómica con Idempotencia  
    NextJS-\>\>Turso: BEGIN CONCURRENT  
    Turso-\>\>Turso: Validar restricción UNIQUE (mp\_event\_id)  
    Note over Turso: Lógica de Libro Mayor de Doble Entrada  
    Turso-\>\>Turso: Inserta Transacción y Entradas (Crédito/Débito)  
    Turso-\>\>Turso: Inserta evento de notificación en 'outbox\_events'  
    Turso--\>\>NextJS: COMMIT  
    NextJS--\>\>MP: Responde HTTP 200 OK (antes de 22s)  
      
    %% Relevo Asíncrono de Eventos Secundarios  
    Relay-\>\>Turso: Sondeo de 'outbox\_events' (WHERE procesado IS NULL)  
    Turso--\>\>Relay: Obtiene lote de eventos no enviados  
    Relay-\>\>Relay: Publica métricas o envía emails asíncronos  
    Relay-\>\>Turso: Marca filas del Outbox como procesadas

### **Contratos de Datos y Esbozo Estructural en TypeScript (Drizzle ORM)**

La traslación de la semántica relacional al código TypeScript en Drizzle ORM demanda definiciones dogmáticas. A continuación se presentan los esquemas relacionales diseñados para solventar las deficiencias predeterminadas, empleando enteros para valores de divisas CLP y forzando la creación de índices compuestos para la velocidad de las consultas.

TypeScript  
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';  
import { sql } from 'drizzle-orm';

// DOMINIO DE IDENTIDAD Y CREADORES  
export const affiliates \= sqliteTable('affiliates', {  
    id: text('id').primaryKey(), // ULID recomendado para lexicografía  
    userId: text('user\_id').notNull().unique(), // Relación uno a uno con la tabla de Better-Auth  
    affiliateCode: text('affiliate\_code').notNull().unique(),  
    commissionRateBps: integer('commission\_rate\_bps').notNull().default(2000), // 2000 \= 20%  
    createdAt: text('created\_at').default(sql\`(CURRENT\_TIMESTAMP)\`).notNull(),  
});

// DOMINIO DE ATRIBUCIÓN DEL EMBUDO (LEADS)  
export const referrals \= sqliteTable('referrals', {  
    id: text('id').primaryKey(),  
    affiliateId: text('affiliate\_id').notNull().references(() \=\> affiliates.id, { onDelete: 'restrict' }),  
    leadUserId: text('lead\_user\_id').notNull().unique(), // Un lead solo puede tener un referente (First-Touch final)  
    status: text('status', { enum: \['trial', 'active', 'suspended', 'churned'\] }).notNull(),  
    createdAt: text('created\_at').default(sql\`(CURRENT\_TIMESTAMP)\`).notNull(),  
}, (table) \=\> ({  
    // Índice imperativo; Drizzle ORM no auto-indexa las Foreign Keys  
    affiliateIdx: index('referrals\_affiliate\_idx').on(table.affiliateId),  
}));

// DOMINIO FINANCIERO: LIBRO MAYOR (ATOMIC DOUBLE-ENTRY LEDGER)  
export const ledgerTransactions \= sqliteTable('ledger\_transactions', {  
    id: text('id').primaryKey(),  
    mpEventId: text('mp\_event\_id').notNull().unique(), // Clave de idempotencia rigurosa para Webhooks IPN  
    description: text('description').notNull(),  
    createdAt: text('created\_at').default(sql\`(CURRENT\_TIMESTAMP)\`).notNull(),  
});

export const ledgerEntries \= sqliteTable('ledger\_entries', {  
    id: text('id').primaryKey(),  
    transactionId: text('transaction\_id').notNull().references(() \=\> ledgerTransactions.id, { onDelete: 'restrict' }),  
    affiliateId: text('affiliate\_id').notNull().references(() \=\> affiliates.id, { onDelete: 'restrict' }),  
    amountCLP: integer('amount\_clp').notNull(), // Uso de entero para moneda CLP, evita float bugs  
    direction: text('direction', { enum: \['credit', 'debit'\] }).notNull(),  
    status: text('status', { enum: \['pending', 'payable', 'paid', 'chargeback'\] }).notNull(),  
    lockVersion: integer('lock\_version').default(0).notNull(), // Mecanismo de Bloqueo Optimista  
    createdAt: text('created\_at').default(sql\`(CURRENT\_TIMESTAMP)\`).notNull(),  
}, (table) \=\> ({  
    txIdx: index('ledger\_tx\_idx').on(table.transactionId),  
    affiliateStatusIdx: index('ledger\_affiliate\_status\_idx').on(table.affiliateId, table.status),  
}));

// DOMINIO DE INTEGRIDAD Y DESACOPLAMIENTO: TRANSACTIONAL OUTBOX  
export const outboxEvents \= sqliteTable('outbox\_events', {  
    id: text('id').primaryKey(),  
    aggregateType: text('aggregate\_type').notNull(), // e.g., 'LedgerEntry'  
    eventType: text('event\_type').notNull(),         // e.g., 'CommissionCreated'  
    payload: text('payload', { mode: 'json' }).notNull(),  
    publishedAt: text('published\_at'),   
    createdAt: text('created\_at').default(sql\`(CURRENT\_TIMESTAMP)\`).notNull(),  
}, (table) \=\> ({  
    // Índice parcial: acelera el sondeo del trabajador que busca solo eventos no publicados  
    unpublishedIdx: index('outbox\_unpublished\_idx').on(table.id).where(sql\`published\_at IS NULL\`),  
}));

### **Recomendaciones Tácticas para Implementación**

Para asegurar el éxito operativo del sistema en las fases de despliegue para el mercado chileno, se destacan las siguientes prescripciones arquitectónicas:

> 1. **Migración a Arquitectura Headless:** Al diseñar el panel de afiliados dentro de soyindi.cl, proporcione una experiencia fluida e integrada (White-label) exponiendo el progreso del embudo consumiendo los datos directamente del modelo relacional. Aumenta la confianza del creador al evitar que abandone la marca para consultar sus estadísticas de comisiones.  
> 2. **Aislamiento del Entorno Criptográfico:** El manejo de la validación HMAC x-signature jamás debe delegarse al borde si el proveedor de borde no cuenta con un entorno seguro verificado. Las Server Actions en Next.js deben ejecutar la validación estrictamente del lado del servidor, asegurándose de que la clave de Mercado Pago permanezca resguardada de fugas al contexto del cliente (Client Components)25.  
> 3. **Monitoreo Transaccional Proactivo:** Construya un *cron-job* asíncrono o un trabajador ligero que realice conciliaciones programadas sobre la base de datos distribuida. Este trabajador de auditoría debe calcular la sumatoria de todos los débitos y créditos del sistema; si el total de la columna amount\_clp difiere de un cero matemático estricto, el sistema debe disparar una alerta de ingeniería crítica inmediata, indicando una fisura en el modelo del libro mayor12.  
> 4. **Gestión de Índices SQLite:** Dado que Drizzle no gestiona índices implícitos en SQLite, cualquier adición futura de características que involucre filtros o búsquedas sobre columnas de identificación debe incluir metódicamente sentencias index(). Además, active pragmas vitales como PRAGMA foreign\_keys \= ON; al inicializar la conexión, ya que SQLite desactiva la aplicación de claves foráneas por defecto en ciertas configuraciones heredadas10.

#### **Obras citadas**

> 1. Server-Side Tracking 2026: Privacy-First Analytics \- Digital Applied, [https\://www\.digitalapplied.com/blog/server-side-tracking-2026-privacy-first-analytics-cookies](https://www.digitalapplied.com/blog/server-side-tracking-2026-privacy-first-analytics-cookies)  
> 2. Safari ITP: Cookies, Tracking, and Conversion Fixes | Blog \- Hardal, [https\://usehardal.com/safari-itp-guide](https://usehardal.com/safari-itp-guide)  
> 3. Tracking Prevention in WebKit, [https\://webkit.org/tracking-prevention/](https://webkit.org/tracking-prevention/)  
> 4. Link Tracking Protection (Safari): understanding the real impact on, [https\://www\.trackad.ai/en/blog/link-tracking-protection-safari-understanding-the-real-impact-on-advertising-tracking-and-how-to-adapt/](https://www.trackad.ai/en/blog/link-tracking-protection-safari-understanding-the-real-impact-on-advertising-tracking-and-how-to-adapt/)  
> 5. Server-Side Tracking 2026: The Complete Guide for Small, [https\://meixner-tobias.com/en/blog/server-side-tracking/](https://meixner-tobias.com/en/blog/server-side-tracking/)  
> 6. OAuth | Better Auth, [https\://better-auth.com/docs/concepts/oauth](https://better-auth.com/docs/concepts/oauth)  
> 7. state\_mismatch | Better Auth, [https\://better-auth.com/docs/reference/errors/state\_mismatch](https://better-auth.com/docs/reference/errors/state_mismatch)  
> 8. state\_invalid \- Better Auth, [https\://better-auth.com/docs/reference/errors/state\_invalid](https://better-auth.com/docs/reference/errors/state_invalid)  
> 9. Hooks | Better Auth, [https\://better-auth.com/docs/concepts/hooks](https://better-auth.com/docs/concepts/hooks)  
> 10. drizzle-best-practices • tessl-labs • Registry, [https\://tessl.io/registry/tessl-labs/drizzle-best-practices](https://tessl.io/registry/tessl-labs/drizzle-best-practices)  
> 11. Indexes & Constraints \- Drizzle ORM, [https\://orm.drizzle.team/docs/sqlite/indexes-constraints](https://orm.drizzle.team/docs/sqlite/indexes-constraints)  
> 12. Optimistic Locking for Double-Entry Ledgers | Martin C. Richards, [https\://www\.martinrichards.me/post/ledger\_p1\_optimistic\_locking\_real\_time\_ledger/](https://www.martinrichards.me/post/ledger_p1_optimistic_locking_real_time_ledger/)  
> 13. drizzle-orm/drizzle-orm/src/sqlite-core/README.md at main \- GitHub, [https\://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/sqlite-core/README.md](https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/sqlite-core/README.md)  
> 14. SQLite column types \- Drizzle ORM, [https\://orm.drizzle.team/docs/sqlite/column-types](https://orm.drizzle.team/docs/sqlite/column-types)  
> 15. Sybil Detection using Graph Neural Networks \- arXiv, [https\://arxiv.org/html/2409.08631v1](https://arxiv.org/html/2409.08631v1)  
> 16. \[2409.08631\] Sybil Detection using Graph Neural Networks \- arXiv, [https\://arxiv.org/abs/2409.08631](https://arxiv.org/abs/2409.08631)  
> 17. GNNs: Modernizing fraud prevention in financial services, [https\://www\.thoughtworks.com/en-cl/insights/articles/graph-neural-networks-in-fraud-prevention](https://www.thoughtworks.com/en-cl/insights/articles/graph-neural-networks-in-fraud-prevention)  
> 18. Supercharging Fraud Detection in Financial Services with Graph, [https\://developer.nvidia.com/blog/supercharging-fraud-detection-in-financial-services-with-graph-neural-networks/](https://developer.nvidia.com/blog/supercharging-fraud-detection-in-financial-services-with-graph-neural-networks/)  
> 19. How to manage chargebacks disputes \- Mercado Pago, [https\://www\.mercadopago.com.ar/developers/en/docs/adobe-commerce/resources/chargebacks/how-to-manage](https://www.mercadopago.com.ar/developers/en/docs/adobe-commerce/resources/chargebacks/how-to-manage)  
> 20. The Transactional Outbox Pattern: A Rigorous Examination for, [https\://medium.com/@nustianrwp/the-transactional-outbox-pattern-a-rigorous-examination-for-distributed-systems-engineers-9c189836f470](https://medium.com/@nustianrwp/the-transactional-outbox-pattern-a-rigorous-examination-for-distributed-systems-engineers-9c189836f470)  
> 21. Outbox Pattern: Solving the Dual-Write Problem \- Milan Jovanović, [https\://milanjovanovic.tech/blog/outbox-pattern-dual-write-problem](https://milanjovanovic.tech/blog/outbox-pattern-dual-write-problem)  
> 22. Transactional Outbox Pattern \- Reliable Event Publishing in, [https\://blog.krrishg.com/transactional-outbox-pattern-reliable-event-publishing-in-distributed-systems](https://blog.krrishg.com/transactional-outbox-pattern-reliable-event-publishing-in-distributed-systems)  
> 23. Transactional Outbox Pattern: A Practical Guide to Trade-offs, [https\://www\.softwarecraftsperson.com/posts/2025-10-08-transactional-outbox-pattern/](https://www.softwarecraftsperson.com/posts/2025-10-08-transactional-outbox-pattern/)  
> 24. Webhooks \- Mercado Pago Developers, [https\://www\.mercadopago.cl/developers/es/docs/subscriptions/additional-content/your-integrations/notifications/webhooks](https://www.mercadopago.cl/developers/es/docs/subscriptions/additional-content/your-integrations/notifications/webhooks)  
> 25. Configurar notificaciones \- Mercado Pago Developers, [https\://www\.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/payment-notifications](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/payment-notifications)  
> 26. Configurar notificaciones opcionales \- Mercado Pago Developers, [https\://www\.mercadopago.cl/developers/es/docs/qr-code/optional-notifications](https://www.mercadopago.cl/developers/es/docs/qr-code/optional-notifications)  
> 27. Webhooks de Mercado Pago \- Validación de firma x-signature, [https\://es.stackoverflow.com/questions/634238/webhooks-de-mercado-pago-validaci%C3%B3n-de-firma-x-signature](https://es.stackoverflow.com/questions/634238/webhooks-de-mercado-pago-validaci%C3%B3n-de-firma-x-signature)  
> 28. Next.js Server Actions Explained: Real-World Examples for, [https\://medium.com/@shankhwarshipra2001/next-js-server-actions-explained-real-world-examples-for-developers-96881c8bdd2c](https://medium.com/@shankhwarshipra2001/next-js-server-actions-explained-real-world-examples-for-developers-96881c8bdd2c)  
> 29. Indexes & Constraints \- Drizzle ORM, [https\://orm.drizzle.team/docs/indexes-constraints](https://orm.drizzle.team/docs/indexes-constraints)  
> 30. turso/docs/manual.md at main \- GitHub, [https\://github.com/tursodatabase/turso/blob/main/docs/manual.md](https://github.com/tursodatabase/turso/blob/main/docs/manual.md)  
> 31. PRAGMA Statements \- Turso Docs, [https\://docs.turso.tech/sql-reference/pragmas](https://docs.turso.tech/sql-reference/pragmas)  
> 32. Turso Database: SQLite Rewritten in Rust with MVCC, Async I/O, [https\://explainx.ai/blog/turso-database-sqlite-rust-rewrite-guide-2026](https://explainx.ai/blog/turso-database-sqlite-rust-rewrite-guide-2026)  
> 33. Beyond the Single-Writer Limitation with Turso's Concurrent Writes, [https\://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes)  
> 34. How to use webhooks in Tolt, [https\://help.tolt.com/en/articles/11143903-how-to-use-webhooks-in-tolt](https://help.tolt.com/en/articles/11143903-how-to-use-webhooks-in-tolt)  
> 35. What is Headless API \+ Use Cases \- Strapi, [https\://strapi.io/blog/what-is-headless-api](https://strapi.io/blog/what-is-headless-api)  
> 36. Understanding the Headless API Paradigm \- Liferay Learn, [https\://learn.liferay.com/course/understanding-the-headless-api-paradigm](https://learn.liferay.com/course/understanding-the-headless-api-paradigm)  
> 37. Instructions for Next.js, [https\://app.getrewardful.com/instructions/b3b871a2-d024-4eb0-9ae3-56362185723f?platform=nextjs](https://app.getrewardful.com/instructions/b3b871a2-d024-4eb0-9ae3-56362185723f?platform=nextjs)