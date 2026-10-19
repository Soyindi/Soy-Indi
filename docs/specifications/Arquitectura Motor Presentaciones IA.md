# **Arquitectura y Evolución del Motor de Presentaciones INDI (Ciclo 2026-2027)**

La evolución de las plataformas de productividad visual hacia modelos generativos e interactivos exige una reestructuración profunda de la arquitectura de software subyacente. El diseño del motor de presentaciones cinematográficas "INDI" para el ciclo 2026-2027, fundamentado en Next.js 16 App Router, React 19, Tailwind CSS v4, Drizzle ORM, Turso LibSQL y Cloudflare R2, representa un punto de inflexión en la ingeniería de interfaces de usuario. La transición desde paradigmas heredados basados en coordenadas espaciales absolutas hacia sistemas fluidos, semánticos y orquestados por agentes de inteligencia artificial requiere resolver desafíos críticos de rendimiento perimetral (*edge compute*), concurrencia de datos y renderizado paralelo.  
La presente investigación establece el estado del arte y define la arquitectura técnica definitiva a través de cinco pilares estratégicos, proporcionando las bases algorítmicas y heurísticas para consolidar un producto estéticamente superior y tecnológicamente inigualable.

## **Pilar 1: Arquitectura de Motores de Presentación Web (Benchmark & State of the Art 2025–2027)**

La elección del paradigma de renderizado en el navegador web dicta los límites absolutos de la fluidez cinematográfica, la indexabilidad, la accesibilidad de la información y la resiliencia en dispositivos heterogéneos.

### **Paradigmas de Renderizado en el Navegador**

La representación gráfica de documentos complejos en un entorno web requiere equilibrar la velocidad de carga interactiva con la fidelidad visual. En el estado del arte actual, se debaten tres enfoques arquitectónicos fundamentales.  
El renderizado basado puramente en el Modelo de Objetos del Documento (DOM), apalancado en tecnologías como CSS Grid, Flexbox y el soporte maduro de CSS Subgrid (enfoque adoptado por herramientas como Slidev o Marp), destaca por su excepcional accesibilidad nativa y tiempos de renderizado iniciales (*First Contentful Paint* o FCP) sub-milisegundo. Los vectores semánticos de HTML5 garantizan que la selección de texto para sistemas ATS/OCR y la lectura mediante tecnologías de asistencia sean impecables. Sin embargo, al escalar hacia transiciones de cámara cinematográficas, efectos de refracción geométrica o transformaciones 3D espacialmente complejas, la manipulación directa del DOM provoca ciclos destructivos de invalidación de diseño (*layout thrashing*), limitando severamente la capacidad de mantener tasas estables de 60 fotogramas por segundo.  
Como contrapartida, las arquitecturas basadas en WebGL, WebGPU o bibliotecas como Three.js con lenguajes de sombreado reactivos (enfoque utilizado por Pitch) delegan el procesamiento gráfico masivamente paralelo a la Unidad de Procesamiento Gráfico (GPU)1. La adopción del WebGPU Shading Language (WGSL) permite la ejecución de *Compute Shaders*, mediante los cuales una matriz de hilos organizados en *workgroups* ejecuta operaciones simultáneas sobre los búferes de memoria del dispositivo3. Esta arquitectura permite efectos visuales sin precedentes, calculando colisiones de partículas o fluidos en tiempo real identificando cada hilo computacional a través de variables integradas como global\_invocation\_id3.  
A pesar de sus capacidades gráficas, las arquitecturas puramente basadas en \<canvas\> enfrentan obstáculos prohibitivos para aplicaciones B2B de alcance global. La accesibilidad es artificial, requiriendo la sincronización frágil de un árbol DOM oculto para emular interacciones1. Además, la gestión de memoria en dispositivos móviles impone restricciones severas; implementaciones en el navegador Safari de iOS operan bajo un límite estricto de memoria WebGL que oscila entre 256 MB y 384 MB5. Exceder este umbral operativo con texturas de alta resolución desencadena invariablemente errores irrecuperables de pérdida de contexto (WebGL: context lost), lo que paraliza la ejecución del renderizador y exige recargas forzosas de la aplicación, erosionando la confiabilidad de la plataforma7.  
Para resolver esta dicotomía, INDI adopta una arquitectura basada en Árboles Sintácticos Abstractos (AST) serializados con renderizado híbrido de DOM, SVG y un modelo de *OffscreenCanvas* bajo demanda. En lugar de forzar toda la aplicación a residir dentro de un lienzo interactivo, la diapositiva es estructurada semánticamente en el DOM para la interacción estándar. Cuando se detecta una transición o un requerimiento visual de alta intensidad, el motor transfiere la propiedad del lienzo a un Web Worker mediante la interfaz OffscreenCanvas10. Esta delegación evita el bloqueo del hilo principal de JavaScript, permitiendo que la GPU interpole las texturas del DOM renderizado1. Al concluir el efecto cinemático, el recurso WebGPU se libera explícitamente y el estado recae sobre el DOM estático, mitigando el riesgo de desbordamiento de memoria en dispositivos iOS y garantizando compatibilidad universal con lectores de pantalla.

| Parámetro Evaluado | DOM Puro (Grid / Subgrid) | WebGPU / Canvas 3D | Híbrido AST \+ OffscreenCanvas (INDI) |
| :---- | :---- | :---- | :---- |
| **FCP y Latencia de Red** | \< 0.5s / Minimalista | \> 2.5s / Descarga de motores 3D pesados | \< 0.8s / Lazy loading de *shaders* |
| **Potencia Computacional** | Baja (CPU bound para animaciones) | Masiva (WGSL Compute Shaders) | Escalable (GPU asíncrono vía Workers) |
| **Estabilidad en iOS (Memoria)** | Excelente | Riesgo Crítico (\< 384MB Context Lost) | Alta (Liberación dinámica de memoria) |
| **Accesibilidad (a11y) y OCR** | Nativa 100% | Simulada (Alta fragilidad estructural) | Nativa (Canvas opera con pointer-events: none) |

### **Ingeniería de Exportación Vectorial y Determinista**

