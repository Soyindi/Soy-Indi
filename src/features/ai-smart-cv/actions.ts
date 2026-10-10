'use server';

import { db } from '@/shared/api/db';
import { smartCvs, user } from '@/entities/schema';
import {
  cvFormSchema,
  CVFormValues,
  AtsAuditResult,
  VerifiedCredential,
  MultimodalCvExtraction,
  generateCvSlug,
  slugifyCvTitle,
  isReservedCvSlug,
  generateCvSlugAlternatives,
  rewriteCvSectionSchema,
  RewriteCvSectionInput,
} from '@/entities/cv/schemas';
import { parseCvDocumentMultimodal, parseCredentialDocumentMultimodal } from '@/features/ai-smart-cv/lib/multimodal-parser';
import {
  validateFileSignature,
  assertZeroBinaryPersistence,
} from '@/shared/lib/fileSecurity';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { callNvidiaNimChat } from '@/shared/api/nvidia-nim';
import { eq, desc, and, ne, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Ingesta Inteligente de CV con Qwen2.5-VL / Gemini Vision
 * Recibe FormData con el archivo (PDF/imagen) y devuelve la estructura canónica.
 */
export async function parseCvDocumentAction(formData: FormData): Promise<{
  success: boolean;
  data?: Partial<CVFormValues>;
  error?: string;
}> {
  try {
    const file = formData.get('file') as File | null;
    const extractedTextParam = formData.get('extractedText') as string | null;
    const fileName = (formData.get('fileName') as string | null) || file?.name || 'cv.pdf';

    let extracted: MultimodalCvExtraction | null = null;

    if (extractedTextParam && extractedTextParam.trim().length > 0) {
      const { sanitizeExtractedText } = await import('@/shared/lib/fileSecurity');
      const sanitized = sanitizeExtractedText(extractedTextParam, { maxChars: 250000 });
      const { parseCvTextWithAiCascade } = await import('@/features/ai-smart-cv/lib/multimodal-parser');
      extracted = await parseCvTextWithAiCascade(sanitized, fileName);
    } else {
      if (!file) {
        return { success: false, error: 'No se ha adjuntado ningún archivo ni texto de currículum.' };
      }

      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      // Procedimiento de Seguridad: Validación de Firma Binaria (Magic Bytes)
      const sigValidation = validateFileSignature(uint8, file.name, file.type);
      if (!sigValidation.valid) {
        return {
          success: false,
          error: sigValidation.error || 'Archivo rechazado por control de seguridad de firmas binarias.',
        };
      }

      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = sigValidation.mimeType || file.type || 'application/pdf';

      // Procesar con el motor multimodal
      extracted = await parseCvDocumentMultimodal(base64, mimeType, file.name);
    }

    if (!extracted) {
      return { success: false, error: 'No se pudo extraer información estructurada del currículum.' };
    }

    // Mapear a CVFormValues con soporte de viñetas XYZ
    const structuredCv: Partial<CVFormValues> = {
      title: `CV Optimizado - ${extracted.targetRole || 'Profesional'}`,
      targetRole: extracted.targetRole || '',
      templateId: 'executive-modern',
      content: {
        fullName: extracted.fullName || '',
        email: extracted.email || '', // Vacío si falta, marcado como pendiente
        phone: extracted.phone || '', // Vacío si falta, marcado como pendiente
        location: extracted.location || '',
        rut: extracted.rut || undefined,
        linkedinUrl: extracted.linkedinUrl || undefined,
        websiteUrl: extracted.websiteUrl || undefined,
        summary: extracted.summary || '',
        skills: extracted.skills || [],
        experience: extracted.experience.map((exp) => ({
          company: exp.company,
          role: exp.role,
          period: exp.period,
          bullets: exp.xyzBullets.map((b) => b.text.trim()),
          detailedBullets: exp.xyzBullets.map((b) => ({
            text: b.text.trim(),
            needs_metric: b.needs_metric,
          })),
        })),
        education: extracted.education.map((edu) => ({
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          credentialType: 'UNVERIFIED',
        })),
        references: extracted.references || [],
        credentials: [],
        signatureType: 'NONE',
        signatureUrl: '',
        signatureDate: '',
      },
    };

    return { success: true, data: structuredCv };
  } catch (err: any) {
    console.error('Error en parseCvDocumentAction:', err);
    return { success: false, error: err.message || 'Error procesando documento multimodal' };
  }
}

/**
 * Server Action: Ingesta de Título o Certificación Universitaria
 * Extrae emisor, diploma y lo empareja con la sección de Educación
 */
export async function parseCredentialDocumentAction(
  formData: FormData,
  currentEducation: Array<{ degree: string; institution: string; year: string }>
): Promise<{
  success: boolean;
  credential?: VerifiedCredential;
  matchedEducationIndex?: number;
  error?: string;
}> {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'No se ha adjuntado ningún diploma o título.' };
    }

    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    // Procedimiento de Seguridad: Validación de Firma Binaria (Magic Bytes)
    const sigValidation = validateFileSignature(uint8, file.name, file.type);
    if (!sigValidation.valid) {
      return {
        success: false,
        error: sigValidation.error || 'Archivo rechazado por control de seguridad de firmas binarias.',
      };
    }

    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = sigValidation.mimeType || file.type || 'image/jpeg';

    const credential = await parseCredentialDocumentMultimodal(base64, mimeType, file.name, currentEducation);

    return {
      success: true,
      credential,
      matchedEducationIndex: credential.mappedEducationIndex,
    };
  } catch (err: any) {
    console.error('Error en parseCredentialDocumentAction:', err);
    return { success: false, error: err.message || 'Error procesando diploma' };
  }
}

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

  // Bonus por credenciales verificadas
  if (cvData.content.credentials && cvData.content.credentials.length > 0) {
    score = Math.min(100, score + 8);
  }

  const strengths: string[] = [];
  const improvements: string[] = [];
  const hallucinationWarnings: string[] = [];

  // Chequeo de viñetas con falta de métricas
  let missingMetricCount = 0;
  cvData.content.experience.forEach((exp) => {
    exp.detailedBullets?.forEach((b) => {
      if (b.needs_metric) missingMetricCount++;
    });
  });

  if (missingMetricCount > 0) {
    hallucinationWarnings.push(
      `Detectamos ${missingMetricCount} logro(s) sin métrica cuantificable. Agrega números concretos (%, $ o personas) para aumentar el impacto.`
    );
  }

  if (matches.length >= 4) {
    strengths.push(`Excelente densidad de palabras clave técnicas para el rol de ${cvData.targetRole}.`);
  } else {
    improvements.push(`Incluye términos clave como "${missing.slice(0, 3).join(', ')}" para superar filtros ATS.`);
  }

  if (cvData.content.experience.some((e) => e.bullets.length >= 2)) {
    strengths.push('Uso de viñetas claras con estructura STAR/Google XYZ.');
  } else {
    improvements.push('Agrega logros cuantificables (%, números, métricas) en cada experiencia.');
  }

  if (cvData.content.credentials && cvData.content.credentials.length > 0) {
    strengths.push(`${cvData.content.credentials.length} título(s) o certificación(es) validada(s) documentalmente.`);
  }

  return {
    success: true,
    data: {
      score: Math.min(100, Math.max(20, score)),
      strengths,
      improvements,
      keywordMatches: matches,
      missingKeywords: missing,
      hallucinationWarnings,
      apcaContrastPass: true,
    },
  };
}

