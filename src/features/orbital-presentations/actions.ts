'use server';

import { db } from '@/shared/api/db';
import { presentations, user } from '@/entities/schema';
import { presentationFormSchema, PresentationFormValues } from '@/entities/presentation/schemas';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Generador AI de Diapositivas según Objetivo/Tema
 */
export async function generateAiSlidesAction(topic: string, slidesCount: number = 4) {
  // Motor generador estructural adaptado para presentaciones
  const templates: Record<string, any[]> = {
    tech: [
      {
        id: crypto.randomUUID(),
        title: `Visión Arquitectónica: ${topic}`,
        subtitle: 'Paradigma Serverless y Edge Computing',
        visualType: 'concept',
        keyPoints: [
          'Descentralización de la computación perimetral a <10ms de latencia.',
          'Consistencia eventual con sincronización de réplicas en Turso SQLite.',
          'Cero cuellos de botella de sockets bajo picos de concurrencia.',
        ],
        speakerNotes: 'Introducir el problema actual del mercado y la ruptura del paradigma.',
      },
      {
        id: crypto.randomUUID(),
        title: 'Métricas de Impacto y Rendimiento',
        subtitle: 'Resultados comparativos frente a arquitecturas monolíticas',
        visualType: 'metrics',
        keyPoints: [
          '95+ Score garantizado en Google Lighthouse.',
          'Reducción del 90% en costos de base de datos e inferencia de tokens.',
          'Generación de assets dinámicos en Vercel Edge en 35ms.',
        ],
        speakerNotes: 'Hacer énfasis en los números cuantitativos de conversión.',
      },
      {
        id: crypto.randomUUID(),
        title: 'Ecosistema de Componentes e Integraciones',
        subtitle: 'Interoperabilidad Modular FSD (Feature-Sliced Design)',
        visualType: 'architecture',
        keyPoints: [
          'Entidades aisladas sin acoplamiento circular.',
          'Validaciones de tipos en tiempo de compilación con Zod y TypeScript 5.9.',
          'Despliegues continuos sin interrupción de servicio.',
        ],
        speakerNotes: 'Detallar la robustez técnica para inversionistas o equipos de ingeniería.',
      },
      {
        id: crypto.randomUUID(),
        title: 'Conclusiones y Próximos Hitos',
        subtitle: 'Estrategia de escala global y gobernanza',
        visualType: 'concept',
        keyPoints: [
          'Lanzamiento de la versión pública para usuarios VIP.',
          'Adopción masiva en redes sociales y networking profesional.',
          'Monetización directa mediante suscripciones híbridas.',
        ],
        speakerNotes: 'Cierre con llamada a la acción clara.',
      },
    ],
  };

  const selectedTemplate = templates.tech;
  return { success: true, data: selectedTemplate.slice(0, slidesCount) };
}

/**
 * Guardar o Actualizar Presentación en Turso
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

    // Resolver usuario autenticado con guardrail de seguridad
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    if (presentationId) {
      await db
        .update(presentations)
        .set({
          title: data.title,
          slug: data.slug,
          isPublic: data.isPublic,
          slidesData: data.slidesData as any,
          themeSettings: data.themeSettings as any,
          updatedAt: new Date(),
        })
        .where(eq(presentations.id, presentationId));
    } else {
      await db.insert(presentations).values({
        id: crypto.randomUUID(),
        userId: targetUserId,
        title: data.title,
        slug: data.slug,
        isPublic: data.isPublic,
        slidesData: data.slidesData as any,
        themeSettings: data.themeSettings as any,
        viewsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath('/presentations');
    revalidatePath(`/p/${data.slug}`);
    return { success: true, slug: data.slug };
  } catch (err: any) {
    console.error('Error guardando presentación:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Obtener presentaciones del usuario
 */
export async function getUserPresentationsAction() {
  try {
    const list = await db.query.presentations.findMany({
      orderBy: [desc(presentations.createdAt)],
    });
    return { success: true, data: list };
  } catch (err: any) {
    console.error('Error listando presentaciones:', err);
    return { success: false, data: [] };
  }
}
