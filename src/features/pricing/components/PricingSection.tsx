'use client';

import React from 'react';
import Link from 'next/link';
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
  Users,
  QrCode,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { PlanTier } from '@/entities/subscription/types';

interface PricingSectionProps {
  showTitle?: boolean;
  activeTier?: PlanTier | null;
}

export function PricingSection({ 
  showTitle = true,
  activeTier = null,
}: PricingSectionProps) {
  const { data: sessionData } = useSession();
  const isAuthenticated = !!sessionData?.user;

  const targetHref = isAuthenticated ? '/dashboard' : '/login?mode=signup&callbackUrl=/dashboard';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-emerald-400 mb-4 animate-fade-in border border-emerald-500/20 bg-emerald-950/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Membresía Comunitaria • Acceso 100% Gratuito</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Tu Presencia Profesional.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-300">
              Sin Costo. De por Vida.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Sin suscripciones forzadas, sin pedirte tarjeta de crédito y sin letras chicas. Obtén tu identidad digital completa lista para compartir hoy mismo.
          </p>
        </div>
      )}

      {/* Tarjeta Principal Destacada: Bento Panel Membresía Comunitaria */}
      <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-zinc-950/90 to-zinc-950/95 shadow-2xl shadow-emerald-950/40 mb-12">
        {/* Badge Flotante Superior */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-emerald-400 to-cyan-400 text-zinc-950 shadow-md">
            <ShieldCheck className="w-4 h-4 fill-current" />
            MEMBRESÍA ACTIVA PARA LA COMUNIDAD
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: Oferta y Promesa de Valor */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                  PLAN COMUNITARIO OFICIAL
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  0 CLP de por vida
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                Todo lo esencial para conectar con clientes y reclutadores
              </h3>

              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                Construido para profesionales, consultores, emprendedores y técnicos en Chile que necesitan una presencia impecable, sin burocracia ni barreras económicas.
              </p>

              {/* Lista de Capacidades Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>1 Tarjeta Digital</strong> con link único y QR oficial</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>1 Smart CV ATS</strong> en PDF vectorial A4</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Botón WhatsApp directo</strong> y contacto vCard 4.0</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Métricas en tiempo real</strong> de visitas y clics</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Cero marcas de agua</strong> invasivas ni publicidad</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Programa de Comunidad</strong> (+1 tarjeta cada 3 amigos)</span>
                </div>
              </div>
            </div>

            {/* CTA Principal de Conversión */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href={targetHref}
                className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-zinc-950" />
                <span>{isAuthenticated ? 'Ir a mi Panel de Control' : 'Comenzar Gratis (Sin Tarjeta)'}</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </Link>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No pedimos tarjeta. Listo en 2 minutos.</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjetas Visuales de las 2 Herramientas */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Box 1: Tarjeta Digital */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Tarjeta Digital Móvil</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold">
                  INCLUIDO
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tu perfil con botón directo a WhatsApp, ficha de contacto para guardar en la agenda del celular y código QR para eventos o reuniones presenciales.
              </p>
            </div>

            {/* Box 2: Smart CV ATS */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Smart CV ATS</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold">
                  INCLUIDO
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Currículum estructurado para pasar filtros de reclutamiento (Buk, Trabajando, Laborum) y descargable en PDF A4 vectorial de alta definición.
              </p>
            </div>

            {/* Box 3: Beneficio por Referidos */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-500/20 text-xs text-zinc-300 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-semibold">¿Necesitas más tarjetas?</strong>
                <span className="text-zinc-400">Invita a 3 amigos con tu enlace personal y desbloquea +1 tarjeta extra automáticamente.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tres Pilares de Confianza */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Sin Expiración Oculta</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tu tarjeta y currículum no caducarán a los pocos días. Tu enlace público permanece activo para tus clientes.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Cero Fricción al Compartir</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tus clientes no tienen que descargar apps ni registrarse para abrir tu tarjeta o guardar tu contacto.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <Share2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Crece con la Comunidad</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Comparte tu código de invitación para ampliar tu cuota y ganar reconocimiento como miembro pionero.
          </p>
        </div>
      </div>
    </div>
  );
}

