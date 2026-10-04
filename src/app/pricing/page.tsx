import { PricingSection } from '@/features/pricing/components/PricingSection';
import { FaqAccordion } from '@/features/pricing/components/FaqAccordion';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Precios & Membresía | INDI — Plataforma SaaS 2026',
  description: '3 días de prueba gratis. Luego solo $2.500 CLP al mes o $6.000 cada 6 meses para desbloquear Tarjetas Digitales, Métricas, Smart CV y Presentaciones.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen py-16 relative overflow-hidden">
      {/* Luces volumétricas de fondo */}
      <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* Navegación de retorno */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors min-h-[44px] px-3 py-2 rounded-xl hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      {/* Sección Principal de Precios */}
      <PricingSection showTitle={true} />

      {/* Sección FAQ */}
      <div className="mt-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Preguntas Frecuentes
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Todo lo que necesitas saber sobre la membresía, los 3 días de prueba y los pagos.
          </p>
        </div>

        <FaqAccordion />
      </div>

      {/* Banner de Garantía Final */}
      <div className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <div className="glass-panel rounded-2xl p-6 border border-white/5 text-xs text-zinc-400 leading-relaxed">
          🔒 <strong>Cero Riesgo:</strong> Si dentro de tus primeros 3 días decides no continuar,
          no se realiza ningún cobro. Tu información permanece respaldada y protegida.
        </div>
      </div>
    </div>
  );
}
