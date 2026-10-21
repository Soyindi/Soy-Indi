'use client';

import React from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  FileText, 
  MonitorPlay, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Share2, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import { ReferralWelcomeBanner } from '@/features/affiliates/components/ReferralWelcomeBanner';
import type { ReferralPartnerInfo } from '@/features/affiliates/actions';
import { UserEntitlement } from '@/entities/subscription/types';

interface OnboardingChoiceGridProps {
  daysRemaining: number;
  referralPartner?: ReferralPartnerInfo | null;
  entitlement?: UserEntitlement;
}

export function OnboardingChoiceGrid({ daysRemaining, referralPartner, entitlement }: OnboardingChoiceGridProps) {
  const isSubscribed = entitlement?.status === 'ACTIVE';
  const options = [
    {
      id: 'card',
      title: 'Crear mi Tarjeta Digital',
      badge: 'Recomendado para Networking',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      timeEstimate: '2 minutos',
      description:
        'Tu identidad profesional en un enlace moderno. Incluye código QR dinámico, botón directo a WhatsApp y diseño Glassmorphism.',
      href: '/cards/new',
      ctaText: 'Diseñar mi Tarjeta',
      gradient: 'from-indigo-500/20 via-cyan-500/10 to-transparent',
      borderColor: 'hover:border-indigo-500/50',
      buttonBg: 'bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-zinc-950 font-bold shadow-lg shadow-indigo-500/25 hover:shadow-cyan-400/40 hover:brightness-110 active:scale-[0.98] transition-all',
      icon: QrCode,
      iconColor: 'text-cyan-400',
      highlights: ['Código QR listo para imprimir', 'Enlace directo a WhatsApp', 'Analíticas de visitas y clicks'],
    },
    {
      id: 'cv',
      title: 'Optimizar o Crear Smart CV',
      badge: 'Recomendado para Postulaciones',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      timeEstimate: '4 minutos',
      description:
        'Currículum inteligente calibrado para superar filtros ATS de Recursos Humanos. Genera formato A4 impecable para exportar a PDF.',
      href: '/cv',
      ctaText: 'Abrir Creador de CV',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'hover:border-emerald-500/50',
      buttonBg: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-zinc-950 font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:brightness-110 active:scale-[0.98] transition-all',
      icon: FileText,
      iconColor: 'text-emerald-400',
      highlights: ['Auditoría algorítmica ATS (0 a 100)', 'Plantilla imprimible A4', 'Sugerencias de impacto laboral'],
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Banner de Invitación de Referido si aplica */}
      {referralPartner?.valid && (
        <ReferralWelcomeBanner
          referralCode={referralPartner.referralCode}
          partnerName={referralPartner.partnerName}
          daysRemaining={daysRemaining}
        />
      )}

      {/* Banner de Estado VIP de Bienvenida */}
      <div className="mb-6 sm:mb-10 text-center flex flex-col items-center max-w-2xl mx-auto">
        {isSubscribed ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-4 shadow-lg shadow-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Membresía INDI {entitlement?.tier === 'starter' ? 'Plan Comunitario' : entitlement?.tier === 'max' ? 'Plan Max' : 'Plan Pro'} Activa
            </span>
          </div>
        ) : entitlement?.status === 'GRACE_PERIOD' ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-amber-500/40 text-xs font-semibold text-amber-300 mb-4 shadow-lg shadow-amber-500/10 bg-amber-950/40">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Período de Gracia: {daysRemaining} Días para renovar tu membresía</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-5 shadow-lg shadow-emerald-500/10 bg-emerald-950/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span>Membresía Comunitaria: Prueba Gratuita Activada de por Vida</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-400">
          ¿Por dónde te gustaría comenzar hoy?
        </h1>
        <p className="text-sm sm:text-base text-zinc-300/90 max-w-2xl mx-auto leading-relaxed font-normal">
          Elige tu primer proyecto para configurarlo en minutos. Tu Plan Comunitario Gratuito te da acceso a Tarjetas Digitales y Smart CV sin costo.
        </p>
      </div>

      {/* Grid de Selección: Horizontal Scroll en Móvil (Snap-X) + 2 Columnas en Escritorio */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 justify-center gap-5 sm:gap-6 w-full mb-6 sm:mb-10">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              className={`w-full group relative glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 ${opt.borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between overflow-hidden`}
            >
              {/* Iluminación de fondo en hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${opt.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />

              <div className="relative z-10">
                {/* Cabecera de la tarjeta */}
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${opt.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{opt.timeEstimate}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${opt.badgeColor} mb-2`}>
                    {opt.badge}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {opt.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                  {opt.description}
                </p>

                {/* Lista de beneficios */}
                <div className="space-y-2.5 pt-4 border-t border-white/5 mb-6 sm:mb-8">
                  {opt.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de Selección con Touch Target >= 48px */}
              <div className="relative z-10 pt-2">
                <Link
                  href={opt.href}
                  className={`w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm tracking-wide ${opt.buttonBg} hover:opacity-95 shadow-lg active:scale-[0.98] transition-all group-hover:gap-3 cursor-pointer`}
                >
                  <span>{opt.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navegación Rápida Alternativa (Válvula de Escape Rápida) */}
      <div className="w-full text-center pt-6 border-t border-white/5 max-w-xl mx-auto flex flex-col items-center justify-center">
        <p className="text-xs text-zinc-400 mb-3">
          ¿Ya conoces la suite o deseas revisar tus proyectos existentes?
        </p>
        <Link
          href="/dashboard"
          className="min-h-[44px] inline-flex items-center justify-center gap-2 text-xs font-semibold text-zinc-200 hover:text-white px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all shadow-sm active:scale-[0.98] text-zinc-300 hover:text-white"
        >
          <span>Ir directamente al Panel General (Dashboard)</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </Link>
      </div>
    </div>
  );
}
