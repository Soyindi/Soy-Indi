# 🧠 PROMPT MAESTRO DE DEEP RESEARCH PARA GEMINI: ARQUITECTURA DE ADAPTACIÓN INTELIGENTE DE DOCUMENTOS A PRESENTACIONES (NOTEBOOKLM, RAG ESTRUCTURADO, AGENTES Y SKILLS 2026)

## INVESTIGACIÓN PROFUNDA: INGENIERÍA DE INGESTA DOCUMENTAL, MOTOR COGNITIVO TIPO NOTEBOOKLM, ORQUESTACIÓN AGÉNTICA VS. SKILLS Y SÍNTESIS NARRATIVA DE PRESENTACIONES EJECUTIVAS

---

### 📋 INSTRUCCIONES DE EJECUCIÓN PARA GEMINI DEEP RESEARCH:

> **Rol Asignado:** Actúa como **Principal AI Architect, Staff LLM Systems Engineer & Chief Product Architect** especializado en motores de comprensión documental de última generación (NotebookLM, Google Gemini 2.0/2.5 Pro multimodal, Claude 3.5 Sonnet Artifacts, Agentic Workflows con LangGraph/CrewAI/LlamaIndex y Context Caching).
> 
> **Objetivo:** Ejecutar una **investigación profunda y exhaustiva (Deep Research de Grado Industrial)** para resolver el desafío central de la plataforma **INDI** (`https://soyindi.cl`): **¿Cómo transformar documentos complejos, densos y extensos (ensayos académicos, PDFs técnicos, balances financieros, propuestas comerciales) en presentaciones ejecutivas 16:9 que adapten el contenido de manera verdaderamente inteligente, orgánica y sin truncamientos ni vacíos de contexto?**
> 
> **Preguntas de Ruptura a Resolver:**
> 1. ¿Cómo funciona la arquitectura interna de **Google NotebookLM** (Source Grounding, Source Guide, Audio Overviews, chunking recursivo contextual) y cómo replicar ese estándar en un SaaS web moderno sin costos prohibitivos de cómputo?
> 2. ¿Cuándo se requiere un **Agente Autónomo** (Agentic Workflow con ciclo de razonamiento, tools y auto-crítica) vs. una **Skill Especializada** (reglas deterministas, heurísticas locales y metaprompting estructurado)? ¿Cuál es el diseño híbrido óptimo para latencia sub-segundo y cero fallos?
> 3. ¿Cómo resolver la tensión entre "Fidelidad Absoluta al Documento" y "Diseño Visual de Diapositiva 16:9", erradicando párrafos amontonados y convirtiendo argumentos en diagramas Bento, métricas o contrastes visuales?
> 
> **Nivel de Rigor:** Máximo estándar de la industria 2026. Prohibidas las generalidades teóricas. La entrega debe incluir diagramas de flujo, esquemas de descomposición de fuentes, prompts de producción, contratos Zod y matriz de decisión técnica (Agentes vs. Skills vs. Pipelines deterministas).

---

### 💻 CONTEXTO TÉCNICO Y COMERCIAL DE LA PLATAFORMA (INDI):

- **Plataforma:** SaaS de Identidad Digital, Tarjetas Vivas, Smart CV y Presentaciones Orbitales (`https://soyindi.cl`).
- **Módulo Afectado:** **Orbital Presentations Studio (`src/features/orbital-presentations`)**.
- **Entrada de Usuario:** Documentos PDF, Markdown, TXT, CSV o texto pegado (ensayos universitarios, informes de consultoría, memorias anuales, planes estratégicos).
- **Salida Requerida:** Presentación interactiva 16:9 con diapositivas basadas en tipologías visuales adaptativas:
  - `concept`: Ideas medulares, citas y tesis ejecutivas.
  - `metrics`: Bento Grid de indicadores cuantitativos (monedas, %, deltas, YoY).
  - `comparison`: Contraste Situación Previa vs. Resolución / Hallazgos Clave.
  - `timeline`: Hoja de ruta, fases o hitos conceptuales.
  - `architecture`: Diagramas de componentes modulares.