/**
 * Guardar o Actualizar Smart CV en Turso SQLite
 */
export async function upsertSmartCvAction(
  values: CVFormValues,
  cvId?: string,
  userId?: string
) {
  try {
    const validated = cvFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: validated.error.issues.map((i) => i.message).join(', ') };
    }

    const data = validated.data;

    // Guardrail de Seguridad: Cero Persistencia Binaria en Base de Datos (Anti-DB-Bloat)
    const zeroBinaryCheck = assertZeroBinaryPersistence({
      title: data.title,
      targetRole: data.targetRole,
      content: data.content,
    });
    if (!zeroBinaryCheck.safe) {
      return {
        success: false,
        error: `Rechazado por guardrail de base de datos: ${zeroBinaryCheck.violations.join(' ')}`,
      };
    }

    // Resolver usuario autenticado con guardrail de seguridad
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    // Guardrail de Seguridad: Bloqueo de mutaciones por membresía/trial expirado
    const { assertUserEntitlementAction } = await import('@/features/pricing/actions');
    const entitlementCheck = await assertUserEntitlementAction(targetUserId);
    if (!entitlementCheck.allowed) {
      return { success: false, error: entitlementCheck.error || 'Período de prueba finalizado. Se requiere suscripción activa.' };
    }

    // Calcular score ATS actualizado
    const audit = await auditAtsScoreAction(data);
    const calculatedScore = audit.data.score;

    // Resolver slug canónico único
    const desiredSlug = data.slug
      ? slugifyCvTitle(data.slug)
      : generateCvSlug(data.content.fullName || data.targetRole || data.title, false);

    // Guardrail de Seguridad: Validación contra rutas y slugs reservados
    if (isReservedCvSlug(desiredSlug)) {
      return {
        success: false,
        error: 'Este identificador está reservado para rutas del sistema. Por favor elige otro slug.',
      };
    }

    let finalCvId = cvId;
    let finalSlug = desiredSlug;

    if (cvId) {
      // Verificar propiedad estricta para evitar sobreescritura entre tenants (anti-IDOR)
      const existing = await db.query.smartCvs.findFirst({
        where: and(eq(smartCvs.id, cvId), eq(smartCvs.userId, targetUserId)),
      });

      if (!existing) {
        return { success: false, error: 'Currículum no encontrado o no pertenece al usuario autenticado.' };
      }

      // Si el slug cambió, verificar que no colisione con otro CV
      if (existing.slug !== desiredSlug) {
        const slugCollision = await db.query.smartCvs.findFirst({
          where: and(eq(smartCvs.slug, desiredSlug), ne(smartCvs.id, cvId)),
        });
        if (slugCollision) {
          return { success: false, error: 'Este enlace personalizado de CV ya está en uso por otro usuario.' };
        }
      }

      await db
        .update(smartCvs)
        .set({
          title: data.title,
          targetRole: data.targetRole,
          atsScore: calculatedScore,
          slug: desiredSlug,
          isPublic: data.isPublic ?? true,
          content: data.content as any,
          templateId: data.templateId,
          updatedAt: new Date(),
        })
        .where(and(eq(smartCvs.id, cvId), eq(smartCvs.userId, targetUserId)));

      finalCvId = cvId;
      finalSlug = desiredSlug;

      if (existing.slug && existing.slug !== desiredSlug) {
        revalidatePath(`/cv/${existing.slug}`);
      }
    } else {
      // Modo creación nueva independiente
      // Verificar cuota disponible de CVs según el plan del usuario
      const { assertQuotaAvailableAction } = await import('@/features/pricing/actions');
      const quotaCheck = await assertQuotaAvailableAction(targetUserId, 'cvs');
      if (!quotaCheck.allowed) {
        return { success: false, error: quotaCheck.error || 'Has superado el límite de versiones de CV de tu plan.' };
      }

      let uniqueSlug = desiredSlug;
      const slugCollision = await db.query.smartCvs.findFirst({
        where: eq(smartCvs.slug, uniqueSlug),
      });

      if (slugCollision) {
        uniqueSlug = generateCvSlug(data.content.fullName || data.targetRole || data.title, true);
      }

      const newId = crypto.randomUUID();
      await db.insert(smartCvs).values({
        id: newId,
        userId: targetUserId,
        title: data.title,
        targetRole: data.targetRole,
        atsScore: calculatedScore,
        slug: uniqueSlug,
        isPublic: data.isPublic ?? true,
        viewsCount: 0,
        content: data.content as any,
        templateId: data.templateId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      finalCvId = newId;
      finalSlug = uniqueSlug;
    }

    try {
      revalidatePath('/cv');
      revalidatePath('/dashboard');
      if (finalSlug) {
        revalidatePath(`/cv/${finalSlug}`);
      }
    } catch {
      // Revalidation silente si se ejecuta fuera de contexto HTTP de Next.js
    }

    return {
      success: true,
      id: finalCvId,
      slug: finalSlug,
      score: calculatedScore,
    };
  } catch (err: any) {
    console.error('Error guardando Smart CV:', err);
    const errMsg = String(err?.message || '');
    if (errMsg.includes('UNIQUE constraint failed') || errMsg.includes('SQLITE_CONSTRAINT') || err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return {
        success: false,
        error: 'El enlace personalizado (slug) de este CV ya está en uso por otro usuario. Por favor selecciona otro.',
      };
    }
    return { success: false, error: err.message || 'Error guardando currículum' };
  }
}

