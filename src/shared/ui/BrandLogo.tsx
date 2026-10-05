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

const sizeMap: Record<BrandLogoSize, { box: string; imgSize: number; text: string; subText: string }> = {
  xs: { box: 'w-6 h-6', imgSize: 24, text: 'text-sm', subText: 'text-[9px]' },
  sm: { box: 'w-8 h-8', imgSize: 32, text: 'text-base', subText: 'text-[10px]' },
  md: { box: 'w-10 h-10', imgSize: 40, text: 'text-lg', subText: 'text-[11px]' },
  lg: { box: 'w-12 h-12', imgSize: 48, text: 'text-xl', subText: 'text-xs' },
  xl: { box: 'w-16 h-16', imgSize: 64, text: 'text-2xl', subText: 'text-sm' },
  '2xl': { box: 'w-24 h-24', imgSize: 96, text: 'text-3xl', subText: 'text-base' },
};

export function BrandLogo({
  variant = 'symbol',
  size = 'md',
  showText = true,
  subtitle,
  className = '',
  linkToHome = false,
  priority = false,
  useVideo = true,
}: BrandLogoProps) {
  const currentSize = sizeMap[size];

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

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Icon Container con Aura Reactiva Glassmorphic */}
      <div
        className={`relative ${currentSize.box} rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 p-[1px] shadow-lg shadow-indigo-500/15 group-hover:scale-105 group-hover:shadow-cyan-500/25 transition-all duration-300 shrink-0`}
      >
        <div className="w-full h-full bg-black/90 rounded-[11px] flex items-center justify-center p-0.5 relative overflow-hidden">
          {useVideo ? (
            <>
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster={asset.url}
                className="w-full h-full object-cover rounded-[9px] filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.25)] motion-reduce:hidden"
                aria-label="Logotipo animado oficial INDI"
              >
                <source src="/brand/indi-logo-animated.webm" type="video/webm" />
                <source src="/brand/indi-logo-animated.mp4" type="video/mp4" />
                <Image
                  src={asset.url}
                  alt={asset.alt}
                  width={currentSize.imgSize}
                  height={currentSize.imgSize}
                  priority={priority}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.25)]"
                />
              </video>
              {/* Fallback accesible para usuarios con preferencia de movimiento reducido */}
              <Image
                src={asset.url}
                alt={asset.alt}
                width={currentSize.imgSize}
                height={currentSize.imgSize}
                priority={priority}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.25)] hidden motion-reduce:block"
              />
            </>
          ) : (
            <Image
              src={asset.url}
              alt={asset.alt}
              width={currentSize.imgSize}
              height={currentSize.imgSize}
              priority={priority}
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.25)]"
            />
          )}
        </div>
      </div>

      {/* Tipografía Oficial INDI */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight text-white ${currentSize.text} leading-none group-hover:text-cyan-200 transition-colors`}
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
            <span className={`font-mono text-zinc-400 ${currentSize.subText} tracking-wider uppercase mt-0.5`}>
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