La conversión de documentos web dinámicos a documentos PDF de ultra-alta fidelidad constituye uno de los mayores vectores de complejidad en plataformas SaaS. Depender de arquitecturas basadas en navegadores sin cabeza (*Headless Chromium* o *Puppeteer*) introduce latencias inaceptables de varios segundos, además de requerir máquinas virtuales con alto consumo de memoria RAM, volviéndose económicamente insostenibles en implementaciones *serverless*.  
El análisis de rendimiento demuestra que el motor de composición tipográfica moderno **Typst**, compilado a binarios WebAssembly (WASM), representa el estándar de oro para esta operación13. Typst abandona el engorroso ecosistema de LaTeX y ofrece una velocidad de compilación asombrosa. En pruebas exhaustivas, Typst es capaz de procesar 500 páginas de contenido en apenas 157 milisegundos, operando con un costo de renderizado sostenido de aproximadamente 0.3 milisegundos por página, resultando hasta 28 veces más veloz que herramientas basadas en HTML a PDF como WeasyPrint y marginalizando totalmente a herramientas lentas como Apache FOP15.  
Contrastar Typst con bibliotecas cliente como Satori (@vercel/og) o jsPDF revela ventajas estructurales abrumadoras. Satori está diseñado para generar imágenes OpenGraph (típicamente 1200x630) y emplea un motor de diseño interno llamado Yoga que soporta un subconjunto severamente restringido de Flexbox16. Carece por completo de capacidades de diseño en cuadrícula (CSS Grid), manejo de saltos de página, pseudo-elementos y carece de soporte nativo para exportaciones documentales multipágina16. Por otra parte, jsPDF exige metodologías de dibujo imperativo (posicionamiento manual en coordenadas X/Y) que complican la creación de estructuras dinámicas y comprometen gravemente la trazabilidad del texto, dificultando su lectura por sistemas de seguimiento de candidatos (ATS) y algoritmos de reconocimiento óptico de caracteres (OCR)18.  
La ejecución de Typst en entornos distribuidos como Cloudflare Workers implica superar barreras inherentes a la arquitectura de memoria lineal de WebAssembly20. Typst depende de dos binarios principales: el compilador web (typst\_ts\_web\_compiler\_bg.wasm de \~8 MB) y el renderizador (typst\_ts\_renderer\_bg.wasm de \~5 MB)21. Para gestionar la carga de tipografías sin provocar excepciones de falta de memoria (OOM) en el entorno perimetral, la infraestructura debe implementar un sistema de archivos virtual (VFS) que utilice subconjuntos de fuentes tipográficas (*font subsetting*), cargando dinámicamente en el búfer solo los glifos requeridos por el contenido semántico del AST22. Este proceso permite exportar archivos compatibles con las normas de accesibilidad documental PDF/A y PDF/UA-1, garantizando compresión óptima de imágenes e incrustación vectorial inalterable24.  
Para lograr una interoperabilidad completa bidireccional entre el formato nativo de la plataforma y estándares abiertos (.pptx / OpenXML) o lenguajes de marcado como MDX (Markdown \+ JSX), la arquitectura se beneficia del ecosistema unified en el entorno JavaScript. Al orquestar los complementos remark (analizador Markdown hacia un árbol sintáctico mdast) y rehype (procesador HTML hacia hast), es posible construir traductores deterministas que transformen esquemas de datos serializados en plantillas de presentación o directamente en código fuente Tipst (.typ)26.

## **Pilar 2: Sistema de Plantillas Paramétricas, AST y Heurísticas de Diseño Visual**

La construcción de un motor visual generativo con calidades estéticas de grado agencial (al nivel de Linear, Pitch o Apple Keynote) depende inherentemente de la capacidad del sistema para desacoplar el contenido semántico explícito de su resolución visual. Si la arquitectura vincula una porción de texto a coordenadas espaciales absolutas, la refactorización algorítmica se vuelve insostenible.

### **Definición de un AST (Abstract Syntax Tree) para Diapositivas**

El diseño estructural del AST de "INDI" requiere un contrato declarativo polimórfico basado en JSON Schema que actúe como una única fuente de verdad documental. El paradigma imperante en sistemas heredados fuerza al usuario a elegir plantillas fijas de antemano. Por el contrario, un AST puramente semántico recopila los nodos de información (ej., métricas cuantitativas, prosa, activos multimedia) y permite que un motor heurístico en tiempo real resuelva dinámicamente su diseño espacial a través del concepto de diseño de tarjetas (*card-based layout*), garantizando el *reflow* natural de los elementos en diversas dimensiones y resoluciones sin ruptura visual30.  
Modelar tipologías informativas complejas sin incurrir en rigidez exige evitar contenedores inflexibles. Para resolver elementos de alta densidad cognitiva como cuadros de mando de indicadores clave de rendimiento (KPI Dashboards), *Bento Grids* asimétricos o citas editoriales, el AST abstrae los componentes asignando propiedades algebraicas de peso visual y "dominancia". Al procesar el árbol de nodos, la capa de visualización generada por React 19 y estilizada vía Tailwind CSS v4 emplea CSS Subgrid y unidades de contenedor condicionales para proyectar el AST en el DOM. El árbol declara *qué* existe y la heurística de diseño determina *dónde* y *cómo* habita el espacio.

### **Matemática del Color y Tipografía en Espacio OKLCH**

La gestión del diseño adaptativo a nivel corporativo exige abandonar los modelos de color limitados históricamente a RGB o HSL. HSL sufre de graves deficiencias de interpolación; dos colores con la misma luminosidad declarada en HSL pueden ser percibidos por el ojo humano con niveles de brillo radicalmente dispares31. Para resolver esto, Tailwind CSS v4 implementa de manera nativa el espacio de color cilíndrico OKLCH, soportando perfiles de pantalla amplios (Display P3)32. OKLCH emplea tres coordenadas analíticas: Luminosidad perceptiva (![][image1]), Croma o saturación (![][image2]) y Tonalidad (![][image3]).  
La generación algorítmica de temas visuales que sean inherentemente accesibles utiliza la coordenada predictiva ![][image1] combinada con el *Accessible Perceptual Contrast Algorithm* (APCA). A diferencia de las proporciones estáticas del estándar WCAG 2.2 que fallan sistemáticamente en paletas oscuras o modos inversos31, el modelo de apariencia de color SACAM (S-Luv Accessible Color Appearance Model) en el que se basa APCA comprende que el contraste no es matemáticamente lineal y depende estrechamente del peso y grosor tipográfico31.  
El motor de temas debe anclar (![][image4]) algorítmicamente la constante de luminosidad deseada para fondos y textos de la plataforma, manipulando exclusivamente el croma y la tonalidad para derivar esquemas monocromáticos o análogos. Se exige que el motor de temas procese el Contraste de Luminosidad (![][image5]) y garantice el cumplimiento estricto de las siguientes franjas perceptuales según la matriz de validación APCA:

