'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserEntitlement } from '../actions';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { TrialCountdownTimer } from './TrialCountdownTimer';

interface TrialBannerProps {
  entitlement: UserEntitlement;
}

export function TrialBanner({ entitlement }: TrialBannerProps) {
  const router = useRouter();
  // 1. Si tiene suscripción activa
  if (entitlement.status === 'ACTIVE') {
    return (
      <aside aria-label="Estado de membresía" className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-emerald-500/20 px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {entitlement.tier === 'starter'
                  ? 'INDI Plan Starter Activo'
                  : entitlement.tier === 'max'
                  ? 'INDI Plan Max Activo'
                  : 'INDI Pro Activo'}
              </span>
            </span>
            <p className="text-xs text-zinc-300 font-normal">
              Acceso completo a herramientas profesionales • <span className="text-zinc-400">{entitlement.daysRemaining} días restantes del ciclo</span>
            </p>
          </div>
          <Link
            href="/pricing"
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer w-full sm:w-auto"
          >
            <span>Gestionar suscripción</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </aside>
    );
  }

  // 2. Si está en período de prueba (3 días)
  if (entitlement.status === 'TRIAL') {
    const isUrgent = entitlement.daysRemaining <= 1;

    return (
      <aside
        aria-label="Aviso de período de prueba"
        className={`w-full backdrop-blur-md border-b px-4 sm:px-6 py-3 transition-all ${
          isUrgent
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-100'
            : 'bg-zinc-950/85 border-indigo-500/20 text-zinc-100'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 w-full md:w-auto">
            {/* Pill Badge de estado */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isUrgent
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isUrgent ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-pulse'
                  }`}
                />
                <span>{isUrgent ? '¡Último día de prueba!' : 'Prueba Gratuita'}</span>
              </span>

              {/* Temporizador digital en vivo de Días, Horas, Minutos y Segundos */}
              <TrialCountdownTimer
                expiresAt={entitlement.expiresAt}
                initialTimeRemaining={entitlement.timeRemaining}
                onExpire={() => {
                  router.refresh();
                }}
              />
            </div>

            {/* Mensaje descriptivo con contraste WCAG AAA */}
            <div className="text-xs sm:text-sm text-zinc-300">
              <span className="font-semibold text-white">
                {isUrgent ? 'Tu prueba finaliza hoy.' : 'Acceso completo ilimitado.'}
              </span>
              <span className="ml-1.5 hidden lg:inline text-zinc-300">
                Tarjetas Digitales, Métricas, Smart CV y Presentaciones.
              </span>
            </div>
          </div>

          {/* CTA Ergonómico touch target >= 44px */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <Link
              href="/pricing"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/15 hover:shadow-amber-500/25 cursor-pointer w-full md:w-auto active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suscríbete por $2.500 / mes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  // 3. Si expiró el período de prueba
  return (
    <aside
      aria-label="Período de prueba finalizado"
      className="w-full bg-zinc-950/90 backdrop-blur-md border-b border-rose-500/30 px-4 sm:px-6 py-3.5 transition-all text-zinc-100"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Prueba Concluida</span>
          </span>
          <p className="text-xs sm:text-sm text-zinc-200">
            <strong className="text-white">Tu período de prueba de 3 días ha finalizado.</strong> Activa tu membresía mensual por $2.500 para mantener tus enlaces públicos y métricas activas.
          </p>
        </div>
        <Link
          href="/pricing"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-rose-600/20 cursor-pointer w-full sm:w-auto active:scale-[0.98]"
        >
          <span>Activar membresía por $2.500 / mes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}

