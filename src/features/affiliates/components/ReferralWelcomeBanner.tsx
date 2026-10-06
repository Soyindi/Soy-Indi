'use client';

import React from 'react';
import { Sparkles, Gift, CheckCircle2 } from 'lucide-react';

interface ReferralWelcomeBannerProps {
  referralCode: string;
  partnerName?: string;
  daysRemaining?: number;
}

/**
 * Banner de bienvenida contextual para usuarios que acceden mediante un enlace de referido.
 * Cumple con:
 * - Retícula Base 8 (padding, margins, touch targets)
 * - WCAG 2.2 AA Contrast ratio >= 4.5:1
 * - Glassmorphism 2.0 y paleta corporativa OKLCH
 */
export function ReferralWelcomeBanner({
  referralCode,
  partnerName,
  daysRemaining = 3,
}: ReferralWelcomeBannerProps) {
  const inviterText = partnerName
    ? `Invitado por ${partnerName}`
    : `Invitación de @${referralCode}`;

  return (
    <div
      role="region"
      aria-label="Invitación de referido activa"
      className="w-full max-w-2xl mx-auto mb-6 p-4 sm:p-5 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/20 shadow-xl shadow-emerald-500/5 relative overflow-hidden animate-fade-in"
    >
      {/* Resplandor sutil de fondo */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{inviterText}</span>
              </span>
              <span className="text-xs font-semibold text-white">
                Acceso VIP Concedido
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Disfruta de <strong className="text-white font-semibold">{daysRemaining} días de prueba gratuita</strong> con acceso ilimitado a Tarjetas Digitales, Smart CV y Presentaciones con IA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 shrink-0 self-end sm:self-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Beneficio Aplicado</span>
        </div>
      </div>
    </div>
  );
}
