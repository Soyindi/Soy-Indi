'use client';

import React from 'react';
import { CVFormValues } from '@/entities/cv/schemas';
import { Mail, Phone, MapPin, Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';

interface CvDocumentPreviewProps {
  cv: CVFormValues;
}

export function CvDocumentPreview({ cv }: CvDocumentPreviewProps) {
  const { content } = cv;

  return (
    <div className="w-full bg-white text-zinc-900 rounded-2xl shadow-2xl p-8 sm:p-10 font-sans border border-zinc-200 min-h-[750px] flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      <div>
        {/* Cabecera del CV */}
        <div className="border-b-2 border-zinc-900 pb-5 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 uppercase">
            {content.fullName || 'Tu Nombre Completo'}
          </h1>
          <p className="text-sm font-bold text-indigo-700 uppercase tracking-widest mt-1">
            {cv.targetRole || 'Rol Profesional Objetivo'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 mt-3 font-medium">
            {content.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                {content.email}
              </span>
            )}
            {content.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                {content.phone}
              </span>
            )}
            {content.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {content.location}
              </span>
            )}
          </div>
        </div>

        {/* Resumen Profesional */}
        {content.summary && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1 mb-2">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-zinc-700" />
              Experiencia Laboral
            </h2>
            <div className="space-y-4">
              {content.experience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-zinc-900">
                    <span>{exp.role}</span>
                    <span className="text-zinc-500 text-[11px] font-normal">{exp.period}</span>
                  </div>
                  <div className="text-indigo-800 font-semibold mb-1 text-[11px]">
                    {exp.company}
                  </div>
                  {exp.bullets.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-zinc-600 pl-1">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1 mb-2.5">
              Habilidades y Tecnologías
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {content.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="px-2.5 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-800 text-[11px] font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Educación */}
        {content.education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1 mb-2.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-700" />
              Educación
            </h2>
            <div className="space-y-2">
              {content.education.map((edu, eIdx) => (
                <div key={eIdx} className="text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-900">{edu.degree}</span>
                    <span className="text-zinc-600 ml-1.5">• {edu.institution}</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pie de página formato ATS */}
      <div className="pt-6 mt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
        <span>ESTRUCTURA CERTIFICADA PARA MOTORES ATS</span>
        <span>GENERADO EN INDI.BIO</span>
      </div>
    </div>
  );
}
