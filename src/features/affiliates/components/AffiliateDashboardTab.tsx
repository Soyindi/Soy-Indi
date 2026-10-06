'use client';

import React, { useState } from 'react';
import { 
  AffiliateOverview, 
  CHILEAN_BANKS, 
  ACCOUNT_TYPES, 
  formatChileanRut 
} from '@/entities/affiliate/schemas';
import { saveAffiliateBankAccountAction } from '../actions';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Link as LinkIcon, 
  Check, 
  Building2, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface AffiliateDashboardTabProps {
  overview: AffiliateOverview;
  onRefresh?: () => void;
}

export function AffiliateDashboardTab({ overview, onRefresh }: AffiliateDashboardTabProps) {
  const [copied, setCopied] = useState(false);
  const [bankName, setBankName] = useState(overview.bankAccount?.bankName || CHILEAN_BANKS[0]);
  const [accountType, setAccountType] = useState(overview.bankAccount?.accountType || ACCOUNT_TYPES[0]);
  const [accountNumber, setAccountNumber] = useState(overview.bankAccount?.accountNumber || '');
  const [rut, setRut] = useState(overview.bankAccount?.rut || '');
  const [holderName, setHolderName] = useState(overview.bankAccount?.holderName || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(overview.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const res = await saveAffiliateBankAccountAction({
        bankName: bankName as any,
        accountType: accountType as any,
        accountNumber,
        rut,
        holderName,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Error al guardar los datos bancarios.');
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado al conectar.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header explicativo */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gana el 25% de Comisión Recurrente</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Programa de Afiliados y Recompensas INDI
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Comparte tu enlace de recomendación. Cada vez que alguien se suscriba a INDI Pro ($2.500 o $6.000 CLP), 
            ganas el <strong>25% de comisión en pesos chilenos</strong>. Los pagos se transfieren automáticamente a tu cuenta cada 15 días.
          </p>
        </div>
      </div>

      {/* Tarjeta de Enlace Único */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 bg-cyan-950/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">
              Tu Enlace Único de Afiliado
            </span>
            <p className="text-sm font-mono text-white mt-1 break-all">
              {overview.referralUrl}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`min-h-[44px] min-w-[140px] px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:opacity-90 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase">Referidos Activos</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{overview.totalReferralsCount}</p>
          <span className="text-[11px] text-zinc-500">Usuarios registrados con tu link</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase">Por Cobrar (Próx. Corte)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400">{formatCLP(overview.pendingBalanceClp)}</p>
          <span className="text-[11px] text-amber-300/80">Comisiones acumuladas quincenales</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase">Total Pagado</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400">{formatCLP(overview.paidBalanceClp)}</p>
          <span className="text-[11px] text-zinc-500">Transferido históricamente</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase">Próximo Pago</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-white mt-1">{overview.nextPayoutDate}</p>
          <span className="text-[11px] text-zinc-500">Ciclo quincenal (Día 1 y 15)</span>
        </div>
      </div>

      {/* Formulario de Datos Bancarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Cuenta Bancaria de Abono Quincenal
              </h3>
              <p className="text-xs text-zinc-400">
                Los días 1 y 15 de cada mes transferiremos tus comisiones a estos datos.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBank} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Datos bancarios guardados exitosamente.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Institución Bancaria
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value as any)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                >
                  {CHILEAN_BANKS.map((b) => (
                    <option key={b} value={b} className="bg-zinc-900 text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Tipo de Cuenta
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-zinc-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  placeholder="Ej: 12345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs sm:text-sm placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  RUT del Titular (con guión)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 12.345.678-9"
                  value={rut}
                  onChange={(e) => setRut(formatChileanRut(e.target.value))}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs sm:text-sm placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                Nombre Completo del Titular
              </label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez Morales"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                required
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs sm:text-sm placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cuenta para Transferencias'}
              </button>
            </div>
          </form>
        </div>

        {/* Historial o Información de Política */}
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 text-xs text-zinc-300 leading-relaxed space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Reglas de Liquidación</span>
            </div>
            <ul className="space-y-2 list-disc list-inside text-zinc-400 text-[11px]">
              <li>Los cortes se ejecutan los días 1 y 15 de cada mes.</li>
              <li>Comisión del 25% garantizada por cada pago aprobado en Mercado Pago.</li>
              <li>Abono directo a Cuenta RUT o cualquier cuenta bancaria en Chile.</li>
              <li>Sin costo por transferencia.</li>
            </ul>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold mb-3 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Últimos Movimientos</span>
            </h4>

            {overview.recentCommissions.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4 text-center">
                Aún no registras comisiones. ¡Comparte tu link para empezar!
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {overview.recentCommissions.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{formatCLP(c.amountClp)}</p>
                      <span className="text-[10px] text-zinc-400">
                        {c.createdAt.toLocaleDateString('es-CL')}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {c.status === 'paid' ? 'Pagado' : 'Por Liquidar'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
