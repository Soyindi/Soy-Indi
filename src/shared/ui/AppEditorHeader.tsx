'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';

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
    <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
      <div className="flex items-start gap-4">
        {/* Botón de Retroceso con micro-animación */}
        <Link
          href={categoryHref}
          className="group inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all hover:scale-105 shrink-0 mt-0.5"
          title="Volver al Panel"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </Link>

        <div>
          {/* Breadcrumb contextual */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Panel
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <Link href={categoryHref} className="hover:text-white transition-colors text-indigo-400">
              {categoryName}
            </Link>
            <span className="text-zinc-600">•</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-300">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              {badgeText}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
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
