'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/shared/lib/auth-client';
import { Sparkles, ArrowRight, LayoutDashboard } from 'lucide-react';

interface PublicHeaderProps {
  ownerMode?: boolean;
}

export function PublicContextualHeader({ ownerMode = false }: PublicHeaderProps) {
  const { data: sessionData } = useSession();
  const isAuthenticated = !!sessionData?.user || ownerMode;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex items-center justify-between z-30">
      {/* Lado Izquierdo: Marca / Contexto */}
      <Link
        href="/"
        className="min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel text-xs font-mono text-zinc-300 hover:text-white border border-white/10 transition-all hover:scale-105 active:scale-95"
      >
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 p-[1px]">
          <div className="w-full h-full bg-black rounded-[5px] flex items-center justify-center">
            <span className="font-bold text-[9px] text-white">IN</span>
          </div>
        </div>
        <span className="font-semibold tracking-tight">INDI</span>
      </Link>

      {/* Lado Derecho: Acción contextual (Autenticado vs Visitante Viral) */}
      {isAuthenticated ? (
        <Link
          href="/dashboard"
          className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl glass-pill text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 active:scale-95 shadow-lg"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mi Panel</span>
        </Link>
      ) : (
        <Link
          href="/start"
          className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 hover:from-indigo-500/30 hover:to-cyan-500/30 text-white text-xs font-semibold border border-cyan-500/30 shadow-lg shadow-indigo-500/10 hover:shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Crea tu perfil gratis</span>
          <ArrowRight className="w-3 h-3 text-cyan-300" />
        </Link>
      )}
    </div>
  );
}
