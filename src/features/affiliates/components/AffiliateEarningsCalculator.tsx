import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  QrCode,
  FileText,
  Award,
  Users,
  Gift,
  Infinity as InfinityIcon,
} from 'lucide-react';

export interface CommunityCapacityRewards {
  invitedColleagues: number;
  baseCards: number;
  extraCards: number;
  totalCards: number | 'unlimited';
  baseCvs: number;
  extraCvs: number;
  totalCvs: number | 'unlimited';
  isUnlimited: boolean;
  rankTitle: 'Miembro Inicial' | 'Miembro Activo' | 'Embajador Plata' | 'Embajador Oro';
  rankBadgeClass: string;
  nextMilestoneTarget: number | null;
  colleaguesToNextMilestone: number;
}

/**
 * Función pura determinista que replica en el cliente la Escalera de Recompensas Comunitarias
 * validada en el servidor por `assertQuotaAvailableAction` (`@/features/pricing/actions`).
 * - Base Plan Comunitario (Starter): 1 Tarjeta Digital + 1 Smart CV ATS.
 * - Nivel 1 (cada 3 invitados): +1 Tarjeta Digital extra.
 * - Nivel 2 (cada 5 invitados): +1 Smart CV ATS extra + rango Embajador Plata.
 * - Nivel 3 (10+ invitados): Cupos ilimitados ('unlimited') en Tarjetas y Smart CVs + rango Embajador Oro.
 */
export function calculateCommunityCapacityRewards(rawInvited: number): CommunityCapacityRewards {
  const invitedColleagues = Math.max(0, Math.floor(Number.isFinite(rawInvited) ? rawInvited : 0));
  const baseCards = 1;
  const baseCvs = 1;
  const isUnlimited = invitedColleagues >= 10;

  const extraCards = Math.floor(invitedColleagues / 3);
  const extraCvs = Math.floor(invitedColleagues / 5);

  const totalCards: number | 'unlimited' = isUnlimited ? 'unlimited' : baseCards + extraCards;
  const totalCvs: number | 'unlimited' = isUnlimited ? 'unlimited' : baseCvs + extraCvs;

  const rankTitle =
    invitedColleagues >= 10
      ? 'Embajador Oro'
      : invitedColleagues >= 5
      ? 'Embajador Plata'
      : invitedColleagues >= 3
      ? 'Miembro Activo'
      : 'Miembro Inicial';

  const rankBadgeClass =
    invitedColleagues >= 10
      ? 'text-amber-300 bg-amber-500/20 border-amber-500/30'
      : invitedColleagues >= 5
      ? 'text-cyan-300 bg-cyan-500/20 border-cyan-500/30'
      : invitedColleagues >= 3
      ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30'
      : 'text-zinc-300 bg-white/10 border-white/15';

  const nextMilestoneTarget =
    invitedColleagues < 3
      ? 3
      : invitedColleagues < 5
      ? 5
      : invitedColleagues < 10
      ? 10
      : null;

  const colleaguesToNextMilestone =
    nextMilestoneTarget !== null ? Math.max(0, nextMilestoneTarget - invitedColleagues) : 0;

  return {
    invitedColleagues,
    baseCards,
    extraCards,
    totalCards,
    baseCvs,
    extraCvs,
    totalCvs,
    isUnlimited,
    rankTitle,
    rankBadgeClass,
    nextMilestoneTarget,
    colleaguesToNextMilestone,
  };
}

interface AffiliateEarningsCalculatorProps {
  currentReferralsCount?: number;
}

