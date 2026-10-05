'use server';

import { db } from '@/shared/api/db';
import { presentations } from '@/entities/schema';
import {
  presentationFormSchema,
  PresentationFormValues,
  PresentationSlide,
  PresentationDecompositionRequest,
  presentationDecompositionRequestSchema,
  TargetAudience,
  PresentationTone,
  generatePresentationSlug,
  slugifyPresentationTitle,
  isReservedPresentationSlug,
  generatePresentationSlugAlternatives,
} from '@/entities/presentation/schemas';
import {
  inferOptimalLayoutStrategy,
  calculateSlidePacingAndCount,
  LayoutHeuristic,
  AbstractSlide,
} from '@/entities/presentation/heuristics';
import { PRESENTATION_TEMPLATES, PRESENTATION_THEMES } from '@/entities/presentation/templates';
import { callNvidiaNimChat } from '@/shared/api/nvidia-nim';
import { extractTextFromDocument, analyzeDocumentContent } from '@/features/orbital-presentations/lib/document-parser';
import {
  validateFileSignature,
  sanitizeExtractedText,
  assertZeroBinaryPersistence,
  calculateStorageTelemetry,
} from '@/shared/lib/fileSecurity';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq, desc, and, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Ingesta y Extracción de Texto Real desde Archivos (PDF, TXT, MD, CSV, DOC)
 * Convierte el archivo adjunto en texto plano y metadatos estructurados.
 */
export async function parsePresentationDocumentAction(formData: FormData): Promise<{
  success: boolean;
  extractedText?: string;
  fileName?: string;
  charCount?: number;
  error?: string;
}> {
  try {
    const file = formData.get('file') as File | null;
    const extractedTextParam = formData.get('extractedText') as string | null;
    const fileNameParam = (formData.get('fileName') as string | null) || file?.name || 'documento.pdf';

    if (extractedTextParam && extractedTextParam.trim().length > 0) {
      const sanitized = sanitizeExtractedText(extractedTextParam, { maxChars: 250000 });
      return {
        success: true,
        extractedText: sanitized,
        fileName: fileNameParam,
        charCount: sanitized.length,
      };
    }

    if (!file) {
      return { success: false, error: 'No se ha adjuntado ningún archivo ni texto de documento.' };
    }

    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    // 1. Procedimiento de Seguridad: Validación de Firma Binaria (Magic Bytes)
    const sigValidation = validateFileSignature(uint8, file.name, file.type);
    if (!sigValidation.valid) {
      return {
        success: false,
        error: sigValidation.error || 'Archivo rechazado por control de seguridad de firmas binarias.',
      };
    }

    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = sigValidation.mimeType || file.type || 'application/pdf';

    const rawExtractedText = await extractTextFromDocument(base64, file.name, mimeType);

    // 2. Procedimiento de Seguridad: Sanitización de Texto y Mitigación de DoS / Inyecciones
    const extractedText = sanitizeExtractedText(rawExtractedText, { maxChars: 250000 });

    if (!extractedText || extractedText.trim().length === 0) {
      return {
        success: false,
        error: `No se pudo extraer texto legible del archivo "${file.name}". Si es un PDF escaneado como imagen pura, transcribe los puntos clave.`,
      };
    }

    // 3. Telemetría de Compresión e Ingesta Efímera (Cero Almacenamiento en BD)
    const telemetry = calculateStorageTelemetry(file.size, extractedText.length);
    console.info(
      `[Presentation File Ingestion] ${file.name} (${file.size} bytes) -> Reducción de almacenamiento BD: ${telemetry.storageReductionPercent}% (Estrategia: ${telemetry.persistenceStrategy})`
    );

    return {
      success: true,
      extractedText,
      fileName: file.name,
      charCount: extractedText.length,
    };
  } catch (err: any) {
    console.error('Error extrayendo texto del documento de presentación:', err);
    return {
      success: false,
      error: err.message || 'Error procesando el documento adjunto.',
    };
  }
}

/**
 * Server Action: Descomposición Inteligente con Modelos de Frontera (NVIDIA NIM / Fallbacks)
 * Procesa archivos (texto extraído) o conceptos libres, calculando el pacing y estructurando diapositivas SCQA.
 */
