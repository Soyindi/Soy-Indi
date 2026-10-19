# **Arquitectura de Facturación y Ciclo de Vida de Suscripciones SaaS: Especificación Técnica para la Plataforma INDI**

## **Fundamentos de la Arquitectura de Facturación**

El diseño de un motor de facturación y aprovisionamiento (billing and entitlement engine) para una plataforma de Software as a Service (SaaS) exige un rigor transaccional absoluto. En el contexto de la plataforma INDI (soyindi.cl) para el año 2026, el ecosistema tecnológico está compuesto por Next.js 16 utilizando el App Router, React 19 para la reactividad de interfaces, Turso (basado en LibSQL) como base de datos distribuida en el borde (edge), Drizzle ORM para el acceso a datos con seguridad de tipos, Better-Auth para la gobernanza de sesiones de identidad, y Flow.cl como pasarela de pagos primaria para el mercado chileno mediante Webpay Plus. Este documento establece las directrices arquitectónicas, los modelos matemáticos y los patrones de diseño de base de datos necesarios para orquestar la transición de planes, la gestión de estados y la protección contra concurrencias anómalas en el procesamiento de pagos.

## **Eje 1: Coexistencia y Transición de Planes (Upgrade, Downgrade & Prorrateo)**

### **La Regla Estándar en SaaS: "Un Usuario \= Un Plan Activo a la Vez"**

El paradigma dominante en la arquitectura de plataformas SaaS impone una restricción de cardinalidad estricta de uno a uno (1:1) entre la entidad del inquilino (Tenant/User) y la entidad de la suscripción (Subscription). La adopción de esta regla no responde a una limitación técnica arbitraria, sino a una estrategia calculada para mitigar la complejidad ciclomática en la capa de autorización y para garantizar la integridad referencial en los sistemas de facturación.  
Si se permitiera la coexistencia de múltiples planes para un mismo usuario (por ejemplo, un usuario que posee un Plan Starter con límite de 3 tarjetas y simultáneamente adquiere un Plan Pro con límite de 10 tarjetas), el motor de resolución de derechos (entitlement engine) tendría que ejecutar lógicas de desambiguación en cada solicitud. El sistema tendría que determinar si los límites son aditivos (permitiendo 13 tarjetas en total), si el límite superior sobrescribe al inferior (10 tarjetas), o si existe una segmentación funcional. Esta ambigüedad incrementa drásticamente la latencia de las consultas de base de datos y multiplica los vectores de error en la validación de acceso.  
Desde la perspectiva de la facturación, un modelo de suscripción singular facilita la conciliación contable. Cuando la pasarela de pagos (Flow.cl) notifica un evento asíncrono, el sistema de backend de INDI simplemente localiza la única suscripción activa del usuario y muta su estado. Esto reduce la fricción en la experiencia de usuario (UX), eliminando la carga cognitiva que implica administrar fechas de renovación dispares y previniendo la frustración derivada de cobros solapados o inesperados.

### **Prorrateo Financiero en Cobros Únicos sin Tarjeta Guardada**

En el mercado chileno, el procesamiento de pagos a través de Webpay Plus mediante integradores como Flow.cl opera tradicionalmente bajo un modelo de cobros únicos (one-off), a menos que se implemente explícitamente un sistema de tokenización (como Oneclick) para realizar cargos recurrentes automáticos. En la plataforma INDI, donde los usuarios frecuentemente realizan pagos sin almacenar permanentemente sus credenciales bancarias, la gestión de un "Upgrade" requiere un cálculo preciso del valor residual del plan en curso.  
La complejidad radica en que la pasarela ya ha retenido el capital correspondiente al plan menor (Plan Starter), y el usuario solicita acceder a un plan de nivel superior (Plan Pro) antes de la finalización del ciclo contratado. Dado que el usuario no tiene una tarjeta tokenizada para cobrar un diferencial exacto, y considerando que las operaciones de reembolso (refunds) en el sistema bancario chileno involucran altos costos operativos, conciliaciones manuales y demoras significativas, la solución algorítmica óptima es la Conversión de Crédito Temporal (Time Credit Conversion). En este modelo, el usuario paga el valor íntegro del nuevo plan (\$4.990 CLP), pero el sistema compensa el valor residual del plan anterior extendiendo la duración del nuevo ciclo.

#### **Modelado Matemático de la Conversión de Crédito Temporal**

Para formalizar este cálculo determinista, se establece un modelo de equivalencia diaria monetaria que transforma el capital no consumido en días adicionales para el nuevo plan.  
Se definen las siguientes variables para el ecosistema de INDI:

* ![][image1]: Precio total del Plan Starter (\$2.500 CLP).  
* ![][image2]: Duración estándar del Plan Starter en días (típicamente 30 días para un mes comercial).  
* ![][image3]: Valor diario del Plan Starter definido como ![][image4].  
* ![][image5]: Tiempo restante en el Plan Starter al momento exacto del upgrade (expresado en días).  
* ![][image6]: Precio total del Plan Pro (\$4.990 CLP).  
* ![][image7]: Duración estándar del Plan Pro en días (30 días).  
* ![][image8]: Valor diario del Plan Pro definido como ![][image9].

El capital remanente o Crédito Monetario (![][image10]) que el usuario aún no ha consumido se calcula mediante la ecuación:  
![][image11]  
El Tiempo Adicional Equivalente (![][image12]) que este capital remanente logra adquirir bajo la estructura de costos del nuevo Plan Pro se formula como:  
![][image13]  
Sustituyendo el crédito en la ecuación, la fórmula unificada para calcular la extensión del nuevo ciclo de vigencia al momento de la compra es:  
![][image14]  
Para ilustrar este modelo con el caso de uso de INDI: Supongamos que un usuario tiene un Plan Starter mensual activo (\$2.500 CLP) y le restan exactamente 20 días de vigencia. En este instante, decide realizar un upgrade al Plan Pro mensual (\$4.990 CLP).

> 1. El valor diario del Plan Starter es ![][image15].  
> 2. El crédito monetario remanente es ![][image16].  
> 3. El valor diario del Plan Pro es ![][image17].  
> 4. El tiempo adicional convertido es ![][image18].

Consecuentemente, el sistema aprovisiona el Plan Pro por el ciclo estándar recién pagado (30 días) y le suma los 10 días derivados del crédito remanente. La nueva fecha de expiración se fija en 40 días a partir del momento de la transacción, asegurando una retención total del valor económico para el usuario sin recurrir a reembolsos bancarios. Para evitar discrepancias en años bisiestos o meses de 31 días, la arquitectura debe utilizar marcas de tiempo UTC absolutas en milisegundos y un denominador de mes comercial fijo (30 días) en las divisiones de prorrata1.

### **Estándar Internacional para la Archivación de Datos en Downgrade**

El escenario de degradación de servicio (downgrade) plantea un desafío en la integridad de los datos. Si un usuario en el Plan Max ha creado 8 tarjetas de presentación digitales y su suscripción decae hacia el Plan Starter (cuyo límite duro es de 3 tarjetas), el sistema se enfrenta a un exceso de cuota. El estándar arquitectónico internacional para plataformas SaaS prohíbe terminantemente la eliminación destructiva (Hard Delete) de los datos generados por el usuario para resolver conflictos de cuota3.  
La eliminación arbitraria viola los principios de reversibilidad, genera una pérdida irreparable de confianza y contraviene las normativas de retención de datos que exigen que la información del usuario se mantenga a menos que exista una solicitud explícita de eliminación5. Para resolver esto, INDI debe implementar el patrón de Archivado Pasivo o Congelamiento Suave (Soft Freeze Pattern).  
El protocolo de congelamiento suave opera bajo la siguiente lógica:

> 1. **Algoritmo de Selección:** El sistema identifica las 3 tarjetas más recientemente modificadas, o aquellas que el usuario haya marcado explícitamente como primarias o favoritas. Estas mantienen su estado activo.  
> 2. **Mutación de Estado:** Las 5 tarjetas excedentes sufren una actualización de estado en la base de datos LibSQL. En lugar de ejecutar un comando DELETE, el sistema ejecuta un UPDATE mutando una bandera lógica, por ejemplo, status \= 'FROZEN' o is\_archived \= 1\.  
> 3. **Capa de Middleware:** El middleware de la aplicación (Next.js App Router) intercepta cualquier petición a los enlaces públicos de estas tarjetas congeladas. En lugar de devolver la tarjeta, el servidor responde con un código HTTP 404 (Not Found) para los visitantes externos, preservando la privacidad y evitando mostrar pantallas de error que dañen la imagen del usuario. Para el propietario autenticado, la API restringe las operaciones de mutación (HTTP 403 Forbidden) hasta que regularice su plan, pero permite la visualización en su panel de control con una insignia de "Archivado".  
> 4. **Reversibilidad:** Si el usuario decide reactivar el Plan Pro o Max meses después, la simple transición del estado de la suscripción dispara un evento que revierte la bandera is\_archived a 0, restaurando la funcionalidad plena de todas las tarjetas instantáneamente6.

## **Eje 2: Ciclo de Vida del Temporizador y Período de Gracia (Countdown UX)**

### **Psicología de Urgencia y la Paradoja del Reloj Continuo**