- **Stack Actual:**
  - Next.js 16 (App Router) + React 19 + Server Actions.
  - Turso SQLite (LibSQL) con Drizzle ORM (Zero-Binary Persistence, solo metadatos y JSON estructurado <50KB).
  - Extractor espacial client/server (`unpdf`, `extractSpatialTextFromPdf`).
  - Inferencia actual: NVIDIA NIM (meta/llama-3.3-70b-instruct) y Gemini API con fallback heurístico determinista (`document-parser.ts`).

---

### 🎯 PROMPT DE INVESTIGACIÓN ESTRUCTURADO EN 5 EJES ESTRATÉGICOS:

```markdown
Actúa como Principal AI Architect & Staff LLM Systems Engineer. Realiza un Deep Research de Grado Industrial sobre infraestructuras eficientes y tendencias de vanguardia (2025-2026) para transformar documentos complejos en presentaciones interactivas inteligentes en INDI (https://soyindi.cl). Responde con exhaustividad a los siguientes 5 ejes:

---

### EJE 1: ARQUITECTURA COGNITIVA TIPO NOTEBOOKLM (SOURCE-GROUNDED REASONING)
1. **Desglose Anatómico de NotebookLM:**
   - ¿Cuál es la arquitectura exacta que utiliza Google en NotebookLM para lograr que un modelo comprenda fuentes documentales con cero alucinación y extraordinaria capacidad de síntesis?
   - Explica el concepto de "Source Guide" / "Notebook Guide" y cómo se extraen resúmenes temáticos, temas clave (Topics), preguntas frecuentes (FAQs) y líneas de tiempo a partir de un corpus documental heterogéneo.
   - ¿Cómo maneja NotebookLM los documentos no estructurados (ensayos, memorias de grado, PDFs escaneados) donde conviven metadatos administrativos (nombres, programas, fechas) con la tesis argumental de fondo?
2. **Context Window vs. RAG Tradicional en 2026:**
   - En la era de Gemini 1.5/2.0/2.5 Pro con ventanas de 1M-2M tokens y "Context Caching": ¿Sigue teniendo sentido el RAG vectorial clásico (chunking + embeddings + vector database) para documentos de 10 a 100 páginas, o es superior inyectar el documento completo en el contexto cacheado con instrucciones de razonamiento estructurado?
   - Análisis de costos, latencia (TTFT) y calidad de síntesis entre:
     a) RAG Vectorial con Pinecone/Qdrant + embeddings.
     b) Ingesta Directa con Gemini Context Caching.
     c) Extracción Espacial Heurística Local + LLM Ingestion en 1 sola llamada estructurada.

---

### EJE 2: AGENTES AUTÓNOMOS VS. SKILLS ESPECIALIZADAS VS. WORKFLOWS DETERMINISTAS
1. **Diferenciación Conceptual y Arquitectónica:**
   - Define con rigor técnico la frontera entre:
     * **Agente (Agentic AI):** Entidad con bucle de razonamiento autónomo (ReAct / Reflexion), invocación dinámica de herramientas (Tool Use), memoria de estado y capacidad de auto-corrección iterativa.
     * **Skill (Procedimiento Especializado):** Conjunto modular de directrices, reglas de dominio, heurísticas locales y contratos de interfaz que guían la ejecución determinista de una tarea acotada.
     * **Linear LLM Chain / Pipeline:** Secuencia rígida de pasos (Extracción ➔ Prompt ➔ Parseo ➔ Render).
2. **¿Es Necesario un Agente para Presentaciones?**
   - Evalúa críticamente: ¿Una aplicación de generación de presentaciones a partir de documentos necesita agentes autónomos pesados (con múltiples rondas de interacción y latencia de 15-45 segundos) o se beneficia más de un **Workflow Orquestado con Skills Modulares** (ej. Skill de Ingesta, Skill de Descomposición SCQA, Skill de Pacing, Skill de Visual Assignment)?
   - Presenta una **Matriz de Decisión (Trade-offs)**: Latencia, Costo por documento, Determinismo de UI, Tasa de fallos y Experiencia de Usuario.

---

### EJE 3: DEL TEXTO PLANO AL LIENZO 16:9: EL MOTOR DE ADAPTACIÓN INTELIGENTE (SCQA Y PYRAMID PRINCIPLE)
1. **El Problema del Texto Amontonado (Wall of Text):**
   - Cuando un usuario sube un ensayo denso (ej. UEA_ENSAYO1.pdf), los modelos tradicionales tienden a resumir el texto en párrafos largos que arruinan la diapositiva visual.
   - ¿Cuál es la formulación matemática y semántica del **Algoritmo de Destilación Ejecutiva** para transformar 5 páginas de texto en:
     * Una tesis central asertiva de 12-14 palabras (Action Title McKinsey).
     * 2-3 puntos clave con verbos de acción ("punchy bullets").
     * Asignación automática de la tipología visual correcta: ¿Cuándo es Bento Grid, cuándo es Timeline, cuándo es Contraste Antes/Después y cuándo es Concepto Modular?
2. **Desacoplamiento Semántico:**
   - ¿Cómo asegurar que el título temático de la diapositiva (`title`), la conclusión estratégica (`actionTitle`), la bajada (`subtitle`) y los elementos internos (`timelineData`, `comparisonData`) no se canibalicen ni repitan el mismo texto con elipsis?

---

### EJE 4: INFRAESTRUCTURA EFICIENTE, MODELOS FRONTERA Y LATENCIA SUB-SEGUNDO
1. **Catálogo de Modelos y Proveedores 2026:**
   - Compara el rendimiento para esta tarea específica entre:
     * Google Gemini 2.0 Flash / Pro (con Structured Outputs y Context Caching).
     * Anthropic Claude 3.5 Sonnet (con Thinking Process).
     * Meta LLaMA 3.3 70B vía NVIDIA NIM / Groq (inferencia ultra-rápida LPU a 300 tokens/s).
     * Modelos compactos locales/edge (Gemini Nano, LLaMA 3.2 3B) para pre-filtrado en cliente o edge server.
2. **Arquitectura Híbrida Propuesta para INDI:**
   - Diseña la arquitectura ideal para INDI que combine:
     * **Capa 0 (Client / Edge):** Extracción espacial, filtrado de preámbulos administrativos (`cleanAdministrativePreamble`) y conteo de tokens.
     * **Capa 1 (Inferencia Inteligente):** Llamada a API de alto rendimiento con Structured Output (JSON Schema garantizado).
     * **Capa 2 (Fallback Heurístico Local):** Motor determinista en caso de desconexión o fallo del proveedor.

---

### EJE 5: CONTRATOS TÉCNICOS, PROMPTS MAESTROS Y PLAN DE IMPLEMENTACIÓN EN INDI
1. **System Prompt de Nueva Generación para Presentaciones (`INTELLIGENT_PRESENTATION_ORCHESTRATOR_2026`):**
   - Proporciona el System Prompt definitivo, completo y listo para producción, con instrucciones de eliminación de metadatos, estructuración SCQA y mapeo visual adaptativo.
2. **Contrato de Salida Zod Fuertemente Tipado:**
   - Define el esquema Zod exacto para la respuesta del modelo que garantice compatibilidad con `PresentationFormValues` y `PresentationSlide` en INDI.
3. **Hoja de Ruta de Implementación en 3 Pasos:**
   - Paso 1: Optimización del pipeline actual (quick wins de prompting y sanitización).
   - Paso 2: Integración de Gemini 2.0 / Context Caching.
   - Paso 3: Orquestación modular por Skills y generación progresiva de diapositivas en streaming.
```

---

### 📦 ENTREGABLE ESPERADO DE GEMINI:

Un informe técnico exhaustivo con:
1. Análisis de ingeniería inversa de **NotebookLM** y viabilidad de replicar su "Source Guide" en INDI.
2. Veredicto técnico fundado: **¿Agentes, Skills o Pipelines?** con recomendaciones de implementación.
3. El **System Prompt Maestro de Descomposición Inteligente 2026** listo para integrarse en `src/features/orbital-presentations/actions.ts`.
4. Contrato Zod y estrategia de caché/latencia optimizada para el stack Next.js 16 + Turso LibSQL.