* ![][image5] **90**: Considerado el contraste preferido para lectura fluida, garantizando la visibilidad de cuerpos de texto pequeños (ej. 14px a un peso normal de 400\)31.  
* ![][image5] **75**: Límite inferior para la retención de columnas de texto continuo (ej. 16px a peso 400\)31.  
* ![][image5] **60**: Nivel mínimo indispensable para el diseño de componentes fluidos e interfaces legibles (ej. 24px a peso 400\)31.  
* ![][image5] **45**: Nivel mínimo permitido para titulares de alto impacto en negrita, datos numéricos de Bento Grids o logotipos y diagramas vectoriales sin detalles finos (ej. superiores a 36px o 42px)31.

Para resolver la escalabilidad de visualización desde proyectores institucionales 4K (relación de aspecto 16:9) hasta dispositivos móviles (9:16), la tipografía fluida descarta las unidades puras de ancho de ventana (*viewport width*, vw). En su lugar, el diseño aprovecha la madurez del estándar CSS de *Container Queries* (@container). La función dinámica clamp() calcula el tamaño mínimo, el escalado ideal y el tamaño máximo tipográfico fundamentado en unidades cqi (Container Query Inline), de modo que un *Bento Grid* de KPI reduzca sus titulares de forma matemática y fluida antes de que ocurra un desbordamiento léxico.

## **Pilar 3: Generación Asistida con Inteligencia Artificial Multimodal**

La automatización del proceso de creación debe ascender más allá de la simple autocompletación de texto y plantillas rígidas. Una plataforma verdaderamente generativa depende de una arquitectura profunda de orquestación multi-agente que reaccione al contenido ingestado36.

### **Pipeline de Orquestación Agéntica (Multi-Agent Slide Generation)**

El diseño de la generación automatizada se desglosa en un canal secuencial operado por agentes especializados o mallas de inferencia LLM con perfiles delimitados:  
**a) Content Strategist Agent:** Este agente actúa como el arquitecto narrativo primordial. Recibe transcripciones crudas, análisis de datos financieros o temas amplios, e impone orden a través de la aplicación rigurosa de marcos de comunicación corporativa de alta eficacia, predominantemente el Principio de la Pirámide (*Pyramid Principle*) de McKinsey37. Este marco deductivo establece que la cognición ejecutiva requiere que la conclusión principal (la respuesta o recomendación) se presente al principio37. El agente estructurará la historia siguiendo el modelo SCQA (Situación, Complicación, Pregunta, Respuesta) y garantizará que los argumentos subyacentes se agrupen respetando el postulado de ser Mutuamente Excluyentes y Colectivamente Exhaustivos (MECE)39. Se descarta la sobrepoblación informativa priorizando la regla heurística de "un solo mensaje cardinal por diapositiva"40.  
**b) Visual Hierarchy & Layout Selector Agent:** Un controlador algorítmico determinista que inspecciona la densidad estructural provista por el Content Strategist. Si el agente detecta un bloque de texto particionado con tres deltas porcentuales asimétricos, aplica una función heurística que excluye inmediatamente plantillas de columnas simples o viñetas genéricas, forzando la resolución de la diapositiva hacia un esquema concept-bento o kpi-grid que previene activamente la sobrecarga cognitiva de la audiencia.  
**c) Copy & Micro-Metric Polisher Agent:** Encargado de la micro-edición final, este agente sintetiza frases verbales redundantes en métricas cuantitativas de alto impacto. Modifica los titulares de cada diapositiva para convertirlos en "Action Titles"; titulares activos de máximo 15 palabras que expresan de manera explícita la recomendación o la interpretación de la gráfica contenida, y no meramente su tema40.

### **Mitigación Activa de Alucinaciones y Grounding Documental**

La utilidad de las presentaciones corporativas exige precisión matemática; inventar un margen de beneficio operativo destruye la credibilidad. La conversión de documentos PDF densos o bases de datos a presentaciones debe proteger estrictamente la verdad factual subyacente (*grounding*).  
Se emplearán esquemas rígidos de salida estructurada (*Structured Outputs*) aprovechando el esquema JSON y herramientas de validación de tipos como Zod. Forzar al modelo fundacional (LLM) a devolver datos bajo tipos restrictivos, acoplado con una temperatura de inferencia baja (![][image6]), suprime casi completamente la entropía alucinatoria del generador.  
El procesamiento y la transferencia fluida de datos implican la implementación de *Server-Sent Events* (SSE) a través de los ejecutores perimetrales (*Edge Functions*). SSE provee un mecanismo unidireccional de transmisión (streaming) muy ligero sobre HTTP, permitiendo que la interfaz de React consuma parches parciales del AST a medida que el LLM los produce y renderice el diseño de las tarjetas en pantalla en milisegundos, erradicando los tiempos de espera bloqueantes frente a una pantalla de carga estática.  
La manipulación de informes financieros extensos genera cuellos de botella severos respecto a los límites y costos de la ventana de contexto (*context window*). La implementación activa de sistemas efímeros de *Prompt Caching* retiene los vectores computados en la jerarquía inicial del prefijo documental, permitiendo que las llamadas subsecuentes de la malla multi-agente reúnan el contexto almacenado sin recalcular la matemática de la atención del Transformer completo. Esto minimiza el tiempo de latencia al primer *token* y disminuye drásticamente el impacto económico de la inferencia, reduciendo en más del 80% los costos operativos sostenidos de los modelos a escala.

## **Pilar 4: Interactividad en Tiempo Real, Modo Presentador y Telemetría**

La plataforma materializará la interactividad mediante arquitecturas de doble pantalla, posibilitando telepresencias avanzadas e integrando un nivel de recolección métrica previamente reservado a sistemas web analíticos masivos.

### **Experiencia del Presentador (Dual-Screen Architecture)**

La disociación del hilo de presentación implica proyectar una "Vista de Audiencia" animada e impecable hacia una pantalla secundaria, al mismo tiempo que el orador coordina el flujo narrativo desde un dispositivo íntimo (la "Vista de Presentador"). Coordinar milisegundos de latencia en animaciones complejas requiere infraestructuras deterministas, resolviéndose idealmente mediante **Cloudflare Durable Objects** apoyados en frameworks sin estado orientados a eventos como PartyKit42.  
Un objeto duradero de Cloudflare actúa como un micro-servidor de máquina virtual efímero (*stateful serverless*), proporcionando tanto persistencia local inmediata (vía SQLite integrado) como un servidor y cliente de WebSockets estándar global42. Cada sesión de presentación es asignada dinámicamente a un único Objeto Duradero que se reubica geográficamente cerca del origen geográfico de la audiencia para garantizar demoras casi nulas y consistencia algorítmica perfecta42. Esto mitiga la inmensa sobrecarga arquitectónica de implementar y gestionar agrupaciones de Redis centralizadas y buses de mensajería (tipo Kafka) para la sincronización colaborativa y difusión de cambios de estado en tiempo real.  
Para salvaguardar la sincronización en entornos cerrados con restricciones perimetrales severas, la arquitectura puede desplegar canales de datos directos entre pares apoyándose en WebRTC DataChannels para mantener a salvo el modo presentador incluso bajo congestiones de tráfico en la capa de red global.  
El teléfono móvil del orador o tableta, ejecutando la plataforma como Aplicación Web Progresiva (PWA), aprovecha APIs nativas del navegador para consolidar un control absoluto:

