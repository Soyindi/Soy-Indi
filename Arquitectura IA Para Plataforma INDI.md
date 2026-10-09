# **Diseño Arquitectónico y Protocolos de Fidelidad Semántica para Motores IA B2B (Plataforma INDI)**

El desarrollo e implementación de sistemas de Inteligencia Artificial para contextos ejecutivos y empresariales exige un distanciamiento radical de los enfoques probabilísticos convencionales. Hacia el año 2026, las plataformas de software como servicio (SaaS) destinadas a la gestión de talento y la comunicación estratégica —como es el caso de INDI— enfrentan un desafío dual: la tolerancia nula ante la invención de datos (alucinaciones) y la necesidad de una sofisticación estructural que iguale o supere los estándares de las consultoras de primer nivel (Tier-1). Los modelos de lenguaje de gran escala (LLMs), por su naturaleza fundamental, son sistemas continuos y probabilísticos entrenados para priorizar la fluidez semántica, no motores de deducción lógica clásicos basados en tablas de verdad booleanas1. En consecuencia, su tendencia intrínseca es completar patrones, lo que en el diseño de un currículum o una presentación de directorio se traduce en la peligrosa fabricación de métricas, títulos o ingresos.  
Para resolver estas problemáticas estructurales, la arquitectura del sistema debe abandonar la generación de texto libre en favor de transducciones semánticas rigurosamente constreñidas por contratos de datos. Este documento disecciona las metodologías algorítmicas, cognitivas y narrativas requeridas para optimizar los motores de INDI, abordando desde la verificación matemática de hechos hasta la psicología del diseño de información para audiencias C-Level.

## **Arquitectura de Grounding Estricto y Erradicación de Alucinaciones**

La mitigación algorítmica de alucinaciones en modelos de frontera (Gemini 2.5 Pro, Claude 3.5 Sonnet, GPT-4o) ha evolucionado de simples heurísticas de *prompting* ("no mientas") a marcos arquitectónicos de verificación estructurada y abstención calibrada. En tareas de generación de formato largo o reescritura de historiales profesionales, los enfoques tradicionales como *Chain-of-Thought* (CoT) o el ajuste de instrucciones (instruction-tuning) han demostrado ser insuficientes, ya que el modelo a menudo utiliza el razonamiento intermedio para reforzar y justificar sus propias premisas erróneas, desencadenando un "efecto de bola de nieve" (snowballing issue) donde una alucinación temprana corrompe todo el documento2.

### **Fidelidad Causal Estricta y Ejecución Factorizada (Chain-of-Verification)**

Para forzar al modelo a operar como un transductor semántico fiel, la arquitectura de INDI debe implementar el marco metodológico *Chain-of-Verification* (CoVe). Esta técnica divide el proceso deductivo del modelo en cuatro fases deliberadas: la generación de un borrador inicial, la planificación de preguntas de verificación independientes sobre los hechos extraídos, la ejecución de dichas verificaciones y, finalmente, la corrección del borrador2.  
La implementación requiere una atención crítica a la estrategia de ejecución. Las investigaciones empíricas demuestran que si el modelo verifica sus afirmaciones en el mismo contexto en el que generó el borrador (enfoque "Joint"), es altamente susceptible al sesgo de confirmación algorítmica, repitiendo la alucinación2. Por lo tanto, el sistema debe ser instruido mediante meta-instrucciones para emplear una **Verificación Factorizada con Revisión Cruzada (Factor+Revise)**. Bajo este paradigma, el modelo audita cada afirmación fáctica generada respondiendo preguntas de verificación de forma independiente. Los datos demuestran que los LLMs responden preguntas de verificación dirigidas e independientes con aproximadamente un 70% de precisión, en comparación con solo un 17% cuando los mismos hechos están embebidos en una generación narrativa extensa5. El impacto de la variante "Factor+Revise" eleva significativamente las métricas de precisión factual (FactScore) de un 55.9 en escenarios base a un 71.42.  
Las directivas del sistema en Gemini o Claude deben incorporar instrucciones de **Abstención Determinista**. Si el texto de origen provisto por el usuario en INDI no declara una métrica cuantificable para una afirmación, se debe prohibir explícitamente la inferencia estadística de valores plausibles. La directiva maestra debe estipular: *"Si la afirmación carece de anclaje empírico en el documento fuente, el modelo debe invocar inmediatamente tokens de abstención y anular el campo correspondiente."*

### **El Patrón "Extract or Flag" y Control por Structured Outputs**

Para materializar esta abstención y evitar que un input como "Lideré al equipo de ventas" se convierta en una alucinación como "Lideré un equipo de 25 personas y aumenté las ventas un 40%", la arquitectura no debe depender de texto plano, sino de **Structured Outputs** (Salidas Estructuradas) forzadas mediante esquemas JSON validados, como los soportados por Pydantic o directamente mediante la configuración output\_config.format configurada en type: "json\_schema"6.  
El patrón de diseño *Extract or Flag* (Extraer o Señalar) altera la función de recompensa subyacente del *prompt*. En lugar de presionar al LLM para que genere viñetas perfectas y completas (lo que incentiva la fabricación de datos), el esquema JSON exige que el modelo audite la incompletitud de la información. Mediante el uso de esquemas que fuerzan el modo estricto (strict: true en Claude o soporte nativo en Gemini 2.5), el modelo recibe una gramática compilada que restringe su espacio de generación de *tokens*8.