El diseño de la experiencia de usuario (UX) en la facturación SaaS está profundamente arraigado en la psicología del comportamiento. Exhibir un temporizador continuo de cuenta regresiva (mostrando horas, minutos y segundos) que corre perpetuamente desde el primer día de una suscripción de 30 días constituye un antipatrón de diseño severo. Visualmente, un reloj que se mueve constantemente durante un período prolongado induce a la "ceguera de banners"; el cerebro humano se adapta al estímulo continuo y comienza a ignorarlo activamente. Peor aún, en un nivel subconsciente, asocia el uso de la plataforma INDI con una ansiedad transaccional persistente.  
Por el contrario, la activación de un temporizador de urgencia exclusivamente durante los últimos 3 días del ciclo de facturación (72 horas) aprovecha de manera óptima el principio de la Aversión a la Pérdida (Loss Aversion), un concepto fundamental de la Teoría de las Perspectivas desarrollada por Daniel Kahneman y Amos Tversky7. Esta teoría demuestra que el impacto psicológico (el dolor) de perder algo que ya se posee es significativamente mayor que la satisfacción de adquirir algo de valor equivalente. Al ocultar el temporizador durante el mes y revelarlo solo en la ventana crítica, el sistema no genera estrés crónico, sino que invoca una urgencia focalizada que actúa como un poderoso llamado a la acción (Call to Action), maximizando las tasas de conversión y renovación voluntaria.

### **El Evento del Tiempo Cero y la Estrategia del Período de Gracia**

Cuando el temporizador alcanza exactamente el valor de ![][image19], la ejecución inmediata de una suspensión destructiva de la cuenta es una práctica ineficiente desde la perspectiva de la recuperación de ingresos. Las fallas en los pagos no siempre reflejan la intención del usuario de abandonar la plataforma; frecuentemente son el resultado de problemas logísticos, como tarjetas de crédito expiradas, bloqueos temporales por fraude en los bancos, o intermitencias en la infraestructura de adquirencia (como los cortes esporádicos de Transbank en Chile). Esta fricción genera lo que en la industria se conoce como "churn involuntario" o deserción pasiva.

#### **Definición del Período de Gracia**

Siguiendo las metodologías recomendadas por líderes globales en facturación como Stripe y Zuora, es imperativo establecer un Período de Gracia (Grace Period) estructurado, típicamente de 3 a 5 días9. El análisis de datos demuestra que las plataformas de suscripción pueden perder entre el 7% y el 11% de sus ingresos debido a fallas involuntarias en los pagos, y un período de gracia combinado con estrategias automatizadas de recuperación (Dunning) puede rescatar hasta un 40% de estas cuentas11.  
Durante esta ventana temporal (por ejemplo, desde el día 30 hasta el día 35 del ciclo), el modelo de dominio de INDI debe transicionar el estado de la suscripción a GRACE\_PERIOD. Para los visitantes externos que acceden a las tarjetas de presentación digital a través de un código QR o un enlace, la experiencia permanece ininterrumpida; el servicio continúa resolviéndose con éxito. Sin embargo, cuando el usuario propietario inicia sesión en su panel de control, el sistema de Dunning despliega interfaces de advertencia prominentes, restringiendo la creación de nuevas tarjetas o la edición profunda, y canalizando el flujo de navegación hacia la pasarela de pago para actualizar sus credenciales.

#### **Implementación del Estado Read-Only frente a la Suspensión**

Si el período de gracia expira sin una resolución exitosa del pago (día 36), el sistema debe entrar en un estado de mitigación denominado "Solo Lectura" (Read-Only) en lugar de una suspensión total9. La plataforma INDI gestiona la identidad digital profesional; si los enlaces públicos a las tarjetas de presentación dejan de funcionar devolviendo errores HTTP 404 abruptamente, la reputación del usuario final sufre un daño catastrófico frente a sus propios clientes. Un usuario que experimenta esta humillación pública tiene una probabilidad casi nula de regresar a la plataforma.  
La arquitectura del estado Read-Only se implementa dividiendo el comportamiento de las APIs:

* **API Pública de Resolución (Tráfico Externo):** El endpoint de renderizado de tarjetas continúa operando normalmente para las entidades base permitidas (por ejemplo, las 3 tarjetas del plan gratuito). El middleware de Next.js verifica el estado, pero permite la lectura pública.  
* **API Privada de Mutación (Tráfico Autenticado):** Todos los endpoints HTTP configurados con verbos POST, PUT, PATCH y DELETE para los recursos del usuario interceptan la solicitud y devuelven un código HTTP 403 (Forbidden) o HTTP 402 (Payment Required)9. La interfaz gráfica bloquea los campos de formulario, preservando la integridad de los datos mientras incentiva económicamente la reactivación del servicio.

## **Eje 3: Protocolo de Compra y Verificación Criptográfica Anti-Fraude**

La integración con Flow.cl y Webpay exige un protocolo de orquestación asíncrono y altamente seguro para garantizar que la plataforma INDI aprovisione los servicios únicamente tras la confirmación irrefutable de la transferencia de fondos.

### **Diagrama de Secuencia de Checkout**

El siguiente diagrama detalla la arquitectura de comunicación entre el usuario, el servidor de INDI (Next.js), la base de datos (Turso/LibSQL) y la pasarela de pagos (Flow.cl).

Fragmento de código  
sequenceDiagram  
    autonumber  
    participant U as Navegador del Usuario  
    participant INDI as API INDI (Next.js 16\)  
    participant DB as LibSQL (Turso)  
    participant FLOW as Pasarela Flow.cl

    U-\>\>INDI: POST /api/checkout (Payload: Plan Pro)  
    INDI-\>\>DB: INSERT Transaction (status='PENDING', amount=4990)  
    INDI-\>\>FLOW: POST /payment/create (Firma HMAC, urlReturn, urlConfirmation)  
    FLOW--\>\>INDI: 200 OK (token: "XYZ123", url: "https\://flow.cl/pay")  
    INDI--\>\>U: Redirección HTTP 302 a URL de Flow \+ token  
      
    rect rgb(240, 248, 255\)  
    Note over U,FLOW: El usuario ingresa credenciales bancarias y aprueba el pago  
    end

    par Flujo de Confirmación Asíncrona (Server-to-Server)  
        FLOW-\>\>INDI: POST /api/webhooks/flow (Body: {token: "XYZ123"})  
        INDI-\>\>FLOW: GET /payment/getStatus?token=XYZ123\&s=FirmaHMAC  
        FLOW--\>\>INDI: 200 OK (status=2, amount=4990, payer="cliente@mail.com")  
        INDI-\>\>DB: BEGIN IMMEDIATE  
        INDI-\>\>DB: UPDATE Transaction SET status='PAID' WHERE token='XYZ123'  
        INDI-\>\>DB: UPDATE Subscription SET status='ACTIVE'  
        INDI-\>\>DB: COMMIT  
        INDI--\>\>FLOW: 200 OK  
    and Flujo de Retorno del Navegador  
        FLOW--\>\>U: Redirección HTTP 302 a urlReturn  
        U-\>\>INDI: GET /checkout/return?token=XYZ123  
        INDI-\>\>DB: BEGIN IMMEDIATE  
        INDI-\>\>DB: SELECT status FROM transactions WHERE token='XYZ123'  
        alt Si status sigue siendo PENDING  
            INDI-\>\>FLOW: GET /payment/getStatus?token=XYZ123\&s=FirmaHMAC  
            FLOW--\>\>INDI: 200 OK (status=2)  
            INDI-\>\>DB: UPDATE Transaction y Subscription  
        end  
        INDI-\>\>DB: COMMIT  
        INDI--\>\>U: Redirección a /dashboard con sesión limpia  
    end

### **Aseguramiento Transaccional y Certeza de Pago**

#### **La Regla de Desconfianza del Cliente**

Un axioma inquebrantable en la ingeniería de pagos es que el servidor jamás debe confiar en la información provista a través del navegador del cliente. Cuando la pasarela de pagos finaliza el flujo, redirige al usuario hacia la urlReturn de INDI, típicamente añadiendo parámetros en la cadena de consulta (query string), como /checkout/return?token=XYZ123.  
Es trivial para un actor malicioso interceptar esta petición o modificar manualmente la URL en su navegador para inyectar estados falsificados (por ejemplo, /checkout/return?token=XYZ123\&status=paid). Si el servidor aprovisiona el plan basándose en la presencia de estos parámetros, el sistema sufre una vulnerabilidad crítica de inyección de estado. En la arquitectura de INDI, el impacto (hit) a la URL de retorno actúa exclusivamente como un "despertador"13. Indica al servidor que el cliente cree haber terminado, provocando que el servidor inicie su propio proceso de verificación aislado.

#### **Verificación Server-to-Server con Firma HMAC-SHA256**