* **Screen Wake Lock API:** Se solicita de manera imperativa una cerradura de activación de pantalla, anulando los temporizadores de suspensión inactivos del sistema operativo y garantizando que las notas y el cronómetro permanezcan visualmente accesibles durante toda la disertación.  
* **Fullscreen API:** Reclama la hegemonía de la pantalla del terminal ocultando las barras de herramientas del navegador de modo que se maximice la retención visual de la interfaz.  
* **Vibration API:** Implementa la retroalimentación táctil de telemetría inmersiva. Pulsos discretos asíncronos programados (ej. ráfagas de vibración a los 2 minutos, 5 minutos o notificaciones de interrogantes desde la audiencia) previenen los excesos de tiempo permitiendo la concentración del orador en el contacto visual en lugar del cronometraje manual de la vista remota.

### **Analíticas Perimetrales de Audiencia**

Extraer información accionable como la tasa de permanencia en diapositiva individual (*dwell time*), tasas de abandono en puntos de fricción cognitivos o mapeo de clics sobre artefactos infográficos interactivos requiere mecanismos de ingesta de volumen excepcionalmente altos sin degradar el tiempo de latencia visual principal.  
La base de datos **Turso**, un *fork* adaptado de SQLite conocido como LibSQL orientado al modelo perimetral (Edge), proporciona la infraestructura óptima44. Operar el protocolo sobre HTTP mediante Drizzle ORM permite que las lecturas a nivel mundial se realicen con latencia neutralizada gracias a las Réplicas Embebidas (*Embedded Replicas*) sincronizadas nativamente con la nube46.  
Tradicionalmente, realizar analíticas por acumulación desencadenaba un bloqueo total de concurrencia en la máquina SQLite dado su diseño mono-escritor (*single-writer bottleneck*) que provocaba los temidos bloqueos SQLITE\_BUSY47. Sin embargo, la reciente iteración de arquitectura en Turso expone capacidades beta para **Escrituras Concurrentes**48. Estas escrituras admiten que múltiples transacciones procedan al unísono manteniendo niveles inmensamente altos de rendimiento de ingestión volumétrica, multiplicando el volumen total por cuatro veces frente a la implementación convencional y evadiendo el cuello de botella central48.  
Con la Privacidad por Diseño (Cumplimiento GDPR), el SDK de Drizzle empleará la API de lotes (db.batch()) aglutinando los recuentos atómicos no vinculados a datos personales identificables antes del cierre de pestaña y despachándolos como una matriz de transacción paralela que asegura el principio ACID46.

## **Pilar 5: Entregables y Recomendaciones de Implementación Práctica**

### **1\. Matriz Comparativa Sintética del Estado del Arte**

| Plataforma | Arquitectura Base / Pipeline Visual | Flexibilidad Algorítmica y Gestión de Plantillas | Madurez y Orquestación de IA | Limitaciones y Déficits Arquitectónicos |
| :---- | :---- | :---- | :---- | :---- |
| **Pitch** | Ecosistema WebGL (ClojureScript) / Lienzo de renderizado fijo | Alta libertad posicional manual, pero deficiente en escalabilidad fluida (*reflow*). | Integración temprana, limitándose a poblar plantillas sin comprender densidades cognitivas. | Inmenso consumo de RAM GPU provocando desconexiones de contexto en móviles de gama media/iOS9. |
| **Gamma** | Modelo de Tarjetas DOM Web Nativo fluido30 | Excelente separación semántica. Auto-escalabilidad sin requerir reordenamiento de píxeles30. | Muy Alta. Orquestación multi-modelo robusta que edita el tema dinámicamente según la intención36. | Carece de exportación PDF tipográficamente absoluta36. Limitaciones severas de edición pixel-perfect por el encierro del sistema. |
| **Tome** | React / DOM estructurado condicionalmente | Rígido. Cuadrículas en formato baldosas impidiendo la asimetría real. | Alto potencial de generación *Prompt-to-deck*, pero incapaz de iteración algorítmica microscópica. | Monotonía estilística (excesivamente orientado al modo oscuro), infografías limitadas. |
| **Slidev** | Vue \+ analizadores de Markdown nativos al DOM | Completa libertad al desarrollador empleando código CSS puro, pero anti-intuitivo para ejecutivos. | Ausente. Depende de integraciones de terceros. | Inutilizable para usuarios empresariales sin capacidades técnicas de marcado, curva de fricción paralizante. |
| **INDI (Propuesto)** | **Híbrido declarativo AST \+ OffscreenCanvas WebGPU \+ Exportación WASM Typst** | **Polimorfismo absoluto empleando CSS Subgrid, OKLCH paramétrico y heurísticas APCA.** | **Sistema de Malla Multi-Agente anclado al Pyramid Principle de McKinsey.** | **Elevada complejidad infraestructural inicial y barreras técnicas en sincronización perimetral de bases de datos distribuidas.** |

### **2\. Contrato de Datos Determinista: Ejemplo de JSON Schema (Draft 2020-12)**

La definición modular de las diapositivas polimórficas reside en este árbol sintáctico abstracto que repudia los posicionamientos X/Y para privilegiar las heurísticas intencionales.