| Componente del Esquema JSON | Función en el Patrón "Extract or Flag" | Comportamiento Determinista del Modelo IA |
| :---- | :---- | :---- |
| action\_verb | Identificar la acción núcleo ejecutada. | Extrae el verbo de mayor impacto (ej. "Orquestó"). |
| core\_responsibility | Describir cualitativamente el proyecto. | Sintetiza el contexto empírico aportado. |
| extracted\_metric | Aislar valores numéricos (\$ o %). | **Extrae null** si no existe un número explícito en el origen. |
| needs\_metric\_flag | Booleano de autoevaluación algorítmica. | **Evalúa a true** si el contexto denota impacto pero carece de datos. |
| smart\_placeholder | Proposición asertiva para el usuario final. | Genera: "\[Cuantificar el % de reducción en latencia o costos operativos\]". |

Este mecanismo transforma un problema de procesamiento de lenguaje natural en una interacción de validación colaborativa. La plataforma INDI, al recibir un needs\_metric\_flag: true, puede desplegar una interfaz de usuario asíncrona que invite al ejecutivo a ingresar la cifra exacta, salvaguardando la integridad del documento y educando al usuario sobre las expectativas del mercado12.

### **Autoverificación en una Sola Pasada (Self-Consistency Compacta)**

Dado que las llamadas múltiples a la API introducen latencia y costos, se puede inducir una *Self-Consistency* compacta en un solo *prompt* obligando al modelo a externalizar su cadena de razonamiento dentro del mismo objeto JSON antes de emitir la salida final. El contrato estructural exige un campo previo llamado \_verification\_scratchpad donde el modelo debe enlistar explícitamente las entidades (empresas, cargos, métricas) extraídas del texto del usuario y cruzarlas contra su borrador interno14. Solo después de que este campo valida la intersección entre el borrador y el origen, el modelo tiene permitido escribir el campo final\_output. Esto actúa como un freno algorítmico contra el abandono de la estructura y la adición de ruido externo4.

## **Substracción Ejecutiva y Redacción C-Level ("Show, Don't Label")**

La comunicación orientada a directores (Board of Directors) y perfiles C-Level difiere drásticamente de la escritura técnica o académica. Los ejecutivos procesan la información bajo una severa presión de tiempo y con una carga cognitiva optimizada; un socio director puede evaluar un documento de cincuenta diapositivas en cinco minutos leyendo exclusivamente las posiciones de alta jerarquía16. La principal falla de los LLMs estándar es su verbosidad y su insistencia en el uso de meta-etiquetas descriptivas (ej. "Introducción:", "Resumen:", "Objetivo:"), lo cual no solo delata la naturaleza automatizada del texto, sino que insulta la inteligencia del lector al explicar la anatomía del documento en lugar de entregar su sustancia.

### **Erradicación de Meta-Etiquetas Redundantes**

La doctrina de diseño *Show, Don't Label* (Muestra, No Etiquetes) dicta que la función de un bloque de contenido debe ser evidente instantáneamente por su posición espacial, su tipografía y su contenedor visual, haciendo que la etiqueta textual sea obsoleta18. Para lograr esto, el motor de INDI debe desvincular el contenido de la presentación, generando flujos de datos puros que el *frontend* renderizará utilizando paradigmas como el *Bento Grid*.  
El diseño *Bento Grid*, inspirado en las cajas de almuerzo japonesas, es una arquitectura de interfaz modular que organiza la información en compartimentos asimétricos con jerarquías visuales claras20. En lugar de un encabezado que diga "Métricas Clave:", la IA de INDI genera un objeto JSON tipificado como Big Stat Bento. La interfaz luego renderiza esto asignando al número el 70% del espacio visual de la tarjeta (e.g., tipografía Inter a 32px), emparejado con un texto de soporte sutil19. El peso visual elimina la necesidad de explicar que el número es una métrica clave.  
Las directivas del *System Prompt* deben ser implacables al respecto, utilizando un lenguaje de restricción absoluta: *"PROHIBICIÓN ESTRICTA: El modelo no debe generar bajo ninguna circunstancia metadatos conversacionales, prefijos explicativos ni etiquetas de sección (incluyendo pero no limitándose a 'Introducción', 'Conclusión', 'Resultados'). Toda estructura narrativa será provista por la arquitectura de la interfaz. Emitir únicamente la tesis estratégica pura."*

### **Titulares de Acción Tipo Consultoría (Action Titles)**

El pilar fundamental de la redacción ejecutiva en consultoras Tier-1 (McKinsey, BCG, Bain) es el **Principio de la Pirámide de Minto** (The Pyramid Principle). Desarrollada por Barbara Minto en McKinsey durante los años sesenta, esta metodología invierte la comunicación habitual: exige comenzar inmediatamente con la respuesta, conclusión o recomendación, seguida por los argumentos agrupados lógicamente (idealmente bajo una estructura MECE: Mutuamente Excluyentes, Colectivamente Exhaustivos), y finalmente los datos de soporte16.  
En el diseño de presentaciones, la cima de la pirámide se materializa en el *Action Title* (Titular de Acción). Un *Action Title* jamás es un rótulo temático estático ("Análisis del Mercado B2B"); debe ser una oración completa que declare una conclusión inobjetable. La regla de oro es que la audiencia debe ser capaz de leer de principio a fin únicamente los titulares de las diapositivas y comprender la totalidad del argumento lógico16.  
**Reglas de Síntesis de Alto Impacto para INDI:**

