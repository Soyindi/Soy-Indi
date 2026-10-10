---
name: cv-intelligence-orchestrator
description: Protocolo de auditoría, extracción geométrica 2D y optimización de Currículums Vitae (Smart CV) bajo estándares ATS y normativa EU AI Act en INDI.
---

# 📄 Skill: Orquestador de Inteligencia de Smart CV (INDI 2026)

Esta habilidad documenta y gobierna el protocolo de ingeniería y arquitectura para la extracción, estructuración y validación de Currículums Vitae subidos en **INDI**.

---

## 🎯 Objetivos de la Gobernanza
1. **Extracción Espacial 2D (Spatial Layout-Aware)**: Preservar la separación física de plantillas de dos columnas (información personal/habilidades en columna izquierda vs. experiencia profesional en columna derecha), evitando la mezcla horizontal de líneas.
2. **Sanitización Regulatoria (EU AI Act)**: Descartar edad, estado civil, religión, filiación política y atributos no relacionados con el mérito profesional.
3. **Optimización Google XYZ / STAR**: Formulación de viñetas bajo el esquema *"Logré [X] medido por [Y] haciendo [Z]"*, señalizando `needs_metric = true` ante la ausencia de evidencia cuantitativa.
4. **Resiliencia Multi-Proveedor (Cascade AI Router)**: Enrutamiento en cascada: NVIDIA NIM ➔ Gemini 2.0 Flash ➔ OpenRouter ➔ Parser Heurístico Resiliente.

---

## 🛠️ Arquitectura de Componentes

### 1. Extractor Espacial (`src/shared/lib/spatialDocumentExtractor.ts`)
- Utiliza `unpdf` (`getDocumentProxy` y `getTextContent`).
- Inspecciona las matrices de transformación `transform = [scaleX, skewY, skewX, scaleY, posX, posY]`.
- Divide la página en columnas lógicas (corte en `pageWidth * 0.45`) cuando detecta distribución horizontal divergente, ordenando independientemente los bloques en $Y$.

### 2. Router Multimodal (`src/features/ai-smart-cv/lib/multimodal-parser.ts`)
- Orquesta la llamada a `callNvidiaNimChat` con ventana de contexto de alta capacidad.
- Recibe el texto estructurado espacialmente y devuelve un objeto fuertemente tipado validado por `multimodalCvExtractionSchema`.

### 3. Parser Heurístico Determinista (`src/features/ai-smart-cv/lib/cv-text-parser.ts`)
- Fallback local sin dependencias de red.
- Manejo de teléfonos internacionales y RUT chileno con exclusión de colisiones.
- Desacoplamiento de nombres de empresa multilínea y protección contra corte prematuro de viñetas con años históricos.

### 4. Auditor de Integridad Sintáctica & Pre-Route (`src/features/ai-smart-cv/lib/cv-auditor.ts`)
- **Pre-Route Candidate Classifier (`evaluateCvPreRouteStrategy`)**: Clasificación determinista en micro-segundos del arquetipo profesional (`executive_c_level`, `technical_specialist`, `clinical_healthcare`, `business_growth`) para guiar la inferencia LLM con tono y palabras clave personalizadas.
- **Auditor de Viñetas Laborales (`auditAndRepairCvBullet`)**: Erradicación de palabras huérfanas terminales (`de`, `en`, `para`, `con`, `sobre`), puntos suspensivos mutilantes (`...`) y prefijos obsoletos (`Logro:`, `Responsabilidad:`).
- **Auditor Integral de Extracción (`auditAndRepairCvExtraction`)**: Sanitización de resumen profesional y array de viñetas XYZ antes de su presentación y persistencia en Turso SQLite.

---

## 🧪 Pruebas Requeridas
Toda modificación debe aprobar la suite en `tests/unit/smart-cv-crud-and-export.test.ts`, `tests/unit/spatial-document-extraction.test.ts` y `tests/unit/cv-integrity-auditor.test.ts`.