export async function decomposeAndGeneratePresentationAction(
  request: PresentationDecompositionRequest,
  userId?: string
): Promise<{
  success: boolean;
  data?: PresentationFormValues;
  modelUsed?: string;
  error?: string;
}> {
  try {
    // 1. Validar inputs con Zod
    const validated = presentationDecompositionRequestSchema.safeParse(request);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues.map((i) => i.message).join(', '),
      };
    }

    const { rawContent, durationMinutes, targetAudience, presentationTone, fileName } =
      validated.data;

    // 2. Analizar semánticamente el documento o texto recibido (SAP Engine)
    const docAnalysis = analyzeDocumentContent(rawContent, fileName);
    const resolvedArchetype = validated.data.documentArchetype || docAnalysis.detectedArchetype;

    // 3. Calcular pacing y número de diapositivas según duración
    const { slidesCount, pacingSecondsPerSlide } = calculateSlidePacingAndCount(durationMinutes);

    // 4. Seleccionar tema visual según el tono solicitado
    const matchedTheme =
      PRESENTATION_THEMES.find((th) => th.id.replace('-', '_') === presentationTone) ||
      PRESENTATION_THEMES[0];

    // 5. Intentar inferencia de frontera con NVIDIA NIM (deepseek-ai/deepseek-r1 o llama-3.3-70b)
    const nimPrompt = `
Eres un Principal Executive Presentation Designer y consultor de estrategia empresarial.
Analiza la siguiente información de entrada y descompón el contenido en una presentación ejecutiva de EXACTAMENTE ${slidesCount} diapositivas.

PERFIL SEMÁNTICO DETECTADO:
- Arquetipo de Documento: ${resolvedArchetype} (Confianza: ${(docAnalysis.archetypeConfidence * 100).toFixed(0)}%)
- Título Sugerido: "${docAnalysis.titleSuggestion}"
- Contiene Métricas Reales: ${docAnalysis.hasMetrics ? 'SÍ (' + docAnalysis.detectedMetrics.map(m => m.label + ': ' + m.value).join(', ') + ')' : 'NO (PROHIBIDO inventar métricas si no están en el texto)'}
- Contiene Contraste/Dolores: ${docAnalysis.hasContrast ? 'SÍ (' + docAnalysis.contrastBlocks.length + ' bloques detectados)' : 'NO'}
- Contiene Pasos/Secuencias: ${docAnalysis.hasSequence ? 'SÍ (' + docAnalysis.sequenceSteps.length + ' pasos detectados)' : 'NO'}

INFORMACIÓN DE ENTRADA (TEXTO REAL DEL USUARIO):
"""
${rawContent.slice(0, 10000)}
"""

PARÁMETROS DE LA PRESENTACIÓN:
- Duración total objetivo: ${durationMinutes} minutos (~${pacingSecondsPerSlide} segundos por diapositiva).
- Audiencia: ${targetAudience} (adapta el vocabulario, nivel de detalle y enfoque).
- Tono: ${presentationTone}.

REGLAS DE ADAPTACIÓN SEMÁNTICA ESTRICTAS:
1. FIDELIDAD ABSOLUTA AL TEXTO:
   - CADA viñeta en "keyPoints" DEBE parafrasear o citar un hecho, argumento o conclusión presente en el texto de entrada.
   - NUNCA uses texto de relleno genérico como "análisis deductivo perimetral" o "optimización sostenida".
   - Si el texto carece de números, NO crees diapositivas de tipo "metrics"; utiliza "concept", "architecture" o "comparison".
   - Si el texto tiene bloques de contraste, prioriza un slide de tipo "comparison" con beforeItems y afterItems extraídos del texto.
   - Si el texto tiene pasos o cronogramas, prioriza un slide de tipo "timeline" con los pasos reales.
2. Aplica el Principio de la Pirámide de McKinsey (SCQA):
   - Diapositiva 1: Situación y Respuesta Ejecutiva principal.
   - Diapositivas intermedias: Argumentos clave con evidencia cuantificable (MECE).
   - Diapositiva final: Plan de acción y próximos hitos concretos basados en las conclusiones reales.
3. Cada diapositiva DEBE tener:
   - "title": Título temático limpio y representativo del tema específico.
   - "actionTitle": Titular activo asertivo de máximo 15 palabras que sintetiza la conclusión clave de ese punto.
   - "subtitle": Bajada explicativa basada en el texto.
   - "visualType": uno entre ["concept", "metrics", "comparison", "timeline", "quote", "architecture"].
   - "keyPoints": arreglo de 2 a 4 puntos concisos directamente relacionados con el texto.
   - "speakerNotes": notas privadas para el orador guiando la exposición (~${pacingSecondsPerSlide}s).
   - Solo incluir "metricsData" si hay métricas numéricas verificables en el texto original.
   - Solo incluir "comparisonData" con puntos contrastantes extraídos del texto.
   - Solo incluir "timelineData" con fases y pasos descritos en el texto.

RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO CON ESTA ESTRUCTURA:
{
  "presentationTitle": string,
  "slug": string (slug en minúsculas con guiones, ej. mi-presentacion-2026),
  "slides": [
    {
      "id": string,
      "title": string,
      "actionTitle": string,
      "subtitle": string,
      "semanticIntent": "executive_scqa" | "bento_dashboard" | "comparison_delta" | "timeline_roadmap" | "hero_statement",
      "visualType": "concept" | "metrics" | "comparison" | "timeline" | "quote" | "architecture",
      "badgeText": string,
      "keyPoints": string[],
      "speakerNotes": string,
      "metricsData": optional array,
      "comparisonData": optional object,
      "timelineData": optional array
    }
  ]
}
`;

    const nimResult = await callNvidiaNimChat(
      [
        {
          role: 'system',
          content: 'Eres un sistema de generación de presentaciones empresariales. Respondes únicamente en JSON estructurado.',
        },
        { role: 'user', content: nimPrompt },
      ],
      {
        model: 'meta/llama-3.2-11b-vision-instruct',
        temperature: 0.2,
      }
    );

    let generatedData: any = null;
    let modelName = nimResult.modelUsed || 'Heuristic Fallback Engine';

    if (nimResult.success && nimResult.content) {
      try {
        // Limpiar posibles fences de markdown ```json ... ``` devueltos por el LLM
        let cleanJson = nimResult.content.trim();
        const jsonMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanJson = jsonMatch[1].trim();
        }
        generatedData = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.warn('Fallo parseando JSON de NVIDIA NIM, usando fallback heurístico:', parseErr);
      }
    }

    // 5. Si falló NIM (o no hay API key configurada), activar el pipeline semántico heurístico alimentado del contenido real
    if (!generatedData || !Array.isArray(generatedData.slides) || generatedData.slides.length === 0) {
      modelName = 'INDI Semantic Heuristics Engine';
      
      // Analizar semánticamente el documento o texto recibido
      const docAnalysis = analyzeDocumentContent(rawContent, fileName);

      const presentationTitle = docAnalysis.titleSuggestion || (fileName
        ? `Análisis de Documento: ${fileName.replace(/\.[^/.]+$/, '')}`
        : `Presentación Ejecutiva: ${rawContent.slice(0, 35).trim() || 'Estrategia 2026'}`);
      
      const safeSlug = presentationTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `presentacion-${Date.now()}`;

      // Extraer oraciones y secciones reales del documento
      const sections = docAnalysis.semanticSections;
      const metricsFound = docAnalysis.detectedMetrics;
      const takeaways = docAnalysis.keyTakeaways;
      const contrast = docAnalysis.contrastBlocks;
      const sequences = docAnalysis.sequenceSteps;
      const concepts = docAnalysis.conceptDefinitions;

      const fallbackSlides: PresentationSlide[] = [];

      for (let i = 0; i < slidesCount; i++) {
        const isFirst = i === 0;
        const isLast = i === slidesCount - 1;
        const isMetric = i === 1 && metricsFound.length > 0;
        const isComparison = (i === 2 || (i === 1 && metricsFound.length === 0)) && contrast.length > 0;
        const isConceptArchitecture = concepts.length > 0 && !isFirst && !isLast && !isMetric && !isComparison;
        const sectionData = sections[i % Math.max(1, sections.length)];

        if (isFirst) {
          const mainKeyPoints = takeaways.length >= 2 
            ? takeaways.slice(0, 3) 
            : (sectionData?.points && sectionData.points.length > 0 ? sectionData.points.slice(0, 3) : [rawContent.slice(0, 120).trim()]);

          const abstract: AbstractSlide = {
            intent: 'executive_scqa',
            supportNodes: [
              { nodeType: 'qualitative_prose', visualWeightDominance: 5 },
              { nodeType: 'qualitative_prose', visualWeightDominance: 4 },
            ],
          };

          const firstActionTitle = (sectionData?.actionSummary && sectionData.actionSummary.length > 15)
            ? (sectionData.actionSummary.length > 150 ? `${sectionData.actionSummary.slice(0, 147)}...` : sectionData.actionSummary)
            : (takeaways[0] || docAnalysis.titleSuggestion);

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: sectionData?.heading || docAnalysis.titleSuggestion,
            actionTitle: firstActionTitle,
            subtitle: fileName ? `Fuente: ${fileName}` : `Síntesis ejecutiva del documento`,
            semanticIntent: 'executive_scqa',
            visualType: 'concept',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: 'VISIÓN & SÍNTESIS',
            estimatedDurationSeconds: pacingSecondsPerSlide,
            keyPoints: mainKeyPoints,
            speakerNotes: `Exponer los fundamentos iniciales del documento analizado.`,
          });
        } else if (isMetric) {
          const metricsForSlide = metricsFound.slice(0, 3).map((m) => ({
            label: m.label,
            value: m.value,
            change: m.change || (m.trend === 'up' ? '+100%' : undefined),
            trend: m.trend,
            visualWeightDominance: 5,
          }));

          const abstract: AbstractSlide = {
            intent: 'bento_dashboard',
            supportNodes: metricsForSlide.map((m) => ({
              nodeType: 'quantitative_metric',
              visualWeightDominance: m.visualWeightDominance,
            })),
          };

          const keyMetricPoints = sectionData?.points && sectionData.points.length > 0
            ? sectionData.points.slice(0, 2)
            : [takeaways[1] || takeaways[0] || 'Datos cuantitativos extraídos del documento.'];

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: sectionData?.heading || 'Evidencia Cuantitativa & Métricas',
            actionTitle: sectionData?.actionSummary || 'Validar el impacto con métricas extraídas directamente del documento',
            subtitle: 'Evidencia cuantitativa descompuesta del contenido base',
            semanticIntent: 'bento_dashboard',
            visualType: 'metrics',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: 'MÉTRICAS DEL DOCUMENTO',
            estimatedDurationSeconds: pacingSecondsPerSlide,
            keyPoints: keyMetricPoints,
            metricsData: metricsForSlide,
            speakerNotes: `Detallar las cifras y deltas extraídos del archivo durante aproximadamente ${pacingSecondsPerSlide} segundos.`,
          });
        } else if (isComparison) {
          const abstract: AbstractSlide = {
            intent: 'comparison_delta',
            supportNodes: [
              { nodeType: 'qualitative_prose', visualWeightDominance: 4 },
              { nodeType: 'chart_vector', visualWeightDominance: 4 },
            ],
          };

          const compPoints = sectionData?.points && sectionData.points.length > 0
            ? sectionData.points.slice(0, 2)
            : [takeaways[2] || takeaways[0] || 'Comparativa de factores extraídos del texto.'];

          const beforeItems = contrast.length > 0 ? contrast.map((c) => c.problemAspect) : [sectionData?.points[0] || 'Punto de partida del documento'];
          const afterItems = contrast.length > 0 ? contrast.map((c) => c.solutionAspect) : [sectionData?.points[1] || takeaways[1] || 'Propuesta y conclusiones'];

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: sectionData?.heading || 'Contraste y Diferenciación',
            actionTitle: (sectionData?.actionSummary && sectionData.actionSummary.length > 15)
              ? (sectionData.actionSummary.length > 150 ? `${sectionData.actionSummary.slice(0, 147)}...` : sectionData.actionSummary)
              : (takeaways[1] || 'Contraste entre los puntos analizados'),
            subtitle: 'Comparativa basada en el texto subido',
            semanticIntent: 'comparison_delta',
            visualType: 'comparison',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: 'CONTRASTE DOCUMENTAL',
            estimatedDurationSeconds: pacingSecondsPerSlide,
            keyPoints: compPoints,
            comparisonData: {
              beforeTitle: 'Situación Previa / Diagnóstico',
              beforeItems,
              afterTitle: 'Resolución / Hallazgos Clave',
              afterItems,
            },
            speakerNotes: `Contrastar con claridad los puntos analizados en el documento.`,
          });
        } else if (isLast) {
          const abstract: AbstractSlide = {
            intent: 'timeline_roadmap',
            supportNodes: [
              { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
              { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
              { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
            ],
          };

          const closingPoints = takeaways.length > 2
            ? takeaways.slice(-2)
            : (sectionData?.points && sectionData.points.length > 0 ? sectionData.points : [takeaways[0] || 'Conclusiones finales del documento.']);

          const timelineData = sequences.length >= 2
            ? sequences.map((s) => ({ step: `Paso 0${s.stepIndex}`, title: s.title, description: s.detail }))
            : (sectionData?.points && sectionData.points.length >= 2
                ? sectionData.points.slice(0, 3).map((pt, pIdx) => ({
                    step: `Punto 0${pIdx + 1}`,
                    title: pt.slice(0, 30),
                    description: pt,
                  }))
                : takeaways.slice(0, 3).map((tk, tIdx) => ({
                    step: `Hito 0${tIdx + 1}`,
                    title: tk.slice(0, 30),
                    description: tk,
                  })));

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: sectionData?.heading || 'Conclusiones y Próximos Pasos',
            actionTitle: (sectionData?.actionSummary && sectionData.actionSummary.length > 15)
              ? (sectionData.actionSummary.length > 150 ? `${sectionData.actionSummary.slice(0, 147)}...` : sectionData.actionSummary)
              : (takeaways[takeaways.length - 1] || 'Conclusiones determinantes del documento'),
            subtitle: `Cierre del análisis (${durationMinutes} min totales)`,
            semanticIntent: 'timeline_roadmap',
            visualType: 'timeline',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: 'CONCLUSIONES',
            estimatedDurationSeconds: pacingSecondsPerSlide,
            keyPoints: closingPoints,
            timelineData,
            speakerNotes: `Cerrar con los puntos de conclusión extraídos directamente del documento.`,
          });
        } else if (isConceptArchitecture) {
          // Slide dedicado a conceptos clave o arquitectura técnica
          const abstract: AbstractSlide = {
            intent: 'executive_scqa',
            supportNodes: concepts.slice(0, 3).map(() => ({
              nodeType: 'qualitative_prose',
              visualWeightDominance: 4,
            })),
          };

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: resolvedArchetype === 'technical_architecture' ? 'Arquitectura y Componentes Clave' : 'Conceptos y Fundamentos',
            actionTitle: sectionData?.actionSummary || 'Estructura modular de los conceptos fundamentales',
            subtitle: 'Definiciones y pilares extraídos del documento',
            semanticIntent: 'executive_scqa',
            visualType: resolvedArchetype === 'technical_architecture' ? 'architecture' : 'concept',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: 'FUNDAMENTOS',
            estimatedDurationSeconds: pacingSecondsPerSlide,
            keyPoints: concepts.slice(0, 3).map((c) => `${c.term}: ${c.definition}`),
            speakerNotes: `Explicar los términos y la arquitectura descrita. Tiempo asignado: ${pacingSecondsPerSlide} segundos.`,
          });
        } else {
          // Diapositivas intermedias mapeadas con el contenido específico de cada sección
          const abstract: AbstractSlide = {
            intent: 'executive_scqa',
            supportNodes: [{ nodeType: 'qualitative_prose', visualWeightDominance: 4 }],
          };

          const slideAction = (sectionData?.actionSummary && sectionData.actionSummary.length > 15)
            ? (sectionData.actionSummary.length > 150 ? `${sectionData.actionSummary.slice(0, 147)}...` : sectionData.actionSummary)
            : `Profundizar en la dimensión analítica y temática de la sección ${i + 1}`;

          const slidePoints = sectionData?.points && sectionData.points.length > 0
            ? sectionData.points
            : [
                'Análisis de los hallazgos clave reportados en el material base.',
                'Alineación estratégica con los objetivos del equipo.',
              ];

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: sectionData?.heading || `Eje Temático 0${i + 1}`,
            actionTitle: slideAction,
            subtitle: `Desglose analítico del documento base`,
            semanticIntent: 'executive_scqa',
            visualType: 'concept',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: `MÓDULO 0${i + 1}`,
            estimatedDurationSeconds: pacingSecondsPerSlide,
            keyPoints: slidePoints,
            speakerNotes: `Mantener el ritmo. Duración estimada para este slide: ${pacingSecondsPerSlide} segundos.`,
          });
        }
      }

      const finalFormValues: PresentationFormValues = {
        title: presentationTitle,
        slug: safeSlug,
        isPublic: true,
        targetDurationMinutes: durationMinutes,
        targetAudience,
        presentationTone,
        themeSettings: matchedTheme,
        slidesData: fallbackSlides,
      };

      return {
        success: true,
        data: finalFormValues,
        modelUsed: modelName,
      };
    }

    // 6. Si NIM respondió con datos válidos, procesar y asegurar layouts heurísticos
    const slides: PresentationSlide[] = (generatedData.slides || []).map((s: any, idx: number) => {
      const abstract: AbstractSlide = {
        intent: s.semanticIntent || (s.visualType === 'metrics' ? 'bento_dashboard' : 'executive_scqa'),
        supportNodes: (s.keyPoints || []).map(() => ({
          nodeType: (s.visualType === 'metrics' ? 'quantitative_metric' : 'qualitative_prose') as any,
          visualWeightDominance: 4,
        })),
      };

      const optimalLayout = inferOptimalLayoutStrategy(abstract);

      return {
        id: s.id || crypto.randomUUID(),
        title: s.title || `Diapositiva ${idx + 1}`,
        actionTitle: s.actionTitle,
        subtitle: s.subtitle,
        semanticIntent: s.semanticIntent || 'executive_scqa',
        visualType: s.visualType || 'concept',
        layout: s.layout || optimalLayout,
        badgeText: s.badgeText || `SLIDE ${idx + 1}`,
        keyPoints: Array.isArray(s.keyPoints)
          ? s.keyPoints.map((kp: any) => typeof kp === 'string' ? kp : (kp?.text || kp?.point || kp?.detail || kp?.title || String(kp ?? ''))).filter(Boolean)
          : [],
        speakerNotes: s.speakerNotes || '',
        estimatedDurationSeconds: pacingSecondsPerSlide,
        metricsData: Array.isArray(s.metricsData) && s.metricsData.length > 0 ? s.metricsData : undefined,
        comparisonData: s.comparisonData && typeof s.comparisonData === 'object' ? s.comparisonData : undefined,
        timelineData: Array.isArray(s.timelineData) && s.timelineData.length > 0 ? s.timelineData : undefined,
      };
    });

    const safeSlug =
      (generatedData.slug || generatedData.presentationTitle || 'presentacion-ia')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `presentacion-${Date.now()}`;

    const finalFormValues: PresentationFormValues = {
      title: generatedData.presentationTitle || 'Presentación Estructurada con IA',
      slug: safeSlug,
      isPublic: true,
      targetDurationMinutes: durationMinutes,
      targetAudience,
      presentationTone,
      themeSettings: matchedTheme,
      slidesData: slides,
    };

    return {
      success: true,
      data: finalFormValues,
      modelUsed: modelName,
    };
  } catch (err: any) {
    console.error('Error en descomposición de presentación:', err);
    return {
      success: false,
      error: err.message || 'Error procesando la descomposición de la presentación',
    };
  }
}

