'use client';

import React from 'react';
import { CVFormValues } from '@/entities/cv/schemas';
import { getCvDesignTemplate } from '@/entities/cv/templates';
import { Mail, Phone, MapPin, Globe, ShieldCheck, Link2 } from 'lucide-react';
import { sanitizeBulletText } from '@/features/ai-smart-cv/lib/pdf-engine';
import { calculateCvPageDistribution, cleanBulletText } from '@/features/ai-smart-cv/lib/cv-layout';

interface CvDocumentPreviewProps {
  cv: CVFormValues;
  pageFormat?: 'a4' | 'letter';
  scale?: number;
}

export function CvDocumentPreview({ cv, pageFormat = 'a4', scale = 1 }: CvDocumentPreviewProps) {
  const { content } = cv;
  const template = getCvDesignTemplate(cv.templateId);
  const { webTokens } = template;

  // Distribución geométrica elástica A4 (1, 2 o 3 hojas sin sobrecarga en Hoja 2)
  const distribution = calculateCvPageDistribution(cv);
  const {
    needsTwoPages,
    totalPages,
    page1Experiences,
    page2Experiences,
    page3Experiences = [],
    page1Education = !needsTwoPages ? content.education : [],
    page2Education = needsTwoPages ? content.education : [],
    page3Education = [],
    skillsPage = !needsTwoPages ? 1 : 2,
    referencesPage = !needsTwoPages ? 1 : 2,
    signaturePage = totalPages as 1 | 2 | 3,
  } = distribution;

  // Dimensiones canónicas de A4 Internacional con escala fluida para pantallas grandes
  const pageDimensions = 'min-h-[1123px] w-full max-w-[860px] lg:max-w-[920px] mx-auto';

  const renderSkillsBlock = () => {
    if (!content.skills || content.skills.length === 0) return null;
    return (
      <div className="mb-5">
        <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-2.5`}>
          Habilidades y Competencias
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {content.skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className={`px-2 py-0.5 rounded ${webTokens.tagBg} border ${webTokens.tagBorder} ${webTokens.tagText} text-[10.5px] font-medium leading-snug`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderEducationItem = (
    edu: NonNullable<CVFormValues['content']['education']>[number],
    eIdx: number,
    compact: boolean = false
  ) => {
    const cleanYear = edu.year && !/no\s+especificado|sin\s+fecha|pendiente|n\/a/i.test(edu.year) ? edu.year.trim() : '';
    return (
      <div
        key={eIdx}
        className={`${compact ? 'text-[11px] py-0.5' : 'text-xs'} flex items-baseline justify-between gap-2`}
      >
        <div className="flex-1 min-w-0 leading-snug">
          <span className="font-bold text-zinc-900">{sanitizeBulletText(edu.degree)}</span>
          {edu.institution && (
            <span className="text-zinc-600"> · {sanitizeBulletText(edu.institution)}</span>
          )}
          {edu.credentialType === 'DEGREE' && (
            <span className="ml-1.5 inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 align-middle">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
              Título Validado
            </span>
          )}
          {edu.credentialType === 'CERTIFICATION' && (
            <span className={`ml-1.5 inline-flex items-center gap-1 text-[9.5px] font-semibold ${webTokens.accentText} ${webTokens.accentBg} px-1.5 py-0.5 rounded-full border ${webTokens.accentBorder}/30 align-middle`}>
              <ShieldCheck className="w-2.5 h-2.5 text-indigo-600" />
              Certificado Oficial
            </span>
          )}
        </div>
        {cleanYear && (
          <span className="text-zinc-500 text-[10.5px] font-mono shrink-0 whitespace-nowrap">
            {cleanYear}
          </span>
        )}
      </div>
    );
  };

  const renderEducationBlock = (
    eduItems: NonNullable<CVFormValues['content']['education']>,
    isContinuation: boolean = false
  ) => {
    if (!eduItems || eduItems.length === 0) return null;
    const useCompactTwoColumnGrid = eduItems.length > 4 && !isContinuation;

    return (
      <div className="mb-5">
        <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-2.5`}>
          {isContinuation ? 'Educación & Formación (Continuación)' : 'Educación, Registros & Formación Continua'}
        </h2>
        {useCompactTwoColumnGrid ? (
          <div className="space-y-2">
            {/* Grado principal destacado a ancho completo */}
            <div>{renderEducationItem(eduItems[0], 0, false)}</div>
            {/* Registros y formación complementaria en grilla ejecutiva de 2 columnas para evitar saturación vertical */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pt-1.5 border-t border-zinc-100">
              {eduItems.slice(1).map((edu, idx) => renderEducationItem(edu, idx + 1, true))}
            </div>
          </div>
        ) : (
          <div className={eduItems.length > 4 ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5' : 'space-y-1.5'}>
            {eduItems.map((edu, eIdx) => renderEducationItem(edu, eIdx, eduItems.length > 4))}
          </div>
        )}
      </div>
    );
  };

  const renderReferencesBlock = () => {
    if (!content.references || content.references.length === 0) return null;
    const isThreeColumn = content.references.length >= 3;
    return (
      <div className="mb-5">
        <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-2.5`}>
          Referencias Laborales
        </h2>
        <div className={`grid grid-cols-1 ${isThreeColumn ? 'sm:grid-cols-3 gap-2.5' : 'sm:grid-cols-2 gap-3'}`}>
          {content.references.map((ref, rIdx) => (
            <div key={rIdx} className="text-xs p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="font-bold text-zinc-900 text-[11.5px] leading-snug">{ref.name}</div>
                <div className={`${webTokens.accentText} text-[10.5px] font-medium mt-0.5 leading-snug`}>
                  {ref.role} · {ref.company}
                </div>
              </div>
              {ref.contact ? (
                <div className="mt-1.5 pt-1 border-t border-zinc-200/60 flex items-center gap-1 text-zinc-600 text-[10px] font-mono">
                  <span className="font-semibold text-zinc-800">Tel:</span>
                  <span className="select-all truncate">{ref.contact}</span>
                </div>
              ) : (
                <div className="mt-1.5 pt-1 border-t border-zinc-200/60 text-amber-600 text-[10px] italic">
                  Contacto verificable
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSignatureArea = () => (
    <div className="flex items-end justify-between pb-3 mb-3 border-b border-zinc-100">
      <div className="text-[11px] text-zinc-500 space-y-0.5">
        <p className="font-semibold text-zinc-800">
          {content.fullName} • Perfil Profesional Verificado
        </p>
        <p className="text-[10px] text-zinc-400">
          Ecosistema de Identidad Profesional INDI • Estándar ATS 2026
        </p>
      </div>

      {content.signatureUrl ? (
        <div className="flex flex-col items-center min-w-[190px]">
          <img
            src={content.signatureUrl}
            alt={`Firma de ${content.fullName}`}
            className="max-h-14 max-w-[200px] object-contain mb-1"
          />
          <div className="w-full border-t border-zinc-800 pt-1 text-center">
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
          <span className="text-[10px] font-mono text-zinc-500">
            {content.fullName} {content.rut ? `· RUT ${content.rut}` : ''}
          </span>
        </div>
      )}
    </div>
  );

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
        {/* Badge indicador de hoja unificada con Pacing A4 en vivo */}
        <div className="page-badge mb-3 self-start flex flex-wrap items-center gap-2 bg-slate-900/90 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono px-3.5 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Hoja 1 de {totalPages} • A4 Internacional</span>
          <span className="text-zinc-500">•</span>
          <span className="text-emerald-300 font-semibold">{distribution.capacityUtilizationPct}% de capacidad ocupada</span>
          {distribution.capacityUtilizationPct >= 75 && distribution.capacityUtilizationPct <= 96 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-sans">
              (Equilibrio Óptimo)
            </span>
          )}
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
                            const cleaned = cleanBulletText(b);
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

            {/* Secciones asignadas a Hoja 1 (o todas cuando cabe en 1 página) */}
            {skillsPage === 1 && renderSkillsBlock()}
            {page1Education.length > 0 && renderEducationBlock(page1Education, false)}
            {referencesPage === 1 && renderReferencesBlock()}
          </div>

          {/* Pie de Página de Hoja 1 */}
          <div className="pt-4 border-t border-zinc-200 mt-6">
            {signaturePage === 1 && renderSignatureArea()}

            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span>INDI Smart CV • Estándar ATS Grado Empresarial</span>
              <span>Página 1 de {totalPages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* HOJA 2: EXPERIENCIAS RESTANTES, HABILIDADES, EDUCACIÓN Y FIRMA */}
      {/* ============================================================== */}
      {needsTwoPages && (
        <div className="w-full flex flex-col items-center">
          {/* Badge indicador de hoja 2 con Pacing A4 en vivo */}
          <div className="page-badge mb-3 self-start flex flex-wrap items-center gap-2 bg-slate-900/90 text-purple-300 border border-purple-500/30 text-[11px] font-mono px-3.5 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Hoja 2 de {totalPages} • A4 Internacional</span>
            {typeof distribution.page2UtilizationPct === 'number' && distribution.page2UtilizationPct > 0 && (
              <>
                <span className="text-zinc-500">•</span>
                <span className="text-emerald-300 font-semibold">{distribution.page2UtilizationPct}% de capacidad ocupada</span>
              </>
            )}
          </div>

          <div 
            className={`cv-page-sheet w-full bg-white text-zinc-900 rounded-2xl shadow-2xl p-8 sm:p-12 lg:p-14 border border-zinc-200 flex flex-col justify-between transition-all origin-top ${pageDimensions}`}
            style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}
          >
            <div>
              {/* Encabezado corporativo de continuación */}
              <div className={`border-b ${webTokens.sectionHeaderBorder} pb-3 mb-5 flex items-center justify-between text-xs text-zinc-500`}>
                <span className="font-bold text-zinc-900 uppercase tracking-wider">
                  {content.fullName}
                </span>
                <span className={`${webTokens.accentText} font-medium truncate max-w-[60%] text-right`}>
                  {cv.targetRole} (Continuación)
                </span>
              </div>

              {/* Experiencias de Continuación en Hoja 2 */}
              {page2Experiences.length > 0 && (
                <div className="mb-5">
                  <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-3`}>
                    Experiencia Laboral & Proyectos (Continuación)
                  </h2>
                  <div className="space-y-3.5">
                    {page2Experiences.map((exp, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex items-center justify-between font-bold text-zinc-900">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px]">{exp.role}</span>
                            {exp.isContinued && (
                              <span className="text-[10px] font-medium text-zinc-400 font-mono">(Continuación)</span>
                            )}
                          </div>
                          <span className="text-zinc-500 text-[11px] font-normal font-mono">{exp.period}</span>
                        </div>
                        <div className={`${webTokens.accentText} font-semibold mb-1.5 text-[11px]`}>
                          {exp.company}
                        </div>
                        {exp.bullets.length > 0 && (
                          <ul className="space-y-1 text-zinc-700">
                            {exp.bullets.map((b, bIdx) => {
                              const cleaned = cleanBulletText(b);
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

              {skillsPage === 2 && renderSkillsBlock()}
              {page2Education.length > 0 && renderEducationBlock(page2Education, false)}
              {referencesPage === 2 && renderReferencesBlock()}
            </div>

            {/* Pie de Página de Hoja 2 */}
            <div className="pt-4 mt-4 border-t border-zinc-200">
              {signaturePage === 2 && renderSignatureArea()}

              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>INDI Smart CV • Estándar ATS Grado Empresarial</span>
                <span>Página 2 de {totalPages}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* HOJA 3 (SI EXCEDE HOJA 2): SECCIONES COMPLEMENTARIAS Y CIERRE  */}
      {/* ============================================================== */}
      {totalPages >= 3 && (
        <div className="w-full flex flex-col items-center">
          <div className="page-badge mb-3 self-start flex flex-wrap items-center gap-2 bg-slate-900/90 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono px-3.5 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hoja 3 de {totalPages} • A4 Internacional</span>
            {typeof distribution.page3UtilizationPct === 'number' && distribution.page3UtilizationPct > 0 && (
              <>
                <span className="text-zinc-500">•</span>
                <span className="text-emerald-300 font-semibold">{distribution.page3UtilizationPct}% de capacidad ocupada</span>
              </>
            )}
          </div>

          <div
            className={`cv-page-sheet w-full bg-white text-zinc-900 rounded-2xl shadow-2xl p-8 sm:p-12 lg:p-14 border border-zinc-200 flex flex-col justify-between transition-all origin-top ${pageDimensions}`}
            style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}
          >
            <div>
              {/* Encabezado corporativo de continuación en Hoja 3 */}
              <div className={`border-b ${webTokens.sectionHeaderBorder} pb-3 mb-5 flex items-center justify-between text-xs text-zinc-500`}>
                <span className="font-bold text-zinc-900 uppercase tracking-wider">
                  {content.fullName}
                </span>
                <span className={`${webTokens.accentText} font-medium truncate max-w-[60%] text-right`}>
                  {cv.targetRole} (Continuación)
                </span>
              </div>

              {page3Experiences.length > 0 && (
                <div className="mb-5">
                  <h2 className={`text-xs font-bold uppercase tracking-wider text-zinc-900 border-b ${webTokens.sectionHeaderBorder} pb-1.5 mb-3`}>
                    Experiencia Laboral & Proyectos (Continuación)
                  </h2>
                  <div className="space-y-3.5">
                    {page3Experiences.map((exp, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex items-center justify-between font-bold text-zinc-900">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px]">{exp.role}</span>
                            {exp.isContinued && (
                              <span className="text-[10px] font-medium text-zinc-400 font-mono">(Continuación)</span>
                            )}
                          </div>
                          <span className="text-zinc-500 text-[11px] font-normal font-mono">{exp.period}</span>
                        </div>
                        <div className={`${webTokens.accentText} font-semibold mb-1.5 text-[11px]`}>
                          {exp.company}
                        </div>
                        {exp.bullets.length > 0 && (
                          <ul className="space-y-1 text-zinc-700">
                            {exp.bullets.map((b, bIdx) => {
                              const cleaned = cleanBulletText(b);
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

              {skillsPage === 3 && renderSkillsBlock()}
              {page3Education.length > 0 && renderEducationBlock(page3Education, page2Education.length > 0)}
              {referencesPage === 3 && renderReferencesBlock()}
            </div>

            {/* Pie de Página de Hoja 3 */}
            <div className="pt-4 mt-4 border-t border-zinc-200">
              {signaturePage === 3 && renderSignatureArea()}

              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>INDI Smart CV • Estándar ATS Grado Empresarial</span>
                <span>Página 3 de {totalPages}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
