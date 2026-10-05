'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, LayoutDashboard } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'monthly';
  const isDemo = searchParams.get('demo') === 'true';

  const isSemiannual = plan === 'semiannual';

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center relative overflow-hidden bg-zinc-950">
      {/* Luces de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 border border-emerald-500/30 text-center relative z-10 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>¡Pago Aprobado con Éxito!</span>
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Bienvenido a INDI Pro
        </h1>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
          Tu suscripción <strong>{isSemiannual ? 'Semestral ($6.000 CLP)' : 'Mensual ($2.500 CLP)'}</strong> se encuentra activa.
          Todas las herramientas profesionales han sido desbloqueadas.
        </p>

        {isDemo && (
          <div className="mb-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs text-left">
            💡 <strong>Modo Sandbox:</strong> Checkout procesado en entorno local de pruebas.
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="min-h-[44px] min-w-[44px] w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ir a mi Panel de Control</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/cards/new"
            className="min-h-[44px] min-w-[44px] w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors border border-white/10 cursor-pointer"
          >
            <span>Crear mi primera Tarjeta Digital</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Transacción segura procesada vía Mercado Pago</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono text-sm">
          Cargando confirmación de suscripción...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
