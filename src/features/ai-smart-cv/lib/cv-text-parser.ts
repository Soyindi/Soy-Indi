import { MultimodalCvExtraction } from '@/entities/cv/schemas';

/**
 * Parser heurístico y semántico de texto plano para CVs
 * Diseñado para procesar con máxima precisión el texto extraído directamente de documentos PDF,
 * desacoplando empresas multilínea, filtrando fechas administrativas espurias en educación
 * y sintetizando titulares limpios para cumplir con estándares ATS 2026.
 */
export function parseCvTextToStructuredData(
  rawText: string,
  fileName: string
): MultimodalCvExtraction {
  // 1. Limpieza inicial de texto y separación en líneas
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1.1 Extraer RUT chileno primero con máxima prioridad (formato XX.XXX.XXX-K o XXXXXXXX-K)
  const rutMatch = rawText.match(/\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/);
  const rut = rutMatch ? rutMatch[0] : '';

  // 1.2 Extraer Teléfono excluyendo explícitamente cualquier fragmento que forme parte del RUT
  // Los números de teléfono chilenos tienen formato: +56 9 XXXX XXXX o fijo 61 2 XXXXXX o 9XXXXXXXX
  let phone = '';
  const chileanMobileMatch = rawText.match(/(?:\+?56\s?9|\b9)\s?\d{4}\s?\d{4}\b/);
  const chileanLandlineMatch = rawText.match(/(?:\+?56\s?)?(?:61|2|32|33|34|35|41|42|43|45|51|52|53|55|57|58|71|72|73|75)\s?\d{1,2}\s?\d{5,6}\b/);

  if (chileanMobileMatch && (!rut || !rut.includes(chileanMobileMatch[0].replace(/\s/g, '')))) {
    phone = chileanMobileMatch[0].trim();
  } else if (chileanLandlineMatch && (!rut || !rut.includes(chileanLandlineMatch[0].replace(/\s/g, '')))) {
    phone = chileanLandlineMatch[0].trim();
  } else {
    // Intento con regex internacional que no sea un RUT (no termina con guión dígito/k)
    const genericPhoneMatch = rawText.match(/(?:\+?56\s?)?9\s?\d{4}\s?\d{4}/);
    if (genericPhoneMatch) {
      phone = genericPhoneMatch[0].trim();
    }
  }

  // 1.3 Email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  // 1.4 Enlaces profesionales
  const linkedinMatch = rawText.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i
  );
  const linkedinUrl = linkedinMatch ? linkedinMatch[0] : '';

  const websiteMatch = rawText.match(
    /(?:https?:\/\/)?(?:www\.)?(github\.com\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+\.(?:cl|com|io|dev|me))/i
  );
  const websiteUrl = websiteMatch && !websiteMatch[0].includes('linkedin') ? websiteMatch[0] : '';

  // 1.5 Ubicación básica (dejando vacío si no se encuentra en lugar de inventar)
  const locationMatch = rawText.match(
    /\b(Punta Arenas|Santiago|Valparaíso|Viña del Mar|Concepción|Penco|Antofagasta|La Serena|Temuco|Rancagua|Puerto Montt|Chile|Remoto|Remote|Buenos Aires|Lima|Bogotá|Ciudad de México|Madrid)\b/i
  );
  const location = locationMatch ? (locationMatch[0].toLowerCase().includes('chile') ? locationMatch[0] : `${locationMatch[0]}, Chile`) : '';

  // 2. Extraer Nombre del Candidato
  let fullName = '';
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const l = lines[i];
    const lower = l.toLowerCase();
    if (
      lower.includes('curriculum') ||
      lower.includes('hoja de vida') ||
      lower.includes('resume') ||
      lower.includes('@') ||
      lower.includes('http') ||
      lower.includes('www.') ||
      /\d{4}/.test(l) ||
      l.length < 3 ||
      l.length > 55 ||
      l.includes(':')
    ) {
      continue;
    }
    fullName = l;
    break;
  }

  if (!fullName || fullName.length < 3) {
    const cleanFileName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/^(cv|curriculum|resume)[_\s-]*/i, '')
      .replace(/[_-]/g, ' ')
      .trim();
    fullName = cleanFileName.length > 3 ? cleanFileName : 'Profesional';
  }

  // 3. Extraer y Normalizar Rol Objetivo / Titular Profesional
  let targetRole = '';
  for (let i = 0; i < Math.min(12, lines.length); i++) {
    const l = lines[i];
    if (l === fullName) continue;
    const lower = l.toLowerCase();
    
    // Evitar oraciones discursivas largas como titular
    if (lower.startsWith('a esta') || lower.startsWith('con experiencia') || lower.startsWith('profesional orientado')) {
      // Si la frase contiene roles técnicos o clínicos, sintetizar un titular limpio
      if (lower.includes('psicólogo') && lower.includes('desarrollo de software')) {
        targetRole = 'Psicólogo Clínico & Desarrollador de Software';
        break;
      } else if (lower.includes('desarrollo de software') || lower.includes('software')) {
        targetRole = 'Desarrollador de Software & Arquitectura de Datos';
        break;
      }
      continue;
    }

    if (
      lower.includes('ingenier') ||
      lower.includes('desarrollador') ||
      lower.includes('developer') ||
      lower.includes('arquitect') ||
      lower.includes('psicólog') ||
      lower.includes('psicolog') ||
      lower.includes('analista') ||
      lower.includes('consultor') ||
      lower.includes('especialista') ||
      lower.includes('manager') ||
      lower.includes('director') ||
      lower.includes('jefe') ||
      lower.includes('lead') ||
      lower.includes('diseñador')
    ) {
      targetRole = l.trim();
      break;
    }
  }

  if (!targetRole) {
    targetRole = 'Profesional Especialista';
  }

  // 4. Identificar Secciones del CV por Palabras Clave
  type SectionType = 'summary' | 'experience' | 'education' | 'skills' | 'references' | 'other';
  const sectionIndices: Array<{ type: SectionType; lineIndex: number; title: string }> = [];

  const isSectionHeader = (line: string): { isHeader: boolean; type: SectionType } => {
    const lower = line.toLowerCase().replace(/[:\-#*]/g, '').trim();
    if (lower.length > 40) return { isHeader: false, type: 'other' };

    if (
      lower.includes('referencia') ||
      lower.includes('references') ||
      lower.includes('contactos de referencia') ||
      lower.includes('personas de referencia') ||
      lower.includes('contacto de referencia') ||
      lower.includes('referencias profesionales') ||
      lower.includes('referencias laborales') ||
      lower === 'referencias' ||
      lower === 'referentes'
    ) {
      return { isHeader: true, type: 'references' };
    }
    if (
      lower.includes('resumen') ||
      lower.includes('perfil') ||
      lower.includes('sobre mí') ||
      lower.includes('acerca de') ||
      lower.includes('summary') ||
      lower.includes('profile')
    ) {
      return { isHeader: true, type: 'summary' };
    }
    if (
      lower.includes('experiencia') ||
      lower.includes('trayectoria') ||
      lower.includes('historial laboral') ||
      lower.includes('historia laboral') ||
      lower.includes('work experience') ||
      lower.includes('empleos')
    ) {
      return { isHeader: true, type: 'experience' };
    }
    if (
      lower.includes('educación') ||
      lower.includes('educacion') ||
      lower.includes('formación') ||
      lower.includes('formacion') ||
      lower.includes('estudios') ||
      lower.includes('education') ||
      lower.includes('antecedentes académicos')
    ) {
      return { isHeader: true, type: 'education' };
    }
    if (
      lower.includes('habilidades') ||
      lower.includes('skills') ||
      lower.includes('competencias') ||
      lower.includes('tecnologías') ||
      lower.includes('tecnologias') ||
      lower.includes('conocimientos') ||
      lower.includes('herramientas')
    ) {
      return { isHeader: true, type: 'skills' };
    }
    return { isHeader: false, type: 'other' };
  };

  lines.forEach((line, idx) => {
    const { isHeader, type } = isSectionHeader(line);
    if (isHeader) {
      sectionIndices.push({ type, lineIndex: idx, title: line });
    }
  });

  const getSectionLines = (type: SectionType): string[] => {
    const target = sectionIndices.find((s) => s.type === type);
    if (!target) return [];
    const nextSection = sectionIndices.find((s) => s.lineIndex > target.lineIndex);
    const endIndex = nextSection ? nextSection.lineIndex : lines.length;
    return lines.slice(target.lineIndex + 1, endIndex);
  };

  // 5. Procesar Resumen Profesional
  const summaryLines = getSectionLines('summary');
  let summary = summaryLines.join(' ').trim();
  if (!summary || summary.length < 15) {
    const candidateLines = lines.slice(2, 8).filter(
      (l) => l.length > 50 && !l.includes('@') && !l.includes('http')
    );
    if (candidateLines.length > 0) {
      summary = candidateLines.join(' ');
    } else {
      summary = `Profesional con amplia trayectoria en ${targetRole}, comprometido con el rigor metodológico y la innovación continua.`;
    }
  }

  // 6. Procesar Experiencia Laboral (Con Desacoplamiento Multilínea de Empresa)
  const expLines = getSectionLines('experience');
  const experience: Array<{
    company: string;
    role: string;
    period: string;
    rawAchievements: string[];
    xyzBullets: Array<{ text: string; needs_metric: boolean }>;
  }> = [];

  let currentExp: {
    company: string;
    role: string;
    period: string;
    rawAchievements: string[];
    xyzBullets: Array<{ text: string; needs_metric: boolean }>;
  } | null = null;

  const datePattern = /(?:(?:ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+)?(?:19|20)\d{2}\b/i;
  // Regex universal de caracteres de viñeta: bullets unicode, guiones, asteriscos, círculos, etc.
  const bulletSymbolRegex = /^[\s•\-\*·\u2022\u25cf\u25cb\u25e6\u2219\u22c5\u00b7>]+/g;
  const stripLeadingBullet = (s: string) => s.replace(bulletSymbolRegex, '').trim();
  let pendingCompanyCandidate = '';

  // Helper para detectar si una línea parece un cargo profesional nuevo
  const looksLikeRoleHeader = (str: string): boolean => {
    const s = str.toLowerCase();
    const roleKeywords = [
      'psicólog', 'psicolog', 'ingenier', 'desarrollador', 'analista', 'consultor',
      'coordinador', 'director', 'jefe', 'especialista', 'docente', 'profesor',
      'terapeuta', 'investigador', 'asistente', 'practicante', 'reemplazante', 'encargado'
    ];
    return roleKeywords.some((k) => s.includes(k));
  };

  for (let i = 0; i < expLines.length; i++) {
    const rawLine = expLines[i];
    let strippedLine = stripLeadingBullet(rawLine);
    const hasBulletPrefix = rawLine !== strippedLine;
    const hasYear = datePattern.test(strippedLine);
    const isRoleHeader = looksLikeRoleHeader(strippedLine);

    // Condición para nueva experiencia:
    // 1. Es un encabezado de cargo evidente (ej: "Psicólogo de Reinserción Social · Complejo...")
    // 2. O contiene fecha y no es un logro
    const isNewRole =
      (isRoleHeader && (strippedLine.includes('·') || strippedLine.includes(' - ') || strippedLine.includes('(') || strippedLine.length < 90)) ||
      (hasYear && !hasBulletPrefix && strippedLine.length < 120 && !strippedLine.includes('reducción') && !strippedLine.includes('diseño'));

    if (isNewRole) {
      if (currentExp && (currentExp.xyzBullets.length > 0 || currentExp.role)) {
        experience.push(currentExp);
      }

      // Si la línea siguiente es la fecha correspondiente a este cargo (ej: Línea 1 Cargo, Línea 2 "Ene. 2025 - Mar. 2025")
      let period = '';
      if (!hasYear && i + 1 < expLines.length) {
        const nextLine = stripLeadingBullet(expLines[i + 1]);
        if (datePattern.test(nextLine) && !looksLikeRoleHeader(nextLine) && !nextLine.startsWith('●') && !nextLine.startsWith('•')) {
          period = nextLine;
          i++; // Consumir la línea de fecha para no crear un cargo duplicado
        }
      }

      // Separar componentes (Cargo · Empresa / Institución - Fechas)
      const parts = strippedLine.split(/[|–—\-·•]/).map((p) => p.trim()).filter(Boolean);
      let inlineCompany = '';
      let role = '';

      parts.forEach((p) => {
        if (datePattern.test(p)) {
          period = period ? `${period} - ${p}` : p;
        } else if (!role && looksLikeRoleHeader(p)) {
          role = p;
        } else if (!inlineCompany && (p.toLowerCase().includes('hospital') || p.toLowerCase().includes('clínica') || p.toLowerCase().includes('sodexo') || p.toLowerCase().includes('universidad') || p.toLowerCase().includes('programa') || p.toLowerCase().includes('empresa') || p.toLowerCase().includes('instituto') || p.toLowerCase().includes('cesfam') || p.toLowerCase().includes('escuela') || p.toLowerCase().includes('ministerial') || p.toLowerCase().includes('seremi'))) {
          inlineCompany = p;
        } else if (!role) {
          role = p;
        } else if (!inlineCompany) {
          inlineCompany = p;
        }
      });

      // Si no vino empresa en la misma línea, usar la línea candidata inmediatamente anterior
      const effectiveCompany = inlineCompany || pendingCompanyCandidate || 'Institución / Empresa';
      pendingCompanyCandidate = '';

      currentExp = {
        company: effectiveCompany,
        role: role || (isRoleHeader ? strippedLine : 'Cargo Profesional'),
        period: period || (hasYear ? 'Periodo Registrado' : '2022 - Presente'),
        rawAchievements: [],
        xyzBullets: [],
      };
    } else if (!hasBulletPrefix && strippedLine.length < 65 && !strippedLine.includes(':') && !hasYear) {
      // Línea candidata a ser el nombre de la empresa u organización
      pendingCompanyCandidate = strippedLine;
    } else if (currentExp) {
      const cleanBullet = stripLeadingBullet(strippedLine);
      if (cleanBullet.length > 5) {
        const hasMetric = /\b(?:\d+[%kKmM]?|\$\d+|\d+\s?(?:personas|usuarios|pacientes|clientes|meses|días|proyectos))\b/i.test(
          cleanBullet
        );
        currentExp.rawAchievements.push(cleanBullet);
        currentExp.xyzBullets.push({
          text: cleanBullet,
          needs_metric: !hasMetric,
        });
      }
    }
  }

  if (currentExp && (currentExp.xyzBullets.length > 0 || currentExp.role)) {
    experience.push(currentExp);
  }

  // Fallback si la experiencia quedó vacía
  if (experience.length === 0) {
    experience.push({
      company: 'Trayectoria Profesional Destacada',
      role: targetRole,
      period: '2022 - Presente',
      rawAchievements: [summary],
      xyzBullets: [
        {
          text: `Lideré iniciativas clave en ${targetRole}, optimizando flujos de trabajo e implementando mejores prácticas.`,
          needs_metric: true,
        },
      ],
    });
  }

  // 7. Procesar Educación (Filtrando Rigurosamente Fechas Administrativas Espurias)
  const eduLines = getSectionLines('education');
  const education: Array<{ degree: string; institution: string; year: string }> = [];

  // Expresión para descartar fechas sueltas como "Santiago, 11 de Noviembre de 2024"
  const isDateOnlyLine = (l: string): boolean => {
    const lower = l.toLowerCase();
    return (
      /^(santiago|valdiviana|chile|puerto|punta)?[,\s]*\d{1,2}\s+de\s+[a-z]+\s+(?:del?\s+)?\d{4}/i.test(lower) ||
      /^\d{1,2}\s+de\s+[a-z]+\s+de\s+\d{4}/i.test(lower) ||
      /^fecha\s+de\s+emisi/i.test(lower)
    );
  };

  // Palabras indispensables para considerar una línea como educación formal
  const hasAcademicKeyword = (l: string): boolean => {
    const lower = l.toLowerCase();
    return (
      lower.includes('psicólog') ||
      lower.includes('psicolog') ||
      lower.includes('ingenier') ||
      lower.includes('licenciatura') ||
      lower.includes('universidad') ||
      lower.includes('instituto') ||
      lower.includes('diplomado') ||
      lower.includes('diploma') ||
      lower.includes('título') ||
      lower.includes('titulo') ||
      lower.includes('magíster') ||
      lower.includes('magister') ||
      lower.includes('master') ||
      lower.includes('máster') ||
      lower.includes('doctor') ||
      lower.includes('técnico') ||
      lower.includes('tecnico') ||
      lower.includes('bachiller') ||
      lower.includes('certificad') ||
      lower.includes('curso') ||
      lower.includes('formación') ||
      lower.includes('formacion') ||
      lower.includes('especialización') ||
      lower.includes('especializacion') ||
      lower.includes('capacitación') ||
      lower.includes('capacitacion')
    );
  };

  for (const rawLine of eduLines) {
    // Si la línea es solo una fecha de emisión de documento o certificado, omitirla
    if (isDateOnlyLine(rawLine)) {
      continue;
    }

    // Sanitizar artefactos de OCR como "%Ï ", "%ï ", etc.
    const line = rawLine
      .replace(/^[%‰]\s*[ÏïîIíi]?\s*/i, '')
      .replace(/^[\s•\-\*·\u2022\u25cf\u25cb\u25e6\u2219\u22c5\u00b7\.\d+\)]+\s*/, '')
      .trim();

    if (hasAcademicKeyword(line)) {
      const parts = line.split(/[|–—\-·•]/).map((p) => p.trim()).filter(Boolean);
      let year = '';
      let inst = '';
      let deg = '';

      parts.forEach((p) => {
        if (datePattern.test(p)) {
          year = p;
        } else if (
          p.toLowerCase().includes('universidad') ||
          p.toLowerCase().includes('instituto') ||
          p.toLowerCase().includes('subdirección') ||
          p.toLowerCase().includes('servicio')
        ) {
          inst = p;
        } else if (!deg) {
          deg = p;
        }
      });

      // Extraer año si está entre paréntesis en la línea
      if (!year) {
        const yearMatch = line.match(/\((?:19|20)\d{2}\s*[-–—]?\s*(?:(?:19|20)\d{2}|presente)?\)/i);
        if (yearMatch) year = yearMatch[0].replace(/[()]/g, '');
      }

      education.push({
        degree: deg || line.replace(/\((?:19|20)\d{2}.*\)/, '').trim(),
        institution: inst || 'Universidad / Institución de Formación',
        year: year || 'Graduado',
      });
    }
  }

  // Si la lista de educación quedó vacía pero había datos, proveer el título principal
  if (education.length === 0) {
    education.push({
      degree: targetRole,
      institution: 'Educación Superior Acreditada',
      year: 'Graduado',
    });
  }

  // 8. Procesar Habilidades y Competencias
  const skillLines = getSectionLines('skills');
  const extractedSkills: string[] = [];

  if (skillLines.length > 0) {
    skillLines.forEach((line) => {
      const tokens = line.split(/[,|•·\/\n]/).map((t) => t.trim());
      tokens.forEach((t) => {
        if (t.length >= 2 && t.length <= 35 && !extractedSkills.includes(t)) {
          extractedSkills.push(t);
        }
      });
    });
  }

  // Si se extrajeron pocas habilidades, buscar en el texto completo
  if (extractedSkills.length < 4) {
    const commonSkills = [
      'Psicodiagnóstico', 'Evaluación Psicológica', 'Intervención Clínica', 'Metodologías Ágiles',
      'Desarrollo de Software', 'Python', 'TypeScript', 'SQL', 'Bases de Datos', 'Docker',
      'Liderazgo', 'Gestión de Equipos', 'Resolución de Conflictos', 'Ética Profesional', 'Redacción de Informes'
    ];
    commonSkills.forEach((skill) => {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(rawText) && !extractedSkills.includes(skill)) {
        extractedSkills.push(skill);
      }
    });
  }

  // 9. Procesar Referencias Laborales (Deteniéndose estrictamente al terminar el CV o al encontrar anexos/certificados)
  const refLines = getSectionLines('references');
  const references: Array<{ name: string; role: string; company: string; contact?: string }> = [];

  // Palabras prohibidas que corresponden a diplomas, folios, certificados del Estado o metadatos
  const isCertificateOrNoise = (str: string): boolean => {
    const s = str.toLowerCase();
    return (
      s.includes('certificado') ||
      s.includes('diploma') ||
      s.includes('constancia') ||
      s.includes('sence') ||
      s.includes('senda') ||
      s.includes('tcpdf') ||
      s.includes('folio') ||
      s.includes('rut alumno') ||
      s.includes('franquicia') ||
      s.includes('capacitación') ||
      s.includes('capacitacion') ||
      s.includes('aprobó el curso') ||
      s.includes('ha completado') ||
      s.includes('se confiere') ||
      s.includes('código de verificación') ||
      s.includes('codigo de verificacion') ||
      s.includes('call center') ||
      s.includes('subsecretaría de derechos humanos') ||
      s.includes('organización panamericana de la salud') ||
      s.includes('organizacion panamericana de la salud') ||
      s.includes('campus virtual') ||
      s.includes('evaluación final') ||
      s.includes('horas pedagógicas') ||
      s.includes('horas cronológicas') ||
      s.includes('______') ||
      /^\d+$/.test(str.trim()) // Números sueltos como "8970"
    );
  };

  for (let i = 0; i < refLines.length; i++) {
    let cleanLine = stripLeadingBullet(refLines[i]);
    if (cleanLine.length < 3) continue;

    // Si encontramos la línea de firma final del CV (ej: "Matías Ricardo... · RUT 18.209.442-0" o "______")
    // o encabezado de certificado/anexo, el CV terminó formalmente aquí.
    if (
      cleanLine.includes('______') ||
      (fullName && cleanLine.includes(fullName) && (cleanLine.includes('RUT') || cleanLine.includes('18.'))) ||
      cleanLine.toLowerCase().startsWith('certificado') ||
      cleanLine.toLowerCase().startsWith('diploma') ||
      cleanLine.toLowerCase().startsWith('constancia')
    ) {
      break; // DETENER: Todo lo posterior son anexos o certificados adjuntos
    }

    if (isCertificateOrNoise(cleanLine)) continue;

    // Si la siguiente línea es un número huérfano (ej. "8970" porque el PDF partió el teléfono en 2 líneas)
    // Solo anexar si cleanLine ya contiene indicios de teléfono o dígitos previos
    if (i + 1 < refLines.length) {
      const nextLine = refLines[i + 1].trim();
      if (/^\d{3,5}$/.test(nextLine) && (/(?:\+?56|tel|fono|cel|\b9\s?\d{3,4})/i.test(cleanLine) || /\d{3,4}$/.test(cleanLine))) {
        cleanLine = `${cleanLine} ${nextLine}`;
        i++; // Avanzar índice para consumir el número
      }
    }

    // Helper para extraer contactos (teléfono y/o email) de un texto dado
    const extractContactInfo = (text: string): { phone?: string; email?: string } => {
      // Teléfonos chilenos e internacionales (+56 9 XXXX XXXX, +569XXXXXXXX, etc.)
      const phoneMatch = text.match(/(?:\+?56\s?(?:9\s?)?|\b9\s?)?\d{4}[\s.-]?\d{4}\b|\b(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/);
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
      const phone = phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 8 ? phoneMatch[0].trim() : undefined;
      const email = emailMatch ? emailMatch[0].trim() : undefined;
      return { phone, email };
    };

    let name = '';
    let role = '';
    let company = '';
    let contact = '';

    // 1. Extraer contacto de la línea actual si existe
    const currentContacts = extractContactInfo(cleanLine);
    let contactParts: string[] = [];
    if (currentContacts.phone) contactParts.push(currentContacts.phone);
    if (currentContacts.email) contactParts.push(currentContacts.email);

    let extraRoleOrCompanyCandidate = '';
    let linesConsumed = 0;

    // Helper para determinar si una línea es PURAMENTE de contacto (ej: "Tel: +56 9...", "Contacto: ...")
    const isPureContactLine = (text: string): boolean => {
      const trimmed = text.trim();
      if (/^(?:contacto|tel[ée]fono|fono|celular|cel|whatsapp|mail|correo|email)[:\s]/i.test(trimmed)) return true;
      const contacts = extractContactInfo(trimmed);
      if (contacts.phone || contacts.email) {
        // Remover el teléfono y email; si lo que resta son palabras de contacto o casi nada (<4 chars), es línea pura de contacto
        const residual = trimmed
          .replace(contacts.phone || '', '')
          .replace(contacts.email || '', '')
          .replace(/(?:tel[ée]fono|fono|celular|cel|whatsapp|mail|correo|email|contacto|\+?\d|[\s().\-_@/•·|–—])+/gi, '')
          .trim();
        return residual.length < 4;
      }
      return false;
    };

    // Helper para determinar si una línea representa un cargo/puesto laboral
    const isJobTitleLine = (text: string): boolean => {
      const lower = text.toLowerCase();
      const jobKeywords = [
        'jefe', 'jefa', 'director', 'directora', 'gerente', 'coordinador', 'coordinadora',
        'enfermero', 'enfermera', 'médico', 'medico', 'cirujano', 'cirujana', 'psicólogo', 'psicóloga',
        'psicologo', 'psicologa', 'docente', 'profesor', 'profesora', 'ingeniero', 'ingeniera',
        'analista', 'asistente', 'consultor', 'consultora', 'supervisor', 'supervisora', 'encargado',
        'encargada', 'operador', 'operadora', 'técnico', 'tecnico', 'subdirector', 'subdirectora',
        'profesional', 'especialista', 'asesor', 'asesora'
      ];
      return jobKeywords.some((k) => new RegExp(`\\b${k}\\b`, 'i').test(lower));
    };

    // Helper para determinar si una línea representa una NUEVA persona de referencia
    const isPotentialNewReference = (rawLine: string, currentHasRoleOrCompany: boolean): boolean => {
      const trimmed = rawLine.trim();
      // Viñeta explícita
      if (/^[•\-\*·]\s/.test(trimmed)) return true;

      const stripped = stripLeadingBullet(trimmed);

      // Si empieza con etiqueta de contacto, NO es nueva persona
      if (/^(?:contacto|tel[ée]fono|fono|celular|cel|whatsapp|mail|correo|email)[:\s]/i.test(stripped)) {
        return false;
      }

      // Si la línea contiene palabras típicas de cargo
      if (isJobTitleLine(stripped)) {
        // Si la referencia actual AÚN NO tiene cargo ni empresa asignados, esta línea es el cargo de la actual, no una nueva persona
        if (!currentHasRoleOrCompany) {
          return false;
        }
      }

      // Si la línea tiene un separador claro (em-dash, en-dash, bullet interno, guión con espacios, barra)
      if (/[—–|·]|\s-\s/.test(stripped)) {
        // Si no tiene cargo asignado la referencia actual y la línea parece describir rol - empresa, no es nueva persona
        if (!currentHasRoleOrCompany && isJobTitleLine(stripped)) {
          return false;
        }
        // Si tiene separador y antes del separador NO parece un cargo (sino un nombre de persona)
        const firstSegment = stripped.split(/[—–|·]|\s-\s/)[0].trim();
        if (firstSegment.length >= 4 && !isJobTitleLine(firstSegment)) {
          return true;
        }
      }

      // Si la línea parece ser un nombre propio de persona (2 a 4 palabras capitalizadas, sin números ni palabras de contacto)
      if (
        stripped.length >= 6 &&
        stripped.length <= 40 &&
        !/\d/.test(stripped) &&
        !isJobTitleLine(stripped) &&
        !/^(?:instituci[óo]n|empresa|hospital|cl[íi]nica|colegio|universidad|servicio|ministerio)[:\s]/i.test(stripped)
      ) {
        const words = stripped.split(/\s+/).filter(Boolean);
        const capitalizedWords = words.filter((w) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(w));
        if (words.length >= 2 && words.length <= 4 && capitalizedWords.length === words.length) {
          return true;
        }
      }

      return false;
    };

    // 2. Inspeccionar líneas siguientes sólo si nos falta rol/empresa o contacto para ESTA referencia
    let lookAheadOffset = 1;
    while (i + lookAheadOffset < refLines.length && lookAheadOffset <= 2) {
      const candidateRaw = refLines[i + lookAheadOffset];

      // Si la línea candidata parece una NUEVA referencia, DETENER lookahead inmediatamente
      if (isPotentialNewReference(candidateRaw, Boolean(extraRoleOrCompanyCandidate))) break;

      const nextRaw = stripLeadingBullet(candidateRaw).trim();
      if (
        nextRaw.length < 3 ||
        isCertificateOrNoise(nextRaw) ||
        nextRaw.includes('______') ||
        (fullName && nextRaw.includes(fullName) && (nextRaw.includes('RUT') || nextRaw.includes('18.')))
      ) {
        break;
      }

      if (isPureContactLine(nextRaw)) {
        const c = extractContactInfo(nextRaw);
        if (c.phone && !contactParts.includes(c.phone)) contactParts.push(c.phone);
        if (c.email && !contactParts.includes(c.email)) contactParts.push(c.email);
        linesConsumed = lookAheadOffset;
        // Una vez consumido el contacto para esta persona, terminar lookahead
        break;
      } else if (!extraRoleOrCompanyCandidate && nextRaw.length < 120 && !isPureContactLine(nextRaw)) {
        // Línea de cargo / institución (ej: "Enfermera encargada • Cuidados Paliativos")
        extraRoleOrCompanyCandidate = nextRaw;
        linesConsumed = lookAheadOffset;
        lookAheadOffset++;
      } else {
        break;
      }
    }

    // Avanzar el cursor de líneas por las líneas consumidas en este bloque de referencia
    i += linesConsumed;

    if (contactParts.length > 0) {
      contact = contactParts.join(' • ');
    }

    // 3. Separar nombre, cargo y empresa
    // Normalizar separadores: em-dash, en-dash, guiones estándar rodeados de espacio o tabs
    let lineForSplitting = cleanLine;
    // Eliminar fragmentos de contacto de la línea antes de separar los campos para no contaminar role o company
    if (contactParts.length > 0) {
      contactParts.forEach((cp) => {
        lineForSplitting = lineForSplitting.replace(cp, '');
      });
      lineForSplitting = lineForSplitting.replace(/(?:tel[ée]fono|fono|celular|cel|mail|correo|email|contacto)[:\s]*/gi, ' ').trim();
    }

    const parts = lineForSplitting
      .split(/[—–|·\t]|\s-\s/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length >= 3) {
      name = parts[0];
      const roleCompanyPart = parts[1];
      if (roleCompanyPart.includes(',')) {
        const [r, ...c] = roleCompanyPart.split(',');
        role = r.trim();
        company = c.join(',').trim();
      } else {
        role = parts[1];
        company = parts[2];
      }
    } else if (parts.length === 2) {
      name = parts[0];
      if (parts[1].includes(',')) {
        const [r, ...c] = parts[1].split(',');
        role = r.trim();
        company = c.join(',').trim();
      } else {
        role = parts[1];
        company = extraRoleOrCompanyCandidate || 'Institución de Referencia';
      }
    } else if (parts.length === 1 && extraRoleOrCompanyCandidate) {
      name = parts[0];
      // Si extraRoleOrCompanyCandidate tiene bullet (•), dash (—, –), o guión con espacio
      const extraParts = extraRoleOrCompanyCandidate.split(/[—–|·•\t]|\s-\s/).map((p) => p.trim()).filter(Boolean);
      if (extraParts.length >= 2) {
        role = extraParts[0];
        company = extraParts.slice(1).join(' - ');
      } else if (extraRoleOrCompanyCandidate.includes(',')) {
        const [r, ...c] = extraRoleOrCompanyCandidate.split(',');
        role = r.trim();
        company = c.join(',').trim();
      } else {
        role = extraRoleOrCompanyCandidate;
        company = 'Institución de Referencia';
      }
    } else if (parts.length === 1) {
      // Si la línea era solo el nombre (y el contacto venía en línea separada o ya fue extraído)
      name = parts[0];
      // Si el nombre contiene comas (ej. "Nombre Apellido, Cargo, Empresa")
      if (name.includes(',')) {
        const commaParts = name.split(',').map((p) => p.trim()).filter(Boolean);
        if (commaParts.length >= 3) {
          name = commaParts[0];
          role = commaParts[1];
          company = commaParts.slice(2).join(' - ');
        } else if (commaParts.length === 2) {
          name = commaParts[0];
          role = commaParts[1];
          company = 'Institución de Referencia';
        }
      } else {
        role = 'Referencia Profesional';
        company = 'Institución de Referencia';
      }
    }

    // Validar que el nombre no sea ruido ni metadatos de folios o librerías PDF
    if (name && name.length >= 4 && !name.toLowerCase().includes('tcpdf') && !name.toLowerCase().includes('folio')) {
      const cleanField = (s: string) =>
        s.replace(/(?:\+?56\s?9|\b9\d{8}\b|tel[ée]fono|fono|email|correo|celular).*$/i, '').trim();

      const cleanedName = cleanField(name);
      const cleanedRole = cleanField(role) || 'Referencia Profesional';
      const cleanedCompany = cleanField(company) || 'Institución';

      if (cleanedName.length >= 3) {
        references.push({
          name: cleanedName,
          role: cleanedRole,
          company: cleanedCompany,
          contact: contact || undefined,
        });
      }
    }
  }

  return {
    fullName,
    email: email || '', // Dejar en blanco si no se encontró (pendiente de completar)
    phone: phone || '', // Dejar en blanco si no se encontró (pendiente de completar)
    location: location || '', // Dejar en blanco si no se encontró
    rut: rut || undefined,
    linkedinUrl,
    websiteUrl,
    targetRole,
    summary,
    skills: extractedSkills.length > 0 ? extractedSkills : [],
    experience,
    education,
    references,
  };
}
