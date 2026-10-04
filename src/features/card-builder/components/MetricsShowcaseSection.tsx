'use client';

import React from 'react';
import Link from 'next/link';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  UserCheck,
  QrCode,
  MapPin,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

export function MetricsShowcaseSection() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 scroll-mt-24">
      {/* Encabezado de la Sección */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-mono text-cyan-300 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>TELEMETRÍA EN VIVO Y CONTROL TOTAL</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          No más tarjetas a ciegas.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300">
            Descubre el impacto real de cada cliente.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
          Con las tarjetas de papel tradicionales, nunca sabes si terminaron en la basura o en un cajón olvidado. 
          Con INDI, tienes un panel de estadísticas en tiempo real que te muestra exactamente quién te visita, quién te agenda y quién te escribe por WhatsApp.
        </p>
      </div>

      {/* Grid Bento de KPIs de Telemetría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* KPI 1: Visitas Totales */}
        <div className="glass-panel rounded-3xl p-6 border border-cyan-500/25 relative overflow-hidden flex flex-col justify-between group hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Lecturas en el Edge
            </span>
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">1.428</div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Personas que abrieron tu tarjeta desde tu link en redes o escaneando tu código QR.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+38% vs. mes anterior</span>
          </div>
        </div>

        {/* KPI 2: Clics a WhatsApp */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-500/25 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
              Chats de WhatsApp
            </span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">384</div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Clientes que presionaron el botón para escribirte directamente con mensaje pre-redactado.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Conversación inmediata</span>
          </div>
        </div>

        {/* KPI 3: Contactos Guardados One-Tap */}
        <div className="glass-panel rounded-3xl p-6 border border-indigo-500/25 relative overflow-hidden flex flex-col justify-between group hover:border-indigo-400/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
              vCard en Agenda
            </span>
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">296</div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Personas que descargaron y guardaron tu contacto con foto, correo y dirección en 1 toque.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-indigo-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sin tipear números a mano</span>
          </div>
        </div>

        {/* KPI 4: Tasa de Conversión */}
        <div className="glass-panel rounded-3xl p-6 border border-purple-500/25 relative overflow-hidden flex flex-col justify-between group hover:border-purple-400/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
              Efectividad Real
            </span>
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">26.9%</div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Porcentaje de visitantes que realizaron una acción comercial concreta (contacto o chat).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-purple-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4x superior a folletos</span>
          </div>
        </div>
      </div>

      {/* Tarjeta Destacada: ¿Qué más hace única a tu presencia con INDI? */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-2">
            MÁS ALLÁ DEL PAPEL
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            4 ventajas que ninguna tarjeta impresa te puede dar
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ventaja 1 */}
          <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Guardar en 1 Toque</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tu cliente no tiene que tipear tus 9 dígitos. Toca <em>&quot;Guardar Contacto&quot;</em> y se añade a su agenda con foto, correo y WhatsApp listo.
            </p>
          </div>

          {/* Ventaja 2 */}
          <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Mapa y Cómo Llegar</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Muestra tu oficina, consulta o local con mapa interactivo y botones directos a <strong>Waze</strong> y <strong>Google Maps</strong> para que nadie se pierda.
            </p>
          </div>

          {/* Ventaja 3 */}
          <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Cero Descargas</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tus clientes no tienen que descargar ninguna app pesada ni registrarse. Tu tarjeta abre en 0.2 segundos en cualquier celular.
            </p>
          </div>

          {/* Ventaja 4 */}
          <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Actualizaciones Vivas</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              ¿Cambiaste de número o dirección? Editas en 10 segundos desde tu celular y todas las tarjetas que ya diste quedan actualizadas al instante.
            </p>
          </div>
        </div>

        {/* CTA integrado con touch target >= 44px */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 text-center sm:text-left">
            Empieza a medir tus resultados hoy mismo con los <strong>3 días de prueba gratis</strong>.
          </p>
          <Link
            href="/start"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Probar con Métricas en Vivo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
