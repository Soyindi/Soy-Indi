'use client';

import React from 'react';
import Link from 'next/link';
import { UserEntitlement } from '../actions';

interface TrialBannerProps {
  entitlement: UserEntitlement;
}

export function TrialBanner({ entitlement }: TrialBannerProps) {
  // Si tiene suscripción activa o quedan más de 10 días de prueba, mostrar badge minimalista o nada intrusivo
  if (entitlement.status === 'ACTIVE') {
    return (
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs flex items-center justify-between text-emerald-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Membresía INDI Pro Activa • {entitlement.daysRemaining} días restantes</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-mono">
            {entitlement.aiCredits} créditos IA disponibles
          </span>
          <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 underline font-medium">
            Gestionar plan
          </Link>
        </div>
      </div>
    );
  }

  // Si está en período de prueba
  if (entitlement.status === 'TRIAL') {
    const isUrgent = entitlement.daysRemaining <= 3;
    return (
      <div
        className={`w-full px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b transition-all ${
          isUrgent
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
            : 'bg-indigo-950/40 border-indigo-500/20 text-indigo-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isUrgent ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'
            }`}
          ></span>
          <span>
            {isUrgent ? (
              <strong>¡Últimos {entitlement.daysRemaining} días de prueba gratuita!</strong>
            ) : (
              <>Período de Prueba VIP: <strong>{entitlement.daysRemaining} días restantes</strong></>
            )}
            {' '}• Acceso total a Tarjetas, ATS CV y Presentaciones.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-white/10 px-2.5 py-0.5 rounded text-[11px] font-mono text-zinc-300">
            {entitlement.aiCredits} Créditos IA
          </span>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-semibold text-xs transition shadow-sm hover:shadow-amber-500/20"
          >
            Asegurar $6.000 / 6 meses
            <span className="text-[10px] bg-black/10 px-1 rounded">-60%</span>
          </Link>
        </div>
      </div>
    );
  }

  // Si expiró
  return (
    <div className="w-full bg-rose-500/15 border-b border-rose-500/30 px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-2 text-rose-200">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        <span>
          <strong>Tu período de prueba ha finalizado.</strong> Actualiza hoy para reactivar tus tarjetas públicas y herramientas de IA.
        </span>
      </div>
      <Link
        href="/pricing"
        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition"
      >
        Activar Plan Pro ($6.000 / 6 meses)
      </Link>
    </div>
  );
}
