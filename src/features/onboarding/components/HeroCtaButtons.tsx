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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[48px]"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>Crear Nueva Tarjeta / Hub</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass-panel text-zinc-300 hover:text-white font-medium text-sm transition-all min-h-[48px]"
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
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[48px]"
      >
        <span>Probar Gratis por 3 Días</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
      <Link
        href="/pricing"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass-panel text-zinc-300 hover:text-white font-medium text-sm transition-all min-h-[48px]"
      >
        <span>Ver Precios ($1.000 al mes)</span>
      </Link>
    </div>
  );
}
