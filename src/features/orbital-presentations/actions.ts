'use server';

import { db } from '@/shared/api/db';
import { presentations } from '@/entities/schema';
import {
  presentationFormSchema,
  PresentationFormValues,
  PresentationSlide,
} from '@/entities/presentation/schemas';
import {
  inferOptimalLayoutStrategy,
  LayoutHeuristic,
  AbstractSlide,
} from '@/entities/presentation/heuristics';
import { PRESENTATION_TEMPLATES } from '@/entities/presentation/templates';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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

    if (presentationId) {
      // Verificar propiedad estricta para evitar sobreescritura entre tenants
      const existing = await db.query.presentations.findFirst({
        where: and(eq(presentations.id, presentationId), eq(presentations.userId, targetUserId)),
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
        .where(and(eq(presentations.id, presentationId), eq(presentations.userId, targetUserId)));
    } else {
      await db.insert(presentations).values({
        id: crypto.randomUUID(),
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

    revalidatePath('/presentations');
    revalidatePath('/dashboard');
    if (data.slug) {
      revalidatePath(`/p/${data.slug}`);
    }
    return { success: true, slug: data.slug };
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
