import React, { useState } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Percent,
  CalendarDays
} from 'lucide-react';
import { PRICING_TIERS, PlanTier } from '@/entities/subscription/types';
import { AFFILIATE_COMMISSION_PERCENTAGE } from '@/entities/affiliate/schemas';

const formatCLP = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function AffiliateEarningsCalculator() {
  const [selectedCycle, setSelectedCycle] = useState<'semiannual' | 'monthly'>('semiannual');
  const [starterCount, setStarterCount] = useState<number>(3);
  const [proCount, setProCount] = useState<number>(5);
  const [maxCount, setMaxCount] = useState<number>(2);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // Precios oficiales
  const starterPrice = PRICING_TIERS.starter[selectedCycle].priceClp;
  const proPrice = PRICING_TIERS.pro[selectedCycle].priceClp;
  const maxPrice = PRICING_TIERS.max[selectedCycle].priceClp;

  // Comisiones unitarias (25%)
  const starterCommission = Math.round(starterPrice * (AFFILIATE_COMMISSION_PERCENTAGE / 100));
  const proCommission = Math.round(proPrice * (AFFILIATE_COMMISSION_PERCENTAGE / 100));
  const maxCommission = Math.round(maxPrice * (AFFILIATE_COMMISSION_PERCENTAGE / 100));

  // Totales por plan
  const totalStarter = starterCount * starterCommission;
  const totalPro = proCount * proCommission;
  const totalMax = maxCount * maxCommission;

  // Total acumulado estimado
  const grandTotal = totalStarter + totalPro + totalMax;
  const totalSubscribers = starterCount + proCount + maxCount;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/25 bg-gradient-to-b from-emerald-950/20 via-zinc-950/40 to-indigo-950/20 shadow-xl space-y-6">
      {/* Encabezado del Simulador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <span>Simulador Educativo de Ganancias</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                25% CLP
              </span>
            </h3>
            <p className="text-xs text-zinc-300">
              Aprende cómo se calculan exactamente tus ingresos tanto en planes mensuales como semestrales.
            </p>
          </div>
        </div>

        {/* Selector de Ciclo (Semestral vs Mensual) */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 border border-white/10 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedCycle('semiannual')}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCycle === 'semiannual'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semestral (Mayor Comisión)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCycle('monthly')}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCycle === 'monthly'
                ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Mensual</span>
          </button>
        </div>
      </div>

      {/* Grid de Sliders por Plan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Starter Card */}
        <div className="p-4.5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-400">🟢 Starter</span>
              <p className="text-[11px] text-zinc-400">
                Cobro: {formatCLP(starterPrice)} {selectedCycle === 'semiannual' ? '/6 meses' : '/mes'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-300">
                +{formatCLP(starterCommission)}
              </span>
              <p className="text-[10px] text-zinc-500">por usuario</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label htmlFor="affiliate-starter-count" className="text-zinc-300 font-medium">Suscriptores:</label>
              <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
                {starterCount}
              </span>
            </div>
            <input
              id="affiliate-starter-count"
              type="range"
              min={0}
              max={30}
              value={starterCount}
              onChange={(e) => setStarterCount(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-baseline text-xs">
            <span className="text-zinc-400 text-[11px]">Subtotal Starter:</span>
            <span className="font-mono font-bold text-white text-sm">
              {formatCLP(totalStarter)}
            </span>
          </div>
        </div>

        {/* Pro Card */}
        <div className="p-4.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold rounded-bl-lg border-b border-l border-indigo-500/30 font-mono">
            RECOMENDADO
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-cyan-400">🔵 Pro</span>
              <p className="text-[11px] text-zinc-400">
                Cobro: {formatCLP(proPrice)} {selectedCycle === 'semiannual' ? '/6 meses' : '/mes'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyan-300">
                +{formatCLP(proCommission)}
              </span>
              <p className="text-[10px] text-zinc-500">por usuario</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label htmlFor="affiliate-pro-count" className="text-zinc-300 font-medium">Suscriptores:</label>
              <span className="font-mono font-bold text-white bg-indigo-500/20 px-2 py-0.5 rounded-md">
                {proCount}
              </span>
            </div>
            <input
              id="affiliate-pro-count"
              type="range"
              min={0}
              max={30}
              value={proCount}
              onChange={(e) => setProCount(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-baseline text-xs">
            <span className="text-zinc-400 text-[11px]">Subtotal Pro:</span>
            <span className="font-mono font-bold text-white text-sm">
              {formatCLP(totalPro)}
            </span>
          </div>
        </div>

        {/* Max Card */}
        <div className="p-4.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-purple-400">🟣 Max</span>
              <p className="text-[11px] text-zinc-400">
                Cobro: {formatCLP(maxPrice)} {selectedCycle === 'semiannual' ? '/6 meses' : '/mes'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-purple-300">
                +{formatCLP(maxCommission)}
              </span>
              <p className="text-[10px] text-zinc-500">por usuario</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label htmlFor="affiliate-max-count" className="text-zinc-300 font-medium">Suscriptores:</label>
              <span className="font-mono font-bold text-white bg-purple-500/20 px-2 py-0.5 rounded-md">
                {maxCount}
              </span>
            </div>
            <input
              id="affiliate-max-count"
              type="range"
              min={0}
              max={30}
              value={maxCount}
              onChange={(e) => setMaxCount(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-baseline text-xs">
            <span className="text-zinc-400 text-[11px]">Subtotal Max:</span>
            <span className="font-mono font-bold text-white text-sm">
              {formatCLP(totalMax)}
            </span>
          </div>
        </div>
      </div>

      {/* Caja de Resultado Consolidado */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-indigo-950/50 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Ganancia Estimada Simulada ({totalSubscribers} suscriptores)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Ciclo {selectedCycle === 'semiannual' ? 'Semestral' : 'Mensual'}
            </span>
          </div>
          <p className="text-xs text-zinc-300">
            Abonado directamente a tu Cuenta RUT o banco chileno cada 15 días (días 1 y 15).
          </p>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight text-emerald-400">
            {formatCLP(grandTotal)}
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            CLP Líquido
          </span>
        </div>
      </div>

      {/* Desglose Pedagógico y Educativo: Tabla Comparativa & Ejemplos Reales */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-between transition-all cursor-pointer border border-white/5"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Guía Pedagógica: ¿Cómo se calcula tu 25% y cuál es la diferencia entre planes?</span>
          </span>
          {showExplanation ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showExplanation && (
          <div className="mt-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10 text-xs text-zinc-300 space-y-5 animate-fade-in">
            {/* Tabla pedagógica de cálculo */}
            <div>
              <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold mb-2.5 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />
                <span>Matriz Exacta de Comisiones por Plan y Ciclo de Facturación</span>
              </h4>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 text-zinc-300 font-mono text-[11px] border-b border-white/10">
                      <th className="p-3">Plan</th>
                      <th className="p-3">Modalidad</th>
                      <th className="p-3">Precio Cobrado</th>
                      <th className="p-3">Fórmula del 25%</th>
                      <th className="p-3 text-emerald-400 font-bold">Tu Comisión Directa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-emerald-400">🟢 Starter</td>
                      <td className="p-3 text-zinc-400">Mensual</td>
                      <td className="p-3 font-mono">{formatCLP(2500)} / mes</td>
                      <td className="p-3 font-mono text-zinc-400">$2.500 × 0.25</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">+$625 CLP</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors bg-emerald-500/5">
                      <td className="p-3 font-semibold text-emerald-400">🟢 Starter</td>
                      <td className="p-3 text-emerald-300 font-medium">Semestral (6 meses)</td>
                      <td className="p-3 font-mono">{formatCLP(6000)} / 6 meses</td>
                      <td className="p-3 font-mono text-zinc-400">$6.000 × 0.25</td>
                      <td className="p-3 font-mono font-bold text-emerald-300">+$1.500 CLP</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-cyan-400">🔵 Pro (Recomendado)</td>
                      <td className="p-3 text-zinc-400">Mensual</td>
                      <td className="p-3 font-mono">{formatCLP(4990)} / mes</td>
                      <td className="p-3 font-mono text-zinc-400">$4.990 × 0.25</td>
                      <td className="p-3 font-mono font-bold text-cyan-400">+$1.248 CLP</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors bg-cyan-500/5">
                      <td className="p-3 font-semibold text-cyan-400">🔵 Pro (Recomendado)</td>
                      <td className="p-3 text-cyan-300 font-medium">Semestral (6 meses)</td>
                      <td className="p-3 font-mono">{formatCLP(15000)} / 6 meses</td>
                      <td className="p-3 font-mono text-zinc-400">$15.000 × 0.25</td>
                      <td className="p-3 font-mono font-bold text-cyan-300">+$3.750 CLP</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-purple-400">🟣 Max</td>
                      <td className="p-3 text-zinc-400">Mensual</td>
                      <td className="p-3 font-mono">{formatCLP(8990)} / mes</td>
                      <td className="p-3 font-mono text-zinc-400">$8.990 × 0.25</td>
                      <td className="p-3 font-mono font-bold text-purple-400">+$2.248 CLP</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors bg-purple-500/5">
                      <td className="p-3 font-semibold text-purple-400">🟣 Max</td>
                      <td className="p-3 text-purple-300 font-medium">Semestral (6 meses)</td>
                      <td className="p-3 font-mono">{formatCLP(29990)} / 6 meses</td>
                      <td className="p-3 font-mono text-zinc-400">$29.990 × 0.25</td>
                      <td className="p-3 font-mono font-bold text-purple-300">+$7.498 CLP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ejemplos Prácticos de Ingresos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ejemplo A: Enfoque Mensual Recurrente</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Si recomiendas INDI a <strong>10 colegas</strong> y contratan el <strong>Plan Pro Mensual ($4.990 CLP)</strong>, 
                  recibes <strong>$12.475 CLP</strong> cada mes mientras mantengan activa su cuenta. Si 5 de ellos eligen el <strong>Plan Starter ($2.500 CLP)</strong>, sumas <strong>$3.125 CLP</strong> adicionales cada 30 días.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Ejemplo B: Ventaja del Plan Semestral (Cashflow Inmediato)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Dado que los clientes ahorran hasta un 60% pagando 6 meses juntos, muchos eligen <strong>Pro Semestral ($15.000 CLP)</strong>. Con solo <strong>4 amigos</strong> que tomen este plan, ganas <strong>$15.000 CLP de inmediato</strong> en el próximo corte quincenal ($3.750 CLP por cada uno).
                </p>
              </div>
            </div>

            {/* FAQ rápida interna */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-zinc-300 space-y-1">
              <p className="font-semibold text-emerald-300">
                💡 Transparencia Total & Cero Letra Chica:
              </p>
              <p className="text-zinc-400">
                Las comisiones se liquidan automáticamente sobre el valor real pagado por el usuario en Flow.cl (Webpay/Cuenta RUT), Fintoc o Mercado Pago. Los cortes son los días <strong>1 y 15 de cada mes</strong> con transferencia directa a tu cuenta bancaria.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