/**
 * Generador Estructurado de Diapositivas según Objetivo/Tema o Plantilla
 * Implementa el Principio de la Pirámide de McKinsey (SCQA) y el Motor Heurístico de Layouts.
 */
export async function generateAiSlidesAction(
  topic: string,
  templateCategory: string = 'pitch-deck',
  slidesCount: number = 4
) {
  try {
    const cleanTopic = topic.trim() || 'Plataforma Digital 2026';

    // 1. Verificar si coincide con una plantilla predefinida curada
    const matchedTemplate = PRESENTATION_TEMPLATES.find(
      (t) => t.id === templateCategory || t.category.toLowerCase().includes(templateCategory.toLowerCase())
    );

    if (matchedTemplate && cleanTopic.toLowerCase() === matchedTemplate.data.title.toLowerCase()) {
      return {
        success: true,
        data: matchedTemplate.data.slidesData.slice(0, slidesCount),
        theme: matchedTemplate.data.themeSettings,
      };
    }

    // 2. Si hay conexión a NVIDIA NIM, invocar inferencia de frontera para investigación y enriquecimiento profesional del tema escueto
    const nimPrompt = `
Eres un Principal Executive Presentation Designer y consultor de estrategia empresarial senior.
El usuario ha proporcionado un tema conciso o escueto: "${cleanTopic}".

TU MISIÓN:
Investiga internamente en tu base de conocimientos profesional sobre este tema y complementa con información rigurosa, hechos contrastables, terminología técnica y marcos conceptuales reconocidos (estándares de la industria, normativas relevantes, métricas plausibles y metodologías de gestión).

REGLAS DE DISEÑO MCKINSEY (SCQA):
1. Estructura una presentación ejecutiva de EXACTAMENTE ${slidesCount} diapositivas:
   - Slide 1: Visión Estratégica & Diagnóstico del tema (Situación y Complicación).
   - Slides intermedias: Pilares clave, requerimientos técnicos/normativos o métricas de impacto de la industria.
   - Slide final: Hoja de ruta estratégica o próximos pasos concretos.
2. Cada diapositiva DEBE tener:
   - "title": Título temático limpio y representativo del tema específico.
   - "actionTitle": Titular asertivo tipo consultoría (máximo 15 palabras) que sintetice la conclusión o tesis clave.
   - "subtitle": Bajada explicativa que contextualice el punto.
   - "visualType": uno entre ["concept", "metrics", "comparison", "timeline", "architecture"].
   - "keyPoints": 2 a 4 puntos argumentales sustanciosos, elocuentes y enriquecidos profesionalmente.
   - "speakerNotes": Guía de exposición para el orador (~60s).
   - Opcionalmente "metricsData" (si aplica para ilustrar datos de la industria) o "timelineData" (para el cierre o roadmap).

RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO CON ESTA ESTRUCTURA:
{
  "presentationTitle": string (Título completo y profesional derivado del tema),
  "slides": [
    {
      "id": string,
      "title": string,
      "actionTitle": string,
      "subtitle": string,
      "semanticIntent": "executive_scqa" | "bento_dashboard" | "comparison_delta" | "timeline_roadmap",
      "visualType": "concept" | "metrics" | "comparison" | "timeline" | "architecture",
      "badgeText": string,
      "keyPoints": string[],
      "speakerNotes": string,
      "metricsData": optional array,
      "comparisonData": optional object,
      "timelineData": optional array
    }
  ]
}
`;

    const nimResult = await callNvidiaNimChat(
      [
        {
          role: 'system',
          content: 'Eres un sistema de investigación ejecutiva y generación de presentaciones de alto nivel. Respondes exclusivamente en JSON estructurado.',
        },
        { role: 'user', content: nimPrompt },
      ],
      {
        model: 'meta/llama-3.2-11b-vision-instruct',
        temperature: 0.25,
      }
    );

    if (nimResult.success && nimResult.content) {
      try {
        let cleanJson = nimResult.content.trim();
        const jsonMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) cleanJson = jsonMatch[1].trim();

        const parsed = JSON.parse(cleanJson);
        if (parsed.slides && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          const aiSlides: PresentationSlide[] = parsed.slides.slice(0, slidesCount).map((s: any, idx: number) => ({
            id: s.id || crypto.randomUUID(),
            title: s.title || `Eje Temático 0${idx + 1}`,
            actionTitle: s.actionTitle,
            subtitle: s.subtitle,
            semanticIntent: s.semanticIntent || 'executive_scqa',
            visualType: s.visualType || (idx === parsed.slides.length - 1 ? 'timeline' : 'concept'),
            layout: s.layout || 'standard',
            badgeText: s.badgeText || `SLIDE ${idx + 1}`,
            keyPoints: Array.isArray(s.keyPoints)
              ? s.keyPoints.map((kp: any) => typeof kp === 'string' ? kp : (kp?.text || kp?.point || kp?.detail || kp?.title || String(kp ?? ''))).filter(Boolean)
              : [],
            speakerNotes: s.speakerNotes || '',
            estimatedDurationSeconds: 60,
            metricsData: Array.isArray(s.metricsData) && s.metricsData.length > 0 ? s.metricsData : undefined,
            comparisonData: s.comparisonData && typeof s.comparisonData === 'object' ? s.comparisonData : undefined,
            timelineData: Array.isArray(s.timelineData) && s.timelineData.length > 0 ? s.timelineData : undefined,
          }));

          return {
            success: true,
            presentationTitle: parsed.presentationTitle || cleanTopic,
            data: aiSlides,
            modelUsed: nimResult.modelUsed || 'meta/llama-3.2-11b-vision-instruct',
          };
        }
      } catch (parseErr) {
        console.warn('[QuickTopic AI] Fallback a motor heurístico por error de parseo:', parseErr);
      }
    }

    // 3. Fallback: Procesar el input del usuario mediante el analizador semántico heurístico (SAP Engine)
    const docAnalysis = analyzeDocumentContent(cleanTopic);
    const sections = docAnalysis.semanticSections;
    const takeaways = docAnalysis.keyTakeaways;

    const dynamicSlides: PresentationSlide[] = [];
    const count = Math.min(Math.max(2, slidesCount), 6);

    for (let i = 0; i < count; i++) {
      const isFirst = i === 0;
      const isLast = i === count - 1;
      const section = sections[i % Math.max(1, sections.length)];
      
      const abstract: AbstractSlide = {
        intent: isFirst ? 'executive_scqa' : isLast ? 'timeline_roadmap' : 'executive_scqa',
        supportNodes: [{ nodeType: 'qualitative_prose', visualWeightDominance: 4 }],
      };

      const title = section?.heading || (isFirst ? `Visión: ${cleanTopic}` : `Eje Clave 0${i + 1}`);
      const actionTitle = (section?.actionSummary && section.actionSummary.length > 15)
        ? (section.actionSummary.length > 150 ? `${section.actionSummary.slice(0, 147)}...` : section.actionSummary)
        : (takeaways[i] || `Conclusión estratégica sobre ${cleanTopic}`);

      const points = section?.points && section.points.length > 0
        ? section.points
        : [takeaways[i] || `Desarrollo analítico de ${cleanTopic}`];

      dynamicSlides.push({
        id: crypto.randomUUID(),
        title,
        actionTitle,
        subtitle: isFirst ? 'Resumen Ejecutivo' : `Módulo temático 0${i + 1}`,
        semanticIntent: isFirst ? 'executive_scqa' : isLast ? 'timeline_roadmap' : 'executive_scqa',
        visualType: isLast ? 'timeline' : 'concept',
        layout: inferOptimalLayoutStrategy(abstract),
        badgeText: isFirst ? 'VISIÓN ESTRATÉGICA' : `PUNTO 0${i + 1}`,
        keyPoints: points,
        speakerNotes: `Exposición sobre ${title}.`,
        timelineData: isLast
          ? points.slice(0, 3).map((pt, pIdx) => ({
              step: `Hito 0${pIdx + 1}`,
              title: pt.slice(0, 30),
              description: pt,
            }))
          : undefined,
      });
    }

    return {
      success: true,
      presentationTitle: docAnalysis.titleSuggestion || cleanTopic,
      data: dynamicSlides.slice(0, slidesCount),
    };
  } catch (err: any) {
    console.error('Error generando diapositivas IA:', err);
    return { success: false, error: err.message || 'Error en la generación de diapositivas' };
  }
}

