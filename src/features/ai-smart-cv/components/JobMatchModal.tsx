'use client';

import React, { useState, useTransition } from 'react';
import { CVContent, JobMatchAnalysisResult } from '@/entities/cv/schemas';
import { analyzeJobMatchAction } from '@/features/ai-smart-cv/actions';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface JobMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvContent: CVContent;
  targetRole?: string;
  onApplyKeywordToSkills?: (keyword: string) => void;
}

export function JobMatchModal({
  isOpen,
  onClose,
  cvContent,
  targetRole,
  onApplyKeywordToSkills,
}: JobMatchModalProps) {
  const [jobText, setJobText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<JobMatchAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!jobText.trim() || jobText.trim().length < 15) {
      setErrorMsg('Pega el texto completo de la oferta laboral (mínimo 15 caracteres).');
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await analyzeJobMatchAction({
        jobDescriptionText: jobText,
        targetRole,
        cvContent,
      });

      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setErrorMsg(res.error || 'No se pudo completar el análisis de la vacante.');
      }
    });
  };

  const handleAddKeyword = (kw: string) => {
    if (onApplyKeywordToSkills) {
      onApplyKeywordToSkills(kw);
      setAddedKeywords((prev) => new Set(prev).add(kw));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 to-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Job Match AI & Gap Analysis</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  ATS 2026
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Compara tu CV contra la oferta laboral real y descubre qué palabras clave te faltan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Zona de Pegar Vacante */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-zinc-300 mb-2">
              Pega aquí la descripción o requisitos del empleo:
            </label>
            <textarea
              rows={4}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Ej. Buscamos Ingeniero de Software Senior con 3+ años en TypeScript, Next.js, Microservicios y AWS. Se requiere inglés intermedio..."
              className="w-full rounded-2xl bg-black/60 border border-white/10 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none font-mono"
            />
            {errorMsg && (
              <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isPending || !jobText.trim()}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analizando Match Semántico...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Comparar contra mi CV</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultados del Matching */}
          {result && (
            <div className="space-y-5 pt-4 border-t border-white/10 animate-fade-in">
              {/* Score Circular / Barra de Match */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5">
                    Afinidad con la Vacante (ATS Match Score)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-extrabold ${
                      result.matchScore >= 80 ? 'text-emerald-400' : result.matchScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {result.matchScore}%
                    </span>
                    <span className="text-xs text-zinc-300">
                      {result.matchScore >= 80 ? 'Alta probabilidad de avanzar a entrevista' : result.matchScore >= 60 ? 'Match intermedio: requiere ajustes en keywords' : 'Match bajo: faltan requisitos clave'}
                    </span>
                  </div>
                </div>

                <div className="w-full sm:w-48 bg-black/50 h-3 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full transition-all duration-700 ${
                      result.matchScore >= 80 ? 'bg-emerald-500' : result.matchScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${result.matchScore}%` }}
                  />
                </div>
              </div>

              {/* Palabras Clave Faltantes (Missing Keywords) */}
              {result.missingKeywords.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Palabras Clave Críticas que la oferta exige y tu CV no incluye:</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Toca cualquier palabra para inyectarla directamente a tus Habilidades:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.missingKeywords.map((kw) => {
                      const isAdded = addedKeywords.has(kw);
                      return (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleAddKeyword(kw)}
                          disabled={isAdded}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-black/40 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 hover:border-amber-400'
                          }`}
                        >
                          <span>{kw}</span>
                          <span className="text-[10px] opacity-75">{isAdded ? '✓ Agregada' : '+ Agregar'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Requisitos Críticos Detectados */}
              {result.criticalRequirements.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold uppercase text-zinc-300">
                    Auditoría de Requisitos Indispensables:
                  </label>
                  <div className="space-y-2">
                    {result.criticalRequirements.map((req, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          req.status === 'FULFILLED'
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-200'
                            : req.status === 'PARTIAL'
                            ? 'bg-amber-500/5 border-amber-500/20 text-zinc-200'
                            : 'bg-rose-500/5 border-rose-500/20 text-zinc-200'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {req.status === 'FULFILLED' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : req.status === 'PARTIAL' ? (
                            <Clock className="w-4 h-4 text-amber-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                          )}
                        </span>
                        <div>
                          <span className="font-bold block text-white">{req.requirement}</span>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{req.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendación de Resumen */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Estrategia para tu Resumen Profesional:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {result.tailoredSummaryAdvice}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Listo / Continuar Editando
          </button>
        </div>
      </div>
    </div>
  );
}
