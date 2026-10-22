'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/shared/lib/auth-client';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';

interface HeroCtaButtonsProps {
  className?: string;
}

/**
 * Componente reactivo que resuelve el estado de autenticación del usuario.
 * Si el usuario ya cuenta con sesión iniciada, le permite ingresar directamente
 * al Onboarding Hub (/start) o a su Panel (/dashboard) en 1 toque sin solicitar
 * credenciales repetitivas.
 * Cumple con estándares de ergonomía móvil: Touch target >= 44px (min-h-[48px]) y retícula base 8.
 */
export function HeroCtaButtons({ className = '' }: HeroCtaButtonsProps) {
  const { data: sessionData } = useSession();
  const isAuthenticated = !!sessionData?.user;

  if (isAuthenticated) {
    return (
      <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
        <Link
          href="/start"
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <Sparkles className="w-4 h-4 text-cyan-100 group-hover:rotate-12 transition-transform duration-300" />
          <span>Crear Nueva Tarjeta / Hub</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
        </Link>
        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass-panel text-zinc-300 hover:text-white hover:border-cyan-400/40 font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <LayoutDashboard className="w-4 h-4 text-cyan-400" />
          <span>Ir a Mi Panel</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      <Link
        href="/login?mode=signup&callbackUrl=/start"
        className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        <span>Comenzar Gratis (Sin tarjeta)</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
      </Link>
      <Link
        href="/pricing"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass-panel text-zinc-300 hover:text-white hover:border-cyan-400/40 font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        <span>Ver Planes & Comunidad</span>
      </Link>
    </div>
  );
}
