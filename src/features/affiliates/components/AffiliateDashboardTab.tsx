'use client';

import React, { useState } from 'react';
import { 
  AffiliateOverview, 
  CHILEAN_BANKS, 
  ACCOUNT_TYPES, 
  formatChileanRut,
  formatReferralCode
} from '@/entities/affiliate/schemas';
import { 
  saveAffiliateBankAccountAction, 
  checkReferralCodeAvailabilityAction,
  updateReferralCodeAction 
} from '../actions';
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
  FileCheck,
  Edit3,
  Loader2,
  AlertCircle,
  Share2
} from 'lucide-react';

interface AffiliateDashboardTabProps {
  overview: AffiliateOverview;
  onRefresh?: () => void;
}

export function AffiliateDashboardTab({ overview, onRefresh }: AffiliateDashboardTabProps) {
  const [copied, setCopied] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);
  const [bankName, setBankName] = useState(overview.bankAccount?.bankName || CHILEAN_BANKS[0]);
  const [accountType, setAccountType] = useState(overview.bankAccount?.accountType || ACCOUNT_TYPES[0]);
  const [accountNumber, setAccountNumber] = useState(overview.bankAccount?.accountNumber || '');
  const [rut, setRut] = useState(overview.bankAccount?.rut || '');
  const [holderName, setHolderName] = useState(overview.bankAccount?.holderName || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado para Personalización del Código de Referido
  const [currentCode, setCurrentCode] = useState(overview.referralCode);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [codeCandidate, setCodeCandidate] = useState(overview.referralCode);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeStatus, setCodeStatus] = useState<{
    available: boolean;
    message: string;
    status: 'idle' | 'available' | 'taken' | 'reserved' | 'invalid';
  }>({ available: true, message: '', status: 'idle' });
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [codeSuccessMessage, setCodeSuccessMessage] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://soyindi.cl');
  const referralUrl = `${baseUrl}/start?ref=${currentCode}`;
  const directSignupUrl = `${baseUrl}/login?mode=signup&ref=${currentCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyDirect = () => {
    navigator.clipboard.writeText(directSignupUrl);
    setCopiedDirect(true);
    setTimeout(() => setCopiedDirect(false), 2500);
  };

  const handleCodeChange = async (val: string) => {
    const formatted = formatReferralCode(val);
    setCodeCandidate(formatted);
    setCodeSuccessMessage(null);

    if (formatted === currentCode) {
      setCodeStatus({ available: true, message: 'Tu código actual', status: 'idle' });
      return;
    }

    if (formatted.length < 3) {
      setCodeStatus({ available: false, message: 'Mínimo 3 caracteres', status: 'invalid' });
      return;
    }

    setIsCheckingCode(true);
    try {
      const res = await checkReferralCodeAvailabilityAction(formatted);
      setCodeStatus({
        available: res.available,
        message: res.message,
        status: res.status,
      });
    } catch {
      setCodeStatus({ available: false, message: 'Error al comprobar', status: 'invalid' });
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleSaveCode = async () => {
    if (!codeStatus.available || codeCandidate === currentCode) {
      setIsEditingCode(false);
      return;
    }

    setIsSavingCode(true);
    try {
      const res = await updateReferralCodeAction(codeCandidate);
      if (res.success && res.referralCode) {
        setCurrentCode(res.referralCode);
        setIsEditingCode(false);
        setCodeSuccessMessage('¡Código de afiliado actualizado con éxito!');
        setTimeout(() => setCodeSuccessMessage(null), 3500);
        if (onRefresh) onRefresh();
      } else {
        alert(res.error || 'No se pudo actualizar el código.');
      }
    } catch (err: any) {
      alert(err.message || 'Error inesperado.');
    } finally {
      setIsSavingCode(false);
    }
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

      {/* Tarjeta de Enlace Único y Personalización de Código */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 bg-cyan-950/20 space-y-4">
        {codeSuccessMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{codeSuccessMessage}</span>
          </div>
        )}

        {/* Enlace 1: Onboarding Hub */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                1. Enlace al Onboarding Hub (Muestra la suite completa)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                Recomendado
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-zinc-300 break-all select-all">
              {referralUrl}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className={`min-h-[44px] min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
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
                  <span>Copiar Hub</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enlace 2: Registro Directo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold">
                2. Enlace Directo al Formulario de Registro (Conversión Rápida)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
                Alta Conversión
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-zinc-300 break-all select-all">
              {directSignupUrl}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsEditingCode(!isEditingCode);
                setCodeCandidate(currentCode);
                setCodeStatus({ available: true, message: '', status: 'idle' });
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl glass-pill text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-white/10"
              title="Personalizar tu código de afiliado"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEditingCode ? 'Cancelar' : 'Personalizar'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyDirect}
              className={`min-h-[44px] min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedDirect
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:opacity-90 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {copiedDirect ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Copiar Registro</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panel Desplegable para Personalizar Código */}
        {isEditingCode && (
          <div className="pt-4 border-t border-cyan-500/20 animate-fade-in space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 font-mono text-xs">
                  soyindi.cl/start?ref=
                </div>
                <input
                  type="text"
                  value={codeCandidate}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="mi-nombre-o-marca"
                  maxLength={24}
                  className="w-full min-h-[44px] pl-36 pr-10 py-2 rounded-xl bg-zinc-900 border border-cyan-500/30 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isCheckingCode && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                  {!isCheckingCode && codeStatus.status === 'available' && (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                  {!isCheckingCode && (codeStatus.status === 'taken' || codeStatus.status === 'reserved' || codeStatus.status === 'invalid') && (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveCode}
                disabled={isSavingCode || !codeStatus.available || codeCandidate === currentCode || codeCandidate.length < 3}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
              >
                {isSavingCode ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Nuevo Código</span>
                )}
              </button>
            </div>

            {/* Ayuda o Estado del Código */}
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className={
                codeStatus.status === 'available'
                  ? 'text-emerald-400 font-medium'
                  : codeStatus.status === 'taken' || codeStatus.status === 'reserved' || codeStatus.status === 'invalid'
                  ? 'text-rose-400 font-medium'
                  : 'text-zinc-400'
              }>
                {codeStatus.message || 'Elige un código memorable con letras minúsculas, números y guiones.'}
              </span>
              <span className="text-zinc-500 font-mono">
                {codeCandidate.length}/24 caracteres
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Métricas Principales en Tiempo Real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase">Registros Totales</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{overview.totalReferralsCount}</p>
          <span className="text-[11px] text-zinc-500">{overview.trialReferralsCount} en prueba gratuita</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Convertidos a Pro</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-400">{overview.proReferralsCount}</p>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              {overview.conversionRate}% conv.
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">Suscriptores activos pagando</span>
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