JSON  
{  
  "\$schema": "https://json-schema.org/draft/2020-12/schema",  
  "\$id": "https://indi.com/schemas/slide-ast.schema.json",  
  "title": "Polymorphic Slide Abstract Syntax Tree",  
  "description": "Contrato de datos semántico y agnóstico de disposición espacial",  
  "type": "object",  
  "properties": {  
    "telemetry": {  
      "type": "object",  
      "properties": {  
        "slideId": { "type": "string", "format": "uuid" },  
        "dwellTimeTargetMs": { "type": "integer" },  
        "semanticIntent": { "type": "string", "enum": \["executive\_scqa", "bento\_dashboard", "timeline\_roadmap", "testimonial", "comparison\_delta"\] }  
      },  
      "required": \["slideId", "semanticIntent"\]  
    },  
    "narrative": {  
      "type": "object",  
      "properties": {  
        "actionTitle": {   
          "type": "string",   
          "maxLength": 120,   
          "description": "Aplicación del principio deductivo de McKinsey: Respuesta y conclusión concisa, sin preludios crípticos."   
        },  
        "supportNodes": {  
          "type": "array",  
          "items": {  
            "type": "object",  
            "properties": {  
              "nodeType": { "type": "string", "enum": \["quantitative\_metric", "qualitative\_prose", "chart\_vector", "media\_asset"\] },  
              "payload": { "type": "object", "description": "Diccionario polimórfico de datos" },  
              "visualWeightDominance": {   
                "type": "integer",   
                "minimum": 1,   
                "maximum": 5,   
                "description": "Define la densidad gravitatoria del nodo para el motor CSS Subgrid fraccional (fr)."  
              }  
            },  
            "required": \["nodeType", "payload", "visualWeightDominance"\]  
          }  
        }  
      },  
      "required": \["actionTitle", "supportNodes"\]  
    },  
    "styleHeuristics": {  
      "type": "object",  
      "properties": {  
        "oklchHueLock": { "type": "number", "minimum": 0, "maximum": 360 },  
        "apcaReadabilityTarget": { "type": "integer", "enum": \[45, 60, 75, 90\] }  
      }  
    }  
  },  
  "required": \["telemetry", "narrative"\]  
}

### **3\. Algoritmo Heurístico en TypeScript (Resolución de Layout Visual)**

Esta función determinista inspecciona matemáticamente los componentes semánticos y deriva estadísticamente la disposición visual ideal que evite ahogar al usuario en un torrente informativo incomprensible.

TypeScript  
import { z } from 'zod';

// Representación abstracta inferida de los tipos de nodos del AST  
type NodeType \= 'quantitative\_metric' | 'qualitative\_prose' | 'chart\_vector' | 'media\_asset';  
type ContentNode \= { nodeType: NodeType, visualWeightDominance: number };  
type AbstractSlide \= { intent: string, supportNodes: ContentNode\[\] };

enum LayoutHeuristic {  
  HERO\_STATEMENT \= 'layout-hero-statement',  
  KPI\_BENTO\_GRID \= 'layout-kpi-bento',  
  SPLIT\_COMPARISON \= 'layout-split-comparison',  
  SEQUENTIAL\_TIMELINE \= 'layout-sequential-timeline',  
  MASONRY\_DYNAMIC \= 'layout-masonry-dynamic'  
}

/\*\*  
 \* Motor heurístico de evaluación topológica de diapositivas que mapea entropía semántica  
 \* hacia contenedores funcionales basados en la metodología SCQA/MECE.  
 \*/  
export function inferOptimalLayoutStrategy(slide: AbstractSlide): LayoutHeuristic {  
  const totalNodes \= slide.supportNodes.length;  
  const quantitativeMetrics \= slide.supportNodes.filter(n \=\> n.nodeType \=== 'quantitative\_metric').length;  
  const vectorsAndCharts \= slide.supportNodes.filter(n \=\> n.nodeType \=== 'chart\_vector').length;  
    
  // Regla 1: Síntesis Ejecutiva C-Level  
  // Impacto deductivo inicial o final que requiere absorción instantánea sin distractores.  
  if (totalNodes \<= 2 && slide.intent \=== 'executive\_scqa') {  
    return LayoutHeuristic.HERO\_STATEMENT;  
  }

  // Regla 2: Extracción Cuantitativa Masiva  
  // Superado un umbral de deltas numéricos, las listas causan ceguera. Se impone el diseño de cuadros.  
  if (quantitativeMetrics \>= 3 && totalNodes \< 7) {  
    return LayoutHeuristic.KPI\_BENTO\_GRID;  
  }

  // Regla 3: Tensión o Dualidad Semántica (A/B)  
  // Contrastes absolutos, balances financieros o escenarios pasados y futuros.  
  if (totalNodes \=== 2 && (vectorsAndCharts \> 0 || slide.intent \=== 'comparison\_delta')) {  
    return LayoutHeuristic.SPLIT\_COMPARISON;  
  }

  // Regla 4: Continuidad Histórica  
  if (slide.intent \=== 'timeline\_roadmap' && totalNodes \>= 3) {  
    return LayoutHeuristic.SEQUENTIAL\_TIMELINE;  
  }

  // Regla 5: Arquitectura Asimétrica Diversa  
  // La entropía es elevada. Diversas densidades (gráficos \+ métricas \+ texto) forzan un reflow en albañilería o bento mixto.  
  const hasMixedTopology \= new Set(slide.supportNodes.map(n \=\> n.nodeType)).size \> 2;  
  if (totalNodes \> 3 && hasMixedTopology) {  
    return LayoutHeuristic.MASONRY\_DYNAMIC;  
  }

  // Protocolo a prueba de fallos priorizando reflow automático responsivo.  
  return LayoutHeuristic.KPI\_BENTO\_GRID;  
}

### **4\. Roadmap Estratégico de Evolución Técnica (12 Meses)**

El proceso constructivo de INDI demanda hitos iterativos centrados en dominar las infraestructuras perimetrales (*Edge computing*) antes de escalar las capacidades lógicas.

#### **Fase 1: Transición hacia una Fundación Semántica Pura y Motor Perimetral (Meses 1 \- 4\)**

* **Diseño del Traductor AST Bidireccional:** Definir formalmente la interfaz polimórfica JSON Schema y desarrollar conversores sintácticos robustos empleando el ecosistema unified. Se orquestarán tuberías de datos utilizando remark para análisis léxico Markdown a mdast, operando transformaciones hacia hast con rehype, abriendo la integración natural con anotaciones en texto plano y exportaciones ricas interoperables27.  
* **Adopción Relacional Distribuida y Lotes ORM:** Desplegar Drizzle ORM sobre la infraestructura Turso/LibSQL. Aprovechar nativamente el protocolo sobre HTTP para agrupar las inserciones de metadatos colaborativos y transiciones usando los métodos de agrupación transaccional (db.batch()), sorteando eficazmente la latencia entre dominios47.  
* **Sistematización Tipográfica y Color APCA:** Definir el sistema universal de cálculo de lumínico OKLCH dentro del analizador interno de Tailwind CSS v4, anclando rutinas de diseño que calculen y certifiquen rigurosamente los índices APCA (![][image5] 90 a 45\) en la generación de todos los esquemas de color algorítmicos31. Implementación de métricas de legibilidad fluidas usando clamp() con restricciones dimensionales en contenedores cqi.

#### **Fase 2: Inyección de IA Cognitiva y Renderización Tipográfica Vectorial WASM (Meses 5 \- 8\)**

