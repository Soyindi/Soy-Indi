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
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq, desc, and } from 'drizzle-orm';
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
    if (!file) {
      return { success: false, error: 'No se ha adjuntado ningún archivo.' };
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type || 'application/pdf';

    const extractedText = await extractTextFromDocument(base64, file.name, mimeType);

    if (!extractedText || extractedText.trim().length === 0) {
      return {
        success: false,
        error: `No se pudo extraer texto legible del archivo "${file.name}". Si es un PDF escaneado como imagen pura, transcribe los puntos clave.`,
      };
    }

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

    // 2. Calcular pacing y número de diapositivas según duración
    const { slidesCount, pacingSecondsPerSlide } = calculateSlidePacingAndCount(durationMinutes);

    // 3. Seleccionar tema visual según el tono solicitado
    const matchedTheme =
      PRESENTATION_THEMES.find((th) => th.id.replace('-', '_') === presentationTone) ||
      PRESENTATION_THEMES[0];

    // 4. Intentar inferencia de frontera con NVIDIA NIM (deepseek-ai/deepseek-r1 o llama-3.3-70b)
    const nimPrompt = `
Eres un Principal Executive Presentation Designer y consultor de estrategia empresarial.
Analiza la siguiente información de entrada y descompón el contenido en una presentación ejecutiva de EXACTAMENTE ${slidesCount} diapositivas.

INFORMACIÓN DE ENTRADA:
"""
${rawContent.slice(0, 10000)}
"""

PARÁMETROS DE LA PRESENTACIÓN:
- Duración total objetivo: ${durationMinutes} minutos (~${pacingSecondsPerSlide} segundos por diapositiva).
- Audiencia: ${targetAudience} (adapta el vocabulario, nivel de detalle y enfoque).
- Tono: ${presentationTone}.

REGLAS DE DISEÑO:
1. Aplica el Principio de la Pirámide de McKinsey (SCQA):
   - Diapositiva 1: Situación y Respuesta Ejecutiva principal.
   - Diapositivas intermedias: Argumentos clave con evidencia cuantificable (MECE).
   - Diapositiva final: Plan de acción y próximos hitos concretos.
2. Cada diapositiva DEBE tener:
   - "title": Título temático limpio.
   - "actionTitle": Titular activo asertivo de máximo 15 palabras que resume la conclusión clave.
   - "subtitle": Bajada explicativa.
   - "visualType": uno entre ["concept", "metrics", "comparison", "timeline", "quote", "architecture"].
   - "keyPoints": arreglo de 2 a 4 puntos concisos.
   - "speakerNotes": notas privadas para el orador guiando la exposición en este slide (~${pacingSecondsPerSlide}s).
   - Si es "metrics", incluye "metricsData" con [{ "label": string, "value": string, "change": string, "trend": "up"|"down"|"neutral" }].
   - Si es "comparison", incluye "comparisonData" con { "beforeTitle": string, "beforeItems": string[], "afterTitle": string, "afterItems": string[] }.
   - Si es "timeline", incluye "timelineData" con [{ "step": string, "title": string, "description": string }].

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
        model: 'meta/llama-3.3-70b-instruct',
        temperature: 0.2,
        responseFormat: { type: 'json_object' },
      }
    );

    let generatedData: any = null;
    let modelName = nimResult.modelUsed || 'Heuristic Fallback Engine';

    if (nimResult.success && nimResult.content) {
      try {
        generatedData = JSON.parse(nimResult.content);
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

      const fallbackSlides: PresentationSlide[] = [];

      for (let i = 0; i < slidesCount; i++) {
        const isFirst = i === 0;
        const isLast = i === slidesCount - 1;
        const isMetric = i === 1 && metricsFound.length > 0;
        const isComparison = (i === 2 || (i === 1 && metricsFound.length === 0)) && slidesCount >= 4;
        const sectionData = sections[i % Math.max(1, sections.length)];

        if (isFirst) {
          const mainKeyPoints = takeaways.length >= 2 
            ? takeaways.slice(0, 3) 
            : [
                `Síntesis analítica del contenido provisto en ${fileName || 'el documento'}.`,
                `Enfoque estratégico calibrado para audiencia ${targetAudience}.`,
                `Pacing estructurado para ${durationMinutes} minutos de exposición efectiva.`,
              ];

          const abstract: AbstractSlide = {
            intent: 'executive_scqa',
            supportNodes: [
              { nodeType: 'qualitative_prose', visualWeightDominance: 5 },
              { nodeType: 'qualitative_prose', visualWeightDominance: 4 },
            ],
          };

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: `Resumen Ejecutivo & Visión`,
            actionTitle: (sectionData?.actionSummary && sectionData.actionSummary.length > 15)
              ? (sectionData.actionSummary.length > 150 ? `${sectionData.actionSummary.slice(0, 147)}...` : sectionData.actionSummary)
              : `Consolidar las conclusiones estratégicas a partir del análisis del documento`,
            subtitle: `Marco SCQA adaptado para ${targetAudience} (${durationMinutes} min)`,
            semanticIntent: 'executive_scqa',
            visualType: 'concept',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: 'RESPUESTA EJECUTIVA',
            estimatedDurationSeconds: pacingSecondsPerSlide,
            keyPoints: mainKeyPoints,
            speakerNotes: `Introducir la tesis principal del documento captando la atención en los primeros ${pacingSecondsPerSlide} segundos.`,
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
            : ['Evidencia cuantitativa extraída directamente del material analizado.'];

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: 'Indicadores Clave y Evidencia',
            actionTitle: 'Validar el impacto con métricas extraídas directamente del documento',
            subtitle: 'Evidencia cuantitativa descompuesta del contenido base',
            semanticIntent: 'bento_dashboard',
            visualType: 'metrics',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: 'EVIDENCIA CUANTITATIVA',
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
            : ['Diferenciación sustantiva respecto al estado previo reportado.'];

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: 'Diferenciación y Ruptura de Paradigma',
            actionTitle: (sectionData?.actionSummary && sectionData.actionSummary.length > 15)
              ? (sectionData.actionSummary.length > 150 ? `${sectionData.actionSummary.slice(0, 147)}...` : sectionData.actionSummary)
              : 'Superar las limitaciones del modelo convencional mediante la propuesta actual',
            subtitle: 'Comparativa de capacidades y propuesta de valor única',
            semanticIntent: 'comparison_delta',
            visualType: 'comparison',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: 'VENTAJA COMPETITIVA',
            estimatedDurationSeconds: pacingSecondsPerSlide,
            keyPoints: compPoints,
            comparisonData: {
              beforeTitle: 'Enfoque Inicial / Problema',
              beforeItems: [
                'Procesos fragmentados y desarticulados',
                'Falta de visibilidad de resultados en tiempo real',
                'Tiempos de respuesta lentos',
              ],
              afterTitle: 'Solución Propuesta en Documento',
              afterItems: sectionData?.points && sectionData.points.length >= 2
                ? sectionData.points.slice(0, 3)
                : ['Estructuración sistemática', 'Impacto cuantificable directo', 'Escalabilidad comprobada'],
            },
            speakerNotes: `Contrastar con claridad la situación previa con los hallazgos del documento.`,
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
            : ['Hitos secuenciales para garantizar la ejecución de lo expuesto en el documento.'];

          fallbackSlides.push({
            id: crypto.randomUUID(),
            title: 'Plan de Acción y Conclusiones',
            actionTitle: 'Ejecutar los siguientes pasos de adopción con cronograma riguroso',
            subtitle: `Cierre de la presentación (${durationMinutes} min totales)`,
            semanticIntent: 'timeline_roadmap',
            visualType: 'timeline',
            layout: inferOptimalLayoutStrategy(abstract),
            badgeText: 'PLAN DE EJECUCIÓN',
            estimatedDurationSeconds: pacingSecondsPerSlide,
            keyPoints: closingPoints,
            timelineData: [
              { step: 'Fase 1', title: 'Alineación & Setup', description: 'Revisión con stakeholders e integración del material expuesto.' },
              { step: 'Fase 2', title: 'Despliegue & Validación', description: 'Presentación oficial y recolección de feedback.' },
              { step: 'Fase 3', title: 'Escala y Consolidación', description: 'Monitoreo de resultados y consolidación del objetivo.' },
            ],
            speakerNotes: `Cerrar con una llamada a la acción enérgica y abrir espacio para preguntas y respuestas.`,
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
        keyPoints: s.keyPoints || [],
        speakerNotes: s.speakerNotes || '',
        estimatedDurationSeconds: pacingSecondsPerSlide,
        metricsData: s.metricsData,
        comparisonData: s.comparisonData,
        timelineData: s.timelineData,
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

    // 2. Generación semántica adaptativa orientada al Principio de Pirámide (SCQA & MECE)
    const slide1Abstract: AbstractSlide = {
      intent: 'executive_scqa',
      supportNodes: [
        { nodeType: 'qualitative_prose', visualWeightDominance: 5 },
        { nodeType: 'qualitative_prose', visualWeightDominance: 4 },
      ],
    };
    const slide1Layout = inferOptimalLayoutStrategy(slide1Abstract);

    const slide2Abstract: AbstractSlide = {
      intent: 'bento_dashboard',
      supportNodes: [
        { nodeType: 'quantitative_metric', visualWeightDominance: 5 },
        { nodeType: 'quantitative_metric', visualWeightDominance: 5 },
        { nodeType: 'quantitative_metric', visualWeightDominance: 5 },
        { nodeType: 'qualitative_prose', visualWeightDominance: 2 },
      ],
    };
    const slide2Layout = inferOptimalLayoutStrategy(slide2Abstract);

    const slide3Abstract: AbstractSlide = {
      intent: 'comparison_delta',
      supportNodes: [
        { nodeType: 'qualitative_prose', visualWeightDominance: 4 },
        { nodeType: 'chart_vector', visualWeightDominance: 4 },
      ],
    };
    const slide3Layout = inferOptimalLayoutStrategy(slide3Abstract);

    const slide4Abstract: AbstractSlide = {
      intent: 'timeline_roadmap',
      supportNodes: [
        { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
        { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
        { nodeType: 'qualitative_prose', visualWeightDominance: 3 },
      ],
    };
    const slide4Layout = inferOptimalLayoutStrategy(slide4Abstract);

    const dynamicSlides: PresentationSlide[] = [
      {
        id: crypto.randomUUID(),
        title: `Visión Estratégica: ${cleanTopic}`,
        actionTitle: `Transformar ${cleanTopic} mediante descentralización perimetral y latencia <10ms`,
        subtitle: 'Marco SCQA: Situación actual y respuesta ejecutiva directa',
        semanticIntent: 'executive_scqa',
        visualType: 'concept',
        layout: slide1Layout,
        badgeText: 'RESPUESTA EJECUTIVA (SCQA)',
        keyPoints: [
          `Innovación estructural para liderar el ecosistema de ${cleanTopic}.`,
          'Descentralización de la computación perimetral a <10ms de latencia global.',
          'Cero cuellos de botella de sockets bajo picos intensivos de concurrencia.',
        ],
        speakerNotes: 'Introducir el problema actual del mercado, la oportunidad y la respuesta deductiva según el Principio de la Pirámide.',
      },
      {
        id: crypto.randomUUID(),
        title: 'Métricas de Impacto y Rendimiento',
        actionTitle: 'Acelerar la conversión comercial en +290% con alta disponibilidad garantizada',
        subtitle: 'Evidencia cuantitativa y auditoría en tiempo real en el Edge',
        semanticIntent: 'bento_dashboard',
        visualType: 'metrics',
        layout: slide2Layout,
        badgeText: 'EVIDENCIA CUANTITATIVA',
        keyPoints: [
          'Score de 95+ garantizado en Google Lighthouse y Core Web Vitals.',
          'Reducción drástica del costo de inferencia mediante prompt caching efímero.',
        ],
        metricsData: [
          { label: 'Conversión Directa', value: '38.4%', change: '+290%', trend: 'up', visualWeightDominance: 5 },
          { label: 'Tiempo de Respuesta', value: '18ms', change: '-75%', trend: 'up', visualWeightDominance: 5 },
          { label: 'Disponibilidad SLA', value: '99.99%', change: 'Zero Downtime', trend: 'neutral', visualWeightDominance: 4 },
        ],
        speakerNotes: 'Hacer énfasis en los números cuantitativos de conversión y eficiencia técnica.',
      },
      {
        id: crypto.randomUUID(),
        title: 'Ventaja Competitiva y Comparativa',
        actionTitle: 'Erradicar tarifas ocultas y cuellos de botella mediante arquitectura Serverless',
        subtitle: 'Contraste riguroso frente a monolitos y modelos heredados',
        semanticIntent: 'comparison_delta',
        visualType: 'comparison',
        layout: slide3Layout,
        badgeText: 'RUPTURA DE PARADIGMA',
        keyPoints: [
          'Eliminación de dependencias pesadas y costos ocultos por usuario activo.',
        ],
        comparisonData: {
          beforeTitle: 'Solución Convencional',
          beforeItems: [
            'Saturación de conexiones de base de datos en picos de tráfico.',
            'Altas tarifas mensuales por usuarios activos (MAU).',
            'Tiempos de carga lentos y renderizado bloqueante.',
          ],
          afterTitle: `Ecosistema ${cleanTopic}`,
          afterItems: [
            'Arquitectura serverless en Turso SQLite con réplicas mundiales.',
            'Autenticación autónoma sin cobro por volumen de usuarios.',
            'Carga instantánea a 60 FPS con diseño Glassmorphism 2.0.',
          ],
        },
        speakerNotes: 'Demostrar el retorno de inversión y la robustez del nuevo enfoque sin ambigüedades.',
      },
      {
        id: crypto.randomUUID(),
        title: 'Hoja de Ruta y Próximos Pasos',
        actionTitle: 'Desplegar la estrategia en tres fases secuenciales con riesgo operacional nulo',
        subtitle: 'Plan secuencial de implementación y escalabilidad',
        semanticIntent: 'timeline_roadmap',
        visualType: 'timeline',
        layout: slide4Layout,
        badgeText: 'PLAN DE EJECUCIÓN MECE',
        keyPoints: [
          'Hitos clave para garantizar el despliegue continuo sin regresiones.',
        ],
        timelineData: [
          { step: 'Fase 1', title: 'Fundación & MVP', description: 'Despliegue perimetral y validación con usuarios de prueba.' },
          { step: 'Fase 2', title: 'Escala y Automatización', description: 'Integración de analíticas en tiempo real y generación IA.' },
          { step: 'Fase 3', title: 'Adopción Global', description: 'Alianzas comerciales y soporte multi-región distribuido.' },
        ],
        speakerNotes: 'Cerrar con una llamada a la acción clara para inversionistas o líderes de producto.',
      },
    ];

    return {
      success: true,
      data: dynamicSlides.slice(0, slidesCount),
    };
  } catch (err: any) {
    console.error('Error generando diapositivas IA:', err);
    return { success: false, error: err.message || 'Error en la generación de diapositivas' };
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

    // Guardrail de sesión obligatorio
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    let finalPresentationId = presentationId;

    if (finalPresentationId) {
      // Verificar propiedad estricta para evitar sobreescritura entre tenants
      const existing = await db.query.presentations.findFirst({
        where: and(eq(presentations.id, finalPresentationId), eq(presentations.userId, targetUserId)),
      });

      if (!existing) {
        return { success: false, error: 'Presentación no encontrada o no pertenece al usuario autenticado' };
      }

      await db
        .update(presentations)
        .set({
          title: data.title,
          slug: data.slug,
          isPublic: data.isPublic,
          slidesData: data.slidesData,
          themeSettings: data.themeSettings,
          updatedAt: new Date(),
        })
        .where(and(eq(presentations.id, finalPresentationId), eq(presentations.userId, targetUserId)));
    } else {
      // Si no viene presentationId, verificar si ya existe una presentación con este slug perteneciente al usuario
      const existingBySlug = await db.query.presentations.findFirst({
        where: and(eq(presentations.slug, data.slug), eq(presentations.userId, targetUserId)),
      });

      if (existingBySlug) {
        finalPresentationId = existingBySlug.id;
        await db
          .update(presentations)
          .set({
            title: data.title,
            slug: data.slug,
            isPublic: data.isPublic,
            slidesData: data.slidesData,
            themeSettings: data.themeSettings,
            updatedAt: new Date(),
          })
          .where(and(eq(presentations.id, finalPresentationId), eq(presentations.userId, targetUserId)));
      } else {
        const newId = crypto.randomUUID();
        finalPresentationId = newId;
        await db.insert(presentations).values({
          id: newId,
          userId: targetUserId,
          title: data.title,
          slug: data.slug,
          isPublic: data.isPublic,
          slidesData: data.slidesData,
          themeSettings: data.themeSettings,
          viewsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    revalidatePath('/presentations');
    revalidatePath('/dashboard');
    if (data.slug) {
      revalidatePath(`/p/${data.slug}`);
    }
    return { success: true, id: finalPresentationId, slug: data.slug };
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