> 1. **Formulación "So What?" (¿Y qué?):** Cada titular debe responder a las implicaciones estratégicas del dato. Si un gráfico muestra una caída en las ventas, el titular no debe decir "Tendencia de Ventas", sino la causa y la directriz: "La agresiva política de precios de la competencia en el segmento medio erosionó la retención en un 12%"16.  
> 2. **Economía de Palabras y Verbos Activos:** El titular debe ser una afirmación asertiva de no más de 12 a 15 palabras, restringida idealmente a dos líneas visuales. Debe iniciar o contener un verbo activo de alto impacto en contextos financieros u operativos (e.g., expandió, mitigó, aceleró, capturó)16.  
> 3. **Supresión de Clichés Corporativos:** Frases vacías como "En el dinámico ecosistema actual" o "Es importante destacar que" diluyen el mensaje y deben ser purgadas mediante penalizaciones en el prompt29.

| Título Pasivo (Descriptivo y Redundante) | Action Title Consultivo (Pirámide de Minto / INDI) | Deficiencia Corregida |
| :---- | :---- | :---- |
| *Introducción al mercado de software B2B en la región* | La consolidación del mercado B2B abre una brecha de \$14M en soluciones cloud de baja latencia. | Carecía de tesis. Se transformó en una conclusión estratégica cuantificada y orientada a la acción. |
| *Resultados del programa de optimización de cadena de suministro* | La renegociación de contratos logísticos redujo el OPEX en un 18%, mitigando la inflación de materiales. | Mero rótulo ("Resultados"). Se introdujo causalidad directa (renegociación \-\> reducción OPEX \-\> mitigación). |
| *Resumen de las métricas de retención de clientes anuales* | El nuevo modelo de *Customer Success* elevó la retención al 92%, asegurando \$2.4M en ingresos recurrentes. | Eliminación de meta-etiqueta ("Resumen"). Formulación del beneficio tangible del proyecto. |

## **Ingeniería de Prompts para Smart CV de Clase Mundial (ATS 2026\)**

Hacia el 2026, los sistemas de seguimiento de candidatos (Applicant Tracking Systems o ATS) han evolucionado desde la simple coincidencia booleana de palabras clave hacia arquitecturas de inteligencia artificial semántica. Plataformas empresariales dominantes como Workday (a través de Workday Illuminate y HiredScore), Greenhouse y Lever emplean redes de inferencia, procesamiento de lenguaje natural profundo (NLP) y Grafos de Habilidades (Skills Graphs)29. Estos sistemas deconstruyen el currículum en un esquema de datos estructurado y evalúan el contexto empírico de cada habilidad, asignando puntuaciones predictivas antes de que un reclutador humano intervenga29.

### **Formulación Google XYZ / STAR con Contexto Semántico**

La redacción de viñetas genéricas en un currículum es penalizada algorítmicamente. El *system prompt* de INDI debe forzar la reformulación de entradas básicas utilizando la matriz de rendimiento XYZ de Google y el marco STAR (Situación, Tarea, Acción, Resultado): *"He logrado \[X\], medido por \[Y\], haciendo \[Z\]"*36.  
Sin embargo, debido a la restricción absoluta de cero alucinaciones (Eje 1), la IA no puede inventar el componente \[Y\]. En cambio, el *prompt* debe guiar al modelo para extraer los resultados fácticos más fuertes, o utilizar *placeholders* marcados. Además, la redacción debe modularse según la ontología del perfil profesional:

* **Perfiles Técnicos (Ingenieros, DevOps):** El NLP de HiredScore o Illuminate busca el anclaje de tecnologías a métricas de sistemas. El prompt debe instruir a la IA a asociar lenguajes o herramientas con latencia, escalabilidad, tiempos de despliegue o arquitectura de microservicios29. *(Ej. "Arquitectó la migración a Kubernetes, logrando \[X\] reducción en el tiempo de despliegue y garantizando alta disponibilidad").*  
* **Perfiles Comerciales / Ventas:** El grafo de habilidades comerciales exige verbos atados al ciclo de ingresos. La IA debe buscar y estructurar métricas de ARR (Annual Recurring Revenue), expansión de cuotas, *Pipeline Generation* o reducciones en el CAC (Customer Acquisition Cost).  
* **Perfiles de Operaciones / Finanzas:** Optimización de procesos, reducción de mermas, cumplimiento normativo (Compliance) y velocidad de auditoría.  
* **Perfiles Creativos / Diseño:** Traducción de disciplinas visuales a lenguaje de negocios, vinculando métricas de adopción de *Design Systems*, reducción de fricción en flujos de usuario (UX) o incrementos en las tasas de conversión36.

### **Garantía ATS (Taxonomías y Análisis Semántico 2026\)**

Los *parsers* de los ATS operan en dos etapas críticas que la IA de INDI debe anticipar en su generación de código o texto: la extracción secuencial y el mapeo taxonómico29.