* **Malla Multi-Agente Basada en Reglas (Prompting Deductivo):** Integración de los agentes de análisis estructural adiestrados sistemáticamente para obligar el uso del Marco del Principio de Pirámide (SCQA, MECE y jerarquía descendente) de Minto al procesar datos corporativos37. Implementación de esquemas Zod forzados (*Structured Outputs*) y despliegue del almacenamiento efímero de contextos (*Prompt Caching*) para abaratar iteraciones. La presentación se consumirá instantáneamente por el *frontend* invocando secuencias de Eventos Enviados por el Servidor (SSE).  
* **Dominio Absoluto de Exportación Tipográfica Typst:** Incorporar Typst como núcleo renderizador documental ejecutado íntegramente mediante binarios WebAssembly. Orquestar el sistema de archivos virtual para empaquetar conjuntos de fuentes parciales, evadiendo las fugas de memoria intrínsecas a librerías pasadas como jsPDF y salvaguardando la fidelidad absoluta que requieren las normas internacionales y protocolos corporativos (OCR inquebrantable, velocidad atómica a 0.3ms por diapositiva compilada)15.

#### **Fase 3: Sinfonía Gráfica y Telepresencia Síncrona a Gran Escala (Meses 9 \- 12\)**

* **Telemática e Ingestión Concurrente:** Habilitar a Turso para absorber millones de eventos estadísticos atómicos perimetrales mediante su función de Escrituras Concurrentes Beta48. Conectar simultáneamente Objetos Duraderos de Cloudflare que gestionen el estado persistente y manejen los túneles WebSockets entre el orador con la vista confidencial asegurada por Web APIs y el proyector esclavo42.  
* **Rendimiento Cinematográfico Asíncrono (OffscreenCanvas):** Desplegar finalmente el orquestador de WebGPU WGSL mediante Web Workers y *OffscreenCanvas*10. Esta integración garantiza aplicar *shaders* de cálculo masivo exclusivamente a efectos de transiciones efímeras, desactivando la superficie interactiva tan pronto el efecto cesa. Esta limpieza agresiva prevendrá drásticamente las fallas terminales del límite de 256MB en terminales limitados por el OS iOS Safari, blindando así la accesibilidad algorítmica y la estabilidad crítica de la plataforma6.

#### **Works cited**