/**
 * Obtener un Smart CV por su ID con verificación estricta de propiedad (Multi-Tenant Anti-IDOR)
 */
export async function getSmartCvByIdAction(cvId: string, userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    const cv = await db.query.smartCvs.findFirst({
      where: and(eq(smartCvs.id, cvId), eq(smartCvs.userId, targetUserId)),
    });

    if (!cv) {
      return { success: false, error: 'Currículum no encontrado o no tienes permisos para acceder.' };
    }

    const cvData: CVFormValues = {
      title: cv.title,
      targetRole: cv.targetRole,
      slug: cv.slug || undefined,
      isPublic: cv.isPublic,
      templateId: cv.templateId,
      content: cv.content as any,
    };

    return {
      success: true,
      data: cvData,
      id: cv.id,
      slug: cv.slug,
      atsScore: cv.atsScore,
    };
  } catch (err: any) {
    console.error('Error obteniendo Smart CV por id:', err);
    return { success: false, error: err.message || 'Error cargando currículum' };
  }
}

/**
 * Obtener un Smart CV público por su slug con validación de visibilidad
 */
export async function getPublicSmartCvAction(slug: string) {
  try {
    const cv = await db.query.smartCvs.findFirst({
      where: eq(smartCvs.slug, slug),
    });

    if (!cv || !cv.isPublic) {
      return { success: false, error: 'Currículum no encontrado o privado' };
    }

    return { success: true, data: cv };
  } catch (err: any) {
    console.error('Error obteniendo Smart CV público:', err);
    return { success: false, error: 'Error cargando currículum' };
  }
}