> 1. **Protección contra la Corrupción en la Extracción (Ingestión):** Cuando un sistema como Workday ingiere un PDF o un documento Word, aplica extracción de texto de izquierda a derecha. Si el documento tiene un diseño de dos columnas, barras de puntuación gráficas o tablas complejas, el *parser* concatena líneas incorrectamente, fusionando fechas con nombres de empresas y arruinando el perfil JSON interno34. Por lo tanto, el *output* de INDI debe estar optimizado para una estructura estrictamente secuencial y monocolumnar (o su equivalente lógico), garantizando una digestión perfecta por parte del *software*34.  
> 2. **Mapeo Taxonómico y Penalizaciones por "White Text":** Los sistemas como Workday Skills Cloud no buscan coincidencias exactas y tontas; mapean términos a un grafo canónico29. Una lista separada de habilidades al final de la página aporta muy poca puntuación algorítmica. La directiva maestra para INDI debe ser: *"Toda tecnología, idioma o competencia extraída debe ser integrada sintácticamente dentro del contexto de la viñeta de experiencia. Workday penaliza las habilidades huérfanas."* Asimismo, deben excluirse tácticas obsoletas como el uso de texto invisible o *keyword stuffing*, ya que plataformas como Greenhouse las detectan en 2026 y aplican marcadores de fraude permanentes en el perfil del candidato29.  
> 3. **El Executive Summary (Propuesta de Valor C-Level):** El resumen profesional debe abandonar el tono autobiográfico de nivel de entrada. El *prompt* debe estructurar el resumen en no más de 3 a 4 líneas de proposición de valor concentrada36. Estructura forzada: *"Ejecutivo/Especialista en \[Dominio Central\] con \[X\] años de experiencia impulsando \[Impacto Principal del Negocio\]. Historial probado en la orquestación de \[Competencia Técnica/Estratégica Clave\] para generar \[Resultado Tangible\]."* Esto proyecta autoridad inmediata sin caer en la arrogancia de los adjetivos de auto-engrandecimiento ("Soy un líder visionario").

## **Narrativa SCQA y Pacing Cinematográfico en Presentaciones 16:9**

El diseño de presentaciones estratégicas para comités directivos debe transitar fluidamente por un arco de tensión cognitiva. Una baraja de 3 a 8 diapositivas no debe ser una agregación inconexa de datos, sino un hilo deductivo estructurado metodológicamente.

### **Metodología SCQA Orgánica**

La arquitectura de la narrativa SCQA (Situación, Complicación, Pregunta, Respuesta) proporciona este anclaje racional24. La IA de INDI debe articular esta transición de forma orgánica, instruida para aplicar el marco lógica e implícitamente sin contaminar las diapositivas con la terminología académica.

* **Situación (Slide de Contexto):** Se establece la línea base inobjetable, el conocimiento compartido que la audiencia acepta sin fricción. La IA genera un *Action Title* estabilizador. (Ej. "La infraestructura *on-premise* ha sostenido la operatividad con un *uptime* del 99.5% durante los últimos tres años").  
* **Complicación (Slide de Fricción):** El modelo introduce el vector de cambio, el problema o la oportunidad que demanda acción inmediata24. (Ej. "Sin embargo, la inminente regulación de soberanía de datos y el fin del soporte de *hardware* amenazan con elevar los costos de cumplimiento en un 35%").  
* **Pregunta Estratégica (Implícita):** En lugar de escribir una diapositiva con una pregunta literal ("¿Qué debemos hacer?"), la IA evalúa las rutas estratégicas o presenta la dicotomía de la decisión.  
* **Resolución / Respuesta (Core del Deck):** La IA estructura la recomendación final o el marco de solución, dividiéndolo a través del principio MECE en pilares lógicos16.

### **Diseño de Arquetipos Visuales y Distribución Bento**

La IA no solo redacta el texto, sino que debe actuar como un Director de Arte algorítmico, decidiendo determinísticamente cómo organizar el contenido visual mediante un contrato de *layouts* JSON. Las directivas de *prompt* para esta selección heurística son:

> 1. **Big Stat Bento (Héroe Numérico):** Se dispara cuando el modelo detecta que el vector principal de persuasión es un porcentaje drástico, un monto financiero (\$) o una escala de tiempo masiva. Obliga al diseño a reducir el peso del texto de soporte y elevar la métrica central21.  
> 2. **Comparison Delta (Antes vs. Después):** Se selecciona si el *input* describe explícitamente un estado previo y un estado optimizado, requiriendo un diseño dividido vertical u horizontalmente.  
> 3. **Architecture Concept (Pilares Modulares):** Usado cuando la IA resuelve la fase de "Resolución" de la estructura SCQA con tres o cuatro elementos categóricos (MECE). Despliega tarjetas de *Bento Grid* de proporciones equitativas, asegurando que ninguna iniciativa parezca subordinada a las demás a menos que sea intencional16.  
> 4. **Timeline Roadmap (Hitos Temporales):** Se aplica automáticamente cuando se detectan fechas, cuatrimestres (Q1, Q2) o fases secuenciales.

### **Guiones para el Orador (Speaker Notes Cinematográficas)**

Las notas del orador generadas por IA suelen fracasar porque simplemente resumen o parafrasean el texto proyectado en la pantalla25. Para un ejecutivo o consultor C-Level, el *pacing* (ritmo) de 45-60 segundos por diapositiva requiere notas que actúen como directrices escénicas.  
El modelo de INDI debe generar speaker\_notes bajo reglas cinematográficas:

* **Cero Redundancia:** Está explícitamente prohibido repetir datos que ya son visibles en la lámina25.  
* **Contexto de Fondo (Color y Casuística):** Las notas deben proporcionar el "por qué" o la anécdota detrás del dato. Si la diapositiva muestra un 12% de crecimiento, la nota debe explicar brevemente el esfuerzo del equipo o las condiciones macroeconómicas que lo permitieron.  
* **Pre-Mortem y Manejo de Objeciones:** El prompt instruye a la IA para anticipar la objeción natural de un comité exigente. La nota se formula de manera táctica: *"Pausa en este punto. El comité probablemente cuestionará el costo de implementación inicial. La defensa es que el modelo OPEX permite amortizar la inversión en el mes 14, garantizando un flujo de caja neutral durante la fase crítica."*

## **Contratos Estructurados JSON, Few-Shots Comparativos y Roadmap de Integración**

Para sellar el *Faithful Grounding* absoluto, los LLMs deben ser calibrados utilizando el método *Few-Shot Prompting* con un enfoque comparativo. Mostrarle al modelo un ejemplo negativo y su respectiva transformación a una salida de clase mundial refina sustancialmente su comprensión de las instrucciones abstractas2.

### **Ejemplos Few-Shot de Referencia Industrial**

El siguiente banco de conocimiento empírico debe estar inyectado de manera latente en las instrucciones base del sistema:

| Escenario y Entidad | Entrada Original (Texto Usuario/Draft) | Salida Inaceptable (Con Alucinación / Etiquetas) | Salida Clase Mundial INDI (Estricta, Ejecutiva, Fiel) |
| :---- | :---- | :---- | :---- |
| **Caso A: Viñeta CV (Ingeniería/DevOps)** | "Hacía soporte en servidores y automatizaba tareas para que la web no se cayera." | "Administré clústeres de 100 servidores AWS y reduje los tiempos de caída en un 100% usando scripts en Python y CI/CD de última generación." *(Múltiples alucinaciones tecnológicas y estadísticas).* | **Viñeta:** "Orquestó la estabilización de la infraestructura web y la automatización de protocolos de mantenimiento, mitigando proactivamente el riesgo de interrupciones de servicio." **Flag:** needs\_metric: true **Placeholder:** "\[Cuantificar la mejora en uptime de servicio o el tiempo ahorrado mediante automatización\]" |
| **Caso B: Diapositiva Ejecutiva (Apertura)** | "Vamos a revisar el plan de abrir operaciones en el mercado de Brasil a fin de año." | **Introducción:** Proyecto Brasil 2026\. **Objetivos:** \- Brasil es un mercado clave. \- Queremos iniciar operaciones en Q4. | **Action Title:** El lanzamiento de operaciones en Brasil durante Q4 capitalizará la brecha actual de oferta en el mercado sudamericano. **Arquetipo UI:** Architecture Concept (La IA asume la distribución estratégica sin usar la palabra introducción). |
| **Caso C: Diapositiva de Métricas / Resultados** | "La campaña de marketing funcionó muy bien y el producto nuevo se vendió bastante." | **Métricas y Resultados:** Las ventas aumentaron un 65% y el CAC disminuyó un 20%. *(Falsa precisión, alucinación cuantitativa grave).* | **Action Title:** La campaña de lanzamiento validó una fuerte adopción temprana del producto, acelerando la penetración en el segmento objetivo. **Bento Hero Tile:** \[INSERTAR MÉTRICA: Ingresos o Volúmenes Totales Generados\] **Speaker Notes:** *"Destacar cualitativamente que el impulso no dependió de descuentos agresivos, salvaguardando los márgenes de la división comercial."* |

### **System Prompts Definitivos para la Plataforma INDI**

Los siguientes *prompts* maestros están ensamblados aplicando la consolidación de todos los ejes discutidos: restricciones por esquemas JSON (Pydantic style), eliminación determinista de metadatos condescendientes, aplicación de la Pirámide de Minto, protección contra la corrupción taxonómica de los ATS y mitigación algorítmica por *Extract or Flag*.

#### **A) REFINED\_MULTIMODAL\_CV\_PROMPT**

*(Diseñado para la ingesta en src/features/ai-smart-cv/lib/multimodal-parser.ts)*  
\[SYSTEM DIRECTIVE: CORE IDENTITY\] Operas como un híbrido entre un Staff NLP Data Architect y un Global Executive Recruiter de C-Level. Posees dominio algorítmico profundo sobre los parsers semánticos de ATS corporativos para 2026 (Workday Illuminate, Greenhouse, Lever, HiredScore). Tu misión exclusiva es transformar notas caóticas y currículums desestructurados en un JSON estrictamente cronológico, secuencial y de altísima densidad semántica, invulnerable a la corrupción de ingestión de múltiples columnas.  
\[STRICT ZERO-HALLUCINATION PROTOCOL (FAITHFUL GROUNDING)\]

> 1. MANDATO DE RESTRICCIÓN: Actúas como un transductor semántico, no un ente generativo creativo. Tienes estrictamente prohibido inventar o inferir estadísticamente años, títulos, empresas, presupuestos, porcentajes de éxito, equipos liderados o tecnologías que no estén de forma explícita o lógicamente anidadas en el documento de origen.  
> 2. PATRÓN "EXTRACT OR FLAG": Si una viñeta de experiencia requiere un valor cuantificable para maximizar su peso algorítmico (marco Google XYZ / STAR), pero el usuario no lo proveyó, DEBES emitir el valor null en la métrica, y señalar la carencia activando el booleano needs\_metric: true e indicando al usuario qué buscar en el campo placeholder\_suggestion.

