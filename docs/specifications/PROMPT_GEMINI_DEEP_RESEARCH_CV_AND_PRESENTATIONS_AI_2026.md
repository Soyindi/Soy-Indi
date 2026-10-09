# 🧠 PROMPT MAESTRO DE DEEP RESEARCH PARA GEMINI: EXCELENCIA DE INFERENCIA, ANTI-ALUCINACIÓN ESTRICTA Y ESTRUCTURACIÓN EJECUTIVA (SMART CV & PRESENTACIONES ORBITALES 2026)

## ARQUITECTURA DE PROMPTING INDUSTRIAL, METODOLOGÍA MCKINSEY SCQA, ESTÁNDAR ATS GLOBAL Y ELIMINACIÓN DE ETIQUETAS OBVIAS

---

### 📋 INSTRUCCIONES DE EJECUCIÓN PARA GEMINI:

> **Rol Asignado:** Actúa como **Principal AI Architect, Staff NLP/Prompt Engineer & Executive Communications Director** (con experiencia en consultoras estratégicas como McKinsey, BCG, Bain y líderes de reclutamiento ejecutivo global). Cuentas con dominio profundo en modelos de lenguaje de última generación (Gemini 2.0/2.5 Pro y Flash, Claude 3.5 Sonnet, GPT-4o), técnicas avanzadas de **Faithful Grounding**, mitigación algorítmica de alucinaciones, diseño de **Structured Outputs**, taxonomías ATS de empleo (Workday, Greenhouse, Lever) y narrativas de presentación para directorios e inversionistas (C-Level & Board Decks).
> 
> **Objetivo:** Ejecutar una **investigación profunda, rigurosa y exhaustiva (Deep Research de Grado Industrial)** para resolver dos problemas críticos en la generación de contenido asistida por IA dentro de la plataforma **INDI** (`https://soyindi.cl`):
> 1. **Erradicación Total de Alucinaciones:** La IA debe ceñirse con fidelidad matemática al input suministrado por el usuario. No debe inventar empleos, métricas porcentuales, cifras de facturación ni credenciales inexistentes.
> 2. **Sofisticación Estructural y Erradicación de Etiquetas Obvias:** Prohibir el uso de etiquetas redundantes y condescendientes (ej. no colocar *"Introducción:"*, *"Conclusión:"*, *"Objetivo:"*). Las respuestas deben lucir profesionales, inteligentes, asertivas y elegantes, diseñadas para clientes ejecutivos y exigentes.
> 
> **Nivel de Rigor:** Máximo estándar de la industria 2026. Cero respuestas de plantilla o consejos genéricos de manual de redacción. Todo concepto debe entregarse respaldado por ejemplos contrastados de **Input Crudo ➔ Generación Mediocre (Lo que debemos evitar) ➔ Generación de Clase Mundial (Lo que debemos exigir)**, acompañados de system instructions precisas y contratos Zod compatibles con el stack de INDI.

---

### 💻 CONTEXTO TÉCNICO Y COMERCIAL DE LA PLATAFORMA (INDI):

- **Plataforma:** SaaS de Identidad Digital, Tarjetas Digitales Vivas, Smart CV y Presentaciones Cinemáticas (`https://soyindi.cl`).
- **Público Objetivo:** Profesionales independientes, directivos, consultores, ejecutivos de negocios, fundadores y equipos corporativos en Chile y América Latina.
- **Módulos Impactados:**
  1. **Smart CV Engine (`src/features/ai-smart-cv`):**
     - Parser multimodal e ingesta inteligente de documentos (PDF, PNG, TXT).
     - Cumplimiento de **EU AI Act** (sanitización de edad, foto, estado civil, religión).
     - Formato de impacto **Google XYZ / STAR**: *"Logré [X], medido por [Y], haciendo [Z]"*.
     - Generación de PDF vectorial en el cliente con **jsPDF** (`pdf-engine.ts`) 100% legible para ATS.
  2. **Orbital Presentations Engine (`src/features/orbital-presentations`):**
     - Generación y refinamiento de diapositivas en relación de aspecto **16:9**.
     - Estructura narrativa **SCQA (Situación, Complicación, Pregunta, Respuesta)**.
     - Diapositivas dinámicas basadas en arquetipos: *Bento Metrics*, *Comparison Delta*, *Timeline Roadmap*, *Architecture Concept*.
     - Titulares asertivos tipo consultoría (*Action Titles*) de máximo 15 palabras y notas de orador ejecutivas (~60s).
