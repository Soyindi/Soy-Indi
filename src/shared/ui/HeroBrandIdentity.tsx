import React from 'react';
import Image from 'next/image';

interface HeroBrandIdentityProps {
  className?: string;
}

/**
 * HeroBrandIdentity — Identidad Visual Cinemática y Orgánica del Hero (INDI 2026)
 * 
 * Erradicación definitiva del "logo tosco cuadrado":
 * - Máscara Radial Fotónica (Zero-Box Masking): difumina los márgenes del video
 *   hacia 100% de transparencia radial, eliminando bordes rectangulares y artefactos de mezcla.
 * - Video profesional del isotipo animado viviente de INDI (WebM <56 KB, MP4 <67 KB)
 *   con reproducción instantánea (muted, playsInline, autoPlay).
 * - Fallback instantáneo accesible (SVG transparente puro) para modo de movimiento reducido.
 * - Cero dependencias complejas, cero layout shifts (CLS = 0).
 */
export function HeroBrandIdentity({ className = '' }: HeroBrandIdentityProps) {
  return (
    <div
      className={`relative flex items-center justify-center mb-6 select-none ${className}`}
      data-testid="hero-brand-identity"
    >
      {/* 1 · Resplandor Bioluminiscente Multicapa */}
      <div
        className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-indigo-500/30 via-cyan-400/25 to-teal-300/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* 2 · Cápsula Orbital Fotónica de Grado Aeroespacial */}
      <div className="relative group cursor-pointer p-1 rounded-full bg-gradient-to-b from-cyan-400/30 via-indigo-500/15 to-transparent border border-cyan-400/30 shadow-[0_0_45px_-8px_rgba(34,211,238,0.45)] backdrop-blur-xl transition-transform duration-500 hover:scale-105 active:scale-95">
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
            className="w-full h-full object-cover scale-105 motion-reduce:hidden transition-transform duration-700 group-hover:scale-115"
            aria-label="Logotipo oficial cinemático animado INDI"
          >
            <source src="/brand/indi-logo-animated.mp4" type="video/mp4" />
            <source src="/brand/indi-logo-animated.webm" type="video/webm" />
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

        {/* Reflejo fotónico superior sutil */}
        <div
          className="absolute inset-x-4 top-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
