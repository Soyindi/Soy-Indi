'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import { BrandLogo } from '@/shared/ui/BrandLogo';

interface AppEditorHeaderProps {
  sectionTitle: string;
  categoryName: string;
  categoryHref?: string;
  badgeText?: string;
  children?: React.ReactNode;
}

export function AppEditorHeader({
  sectionTitle,
  categoryName,
  categoryHref = '/dashboard',
  badgeText = 'Borrador en Vivo',
  children,
}: AppEditorHeaderProps) {
  return (
    <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Isotipo Oficial INDI con enlace al Dashboard */}
        <Link href="/dashboard" title="Panel Principal INDI" className="shrink-0 group">
          <BrandLogo variant="symbol" size="sm" showText={false} />
        </Link>

        {/* Separador vertical sutil */}
        <div className="h-7 w-[1px] bg-white/10 hidden sm:block shrink-0" />

        {/* Botón de Retroceso ergonómico con micro-animación (>= 44x44px) */}
        <Link
          href={categoryHref}
          className="group inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all hover:scale-105 shrink-0"
          title="Volver al Panel"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </Link>

        <div>
          {/* Breadcrumb contextual */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Panel
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <Link href={categoryHref} className="hover:text-white transition-colors text-cyan-400 font-medium">
              {categoryName}
            </Link>
            <span className="text-zinc-600">•</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-300">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              {badgeText}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
            {sectionTitle}
          </h1>
        </div>
      </div>

      {/* Acciones principales del editor (Guardar, Asistente, etc.) */}
      {children && (
        <div className="flex items-center gap-3 shrink-0">
          {children}
        </div>
      )}
    </header>
  );
}
