'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PresentationSlide, PresentationTheme } from '@/entities/presentation/schemas';
import {
  Sparkles,
  BarChart3,
  Code2,
  Quote,
  Layers,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Clock,
  XCircle,
  Cpu,
  Zap,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SlideViewerProps {
  slide: PresentationSlide;
  theme: PresentationTheme;
  slideNumber: number;
  totalSlides: number;
  showNotes?: boolean;
  allowSlideFullscreen?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

export function SlideViewer({
  slide,
  theme,
  slideNumber,
  totalSlides,
  showNotes = false,
  allowSlideFullscreen = true,
  onNext,
  onPrev,
}: SlideViewerProps) {
  const slideRef = React.useRef<HTMLDivElement>(null);
  const [isSlideFullscreen, setIsSlideFullscreen] = React.useState(false);

  // Escuchar cambios de pantalla completa del navegador para sincronizar el estado
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const activeElement = document.fullscreenElement;
      setIsSlideFullscreen(activeElement === slideRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Navegación con teclado en modo pantalla completa
  React.useEffect(() => {
    if (!isSlideFullscreen) return;

    const handleFullscreenKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        onNext?.();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev?.();
      }
    };

    window.addEventListener('keydown', handleFullscreenKeyDown);
    return () => window.removeEventListener('keydown', handleFullscreenKeyDown);
  }, [isSlideFullscreen, onNext, onPrev]);

  const toggleSlideFullscreen = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      if (!document.fullscreenElement) {
        if (slideRef.current?.requestFullscreen) {
          await slideRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Ignorar restricciones o cancelaciones de permisos del navegador
    }
  };
  // Ícono de cabecera contextual según tipo de diapositiva
  const renderVisualIcon = () => {
    switch (slide.visualType) {
      case 'metrics':
        return <BarChart3 className="w-5 h-5 text-cyan-400" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'quote':
        return <Quote className="w-5 h-5 text-amber-400" />;
      case 'architecture':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'comparison':
        return <Zap className="w-5 h-5 text-rose-400" />;
      case 'timeline':
        return <Clock className="w-5 h-5 text-cyan-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-300" />;
    }
  };

  return (
    <div
      ref={slideRef}
      className={`relative w-full aspect-[16/9] min-h-[440px] sm:min-h-[500px] rounded-3xl shadow-2xl flex flex-col justify-between p-6 sm:p-10 border border-white/10 select-none transition-all duration-500 overflow-y-auto sm:overflow-hidden ${
        isSlideFullscreen ? '!rounded-none !min-h-screen !aspect-auto !p-8 sm:!p-14 !overflow-y-auto' : ''
      }`}
      style={{
        background: theme.backgroundGradient,
      }}
    >
      {/* Luz volumétrica perimetral reactiva con aceleración por GPU */}
      {theme.ambientAuraIntensity !== 'off' && (
        <>
          <div
            className={`absolute top-0 right-0 rounded-full pointer-events-none will-change-transform transition-all duration-700 ${
              theme.ambientAuraIntensity === 'subtle'
                ? 'w-72 h-72 blur-[90px] opacity-15'
                : 'w-96 h-96 blur-[130px] opacity-30'
            }`}
            style={{
              backgroundColor:
                slide.visualType === 'comparison'
                  ? '#f43f5e'
                  : slide.visualType === 'quote'
                  ? '#f59e0b'
                  : slide.visualType === 'code'
                  ? '#10b981'
                  : theme.accentColor,
            }}
          />
          <div
            className={`absolute bottom-0 left-0 rounded-full pointer-events-none will-change-transform transition-all duration-700 ${
              theme.ambientAuraIntensity === 'subtle'
                ? 'w-72 h-72 blur-[90px] opacity-15'
                : 'w-96 h-96 blur-[130px] opacity-25'
            }`}
            style={{ backgroundColor: theme.primaryColor }}
          />
        </>
      )}

      {/* 1. Cabecera de la diapositiva */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            {renderVisualIcon()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
              INDI ORBITAL
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[11px] font-mono text-cyan-300 font-bold">
              {slide.badgeText || `SLIDE ${slideNumber} / ${totalSlides}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 hidden sm:inline-block">
            {theme.name}
          </span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            16:9 HD
          </span>

          {allowSlideFullscreen && (
            <button
              onClick={toggleSlideFullscreen}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 active:scale-95 text-zinc-300 hover:text-white border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer shadow-sm group"
              title={isSlideFullscreen ? 'Salir de pantalla completa de la diapositiva (Esc)' : 'Ampliar solo esta diapositiva a pantalla completa'}
              aria-label={isSlideFullscreen ? 'Salir de pantalla completa de la diapositiva' : 'Ampliar solo esta diapositiva a pantalla completa'}
            >
              {isSlideFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-mono font-semibold text-cyan-300 hidden md:inline">Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-mono font-semibold text-zinc-300 group-hover:text-cyan-300 hidden md:inline">Ampliar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Área Central con Renderizado Específico por Tipología & Transiciones Cinemáticas */}
      <div className="relative z-10 my-auto py-4 max-w-5xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={
              theme.transitionEffect === 'slide'
                ? { opacity: 0, x: 30 }
                : theme.transitionEffect === 'scale'
                ? { opacity: 0, scale: 0.96 }
                : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={
              theme.transitionEffect === 'slide'
                ? { opacity: 0, x: -30 }
                : theme.transitionEffect === 'scale'
                ? { opacity: 0, scale: 1.02 }
                : { opacity: 0, y: -12 }
            }
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full ${
              theme.fontPairing === 'serif'
                ? 'font-serif'
                : theme.fontPairing === 'mono'
                ? 'font-mono'
                : 'font-sans'
            }`}
          >
            {/* Título, Action Title (McKinsey Pyramid Principle) y Subtítulo */}
            <div className="mb-4 sm:mb-6">
              {slide.actionTitle ? (
                <div>
                  <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-300 font-semibold tracking-wider uppercase">
                    <span>Action Title • Principio de Pirámide</span>
                  </div>
                  <h2 className={`font-extrabold tracking-tight text-white mb-2 leading-snug break-words ${
                    (slide.actionTitle?.length || 0) > 90
                      ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
                      : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                  }`}>
                    {slide.actionTitle}
                  </h2>
                  {slide.title &&
                   slide.title.toLowerCase().trim() !== slide.actionTitle.toLowerCase().trim() &&
                   !slide.actionTitle.toLowerCase().trim().startsWith(slide.title.toLowerCase().trim()) &&
                   !/^diapositiva\s*\d+$/i.test(slide.title.trim()) && (
                    <p className="text-xs sm:text-sm text-zinc-400 font-mono mb-2 break-words">
                      {slide.title}
                    </p>
                  )}
                </div>
              ) : (
                <h2 className={`font-extrabold tracking-tight text-white mb-2 leading-tight break-words ${
                  (slide.title?.length || 0) > 60
                    ? 'text-xl sm:text-2xl md:text-3xl'
                    : 'text-2xl sm:text-4xl lg:text-5xl'
                }`}>
                  {slide.title}
                </h2>
              )}
              {slide.subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-cyan-200/90 font-medium break-words">
                  {slide.subtitle}
                </p>
              )}
            </div>

            {/* A. LAYOUT: METRICS / KPI CARDS */}
            {slide.visualType === 'metrics' && slide.metricsData && slide.metricsData.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {slide.metricsData.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex flex-col justify-between"
                    >
                      <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        {m.label}
                      </span>
                      <div className="flex items-baseline gap-2 my-2">
                        <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                          {m.value}
                        </span>
                      </div>
                      {m.change && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{m.change}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {slide.keyPoints.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slide.keyPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* B. LAYOUT: COMPARISON / BEFORE & AFTER */}
            {slide.visualType === 'comparison' && slide.comparisonData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Columna Tradicional / Antes */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20 backdrop-blur-md flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-rose-500/20">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                      {slide.comparisonData.beforeTitle}
                    </span>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {slide.comparisonData.beforeItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-400">
                        <span className="text-rose-400/80 font-mono mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Columna Nuevo / INDI 2026 */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur-md flex flex-col shadow-lg shadow-emerald-950/30">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                      {slide.comparisonData.afterTitle}
                    </span>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {slide.comparisonData.afterItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* C. LAYOUT: TIMELINE / ROADMAP STEPS */}
            {slide.visualType === 'timeline' && slide.timelineData && slide.timelineData.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {slide.timelineData.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md relative flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs">
                        {step.step}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">HITOS 0{idx + 1}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5">{step.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* D. LAYOUT: QUOTE / TESTIMONIAL FOCUS */}
            {slide.visualType === 'quote' && slide.quoteData && (
              <div className="p-8 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-md relative max-w-4xl mx-auto text-center">
                <Quote className="w-10 h-10 text-amber-400/30 mx-auto mb-4" />
                <p className="text-lg sm:text-2xl font-medium text-white italic leading-relaxed mb-6">
                  &ldquo;{slide.quoteData.quote}&rdquo;
                </p>
                <div className="inline-flex flex-col items-center">
                  <span className="text-sm font-bold text-white">{slide.quoteData.author}</span>
                  {slide.quoteData.role && (
                    <span className="text-xs font-mono text-cyan-300 mt-0.5">{slide.quoteData.role}</span>
                  )}
                </div>
              </div>
            )}

            {/* E. LAYOUT: ARCHITECTURE / BENTO GRID OR DEFAULT CONCEPT */}
            {(slide.visualType === 'concept' ||
              slide.visualType === 'architecture' ||
              slide.visualType === 'code' ||
              (!slide.metricsData && !slide.comparisonData && !slide.timelineData && !slide.quoteData)) && (
              <div className={`grid gap-3 sm:gap-4 ${
                slide.keyPoints.length <= 2
                  ? 'grid-cols-1'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {slide.keyPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 sm:p-4.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <span className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal break-words">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Pie de Diapositiva & Notas del Orador */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          {showNotes && slide.speakerNotes ? (
            <span className="text-amber-300 font-sans italic truncate max-w-lg">
              Notas: {slide.speakerNotes}
            </span>
          ) : (
            <span className="text-zinc-500 font-sans text-[10px]">
              Modo Edición • Diapositiva {slideNumber} de {totalSlides}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold tracking-wider">EN VIVO</span>
        </div>
      </div>

      {/* 4. Barra OSD Flotante Ergonómica en Pantalla Completa */}
      {isSlideFullscreen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev?.();
            }}
            disabled={slideNumber <= 1}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer border border-white/10"
            title="Diapositiva anterior (Flecha Izquierda)"
            aria-label="Diapositiva anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="px-3 py-1 flex flex-col items-center select-none font-mono">
            <span className="text-xs font-bold text-cyan-300">
              {slideNumber} / {totalSlides}
            </span>
            <span className="text-[9px] text-zinc-400">Teclado ◄ ►</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            disabled={slideNumber >= totalSlides}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer border border-white/10"
            title="Diapositiva siguiente (Flecha Derecha / Espacio)"
            aria-label="Diapositiva siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-white/20 mx-1" />

          <button
            onClick={(e) => toggleSlideFullscreen(e)}
            className="min-h-[44px] px-3 flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/10"
            title="Restaurar pantalla (Esc)"
            aria-label="Restaurar pantalla"
          >
            <Minimize2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Salir (Esc)</span>
          </button>
        </div>
      )}
    </div>
  );
}
