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

  // Expresiones regulares universales
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  const phoneMatch = rawText.match(
    /(?:\+?56\s?9|\+?\d{1,3})?[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/
  );
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  const rutMatch = rawText.match(/\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/);
  const rut = rutMatch ? rutMatch[0] : undefined;

  const linkedinMatch = rawText.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i
  );
  const linkedinUrl = linkedinMatch ? linkedinMatch[0] : '';

  const websiteMatch = rawText.match(
    /(?:https?:\/\/)?(?:www\.)?(github\.com\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+\.(?:cl|com|io|dev|me))/i
  );
  const websiteUrl = websiteMatch && !websiteMatch[0].includes('linkedin') ? websiteMatch[0] : '';

  // Ubicación básica
  const locationMatch = rawText.match(
    /\b(Santiago|Punta Arenas|Valparaíso|Viña del Mar|Concepción|Antofagasta|La Serena|Temuco|Rancagua|Puerto Montt|Chile|Remoto|Remote|Buenos Aires|Lima|Bogotá|Ciudad de México|Madrid)\b/i
  );
  const location = locationMatch ? `${locationMatch[0]}, Chile` : 'Chile / Remoto';

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
      targetRole = l.length > 60 ? l.slice(0, 57) + '...' : l;
      break;
    }
  }

  if (!targetRole) {
    targetRole = 'Profesional Especialista';
  }

  // 4. Identificar Secciones del CV por Palabras Clave
  type SectionType = 'summary' | 'experience' | 'education' | 'skills' | 'other';
  const sectionIndices: Array<{ type: SectionType; lineIndex: number; title: string }> = [];

  const isSectionHeader = (line: string): { isHeader: boolean; type: SectionType } => {
    const lower = line.toLowerCase().replace(/[:\-#*]/g, '').trim();
    if (lower.length > 40) return { isHeader: false, type: 'other' };

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
    const strippedLine = stripLeadingBullet(rawLine);
    const hasBulletPrefix = rawLine !== strippedLine;
    const hasYear = datePattern.test(strippedLine);
    const isRoleHeader = looksLikeRoleHeader(strippedLine);

    // Condición para nueva experiencia:
    // 1. Tiene fecha identificable y no es un logro largo
    // 2. O contiene un cargo profesional evidente con institución asociada (ej. "Psicólogo (Reemplazante) · Hospital...")
    const isNewRole =
      (hasYear && strippedLine.length < 120 && !strippedLine.includes('reducción') && !strippedLine.includes('diseño')) ||
      (isRoleHeader && (strippedLine.includes('·') || strippedLine.includes(' - ') || strippedLine.includes('(')) && strippedLine.length < 130);

    if (isNewRole) {
      if (currentExp && (currentExp.xyzBullets.length > 0 || currentExp.role)) {
        experience.push(currentExp);
      }

      // Separar componentes (Cargo · Empresa / Institución - Fechas)
      const parts = strippedLine.split(/[|–—\-·•]/).map((p) => p.trim()).filter(Boolean);
      let period = '';
      let inlineCompany = '';
      let role = '';

      parts.forEach((p) => {
        if (datePattern.test(p)) {
          period = period ? `${period} - ${p}` : p;
        } else if (!role && looksLikeRoleHeader(p)) {
          role = p;
        } else if (!inlineCompany && (p.toLowerCase().includes('hospital') || p.toLowerCase().includes('clínica') || p.toLowerCase().includes('sodexo') || p.toLowerCase().includes('universidad') || p.toLowerCase().includes('programa') || p.toLowerCase().includes('empresa') || p.toLowerCase().includes('instituto'))) {
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
        role: role || targetRole,
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
      lower.includes('bachiller')
    );
  };

  for (const line of eduLines) {
    // Si la línea es solo una fecha de emisión de documento o certificado, omitirla
    if (isDateOnlyLine(line)) {
      continue;
    }

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

  return {
    fullName,
    email: email || 'contacto@indi.bio',
    phone: phone || '+56 9 0000 0000',
    location,
    rut,
    linkedinUrl,
    websiteUrl,
    targetRole,
    summary,
    skills: extractedSkills.length > 0 ? extractedSkills : ['Liderazgo', 'Evaluación', 'Resolución de Problemas'],
    experience,
    education,
  };
}
