'use client';

import React from 'react';
import { ALL_CV_DESIGN_TEMPLATES, CvDesignTemplate } from '@/entities/cv/templates';
import { Palette, Check } from 'lucide-react';

interface CvTemplateSelectorProps {
  currentTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  className?: string;
}

export function CvTemplateSelector({
  currentTemplateId,
  onSelectTemplate,
  className = '',
}: CvTemplateSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const activeTemplate =
    ALL_CV_DESIGN_TEMPLATES.find((t) => t.id === currentTemplateId) ||
    ALL_CV_DESIGN_TEMPLATES[0];

  // Cerrar al hacer clic fuera del dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Botón Trigger Ergonómico (Touch Target >= 44px) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-xs font-medium text-slate-200 transition-all active:scale-95 shadow-sm"
        title="Cambiar arquetipo de diseño y paleta cromática del CV"
        aria-expanded={isOpen}
      >
        <Palette className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden sm:inline text-zinc-400 font-mono">Diseño:</span>
        <span className="font-semibold text-white">{activeTemplate.name}</span>
      </button>

      {/* Modal / Menú Desplegable con Glassmorphism */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950/95 border border-white/15 shadow-2xl backdrop-blur-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 px-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Arquetipos de Diseño A4 (ATS)
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">100% Compatible</span>
          </div>

          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-0.5">
            {ALL_CV_DESIGN_TEMPLATES.map((tpl) => {
              const isSelected = tpl.id === currentTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    onSelectTemplate(tpl.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-start gap-3 min-h-[44px] ${
                    isSelected
                      ? `bg-white/10 ${tpl.previewRing} border-opacity-80 shadow-md`
                      : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {/* Indicador de Color y Gradiente */}
                  <div
                    className={`w-6 h-6 rounded-lg bg-gradient-to-br ${tpl.previewGlow} border ${tpl.previewRing} flex-shrink-0 mt-0.5 flex items-center justify-center`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>

                  {/* Metadatos de la Plantilla */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">{tpl.name}</span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {tpl.badgeText}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">{tpl.archetype}</p>
                    <p className="text-[10px] text-slate-400 leading-snug mt-1 line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