- **Stack Tecnológico:**
  - **Framework:** Next.js 16 (App Router) + React 19 (Server Actions y Server Components).
  - **Lenguaje:** TypeScript 6.0 estricto.
  - **Base de Datos & Persistencia:** Turso (LibSQL Serverless SQLite) + Drizzle ORM (Zero-Binary Persistence).
  - **Estilos:** Tailwind CSS v4 + OKLCH Gamut P3 y Glassmorphism 2.0.
  - **Proveedores de Inferencia:** Google Gemini API (v1beta / 2.0 / 2.5 Flash & Pro) con fallbacks a OpenRouter y NVIDIA NIM, respaldados por motores heurísticos locales deterministas (`cv-text-parser.ts`, `document-parser.ts`).

---

### 🎯 PROMPT DE INVESTIGACIÓN ESTRUCTURADO EN 5 EJES ESTRATÉGICOS:

```markdown
Actúa como Principal AI Architect & Executive Communications Director. Realiza un Deep Research de Grado Industrial para elevar la calidad, fidelidad semántica y sofisticación estructural de los módulos de Smart CV y Presentaciones en INDI (https://soyindi.cl), respondiendo con exhaustividad técnica a los siguientes 5 ejes:

---

### EJE 1: ARQUITECTURA DE GROUNDING ESTRICTO Y ERRADICACIÓN DE ALUCINACIONES
1. **Fidelidad Causal Estricta (Faithful Grounding):**
   - ¿Cuáles son las técnicas de prompting y meta-instrucciones más efectivas en modelos frontera (Gemini 2.0/2.5 Pro/Flash) para forzar al modelo a no agregar métricas, cifras o hechos ausentes en el documento o texto de origen?
   - Patrón "Extract or Flag": ¿Cómo diseñar prompts donde, si el usuario no especifica una métrica cuantificable (ej. "Lideré equipo"), el sistema no invente un número ficticio ("Lideré equipo de 25 personas y aumenté 40% las ventas"), sino que preserve la veracidad y marque flags estructurados (`needs_metric: true`) o proponga placeholders inteligentes?
   - Estrategias de autoverificación en una sola pasada: ¿Cómo instruir al modelo para que audite internamente su respuesta antes de emitir el JSON final (Chain-of-Verification / Self-Consistency compacta)?

---

### EJE 2: SUBSTRACCIÓN EJECUTIVA: "SHOW, DON'T LABEL" Y REDACCIÓN C-LEVEL
1. **Eliminación de Meta-Etiquetas Redundantes:**
   - ¿Cómo erradicar de raíz la tendencia de los LLMs a incluir encabezados obvios como "Introducción:", "Resumen:", "Antecedentes:", "Conclusión:" o "Próximos pasos:" en diapositivas y bloques de CV?
   - Demuestra cómo estructurar la jerarquía visual de la diapositiva mediante posición, tipografía y estilo (Bento, Callout, Stat Badge) para que la función se entienda de inmediato sin necesidad de la palabra obvia.
2. **Titulares de Acción Tipo Consultoría (Action Titles):**
   - Comparativa directa: ¿Cómo transformar un título pasivo y descriptivo (ej. "Introducción al mercado de software") en una tesis estratégica asertiva (ej. "La consolidación del mercado B2B abre una brecha de $14M en soluciones cloud de baja latencia")?
   - Reglas de síntesis de alto impacto: Máximo 12 a 15 palabras, formulación "So what?", eliminación de clichés corporativos ("En el mundo dinámico actual...", "Es primordial destacar...").

---

### EJE 3: INGENIERÍA DE PROMPTS PARA SMART CV DE CLASE MUNDIAL (ATS 2026)
1. **Formulación Google XYZ / STAR con Datos Reales:**
   - ¿Cuál es la formulación exacta de system prompt para convertir viñetas descriptivas ("Hacía tareas de soporte y programación") en viñetas de alto rendimiento profesional sin falsear la información?
   - Manejo de perfiles diversos: ¿Cómo adaptar la redacción ejecutiva para perfiles técnicos (ingenieros, DevOps), creativos/diseñadores, perfiles comerciales/ventas y personal de operaciones o servicios?
2. **Garantía ATS (Applicant Tracking Systems):**
   - ¿Qué palabras clave y patrones de etiquetado semántico buscan los parsers de Workday, Greenhouse, Taleo y Lever en 2026?
   - Cómo redactar el resumen profesional ("Executive Summary") para que transmita autoridad, foco y propuesta de valor única en no más de 3-4 líneas sin sonar arrogante ni genérico.

---

### EJE 4: NARRATIVA SCQA Y PACHING CINEMATOGRÁFICO EN PRESENTACIONES 16:9
1. **Metodología SCQA Orgánica:**
   - ¿Cómo articular el flujo narrativo de una baraja de diapositivas (3 a 8 slides) para que transite naturalmente por Situación ➔ Complicación ➔ Pregunta Estratégica ➔ Resolución sin escribir nunca estas palabras en las láminas?
2. **Diseño de Arquetipos Visuales y Distribución Bento:**
   - ¿Qué reglas de prompt determinan con precisión si una idea debe representarse como:
     a) Métrica / Estadística Central (Big Stat Bento).
     b) Contraste o Delta (Antes vs Después / Alternativa A vs Alternativa B).
     c) Arquitectura / Proceso Conceptual (3-4 pilares modulares).
     d) Hoja de Ruta / Cronograma (Milestones).
3. **Guiones para el Orador (Speaker Notes de Nivel Directivo):**
   - ¿Cómo generar notas del orador que no repitan el texto de la diapositiva, sino que ofrezcan contexto adicional, anécdotas estratégicas o directrices de énfasis tonal para hablar durante 45-60 segundos frente a un comité o cliente exigente?

---

### EJE 5: CONTRATOS ESTRUCTURADOS JSON, FEW-SHOTS COMPARATIVOS Y ROADMAP DE INTEGRACIÓN
1. **Ejemplos Few-Shot de Referencia Industrial:**
   - Proporciona al menos 3 casos reales contrastados:
     * Caso A: CV Viñeta de Experiencia (Entrada mediocre ➔ Salida inaceptable con alucinaciones ➔ Salida de clase mundial).
     * Caso B: Diapositiva Ejecutiva de Apertura (Entrada simple ➔ Salida con etiquetas redundantes "Introducción" ➔ Salida estratégica consultoría).
     * Caso C: Diapositiva de Métricas / Resultados (Entrada sin números ➔ Salida inventando métricas ➔ Salida con rigor honesto y llamado a validación).
2. **System Prompts Definitivos para INDI:**
   - Redacta los System Prompts completos, testeados y listos para producción para:
     a) `REFINED_MULTIMODAL_CV_PROMPT` (para `src/features/ai-smart-cv/lib/multimodal-parser.ts`).
     b) `REFINED_PRESENTATION_PROMPT` (para `src/features/orbital-presentations/actions.ts`).
```

---

### 📦 ENTREGABLES ESPERADOS DEL DEEP RESEARCH:

1. **Documento Técnico de Investigación Completo:** Análisis pormenorizado de los 5 ejes estratégicos.
2. **Catálogo de Prompts Optimizados para Producción:** Instrucciones de sistema rigurosamente formuladas con variables `{context}`, `{input}` y delimitadores seguros.
3. **Guía de Migración y Testing:** Plan paso a paso para actualizar los archivos de la plataforma INDI sin romper contratos Zod ni degradar el rendimiento en Vercel Edge / Turso.
