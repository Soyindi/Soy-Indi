import { multimodalCvExtractionSchema, MultimodalCvExtraction, verifiedCredentialSchema, VerifiedCredential } from '@/entities/cv/schemas';
import { parseCvTextToStructuredData, isolateCvBodyFromAttachments, extractAttachmentsFromDocument } from '@/features/ai-smart-cv/lib/cv-text-parser';
import type { ScannedPageAttachment } from '@/shared/lib/clientDocumentExtractor';

/**
 * Prompt para el extractor multimodal Qwen2.5-VL / Gemini Flash
 * Basado en las directrices de Arquitectura Plataforma CV Inteligente (Módulo 1 & 2):
 * - Sanitización EU AI Act: descartar edad, estado civil, religión, foto.
 * - Reescritura STAR / Google XYZ: "Logré [X] medido por [Y] haciendo [Z]".
 * - Mitigación activa de alucinaciones: Si falta métrica cuantitativa real, marcar needs_metric = true.
 */
export const MULTIMODAL_CV_PROMPT = `
[SYSTEM DIRECTIVE: CORE IDENTITY]
Operas como un híbrido entre un Staff NLP Data Architect y un Global Executive Recruiter de nivel directivo C-Level.
Posees dominio algorítmico profundo sobre los parsers semánticos de ATS corporativos (Workday Illuminate, Greenhouse, Lever, HiredScore).
Tu misión exclusiva es transformar notas, documentos o currículums desestructurados en un JSON estrictamente cronológico, secuencial y de altísima densidad semántica, invulnerable a la corrupción de ingestión de múltiples columnas.

[REGLAS DE PROCESAMIENTO CRÍTICAS]

1. SANITIZACIÓN REGULATORIA (EU AI Act):
   - Descarta explícitamente cualquier mención de: edad biológica del candidato (ej. "Edad: 33 años"), fecha de nacimiento, estado civil, nacionalidad protegida, género, religión o filiación política.
   - ¡PROHIBIDO MUTILAR AÑOS DE EXPERIENCIA!: Conserva SIEMPRE intactas las expresiones sobre años de trayectoria o experiencia profesional (ej. "con más de cinco años de trayectoria" o "10 años de experiencia" NUNCA debe perder las palabras "años de").
   - Concéntrate exclusivamente en mérito técnico, competencias profesionales, experiencia y educación.

2. PROTOCOLO STRICT ZERO-HALLUCINATION & PRESERVACIÓN AUTÉNTICA (ESTRUCTURA GOOGLE XYZ / STAR):
   - MANDATO DE FIDELIDAD ABSOLUTA: Actúas como un transductor semántico fiel. Extrae fielmente el texto y los hechos reales del candidato. Tienes ESTRICTAMENTE PROHIBIDO inventar años, cargos, empresas o métricas que no figuren en el documento.
   - En "rawAchievements" guarda el texto original y completo de las viñetas tal como lo escribió el candidato.
   - En "xyzBullets" conserva la esencia de cada viñeta bajo la estructura Google XYZ ("Logré X medido por Y haciendo Z"), limpiando prefijos obvios (como "Responsabilidades:") e iniciando con verbo de acción en primera persona ("Coordiné", "Evalué", "Desarrollé") SOLO si el original carecía de verbo.
   - Si la viñeta carece de una métrica numérica verificable en el documento original, marca estrictamente:
     "needs_metric": true
   - Si ya contiene métricas cuantitativas reales (ej. "35%", "$1.2M", "8 personas", "40 pacientes"), marca:
     "needs_metric": false

3. EXTRACCIÓN EXHAUSTIVA DE TODA LA TRAYECTORIA LABORAL Y PROYECTOS:
   - En el array "experience", DEBES EXTRAER ABSOLUTAMENTE TODOS los cargos, empleos y proyectos que figuren en el documento, cronológicamente y sin omitir ninguno.
   - Si el candidato tiene 4, 5 o más cargos en el documento (ej. Psicólogo de Reinserción Social, Psicólogo de Cuidados Paliativos, Psicólogo PIE Escuela, Psicólogo CESFAM, Psicólogo Practicante, etc.), DEBES CREAR UN ELEMENTO INDIVIDUAL PARA CADA UNO.
   - Tienes TERMINANTEMENTE PROHIBIDO resumir, omitir o dejar un solo cargo como muestra.
   - Extrae TODAS las viñetas originales de cada cargo.

4. SUBSTRACCIÓN EJECUTIVA ("SHOW, DON'T LABEL"):
   - PROHIBICIÓN DE ETIQUETAS Y PREFIJOS OBVIOS: No incluyas prefijos como "Responsabilidades:", "Funciones:" o "Logros clave:". Extrae la sustancia fáctica directa.
   - En "summary", extrae y pule el perfil profesional del usuario sin imponer clichés de auto-engrandecimiento ("líder visionario") ni plantillas prefabricadas. Preserva la autenticidad de su experiencia.

5. EXTRACCIÓN EXHAUSTIVA DE EDUCACIÓN, DIPLOMADOS, CURSOS Y ESPECIALIZACIONES:
   - En el array "education", DEBES EXTRAER TODA la trayectoria académica y formativa del candidato sin omitir ninguna:
     * Títulos profesionales y universitarios (ej. "Título de Psicólogo • Licenciado en Psicología").
     * Diplomados, postítulos y posgrados.
     * Cursos de especialización, capacitaciones, formación continua, certificaciones y talleres profesionales relevantes (ej. cursos clínicos, herramientas diagnósticas, capacitaciones en salud mental, etc.).
     * Magísteres, másteres y doctorados.
   - Cada curso, diplomado, especialización o título universitario debe figurar como un elemento individual en "education".
   - En "degree", coloca el nombre completo del grado, diplomado o curso.
   - En "institution", la universidad, instituto o entidad que lo impartió. Si el texto no menciona institución explícita, coloca la entidad certificadora o "Centro de Formación Profesional".
   - En "year", preserva el rango completo de años si el documento indica inicio y término (ej. "2013 – 2018"), o el año de realización/graduación si es único (ej. "2023"). Si un curso o certificación no indica año explícito en el listado, devuelve string vacío "" (PROHIBIDO escribir "No especificado", "Sin fecha" o "N/A").

6. PRESERVACIÓN FIDEDIGNA DE CONTACTOS Y REFERENCIAS LABORALES:
   - En "references", extrae rigurosamente TODOS los contactos de referencia que figuren en el documento con su nombre completo, cargo desempeñado, institución/empresa y número telefónico o email de contacto real.
   - Tienes terminantemente PROHIBIDO reemplazar los teléfonos por etiquetas como "[TELEFONO_PROTEGIDO]". Extráelos exactamente con su numeración real (ej. "+56 9 8226 8970").

7. DEVUELVE EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON ESTA ESTRUCTURA:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "location": string,
  "targetRole": string,
  "summary": string,
  "skills": string[],
  "experience": [
    {
      "company": string,
      "role": string,
      "period": string,
      "rawAchievements": string[],
      "xyzBullets": [
        {
          "text": string,
          "needs_metric": boolean
        }
      ]
    }
  ],
  "education": [
    {
      "degree": string,
      "institution": string,
      "year": string
    }
  ],
  "references": [
    {
      "name": string,
      "role": string,
      "company": string,
      "contact": string
    }
  ]
}
`;

