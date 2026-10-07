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
      className={`relative flex items-center justify-center mb-8 select-none ${className}`}
      data-testid="hero-brand-identity"
    >
      {/* 1 · Aura Bioluminiscente Perimetral Central */}
      <div
        className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-indigo-500/25 via-cyan-400/20 to-teal-300/15 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* 2 · Contenedor del Isotipo Cinemático con Máscara Radial Suave */}
      <div
        className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center filter drop-shadow-[0_4px_32px_rgba(34,211,238,0.38)]"
        style={{
          WebkitMaskImage: 'radial-gradient(circle at center, black 62%, transparent 95%)',
          maskImage: 'radial-gradient(circle at center, black 62%, transparent 95%)',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover motion-reduce:hidden transition-transform duration-700 hover:scale-105"
          aria-label="Logotipo oficial cinemático animado INDI"
        >
          <source src="/brand/indi-logo-animated.webm" type="video/webm" />
          <source src="/brand/indi-logo-animated.mp4" type="video/mp4" />
        </video>

        {/* Fallback accesible para usuarios con prefers-reduced-motion */}
        <div className="hidden motion-reduce:block w-32 h-32 sm:w-36 sm:h-36 relative">
          <Image
            src="/brand/indi-isotipo-transparent.svg"
            alt="Isotipo Oficial INDI"
            fill
            priority
            sizes="(min-width: 640px) 144px, 128px"
            className="object-contain filter drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          />
        </div>
      </div>
    </div>
  );
}
