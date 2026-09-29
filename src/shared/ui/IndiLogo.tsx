import React from 'react';

interface IndiLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  showBadge?: boolean;
  variant?: 'default' | 'monochrome' | 'glow';
}

export function IndiLogo({
  className = '',
  size = 42,
  showWordmark = true,
  showBadge = false,
  variant = 'default',
}: IndiLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Isotipo Transparente: Prisma Orbital & Nodo de Identidad */}
      <div className="relative flex items-center justify-center">
        {/* Resplandor ambiental reactivo (Aura OKLCH) */}
        {variant !== 'monochrome' && (
          <div
            className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-indigo-500/35 via-cyan-400/25 to-teal-300/30 blur-md opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none"
            aria-hidden="true"
          />
        )}

        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-500 group-hover:scale-[1.04]"
          aria-label="INDI Isotipo Oficial"
        >
          <defs>
            {/* Gradiente Principal: Electric Indigo -> Cyber Cyan -> Mint Teal */}
            <linearGradient id="indi-prism-grad" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>

            {/* Gradiente de Profundidad para Capa Trasera (Glass Card Layer) */}
            <linearGradient id="indi-glass-back" x1="12" y1="8" x2="52" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.12" />
            </linearGradient>

            {/* Gradiente Especular para el Borde de Cristal */}
            <linearGradient id="indi-rim-light" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
              <stop offset="45%" stopColor="#22D3EE" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
            </linearGradient>

            {/* Glow para el Nodo Superior de la "i" */}
            <radialGradient id="indi-node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A5F3FC" stopOpacity="1" />
              <stop offset="55%" stopColor="#22D3EE" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Marco Exterior Biselado Transparente (Squircle Glassmorphism 2.0) */}
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="16"
            fill="rgba(10, 12, 24, 0.55)"
            stroke="url(#indi-rim-light)"
            strokeWidth="1.5"
          />

          {/* 2. Anillo Orbital Elíptico (Representa Presentations & Edge Network) */}
          <ellipse
            cx="32"
            cy="32"
            rx="23"
            ry="11"
            transform="rotate(-32 32 32)"
            stroke="url(#indi-prism-grad)"
            strokeWidth="1.75"
            strokeDasharray="4 3"
            strokeOpacity="0.55"
          />

          {/* 3. Tarjeta / Hoja Posterior en Perspectiva Isométrica (Smart CV / Card Layer) */}
          <path
            d="M24 15C24 12.7909 25.7909 11 28 11H43C45.2091 11 47 12.7909 47 15V41C47 43.2091 45.2091 45 43 45H28C25.7909 45 24 43.2091 24 41V15Z"
            fill="url(#indi-glass-back)"
            stroke="url(#indi-prism-grad)"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />

          {/* 4. Monograma "I" + "N" Prisma Frontal (Pilar de Identidad Digital) */}
          {/* Columna Izquierda (Base de la I y la N) */}
          <rect
            x="17"
            y="24"
            width="8"
            height="25"
            rx="4"
            fill="url(#indi-prism-grad)"
          />

          {/* Puente Diagonal Conector (Trazo de la N / Flujo de Datos) */}
          <path
            d="M21 27L41 46"
            stroke="url(#indi-prism-grad)"
            strokeWidth="6.5"
            strokeLinecap="round"
          />

          {/* Columna Derecha Ascendente */}
          <rect
            x="37"
            y="20"
            width="8"
            height="29"
            rx="4"
            fill="url(#indi-prism-grad)"
            fillOpacity="0.9"
          />

          {/* 5. Nodo Cuántico Superior (Punto de la "i" de INDI) */}
          <circle cx="21" cy="15.5" r="7" fill="url(#indi-node-glow)" />
          <circle
            cx="21"
            cy="15.5"
            r="3.8"
            fill="#F8FAFC"
            stroke="#22D3EE"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Wordmark Tipográfico + Badge */}
      {showWordmark && (
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-300">
              INDI
            </span>
            <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-cyan-400/80 mt-0.5 leading-none">
              Identity Edge
            </span>
          </div>

          {showBadge && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 font-mono font-medium shadow-inner">
              2026 SaaS
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default IndiLogo;
