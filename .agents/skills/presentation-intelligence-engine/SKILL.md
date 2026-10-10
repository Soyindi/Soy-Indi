---
name: presentation-intelligence-engine
description: Protocolo de descomposición semántica SCQA, pacing de diapositivas y extracción temática para Presentaciones Orbitales 16:9 en INDI.
---

# 🚀 Skill: Motor de Inteligencia de Presentaciones Orbitales (INDI 2026)

Esta habilidad documenta y gobierna el protocolo de ingeniería y diseño para la transformación de documentos crudos en presentaciones ejecutivas 16:9 cinematográficas.

---

## 🎯 Objetivos de la Gobernanza
1. **Clusterización por Densidad Temática (Topic Density Clustering)**: Sustituir particiones matemáticas fijas por detección de transiciones temáticas reales basadas en encabezados Markdown y acumulación de ideas clave.
2. **Principio de la Pirámide de McKinsey (SCQA)**: Estructurar la narrativa en Situación, Complicación, Pregunta y Respuesta.
3. **Cálculo de Pacing Dinámico**: Adaptación del número de diapositivas y contenido a la duración en minutos solicitada por el usuario (~60s a 120s por diapositiva).
4. **Resiliencia Multi-Arquetipo**: Asignación estricta a plantillas adaptativas (`executive_scqa`, `bento_dashboard`, `comparison_delta`, `timeline_roadmap`, `hero_statement`).

---

## 🛠️ Arquitectura de Componentes

### 1. Extractor y Clasificador Semántico (`src/features/orbital-presentations/lib/document-parser.ts`)
- Extrae texto con preservación espacial mediante `extractSpatialTextFromPdf`.
- Clasifica el arquetipo dominante (`technical_architecture`, `business_pitch`, `audit_report`, `narrative_educational`, `executive_strategy`).
- Extrae métricas cuantificables verificables, pares de contraste (problema/solución) y secuencias paso a paso.

### 2. Descomponedor IA & Generador (`src/features/orbital-presentations/actions.ts`)
- Invocación con `callNvidiaNimChat` solicitando formato JSON tipado con Zod (`PresentationDecompositionRequest`).
- Fallback determinista que mapea directamente cada cluster temático a diapositivas SCQA sin omitir información crítica.

### 3. Auditor de Integridad y Completitud Sintáctica (`src/features/orbital-presentations/lib/presentation-auditor.ts`)
- **Erradicación de Truncamientos Ciegos**: Prohíbe terminantemente `words.slice(0, N)` o cortes con puntos suspensivos en titulares ejecutivos y Action Titles.
- **Detección y Reparación de Palabras Huérfanas (`assertSyntacticCompleteness`)**: Audita preposiciones, conjunciones y determinantes terminales (`de`, `en`, `para`, `con`, `sobre`, `por`, `el`, `la`, `los`, `las`, `que`, `su`, etc.) y restaura la completitud sintáctica oracional.
- **Auditoría Integral de Diapositivas (`auditAndRepairPresentationSlides`)**: Revisa y garantiza sentido autónomo completo en `title`, `actionTitle`, `keyPoints` y `timelineData` antes de persistir o renderizar en el cliente.

---

## 🧪 Pruebas Requeridas
Toda modificación debe validar `tests/unit/presentation-decomposition.test.ts`, `tests/unit/presentation-adaptive-pipeline.test.ts`, `tests/unit/spatial-document-extraction.test.ts` y `tests/unit/presentation-integrity-auditor.test.ts`.
