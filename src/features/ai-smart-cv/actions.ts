'use server';

import { db } from '@/shared/api/db';
import { smartCvs, user } from '@/entities/schema';
import { cvFormSchema, CVFormValues, AtsAuditResult } from '@/entities/cv/schemas';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Motor de Auditoría y Optimización ATS
 * Analiza densidad de palabras clave, verbos de acción y compatibilidad con sistemas ATS
 */
export async function auditAtsScoreAction(
  cvData: CVFormValues
): Promise<{ success: boolean; data: AtsAuditResult }> {
  const role = cvData.targetRole.toLowerCase();
  const fullText = `
    ${cvData.content.summary} 
    ${cvData.content.skills.join(' ')} 
    ${cvData.content.experience.map((e) => `${e.role} ${e.company} ${e.bullets.join(' ')}`).join(' ')}
  `.toLowerCase();

  // Diccionario contextual de palabras clave de alto impacto
  const keywordDict: Record<string, string[]> = {
    software: ['typescript', 'react', 'next.js', 'api', 'sql', 'arquitectura', 'ci/cd', 'docker', 'git', 'testing'],
    frontend: ['react', 'next.js', 'typescript', 'tailwind', 'css', 'ui/ux', 'rendimiento', 'accesibilidad', 'web vitals'],
    marketing: ['roi', 'adquisición', 'campañas', 'analítica', 'conversión', 'seo', 'sem', 'funnel', 'kpis', 'growth'],
    datos: ['python', 'sql', 'etl', 'dashboard', 'power bi', 'modelado', 'analítica', 'machine learning', 'kpis'],
    management: ['liderazgo', 'presupuesto', 'okrs', 'kpis', 'estrategia', 'gestión', 'scrum', 'agile', 'roadmap'],
  };

  // Buscar categoría coincidente o palabras universales
  let expectedKeywords = ['kpis', 'liderazgo', 'estrategia', 'optimización', 'proyectos', 'impacto', 'resultados'];
  for (const [key, words] of Object.entries(keywordDict)) {
    if (role.includes(key)) {
      expectedKeywords = [...words];
      break;
    }
  }

  const matches: string[] = [];
  const missing: string[] = [];

  expectedKeywords.forEach((kw) => {
    if (fullText.includes(kw.toLowerCase())) {
      matches.push(kw);
    } else {
      missing.push(kw);
    }
  });

  // Cálculo heurístico de puntuación ATS (0 a 100)
  let score = 50; // Base por estructura
  if (cvData.content.summary.length > 50) score += 10;
  if (cvData.content.experience.length >= 2) score += 15;
  if (cvData.content.skills.length >= 5) score += 10;
  score += Math.min(15, matches.length * 3);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (matches.length >= 4) {
    strengths.push(`Excelente densidad de palabras clave técnicas para el rol de ${cvData.targetRole}.`);
  } else {
    improvements.push(`Incluye términos clave como "${missing.slice(0, 3).join(', ')}" para superar filtros ATS.`);
  }

  if (cvData.content.experience.some((e) => e.bullets.length >= 2)) {
    strengths.push('Uso de viñetas claras orientadas a funciones y responsabilidades.');
  } else {
    improvements.push('Agrega logros cuantificables (%, números, métricas) en cada experiencia.');
  }

  if (cvData.content.summary.length >= 80) {
    strengths.push('Resumen profesional conciso y bien enfocado en la propuesta de valor.');
  } else {
    improvements.push('Amplía tu resumen inicial para transmitir tu impacto en las primeras 3 líneas.');
  }

  return {
    success: true,
    data: {
      score: Math.min(100, Math.max(20, score)),
      strengths,
      improvements,
      keywordMatches: matches,
      missingKeywords: missing,
    },
  };
}

/**
 * Guardar o Actualizar Smart CV en Turso SQLite
 */
export async function upsertSmartCvAction(
  values: CVFormValues,
  cvId?: string
) {
  try {
    const validated = cvFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: validated.error.issues.map((i) => i.message).join(', ') };
    }

    const data = validated.data;

    // Calcular score ATS actualizado
    const audit = await auditAtsScoreAction(data);
    const calculatedScore = audit.data.score;

    // Obtener usuario demo o primer usuario existente
    const defaultUser = await db.query.user.findFirst();
    let targetUserId = defaultUser?.id;

    if (!targetUserId) {
      const [newUser] = await db.insert(user).values({
        id: crypto.randomUUID(),
        name: data.content.fullName || 'Usuario INDI',
        email: data.content.email || 'demo@indi.bio',
        status: 'ACTIVE',
      }).returning();
      targetUserId = newUser.id;
    }

    if (cvId) {
      await db
        .update(smartCvs)
        .set({
          title: data.title,
          targetRole: data.targetRole,
          atsScore: calculatedScore,
          content: data.content as any,
          templateId: data.templateId,
          updatedAt: new Date(),
        })
        .where(eq(smartCvs.id, cvId));
    } else {
      await db.insert(smartCvs).values({
        id: crypto.randomUUID(),
        userId: targetUserId,
        title: data.title,
        targetRole: data.targetRole,
        atsScore: calculatedScore,
        content: data.content as any,
        templateId: data.templateId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath('/cv');
    return { success: true, score: calculatedScore };
  } catch (err: any) {
    console.error('Error guardando Smart CV:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Listar CVs del usuario
 */
export async function getUserSmartCvsAction() {
  try {
    const userCvList = await db.query.smartCvs.findMany({
      orderBy: [desc(smartCvs.createdAt)],
    });
    return { success: true, data: userCvList };
  } catch (err: any) {
    console.error('Error listando CVs:', err);
    return { success: false, data: [] };
  }
}