/**
 * Server Action: Asistente Granular de IA por Diapositiva (Slide-Level AI Copilot)
 * Permite optimizar selectivamente el Action Title tipo McKinsey, viñetas de impacto o notas de orador.
 */
export async function refineSlideWithAiAction(
  request: {
    slide: PresentationSlide;
    action: 'action_title' | 'punchy_bullets' | 'speaker_notes' | 'all_enhancements';
    presentationContext?: {
      presentationTitle?: string;
      targetAudience?: TargetAudience;
      tone?: PresentationTone;
    };
  }
): Promise<{
  success: boolean;
  data?: {
    actionTitle?: string;
    keyPoints?: string[];
    speakerNotes?: string;
    suggestedVisualType?: any;
    rationale?: string;
  };
  modelUsed?: string;
  error?: string;
}> {
  try {
    const { slide, action, presentationContext } = request;
    const cleanTitle = slide.title || 'Diapositiva';
    const cleanSubtitle = slide.subtitle || '';
    const currentPoints = Array.isArray(slide.keyPoints) ? slide.keyPoints.filter(Boolean) : [];
    const audience = presentationContext?.targetAudience || 'investors';
    const tone = presentationContext?.tone || 'orbital_cyber';
    const deckTitle = presentationContext?.presentationTitle || 'Presentación Ejecutiva';

    // 1. Construir prompt contextual para el modelo de IA
    const prompt = `
Eres un Principal Executive Presentation Designer y consultor McKinsey senior.
Tu tarea es optimizar con rigor y elocuencia profesional la siguiente diapositiva de una presentación ejecutiva.

CONTEXTO GENERAL:
- Presentación: "${deckTitle}"
- Audiencia Objetivo: ${audience}
- Tono Visual: ${tone}

DIAPOSITIVA ACTUAL:
- Título: "${cleanTitle}"
- Subtítulo: "${cleanSubtitle}"
- Tipo Visual Actual: ${slide.visualType || 'concept'}
- Action Title Actual: "${slide.actionTitle || ''}"
- Puntos Clave Actuales:
${currentPoints.map((p, i) => `  ${i + 1}. ${p}`).join('\n') || '  (Sin puntos)'}
- Notas del Orador Actuales: "${slide.speakerNotes || ''}"

ACCIÓN SOLICITADA: "${action}"

REGLAS DE DISEÑO MCKINSEY:
1. "actionTitle": Titular asertivo tipo consultoría (máximo 14 palabras) que sintetice la conclusión o tesis clave ("So what?"). Ejemplo: "La arquitectura distribuida reduce la latencia en un 70% asegurando disponibilidad continua".
2. "keyPoints": De 2 a 4 viñetas directas, de alto impacto, que inicien con verbos de acción o conceptos clave en negrita, sin relleno innecesario.
3. "speakerNotes": Guion conversacional en primera persona de 2-3 oraciones (~45-60s) que le indique al orador exactamente qué enfatizar frente a la audiencia.
4. "suggestedVisualType": uno entre ["concept", "metrics", "comparison", "timeline", "quote", "architecture"].

RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO CON ESTA ESTRUCTURA:
{
  "actionTitle": string,
  "keyPoints": string[],
  "speakerNotes": string,
  "suggestedVisualType": "concept" | "metrics" | "comparison" | "timeline" | "architecture",
  "rationale": string (breve explicación en 1 frase)
}
`;

    // 2. Invocar cliente resiliente con soporte dual NVIDIA NIM / Google Gemini / OpenRouter
    const aiResult = await callNvidiaNimChat(
      [
        {
          role: 'system',
          content: 'Eres un copiloto de diseño de presentaciones ejecutivas McKinsey. Respondes únicamente en formato JSON estructurado.',
        },
        { role: 'user', content: prompt },
      ],
      {
        model: 'meta/llama-3.2-11b-vision-instruct',
        temperature: 0.3,
        responseFormat: { type: 'json_object' },
      }
    );

    if (aiResult.success && aiResult.content) {
      try {
        let cleanJson = aiResult.content.trim();
        const jsonMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) cleanJson = jsonMatch[1].trim();

        const parsed = JSON.parse(cleanJson);
        return {
          success: true,
          data: {
            actionTitle: parsed.actionTitle || undefined,
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.filter(Boolean) : undefined,
            speakerNotes: parsed.speakerNotes || undefined,
            suggestedVisualType: parsed.suggestedVisualType || undefined,
            rationale: parsed.rationale || 'Optimización semántica completada.',
          },
          modelUsed: aiResult.modelUsed || 'AI Model',
        };
      } catch (parseErr) {
        console.warn('[RefineSlide AI] Error parseando respuesta JSON, activando fallback:', parseErr);
      }
    }

    // 3. Fallback Heurístico Determinista de Alta Calidad (Garantía Offline y Cero Latencia)
    let fallbackActionTitle = slide.actionTitle;
    let fallbackKeyPoints = currentPoints.length > 0 ? [...currentPoints] : ['Fundamento clave del proyecto.'];
    let fallbackSpeakerNotes = slide.speakerNotes;
    let fallbackVisualType = slide.visualType || 'concept';

    // Generar Action Title McKinsey heurístico
    if (action === 'action_title' || action === 'all_enhancements' || !fallbackActionTitle) {
      if (slide.visualType === 'metrics' || (slide.metricsData && slide.metricsData.length > 0)) {
        fallbackActionTitle = `Validar el desempeño cuantitativo y tracción con métricas verificables`;
      } else if (slide.visualType === 'comparison') {
        fallbackActionTitle = `Superar las limitaciones tradicionales mediante una solución escalable`;
      } else if (slide.visualType === 'timeline') {
        fallbackActionTitle = `Ejecutar la hoja de ruta estratégica cumpliendo hitos críticos`;
      } else {
        fallbackActionTitle = `Alinear la visión de ${cleanTitle.toLowerCase()} con los objetivos clave de negocio`;
      }
    }

    // Generar viñetas ejecutivas con verbos de acción
    if (action === 'punchy_bullets' || action === 'all_enhancements') {
      fallbackKeyPoints = fallbackKeyPoints.map((kp) => {
        const cleaned = kp.replace(/^[-•*#]\s*/, '').trim();
        if (/^(liderar|diseñar|implementar|reducir|aumentar|optimizar|garantizar|consolidar)/i.test(cleaned)) {
          return cleaned;
        }
        return `Optimizar: ${cleaned}`;
      });
      if (fallbackKeyPoints.length === 0) {
        fallbackKeyPoints = [
          `Establecer los pilares estratégicos de ${cleanTitle}.`,
          `Consolidar la adopción en la audiencia clave.`,
        ];
      }
    }

    // Generar notas del orador
    if (action === 'speaker_notes' || action === 'all_enhancements' || !fallbackSpeakerNotes) {
      fallbackSpeakerNotes = `Presentar con claridad ${cleanTitle}. Destacar el titular de impacto: "${fallbackActionTitle}". Guiar a la audiencia a través de los puntos argumentales manteniendo un ritmo firme de exposición.`;
    }

    return {
      success: true,
      data: {
        actionTitle: fallbackActionTitle,
        keyPoints: fallbackKeyPoints,
        speakerNotes: fallbackSpeakerNotes,
        suggestedVisualType: fallbackVisualType,
        rationale: 'Sugerencia generada mediante el motor heurístico determinista McKinsey.',
      },
      modelUsed: 'INDI Heuristic Copilot',
    };
  } catch (err: any) {
    console.error('Error en refineSlideWithAiAction:', err);
    return { success: false, error: err.message || 'Error refinando la diapositiva con IA' };
  }
}

/**
 * Guardar o Actualizar Presentación en Turso con Guardrails Multi-Tenant
 */
export async function upsertPresentationAction(
  values: PresentationFormValues,
  presentationId?: string,
  userId?: string
) {
  try {
    const validated = presentationFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: validated.error.issues.map((i) => i.message).join(', ') };
    }

    const data = validated.data;

    // Guardrail de Seguridad: Cero Persistencia Binaria en Base de Datos (Anti-DB-Bloat)
    const zeroBinaryCheck = assertZeroBinaryPersistence({
      title: data.title,
      slug: data.slug,
      slidesData: data.slidesData,
    });
    if (!zeroBinaryCheck.safe) {
      return {
        success: false,
        error: `Rechazado por guardrail de base de datos: ${zeroBinaryCheck.violations.join(' ')}`,
      };
    }

    // Guardrail de sesión obligatorio
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    // Resolver slug canónico
    const desiredSlug = data.slug
      ? slugifyPresentationTitle(data.slug)
      : generatePresentationSlug(data.title, false);

    // Guardrail de Seguridad: Validación contra rutas y palabras reservadas
    if (isReservedPresentationSlug(desiredSlug)) {
      return {
        success: false,
        error: 'Este identificador está reservado para rutas del sistema. Por favor elige otro enlace.',
      };
    }

    if (presentationId) {
      // ================= MODO EDICIÓN EXPLÍCITA (ANTI-IDOR) =================
      const existing = await db.query.presentations.findFirst({
        where: and(eq(presentations.id, presentationId), eq(presentations.userId, targetUserId)),
      });

      if (!existing) {
        return { success: false, error: 'Presentación no encontrada o no pertenece al usuario autenticado.' };
      }

      // Si el slug cambió, verificar que no colisione con otra presentación existente
      if (desiredSlug && existing.slug !== desiredSlug) {
        const slugCollision = await db.query.presentations.findFirst({
          where: and(eq(presentations.slug, desiredSlug), ne(presentations.id, presentationId)),
        });
        if (slugCollision) {
          return { success: false, error: 'Este enlace personalizado de presentación ya está en uso por otro proyecto.' };
        }
      }

      await db
        .update(presentations)
        .set({
          title: data.title,
          slug: desiredSlug,
          isPublic: data.isPublic,
          slidesData: data.slidesData,
          themeSettings: data.themeSettings,
          updatedAt: new Date(),
        })
        .where(and(eq(presentations.id, presentationId), eq(presentations.userId, targetUserId)));

      try {
        revalidatePath('/presentations');
        revalidatePath('/dashboard');
        if (desiredSlug) {
          revalidatePath(`/p/${desiredSlug}`);
        }
        if (existing.slug && existing.slug !== desiredSlug) {
          revalidatePath(`/p/${existing.slug}`);
        }
      } catch {
        // Revalidation silente fuera de contexto HTTP
      }
      return { success: true, id: presentationId, slug: desiredSlug };
    } else {
      // ================= MODO CREACIÓN NUEVA INDEPENDIENTE =================
      let uniqueSlug = desiredSlug;
      const slugCollision = await db.query.presentations.findFirst({
        where: eq(presentations.slug, uniqueSlug),
      });

      if (slugCollision) {
        uniqueSlug = generatePresentationSlug(data.title, true);
      }

      const newId = crypto.randomUUID();
      await db.insert(presentations).values({
        id: newId,
        userId: targetUserId,
        title: data.title,
        slug: uniqueSlug,
        isPublic: data.isPublic,
        slidesData: data.slidesData,
        themeSettings: data.themeSettings,
        viewsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        revalidatePath('/presentations');
        revalidatePath('/dashboard');
        if (uniqueSlug) {
          revalidatePath(`/p/${uniqueSlug}`);
        }
      } catch {
        // Revalidation silente fuera de contexto HTTP
      }
      return { success: true, id: newId, slug: uniqueSlug };
    }
  } catch (err: any) {
    console.error('Error guardando presentación:', err);
    return { success: false, error: err.message || 'Error guardando presentación' };
  }
}

