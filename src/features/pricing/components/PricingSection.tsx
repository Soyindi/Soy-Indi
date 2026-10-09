'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PRICING_TIERS, PlanInterval, PlanTier } from '@/entities/subscription/types';
import { useSession } from '@/shared/lib/auth-client';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CreditCard,
  Layers,
  FileText,
  Presentation,
  Loader2,
  CheckCircle2,
  Star
} from 'lucide-react';

interface PricingSectionProps {
  showTitle?: boolean;
  activeTier?: PlanTier | null;
  activePlanInterval?: PlanInterval | null;
}

export function PricingSection({ 
  showTitle = true,
  activeTier = null,
  activePlanInterval = null,
}: PricingSectionProps) {
  const router = useRouter();
  const [interval, setInterval] = useState<PlanInterval>(activePlanInterval || 'monthly');
  const [selectedTier, setSelectedTier] = useState<PlanTier | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'flow' | 'fintoc' | 'webpay' | 'mercadopago'>('flow');
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { data: sessionData } = useSession();
  const isAuthenticated = !!sessionData?.user;

  const handleStartCheckout = async (tier: PlanTier) => {
    if (!isAuthenticated) {
      router.push(`/login?mode=signup&callbackUrl=/pricing`);
      return;
    }

    try {
      setSelectedTier(tier);
      setIsLoadingCheckout(true);
      setCheckoutError(null);

      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          planInterval: interval,
          provider: selectedProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al iniciar la sesión de pago.');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      console.error('Error checkout:', err);
      setCheckoutError(err.message || 'Error al procesar el pago.');
      setIsLoadingCheckout(false);
      setSelectedTier(null);
    }
  };

  const tiers: PlanTier[] = ['starter', 'pro', 'max'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-cyan-400 mb-4 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Matriz de Planes • El Semestre Irresistible</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Escoge el Plan Perfecto.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300">
              Multiplica tu Presencia.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Empieza hoy con <strong>3 días de prueba gratis</strong>. Luego activa la suite profesional en plan mensual accesible o ahorra hasta <strong>60% con el pago semestral</strong>.
          </p>
        </div>
      )}

      {/* Switch Selector: Mensual vs Semestral */}
      <div className="flex items-center justify-center mb-12">
        <div className="p-1.5 rounded-2xl glass-panel flex items-center gap-2 border border-white/10 relative">
          <button
            type="button"
            onClick={() => setInterval('monthly')}
            className={`min-h-[44px] min-w-[44px] relative z-10 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              interval === 'monthly'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pago Mensual
          </button>

          <button
            type="button"
            onClick={() => setInterval('semiannual')}
            className={`min-h-[44px] min-w-[44px] relative z-10 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              interval === 'semiannual'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Pago Semestral</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-zinc-950 font-black text-[10px] tracking-tight">
              HASTA 60% OFF 🔥
            </span>
          </button>
        </div>
      </div>

      {/* Selector Ergonómico de Método de Pago (Flow 🇨🇱 Recomendado: Webpay Plus / Tarjetas / Transferencias) */}
      <div className="flex flex-col items-center justify-center gap-3 mb-8">
        <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
          Método de Pago Seguro en Chile
        </span>
        <div className="inline-flex p-1.5 rounded-2xl glass-panel border border-white/10 bg-zinc-950/70 shadow-lg">
          <button
            type="button"
            onClick={() => setSelectedProvider('flow')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              selectedProvider === 'flow'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🇨🇱 Webpay / Tarjetas y Bancos</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 font-black text-[10px] hidden sm:inline">
              RECOMENDADO
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProvider('fintoc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              selectedProvider === 'fintoc'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 shadow-md shadow-blue-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>⚡ Fintoc A2A</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProvider('mercadopago')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
              selectedProvider === 'mercadopago'
                ? 'bg-sky-400 text-zinc-950 shadow-md'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Mercado Pago</span>
          </button>
        </div>
      </div>

      {checkoutError && (
        <div className="max-w-md mx-auto mb-8 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
          {checkoutError}
        </div>
      )}

      {/* Matriz de 3 Columnas: Starter 🟢 | Pro 🔵 | Max 🟣 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
        {tiers.map((tierKey) => {
          const tier = PRICING_TIERS[tierKey];
          const pricing = tier[interval];
          const isPro = tierKey === 'pro';
          const isMax = tierKey === 'max';
          const isStarter = tierKey === 'starter';
          const isBusy = isLoadingCheckout && selectedTier === tierKey;

          return (
            <div
              key={tierKey}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                isPro
                  ? 'glass-panel border-2 border-indigo-500/60 shadow-2xl shadow-indigo-500/20 bg-zinc-950/90 scale-[1.02] z-10'
                  : 'glass-panel border border-white/10 bg-zinc-950/60 hover:border-white/20'
              }`}
            >
              {/* Badge superior para plan Pro */}
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-indigo-500 to-cyan-400 text-zinc-950 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    RECOMENDADO • MÁS POPULAR
                  </span>
                </div>
              )}

              {/* Encabezado del Plan */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400">
                    {tier.badge}
                  </span>
                  {pricing.discountPercentage && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {pricing.discountPercentage}% de ahorro 🔥
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                  {tier.name}
                </h3>
                <p className="text-xs text-zinc-300 min-h-[36px] leading-relaxed mb-6">
                  {tier.tagline}
                </p>

                {/* Bloque de Precio */}
                <div className="pb-6 mb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
                      ${pricing.priceClp.toLocaleString('es-CL')}
                    </span>
                    <span className="text-xs font-mono uppercase text-zinc-400">
                      CLP / {interval === 'semiannual' ? 'semestre' : 'mes'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                    <span className="text-zinc-400">Equivale a:</span>
                    <strong className="text-white font-bold">
                      ${pricing.monthlyEquivalentClp.toLocaleString('es-CL')} CLP / mes
                    </strong>
                    {interval === 'semiannual' && (
                      <span className="text-zinc-400 text-[11px]">
                        (${pricing.priceUsd} USD)
                      </span>
                    )}
                  </div>
                </div>

                {/* Resumen de Cuotas Clave */}
                <div className="grid grid-cols-3 gap-2 mb-6 p-3 rounded-2xl bg-white/5 border border-white/5 text-center text-[11px]">
                  <div>
                    <span className="block text-zinc-400 font-mono">Tarjetas</span>
                    <strong className="text-white font-semibold capitalize">
                      {tier.limits.cards === 'unlimited' ? '∞ Ilimitadas' : `${tier.limits.cards} perfiles`}
                    </strong>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="block text-zinc-400 font-mono">Smart CV</span>
                    <strong className="text-white font-semibold capitalize">
                      {tier.limits.cvs === 'unlimited' ? '∞ Ilimitados' : `${tier.limits.cvs} versiones`}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-zinc-400 font-mono">Presentar</span>
                    <strong className="text-white font-semibold capitalize">
                      {tier.limits.presentations === 'unlimited' ? '∞ Ilimitadas' : `${tier.limits.presentations} decks`}
                    </strong>
                  </div>
                </div>

                {/* Lista de Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPro
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : isMax
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className={feat.highlight ? 'font-bold text-white' : 'text-zinc-300'}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de Checkout Ergonómico touch target >= 44px */}
              <div>
                {activeTier === tierKey ? (
                  <div className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Tu Plan Actual (Activo)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartCheckout(tierKey)}
                    disabled={isLoadingCheckout}
                    className={`w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] ${
                      isPro
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 shadow-amber-500/20'
                        : isMax
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/20'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                    }`}
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>{activeTier ? `Cambiar a ${tier.name}` : `Elegir ${tier.name}`}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón Secundario de Prueba Gratuita y Garantía */}
      <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
        <Link
          href={isAuthenticated ? '/start' : '/login?mode=signup&callbackUrl=/start'}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors py-2 px-4 rounded-xl hover:bg-white/5"
        >
          <span>{isAuthenticated ? 'Volver a mi panel de control' : '¿Quieres probar antes? Empieza tu prueba gratuita de 3 días'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-center text-[11px] text-zinc-400">
          🔒 Pagos 100% seguros procesados en pesos chilenos (CLP) vía Webpay, tarjetas de débito/crédito y Mercado Pago. Sin permanencia obligatoria.
        </p>
      </div>

      {/* Tres Pilares Incluidos con Iconos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Tarjetas con Código QR</h4>
          <p className="text-xs text-zinc-400">
            Botón directo a WhatsApp, enlace personalizado y visualización rápida en celulares sin apps adicionales.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Currículum Fácil en PDF</h4>
          <p className="text-xs text-zinc-400">
            Formato A4 internacional para postulaciones laborales con consejos automáticos de compatibilidad ATS.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
            <Presentation className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Presentaciones Orbitales</h4>
          <p className="text-xs text-zinc-400">
            Diapositivas 16:9 con copiloto IA para proyectar propuestas y cotizaciones con impacto visual.
          </p>
        </div>
      </div>
    </div>
  );
}