\[ATS 2026 & EXECUTIVE SYNTAX RULES\]

> 1. FORMULACIÓN XYZ: Toda viñeta de experiencia debe iniciar con un verbo de acción directivo y asertivo (Orquestó, Lideró, Estructuró, Diseñó). Evita la voz pasiva y los adjetivos superfluos.  
> 2. SUBSTRACCIÓN EJECUTIVA: Tu JSON de salida no debe incluir ninguna etiqueta narrativa. Suprime palabras como "Responsabilidades:", "Logros clave:", "Perfil:". Solo extrae la sustancia fáctica.  
> 3. SKILLS GRAPH OPTIMIZATION: Las habilidades técnicas no deben listarse de forma aislada. Extrae las tecnologías, desambigua acrónimos si la certeza es total, y asegúrate de que el contexto de las viñetas asocie naturalmente las habilidades a las responsabilidades (evitando la penalización de Workday por 'skills orphans').  
> 4. EXECUTIVE SUMMARY: Sintetiza un resumen de máximo 4 líneas (aprox. 50-70 palabras). Estructura requerida: "Experto en \[Dominio\] con \[X\] años de trayectoria impulsando \[Impacto\]. Especializado en orquestar \[Competencia Core\] para generar \[Resultado\].". Cero sentimentalismos.

\[JSON SCHEMA ENFORCEMENT \- STRICT MODE\] Debes emitir ÚNICAMENTE el siguiente objeto JSON válido, sin preámbulos, razonamientos intermedios impresos fuera del JSON, ni delimitadores de markdown (json):  
{ "\_verification\_scratchpad": "str (Evalúa internamente si extrajiste los datos sin alterarlos)", "personal\_info": { "name": "str|null", "executive\_title": "str|null" }, "executive\_summary": "str (Proposición de valor, sin meta-etiquetas)", "experience": \[ { "company": "str", "role": "str", "dates": "str", "bullets": \[ { "text": "str (Texto de la viñeta, sintaxis XYZ de alto impacto)", "needs\_metric": "bool", "placeholder\_suggestion": "str|null (Instrucción breve para el usuario, ej: 'Cuantificar ahorro en USD')" } \] } \], "skills\_taxonomy": \["str (Arreglo de habilidades desambiguadas)"\] }