/**
 * Eliminar Presentación con Guardrails Multi-Tenant
 */
export async function deletePresentationAction(presentationId: string, userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    await db
      .delete(presentations)
      .where(and(eq(presentations.id, presentationId), eq(presentations.userId, targetUserId)));

    revalidatePath('/presentations');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('Error eliminando presentación:', err);
    return { success: false, error: err.message || 'Error eliminando presentación' };
  }
}

/**
 * Obtener presentaciones del usuario autenticado con aislamiento multi-tenant
 */
export async function getUserPresentationsAction(userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      // En modo desarrollo sin auth se retorna lista general vacía o fallback seguro
      return { success: true, data: [] };
    }
    const targetUserId = sessionResult.userId;

    const list = await db.query.presentations.findMany({
      where: eq(presentations.userId, targetUserId),
      orderBy: [desc(presentations.createdAt)],
    });
    return { success: true, data: list };
  } catch (err: any) {
    console.error('Error listando presentaciones:', err);
    return { success: false, data: [] };
  }
}

export type PresentationSlugAvailabilityResult = {
  available: boolean;
  status: 'available' | 'taken' | 'reserved' | 'invalid';
  message?: string;
  suggestions: string[];
};

/**
 * Server Action en tiempo real para verificar la disponibilidad de un slug de presentación
 * y proveer sugerencias automáticas de desambiguación si está ocupado o reservado.
 */
