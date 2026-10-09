'use client';

import React, { useState, useTransition } from 'react';
import { Sparkles, ArrowRight, Check, X, Loader2, Wand2 } from 'lucide-react';
import { rewriteCvSectionAction } from '@/features/ai-smart-cv/actions';

interface InlineAiWriterProps {
  currentText: string;
  type: 'SUMMARY' | 'BULLET';
  targetRole?: string;
  onApply: (newText: string) => void;
}

export function InlineAiWriter({
  currentText,
  type,
  targetRole,
  onApply,
}: InlineAiWriterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeMode, setActiveMode] = useState<'XYZ_IMPACT' | 'EXECUTIVE' | 'ATS_KEYWORDS'>('XYZ_IMPACT');

  const handleGenerate = (mode: 'XYZ_IMPACT' | 'EXECUTIVE' | 'ATS_KEYWORDS') => {
    setActiveMode(mode);
    startTransition(async () => {
      const res = await rewriteCvSectionAction({
        text: currentText,
        type,
        mode,
        targetRole,
      });

      if (res.success && res.suggestions.length > 0) {
        setSuggestions(res.suggestions);
      }
    });
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && suggestions.length === 0) {
      handleGenerate(type === 'BULLET' ? 'XYZ_IMPACT' : 'EXECUTIVE');
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium transition-all shadow-sm group"
      >
        <Wand2 className="w-3 h-3 text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span>Mejorar con IA</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
            <span className="text-[11px] font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Asistente Editorial IA
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pastillas de Estilo / Objetivo */}
          <div className="flex gap-1 mb-3">
            {type === 'BULLET' && (
              <button
                type="button"
                onClick={() => handleGenerate('XYZ_IMPACT')}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                  activeMode === 'XYZ_IMPACT'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Fórmula: Logré [X], medido por [Y], haciendo [Z]"
              >
                Logro con Impacto
              </button>
            )}
            <button
              type="button"
              onClick={() => handleGenerate('EXECUTIVE')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                activeMode === 'EXECUTIVE'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ejecutivo
            </button>
            <button
              type="button"
              onClick={() => handleGenerate('ATS_KEYWORDS')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                activeMode === 'ATS_KEYWORDS'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Palabras Clave ATS
            </button>
          </div>

          {/* Contenido / Sugerencias */}
          {isPending ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              <span className="text-[11px]">Redactando propuesta de alto impacto...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-cyan-500/30 transition-all text-xs text-zinc-300 flex flex-col gap-2 group/item"
                >
                  <p className="leading-relaxed text-[11px] text-zinc-200">{sug}</p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onApply(sug);
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-medium transition-all"
                    >
                      <Check className="w-3 h-3" />
                      Aplicar esta versión
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
