'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SlideViewer } from '@/features/orbital-presentations/components/SlideViewer';
import { PresentationSlide, PresentationTheme } from '@/entities/presentation/schemas';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Sparkles, ArrowLeft } from 'lucide-react';

interface PublicPresentationViewerProps {
  title: string;
  slides: PresentationSlide[];
  theme: PresentationTheme;
  slug: string;
}

export function PublicPresentationViewer({
  title,
  slides,
  theme,
  slug,
}: PublicPresentationViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const total = slides.length;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const nextSlide = () => {
    if (currentSlideIndex < total - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  // Atajos de teclado para presentaciones
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, total]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Barra Superior */}
      <header className="flex items-center justify-between z-20 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard?tab=presentations"
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-pill text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Panel</span>
          </Link>
          <span className="text-sm sm:text-base font-bold tracking-tight text-white line-clamp-1">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/start"
            className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear Presentación</span>
          </Link>
          <button
            onClick={toggleFullscreen}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl glass-pill text-zinc-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 active:scale-95"
            title="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Contenedor Principal de la Diapositiva */}
      <main className="flex-1 flex items-center justify-center max-w-6xl w-full mx-auto my-auto">
        <SlideViewer
          slide={currentSlide}
          theme={theme}
          slideNumber={currentSlideIndex + 1}
          totalSlides={total}
        />
      </main>

      {/* Barra Inferior de Navegación */}
      <footer className="flex items-center justify-between max-w-6xl w-full mx-auto pt-6 z-20">
        <div className="text-xs font-mono text-zinc-400 hidden sm:block">
          Usa las flechas ← y → del teclado para navegar
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="min-h-[44px] px-4 py-2.5 rounded-xl glass-pill text-xs font-semibold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 active:scale-95 transition-all border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <span className="min-h-[44px] inline-flex items-center text-xs font-mono font-medium text-cyan-300 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10">
            {currentSlideIndex + 1} / {total}
          </span>

          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === total - 1}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
