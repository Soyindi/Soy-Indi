'use client';

import React from 'react';
import { CVFormValues } from '@/entities/cv/schemas';
import { getCvDesignTemplate } from '@/entities/cv/templates';
import { Mail, Phone, MapPin, Globe, ShieldCheck, Link2 } from 'lucide-react';
import { sanitizeBulletText } from '@/features/ai-smart-cv/lib/pdf-engine';

interface CvDocumentPreviewProps {
  cv: CVFormValues;
  pageFormat?: 'a4' | 'letter';
  scale?: number;
}

export function CvDocumentPreview({ cv, pageFormat = 'a4', scale = 1 }: CvDocumentPreviewProps) {
  const { content } = cv;
  const template = getCvDesignTemplate(cv.templateId);
  const { webTokens } = template;

  // Estimación de altura y densidad de contenido para distribución armónica A4
  // Resumen: aprox 1 unidad por cada 75 caracteres
  const summaryWeight = Math.ceil((content.summary || '').length / 75);
  
  // Peso por experiencia basado en cantidad y longitud de viñetas
  const expWeights = content.experience.map((exp) => {
    const bulletsCount = exp.bullets?.length || 0;
    const bulletsLength = exp.bullets?.reduce((acc, b) => acc + b.length, 0) || 0;
    // Base de header/cargo/empresa (2.5) + peso de viñetas
    return 2.5 + bulletsCount * 1.3 + Math.ceil(bulletsLength / 90);
  });
  const totalExpWeight = expWeights.reduce((a, b) => a + b, 0);

  // Peso de secciones secundarias
  const skillsWeight = content.skills && content.skills.length > 0 ? 2.5 + Math.ceil(content.skills.length / 6) : 0;
  const eduWeight = content.education && content.education.length > 0 ? 2 + content.education.length * 1.8 : 0;
  const refWeight = content.references && content.references.length > 0 ? 2 + content.references.length * 2.2 : 0;

  // Umbral de capacidad A4 de Hoja 1 (capacidad real de hoja A4 con márgenes: ~30 unidades de peso)
  const page1MaxCapacity = 30;
  let accumulatedPage1Weight = summaryWeight + 3.5; // 3.5 por el header del documento
  let splitExpIndex = 0;

  while (splitExpIndex < content.experience.length) {
    const nextWeight = expWeights[splitExpIndex] || 2.5;
    if (accumulatedPage1Weight + nextWeight <= page1MaxCapacity) {
      accumulatedPage1Weight += nextWeight;
      splitExpIndex++;
    } else {
      break;
    }
  }

  // Asegurar al menos 1 o 2 experiencias en hoja 1 si existen
  if (splitExpIndex === 0 && content.experience.length > 0) {
    splitExpIndex = 1;
  }

  const remainingExperiences = content.experience.slice(splitExpIndex);
  const remainingWeight = 
    remainingExperiences.reduce((acc, _, i) => acc + (expWeights[splitExpIndex + i] || 2.5), 0) +
    skillsWeight +
    eduWeight +
    refWeight;

  const needsTwoPages = remainingExperiences.length > 0 || (accumulatedPage1Weight + skillsWeight + eduWeight + refWeight > page1MaxCapacity);

  // División de experiencias
  const page1Experiences = needsTwoPages ? content.experience.slice(0, splitExpIndex) : content.experience;
  const page2Experiences = needsTwoPages ? content.experience.slice(splitExpIndex) : [];

  // Helper de sanitización: previene viñetas duplicadas (• •) si el texto ya trae viñeta literal
  const cleanBullet = (text: string) =>
    text.replace(/^[\s•\-\*·\u2022\u25cf\u25cb\u25e6\u2219\u22c5\u00b7\.\d+\)]+\s*/, '').trim();

  // Dimensiones canónicas de A4 Internacional con escala fluida para pantallas grandes
  const pageDimensions = 'min-h-[1123px] w-full max-w-[860px] lg:max-w-[920px] mx-auto';

  return (
    <div className="w-full space-y-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Estilos de impresión dinámicos con corte de hoja estricto A4 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 16mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          header, nav, button, .no-print, .page-badge {
            display: none !important;
          }
          .cv-page-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: 100vh !important;
            page-break-after: always;
            break-after: page;
          }
          .cv-page-sheet:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
        }
      `}</style>

      {/* ============================================================== */}
      {/* HOJA 1: ENCABEZADO, RESUMEN Y EXPERIENCIA PRINCIPAL           */}
      {/* ============================================================== */}
      <div className="w-full flex flex-col items-center">
        {/* Badge indicador de hoja unificada */}
        <div className="page-badge mb-3 self-start flex items-center gap-2 bg-slate-900/90 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono px-3.5 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Hoja 1 {needsTwoPages ? 'de 2' : 'de 1'} • Formato Unificado A4 Internacional (Grado Empresarial)</span>
        </div>

        <div 
          className={`cv-page-sheet w-full bg-white text-zinc-900 rounded-2xl shadow-2xl p-8 sm:p-12 lg:p-14 border border-zinc-200 flex flex-col justify-between transition-all origin-top ${pageDimensions}`}
          style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}
        >
          <div>
            {/* Cabecera del CV */}
            <div className={`border-b-2 ${webTokens.headerDivider} pb-5 mb-6`}>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase leading-snug">
                {content.fullName || 'Tu Nombre Completo'}
              </h1>
              <p className={`text-xs sm:text-sm font-bold ${webTokens.roleText} uppercase tracking-wider mt-1.5 line-clamp-2`}>
                {cv.targetRole || 'Rol Profesional Objetivo'}
              </p>

              {/* Enlaces de Contacto y Perfiles Profesionales */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600 mt-3.5 font-medium">
                {content.email && (
                  <span className="flex items-center gap-1.5 hover:text-zinc-900">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    {content.email}
                  </span>
                )}
                {content.phone && (
                  <span className="flex items-center gap-1.5 hover:text-zinc-900">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    {content.phone}
                  </span>
                )}
                {content.location && (
                  <span className="flex items-center gap-1.5 hover:text-zinc-900">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {content.location}
                  </span>
                )}
                {content.rut && (
                  <span className="flex items-center gap-1.5 font-mono text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    RUT: {content.rut}
                  </span>
                )}
                {content.linkedinUrl && (
                  <a
                    href={content.linkedinUrl.startsWith('http') ? content.linkedinUrl : `https://${content.linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-1 ${webTokens.accentText} hover:opacity-80 font-semibold transition-colors`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}
                {content.websiteUrl && (
                  <a
                    href={content.websiteUrl.startsWith('http') ? content.websiteUrl : `https://${content.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-1 ${webTokens.accentText} hover:opacity-80 font-semibold transition-colors`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Portafolio / Web
                  </a>
                )}
              </div>
            </div>

            {/* Resumen Profesional (Justificado Grado Empresarial) */}
            {content.summary && (
              <div className="mb-6">
                <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-2.5`}>
                  Resumen Profesional
                </h2>
                <p className="text-xs text-zinc-700 leading-relaxed font-normal text-justify">
                  {content.summary}
                </p>
              </div>
            )}

            {/* Experiencia Laboral (Página 1) */}
            {page1Experiences.length > 0 && (
              <div className="mb-6">
                <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-3.5`}>
                  Experiencia Laboral
                </h2>
                <div className="space-y-4">
                  {page1Experiences.map((exp, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center justify-between font-bold text-zinc-900">
                        <span className="text-[13px]">{exp.role}</span>
                        <span className="text-zinc-500 text-[11px] font-normal font-mono">{exp.period}</span>
                      </div>
                      <div className={`${webTokens.accentText} font-semibold mb-1.5 text-[11px]`}>
                        {exp.company}
                      </div>
                      {exp.bullets.length > 0 && (
                        <ul className="space-y-1.5 text-zinc-700">
                          {exp.bullets.map((b, bIdx) => {
                            const cleaned = cleanBullet(b);
                            if (!cleaned) return null;
                            return (
                              <li key={bIdx} className="flex items-start gap-2 text-justify leading-relaxed">
                                <span className={`${webTokens.bulletColor} select-none mt-0.5`}>•</span>
                                <span className="flex-1">{cleaned}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Si solo hay 1 página, renderizar Habilidades y Educación en la Hoja 1 */}
            {!needsTwoPages && (
              <>
                {content.skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5 mb-2.5">
                      Habilidades y Competencias
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {content.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {content.education.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5 mb-2.5">
                      Educación & Certificaciones
                    </h2>
                    <div className="space-y-2">
                      {content.education.map((edu, eIdx) => (
                        <div key={eIdx} className="text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900">{sanitizeBulletText(edu.degree)}</span>
                            <span className="text-zinc-600">• {sanitizeBulletText(edu.institution)}</span>
                            {edu.credentialType === 'DEGREE' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Título Validado
                              </span>
                            )}
                            {edu.credentialType === 'CERTIFICATION' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                Certificado Oficial
                              </span>
                            )}
                          </div>
                          <span className="text-zinc-500 text-[11px] font-mono">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Referencias Laborales (Hoja 1 si cabe) */}
                {content.references && content.references.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5 mb-2.5">
                      Referencias Laborales
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {content.references.map((ref, rIdx) => (
                        <div key={rIdx} className="text-xs p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-zinc-900 text-[12px]">{ref.name}</div>
                            <div className="text-indigo-700 text-[11px] font-medium mt-0.5">{ref.role} • {ref.company}</div>
                          </div>
                          {ref.contact ? (
                            <div className="mt-2 pt-1.5 border-t border-zinc-200/60 flex items-center gap-1.5 text-zinc-600 text-[10.5px] font-mono">
                              <span className="font-semibold text-zinc-800">Contacto:</span>
                              <span className="select-all">{ref.contact}</span>
                            </div>
                          ) : (
                            <div className="mt-2 pt-1.5 border-t border-zinc-200/60 text-amber-600 text-[10px] italic">
                              Contacto pendiente
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pie de Página de Hoja 1 */}
          <div className="pt-4 border-t border-zinc-200 mt-6 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>INDI Smart CV • Estándar ATS Grado Empresarial</span>
            <span>Página 1 {needsTwoPages ? 'de 2' : 'de 1'}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* HOJA 2 (OPCIONAL): EXPERIENCIAS RESTANTES, HABILIDADES,       */}
      {/* EDUCACIÓN Y FIRMA DIGITAL EJECUTIVA                           */}
      {/* ============================================================== */}
      {needsTwoPages && (
        <div className="w-full flex flex-col items-center">
          {/* Badge indicador de hoja 2 */}
          <div className="page-badge mb-3 self-start flex items-center gap-2 bg-slate-900/90 text-purple-300 border border-purple-500/30 text-[11px] font-mono px-3.5 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Hoja 2 de 2 • Formato Unificado A4 Internacional</span>
          </div>

          <div 
            className={`cv-page-sheet w-full bg-white text-zinc-900 rounded-2xl shadow-2xl p-8 sm:p-12 lg:p-14 border border-zinc-200 flex flex-col justify-between transition-all origin-top ${pageDimensions}`}
            style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}
          >
            <div>
              {/* Encabezado corporativo de continuación */}
              <div className={`border-b ${webTokens.sectionHeaderBorder} pb-3 mb-6 flex items-center justify-between text-xs text-zinc-500`}>
                <span className="font-bold text-zinc-900 uppercase tracking-wider">
                  {content.fullName}
                </span>
                <span className={`${webTokens.accentText} font-medium`}>
                  {cv.targetRole} (Continuación)
                </span>
              </div>

              {/* Experiencias de Continuación */}
              {page2Experiences.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-3.5`}>
                    Experiencia Laboral (Continuación)
                  </h2>
                  <div className="space-y-4">
                    {page2Experiences.map((exp, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex items-center justify-between font-bold text-zinc-900">
                          <span className="text-[13px]">{exp.role}</span>
                          <span className="text-zinc-500 text-[11px] font-normal font-mono">{exp.period}</span>
                        </div>
                        <div className={`${webTokens.accentText} font-semibold mb-1.5 text-[11px]`}>
                          {exp.company}
                        </div>
                        {exp.bullets.length > 0 && (
                          <ul className="space-y-1.5 text-zinc-700">
                            {exp.bullets.map((b, bIdx) => {
                              const cleaned = cleanBullet(b);
                              if (!cleaned) return null;
                              return (
                                <li key={bIdx} className="flex items-start gap-2 text-justify leading-relaxed">
                                  <span className={`${webTokens.bulletColor} select-none mt-0.5`}>•</span>
                                  <span className="flex-1">{cleaned}</span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competencias y Habilidades Clave */}
              {content.skills.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-2.5`}>
                    Habilidades y Tecnologías
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {content.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className={`px-2.5 py-0.5 rounded ${webTokens.tagBg} border ${webTokens.tagBorder} ${webTokens.tagText} text-[11px]`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Educación y Títulos */}
              {content.education.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-2.5`}>
                    Educación & Formación
                  </h2>
                  <div className="space-y-2">
                    {content.education.map((edu, eIdx) => (
                      <div key={eIdx} className="text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{sanitizeBulletText(edu.degree)}</span>
                          <span className="text-zinc-600">• {sanitizeBulletText(edu.institution)}</span>
                          {edu.credentialType === 'DEGREE' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Título Validado
                            </span>
                          )}
                          {edu.credentialType === 'CERTIFICATION' && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${webTokens.accentText} ${webTokens.accentBg} px-2 py-0.5 rounded-full border ${webTokens.accentBorder}/30`}>
                              <ShieldCheck className="w-3 h-3 text-indigo-600" />
                              Certificado Oficial
                            </span>
                          )}
                        </div>
                        <span className="text-zinc-500 text-[11px] font-mono">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referencias Laborales (Hoja 2) */}
              {content.references && content.references.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-2.5`}>
                    Referencias Laborales
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {content.references.map((ref, rIdx) => (
                      <div key={rIdx} className="text-xs p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-zinc-900 text-[12px]">{ref.name}</div>
                          <div className={`${webTokens.accentText} text-[11px] font-medium mt-0.5`}>{ref.role} • {ref.company}</div>
                        </div>
                        {ref.contact ? (
                          <div className="mt-2 pt-1.5 border-t border-zinc-200/60 flex items-center gap-1.5 text-zinc-600 text-[10.5px] font-mono">
                            <span className="font-semibold text-zinc-800">Contacto:</span>
                            <span className="select-all">{ref.contact}</span>
                          </div>
                        ) : (
                          <div className="mt-2 pt-1.5 border-t border-zinc-200/60 text-amber-600 text-[10px] italic">
                            Contacto pendiente
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Firma Digital Ejecutiva & Cierre */}
            <div className="pt-6 mt-6 border-t border-zinc-200">
              <div className="flex items-end justify-between">
                <div className="text-[11px] text-zinc-500 space-y-0.5">
                  <p className="font-semibold text-zinc-800">
                    {content.fullName} • Perfil Profesional
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Validado en plataforma INDI • Estándar ATS 2026
                  </p>
                </div>

                {/* Firma Digital Estampada */}
                {content.signatureUrl ? (
                  <div className="flex flex-col items-center min-w-[200px]">
                    <img
                      src={content.signatureUrl}
                      alt={`Firma de ${content.fullName}`}
                      className="max-h-16 max-w-[220px] object-contain mb-1"
                    />
                    <div className="w-full border-t border-zinc-800 pt-1.5 text-center">
                      <span className="text-[11px] font-bold text-zinc-950 block leading-tight">
                        {content.fullName}
                      </span>
                      {content.rut && (
                        <span className="text-[10px] font-mono text-zinc-700 block leading-tight font-medium">
                          RUT: {content.rut}
                        </span>
                      )}
                      <span className="text-[9px] text-zinc-400 tracking-wider uppercase font-mono block mt-0.5">
                        {content.signatureDate || 'Firma Profesional'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] font-mono text-zinc-400">
                      Documento de Identidad Profesional
                    </span>
                  </div>
                )}
              </div>

              {/* Pie de Página de Hoja 2 */}
              <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>INDI Smart CV • Estándar ATS Grado Empresarial</span>
                <span>Página 2 de 2</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