export function AffiliateEarningsCalculator({
  currentReferralsCount = 0,
}: AffiliateEarningsCalculatorProps) {
  const initialCount = currentReferralsCount > 0 ? Math.min(15, currentReferralsCount) : 5;
  const [invitedCount, setInvitedCount] = useState<number>(initialCount);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  const rewards = calculateCommunityCapacityRewards(invitedCount);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/25 bg-gradient-to-b from-emerald-950/20 via-zinc-950/40 to-indigo-950/20 shadow-xl space-y-6">
      {/* Encabezado del Simulador de Cupos Gratuitos */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 flex-wrap">
              <span>Simulador Interactivo de Cupos Gratuitos</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                PLAN COMUNITARIO
              </span>
            </h3>
            <p className="text-xs text-zinc-300">
              Simula cuántas Tarjetas Digitales y Smart CVs ATS desbloqueas gratis al invitar colegas con tu enlace.
            </p>
          </div>
        </div>

        {/* Botones de Hitos Rápidos (Touch targets >= 44px) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-900/90 border border-white/10 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setInvitedCount(3)}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              invitedCount >= 3 && invitedCount < 5
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>3 Colegas (Nivel 1)</span>
          </button>
          <button
            type="button"
            onClick={() => setInvitedCount(5)}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              invitedCount >= 5 && invitedCount < 10
                ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>5 Colegas (Plata)</span>
          </button>
          <button
            type="button"
            onClick={() => setInvitedCount(10)}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              invitedCount >= 10
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>10 Colegas (Oro Ilimitado)</span>
          </button>
        </div>
      </div>

      {/* Control Deslizante Principal de Colegas Invitados */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label
            htmlFor="community-referrals-slider"
            className="text-xs sm:text-sm font-bold text-white flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Colegas que se unen gratis con tu enlace de invitación:</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-base text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-xl">
              {invitedCount} {invitedCount === 1 ? 'colega' : 'colegas'}
            </span>
            <span className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold border ${rewards.rankBadgeClass}`}>
              {rewards.rankTitle}
            </span>
          </div>
        </div>

        <input
          id="community-referrals-slider"
          type="range"
          min={0}
          max={15}
          value={invitedCount}
          onChange={(e) => setInvitedCount(parseInt(e.target.value, 10))}
          className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />

        <div className="flex justify-between text-[11px] font-mono text-zinc-400 pt-1">
          <span>0 (Base: 1 Tarjeta + 1 CV)</span>
          <span>3 (+1 Tarjeta)</span>
          <span>5 (+1 CV • Plata)</span>
          <span>10+ (Todo Ilimitado • Oro)</span>
        </div>
      </div>

      {/* Grid de Capacidad Desbloqueada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Tarjetas Digitales */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-emerald-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 block">Tarjetas Digitales</span>
                <span className="text-[11px] text-zinc-400">1 base + 1 cada 3 colegas</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              {rewards.isUnlimited ? '∞ Ilimitadas' : `+${rewards.extraCards} extra`}
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-baseline">
            <span className="text-zinc-400 text-xs">Capacidad total activa:</span>
            <span className="font-mono font-black text-white text-lg">
              {rewards.isUnlimited ? 'Ilimitadas' : `${rewards.totalCards} Tarjetas`}
            </span>
          </div>
        </div>

        {/* Card 2: Smart CVs ATS */}
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-cyan-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-400 block">Smart CVs ATS</span>
                <span className="text-[11px] text-zinc-400">1 base + 1 cada 5 colegas</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-1 rounded-lg border border-cyan-500/30">
              {rewards.isUnlimited ? '∞ Ilimitados' : `+${rewards.extraCvs} extra`}
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-baseline">
            <span className="text-zinc-400 text-xs">Versiones CV en tu cuenta:</span>
            <span className="font-mono font-black text-white text-lg">
              {rewards.isUnlimited ? 'Ilimitados' : `${rewards.totalCvs} Smart CVs`}
            </span>
          </div>
        </div>

        {/* Card 3: Impacto en tu Red */}
        <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-purple-300 block">Beneficio a tu Red</span>
                <span className="text-[11px] text-zinc-400">Plan Gratuito de por vida</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/15 px-2.5 py-1 rounded-lg border border-purple-500/30">
              100% Gratis
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-baseline">
            <span className="text-zinc-400 text-xs">Próximo desbloqueo:</span>
            <span className="font-mono font-bold text-white text-sm">
              {rewards.nextMilestoneTarget === null
                ? '¡Meta Máxima Oro!'
                : `En ${rewards.colleaguesToNextMilestone} ${
                    rewards.colleaguesToNextMilestone === 1 ? 'colega más' : 'colegas más'
                  }`}
            </span>
          </div>
        </div>
      </div>

      {/* Caja de Resultado Consolidado */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-indigo-950/50 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Capacidad Total Simulada ({invitedCount} {invitedCount === 1 ? 'invitado' : 'invitados'})
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Cero Costo • Permanente
            </span>
          </div>
          <p className="text-xs text-zinc-300">
            Se activa automáticamente en tu cuenta apenas tus invitados se registran, sin pedir tarjetas ni datos bancarios.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {rewards.isUnlimited ? (
            <div className="flex items-center gap-2 text-amber-300 font-mono font-black text-2xl sm:text-3xl">
              <InfinityIcon className="w-7 h-7 text-amber-400" />
              <span>Cupos Ilimitados</span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {rewards.totalCards} Tarjetas • {rewards.totalCvs} CVs
              </span>
              <span className="block text-[11px] text-zinc-400 font-medium">
                Disponibles de por vida en tu panel
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Guía Pedagógica Desplegable */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-between transition-all cursor-pointer border border-white/5"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Guía de la Escalera Comunitaria: ¿Cómo se desbloquean los cupos gratuitos?</span>
          </span>
          {showExplanation ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showExplanation && (
          <div className="mt-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10 text-xs text-zinc-300 space-y-5 animate-fade-in">
            <div>
              <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tabla Oficial de Hitos del Plan Comunitario Gratuito</span>
              </h4>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 text-zinc-300 font-mono text-[11px] border-b border-white/10">
                      <th className="p-3">Nivel Comunitario</th>
                      <th className="p-3">Colegas Invitados</th>
                      <th className="p-3">Tarjetas Digitales</th>
                      <th className="p-3">Smart CVs ATS</th>
                      <th className="p-3 text-emerald-400 font-bold">Beneficio Desbloqueado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-zinc-200">Miembro Inicial</td>
                      <td className="p-3 font-mono text-zinc-400">0 a 2 colegas</td>
                      <td className="p-3 font-mono">1 Tarjeta</td>
                      <td className="p-3 font-mono">1 Smart CV</td>
                      <td className="p-3 font-mono text-zinc-300">Plan Comunitario Base (Gratis)</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors bg-emerald-500/5">
                      <td className="p-3 font-semibold text-emerald-400">🟢 Nivel 1 • Activo</td>
                      <td className="p-3 font-mono text-emerald-300">3 a 4 colegas</td>
                      <td className="p-3 font-mono font-bold text-emerald-300">2 Tarjetas (+1)</td>
                      <td className="p-3 font-mono">1 Smart CV</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">+1 Tarjeta cada 3 invitados</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors bg-cyan-500/5">
                      <td className="p-3 font-semibold text-cyan-400">🔵 Nivel 2 • Embajador Plata</td>
                      <td className="p-3 font-mono text-cyan-300">5 a 9 colegas</td>
                      <td className="p-3 font-mono font-bold text-cyan-300">2 a 3 Tarjetas</td>
                      <td className="p-3 font-mono font-bold text-cyan-300">2 Smart CVs (+1)</td>
                      <td className="p-3 font-mono font-bold text-cyan-400">+1 Smart CV cada 5 invitados</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors bg-amber-500/5">
                      <td className="p-3 font-semibold text-amber-300">🟣 Nivel 3 • Embajador Oro</td>
                      <td className="p-3 font-mono text-amber-200">10 o más colegas</td>
                      <td className="p-3 font-mono font-bold text-amber-300">∞ Ilimitadas</td>
                      <td className="p-3 font-mono font-bold text-amber-300">∞ Ilimitados</td>
                      <td className="p-3 font-mono font-bold text-amber-300">Capacidad Total Sin Límites</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ejemplos Prácticos de Uso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ejemplo A: Emprendedor + Profesional Independiente</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Si necesitas una tarjeta para tu consulta profesional y otra para tu negocio, invita a <strong>3 colegas</strong> con tu enlace o código QR y desbloqueas tu <strong>segunda Tarjeta Digital gratis</strong> de inmediato.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Ejemplo B: Postulaciones a Distintos Cargos (ATS)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Al compartir INDI con <strong>5 colegas</strong> desbloqueas un <strong>segundo Smart CV ATS</strong> para adaptar tu currículum a diferentes rubros. Al llegar a <strong>10 colegas</strong>, tus tarjetas y CVs quedan <strong>100% ilimitados</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