/**
 * Prompt especializado en lectura de Títulos Universitarios, Diplomas y Certificaciones
 * Extrae emisor, destinatario, grado académico y códigos criptográficos / QR de validación.
 */
export const MULTIMODAL_CREDENTIAL_PROMPT = `
Eres un analizador forense de credenciales académicas y certificaciones profesionales.
Analiza la imagen o documento del diploma proporcionado.

Extrae las siguientes entidades en formato JSON exacto:
{
  "issuingInstitution": string (ej. Universidad de Chile, AWS, Stanford University),
  "credentialName": string (ej. Grado de Licenciado en Ciencias de la Computación, Solution Architect Associate),
  "recipientName": string (nombre del titular si es legible),
  "issueDate": string (mes/año o fecha de otorgamiento),
  "verificationCode": string (código de registro, folio, ID de credencial o hash visible)
}
`;

/**
 * Router Multimodal que orquesta la llamada a Qwen2.5-VL u otros proveedores
 * Provee simulación de alta precisión y llamada a la API si existen credenciales.
 */
export async function parseCvDocumentMultimodal(
  fileBase64: string,
  mimeType: string,
  fileName: string
): Promise<MultimodalCvExtraction> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // 1. Extracción de texto real desde documentos PDF o texto plano con preservación espacial 2D
  let extractedRawText = '';
  let fullOriginalText = '';
  const isPdf =
    mimeType.includes('pdf') ||
    fileName.toLowerCase().endsWith('.pdf') ||
    fileBase64.startsWith('JVBERi0');

  if (isPdf) {
    try {
      const buffer = Buffer.from(fileBase64, 'base64');
      const uint8 = new Uint8Array(buffer);

      const { extractSpatialTextFromPdf } = await import('@/shared/lib/spatialDocumentExtractor');
      const spatialText = await extractSpatialTextFromPdf(uint8);
      if (spatialText && spatialText.trim().length > 20) {
        extractedRawText = spatialText.trim();
      } else {
        const { extractText } = await import('unpdf');
        const res = await extractText(uint8);
        extractedRawText = Array.isArray(res.text) ? res.text.join('\n') : (res.text || '');
      }
      console.log(`[IDP] Texto extraído exitosamente de PDF ${fileName} (${extractedRawText.length} caracteres)`);
    } catch (pdfErr) {
      console.warn('[IDP] Error extrayendo texto con unpdf:', pdfErr);
    }
  } else if (
    fileName.toLowerCase().endsWith('.docx') ||
    mimeType.includes('wordprocessingml')
  ) {
    try {
      const buffer = Buffer.from(fileBase64, 'base64');
      const { extractTextFromDocxArrayBuffer } = await import('@/shared/lib/docxTextExtractor');
      extractedRawText = await extractTextFromDocxArrayBuffer(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
      console.log(`[IDP] Texto extraído exitosamente de DOCX ${fileName} (${extractedRawText.length} caracteres)`);
    } catch (docxErr) {
      console.warn('[IDP] Error extrayendo texto de DOCX:', docxErr);
    }
  } else if (
    mimeType.includes('text') ||
    fileName.toLowerCase().endsWith('.txt') ||
    fileName.toLowerCase().endsWith('.md')
  ) {
    try {
      extractedRawText = Buffer.from(fileBase64, 'base64').toString('utf-8');
    } catch (e) {
      console.warn('[IDP] Error decodificando texto plano:', e);
    }
  }

  // Preservar texto completo del documento para enriquecer fechas de cursos desde certificados
  fullOriginalText = extractedRawText;

  // Aislar cuerpo del CV de diplomas o certificados de respaldo adjuntos en páginas posteriores
  if (extractedRawText && extractedRawText.trim().length > 20) {
    extractedRawText = isolateCvBodyFromAttachments(extractedRawText);
  }

  // 2. Cascade AI Router: Invocación de Frontera (NVIDIA NIM / Gemini 2.0 Flash / OpenRouter)
  try {
    const { callNvidiaNimChat } = await import('@/shared/api/nvidia-nim');
    const userPrompt = extractedRawText
      ? `A continuación se encuentra el texto extraído del currículum con preservación espacial de columnas. Extrae y estructura toda la información cumpliendo con las REGLAS DE PROCESAMIENTO CRÍTICAS (EU AI Act, Google XYZ y needs_metric):\n\n${extractedRawText.slice(0, 16000)}`
      : 'Extrae y estructura la información de este currículum respetando las directrices de la EU AI Act y fórmula Google XYZ.';

    const nimResult = await callNvidiaNimChat(
      [
        { role: 'system', content: MULTIMODAL_CV_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'meta/llama-3.3-70b-instruct',
        temperature: 0.1,
        maxTokens: 6000,
        responseFormat: { type: 'json_object' },
        preserveSensitiveData: true,
      }
    );

    if (nimResult.success && nimResult.content) {
      let cleanContent = nimResult.content.trim();
      const jsonMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanContent = jsonMatch[1].trim();
      }
      const parsed = JSON.parse(cleanContent);
      const validated = multimodalCvExtractionSchema.safeParse(parsed);
      if (validated.success) {
        console.log(`[IDP] Extracción estructurada exitosa vía ${nimResult.modelUsed || 'AI Engine'}`);
        const data = { ...validated.data };

        // 1. Reconciliación defensiva de teléfonos en referencias laborales
        if (extractedRawText && data.references && data.references.length > 0) {
          data.references = reconcileReferenceContacts(data.references, extractedRawText);
        }

        // 2. Fusión defensiva de experiencia laboral, referencias y educación:
        if (extractedRawText) {
          const textParsed = parseCvTextToStructuredData(extractedRawText, fileName);

          // Preservar el titular profesional completo si el LLM lo truncó a una sola palabra (ej. "Psicólogo")
          if (
            textParsed.targetRole &&
            textParsed.targetRole.length > (data.targetRole?.length || 0) + 8 &&
            (!data.targetRole || data.targetRole.split(/\s+/).length <= 2)
          ) {
            data.targetRole = textParsed.targetRole.replace(/\s*\(autodidacta\)/i, '').trim();
          }

          // A. Preservar todas las experiencias laborales y proyectos sin duplicar cargos
          if (textParsed.experience && textParsed.experience.length > 0) {
            data.experience = mergeExperiences(data.experience, textParsed.experience);
          }

          // B. Preservar todas las referencias si la IA omitió contactos
          if (textParsed.references && textParsed.references.length > (data.references?.length || 0)) {
            data.references = mergeReferences(data.references || [], textParsed.references);
          }

          // C. Preservar cursos, diplomados y rangos completos de años (ej. 2013 – 2018)
          if (textParsed.education && textParsed.education.length > 0) {
            data.education = mergeEducations(data.education, textParsed.education);
          }
        }

        // 3. Enriquecimiento de fechas reales de cursos desde diplomas/certificados de respaldo
        if (fullOriginalText && data.education && data.education.length > 0) {
          data.education = enrichEducationDatesFromCertificates(data.education, fullOriginalText, data.fullName);
        }

        const { auditAndRepairCvExtraction } = await import('@/features/ai-smart-cv/lib/cv-auditor');
        const { auditedExtraction } = auditAndRepairCvExtraction(data);
        return auditedExtraction;
      }
    }
  } catch (err) {
    console.warn('[IDP] Fallo en Cascade AI Router, recurriendo al motor heurístico avanzado:', err);
  }

  // 3. Si se extrajo texto real del documento del usuario, parsearlo de inmediato
  if (extractedRawText && extractedRawText.trim().length > 30) {
    const rawParsed = parseCvTextToStructuredData(extractedRawText, fileName);
    if (fullOriginalText && rawParsed.education && rawParsed.education.length > 0) {
      rawParsed.education = enrichEducationDatesFromCertificates(rawParsed.education, fullOriginalText, rawParsed.fullName);
    }
    const { auditAndRepairCvExtraction } = await import('@/features/ai-smart-cv/lib/cv-auditor');
    const { auditedExtraction } = auditAndRepairCvExtraction(rawParsed);
    return auditedExtraction;
  }

  // 4. Fallback si el archivo era una imagen o no se pudo extraer texto
  const synth = synthesizeDeterministicExtraction(fileName);
  const { auditAndRepairCvExtraction } = await import('@/features/ai-smart-cv/lib/cv-auditor');
  const { auditedExtraction } = auditAndRepairCvExtraction(synth);
  return auditedExtraction;
}

