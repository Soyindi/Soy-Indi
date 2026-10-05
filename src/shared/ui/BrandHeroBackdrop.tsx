'use client';

import { useEffect, useState } from 'react';
import { BRAND_ASSETS } from '@/entities/brand/schemas';

const VIDEO_QUERY = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';

/**
 * Fondo cinemático de la marca para el hero.
 * - Poster WebP estático siempre presente (Zero CLS, LCP instantáneo).
 * - El <video> solo se monta en escritorio y sin `prefers-reduced-motion`,
 *   evitando descargar el MP4/WebM en móvil.
 * - Desenfoque + capa oscura: el video es ambiente, no mensaje (WCAG AA en el texto).
 */
export function BrandHeroBackdrop() {
  const asset = BRAND_ASSETS.brandRevealVideo;
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(VIDEO_QUERY);
    const sync = () => setShowVideo(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset.fallbackUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-50"
      />
      {showVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-50 will-change-transform"
          poster={asset.fallbackUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          {asset.webmUrl && <source src={asset.webmUrl} type="video/webm" />}
          <source src={asset.url} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/55 to-zinc-950" />
    </div>
  );
}
