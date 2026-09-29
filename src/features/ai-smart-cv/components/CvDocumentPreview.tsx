'use client';

import React from 'react';
import { CVFormValues } from '@/entities/cv/schemas';
import { Mail, Phone, MapPin, Globe, ShieldCheck, Link2 } from 'lucide-react';

interface CvDocumentPreviewProps {
  cv: CVFormValues;
  pageFormat?: 'letter' | 'a4';
}

export function CvDocumentPreview({ cv, pageFormat = 'letter' }: CvDocumentPreviewProps) {
  const { content } = cv;

  return (
    <div className={`w-full bg-white text-zinc-900 rounded-2xl shadow-2xl p-8 sm:p-12 font-sans border border-zinc-200 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900 transition-all ${
      pageFormat === 'a4' ? 'min-h-[920px] max-w-[800px] mx-auto' : 'min-h-[850px] max-w-[820px] mx-auto'
    }`}>
      {/* Estilos de impresión dinámicos según formato seleccionado */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${pageFormat === 'a4' ? 'A4' : 'letter'};
            margin: 12mm 15mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          header, nav, button, .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div>
        {/* Cabecera del CV */}
        <div className="border-b-2 border-zinc-900 pb-5 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 uppercase">
            {content.fullName || 'Tu Nombre Completo'}
          </h1>
          <p className="text-sm font-bold text-indigo-700 uppercase tracking-widest mt-1">
            {cv.targetRole || 'Rol Profesional Objetivo'}
          </p>

          {/* Enlaces de Contacto y Perfiles Profesionales */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-600 mt-4 font-medium">
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
              <span className="flex items-center gap-1.5 font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                RUT: {content.rut}
              </span>
            )}
            {content.linkedinUrl && (
              <a
                href={content.linkedinUrl.startsWith('http') ? content.linkedinUrl : `https://${content.linkedinUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
              >
                <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                LinkedIn
              </a>
            )}
            {content.websiteUrl && (
              <a
                href={content.websiteUrl.startsWith('http') ? content.websiteUrl : `https://${content.websiteUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                Portafolio / Web
              </a>
            )}
          </div>
        </div>

        {/* Resumen Profesional */}
        {content.summary && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5 mb-2.5">
              Perfil Profesional
            </h2>
            <p className="text-xs text-zinc-700 leading-relaxed font-normal">
              {content.summary}
            </p>
          </div>
        )}

        {/* Experiencia Laboral */}
        {content.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5 mb-3.5">
              Experiencia Laboral
            </h2>
            <div className="space-y-4">
              {content.experience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-zinc-900">
                    <span className="text-[13px]">{exp.role}</span>
                    <span className="text-zinc-500 text-[11px] font-normal">{exp.period}</span>
                  </div>
                  <div className="text-indigo-700 font-semibold mb-1 text-[11px]">
                    {exp.company}
                  </div>
                  {exp.bullets.length > 0 && (
                    <ul className="list-disc list-inside space-y-1.5 text-zinc-600 pl-0.5">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-snug">
                          {b}
                        </li>
                      ))}
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5 mb-2.5">
              Habilidades y Tecnologías
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

        {/* Educación y Títulos */}
        {content.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5 mb-2.5">
              Educación
            </h2>
            <div className="space-y-2">
              {content.education.map((edu, eIdx) => (
                <div key={eIdx} className="text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">{edu.degree}</span>
                    <span className="text-zinc-600">• {edu.institution}</span>
                    {edu.credentialType === 'DEGREE' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Validado Documentalmente
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-500 text-[11px]">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bloque de Cierre: Firma Digital Ejecutiva & Pie Editorial */}
      <div className="pt-6 mt-6 border-t border-zinc-200">
        <div className="flex items-end justify-between">
          {/* Identificador de Perfil Editorial */}
          <div className="text-[11px] text-zinc-500 space-y-0.5">
            <p className="font-semibold text-zinc-800">
              {content.fullName} • Perfil Profesional
            </p>
            <p className="text-[10px] text-zinc-400">
              Validado en plataforma INDI • Actualizado 2026
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
      </div>
    </div>
  );
}
