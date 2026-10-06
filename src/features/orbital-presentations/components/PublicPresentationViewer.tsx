'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SlideViewer } from '@/features/orbital-presentations/components/SlideViewer';
import { PresentationSlide, PresentationTheme } from '@/entities/presentation/schemas';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowLeft,
  Clock,
  FileText,
  Vibrate,
  Copy,
  Check,
} from 'lucide-react';
import { trackResourceView } from '@/shared/lib/telemetryClient';

interface PublicPresentationViewerProps {
  title: string;
  slides: PresentationSlide[];
  theme: PresentationTheme;
  slug: string;
  onExit?: () => void;
}

export function PublicPresentationViewer({
  title,
  slides,
  theme,
  slug,
  onExit,
}: PublicPresentationViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Telemetría pasiva desacoplada de la ruta SSR
  useEffect(() => {
    if (slug && slug !== 'demo') {
      trackResourceView({ slug, entityType: 'presentation' });
    }
  }, [slug]);

  const total = slides.length;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Retroalimentación háptica (Vibration API) para dispositivos móviles
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.([30, 20, 30]);
      } catch {
        // Ignorar si el navegador restringe la vibración
      }
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < total - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      triggerHaptic();
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      triggerHaptic();
    }
  };

  // Detección de gestos táctiles (Swipe horizontal)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Umbral de 50px para registrar swipe
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/p/${slug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // Cronómetro del orador
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Screen Wake Lock API: Previene que la pantalla se apague durante la presentación
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Política de seguridad o inactividad del navegador
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // Atajos de teclado para presentaciones
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && onExit) {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, total, onExit]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min(100, Math.round(((currentSlideIndex + 1) / total) * 100));

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-black text-white flex flex-col justify-between p-4 sm:p-8 select-none relative"
    >
      {/* Barra de Progreso Cinemática Superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300 shadow-sm shadow-cyan-400/50"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      {/* Barra Superior */}
      <header className="flex items-center justify-between z-20 pb-4">
        <div className="flex items-center gap-3">
          {/* Isotipo Oficial Animado INDI */}
          <BrandLogo
            variant="symbol"
            size="sm"
            showText={false}
            useVideo={true}
            linkToHome={true}
            className="min-h-[44px] min-w-[44px] p-0.5 rounded-xl transition-transform hover:scale-105 active:scale-95"
          />

          <div className="h-6 w-[1px] bg-white/10 hidden sm:block shrink-0" />

          {onExit ? (
            <button
              onClick={onExit}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-pill text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 shadow-lg active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Estudio</span>
            </button>
          ) : (
            <Link
              href="/dashboard?tab=presentations"
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-pill text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 shadow-lg active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Panel</span>
            </Link>
          )}
          <span className="text-sm sm:text-base font-bold tracking-tight text-white line-clamp-1">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Cronómetro en vivo */}
          <div className="min-h-[44px] hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Toggle de Notas del Orador */}
          <button
            onClick={() => setShowPresenterNotes(!showPresenterNotes)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all border flex items-center gap-1.5 ${
              showPresenterNotes
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'glass-pill text-zinc-300 hover:text-white border-white/10'
            }`}
            title="Alternar notas del orador"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notas</span>
          </button>

          {/* Botón Copiar Enlace Público */}
          <button
            onClick={handleCopyLink}
            className="min-h-[44px] px-3.5 py-2 rounded-xl glass-pill text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Copiar enlace permanente"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 hidden sm:inline">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Copiar Link</span>
              </>
            )}
          </button>

          <Link
            href="/login?mode=signup&callbackUrl=/presentations"
            className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear Presentación</span>
          </Link>

          <button
            onClick={toggleFullscreen}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl glass-pill text-zinc-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 active:scale-95"
            title="Pantalla completa (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Contenedor Principal de la Diapositiva (Modo Teatro Cinemático Expansivo) */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl w-full mx-auto my-auto py-2 sm:py-4 px-2 sm:px-4 transition-all duration-300">
        <SlideViewer
          slide={currentSlide}
          theme={theme}
          slideNumber={currentSlideIndex + 1}
          totalSlides={total}
          showNotes={showPresenterNotes}
        />

        {/* Panel Desplegable de Notas del Orador */}
        {showPresenterNotes && currentSlide.speakerNotes && (
          <div className="w-full mt-4 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 backdrop-blur-md animate-fade-in">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono font-bold text-amber-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Notas Confidenciales del Orador:</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
              {currentSlide.speakerNotes}
            </p>
          </div>
        )}
      </main>

      {/* Barra Inferior de Navegación */}
      <footer className="flex items-center justify-between max-w-6xl w-full mx-auto pt-6 z-20">
        <div className="text-xs font-mono text-zinc-400 hidden sm:block">
          Usa ← y → para diapositivas • F para pantalla completa • Hápticos activos
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