export async function checkPresentationSlugAvailabilityAction(
  rawSlug: string,
  currentPresentationId?: string
): Promise<PresentationSlugAvailabilityResult> {
  try {
    const slug = rawSlug.toLowerCase().trim();

    if (!slug || slug.length < 3) {
      return {
        available: false,
        status: 'invalid',
        message: 'El enlace debe tener al menos 3 caracteres.',
        suggestions: [],
      };
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return {
        available: false,
        status: 'invalid',
        message: 'Solo se permiten letras minúsculas, números y guiones.',
        suggestions: [],
      };
    }

    // 1. Verificar si está en la lista de slugs reservados del sistema
    if (isReservedPresentationSlug(slug)) {
      const suggestions = generatePresentationSlugAlternatives(slug);
      return {
        available: false,
        status: 'reserved',
        message: 'Este identificador está reservado para el sistema.',
        suggestions,
      };
    }

    // 2. Consultar colisión en la base de datos
    const existing = await db.query.presentations.findFirst({
      where: currentPresentationId
        ? and(eq(presentations.slug, slug), ne(presentations.id, currentPresentationId))
        : eq(presentations.slug, slug),
    });

    if (existing) {
      const suggestions = generatePresentationSlugAlternatives(slug);
      return {
        available: false,
        status: 'taken',
        message: 'Este enlace ya está en uso por otra presentación.',
        suggestions,
      };
    }

    return {
      available: true,
      status: 'available',
      message: '¡Enlace de presentación disponible!',
      suggestions: [],
    };
  } catch (error) {
    console.error('Error al comprobar disponibilidad de slug de presentación:', error);
    return {
      available: true,
      status: 'available',
      suggestions: [],
    };
  }
}