La fuente única y absoluta de la verdad reside en los servidores de la pasarela. Tras recibir el token, ya sea por el webhook de notificación asíncrona (urlConfirmation) o por el retorno del navegador, el backend de INDI debe ejecutar una petición HTTP GET interna directamente a la API de Flow (https\://www\.flow.cl/api/payment/getStatus)13.  
Para prevenir ataques de intermediario (Man-in-the-Middle) y garantizar la autenticidad, la API de Flow exige que todas las peticiones estén firmadas criptográficamente utilizando el algoritmo HMAC-SHA256 y la clave secreta (Secret Key) del comercio15. El protocolo de firma exige concatenar los parámetros de la solicitud ordenados alfabéticamente por el nombre de la clave.  
A continuación, se detalla la implementación en TypeScript lista para producción para el entorno de Next.js:

TypeScript  
import { createHmac } from 'crypto';

interface FlowParams {  
    apiKey: string;  
    token: string;  
    \[key: string\]: string;  
}

export function generateFlowSignature(params: FlowParams, secretKey: string): string {  
    // 1\. Extraer las claves del objeto y ordenarlas alfabéticamente  
    const keys \= Object.keys(params).sort();  
      
    // 2\. Concatenar secuencialmente "LlaveValor" según la especificación de Flow  
    let stringToSign \= '';  
    for (const key of keys) {  
        // Excluir la propia firma si estuviera erróneamente en los parámetros  
        if (key \!== 's') {  
            stringToSign \+= \`\${key}\${params\[key\]}\`;  
        }  
    }  
      
    // 3\. Generar la firma criptográfica usando HMAC-SHA256  
    return createHmac('sha256', secretKey)  
        .update(stringToSign)  
        .digest('hex');  
}

// Ejemplo de integración en el manejador del Webhook:  
const flowToken \= searchParams.get('token');  
const params \= { apiKey: process.env.FLOW\_API\_KEY, token: flowToken };  
const signature \= generateFlowSignature(params, process.env.FLOW\_SECRET\_KEY);  
const url \= \`https\://www\.flow.cl/api/payment/getStatus?apiKey=\${params.apiKey}\&token=\${params.token}\&s=\${signature}\`;

// El servidor ejecuta un fetch a 'url' y evalúa el campo 'status'.  
// Status 2 \= Pagado.

#### **Prevención de Condición de Carrera e Idempotencia en LibSQL**

En ecosistemas asíncronos distribuidos, ocurre frecuentemente una condición de carrera (Race Condition) predecible: el servidor de Flow envía el Webhook POST (urlConfirmation) en el milisegundo exacto en el que el navegador del usuario ejecuta la redirección GET hacia el servidor de INDI (urlReturn)13. Si la arquitectura de Next.js procesa ambas peticiones simultáneamente de forma ingenua, el sistema podría registrar dos transacciones contables duplicadas o añadir meses dobles de suscripción al usuario.  
Para garantizar la idempotencia (la propiedad de que múltiples aplicaciones de una operación resulten en el mismo estado que una sola), el sistema de base de datos LibSQL (Turso) debe forzar un bloqueo pesimista en la transacción. Dado que SQLite procesa la concurrencia a través de su Write-Ahead Log (WAL), la manera canónica de evitar que dos hilos simultáneos lean el estado "PENDING" y ambos intenten actualizar a "PAID", es utilizando el modificador BEGIN IMMEDIATE17.  
Al invocar BEGIN IMMEDIATE, la primera conexión que llega adquiere el candado de escritura (Write Lock) de la base de datos *antes* de realizar la instrucción SELECT. La segunda conexión que intente acceder será puesta en espera por el motor (hasta alcanzar el tiempo definido en busy\_timeout19) o rechazada inmediatamente con un error SQLITE\_BUSY. Cuando la primera conexión termina e inserta el estado PAID, la segunda conexión logrará leer la base de datos, verá que el estado ya está pagado, y abortará pacíficamente su ejecución sin duplicar los servicios.

## **Eje 4: State Machine de Suscripción (Modelo de Dominio)**

La gestión del ciclo de vida de un inquilino exige precisión determinista, modelada a través de una Máquina de Estados Finita (Finite State Machine o FSM). En INDI, la suscripción de un usuario navegará de forma estrictamente controlada a través de las siguientes fases, evitando estados huérfanos o corrupciones lógicas.

### **Definición de Estados**

* **ANONYMOUS:** Estado transitorio. El visitante no posee una identidad autenticada ni un registro en la tabla de suscripciones.  
* **TRIAL:** Período inicial automatizado (típicamente 3 días) tras el registro. Actúa como un mecanismo de Product Led Growth (PLG), entregando capacidad operativa completa para inducir la activación.  
* **ACTIVE:** El estado nominal de operación. La suscripción ha sido validada económicamente y se encuentra dentro de su ventana de vigencia cronológica contractual.  
* **GRACE\_PERIOD:** El ciclo cronológico ha expirado matemáticamente (![][image20]), pero el motor retiene parcialmente la operatividad de mutación por una ventana de 3 a 5 días para mitigar fallos transitorios de cobranza y ejecutar flujos de Dunning9.  
* **EXPIRED:** Estado de desactivación (Read-Only). Se superó la gracia sin pago. El sistema congela los recursos mediante el Soft Freeze Pattern; no hay destrucción de datos, pero se revoca el acceso a la creación y edición.  
* **CANCELLED:** Revocación terminal. Iniciada por una acción administrativa (baneo del usuario) o como respuesta a un evento de fraude reportado por Flow (Chargeback). Revoca todos los accesos públicos y privados instantáneamente.

### **Matriz de Transiciones y Alteraciones Atómicas**

Las transiciones entre estados en LibSQL mediante Drizzle ORM deben estructurarse atómicamente; es decir, múltiples columnas cambian simultáneamente dentro de una transacción para evitar que el sistema lea un estado ACTIVE pero con una fecha de expiración en el pasado.

| Estado Origen | Evento Desencadenante | Estado Destino | Columnas Alteradas Atómicamente en subscriptions |
| :---- | :---- | :---- | :---- |
| \[Ninguno\] | Registro Exitoso de Usuario | TRIAL | status \= 'TRIAL', period\_start \= NOW(), period\_end \= NOW() \+ 3 days |
| TRIAL o EXPIRED | Pago de Plan Confirmado | ACTIVE | status \= 'ACTIVE', plan\_id \= \[Nuevo ID\], period\_start \= NOW(), period\_end \= NOW() \+ X days |
| ACTIVE | Fin del Período Cronológico | GRACE\_PERIOD | status \= 'GRACE\_PERIOD', grace\_end \= period\_end \+ 5 days |
| ACTIVE | Renovación Temprana (Upgrade) | ACTIVE | plan\_id \= \[Nuevo ID\], period\_end \= period\_end \+ X días prorrateados |
| GRACE\_PERIOD | Pago Recuperado (Dunning) | ACTIVE | status \= 'ACTIVE', period\_end \= NOW() \+ X days, grace\_end \= NULL |
| GRACE\_PERIOD | Fin de los Días de Gracia | EXPIRED | status \= 'EXPIRED', canceled\_at \= NOW() |
| Cualquier | Contracargo/Fraude Detectado | CANCELLED | status \= 'CANCELLED', canceled\_at \= NOW() |

## **Eje 5: Gobernanza de Caché de Sesión**

### **El Problema del 'Stale Session' en Next.js 16 y Better-Auth**

La arquitectura de Next.js 16 (App Router) está diseñada alrededor de una agresiva inmutabilidad de caché tanto en el cliente (Router Cache) como en el servidor (Full Route Cache) para maximizar el rendimiento. Concurrentemente, la librería de autenticación Better-Auth implementa un mecanismo llamado cookieCache, el cual almacena los datos de la sesión del usuario (incluyendo los roles y permisos derivados de su suscripción) directamente en una cookie encriptada en el navegador21. Esto permite que el middleware perimetral autorice rutas en milisegundos sin necesidad de hacer una consulta (round-trip) a la base de datos LibSQL.  
Sin embargo, esta optimización genera el problema de la Sesión Rancia (Stale Session) durante los flujos transaccionales22. La secuencia de error es la siguiente:

> 1. El usuario inicia sesión; Better-Auth emite una cookie encriptada indicando que el rol es TRIAL. Esta cookie tiene un tiempo de vida (maxAge) de, por ejemplo, 5 minutos21.  
> 2. El usuario navega hacia el flujo de pago, es redirigido a Flow, y completa su pago.  
> 3. El Webhook de confirmación asíncrona impacta silenciosamente en el servidor, actualizando la base de datos Turso de INDI y mutando el estado a ACTIVE.  
> 4. El navegador del usuario retorna a /checkout/return y es redirigido a /dashboard.  
> 5. El App Router de Next.js intercepta la petición. Al consultar Better-Auth, este lee la cookie local que aún no ha expirado y determina que el usuario sigue siendo TRIAL. La base de datos es la fuente de la verdad y está actualizada, pero la caché del navegador ha creado un cisma lógico, provocando que la UI le pida al usuario que pague nuevamente25.

### **Resolución: Revalidación Forzada y Purga de Caché**

Para resolver esta asimetría sin desactivar la caché global (lo cual destruiría el rendimiento del middleware), la ruta encargada de recibir el retorno del usuario (GET /api/checkout/return) debe ordenar explícitamente a Better-Auth que ignore la cookie y consulte directamente la base de datos, para luego inyectar una cookie fresca y forzar a Next.js a purgar sus cachés de enrutamiento.  
El protocolo exige el uso del parámetro disableCookieCache: true en la consulta al servidor de Better-Auth21.

TypeScript  
// app/api/checkout/return/route.ts  
import { NextResponse } from 'next/server';  
import { headers } from 'next/headers';  
import { auth } from '@/lib/auth';  
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {  
    const url \= new URL(request.url);  
    const token \= url.searchParams.get('token');

    // 1\. Ejecutar verificación S2S idempotente y actualizar DB...  
    await processPaymentAndUpgradePlan(token);

    // 2\. Extraer la sesión forzando el ByPass del caché local.  
    // Al incluir disableCookieCache, Better-Auth ignora la cookie JWT actual,  
    // viaja hasta Turso, lee el estado actualizado, y envía un encabezado 'Set-Cookie'   
    // en la respuesta para refrescar la memoria del navegador.  
    const session \= await auth.api.getSession({  
        headers: await headers(),  
        query: { disableCookieCache: true }   
    });

    // 3\. Purgar el Router Cache de Next.js de manera programática.  
    // Esto fuerza a los Server Components de la ruta a volver a renderizarse   
    // absorbiendo la nueva realidad de la sesión.  
    revalidatePath('/dashboard', 'layout');

    // 4\. Redireccionar al usuario a su panel de control con el estado actualizado.  
    return NextResponse.redirect(new URL('/dashboard', request.url));  
}

Si la interfaz utiliza componentes de cliente en React 19 que mantienen el estado de sesión interactivo, es mandatorio invocar el método de invalidación proporcionado por el SDK del cliente una vez que el usuario aterriza en el dashboard: const { refetch } \= authClient.useSession(); await refetch();24. Esta orquestación asegura un 100% de coherencia visual tras la transacción.

## **Eje 6: Arquitectura de Implementación y Checklist del Tech Lead**

Para materializar esta arquitectura de facturación, la estructura de la base de datos y la disciplina operativa deben configurarse con tolerancias de grado industrial.

### **Esquema Drizzle SQLite de Suscripciones y Transacciones**

La definición en Drizzle ORM para operar sobre Turso (LibSQL) debe aplicar normalización estricta para el manejo de cardinalidad y prever que SQLite, al no poseer un tipo nativo de fecha absoluto o de moneda decimal robusto, requiere almacenar los valores monetarios en números enteros (CLP no tiene decimales en la práctica moderna, pero previene errores de flotantes) y las fechas en enteros Unix Timestamp27.

TypeScript  
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Tabla de Planes base con límites funcionales  
export const plans \= sqliteTable('plans', {  
    id: text('id').primaryKey(), // UUIDv7 generado en servidor  
    slug: text('slug').notNull().unique(), // e.g., 'starter', 'pro', 'max'  
    priceClp: integer('price\_clp').notNull(),  
    cardLimit: integer('card\_limit').notNull(),  
    cvLimit: integer('cv\_limit').notNull(),  
    presentationLimit: integer('presentation\_limit').notNull(),  
});

// Tabla unificada de Suscripciones (Garantiza 1:1 mediante lógica de inserción y restricciones)  
export const subscriptions \= sqliteTable('subscriptions', {  
    id: text('id').primaryKey(),  
    userId: text('user\_id').notNull().references(() \=\> users.id, { onDelete: 'cascade' }),  
    planId: text('plan\_id').notNull().references(() \=\> plans.id),  
    status: text('status', {   
        enum: \['TRIAL', 'ACTIVE', 'GRACE\_PERIOD', 'EXPIRED', 'CANCELLED'\]   
    }).notNull(),  
    // Timestamps almacenados como enteros (epoch) para consistencia global \[cite: 2, 27\]  
    currentPeriodStart: integer('current\_period\_start', { mode: 'timestamp' }).notNull(),  
    currentPeriodEnd: integer('current\_period\_end', { mode: 'timestamp' }).notNull(),  
    gracePeriodEnd: integer('grace\_period\_end', { mode: 'timestamp' }),  
    createdAt: integer('created\_at', { mode: 'timestamp' }).notNull().defaultNow(),  
    updatedAt: integer('updated\_at', { mode: 'timestamp' }).notNull().defaultNow(),  
});

// Registro inmutable de intentos de pago (Log transaccional)  
export const transactions \= sqliteTable('transactions', {  
    id: text('id').primaryKey(),  
    subscriptionId: text('subscription\_id').notNull().references(() \=\> subscriptions.id),  
    userId: text('user\_id').notNull().references(() \=\> users.id),  
    flowToken: text('flow\_token').notNull().unique(),  
    amountClp: integer('amount\_clp').notNull(),  
    status: text('status', { enum: \['PENDING', 'PAID', 'FAILED'\] }).notNull(),  
    paymentMethod: text('payment\_method'), // Captura si el usuario pagó con WEBPAY, MACH, etc.  
    createdAt: integer('created\_at', { mode: 'timestamp' }).notNull().defaultNow(),  
    completedAt: integer('completed\_at', { mode: 'timestamp' }),  
});

### **Los 10 Mandamientos de Ingeniería para 0 Fugas y 100% Consistencia**

Como Principal Billing Architect, la gobernanza del código y la infraestructura que manipula dinero exige adherirse de forma draconiana a los siguientes principios de ingeniería28:

> 1. **Aritmética Exclusiva en el Motor SQL:** Bajo ninguna circunstancia se deben mutar balances, cuotas o límites calculando el diferencial en la memoria de Node.js (JavaScript). El patrón const nuevoLimite \= actual \+ 10; db.update(...).set({ limite: nuevoLimite }) es inherentemente vulnerable a condiciones de carrera concurrentes. La delegación aritmética debe recaer siempre en las primitivas atómicas del ORM, delegando la ecuación al motor de la base de datos: db.update(planes).set({ limite: sql\\limite \+ 10\` })\`28.  
> 2. **Candados de Idempotencia Explícitos:** Dado que la arquitectura asíncrona de webhooks garantiza la posibilidad de notificaciones duplicadas o concurrentes, toda actualización transaccional en LibSQL debe encapsularse bajo el modificador BEGIN IMMEDIATE. Esto asegura la adquisición temprana de un Write Lock a nivel de archivo de base de datos o hilo primario, evitando que transacciones fantasma crucen validaciones de estado17.  
> 3. **Generación de Claves Primarias (IDs) en el Cliente/Borde:** En infraestructuras distribuidas como Turso Edge Replicas o Cloudflare D131, depender de la función autoincremental de la base de datos (RETURNING last\_insert\_rowid()) introduce bloqueos de latencia innecesarios y fragilidad en lotes (batch operations). Los identificadores deben ser generados en el servidor de aplicación (Next.js) utilizando estándares ordenables cronológicamente, como UUIDv7 o CUIDs2, garantizando predictibilidad y colisión cero antes de que la orden toque la red28.  
> 4. **Desacoplamiento Absoluto de Dominios (Billing vs Entitlements):** El módulo de facturación no debe inyectar lógica dura dentro del módulo de creación de tarjetas. La tabla de suscripciones funciona únicamente como un emisor de tokens lógicos. La arquitectura debe emplear un sistema de Control de Acceso Basado en Atributos (ABAC) donde la capa de las tarjetas pregunta a la capa abstracta de permisos: *"¿Puede este usuario crear una tarjeta?"*, sin que la capa de interfaz conozca si el usuario está en Plan Starter o Pro.  
> 5. **Reconciliación de Pagos mediante Cron Jobs (Reconciliation Audit):** Flow.cl, como cualquier sistema interconectado a la red bancaria y a Transbank, puede sufrir caídas silenciosas de webhook donde el pago se procesó, pero el servidor INDI nunca fue notificado. Es crítico implementar un Cron Job desatendido que despierte cada hora, busque registros en la tabla transactions que lleven estancados en el estado PENDING por más de 30 minutos, y ejecute proactivamente consultas payment/getStatus15 hacia la pasarela, liquidando la transacción como FAILED o recuperando el pago hacia PAID para mantener la higiene contable.  
> 6. **Tolerancia a la Consistencia Eventual (Read-Your-Own-Writes):** Si la arquitectura implementa Réplicas Integradas (Embedded Replicas) de Turso para llevar la base de datos más cerca de los usuarios en el borde29, se debe asumir la consistencia eventual. Las lecturas son instantáneas en la réplica local, pero las escrituras se envían al nodo primario remoto. Para evitar lecturas fantasmas inmediatas tras un pago, la lógica del cliente debe invocar explícitamente el método de sincronización de Turso (db.sync()) o enrutar las lecturas subsecuentes críticas directamente al nodo primario29.  
> 7. **Inmutabilidad del Historial Contable (Append-Only Log):** Está terminantemente prohibido utilizar los comandos UPDATE o DELETE sobre transacciones pasadas que ya han sido liquidadas exitosamente. Si un usuario requiere un reembolso, un ajuste manual por soporte técnico, o una compensación, el sistema debe emitir una nueva fila de inserción (INSERT) que refleje el movimiento negativo, respetando las leyes de auditoría contable y trazabilidad financiera.  
> 8. **Gestión Rigurosa de Timeouts:** Las funciones sin servidor (Serverless Functions) de Next.js operan bajo límites de tiempo de vida (típicamente 10 o 60 segundos en Vercel o AWS Lambda). En la configuración del controlador de base de datos Turso, es mandatorio definir de manera explícita el parámetro de control de latencia (por ejemplo, PRAGMA busy\_timeout \= 5000). Esto obliga al motor a abortar con una falla clara tras 5 segundos de congestión o bloqueos de escritura prolongados, mitigando las pérdidas de memoria (Memory Leaks) y facilitando reintentos elegantes (graceful degradations)19.  
> 9. **Desconfianza del Tiempo Local y Estructuras Bisiestas:** Para evitar el colapso del sistema de prorrata durante los cambios de horario de verano chilenos o las peculiaridades de años bisiestos y meses de distintas longitudes, la manipulación de fechas en JavaScript debe estandarizarse. Los periodos de facturación deben ser forzados a 30 días nominales. Además, todas las marcas de tiempo se almacenarán en la base de datos en formato UTC absoluto (Epoch Time en milisegundos), abstrayendo la lógica de presentación de la zona horaria del usuario1.  
> 10. **Aislamiento Criptográfico Estricto:** La clave HMAC-SHA256 y la API Key de Flow.cl representan las llaves maestras de la viabilidad económica de la plataforma. Estas claves deben residir de manera exclusiva en variables de entorno seguras o en herramientas de gestión de secretos (Vaults) durante el tiempo de ejecución. Es fundamental programar los sistemas de registro y observabilidad (como Pino, Winston o Sentry) con filtros explícitos (redacting tools) que detecten y enmascaren automáticamente cualquier volcado de la configuración para evitar que el secreto se derrame hacia registros analíticos comprometiendo la operación en el largo plazo.

Siguiendo esta rigurosa disciplina arquitectónica, INDI se posiciona para operar en el mercado 2026 con garantías absolutas de solidez, rendimiento y blindaje antifraude a escala masiva.

#### **Obras citadas**

> 1. Proration Logic & Calculations | SaaS Billing, [https\://www\.saas-billing-architecture.com/subscription-billing-architecture-pricing-models/proration-logic-calculations/](https://www.saas-billing-architecture.com/subscription-billing-architecture-pricing-models/proration-logic-calculations/)  
> 2. What is proration? Definition, formula, and SaaS billing examples, [https\://www\.withorb.com/blog/what-is-proration](https://www.withorb.com/blog/what-is-proration)  
> 3. 64 SaaS Delete UI Design Examples \- SaaSFrame, [https\://www\.saasframe.io/patterns/delete](https://www.saasframe.io/patterns/delete)  
> 4. How to Eliminate Overlapping SaaS Tools (Without Hurting ... \- Torii, [https\://www\.toriihq.com/articles/remove-overlapping-saas-tools](https://www.toriihq.com/articles/remove-overlapping-saas-tools)  
> 5. SaaS Vendor Lock-In: How to Avoid It From Day One, [https\://zeroonecreation.com/blog/saas-vendor-lock-in-avoid-from-day-one](https://zeroonecreation.com/blog/saas-vendor-lock-in-avoid-from-day-one)  
> 6. Cold Data Management: Strategies for Optimizing Data Access, [https\://www\.acceldata.io/blog/cold-data](https://www.acceldata.io/blog/cold-data)  
> 7. Loss Aversion: Understand Theory With Examples, [https\://octet.design/journal/loss-aversion/](https://octet.design/journal/loss-aversion/)  
> 8. Turning Loss Into Gain: Prospect Theory in Practice | UPWARD, [https\://www\.upwardspiralgroup.com/journal/turning-loss-into-gain-how-prospect-theory-enhances-marketing-and-sales-strategies](https://www.upwardspiralgroup.com/journal/turning-loss-into-gain-how-prospect-theory-enhances-marketing-and-sales-strategies)  
> 9. Passive churn 101 | Stripe, [https\://stripe.com/resources/more/passive-churn-101-what-it-is-why-it-happens-and-eight-ways-to-prevent-it](https://stripe.com/resources/more/passive-churn-101-what-it-is-why-it-happens-and-eight-ways-to-prevent-it)  
> 10. Dunning: What subscription-based businesses need to know \- Stripe, [https\://stripe.com/resources/more/dunning-what-subscription-based-businesses-need-to-know](https://stripe.com/resources/more/dunning-what-subscription-based-businesses-need-to-know)  
> 11. Stripe Churn Prevention \- PaymentRescue, [https\://paymentrescue.dev/stripe-churn-prevention](https://paymentrescue.dev/stripe-churn-prevention)  
> 12. Stripe dunning: best practices and limitations \- Churnkey, [https\://churnkey.co/blog/stripe-dunning](https://churnkey.co/blog/stripe-dunning)  
> 13. Flow API \- Documentación Flow, [https\://developers.flow.cl/en/api](https://developers.flow.cl/en/api)  
> 14. Quickstart \- Documentación Flow, [https\://developers.flow.cl/docs/quick-start](https://developers.flow.cl/docs/quick-start)  
> 15. Estado de orden | Flow, [https\://developers.flow.cl/docs/tutorial-basics/status](https://developers.flow.cl/docs/tutorial-basics/status)  
> 16. Flow by John Michael Rivera Gonzalez \- plugins \- Filament, [https\://filamentphp.com/plugins/jrg7-flow](https://filamentphp.com/plugins/jrg7-flow)  
> 17. SQLite Interview Questions and Answers \- GoodSpace AI, [https\://goodspace.ai/interview-questions/sqlite](https://goodspace.ai/interview-questions/sqlite)  
> 18. CHANGELOG.md \- tursodatabase/turso \- GitHub, [https\://github.com/tursodatabase/turso/blob/main/CHANGELOG.md](https://github.com/tursodatabase/turso/blob/main/CHANGELOG.md)  
> 19. dartvel\_core 0.9.4 changelog | Dart package \- Pub.dev, [https\://pub.dev/packages/dartvel\_core/versions/0.9.4/changelog](https://pub.dev/packages/dartvel_core/versions/0.9.4/changelog)  
> 20. Work Diary \- Tons of Skills, [https\://tonsofskills.com/blog/](https://tonsofskills.com/blog/)  
> 21. Session Management | Better Auth, [https\://better-auth.com/docs/concepts/session-management](https://better-auth.com/docs/concepts/session-management)  
> 22. @convex-dev/better-auth in Next.js: 5 gotchas that cost me hours, [https\://agents.stackoverflow.com/tils/a5709710-daf0-4185-ada0-3cb8a83fe457?tag=nextjs\&page=1](https://agents.stackoverflow.com/tils/a5709710-daf0-4185-ada0-3cb8a83fe457?tag=nextjs&page=1)  
> 23. Session cookie not updating \- Better Auth \- Answer Overflow, [https\://www\.answeroverflow.com/m/1346643811652079737](https://www.answeroverflow.com/m/1346643811652079737)  
> 24. refreshCache · Issue \#6009 · better-auth/better-auth \- GitHub, [https\://github.com/better-auth/better-auth/issues/6009](https://github.com/better-auth/better-auth/issues/6009)  
> 25. How do you handle stale Better Auth session cookies in Next.js App, [https\://www\.reddit.com/r/nextjs/comments/1wjl594/how\_do\_you\_handle\_stale\_better\_auth\_session/](https://www.reddit.com/r/nextjs/comments/1wjl594/how_do_you_handle_stale_better_auth_session/)  
> 26. Session "emailVerified" status is not updated after email verification, [https\://github.com/better-auth/better-auth/discussions/4495](https://github.com/better-auth/better-auth/discussions/4495)  
> 27. Drizzle ORM \- sqlite-core \- GitHub, [https\://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/sqlite-core/README.md](https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/sqlite-core/README.md)  
> 28. D1 has no transactions — using client.batch() for multi-step writes, [https\://firdausng.com/posts/d1-has-no-transactions-use-client-batch](https://firdausng.com/posts/d1-has-no-transactions-use-client-batch)  
> 29. libSQL Skill for Claude Code & AI Agents \- Terminal Skills, [https\://terminalskills.io/skills/libsql](https://terminalskills.io/skills/libsql)  
> 30. Transactions \- Drizzle ORM, [https\://orm.drizzle.team/docs/transactions](https://orm.drizzle.team/docs/transactions)  
> 31. Reference \- Turso docs, [https\://docs.turso.tech/sdk/go/reference](https://docs.turso.tech/sdk/go/reference)  
> 32. Reference \- Turso Docs, [https\://docs.turso.tech/sdk/ts/reference](https://docs.turso.tech/sdk/ts/reference)  
> 33. Crear cupón \- Documentación Flow, [https\://developers.flow.cl/docs/suscripciones/create-coupon](https://developers.flow.cl/docs/suscripciones/create-coupon)  
> 34. Reference \- Turso Docs, [https\://docs.turso.tech/sdk/rust/reference](https://docs.turso.tech/sdk/rust/reference)  
> 35. Database and Persistence | CherryHQ/cherry-studio | DeepWiki, [https\://deepwiki.com/CherryHQ/cherry-studio/3.4-database-and-persistence](https://deepwiki.com/CherryHQ/cherry-studio/3.4-database-and-persistence)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAaCAYAAABYQRdDAAABGElEQVR4Xu2UsUoDURBFb8BABCWmCQhCAmoZ7VKaJl9gm15tk8KPkTSptLH0F9JoacgPKFYhEFCwUe943xJ2MBsfK0IgB06xe3eG997OLrDmP9ihu85S6olItqAmz/ST7odrs0bPw/3HpCCGN6j4J6ZQtuGDLApQ0ZMPAi9Qbqv/NRWo6M4HgQ8oL/sgiw5U2PYBOYAaXvlgGX1o63vu/hEd0xtErvKYzugDtJpEe+t16Lyjsa3b9k59kId7qOm2D/LwisXz6bGjqNMTWkxHc5L5nPhgAUNo/K7pyGXfzZr0AmpqX8wh9Mlm8U7PaCP4J9jMXkIL6bksmk16S6vh2l6ujVwu7Li60PwOaCsd58N+KPbvXbOqfAHFljB0NkRQFgAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAABPklEQVR4Xu2UsUpDMRiFj4ggOFgRFMGtD6CgOCk4iHRxETe7ljo4dRGdfA5RfAQnF/EBBCcnpbMujoIOgtVz+FMIP/GS3lLocD/4aJuTJrl/cgNUjDtTdJEuOWtxp2GZhg36Rn9pPfzuexfav+lE+E9pvmCDeSbpKSzbctlAaIUa5NUHEW36Sdd8kMscbJJbH0Tswfrs+yCXQ9qjOz6I6MAmOfFBLpewUi37IEJ9Sj/JCv2gZz6I0D5oPx5hpR0YlUorLCrVMazPuWvPRqvTAHpfUjRg+5U63tmoDEUDdGH5hQ/ILN2l8z6IKXo/VukzvaYzLhO6ijbD9x8kyq3BN+gRbJIXehCpQ6D299A3hQ7DFewa2obdgSOhSW/oPdJPOxQtWIn66Kb47+CUZp0+wQ7DA0ZYKt3OC+GzosL4A2ivOgeywix+AAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAaCAYAAAC3g3x9AAABKUlEQVR4Xu2UsUoDQRCGf4lKRAshIUFQfACLFEGsBCHaSGIr6APoW1jlGQI2QR9DLAQtbFNI0ggiQnoLiUXQf5i9ZDN7kvOSIkU++OB2hvuPY2cXmDMtVs066/RZpxn3vESXvV7ABj2mP7RDi9CXIhZowfW7dBPhBwMkVF54tA2PNt22xb9YhAZ+2ga016ArtjEOCfyyRbJP320xCRIoWp5pzhaTEBe4Q49MLTEf0MA1tz6lb4NuCl6ggXm3btHLYfv/3EADy3TPORF1aOAZvYcOdBwy1Ad0y9QDatDAPj0xvQiZxXP3/E0vvF7ALnQOmxg9ej5you5oiVYQ3gMjyO5e2WIMVXpLX6HnPjWHtOetZSqiiUiFXAxP9Jo+YMzvJkV23l5vc2aZX1GuLG/pWU/OAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAcCAYAAADcO8kVAAACbElEQVR4Xu2YT4hNURzHvxMzkT8jRBqatSwmCalRU1iQkbKYYmOFhaZsiMJqypaNshmUkmxJUqZY2EnNxEZNUkqhhDANvt9+55rzfu++evfOG/eO+z71qXt+Z+Z27u+de87vHqBNJdhLf0ft5fQe3RzFKsk51CZGnKFXXKxyTNJHUbubPqM7olgmlrj2omDMCrogXHfSrqivLPyiI1H7dIh1RLFMrKP7YNPwFV0Le/gE3XhN6H9H16M+cUWj8XyiO2HPI1uCbqQHf+I7Il7SXh8sCT2wsS/zHbNlISwxn30HrO8qXew7SoQW3gM+GNCMP0gvwdadzCgx33wQNj3f+GCJ0A/2gG70HYE99AK9TQdqu5pDifHbndDKvsoH5xHaXIbpc+R8jrTEbIJlPC+axsli2Kyt5jFdSu8g56v0FpYY3UQMwWqD+Y522JU+mIUJWGJWh/YLemKmu3QkMzyvTXMD9g9b6PZgG1jVqMQchpXWjSpGFVMDdIOLp6EPOe1oWSwdg7DETKNxTaCt8Ui4/kGPR31FcYv+xMzYk+uTqK3gc7MVVseMovENtWs8pH10F+q/s4pC47kLK0aFvuu+0mt//2IWaDe66IMp7Kc36WvYd1UZ0NFCv4tprVRy5pzd9HvU1i6W7GBFoh90DPVjSRLTaK1sGb30KWx6jqE8r5HWw7TtV4dUafE5Qdn3xxJFo9doygdhx5o6j6ksH2ALb4wWYZ3PbHPxSqHXJS4bNKuP0kNRTJyn9/EP1pyiuU6/wBLzEVYcqrbSkaYKyxgVpeP0lIu3IZfpex+sMnp1ztJjaFHB97+RHKe0ycsfX35+1tYAPLMAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAaCAYAAAA0R0VGAAABrUlEQVR4Xu2WTStFURSGl1CUknwlJAZKKQYkJaUMGCjJ0B8QI4UwNhblT2CGm4yUkiED86uUIhPFROF9W+tk3X2oW/fDGZynnu7ea59z975rf12RlJSUGGfwC67BefPAYtsudm+xsvICN1y9Ch7BR9jj4hPww9VLTi1cCGJjooNg1jwD8C6IlZQ+2B3E1kWnbzKIs34VxMpOVnRwNUE8EXBKy77w84HZ4sAewoYk0C46uNOwIQlwM3xKfDP8O5xSZoxT2hG0kQrR46Ta5JFTmfOEyAwcd/Vp2Cn6/JCVSa/owc7vzAtmi1nbDBuMXdgK3+CI6PTviQ74WX4O8mZ7bsraXmG9tfGWebIyuYB1rh6jDfbDc9EO9+GsaAf8xRFbop3w9uAtsgSb4LFotnle8h2+z4wswjnJvVV4G3HpEA4q+q6iwM6GgxizHXUYcik6gIis6KYjy6JJKRqcRmbL8y661jzRWmSmVqzsM8Vrk384+Llq7QXRJb+ff4PwBh7Ca7jj2m5ho5W5OUatzIFm4Ino+wXDddQQBg1mqsU+PX6xs83vTtb9mk5JSfmLby4WRuPjPy9pAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAbCAYAAACTHcTmAAABKklEQVR4Xu2VPUtDMRiFj6hQEb8mFZ3cXOzkP3Du0Elw191RHQQR/AMuIrgKuvY/CK5C1wpFhyJujtVzfBN7+1LapilOfeCBkJPk5uPeXGDCf7BM152lrhaJXNLvAZ7RxdghhS/YAL34hGUzPhiEOrV9ZeAVlq/6oB8rsE41HwT0MOVLPuhHGdbpxAdkCp29TeKWNummq9+hdXqPxFlq6c+0Re/oTbABm532czo2HpYDWOeqD3LQ7DTotg9y0NI16IIPchjmZOfoNX2jV7Ate6SzxUaR+Lp8+MCxR09h7fSmiN1Q/4cujDjDosfFRj1o0I1QPsIYDncetmR9/1Ll7MOt0PNQvqAvnWh0dEU+0QfYLNe643S26LuvzOUQdpD6Q4yNeB/s+2DCLz+Pt0NT4u/aogAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAbCAYAAACJISRoAAABWUlEQVR4Xu2VvytGURjHv5Ii5McisZCSibKSxWDxDlaj1WSRLBb/hISdVYxvGU0mZTLIIiPFgO+3556c++TejvteZXg/9anb+T7vufc+7znnAm3+O110hI46B+OiVtmnnyW+02M6HX7QCq+wST2ddAeWLbrs12iSDz+Y0UMvM3VdiSHYTc59ELEKq1nzQSqzsAm2fRARblJWU8ohfaDjPohQTeU3UauuYa3qdlkg1LzQeZclsQ57wmUfRGzCavbceDLaA5qgqFVhZalmwmXJqA2aoKhVK7Cl/dMeSqZsfwzD8gs6EI1vwFp3Qs/oLr2J8hwdsEm0sjxz9BbWzl6XHcHOuzs6RfvpVa4CdgBq8iJ1Xmlf6PAsYoE2susZ+gx76FrZopPZdVihtTJG7/H9Pz2h4iYtQ616o016SpdyaU1oRTX9YJ1oMTzC3kDfmj9BS/sgs89lbarxBdAeTRZ5MmsbAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAaCAYAAAC3g3x9AAABRElEQVR4Xu2UPS9EURCGX/ERQkEIERIfrUIhIhFKBQmtxC/wK9D4DUQjCp1Wp1OQqBRCKSJRShQaEd43M8sx97L33lXukzzZc2b2zmbvzDlAk/+iO+w73ZRe2urrdtqR5DIM0xX6Qe/oEOyhGi100PNPdBTZH8ygonrgPCYSbulYDP5GG6zgS0zAcnu0KybqoYKvMUgW6UMMFkEFZeSS9sdgEfIKTtGlECvMI6xgj+/X6f1XtgI3sIIDvr+mm9/p8hzBCs7QObchdmEFN+gZbKBTtJ+GDb3Wq6jTLH1BBd/pWsiJfTpBn+k8rOgx/jg1s7A5PMTPo1dji/bRU1gRDfwJ7Kjmou5ux2BgmS74Wp9vSa4Ses8jvt6B/f3KTMJuG50cTYTmNDauFGqUGqb3p+usIXS5XtEL5DesNOP0wNXd2cT4BC/OMshVcF8oAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAAAfCAYAAAC1bdCFAAACxklEQVR4Xu2ZTahNURTHl3zks4h8RL1HDDAwUJQwEDIhUShDE8WIgUwwMTAxkFImeGUiEwOKpIshkSJFipcykgwYkI//v7W3u85y5Zx7zn1333vur/51z9r73NNdZ+211t5XpH+YCl2FfgW9h75BT6FNZl6toWOOmOvtwTbZ2GrLd2i9ud4v6pwJxlZLlkPXJesIOuuCua4tO6DH0MWgBrQHGm/mFGaau+b69Gt0pjQfMhGaZMZSYLqoMxY5e2lihrfaZcZnQY/cuE16KcAl9VH+fqmVsED0Rz/0A4aX0JA3JsJ56Kc3BviiX0O7oRHR5VeIGaLOeecHAsPQXm9MAEbKZWlG9H1ojp0AlkG3RJceE/ax7HA++OVfvRFsgEa9sYdg9Ypp4qaokwoTve95AB33xh5iIXQDOgjNd2O5aeWcldAWZysK81kRzdXbKmGcVPRiv0jWOSzZ16R8d8klWURP9LZKWAftgzb6gaK8EHVOTGjPREMxVfjDyyo3DVHnsJFiON6RNpPXGPFcsr1XO8rNFdEbVkNrg1KGRxFllRt2vXQO9ydcUh5G0yrRXMTPPA6YnZnRGp9w/6cqE3JlxLOPH9K6i2TVOgvdhi5Bh6BXmRl9TNyfLPUDgROi+yw2UuxMWcXYcc6zk7oEN893oSXGtkL05Q0ZW9sw+Z70RgcfHttvVjVWOG49ug2LCI9G/cbzk+i+a0w4LdpxklOiD08BvrBWG8+GqNM6TjwzWRyuR6Gjf0a7C5f6B28Eb+Tfm+lKYZJmsmboplZRGDWMag8LzDlv7AR8+FtvTAQ6Z7OzTRHdErFv6yjD0jybZS+SEkzGsYJGWHm5pNiTEebJEWin6H6RfVot2CbZJcWy/hk6Y2wHoK3QGtHq2vFo6iUYKWxcCR3DyBoQYPN6L3xm2S97DNNX8J9PRo7/G2qAaDI+7I0D2uQ35YWc7m2GVJwAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAAA2ElEQVR4Xu2SoQoCQRCGR9QgiIJWw2GzWwWLb2G3mG0msZrEYDVc9Qnkum9gFnwHRfT/HRd25zzuMN8HX7gZ5t9h90RK8pjCHTzCpVefwaH3HdCCL3iHXdO7wRNMYDNsKT14/hqFrQ/ciOFr2yBt0ebFNjx4agL7pi4VuBIN4ClZuIDU+lvR4bltGGpwbIvkKhqQWq0oHKZ/UzSgA+u2SIoGxKL3kOIh+QERHNmiYwKfcCH6pJYD3NuiD4f4hNyC/76jKhq+gQ2vngkHBqKnMSiS3xuVlAS8AXVWJTS6phMrAAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAxCAYAAABnGvUlAAACWklEQVR4Xu3cMaiOURgH8CMpQlJKopTZpkzUHSwGCwYh2UhKKDJhMJqVxWqwSQmDsFksYmVRymKyiOfp/d7u+Y6ve93b+937ye9X/zrnOW9vZ3w63/udUgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgH/NtcivyP3I18juyJ2xJ5bvbunePSnnq+dW0pUyvo9eP891AICZcTFyqall07KnqS3Xj2r8NrJ1ND4bOTC/tOI+RV43tWwgs1kFAJgZx8r4CVNvUm05tkcOVvP6vYfLfPO2Gh5Fvje1x80cAGBV7S1dA5VNVWuuLQxgXxmuEZxkXeRDM1/otOxUGd/P1WoMADATXpSlN1CfF8jz6rlJHkS+tcWB9U1a27xNUjeQ+fy9ag0AYCZ8ibxsi1OUzdHRtjgF2Xgt1qylTaXb067Is2YNAGAm5Ddc2bS1brSFSnuq9rcnbNtK1xxtbhcGtpQTtpR7OhlZ0y4AAMyCDaVrWOrvvA5F9lfzoZwrf/78eiTyKvIwcmtUexc5MxrfHtVznuMTZeGTsLZJW+wbtpR7+tkWw4XIm7YIALBatpTu/rW5pr4S6m/a8pu6j5Hjo3k2j5mdpbsTbn3k6WhtKDfbQplvZE+3CwAA/6P31bi9E+1JZGPkeunuhMv74vKfrZfrh6agvzeu3hsAwH8pvxtb29R2VOP+jrY8AezlHwWmLfeVP6cCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAQH4DiKddrmJwUBgAAAAASUVORK5CYII=>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAaCAYAAADfcP5FAAABtElEQVR4Xu2VSyhFURSGl1CUIpREwkwpA4+RiZKxogyYytSImEvKSJkpmcpAeSQZ3CIpYzMKKRmYKCby+P/WOrUtN+5xH+p2vvq7e69/37332Wuvc0QSEoqUA+gDmoFGTZsWWwhiNxbLO4/QXNAvg7age6g9iA9Ar0E/L1RCEy7WL7owTyekC7pwsZzTAbW52KxoagZdnP1TFysI16IbqnDxf4PpKsjlzQSeCjdz542YTIrOs+YN8CYxHrhJdPCeN/7ACzTug6BX1MsIXuh3+X6h41IiWpH13gDrkmG1Ml08Gaar2Xkh1dCQ6KKeclGP/+fC4Zge887N+xWeCk9n3hsGJ+fbvNX6nDgVmeABGhMdtwR1W7zPPELvOfDS0gh1Qoei92cVGoYaRJ84gpNwsograMXaPLUz++WiPIEoXYxT5KdUxiYlX3PPTw5frIR3L7p3fuPhnaQ3FXhZkYKOrM3v3TFUC7WIboifFsLKYhUxfSPQk/NYZfSyhheVm9iGFqFLaNc8pvYE2hDdxC00LZqiZfN2zNs3LyeUQlXWrgnaUb/O2qzYsMLoRX2OSVehCQnFxyfy21NDElnpdgAAAABJRU5ErkJggg==>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABBCAYAAABsOPjkAAACg0lEQVR4Xu3drYtVQRgH4BERFA1+ocGyCAoLghhsBgXLBg0a/TNEZO0Gi4jBIIjJZhVBDdsMW8yKxSJWQYNBnZdzhjt3Ltd12fWew/o88GPOvOf8AcOc+UgJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgK15m/Mr50nOj5zdOSenvgAAYDDrOUtNLQZvAACMwJuc920xW2sLAAAs3q40fybtYlsAAGDxVlI3wwYAwEjdzbnSFrPlZMMBAMAoXEjdoK31ri0AADCcWMMWa9mK/Tl7qj4AwI4XA6J5uV99N6T4BfoozR7tAQDwX1itnmOQVtaGXcq5Ub0DAGAAMXNV+1k9X845VPUBABjYiZwXbREAgPG4nbpZte326Q95XX0HAMAG6t+hGzmfZte3tf2taDc//E0AAHa0vWlzg56nOUerfhy7Ufdr7ayaGTYAgE06k/MqdQO2U2lyxlkMwj6kbuPBWl/70rffmv69vgUAYIEepu6mgcjV1K1vK7cOxAxbKP31vgUAYIHWUnerwPOcw6nblHC2fxdr2K5X/e99fzt9TZP1ac+qeqm5FB4AIDvWtwf69mDqfpUeafqxBu5fuJNmL38vs3sAAIzASuoGbUUMFG9WfQAABnY8TdbH7ct5UL0DAGAE4ndr2ZEaO1YBABihcj7cuakqAACjEQO2z00t1raF01NVAAAGEQO2paYWZ8Kt5lzLWW7eAQAwAh/7NjYkzLsSCwCAAZV1bS+nqgAAjEZcm1UO9QUAYGRu5TxuiwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALB4vwF24WDfE/qvMwAAAABJRU5ErkJggg==>

[image14]: <data:image/png;base64,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>

[image15]: <data:image/png;base64,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>

[image16]: <data:image/png;base64,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>

[image17]: <data:image/png;base64,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>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPUAAAAZCAYAAADpN2icAAAJOklEQVR4Xu2ba6hnUxTAl1DkbTBkxswwRjJ55DFNXjePieSRMSE+iA98mPnAhMiHq0miSAgJN0leQ2kioekfNYRIGSNRlxgfJkTII4/9m33W/a+z/nuf/zl3bu6d2r9azd37rL3POWuvtffa+/xHpFAoFAqFQqFQKBT+Vx4MsoOvLBQMBwU5PMhIkJ3ql7ZycpAbfeVMAec+zVe2gHZ3B3k0yEJ3zYJx0Lk/yI7umoLOaok6Z7lrw2jTv2W25O+xc5BVvtLBPbgX9+TeKbDN8RJ1bnfXmpgrfTuc765ZVgR5KMi1QebXL80IjpZ0IIC3TZfJ1frcoqrsYXyWSN8nGNPJ8G8lvSC71y9tZYvE6zOGe4P8EORviQ92c/3yUL4O8qUp/xRkoynDXhL7v6oqzwnyj9QDCp0XJOowQOhscDo52vTv4R5jrm63IL9IfxCbBurXIG9Vf9PXn0Fe6V/eyrESbXNkVT5Xom32m9AYhL5ukbgyKFdKfJbrTB3Ouln6zsxkSnldkF1VaZrgOXhe9alUIBBgXF9u6igTgMNAB12FPijboMUnHpO+LfAJnuXHCY1uEBc9qb8Lk9XDQd4McqCpn3ZwjkuCHBLkK+kW1AcE+SPIqVWZF8ZwzFwKTndfkDXV38A90LtalSTqUNekk6Jt/54FQTa5OgbpoiCHSQzaXFAfJdFxNSthlUb34wmNaJtPpG6bnkTbsLLkIOAJfNrSB6hDvq9KElce6s6uyrz700H+CnKKKk0T+NNIkCclH9TnBHlN6hMQZRusOZiw0VXog7LaAq6ROKnbFVzHlIDvSiqomUyw93RPollwzC5BfXCQcYlpn2Ufqae+YxINuYupA1vG8Oj4lS7lDJ42/afACVb6SkMuqEkXueazAN7bOtC4DLbn+rBtAasNs/+r0n//QyX2ZTOgiyVmB8dUZSaktTI8Q7GgRwo7X9LpqzLiK1qSC2r1nRtcvU7GTZkMbdFJtdUsSG2BHpOfckdV17SdyZEK6hlP16C+QKKB1IFmSdphx6Xu3Klg04HSAdjbXBvGuAzvPwWrtKbFKXJBrY6nbfeVdECgQ4ABdknZpi1q61FXb9FAeVfarURsBehT5b365Rr3+IqW5IJaJ0YfXFdI1NeJKgVtU4FJ25+l3/a8IN8GOWFCo1tQM15kbcuqciqoiZl5MrhSzw9ymcQJEzunoH+yCba/xM4Z9ctTQ9eg1plwvfQPOUj7Ppf4ooo6DSsPaSQpJW3sXkoHk70JOoBOm1SsTf8enB6jN5ELalJg6tlPMygMzuUSn12DiZUCnd8k2oZBxzbs56xtmmByYl9NsNEXk0cKxg3HQ+cLdy3HE0FucnVkCKz89KETEP+yhVmqSh3JBTVBlQquXL0lp5Ort2B/dHwQevA7e07EOFPXk/67MD6PS+zPHpLqZKlxxHhTtuchnHt8aMpLJPrblNM1qHsSH5Z/7aBR97orI8ywymKJBj6uKuvqZ1/M6+Ro07+HAFvgKx25oMZG1HMIQ/ACExp1pM2APfS5rG1WSrSNd/IUZEAcQhJoH0h+pX9boh7v6wM1B8GWSnGZFF+SeE8mKT00TGUibZhJQa0TLbZqgvMSe04EvP9dMujrek8b1CNVHWOtULZbJ3yoZ8oc0GLvKWeyQe0PZXwwqHNb1Ol1NtSgJj1S0OlJ1Jlt6j1t+rfQlz3QyuHfQ9GgZp9rsc+h9+cQxaKpIxNCF0jPaNeUIuN4a2TQIaeTmRLUJ0mc9Pga0QTnImRia2XwM1wq/U4FtYX7cmiIDn6jPFPVIWRG+MVkJ85Guga1DphdIUGDgdkHrLMr6vTsgUCNY++tQW33SSna9G/h1PUjX5kgF9Q9SQ+kfw7+9imVBvVkZmXffwpWd3TsyXAOUtDPJOqPBTmifrnGbb6iJbmg1hTVB6D6QdNBX1Pb3CEhW0L75SCHxgDP7ekS1Ksk7ufHpW8DG9R8/sIHdEyRZ831KaNrUOuhQy6o9eVZrbwzatCp07PaU04FNTr+HpY2/VuYJUd9ZYJcUDOLpwZSB8eW/f01qHuu3kKajT18uq3960HgQhl0bO3/e1fvYe/PbwIIavaFpNu029MqGR7xFS3JBTXPiW04wbfwJQX9pklc3zHVNrUA8K6cf9jvyLnD1KkI6nlVnZ24KX9nysD4EkN8utSxnfLVelhQ40T212YLgnwjg6d7HA5Z59ZUw7JHVfdKVdb9jk1L0WG/iI4dhDOlnwVAm/4tPRl0shS5oF4qMcX1zoOunnYDtvHtT6zq7GdAb9eeRB3vWDrwvmwdSlexjaYuxYuSnigfkNj+Qon9cphIeqgHgF3JBTXjzbjZ7RYw/uhb5yajmGvK6iuptmNSb8uPVJ4yZWDblHp3oC0/G2ZVJxW3tAlqfIKJhYNfCzr4E31gk0+lvm3VBcwvFNvMsKDm9I+Hs4dDGGBUFSrQ2WTKpLs4u3UMDEt/fKpR0OFzjIIOs5vV4RCD/u1BXNv+AQdZ6epy5IKaPkhv/em5fy5s49sz2NhmjqnzdtV2diXSzIPJROGdqbO/otKziVFTl4LTbx9owJgywdCHyoaaRjdyQQ2Mm//xSU/qXzy4tk4GDz15d7vF0KCwPz7hXWjHD3IIbpV3pDl48DH65/kUfIuVtyfdg5rnQMcGNXHGOCssWixAfiKZNOoIXrixfXmO4EnTPMzkDMRzEldpv3IDRsFQ7GXR984I6LCvQEc/FXDiaNF+bs3UN/UPvKsGTw5vBxXvmPwclvd9WeL7pw5hqOMaOujSxpOyKys67dZLzFa4/6VSX4X4xPW8DKbQNouZLnRC9OK3C2wBqOeTEX+PSf35ed/rg7wRZH9Tz3ijj9CWsaetokHu768yDL4Z40ebJWZcqyWeK2h74sLHDfECjAtlxm+LxK8Jy6sy/s2zs8e/U+LPszmN/11m2H8IIXiWSfxPBSvcNcsiid9sMZBNpywMIjrMqDmdHMP6x5jbsup4cD7elx/M8P45uIYOul0CjhSR96GtXTU8pPLYC+ee7a7NdBhvxo3nZ9y6sC2+0gb2vKdL/Pk0MKkQzH5yT4HOYqn/iMq20+edJbHP1AJUaAF7MJvyFAqF7RxS86YVr1AobEeQqo36ykKhsP3C99fcZ4xCoVAoFAqFQqFQKBS68h+6cbm7n7DuxwAAAABJRU5ErkJggg==>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAaCAYAAAAjZdWPAAABQElEQVR4Xu2VPUsDQRCGR6Jg0C4gqIUQKysLAzaWNjY2lpa2Ntr4C1LYiWW6FHb+ArEI2PgHRBCLw0awsbISP97ZuZPLK7shzSTFPvAQ7p1bdo4MuyKZTGbq6MATDp2YgcfwBh7CV/g89EaEB/jDoRMH8AvOlc9r8Kn8TaINDzh0Qve+o2wHFnCV8j9mxRZ2ueCAjobufUv5FvyGu5SH+dEFdT/EFnixLLZvP5JfUi7zYsVzsb9nHS7BRv0lQuu6ZhxTjGqa84DOTAH3KPci1lwsD+jAf8I2F5yINRfLA9dixUmxKLb/FeUbZX5KeaCQ4aZbkp7pe/gypqPQ/QeURU8PRRdUZ6Q2vF+refEI3yk7gxdiR+I/qqYXxOanupU8qW7EZvm8Cd8kcSPql6yIzdakOYI9uC3pEc1kMpnMlPILVrBLLgxKVoAAAAAASUVORK5CYII=>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAaCAYAAAAjZdWPAAABq0lEQVR4Xu2WvytFYRjHH6GILEoh3WKQhYGysMhiYbAoG5uUWCxWA5OUxWawyR8gwy2Dv0BK1GFRFiks8uP7Pe85t3Ofznt+3EOk91Ofbvf7nLf3ufd97jlXxOFw/DlG4KoOC7IFt3UYQx1chidwHt7D66orLFzATx3WSCfcg8ewX9XimIXvsDF4X4JXwWsibLiswxwMivmm2CybzgP3PlPZGPRgt8orNIhZuKkLGeDRjsJnuKFqWeB67n2q8mH4ASdV7s8PF0R9EbMgjTl4Cxdgs6rlgafCfQ8s+a7KpUlMkT8YHk8f7ID10YsUbJCNsmE2XpS0pnXuw5nx4JTKk2gTMw7nYo63CLbmbLkPB/4N9upCCi1wBV7CGVXLg605W+5zJKZYBI4Tm3+Q/PPdKmb/Q5UPBPmayn08qW66XZJn2gbXTMAnMSfAk8gK9y+rzHr3IFwQ3iPZ8HSkVgQ+VF7hki7EwFN6VNk63BHLbyZsmt8M5yd8Kn0HPZLt9hk+EcPRGhIzaqXKFQp+ki4xs/XbLMJ9MQ+rWkb0fzEOb+BdRrP8y3M4HI4f5gtl91re1YNjLQAAAABJRU5ErkJggg==>