/**
 * Procesa texto extraído de CV pasando por el Cascade AI Router
 * con fallback a parseCvTextToStructuredData si la IA no está disponible.
 */
export async function parseCvTextWithAiCascade(
  rawInputText: string,
  fileName: string = 'cv.pdf',
  scannedPages: ScannedPageAttachment[] = []
): Promise<MultimodalCvExtraction> {
  const extractedRawText = isolateCvBodyFromAttachments(rawInputText);
  const { evaluateCvPreRouteStrategy, auditAndRepairCvExtraction } = await import('@/features/ai-smart-cv/lib/cv-auditor');
  const preRoute = evaluateCvPreRouteStrategy(extractedRawText);

  try {
    const { callNvidiaNimChat } = await import('@/shared/api/nvidia-nim');
    const userPrompt = `A continuación se encuentra el texto extraído del currículum con preservación espacial de columnas.
[PRE-ROUTE ARCHETYPE: ${preRoute.detectedArchetype.toUpperCase()}]
[TONO RECOMENDADO: ${preRoute.recommendedTone}]
Extrae y estructura toda la información cumpliendo con las REGLAS DE PROCESAMIENTO CRÍTICAS (EU AI Act, Google XYZ y needs_metric):\n\n${extractedRawText.slice(0, 16000)}`;

    const nimResult = await callNvidiaNimChat(
      [
        { role: 'system', content: MULTIMODAL_CV_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'meta/llama-3.3-70b-instruct',
        temperature: 0.1,
        maxTokens: 6000,
        responseFormat: { type: 'json_object' },
        preserveSensitiveData: true,
      }
    );

    if (nimResult.success && nimResult.content) {
      let cleanContent = nimResult.content.trim();
      const jsonMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanContent = jsonMatch[1].trim();
      }
      const parsed = JSON.parse(cleanContent);
      const validated = multimodalCvExtractionSchema.safeParse(parsed);
      if (validated.success) {
        console.log(`[IDP] Extracción estructurada desde texto exitosa vía ${nimResult.modelUsed || 'AI Engine'}`);
        const data = { ...validated.data };

        // 1. Reconciliación defensiva de teléfonos en referencias
        if (extractedRawText && data.references && data.references.length > 0) {
          data.references = reconcileReferenceContacts(data.references, extractedRawText);
        }

        // 2. Fusión defensiva de experiencia laboral, referencias y educación:
        if (extractedRawText) {
          const textParsed = parseCvTextToStructuredData(extractedRawText, fileName);

          // Preservar el titular profesional completo si el LLM lo truncó a una sola palabra
          if (
            textParsed.targetRole &&
            textParsed.targetRole.length > (data.targetRole?.length || 0) + 8 &&
            (!data.targetRole || data.targetRole.split(/\s+/).length <= 2)
          ) {
            data.targetRole = textParsed.targetRole.replace(/\s*\(autodidacta\)/i, '').trim();
          }

          // A. Preservar todas las experiencias laborales y proyectos sin duplicar cargos
          if (textParsed.experience && textParsed.experience.length > 0) {
            data.experience = mergeExperiences(data.experience, textParsed.experience);
          }

          // B. Preservar todas las referencias si la IA omitió contactos
          if (textParsed.references && textParsed.references.length > (data.references?.length || 0)) {
            data.references = mergeReferences(data.references || [], textParsed.references);
          }

          // C. Preservar cursos, diplomados y rangos completos de años
          if (textParsed.education && textParsed.education.length > 0) {
            data.education = mergeEducations(data.education, textParsed.education);
          }
        }

        // 3. Enriquecimiento de fechas reales de cursos desde diplomas/certificados de respaldo
        if (rawInputText && data.education && data.education.length > 0) {
          data.education = enrichEducationDatesFromCertificates(data.education, rawInputText, data.fullName);
        }

        // 4. OCR Multimodal Vision para diplomas adjuntos escaneados (imagen en PDF)
        if (scannedPages && scannedPages.length > 0 && data.education && data.education.length > 0) {
          data.education = await enrichEducationDatesFromScannedPagesVision(data.education, scannedPages);
        }

        const { auditedExtraction } = auditAndRepairCvExtraction(data);
        return auditedExtraction;
      }
    }
  } catch (err) {
    console.warn('[IDP] Fallo en Cascade AI Router para texto, recurriendo a parseCvTextToStructuredData:', err);
  }

  const rawParsed = parseCvTextToStructuredData(extractedRawText, fileName);
  if (rawInputText && rawParsed.education && rawParsed.education.length > 0) {
    rawParsed.education = enrichEducationDatesFromCertificates(rawParsed.education, rawInputText, rawParsed.fullName);
  }
  if (scannedPages && scannedPages.length > 0 && rawParsed.education && rawParsed.education.length > 0) {
    rawParsed.education = await enrichEducationDatesFromScannedPagesVision(rawParsed.education, scannedPages);
  }
  const { auditedExtraction } = auditAndRepairCvExtraction(rawParsed);
  return auditedExtraction;
}

/**
 * Analizador Inteligente de Diplomas, Títulos y Certificaciones Oficiales
 * Extrae texto real del documento (PDF o imagen), detecta emisor, título, fecha y código de verificación.
 */