\#\#\#\# B) REFINED\_PRESENTATION\_PROMPT  
\*(Diseñado para la generación estratégica en \`src/features/orbital-presentations/actions.ts\`)\*

\`\`\`text  
\[SYSTEM DIRECTIVE: CORE IDENTITY\]  
Operas como Principal AI Architect y Executive Communications Director (Ex-McKinsey/Bain). Tu mandato es transformar entradas de texto crudo en un contrato JSON que definirá una presentación estratégica de nivel directorio (C-Level/Board). Dominas el "Pyramid Principle", el flujo SCQA y el diseño de información cognitiva.

\[EXECUTIVE SUBTRACTION & NO-LABEL RULE\]  
1\. PROHIBICIÓN DE ETIQUETAS ESTRUCTURALES: Tienes absolutamente prohibido usar prefijos como "Introducción:", "Antecedentes:", "Análisis:", "Conclusión:". La función de la información debe emanar intrínsecamente del texto y de su arquetipo visual.  
2\. PIRÁMIDE DE MINTO & ACTION TITLES: El campo \`action\_title\` para cada diapositiva NUNCA será un tema pasivo. DEBE ser una tesis estratégica (oración completa, con verbo activo, cuantificada si es posible) de 12 a 15 palabras. (Ej. "La optimización del ciclo de ventas expandió el margen bruto en un 14%").

\[ORGANIC SCQA & CINEMATIC PACING\]  
1\. FLUJO NARRATIVO: Secuencia las diapositivas de forma deductiva transitando sutilmente de Situación \-\> Complicación \-\> Resolución. No menciones el esquema SCQA explícitamente en el output.  
2\. SPEAKER NOTES: Las notas (\`speaker\_notes\`) no son un resumen de la lámina. Proporciona instrucciones cinematográficas para un orador de élite frente a una junta exigente. Anticipa objeciones, provee contexto extra y marca pausas de énfasis estratégico (100 palabras máx).

\[VISUAL ARCHETYPES & GROUNDING\]  
1\. ASIGNACIÓN BENTO GRID: El frontend de INDI usa una filosofía Bento Grid. Clasifica cada lámina heurísticamente en el campo \`layout\_archetype\`:  
   \- 'big\_stat\_bento': Para destacar una métrica o victoria principal.  
   \- 'comparison\_delta': Para demostrar estados de "Antes vs Después".  
   \- 'architecture\_concept': Para marcos estratégicos de 3 o 4 pilares (MECE).  
   \- 'timeline\_roadmap': Para planificaciones temporales.  
2\. ZERO HALLUCINATION (EXTRACT OR FLAG): Si un \`action\_title\` o un diseño \`big\_stat\_bento\` necesita un número que el usuario no entregó, NO lo inventes. Usa \`\[MÉTRICA FALTANTE\]\` y activa \`needs\_data: true\`.

\[JSON SCHEMA ENFORCEMENT \- STRICT MODE\]  
Emite ÚNICAMENTE el siguiente objeto JSON válido, procesando internamente la lógica y devolviendo solo la estructura requerida:

{  
  "\_verification\_scratchpad": "str (Breve auditoría interna: Confirma que todos los títulos son Action Titles y no hay números inventados ni etiquetas de 'Introducción')",  
  "deck\_title": "str (Título principal de la baraja, asertivo y claro)",  
  "slides": \[  
    {  
      "slide\_number": "int",  
      "action\_title": "str (Máx 15 palabras, tesis con verbo, pasa el test 'So what?')",  
      "layout\_archetype": "str (big\_stat\_bento | comparison\_delta | architecture\_concept | timeline\_roadmap)",  
      "content": {  
        "primary\_text": "str (Párrafo denso, sin verbosidad ni clichés)",  
        "highlights": \["str (Opcional: 3 viñetas breves de soporte fáctico)"\],  
        "hero\_metric": "str|null (Número extraído o marcador si es crítico y falta)",  
        "needs\_data": "bool"  
      },  
      "speaker\_notes": "str (Guion direccional, pre-mortems, objeciones y anécdotas estratégicas. NO repetir la lámina)"  
    }  
  \]  
}

La adopción de esta arquitectura dota a la plataforma INDI de una madurez técnica sin precedentes en el ecosistema SaaS. Al restringir algorítmicamente el espacio probabilístico de los modelos mediante contratos JSON inflexibles, y al inyectar paradigmas comunicacionales empíricos (Chain-of-Verification, Substracción Ejecutiva, Mapeo Semántico ATS 2026), los motores de IA dejan de ser procesadores de texto y se transforman en directores tácticos fiables, invulnerables a las alucinaciones y calibrados para las exigencias cognitivas del más alto liderazgo corporativo.

#### **Obras citadas**

> 1. Paraconsistent Logic and AI models \- Hugging Face Forums, [https\://discuss.huggingface.co/t/paraconsistent-logic-and-ai-models/174262](https://discuss.huggingface.co/t/paraconsistent-logic-and-ai-models/174262)  
> 2. Chain-of-Verification Reduces Hallucination in Large Language, [https\://arxiv.org/html/2309.11495v2](https://arxiv.org/html/2309.11495v2)  
> 3. arXiv:2311.09114v2 \[cs.CL\] 25 Feb 2024, [https\://arxiv.org/pdf/2311.09114](https://arxiv.org/pdf/2311.09114)  
> 4. Fine-Tuning Large Language Models for Epistemic Reasoning, [https\://www\.techrxiv.org/doi/pdf/10.36227/techrxiv.177126510.00438262](https://www.techrxiv.org/doi/pdf/10.36227/techrxiv.177126510.00438262)  
> 5. Chain-of-Verification Reduces Hallucination in Large Language, [https\://www\.alphaxiv.org/abs/2309.11495](https://www.alphaxiv.org/abs/2309.11495)  
> 6. Chain of Verification Prompting \- GitHub, [https\://github.com/KalyanKS-NLP/Prompt-Engineering-Techniques-Hub/blob/main/Advanced\_Prompt\_Engineering\_Techniques/Chain\_of\_Verification\_Prompting.md?ref=promptengineering.org](https://github.com/KalyanKS-NLP/Prompt-Engineering-Techniques-Hub/blob/main/Advanced_Prompt_Engineering_Techniques/Chain_of_Verification_Prompting.md?ref=promptengineering.org)  
> 7. Investigating the Role of Prompting and External Tools in ... \- arXiv, [https\://arxiv.org/html/2410.19385v1](https://arxiv.org/html/2410.19385v1)  
> 8. Structured outputs \- Claude Platform Docs, [https\://platform.claude.com/docs/en/build-with-claude/structured-outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)  
> 9. Structured output | Gemini Enterprise Agent Platform, [https\://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output)  
> 10. pydantic\_ai.profiles | Pydantic Docs, [https\://pydantic.dev/docs/ai/api/pydantic-ai/profiles/](https://pydantic.dev/docs/ai/api/pydantic-ai/profiles/)  
> 11. Improving Structured Outputs in the Gemini API, [https\://blog.google/innovation-and-ai/technology/developers-tools/gemini-api-structured-outputs/](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-api-structured-outputs/)  
> 12. How to Minimize LLM Hallucinations with Pydantic Validators, [https\://pydantic.dev/articles/llm-validation](https://pydantic.dev/articles/llm-validation)  
> 13. How to Use Pydantic for LLMs: Schema, Validation & Prompts, [https\://pydantic.dev/articles/llm-intro](https://pydantic.dev/articles/llm-intro)  
> 14. Chain-of-Verification Reduces Hallucination in Large Language, [https\://www\.researchgate.net/publication/384218319\_Chain-of-Verification\_Reduces\_Hallucination\_in\_Large\_Language\_Models](https://www.researchgate.net/publication/384218319_Chain-of-Verification_Reduces_Hallucination_in_Large_Language_Models)  
> 15. LLM Verification Loops: Best Practices and Patterns \- Medium, [https\://timjwilliams.medium.com/llm-verification-loops-best-practices-and-patterns-07541c854fd8](https://timjwilliams.medium.com/llm-verification-loops-best-practices-and-patterns-07541c854fd8)  
> 16. Consulting Presentations: MBB Slide Design & Structure Guide, [https\://deckary.com/blog/pillar-consulting-presentations-guide](https://deckary.com/blog/pillar-consulting-presentations-guide)  
> 17. What Are Action Titles and How to Write Them For Presentations?, [https\://highbridgeacademy.com/slides-mastery-how-action-titles-transform-business-presentations/](https://highbridgeacademy.com/slides-mastery-how-action-titles-transform-business-presentations/)  
> 18. Beyond Boxes: Elevating Design with Bento Grid Patterns \- UX GIRL, [https\://uxgirl.com/blog/beyond-boxes-elevating-design-with-bento-grid-patterns](https://uxgirl.com/blog/beyond-boxes-elevating-design-with-bento-grid-patterns)  
> 19. Bento Design Skill File | TypeUI, [https\://www\.typeui.sh/design-skills/bento](https://www.typeui.sh/design-skills/bento)  
> 20. How to Use Bento Grids Design in Your Web Projects \- freeCodeCamp, [https\://www\.freecodecamp.org/news/bento-grids-in-web-design/](https://www.freecodecamp.org/news/bento-grids-in-web-design/)  
> 21. Bento Grid Infographics: Templates, Examples & How to Create One, [https\://venngage.com/blog/bento-grid-infographics/](https://venngage.com/blog/bento-grid-infographics/)  
> 22. From Japanese Lunchboxes to Modern UI: The Story of Bento Grids, [https\://medium.com/@supreeth.gani/from-japanese-lunchboxes-to-modern-ui-the-story-of-bento-grids-599fc7331d60](https://medium.com/@supreeth.gani/from-japanese-lunchboxes-to-modern-ui-the-story-of-bento-grids-599fc7331d60)  
> 23. What is the Pyramid Principle? \- Slide Science, [https\://slidescience.co/pyramid-principle/](https://slidescience.co/pyramid-principle/)  
> 24. How to Make McKinsey-Style Consulting Slides (2026), [https\://www\.chatslide.ai/guides/mckinsey-consulting-style-slides](https://www.chatslide.ai/guides/mckinsey-consulting-style-slides)  
> 25. Inside McKinsey's presentation playbook: real examples, [https\://www\.supernormal.com/blog/mckinsey-presentation-playbook](https://www.supernormal.com/blog/mckinsey-presentation-playbook)  
> 26. McKinsey Presentation Structure (A Guide for Consultants), [https\://slidemodel.com/mckinsey-presentation-structure/](https://slidemodel.com/mckinsey-presentation-structure/)  
> 27. McKinsey Slide Craft: Claude Skill for Productivity \- Agentman, [https\://agentman.ai/agentskills/skill/mckinsey-slide-craft](https://agentman.ai/agentskills/skill/mckinsey-slide-craft)  
> 28. How to Make a McKinsey-Style Presentation with AI \- SlidesPilot, [https\://www\.slidespilot.com/blog/mckinsey-style-presentation](https://www.slidespilot.com/blog/mckinsey-style-presentation)  
> 29. AI \- ML Resume Framework 2026 | PDF \- Scribd, [https\://www\.scribd.com/document/1056542972/AI-ML-Resume-Framework-2026](https://www.scribd.com/document/1056542972/AI-ML-Resume-Framework-2026)  
> 30. Convert Resume into Keywords: Beat AI ATS 2026 \- REZIT.IO, [https\://rezit.io/blogpost?slug=convert-resume-into-keywords-for-ai-ats-2026](https://rezit.io/blogpost?slug=convert-resume-into-keywords-for-ai-ats-2026)  
> 31. ATS 2.0: What "Semantic Matching" Means for Your Resume (and, [https\://blog.theinterviewguys.com/what-semantic-matching-means/](https://blog.theinterviewguys.com/what-semantic-matching-means/)  
> 32. How AI Resume Screening Works in 2026 (and How to Get Past It), [https\://www\.jobscan.co/blog/blog-ai-resume-screening/](https://www.jobscan.co/blog/blog-ai-resume-screening/)  
> 33. What Is a Skills Graph? The 2026 Guide for HR Leaders \- 365Talents, [https\://365talents.com/en/resources/skills-graph-guide-hr-leaders/](https://365talents.com/en/resources/skills-graph-guide-hr-leaders/)  
> 34. How the Workday ATS Reads Your Resume (2026) | ResumeAdapter, [https\://www\.resumeadapter.com/ats/workday/how-it-parses](https://www.resumeadapter.com/ats/workday/how-it-parses)  
> 35. Best AI Tools That Actually Integrate With Workday Recruiting (2026), [https\://recruitingtechreviews.com/articles/best-ai-tools-workday](https://recruitingtechreviews.com/articles/best-ai-tools-workday)  
> 36. StephanieKoehl/resume-best-practices: The complete ... \- GitHub, [https\://github.com/StephanieKoehl/resume-best-practices](https://github.com/StephanieKoehl/resume-best-practices)  
> 37. How Does Workday ATS Work in 2026? How It Parses, Scores, [https\://stylingcv.com/blog/how-does-workday-ats-work-parse-score-rank-resume-2026/](https://stylingcv.com/blog/how-does-workday-ats-work-parse-score-rank-resume-2026/)  
> 38. How Workday's ATS actually scores your resume (most people are, [https\://www\.reddit.com/r/jobsearchhacks/comments/1rmnyhq/how\_workdays\_ats\_actually\_scores\_your\_resume\_most/](https://www.reddit.com/r/jobsearchhacks/comments/1rmnyhq/how_workdays_ats_actually_scores_your_resume_most/)