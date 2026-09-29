'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PresentationSlide, PresentationTheme } from '@/entities/presentation/schemas';
import { Sparkles, BarChart3, Code2, Quote, Layers, CheckCircle2 } from 'lucide-react';

interface SlideViewerProps {
  slide: PresentationSlide;
  theme: PresentationTheme;
  slideNumber: number;
  totalSlides: number;
}

export function SlideViewer({ slide, theme, slideNumber, totalSlides }: SlideViewerProps) {
  // Íconos representativos según tipo de diapositiva
  const renderVisualIcon = () => {
    switch (slide.visualType) {
      case 'metrics':
        return <BarChart3 className="w-8 h-8 text-cyan-400" />;
      case 'code':
        return <Code2 className="w-8 h-8 text-emerald-400" />;
      case 'quote':
        return <Quote className="w-8 h-8 text-amber-400" />;
      case 'architecture':
        return <Layers className="w-8 h-8 text-indigo-400" />;
      default:
        return <Sparkles className="w-8 h-8 text-cyan-300" />;
    }
  };

  return (
    <div
      className="relative w-full aspect-[16/9] min-h-[460px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-8 sm:p-12 border border-white/10 select-none"
      style={{
        background: theme.backgroundGradient,
      }}
    >
      {/* Luz volumétrica de ambientación */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-25"
        style={{ backgroundColor: theme.accentColor }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme.primaryColor }}
      />

      {/* Cabecera de la diapositiva */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
            {renderVisualIcon()}
          </div>
          <span className="text-xs font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            INDI ORBITAL • SLIDE {slideNumber} / {totalSlides}
          </span>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300">
          {theme.name}
        </span>
      </div>

      {/* Contenido Central */}
      <div className="relative z-10 my-auto max-w-4xl">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            {slide.title}
          </h2>

          {slide.subtitle && (
            <p className="text-base sm:text-lg text-cyan-200/90 font-medium mb-8">
              {slide.subtitle}
            </p>
          )}

          {/* Puntos Clave */}
          {slide.keyPoints.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {slide.keyPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md"
                >
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                    {pt}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Pie de diapositiva */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] font-mono text-zinc-500">
        <span>PRESENTACIÓN CINEMATOGRÁFICA INTERACTIVA</span>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>ESTADO ACTIVO</span>
        </div>
      </div>
    </div>
  );
}