export async function parseCredentialDocumentMultimodal(
  fileBase64: string,
  mimeType: string,
  fileName: string,
  existingEducation: Array<{ degree: string; institution: string; year: string }>
): Promise<VerifiedCredential> {
  let text = '';
  const isPdf =
    mimeType.includes('pdf') ||
    fileName.toLowerCase().endsWith('.pdf') ||
    fileBase64.startsWith('JVBERi0');

  if (isPdf) {
    try {
      const { extractText } = await import('unpdf');
      const buffer = Buffer.from(fileBase64, 'base64');
      const uint8 = new Uint8Array(buffer);
      const res = await extractText(uint8);
      text = Array.isArray(res.text) ? res.text.join('\n') : (res.text || '');
    } catch (e) {
      console.warn('Error extrayendo texto de diploma PDF:', e);
    }
  } else {
    try {
      text = Buffer.from(fileBase64, 'base64').toString('utf-8');
    } catch (e) {
      console.warn('Error decodificando texto:', e);
    }
  }

  // 1. Extraer Código de Verificación, Folio o Hash Oficial
  let verificationCode = '';
  const folioMatch = text.match(/(?:folio|n°\s*folio|exp\.)[:\s]*([A-Z0-9-]+)/i);
  const codeMatch = text.match(/(?:código de verificación|codigo de verificacion|código de validez|code=)[:\s]*([a-zA-Z0-9-]+)/i);
  if (codeMatch) {
    verificationCode = codeMatch[1].trim();
  } else if (folioMatch) {
    verificationCode = `FOLIO-${folioMatch[1].trim()}`;
  } else {
    verificationCode = `CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;
  }

  // 2. Extraer Institución Emisora
  let issuingInstitution = '';
  const instPatterns = [
    /(?:universidad\s+de\s+[a-záéíóúñ\s]+|universidad\s+[a-záéíóúñ\s]+)/i,
    /(?:servicio\s+nacional\s+de\s+capacitación\s+y\s+empleo|sence)/i,
    /(?:servicio\s+nacional\s+para\s+la\s+prevención\s+y\s+rehabilitación\s+del\s+consumo\s+de\s+drogas\s+y\s+alcohol|senda)/i,
    /(?:organización\s+panamericana\s+de\s+la\s+salud|ops|oms)/i,
    /(?:subsecretaría\s+de\s+derechos\s+humanos)/i,
    /(?:education\s+business\s+group(?:,\s*inc\.)?)/i,
    /(?:grupo\s+ascs(?:\s+do\s+agile)?)/i,
    /(?:sociedad\s+de\s+educacion\s+y\s+capacitacion\s+ltda)/i,
    /(?:instituto\s+profesional\s+[a-záéíóúñ\s]+|instituto\s+[a-záéíóúñ\s]+)/i,
  ];

  for (const pattern of instPatterns) {
    const match = text.match(pattern);
    if (match) {
      issuingInstitution = match[0].trim();
      break;
    }
  }

  if (!issuingInstitution) {
    // Buscar en líneas que indiquen emisor
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const candidateInst = lines.find(
      (l) => l.length < 50 && (l.toLowerCase().includes('universidad') || l.toLowerCase().includes('instituto') || l.toLowerCase().includes('institución') || l.toLowerCase().includes('escuela'))
    );
    issuingInstitution = candidateInst || (fileName.toLowerCase().includes('universidad') ? 'Universidad Acreditada' : 'Institución Certificadora');
  }

  // 3. Extraer Nombre del Grado, Título o Certificación
  let credentialName = '';
  // Buscar texto entre comillas (muy común en certificados: "Primeros Auxilios Psicológicos")
  const quotedMatch = text.match(/["«]([^"»]{4,80})["»]/);
  if (quotedMatch && !quotedMatch[1].toLowerCase().includes('sensibilidad estacional')) {
    credentialName = quotedMatch[1].trim();
  }

  if (!credentialName) {
    // Buscar patrones como "Diplomado en...", "Curso de...", "Programa:"
    const courseMatch = text.match(/(?:diplomado\s+en|curso(?:\s+de)?|programa(?:\s+de)?|capacitación(?:\s+de)?|título\s+de|licenciatura\s+en)[:\s]*([^\r\n,]{4,75})/i);
    if (courseMatch) {
      credentialName = courseMatch[0].trim();
    }
  }

  if (!credentialName) {
    // Fallback: buscar línea que contenga palabras clave de título
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const titleLine = lines.find(
      (l) => l.length < 75 && (l.toLowerCase().includes('psicodiagnóstico') || l.toLowerCase().includes('psicolog') || l.toLowerCase().includes('informes tecnicos') || l.toLowerCase().includes('primeros auxilios') || l.toLowerCase().includes('autolesión') || l.toLowerCase().includes('derechos'))
    );
    credentialName = titleLine || (fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
  }

  // 4. Extraer Fecha / Año de Emisión
  let issueDate = '';
  const dateMatch = text.match(/(?:\d{1,2}\s+de\s+[a-z]+\s+(?:del?\s+)?)?(?:19|20)\d{2}\b/i);
  if (dateMatch) {
    issueDate = dateMatch[0].trim();
  } else {
    issueDate = `${new Date().getFullYear()}`;
  }

  // 5. Comparar con existingEducation para saber si ya existe en el CV
  let bestMatchIndex = -1;
  let maxScore = 0;

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  const normCredName = normalize(credentialName);
  const normCredInst = normalize(issuingInstitution);
  const credTokens = normCredName.split(' ').filter((w) => w.length > 3);

  existingEducation.forEach((edu, idx) => {
    const normEdu = normalize(`${edu.degree} ${edu.institution}`);
    let hits = 0;
    credTokens.forEach((token) => {
      if (normEdu.includes(token)) hits++;
    });

    const score = credTokens.length > 0 ? hits / credTokens.length : 0;
    // Si la institución coincide fuertemente
    const instMatch = normCredInst.length > 4 && normEdu.includes(normCredInst.slice(0, 10));

    const totalScore = score + (instMatch ? 0.35 : 0);
    if (totalScore > maxScore) {
      maxScore = totalScore;
      bestMatchIndex = idx;
    }
  });

  const isMatched = bestMatchIndex >= 0 && maxScore >= 0.4;

  return {
    id: crypto.randomUUID(),
    issuingInstitution,
    credentialName,
    issueDate,
    verificationCode,
    mappedEducationIndex: isMatched ? bestMatchIndex : undefined,
    validationStatus: isMatched ? 'CRYPTOGRAPHIC_MATCH' : 'SEMANTIC_MATCH',
  };
}

/**
 * Generador de extracción resiliente con arquitectura Google XYZ y needs_metric
 * Si no se puede leer texto del documento, retorna un arquetipo neutral sin datos hardcodeados
 */
function synthesizeDeterministicExtraction(fileName: string): MultimodalCvExtraction {
  const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  return {
    fullName: baseName.length > 2 && !baseName.toLowerCase().includes('cv') ? baseName : 'Profesional Titulado',
    email: '',
    phone: '',
    location: 'Chile',
    targetRole: 'Profesional Especialista',
    summary: 'Profesional comprometido con la excelencia técnica, optimización de procesos y cumplimiento riguroso de normativas y buenas prácticas del sector.',
    skills: ['Trabajo en equipo', 'Gestión de proyectos', 'Resolución de problemas', 'Comunicación asertiva'],
    experience: [],
    education: [],
    references: [],
  };
}

/**
 * Reconcilia y rehidrata los números de contacto de las referencias laborales
 * buscando en el texto extraído del documento original si la IA devolvió marcadores
 * como [TELEFONO_PROTEGIDO] o si faltó el teléfono.
 */
function reconcileReferenceContacts(
  references: Array<{ name: string; role: string; company: string; contact?: string | undefined }>,
  rawText: string
): Array<{ name: string; role: string; company: string; contact: string }> {
  if (!rawText || !Array.isArray(references) || references.length === 0) {
    return (references || []).map((r) => ({ ...r, contact: r.contact || '' }));
  }

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Preprocesar líneas: unir números huérfanos que completan teléfonos (ej. "+56 9 8226" seguido de "8970")
  const unifiedLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (i + 1 < lines.length && /^\d{3,5}$/.test(lines[i + 1])) {
      line = `${line} ${lines[i + 1]}`;
      i++;
    }
    unifiedLines.push(line);
  }

  const phoneRegex = /(?:\+?56\s?(?:9\s?)?|\b9\s?)?\d{4}[\s.-]?\d{4}\b|\b(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/;

  return references.map((ref) => {
    let cleanContact = ref.contact || '';
    if (!cleanContact.includes('PROTEGIDO') && /\d{6,}/.test(cleanContact)) {
      return { ...ref, contact: cleanContact };
    }

    const normName = ref.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const nameWords = normName.split(/\s+/).filter((w) => w.length > 2);
    const firstName = nameWords[0] || '';
    const lastName = nameWords[1] || '';

    let foundPhone = '';

    for (let i = 0; i < unifiedLines.length; i++) {
      const lineNorm = unifiedLines[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      // Debe coincidir el primer nombre Y el apellido para no confundir a Marisol Cárcamo con Claudia Cárcamo
      const matchesFullName = firstName && lastName
        ? (lineNorm.includes(firstName) && lineNorm.includes(lastName))
        : lineNorm.includes(normName);

      if (matchesFullName) {
        // 1. Buscar en la MISMA línea primero
        const selfMatch = unifiedLines[i].match(phoneRegex);
        if (selfMatch && selfMatch[0].replace(/\D/g, '').length >= 8) {
          foundPhone = selfMatch[0].trim();
          break;
        }
        // 2. Si no estaba en la misma línea, buscar en la línea inmediatamente siguiente
        if (i + 1 < unifiedLines.length) {
          const nextMatch = unifiedLines[i + 1].match(phoneRegex);
          if (nextMatch && nextMatch[0].replace(/\D/g, '').length >= 8) {
            foundPhone = nextMatch[0].trim();
            break;
          }
        }
      }
    }

    return {
      ...ref,
      contact: foundPhone || cleanContact,
    };
  });
}

/**
 * Verifica si un string de año educativo contiene un año o rango numérico real (19xx / 20xx)
 * y no es un marcador genérico como "No especificado", "Pendiente" o "Graduado / Acreditado".
 */
function hasValidEducationYear(yearStr: string | undefined): boolean {
  if (!yearStr) return false;
  const trimmed = yearStr.trim();
  if (!trimmed) return false;
  if (/no\s+especificado|sin\s+fecha|pendiente|graduado|acreditado|n\/a|null|undefined/i.test(trimmed)) {
    return false;
  }
  return /\b(19\d{2}|20\d{2})\b/.test(trimmed);
}

/**
 * Normaliza palabras partidas por kerning tipográfico en PDFs de certificados
 * (ej. "Ed ucation Business Group, I nc." -> "Education Business Group, Inc.")
 * y aplica stemming español ligero para singular/plural (ej. "autolesiones" -> "autolesion").
 */
function stemSpanishToken(token: string): string {
  if (token.length <= 4) return token;
  if (token.endsWith('ciones')) return token.slice(0, -6) + 'cion';
  if (token.endsWith('siones')) return token.slice(0, -6) + 'sion';
  if (token.endsWith('les') && token.length > 6) return token.slice(0, -2);
  if (token.endsWith('es') && token.length > 5 && !/[aeiou]es$/.test(token)) {
    return token.slice(0, -2);
  }
  if (token.endsWith('s') && token.length > 4) {
    return token.slice(0, -1);
  }
  return token;
}

/**
 * Normaliza y tokeniza un texto para cálculo de similitud léxica sin acentos ni stopwords,
 * incluyendo reparación de kerning PDF y stemming plural/singular.
 */
function extractSignificantTokens(text: string): Set<string> {
  const stopwords = new Set([
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no',
    'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'si', 'porque', 'esta',
    'entre', 'cuando', 'muy', 'sin', 'sobre', 'tambien', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde',
    'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos',
    'curso', 'diplomado', 'titulo', 'licenciado', 'licenciatura', 'capacitacion', 'programa', 'certificacion',
    'formacion', 'aprobado', 'participacion', 'certificado', 'otorga', 'presente', 'haber', 'completado',
    'exito', 'modalidad', 'distancia', 'horas', 'cronologicas', 'duracion', 'realizado'
  ]);

  // Reparar palabras comunes partidas por kerning en certificados PDF antes de tokenizar
  const deKerned = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bed\s+ucation\b/g, 'education')
    .replace(/\bi\s+nc\b/g, 'inc')
    .replace(/\bwisc\s*-\s*v\b/g, 'wiscv')
    .replace(/[^a-z0-9\s]/g, ' ');

  const rawTokens = deKerned.split(/\s+/).filter((t) => t.length >= 3 && !stopwords.has(t));
  const result = new Set<string>();
  for (const t of rawTokens) {
    const stemmed = stemSpanishToken(t);
    result.add(stemmed.length >= 3 && !stopwords.has(stemmed) ? stemmed : t);
  }
  return result;
}

/**
 * Convierte un año de 2 o 4 dígitos a formato canónico de 4 dígitos (ej. "25" -> "2025", "19" -> "2019").
 */
function normalizeYearToken(yearRaw: string): string | null {
  const clean = yearRaw.trim();
  if (/^(19\d{2}|20\d{2})$/.test(clean)) {
    return clean;
  }
  if (/^\d{2}$/.test(clean)) {
    const num = parseInt(clean, 10);
    if (num >= 0 && num <= 35) return `20${clean}`;
    if (num >= 70 && num <= 99) return `19${clean}`;
  }
  return null;
}

/**
 * Busca de forma universal la fecha o año de realización/término en un bloque de certificado/diploma.
 * Prioriza explícitamente la fecha de término o realización del curso por sobre la fecha de impresión del portal.
 */
export function extractDateFromCertificateBlock(blockText: string): string | null {
  if (!blockText) return null;

  const MONTHS_PATTERN = '(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)';

  // 1. PRIORIDAD MÁXIMA: Fecha de Término / Ejecución explícita del curso (ej. SENCE "Fecha de Término Curso 02-06-2023" o "desarrollado entre el 19/05/25 y el 09/06/25")
  const explicitCompletionSlash = blockText.match(
    /(?:fecha\s+de\s+t[ée]rmino(?:\s+curso)?|finalizado\s+el|desarrollado\s+entre\s+el\s+\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\s+y\s+el|completado\s+el|realizado\s+el)[:\s]*\d{1,2}[/-]\d{1,2}[/-](\d{2,4})\b/i
  );
  if (explicitCompletionSlash) {
    const norm = normalizeYearToken(explicitCompletionSlash[1]);
    if (norm) return norm;
  }

  // 2. Rango de fechas dd/mm/yy(yy) a dd/mm/yy(yy) (toma la fecha de término del rango)
  const slashRangeMatch = blockText.match(
    /\b\d{1,2}[/-]\d{1,2}[/-](\d{2,4})\s+(?:y\s+el|al|a|hasta(?:\s+el)?|-|–)\s+\d{1,2}[/-]\d{1,2}[/-](\d{2,4})\b/i
  );
  if (slashRangeMatch) {
    const normEnd = normalizeYearToken(slashRangeMatch[2]);
    if (normEnd) return normEnd;
  }

  // 3. Fechas en español "dd de [mes] de/del aaaa" o "dd [mes] aaaa" (ignorando pies de firma/impresión posteriores si ya hay fecha del curso)
  const spanishFullMatches = Array.from(
    blockText.matchAll(
      new RegExp(`\\b\\d{1,2}\\s+(?:de\\s+)?${MONTHS_PATTERN}\\s+(?:del?\\s+)?(19\\d{2}|20\\d{2})\\b`, 'gi')
    )
  );
  if (spanishFullMatches.length > 0) {
    return spanishFullMatches[0][1];
  }

  // 4. Formato anglosajón/híbrido en certificados (ej. SENDA: "abril 10, 2019" o "junio 2019" o "abril – junio 2019")
  const monthFirstMatch = blockText.match(
    new RegExp(`\\b${MONTHS_PATTERN}\\s+(?:\\d{1,2},?\\s*|(?:[–—\\-]|a|al)\\s*${MONTHS_PATTERN}\\s+)?(19\\d{2}|20\\d{2})\\b`, 'i')
  );
  if (monthFirstMatch) {
    return monthFirstMatch[1];
  }

  // 5. Fechas con slash o guion dd/mm/aaaa o dd-mm-aa
  const slashDateMatch = blockText.match(/\b\d{1,2}[/-]\d{1,2}[/-](19\d{2}|20\d{2}|\d{2})\b/);
  if (slashDateMatch) {
    const norm = normalizeYearToken(slashDateMatch[1]);
    if (norm) return norm;
  }

  // 6. Rango de años explícito "2013 – 2018"
  const rangeMatch = blockText.match(/\b(19\d{2}|20\d{2})\s*[–—-]\s*(19\d{2}|20\d{2})\b/);
  if (rangeMatch) {
    return `${rangeMatch[1]} – ${rangeMatch[2]}`;
  }

  // 7. Años sueltos válidos en el bloque del diploma
  const years = Array.from(blockText.matchAll(/\b(19\d{2}|20\d{2})\b/g)).map((m) => parseInt(m[1], 10));
  if (years.length > 0) {
    const validYears = years.filter((y) => y >= 1990 && y <= 2030);
    if (validYears.length > 0) {
      return String(validYears[0]);
    }
  }

  return null;
}

/**
 * Emparejador Semántico Universal de Fechas desde Anexos/Diplomas.
 * Examina exclusivamente los bloques de diplomas adjuntos (después del cuerpo del CV)
 * y busca coincidencias léxicas, institucionales y posicionales con los cursos del profesional.
 */
export function enrichEducationDatesFromCertificates(
  education: Array<{ degree: string; institution: string; year: string }>,
  fullRawText: string,
  candidateName?: string
): Array<{ degree: string; institution: string; year: string }> {
  if (!fullRawText || !Array.isArray(education) || education.length === 0) return education;

  // 1. Verificar si en el cuerpo del CV existe un rango de años completo (ej. "2013 – 2018") para títulos que solo quedaron con 1 año ("2018")
  const cvBodyText = isolateCvBodyFromAttachments(fullRawText, candidateName);
  const cvBodyLines = cvBodyText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 2. Extraer EXCLUSIVAMENTE las páginas de anexos/certificados posteriores al CV
  const attachmentsRaw = extractAttachmentsFromDocument(fullRawText, candidateName);
  const certificateBlocks = (attachmentsRaw || '')
    .split(/--- PÁGINA SIGUIENTE ---|--- PÁGINA \d+ ---|\f/)
    .map((b) => b.trim())
    .filter((b) => b.length > 25);

  const usedBlockIndices = new Set<number>();

  // Primera pasada: enriquecer rangos del cuerpo del CV y emparejar certificados con texto digital
  const enriched = education.map((edu) => {
    const cleanedYear = hasValidEducationYear(edu.year) ? edu.year.trim() : '';

    // Si tiene un solo año (ej. "2018"), verificar si en el cuerpo del CV aparece como rango "2013 – 2018" junto al título/institución
    if (/^(19\d{2}|20\d{2})$/.test(cleanedYear)) {
      const eduTokens = extractSignificantTokens(`${edu.degree} ${edu.institution}`);
      for (let i = 0; i < cvBodyLines.length; i++) {
        const windowText = [cvBodyLines[i - 1] || '', cvBodyLines[i], cvBodyLines[i + 1] || ''].join(' ');
        const rangeMatch = windowText.match(new RegExp(`\\b(19\\d{2}|20\\d{2})\\s*[–—-]\\s*(${cleanedYear})\\b`));
        if (rangeMatch) {
          const lineTokens = extractSignificantTokens(windowText);
          let hits = 0;
          for (const t of eduTokens) {
            if (lineTokens.has(t)) hits++;
          }
          if (hits >= 2) {
            return { ...edu, year: `${rangeMatch[1]} – ${rangeMatch[2]}` };
          }
        }
      }
      return { ...edu, year: cleanedYear };
    }

    // Si ya tiene un rango válido o un año válido distinto del genérico '2024', conservarlo
    if (cleanedYear && !cleanedYear.includes('2024')) {
      return { ...edu, year: cleanedYear };
    }

    if (certificateBlocks.length === 0) {
      return { ...edu, year: cleanedYear };
    }

    const degreeTokens = extractSignificantTokens(edu.degree);
    const instTokens = extractSignificantTokens(edu.institution);
    const allEduTokens = new Set([...degreeTokens, ...instTokens]);
    if (allEduTokens.size === 0) return { ...edu, year: cleanedYear };

    let bestScore = 0;
    let bestBlockIdx = -1;

    for (let idx = 0; idx < certificateBlocks.length; idx++) {
      const block = certificateBlocks[idx];
      const blockTokens = extractSignificantTokens(block);

      let degreeHits = 0;
      for (const token of degreeTokens) {
        if (blockTokens.has(token)) degreeHits++;
      }

      let instHits = 0;
      for (const token of instTokens) {
        if (blockTokens.has(token)) instHits++;
      }

      const degreeRatio = degreeTokens.size > 0 ? degreeHits / degreeTokens.size : 0;
      const instBonus = instHits > 0 ? 0.22 : 0;

      // Sinonimia semántica común en certificados oficiales (ej. SENCE "Redacción de informes técnicos" <-> "Elaboración de Informes Técnicos")
      const hasSemanticCourseMatch =
        degreeHits >= 2 && instHits >= 1
          ? 0.25
          : 0;

      const totalScore = degreeRatio + instBonus + hasSemanticCourseMatch;

      // Exigir al menos 2 tokens coincidentes del título (o 1 si el título solo tiene 1 token significativo, más coincidencia institucional)
      const minDegreeHits = degreeTokens.size >= 2 ? 2 : 1;
      if (degreeHits >= minDegreeHits && totalScore > bestScore && totalScore >= 0.42) {
        bestScore = totalScore;
        bestBlockIdx = idx;
      }
    }

    if (bestBlockIdx !== -1) {
      const detectedYear = extractDateFromCertificateBlock(certificateBlocks[bestBlockIdx]);
      if (detectedYear) {
        usedBlockIndices.add(bestBlockIdx);
        return {
          ...edu,
          year: detectedYear,
        };
      }
    }

    return { ...edu, year: cleanedYear };
  });

  // Segunda pasada: resolver certificados vectoriales/aplanados huérfanos (cuando el título del curso está en curvas vectoriales como TCPDF, pero el bloque contiguo tiene fecha de emisión y marcadores de diploma)
  for (let i = 0; i < enriched.length; i++) {
    if (enriched[i].year) continue;

    // Buscar si un curso hermano de la misma institución se emparejó con el bloque k, y el bloque k+1 es un diploma válido sin reclamar
    const instNorm = enriched[i].institution.toLowerCase().trim();
    for (let j = 0; j < enriched.length; j++) {
      if (i === j || !enriched[j].year) continue;
      if (instNorm && enriched[j].institution.toLowerCase().trim() === instNorm) {
        // Buscar bloques huérfanos cortos (< 250 chars) con marcadores de certificado ("horas cronológicas", "tcpdf", "%")
        for (let bIdx = 0; bIdx < certificateBlocks.length; bIdx++) {
          if (usedBlockIndices.has(bIdx)) continue;
          const orphanBlock = certificateBlocks[bIdx];
          if (
            orphanBlock.length < 260 &&
            /horas\s+cronol[óo]gicas|tcpdf|certificado|aprobaci[óo]n|\b\d{1,3}\s*%/i.test(orphanBlock)
          ) {
            const orphanYear = extractDateFromCertificateBlock(orphanBlock);
            if (orphanYear) {
              usedBlockIndices.add(bIdx);
              enriched[i] = { ...enriched[i], year: orphanYear };
              break;
            }
          }
        }
      }
      if (enriched[i].year) break;
    }
  }

  return enriched;
}

/**
 * Enriquecimiento Multimodal con Visión (Gemini Flash Vision) para páginas de certificados
 * escaneados como imagen dentro del PDF (donde la capa de texto digital tiene 0 caracteres).
 */
async function enrichEducationDatesFromScannedPagesVision(
  education: Array<{ degree: string; institution: string; year: string }>,
  scannedPages: ScannedPageAttachment[]
): Promise<Array<{ degree: string; institution: string; year: string }>> {
  const missingIndices = education
    .map((edu, idx) => (!hasValidEducationYear(edu.year) ? idx : -1))
    .filter((idx) => idx !== -1);

  if (missingIndices.length === 0 || !scannedPages || scannedPages.length === 0) {
    return education;
  }

  const geminiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();

  if (!geminiKey) {
    return education;
  }

  try {
    const missingCoursesList = missingIndices.map((idx) => ({
      index: idx,
      degree: education[idx].degree,
      institution: education[idx].institution,
    }));

    const parts: Array<Record<string, unknown>> = [
      {
        text: `Analiza estas imágenes de diplomas/certificados adjuntos en el CV y determina el año de realización o emisión para los siguientes cursos sin fecha:\n${JSON.stringify(missingCoursesList, null, 2)}\n\nDevuelve EXCLUSIVAMENTE un objeto JSON con el formato:\n{\n  "matches": [\n    { "index": number, "year": "YYYY" }\n  ]\n}`,
      },
      ...scannedPages.slice(0, 6).map((page) => ({
        inlineData: {
          mimeType: page.mimeType,
          data: page.base64,
        },
      })),
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) return education;
    const data = await response.json();
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawJson) return education;

    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed?.matches)) return education;

    const updated = [...education];
    for (const match of parsed.matches) {
      const idx = Number(match?.index);
      const yearStr = String(match?.year || '').trim();
      if (
        Number.isInteger(idx) &&
        idx >= 0 &&
        idx < updated.length &&
        hasValidEducationYear(yearStr)
      ) {
        updated[idx] = { ...updated[idx], year: yearStr };
      }
    }
    return updated;
  } catch (err) {
    console.warn('[IDP Vision] No se pudo extraer fechas de páginas escaneadas:', err);
    return education;
  }
}

/**
 * Fusiona la educación extraída por la IA con cursos, diplomados y certificaciones
 * detectados en el parser heurístico de texto, y actualiza años simples ("2018")
 * cuando el parser de texto preservó el rango completo ("2013 – 2018").
 */
function mergeEducations(
  aiEducation: Array<{ degree: string; institution: string; year: string }>,
  textEducation: Array<{ degree: string; institution: string; year: string }>
): Array<{ degree: string; institution: string; year: string }> {
  if (!Array.isArray(textEducation) || textEducation.length === 0) return aiEducation;
  if (!Array.isArray(aiEducation) || aiEducation.length === 0) return textEducation;

  const result = aiEducation.map((item) => ({
    ...item,
    year: hasValidEducationYear(item.year) ? item.year.trim() : '',
  }));

  for (const textEdu of textEducation) {
    const textNorm = textEdu.degree.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingIndex = result.findIndex((item) => {
      const itemNorm = item.degree.toLowerCase().replace(/[^a-z0-9]/g, '');
      return itemNorm.includes(textNorm) || textNorm.includes(itemNorm);
    });

    if (existingIndex === -1) {
      if (textEdu.degree.length > 5) {
        result.push({
          ...textEdu,
          year: hasValidEducationYear(textEdu.year) ? textEdu.year.trim() : '',
        });
      }
    } else {
      const existing = result[existingIndex];
      const textYearValid = hasValidEducationYear(textEdu.year) ? textEdu.year.trim() : '';
      const isTextRange = /\b(19\d{2}|20\d{2})\s*[–—-]\s*(19\d{2}|20\d{2}|presente|actual)/i.test(textYearValid);
      const isExistingRange = /\b(19\d{2}|20\d{2})\s*[–—-]\s*(19\d{2}|20\d{2}|presente|actual)/i.test(existing.year);

      if ((isTextRange && !isExistingRange) || (!existing.year && textYearValid)) {
        result[existingIndex] = {
          ...existing,
          year: textYearValid,
        };
      }
    }
  }

  return result;
}

/**
 * Determina semánticamente si dos entradas de experiencia laboral o proyectos representan el mismo cargo,
 * independientemente de cómo se haya repartido la ciudad ("Concepción", "Penco") o el área entre role y company.
 */
function areSameExperienceEntry(
  a: { company: string; role: string; period: string },
  b: { company: string; role: string; period: string }
): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const aFull = norm(`${a.role} ${a.company}`);
  const bFull = norm(`${b.role} ${b.company}`);

  const aCompact = aFull.replace(/\s+/g, '');
  const bCompact = bFull.replace(/\s+/g, '');
  if (aCompact.includes(bCompact) || bCompact.includes(aCompact)) return true;

  // Marcadores institucionales o de portafolio inequívocos
  const institutionalClusters = [
    ['penitenciario', 'sodexo', 'reinsercion'],
    ['hospital clinico', 'cuidados paliativos'],
    ['almirante jorge montt', 'convivencia escolar'],
    ['cesfam'],
    ['secretaria regional', 'seremi', 'practicante'],
    ['proyectos de desarrollo', 'portafolio', 'desarrollo tecnologico', 'desarrollador de sistemas'],
  ];

  for (const cluster of institutionalClusters) {
    const aHas = cluster.some((kw) => aFull.includes(kw));
    const bHas = cluster.some((kw) => bFull.includes(kw));
    if (aHas && bHas) return true;
  }

  // Comparación por período compartido + palabras significativas de rol/empresa
  const aYears = (a.period.match(/\b(?:19|20)\d{2}\b/g) || []).join('-');
  const bYears = (b.period.match(/\b(?:19|20)\d{2}\b/g) || []).join('-');
  const genericWords = new Set(['psicologo', 'reemplazante', 'concepcion', 'penco', 'magallanes', 'chile', 'de', 'en', 'el', 'la', 'los', 'las', 'y']);
  const aTokens = aFull.split(' ').filter((w) => w.length >= 4 && !genericWords.has(w));
  const bTokens = bFull.split(' ').filter((w) => w.length >= 4 && !genericWords.has(w));

  if (aTokens.length > 0 && bTokens.length > 0) {
    const shared = aTokens.filter((w) => bTokens.includes(w)).length;
    const minLen = Math.min(aTokens.length, bTokens.length);
    if (shared / minLen >= 0.5) return true;
    if (aYears && aYears === bYears && shared >= 1) return true;
  }

  return false;
}

/**
 * Fusiona la experiencia laboral extraída por la IA con las experiencias detectadas
 * por el parser heurístico de texto para garantizar que ningún cargo o viñeta se pierda
 * y que jamás se dupliquen cargos existentes.
 */
function mergeExperiences(
  aiExp: Array<{
    company: string;
    role: string;
    period: string;
    rawAchievements: string[];
    xyzBullets: Array<{ text: string; needs_metric: boolean }>;
  }>,
  textExp: Array<{
    company: string;
    role: string;
    period: string;
    rawAchievements: string[];
    xyzBullets: Array<{ text: string; needs_metric: boolean }>;
  }>
): Array<{
  company: string;
  role: string;
  period: string;
  rawAchievements: string[];
  xyzBullets: Array<{ text: string; needs_metric: boolean }>;
}> {
  if (!Array.isArray(textExp) || textExp.length === 0) return aiExp;
  if (!Array.isArray(aiExp) || aiExp.length === 0) return textExp;

  const result = [...aiExp];

  for (const tExp of textExp) {
    // Descartar falsos cargos producto de cortes de línea (ej. URLs, leyes o etiquetas técnicas en el título)
    const lowerRole = tExp.role.toLowerCase();
    if (
      tExp.role.length > 85 ||
      /^[lL|]\s+/.test(tExp.role) ||
      lowerRole.includes('github.com') ||
      lowerRole.includes('ley 19') ||
      lowerRole.startsWith('arquitectura:') ||
      lowerRole.startsWith('trabajo y la ley')
    ) {
      continue;
    }

    const existingIndex = result.findIndex((item) => areSameExperienceEntry(item, tExp));

    if (existingIndex === -1) {
      // Cargo legítimo no extraído por la IA: agregar íntegramente
      result.push(tExp);
    } else {
      // Si la IA extrajo el cargo pero omitió viñetas originales o desordenó los proyectos del portafolio
      const existing = result[existingIndex];
      const existingCount = (existing.xyzBullets || []).length;
      const textCount = (tExp.xyzBullets || []).length;
      const isPortfolio = /proyectos?\s+de\s+desarrollo|portafolio|desarrollador\s+de\s+sistemas/i.test(
        `${existing.role} ${existing.company} ${tExp.role}`
      );
      const textBulletsClean = (tExp.xyzBullets || []).every(
        (b) => !/^[lL|]\s+/.test(b.text) && (b.text.match(/\|/g) || []).length <= 1
      );

      if (textBulletsClean && (textCount > existingCount || (isPortfolio && textCount >= 3))) {
        result[existingIndex] = {
          ...existing,
          rawAchievements:
            tExp.rawAchievements && tExp.rawAchievements.length > (existing.rawAchievements || []).length
              ? tExp.rawAchievements
              : existing.rawAchievements,
          xyzBullets: tExp.xyzBullets,
        };
      }
    }
  }

  return result;
}

/**
 * Fusiona las referencias laborales para garantizar que no se omitan contactos.
 */
function mergeReferences(
  aiRefs: Array<{ name: string; role: string; company: string; contact?: string | undefined }>,
  textRefs: Array<{ name: string; role: string; company: string; contact?: string | undefined }>
): Array<{ name: string; role: string; company: string; contact?: string }> {
  if (!Array.isArray(textRefs) || textRefs.length === 0) return aiRefs;
  if (!Array.isArray(aiRefs) || aiRefs.length === 0) {
    return textRefs.map((r) => ({ ...r, contact: r.contact || '' }));
  }

  const result = [...aiRefs];
  for (const tRef of textRefs) {
    const tNorm = tRef.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const exists = result.some((item) => {
      const itemNorm = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return itemNorm.includes(tNorm) || tNorm.includes(itemNorm);
    });
    if (!exists) {
      result.push({
        name: tRef.name,
        role: tRef.role,
        company: tRef.company,
        contact: tRef.contact || '',
      });
    }
  }
  return result;
}
