'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { Sparkles, Check, X, Loader2, Wand2, Copy, RefreshCw, CheckCircle2 } from 'lucide-react';
import { rewriteCvSectionAction } from '@/features/ai-smart-cv/actions';

interface InlineAiWriterProps {
  currentText: string;
  type: 'SUMMARY' | 'BULLET';
  targetRole?: string;
  company?: string;
  role?: string;
  skills?: string[];
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  onApply: (newText: string) => void;
}

export function InlineAiWriter({
  currentText,
  type,
  targetRole,
  company,
  role,
  skills,
  label = 'Mejorar con IA',
  size = 'sm',
  onApply,
}: InlineAiWriterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<'XYZ_IMPACT' | 'EXECUTIVE' | 'ATS_KEYWORDS'>(
    type === 'BULLET' ? 'XYZ_IMPACT' : 'EXECUTIVE'
  );
  const [impactInput, setImpactInput] = useState('');
  const [showImpactPrompt, setShowImpactPrompt] = useState(false);

  const bulletLines = currentText
    ? currentText
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean)
    : [];
  const isMultiBullet = type === 'BULLET' && bulletLines.length > 1;

  // Resetear sugerencias si el texto o contexto del elemento cambia
  useEffect(() => {
    setSuggestions([]);
    setErrorMessage(null);
  }, [currentText, role, company, targetRole]);

  // Manejar tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleGenerate = (
    mode: 'XYZ_IMPACT' | 'EXECUTIVE' | 'ATS_KEYWORDS',
    customImpact?: string,
    bypassCache?: boolean
  ) => {
    setActiveMode(mode);
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await rewriteCvSectionAction({
          text: currentText,
          type,
          mode,
          targetRole,
          company,
          role,
          skills,
          impactAnswer: customImpact !== undefined ? customImpact : impactInput,
          bypassCache: Boolean(bypassCache),
        });

        if (res.success && res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
          setErrorMessage(null);
        } else {
          setErrorMessage(res.error || 'No se pudieron generar sugerencias.');
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error de conexión con el servicio de IA.');
      }
    });
  };

  const handleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && suggestions.length === 0) {
      handleGenerate(type === 'BULLET' ? 'XYZ_IMPACT' : 'EXECUTIVE');
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Botón disparador según tamaño
  const buttonClasses =
    size === 'xs'
      ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium transition-all group'
      : size === 'md'
      ? 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/30 text-xs font-medium transition-all shadow-sm group min-h-[44px]'
      : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium transition-all shadow-sm group';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={handleOpen}
        aria-expanded={isOpen}
        className={buttonClasses}
      >
        <Wand2 className="w-3 h-3 text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span>{label}</span>
        {isMultiBullet && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-mono">
            {bulletLines.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop móvil para evitar desbordes y garantizar ergonomía táctil */}
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm sm:hidden animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel Flotante Responsivo: Bottom-sheet en móvil / Popover alineado en desktop */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Asistente Editorial IA para Smart CV"
            className="fixed inset-x-3 bottom-4 z-50 sm:static sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:inset-x-auto sm:bottom-auto w-auto sm:w-[420px] max-h-[85vh] p-4 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-cyan-500/30 sm:border-white/10 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                    Asistente Editorial IA
                    {isMultiBullet && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Bloque de {bulletLines.length} logros
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-zinc-400 truncate max-w-[200px] sm:max-w-xs" title={role && company ? `${role} en ${company}` : role || targetRole || ''}>
                    {role && company ? (
                      <>
                        <span className="text-cyan-300 font-medium">{role}</span>{' '}
                        <span className="text-zinc-500 font-normal">en</span>{' '}
                        <span className="text-zinc-300 font-medium">{company}</span>
                      </>
                    ) : role || targetRole ? (
                      `Adaptado a ${role || targetRole}`
                    ) : (
                      'Optimización ejecutiva para ATS 2026'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {suggestions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleGenerate(activeMode, undefined, true)}
                    disabled={isPending}
                    className="text-zinc-400 hover:text-cyan-300 p-1 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40"
                    title="Regenerar nuevas opciones con IA (sin caché)"
                    aria-label="Regenerar opciones con IA"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Cerrar asistente"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Selector de Modo / Enfoque Estratégico */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
              {type === 'BULLET' && (
                <button
                  type="button"
                  onClick={() => handleGenerate('XYZ_IMPACT')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all text-center ${
                    activeMode === 'XYZ_IMPACT'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Fórmula Google XYZ: Logré [X], medido por [Y], mediante [Z]"
                >
                  🎯 Google XYZ
                </button>
              )}
              <button
                type="button"
                onClick={() => handleGenerate('EXECUTIVE')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all text-center ${
                  activeMode === 'EXECUTIVE'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Liderazgo, gobierno corporativo e impacto directivo"
              >
                👔 Ejecutivo
              </button>
              <button
                type="button"
                onClick={() => handleGenerate('ATS_KEYWORDS')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all text-center ${
                  activeMode === 'ATS_KEYWORDS'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Inyección densa de palabras clave de la disciplina"
              >
                ⚡ Keywords ATS
              </button>
            </div>

            {/* Módulo Entrevista de Impacto en 1 Clic (Para logros que carecen de métricas) */}
            {type === 'BULLET' && (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Entrevista de Impacto Cuantitativo
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowImpactPrompt((prev) => !prev)}
                    className="text-[9.5px] font-mono text-cyan-400 hover:text-cyan-200 transition-colors"
                  >
                    {showImpactPrompt ? 'Ocultar' : '¿Tienes cifras reales?'}
                  </button>
                </div>
                {showImpactPrompt && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] text-zinc-300 leading-tight">
                      Ingresa el volumen, porcentaje o resultado (ej: <em>&quot;45 pacientes mensuales&quot;</em>, <em>&quot;reduje en 20% el tiempo de espera&quot;</em>):
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={impactInput}
                        onChange={(e) => setImpactInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleGenerate(activeMode, impactInput);
                          }
                        }}
                        placeholder="Ej: 30 casos al mes, $5M ahorrados, 99% uptime..."
                        className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleGenerate(activeMode, impactInput)}
                        disabled={isPending || !impactInput.trim()}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-200 text-[10px] font-semibold transition-all disabled:opacity-40 cursor-pointer"
                      >
                        Aplicar dato
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mensaje de Error con Botón de Reintento */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] leading-tight flex items-start gap-2.5 animate-fade-in">
                <span className="shrink-0 text-rose-400 text-sm">⚠️</span>
                <div className="flex-1">
                  <span className="font-semibold block">{errorMessage}</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    Puedes conservar tu texto original o reintentar ahora.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerate(activeMode)}
                  className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[10px] font-medium transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reintentar
                </button>
              </div>
            )}

            {/* Contenido / Sugerencias */}
            {isPending ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-zinc-400">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="text-xs font-medium text-zinc-300">
                  {isMultiBullet ? 'Elevando bloque de logros con IA...' : 'Redactando propuesta de alto impacto...'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Groq LPU / NVIDIA NIM Llama 3.3
                </span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
                {suggestions.map((sug, idx) => {
                  const lines = sug.split('\n').filter(Boolean);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-cyan-500/30 transition-all text-xs text-zinc-300 flex flex-col gap-2.5 group/item"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b border-white/5 pb-1">
                        <span>Variante #{idx + 1}</span>
                        <span className="text-cyan-400 font-medium">
                          {activeMode === 'XYZ_IMPACT'
                            ? 'Fórmula XYZ'
                            : activeMode === 'EXECUTIVE'
                            ? 'Enfoque Ejecutivo'
                            : 'ATS Optimizado'}
                        </span>
                      </div>

                      {/* Render de líneas o viñetas */}
                      {lines.length > 1 ? (
                        <ul className="space-y-1.5 pl-1">
                          {lines.map((l, lIdx) => (
                            <li key={lIdx} className="leading-relaxed text-[11px] text-zinc-200 flex items-start gap-1.5">
                              <span className="text-cyan-400 shrink-0 font-bold">•</span>
                              <span>{l}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="leading-relaxed text-[11px] text-zinc-200">{sug}</p>
                      )}

                      {/* Botones de Acción */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => handleCopy(sug, idx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 text-[10px] font-medium transition-all"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onApply(sug);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold transition-all shadow-sm active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aplicar esta versión</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