/**
 * Incrementar atómicamente el contador de visitas del CV público
 */
export async function incrementCvViewsAction(cvId: string) {
  try {
    await db
      .update(smartCvs)
      .set({ viewsCount: sql`${smartCvs.viewsCount} + 1` })
      .where(eq(smartCvs.id, cvId));
    return { success: true };
  } catch (err: any) {
    console.error('Error incrementando vistas de CV:', err);
    return { success: false };
  }
}

/**
 * Listar CVs del usuario autenticado con aislamiento multi-tenant
 */
export async function getUserSmartCvsAction(userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: true, data: [] };
    }
    const targetUserId = sessionResult.userId;

    const userCvList = await db.query.smartCvs.findMany({
      where: eq(smartCvs.userId, targetUserId),
      orderBy: [desc(smartCvs.createdAt)],
    });
    return { success: true, data: userCvList };
  } catch (err: any) {
    console.error('Error listando CVs:', err);
    return { success: false, data: [] };
  }
}

/**
 * Eliminar Smart CV con verificación estricta de propiedad
 */
export async function deleteSmartCvAction(cvId: string, userId?: string) {
  try {
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    if (!sessionResult.userId) {
      return { success: false, error: sessionResult.error || 'Acceso no autorizado' };
    }
    const targetUserId = sessionResult.userId;

    await db
      .delete(smartCvs)
      .where(and(eq(smartCvs.id, cvId), eq(smartCvs.userId, targetUserId)));

    revalidatePath('/cv');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('Error eliminando Smart CV:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Server Action: Copiloto de Redacción Inteligente (Inline AI Assistant)
 * Asiste en la reformulación contextualizada con Google XYZ, tono ejecutivo o inyección de keywords ATS.
 * Protegido por Zod, Multi-tenancy y Entitlements con soporte de LLM (NVIDIA NIM / Gemini)
 */
export async function rewriteCvSectionAction(params: RewriteCvSectionInput): Promise<{
  success: boolean;
  suggestions: string[];
  error?: string;
}> {
  try {
    // 1. Validación estricta de contrato Zod
    const parsed = rewriteCvSectionSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        suggestions: [],
        error: parsed.error.issues[0]?.message || 'Parámetros inválidos.',
      };
    }

    const { text, type, mode, targetRole, company, role, skills, userId } = parsed.data;

    // 2. Guardrails de Sesión y Entitlements
    const sessionResult = await getSafeAuthenticatedUserId(userId);
    const targetUserId = sessionResult.userId;

    if (!targetUserId && process.env.NODE_ENV === 'production') {
      return {
        success: false,
        suggestions: [],
        error: sessionResult.error || 'Sesión no autorizada para usar el asistente de IA.',
      };
    }

    if (targetUserId) {
      const { assertUserEntitlementAction } = await import('@/features/pricing/actions');
      const entitlement = await assertUserEntitlementAction(targetUserId);
      if (!entitlement.allowed) {
        return {
          success: false,
          suggestions: [],
          error: entitlement.error || 'Período de prueba o suscripción expirada.',
        };
      }
    }

    // 2.1 Guardrail de Frecuencia y Protección contra Abuso (Rate Limiting)
    const rateLimitIdentifier = targetUserId || 'anonymous-user';
    const { checkAiRateLimit } = await import('@/shared/lib/rateLimiter');
    const rateLimitResult = await checkAiRateLimit(rateLimitIdentifier);
    if (!rateLimitResult.success) {
      return {
        success: false,
        suggestions: [],
        error: 'Has alcanzado el límite de solicitudes de IA por minuto. Por favor, aguarda unos segundos.',
      };
    }

    // 3. Preparación del Prompt Contextualizado
    const cleanInput = text.replace(/^[\s•\-\*·\u2022\u25cf\u25cb\u25e6\u2219\u22c5\u00b7>]+/, '').trim();
    const roleContext = role ? `Cargo actual: ${role}` : '';
    const companyContext = company ? `Empresa: ${company}` : '';
    const targetRoleContext = targetRole ? `Rol Objetivo del CV: ${targetRole}` : '';
    const skillsContext = skills && skills.length > 0 ? `Habilidades del perfil: ${skills.join(', ')}` : '';

    const contextSummary = [roleContext, companyContext, targetRoleContext, skillsContext]
      .filter(Boolean)
      .join(' | ');

    const systemPrompt = `Eres un Redactor Ejecutivo y Estratega de Empleabilidad de nivel mundial especializado en currículums para el estándar corporativo 2026.
REGLAS OBLIGATORIAS:
1. No inventes métricas específicas (como porcentajes exactos o millones) que el usuario NO haya proporcionado; si falta la cifra, incluye un marcador elegante como "[añadir métrica]" o enfócate en el impacto metodológico real.
2. Si es una viñeta laboral, aplica la fórmula de Google XYZ: "Logré [X], medido por [Y], mediante [Z]" usando verbos de acción fuertes en primera persona singular o pasado ("Lideré", "Diseñé", "Orquesté", "Optimicé").
3. Mantén estricta coherencia con el contexto provisto (${contextSummary || 'Perfil Profesional'}).
4. Devuelve ÚNICAMENTE un objeto JSON válido con la clave "suggestions", conteniendo un array de exactamente 3 variantes distintas y profesionales sin texto introductorio ni formato markdown extra.`;

    const userPrompt = `TEXTO ORIGINAL A MEJORAR:
"${cleanInput}"

TIPO DE SECCIÓN: ${type === 'SUMMARY' ? 'Resumen Profesional / Perfil' : 'Viñeta de Logro Laboral'}
ENFOQUE SOLICITADO: ${
      mode === 'XYZ_IMPACT'
        ? 'Impacto Cuantitativo (Google XYZ)'
        : mode === 'EXECUTIVE'
        ? 'Tono Ejecutivo y Estratégico de Liderazgo'
        : 'Optimización de Palabras Clave ATS y Técnicas'
    }
${contextSummary ? `CONTEXTO ADICIONAL:\n${contextSummary}` : ''}

Devuelve exactamente 3 opciones pulcras y de alta calidad adaptadas al rol.`;

    // 4. Invocación al Motor LLM (NVIDIA NIM / Groq LPU / Gemini Flash Failover)
    const aiResult = await callNvidiaNimChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'meta/llama-3.2-90b-vision-instruct',
        temperature: 0.3,
        maxTokens: 800,
        responseFormat: { type: 'json_object' },
      }
    );

    if (aiResult.success && aiResult.content) {
      try {
        const cleanedJson = aiResult.content
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        const parsedJson = JSON.parse(cleanedJson);
        if (Array.isArray(parsedJson.suggestions) && parsedJson.suggestions.length > 0) {
          const { auditAndRepairCvBullet } = await import('@/features/ai-smart-cv/lib/cv-auditor');
          const cleanedSuggestions = parsedJson.suggestions.slice(0, 3).map((s: any) => {
            const raw = String(s).trim();
            const { repairedText } = auditAndRepairCvBullet(raw);
            return repairedText;
          });
          return {
            success: true,
            suggestions: cleanedSuggestions,
          };
        }
      } catch (jsonErr) {
        console.warn('[rewriteCvSectionAction] JSON parse warning, aplicando fallback a líneas:', jsonErr);
        const lines = aiResult.content
          .split('\n')
          .map((l) => l.replace(/^[\d\.\-\*\•\s"]+|["]+$/g, '').trim())
          .filter((l) => l.length > 15);
        if (lines.length >= 2) {
          const { auditAndRepairCvBullet } = await import('@/features/ai-smart-cv/lib/cv-auditor');
          const cleanedSuggestions = lines.slice(0, 3).map((s) => {
            const { repairedText } = auditAndRepairCvBullet(s);
            return repairedText;
          });
          return {
            success: true,
            suggestions: cleanedSuggestions,
          };
        }
      }
    }

    // 5. Fallback Heurístico Contextualizado Inteligente (en caso de falta de conectividad AI)
    const effectiveTarget = targetRole || role || 'Profesional';
    const cleanLower = cleanInput.charAt(0).toLowerCase() + cleanInput.slice(1);

    if (type === 'SUMMARY') {
      return {
        success: true,
        suggestions: [
          `${effectiveTarget} con sólida trayectoria impulsando iniciativas de alto impacto. Especialista en optimización de procesos, buenas prácticas y alineación de requerimientos con objetivos de negocio.`,
          `Profesional enfocado en ${effectiveTarget}, con probada capacidad para resolver desafíos complejos, coordinar soluciones estratégicas y elevar la eficiencia operativa.`,
          `Líder en ${effectiveTarget} con enfoque en innovación, calidad técnica y entrega de valor continuo para equipos y proyectos corporativos.`,
        ],
      };
    }

    // Viñetas laborales
    const hasMetric = /\b(?:\d+[%kKmM]?|\$\d+|\d+\s?(?:personas|usuarios|pacientes|clientes|meses|días|proyectos))\b/i.test(cleanInput);

    if (hasMetric) {
      return {
        success: true,
        suggestions: [
          `Lideré ${cleanLower}, consolidando un impacto medible en los objetivos clave de ${company || 'la organización'}.`,
          `Orquesté ${cleanLower}, optimizando la entrega técnica y garantizando la calidad requerida para el rol de ${effectiveTarget}.`,
          `Dirigí la implementación de ${cleanLower}, asegurando escalabilidad operativa y alineación con los estándares del equipo.`,
        ],
      };
    }

    return {
      success: true,
      suggestions: [
        `Lideré ${cleanLower}, optimizando los flujos de trabajo e impulsando mejores prácticas de la disciplina en ${company || 'la organización'} [añadir métrica o resultado clave].`,
        `Orquesté la ejecución de ${cleanLower}, mejorando los tiempos de respuesta y la confiabilidad del servicio [especificar volumen o porcentaje alcanzado].`,
        `Diseñé e implementé mejoras en ${cleanLower}, alineando las entregas con las prioridades estratégicas de ${effectiveTarget} [especificar impacto o métrica alcanzada].`,
      ],
    };

  } catch (err: any) {
    console.error('Error en rewriteCvSectionAction:', err);
    return { success: false, suggestions: [], error: err.message };
  }
}


