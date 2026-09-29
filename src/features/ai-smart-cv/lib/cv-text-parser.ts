import { MultimodalCvExtraction } from '@/entities/cv/schemas';

/**
 * Parser heurístico y semántico de texto plano para CVs
 * Diseñado para procesar el texto extraído directamente de documentos PDF
 * sin requerir conexión obligatoria a APIs externas ni filtrar datos privados.
 */
export function parseCvTextToStructuredData(
  rawText: string,
  fileName: string
): MultimodalCvExtraction {
  // Limpieza inicial de texto y separación en líneas
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Extraer Metadatos Clave por Expresiones Regulares
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
    /\b(Santiago|Valparaíso|Viña del Mar|Concepción|Antofagasta|La Serena|Temuco|Rancagua|Puerto Montt|Punta Arenas|Chile|Remoto|Remote|Buenos Aires|Lima|Bogotá|Ciudad de México|Madrid)\b/i
  );
  const location = locationMatch ? `${locationMatch[0]}, Chile` : 'Chile / Remoto';

  // 2. Extraer Nombre del Candidato
  // Suele ser la primera línea no vacía que no sea un correo, teléfono, URL ni encabezado genérico
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
      l.length > 50 ||
      l.includes(':')
    ) {
      continue;
    }
    fullName = l;
    break;
  }

  // Fallback de nombre basado en el nombre de archivo si no se detectó
  if (!fullName || fullName.length < 3) {
    const cleanFileName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/^(cv|curriculum|resume)[_\s-]*/i, '')
      .replace(/[_-]/g, ' ')
      .trim();
    fullName = cleanFileName.length > 3 ? cleanFileName : 'Profesional';
  }

  // 3. Extraer Rol Objetivo o Título Profesional
  let targetRole = '';
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const l = lines[i];
    if (l === fullName) continue;
    const lower = l.toLowerCase();
    if (
      lower.includes('ingenier') ||
      lower.includes('desarrollador') ||
      lower.includes('developer') ||
      lower.includes('arquitect') ||
      lower.includes('analista') ||
      lower.includes('consultor') ||
      lower.includes('especialista') ||
      lower.includes('manager') ||
      lower.includes('director') ||
      lower.includes('jefe') ||
      lower.includes('lead') ||
      lower.includes('designer') ||
      lower.includes('diseñador') ||
      lower.includes('abogado') ||
      lower.includes('médico') ||
      lower.includes('comercial')
    ) {
      targetRole = l;
      break;
    }
  }
  if (!targetRole) {
    targetRole = 'Profesional Especialista';
  }

  // 4. Identificar Secciones por Palabras Clave
  type SectionType = 'summary' | 'experience' | 'education' | 'skills' | 'other';
  const sectionIndices: Array<{ type: SectionType; lineIndex: number; title: string }> = [];

  const isSectionHeader = (line: string): { isHeader: boolean; type: SectionType } => {
    const lower = line.toLowerCase().replace(/[:\-#*]/g, '').trim();
    if (lower.length > 35) return { isHeader: false, type: 'other' };

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
      lower.includes('herramientas') ||
      lower.includes('aptitudes')
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

  // Función para obtener las líneas de una sección específica
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
    // Si no había cabecera explícita de resumen, buscar un párrafo en los primeros 10 renglones
    const candidateLines = lines.slice(2, 8).filter(
      (l) => l.length > 50 && !l.includes('@') && !l.includes('http')
    );
    if (candidateLines.length > 0) {
      summary = candidateLines.join(' ');
    } else {
      summary = `Profesional enfocado en ${targetRole}, con amplia experiencia en entrega de valor y liderazgo de iniciativas estratégicas.`;
    }
  }

  // 6. Procesar Experiencia Laboral
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

  const datePattern = /(?:19|20)\d{2}\b/i;

  for (const line of expLines) {
    // Detectar si la línea parece un nuevo cargo o empresa (por contener año o rango temporal)
    const hasYear = datePattern.test(line);
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('>');

    if (hasYear && !isBullet) {
      if (currentExp && currentExp.xyzBullets.length > 0) {
        experience.push(currentExp);
      }

      // Separar empresa, cargo y periodo
      const parts = line.split(/[|–—\-·•]/).map((p) => p.trim());
      let period = '';
      let company = '';
      let role = '';

      parts.forEach((p) => {
        if (datePattern.test(p)) {
          period = p;
        } else if (!role) {
          role = p;
        } else if (!company) {
          company = p;
        }
      });

      currentExp = {
        company: company || 'Empresa Confidencial',
        role: role || targetRole,
        period: period || '2022 - Presente',
        rawAchievements: [],
        xyzBullets: [],
      };
    } else if (currentExp) {
      const cleanBullet = line.replace(/^[•\-*>\s]+/, '').trim();
      if (cleanBullet.length > 5) {
        // Verificar si tiene métricas para STAR / Google XYZ
        const hasMetric = /\b(?:\d+[%kKmM]?|\$\d+|\d+\s?(?:personas|usuarios|clientes|meses|días))\b/i.test(
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

  if (currentExp && (currentExp.xyzBullets.length > 0 || currentExp.company)) {
    experience.push(currentExp);
  }

  // Fallback si la experiencia quedó vacía pero había texto
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

  // 7. Procesar Educación
  const eduLines = getSectionLines('education');
  const education: Array<{ degree: string; institution: string; year: string }> = [];

  eduLines.forEach((line) => {
    const hasYear = datePattern.test(line);
    const lower = line.toLowerCase();
    if (
      hasYear ||
      lower.includes('universidad') ||
      lower.includes('instituto') ||
      lower.includes('colegio') ||
      lower.includes('ingenier') ||
      lower.includes('licenciatura') ||
      lower.includes('técnico') ||
      lower.includes('diploma')
    ) {
      const parts = line.split(/[|–—\-·•]/).map((p) => p.trim());
      let year = '';
      let inst = '';
      let deg = '';

      parts.forEach((p) => {
        if (datePattern.test(p)) year = p;
        else if (
          p.toLowerCase().includes('universidad') ||
          p.toLowerCase().includes('instituto') ||
          p.toLowerCase().includes('duoc') ||
          p.toLowerCase().includes('inacap')
        ) {
          inst = p;
        } else if (!deg) {
          deg = p;
        }
      });

      education.push({
        degree: deg || line,
        institution: inst || 'Institución de Educación Superior',
        year: year || 'Graduado',
      });
    }
  });

  if (education.length === 0) {
    education.push({
      degree: targetRole,
      institution: 'Educación Superior / Formación Profesional',
      year: 'Completado',
    });
  }

  // 8. Procesar Habilidades
  const skillLines = getSectionLines('skills');
  const extractedSkills: string[] = [];

  if (skillLines.length > 0) {
    skillLines.forEach((line) => {
      // Separar por comas, viñetas o barras
      const tokens = line.split(/[,|•·\/\n]/).map((t) => t.trim());
      tokens.forEach((t) => {
        if (t.length >= 2 && t.length <= 35 && !extractedSkills.includes(t)) {
          extractedSkills.push(t);
        }
      });
    });
  } else {
    // Búsqueda heurística en todo el documento
    const commonTechSkills = [
      'TypeScript', 'JavaScript', 'React', 'Node.js', 'Next.js', 'Python', 'SQL',
      'PostgreSQL', 'Docker', 'AWS', 'Git', 'Tailwind CSS', 'Figma', 'Scrum', 'Agile',
      'Liderazgo', 'Gestión de Proyectos', 'Excel', 'Power BI', 'Jira'
    ];
    commonTechSkills.forEach((skill) => {
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
    targetRole,
    summary,
    skills: extractedSkills.length > 0 ? extractedSkills : ['Liderazgo', 'Gestión', 'Resolución de Problemas'],
    experience,
    education,
  };
}
