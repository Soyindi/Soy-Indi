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

interface OnboardingChoiceGridProps {
  daysRemaining: number;
}

export function OnboardingChoiceGrid({ daysRemaining }: OnboardingChoiceGridProps) {
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
      buttonBg: 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-indigo-500/20',
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
      buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20',
      icon: FileText,
      iconColor: 'text-emerald-400',
      highlights: ['Auditoría algorítmica ATS (0 a 100)', 'Plantilla imprimible A4', 'Sugerencias de impacto laboral'],
    },
    {
      id: 'presentation',
      title: 'Elaborar Presentación Cinemática',
      badge: 'Para Pitches & Clientes',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      timeEstimate: '3 minutos',
      description:
        'Diapositivas orbitales en formato 16:9 con efectos visuales y generación estructurada por Inteligencia Artificial.',
      href: '/presentations',
      ctaText: 'Crear Presentación',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'hover:border-amber-500/50',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20',
      icon: MonitorPlay,
      iconColor: 'text-amber-400',
      highlights: ['Generador de diapositivas con IA', 'Temas oscuros inmersivos 16:9', 'Proyección fluida en pantalla'],
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      {/* Banner de Estado VIP de Bienvenida */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-4 shadow-lg shadow-indigo-500/10">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>Prueba Gratuita Activada: {daysRemaining} Días de Acceso Total Ilimitado</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          ¿Por dónde te gustaría comenzar hoy?
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
          Elige tu primer proyecto para configurarlo en minutos. Recuerda que tu membresía Todo-en-Uno te da acceso sin límites a las 3 herramientas.
        </p>
      </div>

      {/* Grid de Selección en 3 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              className={`group relative glass-panel rounded-3xl p-7 border border-white/10 ${opt.borderColor} transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden shadow-xl`}
            >
              {/* Iluminación de fondo en hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${opt.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />

              <div className="relative z-10">
                {/* Cabecera de la tarjeta */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${opt.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{opt.timeEstimate}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${opt.badgeColor} mb-2.5`}>
                    {opt.badge}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {opt.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                  {opt.description}
                </p>

                {/* Lista de beneficios */}
                <div className="space-y-2.5 pt-4 border-t border-white/5 mb-8">
                  {opt.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de Selección */}
              <div className="relative z-10 pt-2">
                <Link
                  href={opt.href}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider ${opt.buttonBg} hover:opacity-95 shadow-lg transition-all group-hover:gap-3`}
                >
                  <span>{opt.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navegación Rápida Alternativa */}
      <div className="text-center pt-4 border-t border-white/5">
        <p className="text-xs text-zinc-500 mb-3">
          ¿Ya sabes cómo usar la plataforma o deseas ver tus proyectos creados?
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
        >
          <span>Ir directamente al Panel General (Dashboard)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
