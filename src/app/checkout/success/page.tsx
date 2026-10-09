'use client';

import React, { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, LayoutDashboard, AlertCircle, RefreshCw } from 'lucide-react';
import { PRICING_TIERS, PlanTier } from '@/entities/subscription/types';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const plan = searchParams.get('plan') || 'monthly';
  const tierKey = (searchParams.get('tier') as PlanTier) || 'starter';
  const provider = searchParams.get('provider') || 'flow';
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo') === 'true';
  const statusParam = searchParams.get('status');

  const isSemiannual = plan === 'semiannual';
  const tier = PRICING_TIERS[tierKey] || PRICING_TIERS.starter;
  const priceDetail = tier[isSemiannual ? 'semiannual' : 'monthly'];

  // Sincronizar sesión y refrescar router al montar para garantizar que el nuevo status 'ACTIVE' se refleje en Better-Auth y el router de Next.js
  useEffect(() => {
    async function syncActiveSession() {
      try {
        const { authClient } = await import('@/shared/lib/auth-client');
        await authClient.getSession();
      } catch {
        // Silencioso
      }
      router.refresh();
    }
    syncActiveSession();
  }, [router]);

  // Si Flow retornó un estado que no es 2 (aprobado)
  const isRejected = statusParam && statusParam !== '2';

  if (isRejected) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center relative overflow-hidden bg-zinc-950">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 border border-amber-500/30 text-center relative z-10 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-3">
            <span>Transacción Pendiente o Incompleta</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            No pudimos confirmar tu pago
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
            La entidad emisora o el medio de pago no completó la operación (Estado Flow: {statusParam}). No se ha realizado ningún cobro indebido.
          </p>

          <div className="space-y-3">
            <Link
              href="/pricing"
              className="min-h-[44px] min-w-[44px] w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar con otro medio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="min-h-[44px] min-w-[44px] w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors border border-white/10 cursor-pointer"
            >
              <span>Volver a mi panel</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Nombre amigable del proveedor
  const providerLabel = provider === 'flow'
    ? 'Webpay Plus / Tarjetas (Flow.cl)'
    : provider === 'fintoc'
    ? 'Fintoc Transferencia Directa'
    : provider === 'mercadopago'
    ? 'Mercado Pago'
    : 'Medio de Pago Seguro';

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center relative overflow-hidden bg-zinc-950">
      {/* Luces volumétricas de fondo */}
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
          Bienvenido a {tier.name}
        </h1>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
          Tu suscripción <strong>{isSemiannual ? 'Semestral' : 'Mensual'} (${priceDetail.priceClp.toLocaleString('es-CL')} CLP)</strong> se encuentra 100% activa. Todas las herramientas profesionales han sido desbloqueadas.
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
          <span>Transacción segura procesada vía {providerLabel}</span>
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
