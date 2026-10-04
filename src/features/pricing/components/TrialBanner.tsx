'use client';

import React from 'react';
import Link from 'next/link';
import { UserEntitlement } from '../actions';

interface TrialBannerProps {
  entitlement: UserEntitlement;
}

export function TrialBanner({ entitlement }: TrialBannerProps) {
  // Si tiene suscripción activa
  if (entitlement.status === 'ACTIVE') {
    return (
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs flex items-center justify-between text-emerald-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Membresía INDI Pro Activa • {entitlement.daysRemaining} días restantes</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 underline font-medium">
            Gestionar plan
          </Link>
        </div>
      </div>
    );
  }

  // Si está en período de prueba (3 días)
  if (entitlement.status === 'TRIAL') {
    const isUrgent = entitlement.daysRemaining <= 1;
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
              <strong>¡Último día de tu prueba gratuita!</strong>
            ) : (
              <>Prueba Gratuita: <strong>{entitlement.daysRemaining} días restantes</strong></>
            )}
            {' '}• Acceso total a Tarjetas Digitales, Métricas, CV y Presentaciones.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-semibold text-xs transition shadow-sm hover:shadow-amber-500/20 min-h-[36px]"
          >
            Suscríbete por $2.500 / mes
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
          <strong>Tu período de prueba de 3 días ha finalizado.</strong> Activa tu membresía mensual por $2.500 o semestral por $6.000 para mantener tus tarjetas y métricas activas.
        </span>
      </div>
      <Link
        href="/pricing"
        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition min-h-[36px] flex items-center"
      >
        Activar por $2.500 / mes
      </Link>
    </div>
  );
}