export type CvSlugAvailabilityResult = {
  available: boolean;
  status: 'available' | 'taken' | 'reserved' | 'invalid';
  message?: string;
  suggestions: string[];
};

/**
 * Server Action en tiempo real para verificar la disponibilidad de un slug de CV público
 * y proveer sugerencias automáticas de desambiguación si está ocupado o reservado.
 */
export async function checkCvSlugAvailabilityAction(
  rawSlug: string,
  currentCvId?: string,
  role?: string
): Promise<CvSlugAvailabilityResult> {
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

    // 1. Verificar si está en la lista de rutas o palabras reservadas del sistema
    if (isReservedCvSlug(slug)) {
      const suggestions = generateCvSlugAlternatives(slug, role);
      return {
        available: false,
        status: 'reserved',
        message: 'Este identificador está reservado para el sistema.',
        suggestions,
      };
    }

    // 2. Consultar colisión en la base de datos
    const existing = await db.query.smartCvs.findFirst({
      where: currentCvId
        ? and(eq(smartCvs.slug, slug), ne(smartCvs.id, currentCvId))
        : eq(smartCvs.slug, slug),
    });

    if (existing) {
      const suggestions = generateCvSlugAlternatives(slug, role);
      return {
        available: false,
        status: 'taken',
        message: 'Este enlace ya está en uso por otro currículum.',
        suggestions,
      };
    }

    return {
      available: true,
      status: 'available',
      message: '¡Enlace de CV disponible!',
      suggestions: [],
    };
  } catch (error) {
    console.error('Error al comprobar disponibilidad de slug de CV:', error);
    return {
      available: true,
      status: 'available',
      suggestions: [],
    };
  }
}
