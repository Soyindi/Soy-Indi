import React from 'react';
import Image from 'next/image';

interface SmartPreloaderProps {
  label?: string;
  compact?: boolean;
}

/**
 * SmartPreloader — Experiencia de Precarga Cinemática Oficial INDI 2026
 * 
 * Características de Estándar Internacional:
 * 1. Cápsula Orbital Circular Aeroespacial: Comparte idéntica morfología y anillo
 *    de cristal que HeroBrandIdentity, garantizando continuidad espacial (Shared Element Continuity).
 * 2. Zero-Box Masking: Máscara radial continua (radial-gradient 60% a 96%) que disuelve
 *    los bordes del video en luz pura (cero recuadros o esquinas toscas).
 * 3. Malla Espacial Vectorial & Auroras Bioluminiscentes: Malla matricial de puntos
 *    y halos difusos cian/índigo con 0 bytes de red y CSS puro.
 * 4. Micro-Barra Fotónica de Progreso: Shimmer lineal prismático que guía la atención.
 * 5. Cumplimiento Estricto WCAG 2.2 AA & Motion Reduce: role="status", aria-live="polite",
 *    y fallback SVG estático transparente (/brand/indi-isotipo-transparent.svg).
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
      {/* 0 · Malla Espacial Vectorial / Cybernetic Dot Matrix */}
      <div
        className="absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black_20%,transparent_80%)] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* 1 · Halos Volumétricos Cósmicos de Fondo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />

      {/* 2 · Contenedor del Logotipo Cinemático en Cápsula Orbital Circular */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Resplandor Bioluminiscente Perimetral */}
        <div
          className="absolute -top-4 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-indigo-500/30 via-cyan-400/25 to-teal-300/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Cápsula Orbital Fotónica Idéntica al Hero */}
        <div className="relative p-1 rounded-full bg-gradient-to-b from-cyan-400/30 via-indigo-500/15 to-transparent border border-cyan-400/30 shadow-[0_0_45px_-8px_rgba(34,211,238,0.45)] backdrop-blur-xl transition-transform duration-500">
          {/* Contenedor Circular con Máscara Radial Suave (Zero-Box Masking) */}
          <div
            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden flex items-center justify-center bg-black/60"
            style={{
              WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 96%)',
              maskImage: 'radial-gradient(circle at center, black 60%, transparent 96%)',
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover scale-105 motion-reduce:hidden transition-opacity duration-300"
              aria-label="Animación oficial de la marca INDI"
            >
              <source src="/brand/indi-logo-animated.webm" type="video/webm" />
              <source src="/brand/indi-logo-animated.mp4" type="video/mp4" />
            </video>

            {/* Fallback accesible para usuarios con prefers-reduced-motion */}
            <div className="hidden motion-reduce:block w-24 h-24 sm:w-28 sm:h-28 relative">
              <Image
                src="/brand/indi-isotipo-transparent.svg"
                alt="Isotipo Oficial INDI"
                fill
                priority
                sizes="(min-width: 640px) 112px, 96px"
                className="object-contain filter drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* 3 · Micro-Barra Fotónica de Progreso Bioluminiscente */}
        <div className="mt-7 w-36 sm:w-44 h-1 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
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
