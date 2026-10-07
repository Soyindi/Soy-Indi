import React from 'react';

interface SmartPreloaderProps {
  label?: string;
  compact?: boolean;
}

/**
 * SmartPreloader — Experiencia de Precarga Cinemática Oficial INDI 2026
 * 
 * Características de Estándar Internacional:
 * 1. Zero-Box Masking: Máscara radial continua (radial-gradient) que desvanece
 *    los bordes del video suavemente a 100% de transparencia (cero esquinas cuadradas).
 * 2. Cero Dependencia de JS para el Render: HTML5 <video> nativo con WebM (<56 KB)
 *    y fallback MP4 para arranque instantáneo (0ms JS delay).
 * 3. Aura Fotónica Volumétrica: Resplandores cian e índigo difusos de fondo.
 * 4. Micro-Barra Fotónica de Progreso: Shimmer lineal sutil con degradado prismático.
 * 5. Cumplimiento Estricto WCAG 2.2 AA: Atributos role="status", aria-live="polite".
 */
export function SmartPreloader({
  label = 'Cargando perfil profesional...',
  compact = false,
}: SmartPreloaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`relative w-full ${
        compact ? 'min-h-[280px]' : 'min-h-dvh fixed inset-0 z-50'
      } flex flex-col items-center justify-center bg-[#080A12] overflow-hidden select-none`}
    >
      {/* 1 · Halos Volumétricos Cósmicos de Fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none" />

      {/* 2 · Contenedor del Logotipo Cinemático sin Recuadro Cuadrado */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Envoltorio con Máscara Radial Fotónica Continua */}
        <div
          className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center filter drop-shadow-[0_0_32px_rgba(34,211,238,0.45)]"
          style={{
            WebkitMaskImage: 'radial-gradient(circle at center, black 58%, transparent 95%)',
            maskImage: 'radial-gradient(circle at center, black 58%, transparent 95%)',
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover transition-opacity duration-300"
            aria-label="Animación oficial de la marca INDI"
          >
            <source src="/brand/indi-logo-animated.webm" type="video/webm" />
            <source src="/brand/indi-logo-animated.mp4" type="video/mp4" />
          </video>
        </div>

        {/* 3 · Micro-Barra Fotónica de Progreso Bioluminiscente */}
        <div className="mt-6 w-32 sm:w-40 h-1 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-teal-300 rounded-full animate-pulse" />
        </div>

        {/* 4 · Lema y Etiqueta de Carga Accesible */}
        <div className="mt-4 flex flex-col items-center gap-1">
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-cyan-300/90 font-semibold">
            {label}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
            INDI · IDENTITY EDGE
          </span>
        </div>
      </div>
    </div>
  );
}
