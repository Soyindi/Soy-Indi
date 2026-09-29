import { jsPDF } from 'jspdf';
import { CVFormValues } from '@/entities/cv/schemas';

export interface GeneratePdfOptions {
  format?: 'letter' | 'a4';
  filename?: string;
}

/**
 * Motor Vectorial de Exportación a PDF para INDI (2026)
 * Genera un PDF binario con texto 100% seleccionable (compatible con filtros ATS Workday/Greenhouse),
 * micro-tipografía editorial suiza, firma digital con RUT chileno y disparo de descarga directa.
 */
export async function generateAndDownloadCvPdf(
  cv: CVFormValues,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const { format = 'letter' } = options;
  const { content } = cv;

  // 1. Inicializar documento con dimensiones exactas
  // Carta / US Letter: 215.9 x 279.4 mm
  // A4 Global: 210 x 297 mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: format === 'a4' ? 'a4' : 'letter',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 18; // mm margen lateral
  const contentWidth = pageWidth - marginX * 2;
  let cursorY = 20; // mm margen superior inicial

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = 20;
    }
  };

  // Helper para dibujar línea divisoria de sección
  const drawSectionHeader = (title: string) => {
    checkPageBreak(14);
    cursorY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(title.toUpperCase(), marginX, cursorY);
    cursorY += 2;
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.3);
    doc.line(marginX, cursorY, marginX + contentWidth, cursorY);
    cursorY += 5;
  };

  // --- CABECERA PRINCIPAL ---
  const fullName = (content.fullName || 'PROFESIONAL').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(fullName, marginX, cursorY);
  cursorY += 6.5;

  // Cargo objetivo
  const targetRole = cv.targetRole || 'ROL PROFESIONAL';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(67, 56, 202); // Indigo 700
  doc.text(targetRole.toUpperCase(), marginX, cursorY);
  cursorY += 5.5;

  // Barra de contacto y metadatos
  const contactParts: string[] = [];
  if (content.email) contactParts.push(content.email);
  if (content.phone) contactParts.push(content.phone);
  if (content.location) contactParts.push(content.location);
  if (content.rut) contactParts.push(`RUT: ${content.rut}`);
  if (content.linkedinUrl) contactParts.push(content.linkedinUrl.replace(/^https?:\/\/(www\.)?/, ''));
  if (content.websiteUrl) contactParts.push(content.websiteUrl.replace(/^https?:\/\/(www\.)?/, ''));

  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    const contactLine = contactParts.join('  •  ');
    const splitContact = doc.splitTextToSize(contactLine, contentWidth);
    doc.text(splitContact, marginX, cursorY);
    cursorY += splitContact.length * 4.2;
  }

  // Divisor superior elegante
  cursorY += 1.5;
  doc.setDrawColor(15, 23, 42); // Slate 900
  doc.setLineWidth(0.8);
  doc.line(marginX, cursorY, marginX + contentWidth, cursorY);
  cursorY += 6;

  // --- 1. RESUMEN PROFESIONAL ---
  if (content.summary && content.summary.trim().length > 0) {
    drawSectionHeader('Resumen Profesional');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // Slate 700
    const summaryLines = doc.splitTextToSize(content.summary, contentWidth);
    checkPageBreak(summaryLines.length * 4.5);
    doc.text(summaryLines, marginX, cursorY, { lineHeightFactor: 1.35 });
    cursorY += summaryLines.length * 4.4 + 4;
  }

  // --- 2. EXPERIENCIA LABORAL ---
  if (content.experience && content.experience.length > 0) {
    drawSectionHeader('Experiencia Laboral');

    for (const exp of content.experience) {
      checkPageBreak(18);
      // Cargo y Empresa
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(exp.role || 'Cargo', marginX, cursorY);

      // Periodo alineado a la derecha
      if (exp.period) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(exp.period, marginX + contentWidth, cursorY, { align: 'right' });
      }
      cursorY += 4.2;

      // Empresa
      doc.setFont('helvetica', 'medium' in doc ? 'medium' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text(exp.company || 'Empresa', marginX, cursorY);
      cursorY += 4.5;

      // Viñetas STAR/XYZ
      const bullets = exp.bullets && exp.bullets.length > 0
        ? exp.bullets
        : (exp.detailedBullets || []).map((b) => b.text);

      for (const bullet of bullets) {
        if (!bullet || bullet.trim().length === 0) continue;
        const bulletIndent = 4;
        const bulletTextWidth = contentWidth - bulletIndent;
        const bulletLines = doc.splitTextToSize(bullet, bulletTextWidth);
        
        checkPageBreak(bulletLines.length * 4.2 + 2);
        
        // Símbolo de viñeta
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text('•', marginX, cursorY);

        // Texto de la viñeta
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85); // Slate 700
        doc.text(bulletLines, marginX + bulletIndent, cursorY, { lineHeightFactor: 1.3 });
        cursorY += bulletLines.length * 4.1 + 1.8;
      }
      cursorY += 2.5;
    }
  }

  // --- 3. EDUCACIÓN Y CERTIFICACIONES VERIFICADAS ---
  if (content.education && content.education.length > 0) {
    drawSectionHeader('Educación y Certificaciones');

    for (const edu of content.education) {
      checkPageBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.degree || 'Título o Grado', marginX, cursorY);

      if (edu.year) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(edu.year, marginX + contentWidth, cursorY, { align: 'right' });
      }
      cursorY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(edu.institution || 'Institución', marginX, cursorY);

      if (edu.verifiedCredentialId) {
        cursorY += 3.8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(5, 150, 105); // Emerald 600
        doc.text(`[✓ VERIFICADO W3C: ${edu.verifiedCredentialId}]`, marginX, cursorY);
      }
      cursorY += 5;
    }
  }

  // --- 4. HABILIDADES CLAVE ---
  if (content.skills && content.skills.length > 0) {
    drawSectionHeader('Habilidades y Competencias');
    const skillsText = content.skills.join('  •  ');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const skillLines = doc.splitTextToSize(skillsText, contentWidth);
    checkPageBreak(skillLines.length * 4.4);
    doc.text(skillLines, marginX, cursorY, { lineHeightFactor: 1.35 });
    cursorY += skillLines.length * 4.4 + 5;
  }

  // --- 5. FIRMA DIGITAL EJECUTIVA Y PIE LEGAL ---
  if (content.signatureUrl || content.fullName) {
    // Si la firma está cerca del borde inferior, mover a nueva página
    checkPageBreak(38);

    cursorY += 6;
    const signatureBlockX = marginX + contentWidth - 65; // Bloque alineado a la derecha

    // Si hay rúbrica o imagen de firma
    if (content.signatureUrl && content.signatureUrl.startsWith('data:image')) {
      try {
        doc.addImage(content.signatureUrl, 'PNG', signatureBlockX + 5, cursorY, 45, 16);
        cursorY += 17;
      } catch (e) {
        console.warn('No se pudo incrustar la imagen de firma en PDF:', e);
        cursorY += 12;
      }
    } else if (content.signatureType === 'TYPOGRAPHIC' && content.signatureUrl) {
      doc.setFont('times', 'italic');
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text(content.signatureUrl, signatureBlockX + 5, cursorY + 8);
      cursorY += 14;
    } else {
      cursorY += 12;
    }

    // Línea de rúbrica
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.4);
    doc.line(signatureBlockX, cursorY, signatureBlockX + 65, cursorY);
    cursorY += 3.8;

    // Nombre y RUT bajo la firma
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(content.fullName || '', signatureBlockX + 32.5, cursorY, { align: 'center' });
    cursorY += 3.5;

    if (content.rut) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`RUT: ${content.rut}`, signatureBlockX + 32.5, cursorY, { align: 'center' });
      cursorY += 3;
    }

    if (content.signatureDate) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Firmado digitalmente: ${content.signatureDate}`, signatureBlockX + 32.5, cursorY, { align: 'center' });
    }
  }

  // --- 6. METADATOS DE SEGURIDAD Y ATS (PIE DE PÁGINA) ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `INDI Smart CV • Estándar ATS 2026 • Formato: ${format === 'a4' ? 'A4 Global' : 'Carta (US)'}`,
      marginX,
      pageHeight - 8
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      marginX + contentWidth,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  // 7. Generar nombre de archivo sanitizado y disparar la descarga directa
  const sanitizedName = (content.fullName || 'Profesional')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_');
  
  const finalFilename = options.filename || `CV_${sanitizedName}_2026.pdf`;

  // Disparar descarga directa en 1 clic
  doc.save(finalFilename);
}