> 1. Canvas UI puts WebGL shaders over real, interactive HTML, [https://flaviocopes.com/canvas-ui/](https://flaviocopes.com/canvas-ui/)  
> 2. WebGPU, [https://webgpu.org/](https://webgpu.org/)  
> 3. WebGPU Compute Shader Basics, [https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders.html](https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders.html)  
> 4. WebGPU Compute Shaders Explained: A Mental Model ... \- Medium, [https://medium.com/@osebeckley/webgpu-compute-shaders-explained-a-mental-model-for-workgroups-threads-and-dispatch-eaefcd80266a](https://medium.com/@osebeckley/webgpu-compute-shaders-explained-a-mental-model-for-workgroups-threads-and-dispatch-eaefcd80266a)  
> 5. Total Canvas Memory Use Exceeds The Maximum Limit \- Pqina, [https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/](https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/)  
> 6. Fix: Unity WebGL Build Crashing on Safari iOS | Bugnet Blog, [https://bugnet.io/blog/how-to-fix-unity-webgl-build-crashing-on-safari-ios](https://bugnet.io/blog/how-to-fix-unity-webgl-build-crashing-on-safari-ios)  
> 7. safari \- WebGL context immediately lost on iOS \- Stack Overflow, [https://stackoverflow.com/questions/79847768/webgl-context-immediately-lost-on-ios](https://stackoverflow.com/questions/79847768/webgl-context-immediately-lost-on-ios)  
> 8. WebGL memory increment issue and crash on iOS \- Unity Discussions, [https://discussions.unity.com/t/webgl-memory-increment-issue-and-crash-on-ios/894771](https://discussions.unity.com/t/webgl-memory-increment-issue-and-crash-on-ios/894771)  
> 9. "WebGL: context lost." error when backgrounding Safari, [https://bugs.webkit.org/show\_bug.cgi?id=261331](https://bugs.webkit.org/show_bug.cgi?id=261331)  
> 10. OffscreenCanvas \- Web APIs | MDN, [https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)  
> 11. OffscreenCanvas and Web Workers: Moving Browser Game Logic, [https://simplified.media/guides/offscreen-canvas-workers](https://simplified.media/guides/offscreen-canvas-workers)  
> 12. Rendering 3d offscreen: Getting max performance using canvas, [https://itnext.io/rendering-3d-offscreen-getting-max-performance-using-canvas-workers-88c207cbcdc2](https://itnext.io/rendering-3d-offscreen-getting-max-performance-using-canvas-workers-88c207cbcdc2)  
> 13. Typst Musings \- tarleb, [https://tarleb.com/posts/typst-musings/](https://tarleb.com/posts/typst-musings/)  
> 14. typst-wasm—Compile Typst in browsers, Node, and serverless, [https://forum.typst.app/t/typst-wasm-compile-typst-in-browsers-node-and-serverless-runtimes/9399](https://forum.typst.app/t/typst-wasm-compile-typst-in-browsers-node-and-serverless-runtimes/9399)  
> 15. I benchmarked 6 PDF engines — the fastest is not the one I'd pick, [https://news.speedata.de/2026/02/10/typesetting-benchmark/](https://news.speedata.de/2026/02/10/typesetting-benchmark/)  
> 16. vercel/satori \- Decision Hub, [https://hub.decision.ai/skills/vercel/satori](https://hub.decision.ai/skills/vercel/satori)  
> 17. OG Image Generation on the Edge | Matt Rothenberg, [https://mattrothenberg.com/notes/edge-og-images](https://mattrothenberg.com/notes/edge-og-images)  
> 18. Comparing open source PDF libraries (2025 edition) | Joyfill \- Medium, [https://medium.com/joyfill/comparing-open-source-pdf-libraries-2025-edition-7e7d3b89e7b1](https://medium.com/joyfill/comparing-open-source-pdf-libraries-2025-edition-7e7d3b89e7b1)  
> 19. A full comparison of 6 JS libraries for generating PDFs, [https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p](https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p)  
> 20. Understanding WebAssembly text format \- MDN Web Docs, [https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Understanding\_the\_text\_format](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Understanding_the_text_format)  
> 21. Building a Privacy-First Resume Editor with Typst WASM and React, [https://dev.to/kakutixyz/building-a-privacy-first-resume-editor-with-typst-wasm-and-react-1d13](https://dev.to/kakutixyz/building-a-privacy-first-resume-editor-with-typst-wasm-and-react-1d13)  
> 22. melt – Typst Universe, [https://typst.app/universe/package/melt/](https://typst.app/universe/package/melt/)  
> 23. Generate PDFs in the Browser with Rust, WASM, and Typst \- Reddit, [https://www.reddit.com/r/rust/comments/1mmus8i/generate\_pdfs\_in\_the\_browser\_with\_rust\_wasm\_and/](https://www.reddit.com/r/rust/comments/1mmus8i/generate_pdfs_in_the_browser_with_rust_wasm_and/)  
> 24. Automated PDF Generation with Typst, [https://typst.app/blog/2025/automated-generation/](https://typst.app/blog/2025/automated-generation/)  
> 25. Announcing Typst 0.12 | A new markup-based typesetting system, [https://www.reddit.com/r/rust/comments/1g76y9i/announcing\_typst\_012\_a\_new\_markupbased/](https://www.reddit.com/r/rust/comments/1g76y9i/announcing_typst_012_a_new_markupbased/)  
> 26. remark-mdx, [https://mdxjs.com/packages/remark-mdx/](https://mdxjs.com/packages/remark-mdx/)  
> 27. remark \- markdown processor powered by plugins, [https://remark.js.org/](https://remark.js.org/)  
> 28. GitHub \- remarkjs/remark-rehype: plugin that turns markdown into, [https://github.com/remarkjs/remark-rehype](https://github.com/remarkjs/remark-rehype)  
> 29. rehype-remark \- unified, [https://unifiedjs.com/explore/package/rehype-remark/](https://unifiedjs.com/explore/package/rehype-remark/)  
> 30. Instant Deck Restyling Across Entire Presentations with AI \- Gamma, [https://gamma.app/explore/content/guides/instant-deck-restyling-across-the-entire-presentation](https://gamma.app/explore/content/guides/instant-deck-restyling-across-the-entire-presentation)  
> 31. The Easy Intro to the APCA Contrast Method, [https://git.apcacontrast.com/documentation/APCAeasyIntro.html](https://git.apcacontrast.com/documentation/APCAeasyIntro.html)  
> 32. UiHue: Tailwind CSS v4 Oklch Palette Generator, [https://www.uihue.com/](https://www.uihue.com/)  
> 33. Color Contrast Accessibility \- What Is It & How to Check \- WebYes, [https://www.webyes.com/blogs/colour-contrast-accessibility/](https://www.webyes.com/blogs/colour-contrast-accessibility/)  
> 34. APCA in a Nutshell, [https://git.apcacontrast.com/documentation/APCA\_in\_a\_Nutshell.html](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html)  
> 35. APCA™ INTEGRATION COMPLIANCE, [https://git.apcacontrast.com/documentation/minimum\_compliance.html](https://git.apcacontrast.com/documentation/minimum_compliance.html)  
> 36. What Is Gamma, and How Does It Use AI to Build Presentations?, [https://gamma.app/explore/content/guides/what-is-gamma-and-how-does-it-use-ai-to-build-presentations](https://gamma.app/explore/content/guides/what-is-gamma-and-how-does-it-use-ai-to-build-presentations)  
> 37. The Pyramid Principle: What It Is & How to Use It \+ Example, [https://www.myconsultingoffer.org/case-study-interview-prep/pyramid-principle/](https://www.myconsultingoffer.org/case-study-interview-prep/pyramid-principle/)  
> 38. The Pyramid Principle | by Ameet Ranadive | Lessons from McKinsey, [https://medium.com/lessons-from-mckinsey/the-pyramid-principle-f0885dd3c5c7](https://medium.com/lessons-from-mckinsey/the-pyramid-principle-f0885dd3c5c7)  
> 39. The Pyramid Principle: How To Craft Coherent Explanations, [https://jeffkavanaugh.net/pyramid-principle-craft-coherent-explanations/](https://jeffkavanaugh.net/pyramid-principle-craft-coherent-explanations/)  
> 40. Learn the Pyramid Principle for PowerPoint presentations | thinkcell, [https://www.think-cell.com/en/blog/using-the-pyramid-principle-to-build-better-powerpoint-presentations](https://www.think-cell.com/en/blog/using-the-pyramid-principle-to-build-better-powerpoint-presentations)  
> 41. Consulting Presentations: MBB Slide Design & Structure Guide, [https://deckary.com/blog/pillar-consulting-presentations-guide](https://deckary.com/blog/pillar-consulting-presentations-guide)  
> 42. Cloudflare Durable Objects \- Stateful Serverless Functions, [https://www.cloudflare.com/products/durable-objects/](https://www.cloudflare.com/products/durable-objects/)  
> 43. What are Durable Objects? \- Cloudflare Docs, [https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/)  
> 44. Drizzle with Turso, [https://orm.drizzle.team/docs/singlestore/tutorials/drizzle-with-turso](https://orm.drizzle.team/docs/singlestore/tutorials/drizzle-with-turso)  
> 45. Build and Run a Web App using Turso, Drizzle ORM, and Express, [https://www.koyeb.com/tutorials/build-and-run-a-web-app-using-turso-drizzle-orm-and-express-on-koyeb](https://www.koyeb.com/tutorials/build-and-run-a-web-app-using-turso-drizzle-orm-and-express-on-koyeb)  
> 46. Reference \- Turso Docs, [https://docs.turso.tech/sdk/ts/reference](https://docs.turso.tech/sdk/ts/reference)  
> 47. Batches in SQLite \- Turso, [https://turso.tech/blog/batches-in-sqlite-838e0961](https://turso.tech/blog/batches-in-sqlite-838e0961)  
> 48. Beyond the Single-Writer Limitation with Turso's Concurrent Writes, [https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes)  
> 49. Batch API \- Drizzle ORM, [https://orm.drizzle.team/docs/batch-api](https://orm.drizzle.team/docs/batch-api)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAaCAYAAACHD21cAAAAuUlEQVR4XmNgGHnAEYhfA/F/JPwLiHcDsTCSOpxgDhD/A2IPdAl8QBCITwPxAyCWRpXCDzSB+C0QrwFiFjQ5vCCaAeK3cnQJQmASEP8GYht0CXwA5r+7QCyOJocXEPIfGxCzoguCAMx/RegSQMAIxE1ArIMuAQKg+MPlPxUgngvEnOgS+OIP5LxZDBAXYQBjIP7KgOk/SQaIpkdArIgkzuACxM8YEGnzLxA/gWIQGya+nAF7gI2CkQgA+LEntuOlP9kAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAABE0lEQVR4Xu3TP0tCURjH8SciKBIiBEkolGzR3oEQhDg0BrW3utpUIdHi2NDkElFtvYAImkRBh95BTkLUHtJgYH0f7rmmD8c/c/iDDxzOc+659/y5Iv8+EeziEGnMu/5lrLu2Nxk00cEDjnGPZ2zjCfn+6IEsoIQuTrA0XJYdfOJNPF+gD1fwjQNTC7OIR0fbQyngB6eYM7XB3OHMdm7hHS1smJrNtXjWfyHB28um35cVCZbbjx5VFT3xzDxN4mjjA5umNlXCCZS2x0U3Oms7V/EikyeI4gYxW9BcSrAHe7bgoseqt3HU/ZAEXlHDmqnpbTxHUcbfD0migS/c4ghXqCMnEx4Oo4OS2HdS8vcHzjLLyPwC1vkp/WcUoisAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAaCAYAAACD+r1hAAAA4UlEQVR4Xu3SsQtBURTH8SMMZCCDZJCymK2yGUkWym4yGVgtNguLf0IZrAaTv4KiZDMaJPG93ru69/WYDX71Wc65r3M6PZGfTwBJxL0Nv4zxcPU8vY9p4IaSt/EpU+yR8dR9E8Mac4Tsln8KOGOAFKooI2w+MlPDHSvM0MIGS0SMd++o/dUHTXHOq6KmHZDWj3T0/guxVxhhJ86KVsz9db4eQe1/Ffv+RVzQNmrvqNF7se8/xBE5VNDRDb/RZi2KCfJuT7I4oasL4lypj604H9WN3quZQNAsulF/rZr2z4/lCbTFJhO8bMfAAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAaCAYAAAAwspV7AAACTklEQVR4Xu2WwUsVURTGP8lKqchIsrAoRJByEyioKCFRQYtatApctdEQd5KRLvQ/CNoI4kZEWhi1CiwEFwUtCmlRuKjQIBQXtXMRofl9nnt5992ZeQa+Rch88APnnvvOnLnnOzMCufaRjpJT5EAcKJOqSB05GAfSdIl8JX/JZ1JbHN6zlH8Jlv8brLB/0gnynsyQiihWDh0jb8gzUhnFMnWR/CR9caBM8vkfxoFS6iF/SFccKJPukC1yLQ6U0hOU9pN8cIvcIEeimJeM3A3bd7I4tJN/hdS7a+VQrka/IZb3U1q/T7v1F+QueUCWSWuwR9Ok9Y+kl9wjH0i7i/v8L2GFXyazZJS8Q4bxs/x0nnwiEyiMsYZAwzBHqt36OGy6tF8ag02azxf6qYMMk3OwScycxjQ/6cQmySqSRzxFvpMzMK9swk7Rqw12cr7Nyi8/6XeDsAcROtFOtyehND/5p4tbquNXG1TUBff3GmkI9sRSfhX+i7wiV7DLayfLTzJr2AIv3VxFPIW1QMXNI9v84fvpMHkE60p3sCeh0E9NZMSt34QVpeJC3YclvQ7zgjyhtsRSew4h+X5qIRuwluqz9hjJSd25+W+Yn/pR8IZO4QsZcNdSM6wI+ULH732nyQy/Z5rY57Cct1HIL6modXct0w+59SLpA7xIFsg0OR7EVPAP2PgKtfkqiv1wlryFtUhTqmJUpL530hhsMv2EKb/a/RrWUj+xCekpVVza11trSlgTBwKpSLVA06hBCKVrtSmU/gvRUKXdL1euXLn+e20DZo9uUVSXXo8AAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAaCAYAAABctMd+AAABOUlEQVR4Xu2UrUsEQRiHf+IHeEERwQ8OEcEi2KwiKAYNB0bBIv4JFpvBYjeKZoOiXYtRsNpEEBGLGC2KH8/Lu8vtzu3thQkG94EH7uadnXnnt8NKFX/NIr7iT8YPvMLhzLwojvAbV8JCLEN4i49Yz5fimcE3PMOeoBbNhjzrnbBQwig2cAF7g1qOA/zE+bBQwJj8hBe4jrt4iYPZSSlp3g/ybsqYxDs8lHdrC97II7VoW+iUd598IavZjXrGqaRmY1u4hl3JWI407+2wIH9gD2fVuYlCrJt2eU/jMfbLX167Jgopu98WhWVrJzNW5YvbJiE17A4H5/BdrUcdly/8pGa+E3iPm8n/lCU8V+ZTsYwvan5LvuQvyrTf6fiJ8pta9zbnVL75Ne7jQGZOFBaXXdkRFURRUfEf+AXjoDzHuYnoHwAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAaCAYAAADhVZELAAACq0lEQVR4Xu2XS8hOQRjH/0KRez630OcW2bBw2yiRBUnKpRRbl51YsPFlIRt2yEIuC0UuZYeFUlgoJUoppT5SolBipfD/e85454wz5/Z+fSnzq1/ve+a8c96ZZ2aemQMkEonEwLOGvqJvarrWqg0qY+k+epb20Wn521GG0g30TOZWOjL3iwKG0NP0Kp2VXYtz9Addl13r4atoP12WlQ0WvfQZ3UVH0PX0JV3u/6iA4fQUPULnwup/o89hz4wyhV6jk72yCfQxLADTvfLR9BKd4ZV1wyhYw8sYBhugG9l3xzF6B+WjrgG9i3wfdtKfsGf6z8uhpbA/KFtMv+DvhihYJ+kYr6wNC+h1eplOCu6FzKHv6KGgfDNs1JcE5T6q4wLg0IC+haULTYhCttH5QdkO2MPChkyku9FZYk1QnRX0Hmy5zszfjqJB0zIO27IR1ka1NcZS+hTWZody0evMunnpN4rsd7oyvNEC5SIl8gf0BCywTXCdjwUlLK9CfVLfbsLyUy1i+aQpCsYm+ogehu0ebXBLIOx8m6Aof12kn1GdpHNojWqthvmkLvrj7fQJbAtVMu2GAyjufJugbIHlp8ZHilg+qctq2Czbi/KdoS6xzsfKY2hmaKAaHyeUDDW9us0n/mw5iPZLR7gcEHbeBUW7UBUKyEM6L7vWCtDWPP7PL0oYqHzicHlFz2yTZIXa0Q87CvjsoR/pQq9MW2z4H72wVKBPRw/sZFzraNFtPokRbsdNtkLVPQpL2OOyMs1EHTivoNNOnX3ew84gs7OyqfQ+/YT8a8oHWP1oH3VG0TRXRU1H51f6AuWHo6aog4vobXoencZXoWDcgr2K6Ih/AbYc/JO1vutVQCdYFzy3cxWpE/E/hwJyHJ11XoWWogZIL3T61HUikUgkEonEf8UvcVSQbJzaNtMAAAAASUVORK5CYII=>