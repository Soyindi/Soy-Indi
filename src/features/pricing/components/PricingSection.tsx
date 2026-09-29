'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRICING_PLANS, PlanInterval } from '@/entities/subscription/types';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CreditCard,
  Layers,
  FileText,
  Presentation
} from 'lucide-react';

interface PricingSectionProps {
  showTitle?: boolean;
}

export function PricingSection({ showTitle = true }: PricingSectionProps) {
  const [interval, setInterval] = useState<PlanInterval>('semiannual');

  const currentPlan = PRICING_PLANS[interval];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-cyan-400 mb-4 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparencia Radical • Cero Letra Chica</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Un Solo Plan.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300">
              Todo el Ecosistema Desbloqueado.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Comienza hoy con <strong>15 días de prueba gratis</strong>. Luego mantén tus tarjetas,
            tu Smart CV y tus presentaciones activas por el valor de un café al mes.
          </p>
        </div>
      )}

      {/* Switch Selector: Mensual vs Semestral */}
      <div className="flex items-center justify-center mb-12">
        <div className="p-1.5 rounded-2xl glass-panel flex items-center gap-2 border border-white/10 relative">
          <button
            onClick={() => setInterval('monthly')}
            className={`relative z-10 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              interval === 'monthly'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mensual ($2.500 CLP)
          </button>

          <button
            onClick={() => setInterval('semiannual')}
            className={`relative z-10 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              interval === 'semiannual'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Semestral ($6.000 CLP)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-zinc-950 font-black text-[10px] tracking-tight">
              AHORRA 60%
            </span>
          </button>
        </div>
      </div>

      {/* Tarjeta de Precios Destacada */}
      <div className="max-w-2xl mx-auto glass-panel relative rounded-3xl p-8 sm:p-12 border-2 border-indigo-500/40 shadow-2xl overflow-hidden">
        {/* Glow Superior */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/15 blur-[100px] pointer-events-none" />

        {/* Badge VIP Top */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>INDI ALL-ACCESS PASS</span>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              15 DÍAS DE PRUEBA VIP
            </span>
          </div>
        </div>

        {/* Precio Gigante */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              ${interval === 'semiannual' ? '6.000' : '2.500'}
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              CLP / {interval === 'semiannual' ? 'cada 6 meses' : 'mes'}
            </span>
          </div>

          <div className="mt-2 text-xs font-mono text-cyan-300 flex items-center gap-2">
            <span>● Equivalente a solo</span>
            <strong className="text-sm font-bold text-white">
              ${interval === 'semiannual' ? '1.000' : '2.500'} CLP / mes
            </strong>
            {interval === 'semiannual' && (
              <span className="text-zinc-500">($7 USD para usuarios internacionales)</span>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-8 pb-6 border-b border-white/10">
          Acceso sin restricciones a crear y compartir tus <strong>Tarjetas Digitales</strong>,
          optimizar tu <strong>Smart CV para filtros ATS</strong> y proyectar con <strong>Orbital Studio</strong>.
        </p>

        {/* Lista de Características */}
        <div className="space-y-3.5 mb-10">
          {currentPlan.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span
                className={`${
                  feat.highlight ? 'font-bold text-cyan-200' : 'text-zinc-300'
                }`}
              >
                {feat.text}
              </span>
            </div>
          ))}
        </div>

        {/* Botón de Llamada a la Acción Principal */}
        <div className="space-y-3">
          <Link
            href="/cards/new"
            className="w-full inline-flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <span>Iniciar Prueba Gratis de 15 Días</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-center text-[11px] text-zinc-500 font-mono">
            Sin tarjeta de crédito requerida • Configuración en menos de 2 minutos
          </p>
        </div>
      </div>

      {/* Tres Pilares Incluidos con Iconos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 text-left">
        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Tarjetas & QR Ilimitadas</h4>
          <p className="text-xs text-zinc-400">
            Conexión directa a WhatsApp, SmartParticles anti-colisión y Open Graph en el Edge.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Smart CV Calibrado</h4>
          <p className="text-xs text-zinc-400">
            Auditoría de compatibilidad ATS en tiempo real y exportación de documento estándar.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
            <Presentation className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Presentaciones 16:9</h4>
          <p className="text-xs text-zinc-400">
            Generador por IA, temas cinematográficos con iluminación reactiva y modo orador.
          </p>
        </div>
      </div>
    </div>
  );
}
