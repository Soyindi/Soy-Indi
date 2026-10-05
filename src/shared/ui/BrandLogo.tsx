import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BRAND_ASSETS } from '@/entities/brand/schemas';

export type BrandLogoVariant = 'symbol' | 'horizontal' | 'stacked' | 'svg-symbol' | 'svg-horizontal';
export type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  showText?: boolean;
  subtitle?: string;
  className?: string;
  linkToHome?: boolean;
  priority?: boolean;
  useVideo?: boolean;
}

const squareSizeMap: Record<BrandLogoSize, { box: string; imgSize: number; text: string; subText: string }> = {
  xs: { box: 'w-6 h-6', imgSize: 24, text: 'text-sm', subText: 'text-[9px]' },
  sm: { box: 'w-8 h-8', imgSize: 32, text: 'text-base', subText: 'text-[10px]' },
  md: { box: 'w-10 h-10', imgSize: 40, text: 'text-lg', subText: 'text-[11px]' },
  lg: { box: 'w-14 h-14', imgSize: 56, text: 'text-xl', subText: 'text-xs' },
  xl: { box: 'w-20 h-20', imgSize: 80, text: 'text-2xl', subText: 'text-sm' },
  '2xl': { box: 'w-28 h-28', imgSize: 112, text: 'text-3xl', subText: 'text-base' },
};

const cinematicSizeMap: Record<BrandLogoSize, { box: string; width: number; height: number }> = {
  xs: { box: 'h-7 aspect-[16/9] min-w-[50px]', width: 50, height: 28 },
  sm: { box: 'h-9 aspect-[16/9] min-w-[64px]', width: 64, height: 36 },
  md: { box: 'h-11 sm:h-12 aspect-[16/9] min-w-[80px] sm:min-w-[86px]', width: 86, height: 48 },
  lg: { box: 'h-14 sm:h-16 aspect-[16/9] min-w-[100px] sm:min-w-[114px]', width: 114, height: 64 },
  xl: { box: 'h-20 sm:h-24 aspect-[16/9] min-w-[142px] sm:min-w-[170px]', width: 170, height: 96 },
  '2xl': { box: 'h-28 sm:h-36 aspect-[16/9] min-w-[200px] sm:min-w-[256px]', width: 256, height: 144 },
};

export function BrandLogo({
  variant = 'horizontal',
  size = 'md',
  showText = false,
  subtitle,
  className = '',
  linkToHome = false,
  priority = false,
  useVideo = true,
}: BrandLogoProps) {
  const isCinematic = variant !== 'symbol' && variant !== 'svg-symbol';
  const currentSquare = squareSizeMap[size];
  const currentCinematic = cinematicSizeMap[size];

  // Selección de activo oficial optimizado WebP / SVG
  const asset = (() => {
    switch (variant) {
      case 'horizontal':
        return BRAND_ASSETS.techLockupSm;
      case 'stacked':
        return BRAND_ASSETS.stackedHero;
      case 'svg-symbol':
        return BRAND_ASSETS.isotipoSvg;
      case 'svg-horizontal':
        return BRAND_ASSETS.logoHorizontalSvg;
      case 'symbol':
      default:
        return size === 'xs' || size === 'sm' || size === 'md'
          ? BRAND_ASSETS.alienSymbolSm
          : BRAND_ASSETS.alienSymbol;
    }
  })();

  const posterUrl = isCinematic
    ? '/brand/indi-logo-video-poster.webp'
    : asset.url;

  const content = (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Contenedor del Logotipo Cinemático Imponente con Aura Cósmica */}
      <div
        className={`relative ${
          useVideo && isCinematic ? currentCinematic.box : currentSquare.box
        } rounded-xl sm:rounded-2xl overflow-hidden bg-black/60 border border-cyan-500/25 p-0.5 shadow-lg shadow-cyan-500/15 group-hover:scale-105 group-hover:shadow-cyan-400/30 group-hover:border-cyan-400/50 transition-all duration-300 shrink-0`}
      >
        <div className="w-full h-full rounded-[10px] sm:rounded-[14px] flex items-center justify-center relative overflow-hidden bg-black">
          {useVideo ? (
            <>
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster={posterUrl}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(34,211,238,0.35)] motion-reduce:hidden transition-transform duration-500 group-hover:scale-105"
                aria-label="Logotipo oficial animado INDI"
              >
                {isCinematic ? (
                  <>
                    <source src="/brand/indi-logo-wide-animated.webm" type="video/webm" />
                    <source src="/brand/indi-logo-wide-animated.mp4" type="video/mp4" />
                  </>
                ) : (
                  <>
                    <source src="/brand/indi-logo-animated.webm" type="video/webm" />
                    <source src="/brand/indi-logo-animated.mp4" type="video/mp4" />
                  </>
                )}
                <Image
                  src={posterUrl}
                  alt={asset.alt}
                  width={isCinematic ? currentCinematic.width : currentSquare.imgSize}
                  height={isCinematic ? currentCinematic.height : currentSquare.imgSize}
                  priority={priority}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.25)]"
                />
              </video>
              {/* Fallback accesible para usuarios con preferencia de movimiento reducido */}
              <Image
                src={posterUrl}
                alt={asset.alt}
                width={isCinematic ? currentCinematic.width : currentSquare.imgSize}
                height={isCinematic ? currentCinematic.height : currentSquare.imgSize}
                priority={priority}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.25)] hidden motion-reduce:block"
              />
            </>
          ) : (
            <Image
              src={asset.url}
              alt={asset.alt}
              width={isCinematic ? currentCinematic.width : currentSquare.imgSize}
              height={isCinematic ? currentCinematic.height : currentSquare.imgSize}
              priority={priority}
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.25)]"
            />
          )}
        </div>
      </div>

      {/* Tipografía Oficial Opcional (solo si se solicita expresamente) */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight text-white ${currentSquare.text} leading-none group-hover:text-cyan-200 transition-colors`}
            >
              INDI
            </span>
            {subtitle && (
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-cyan-300 border border-cyan-500/20 font-mono font-medium leading-none">
                {subtitle}
              </span>
            )}
          </div>
          {!subtitle && (
            <span className={`font-mono text-zinc-400 ${currentSquare.subText} tracking-wider uppercase mt-0.5`}>
              Identity Edge
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/#inicio" title="Ir al inicio de INDI" className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
