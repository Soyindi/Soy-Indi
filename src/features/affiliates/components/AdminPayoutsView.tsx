import React, { useState } from 'react';
import { AdminAffiliatePayoutItem, AdminReferralAuditItem } from '@/entities/affiliate/schemas';
import { markAffiliateCommissionsAsPaidAction, getAdminDashboardDataAction } from '../actions';
import { 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Send, 
  AlertCircle, 
  Copy, 
  Check, 
  Search,
  Sparkles,
  Clock,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardViewProps {
  initialPayouts: AdminAffiliatePayoutItem[];
  initialReferralsAudit: AdminReferralAuditItem[];
}

export function AdminPayoutsView({
  initialPayouts,
  initialReferralsAudit = [],
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'payouts'>('audit');
  const [payouts, setPayouts] = useState<AdminAffiliatePayoutItem[]>(initialPayouts);
  const [referrals, setReferrals] = useState<AdminReferralAuditItem[]>(initialReferralsAudit);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      setFeedbackMessage(null);
      const res = await getAdminDashboardDataAction();
      if (res.success) {
        setPayouts(res.payouts);
        setReferrals(res.referralsAudit);
        setLastRefreshedAt(new Date());
        setFeedbackMessage('Datos sincronizados en tiempo real.');
        setTimeout(() => setFeedbackMessage(null), 3000);
      } else {
        setFeedbackMessage(res.error || 'Error al actualizar datos.');
      }
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Error de conexión.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAsPaid = async (affiliateId: string) => {
    if (!confirm('¿Confirmas que ya realizaste la transferencia bancaria a este afiliado?')) {
      return;
    }

    try {
      setProcessingId(affiliateId);
      const res = await markAffiliateCommissionsAsPaidAction(affiliateId);
      if (res.success) {
        await handleRefreshData();
      } else {
        alert(res.error || 'Error al procesar la liquidación.');
      }
    } catch (err: any) {
      alert(err.message || 'Error inesperado.');
    } finally {
      setProcessingId(null);
    }
  };

  const copyBankDetails = (p: AdminAffiliatePayoutItem) => {
    if (!p.bankAccount) return;
    const details = `Nombre: ${p.bankAccount.holderName}\nRUT: ${p.bankAccount.rut}\nBanco: ${p.bankAccount.bankName}\nTipo: ${p.bankAccount.accountType}\nCuenta: ${p.bankAccount.accountNumber}\nMonto: ${formatCLP(p.totalPayableClp)}`;
    navigator.clipboard.writeText(details);
    setCopiedAccount(p.affiliateId);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const filteredPayouts = payouts.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.affiliateName.toLowerCase().includes(q) ||
      p.affiliateEmail.toLowerCase().includes(q) ||
      p.bankAccount?.bankName.toLowerCase().includes(q) ||
      p.bankAccount?.rut.toLowerCase().includes(q)
    );
  });

  const filteredReferrals = referrals.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.referredUserName.toLowerCase().includes(q) ||
      r.referredUserEmail.toLowerCase().includes(q) ||
      r.referrerName.toLowerCase().includes(q) ||
      r.referrerCode.toLowerCase().includes(q)
    );
  });

  // Métricas consolidadas
  const totalPayableClp = payouts.reduce((acc, curr) => acc + curr.totalPayableClp, 0);
  const totalReferredUsers = referrals.length;
  const activeProCount = referrals.filter((r) => r.referredUserStatus === 'ACTIVE').length;
  const trialCount = referrals.filter((r) => r.referredUserStatus === 'TRIAL').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Selector de Pestañas de Administración */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('audit');
              setSearchTerm('');
            }}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/20'
                : 'glass-pill text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Auditoría de Referidos ({totalReferredUsers})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('payouts');
              setSearchTerm('');
            }}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'glass-pill text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Liquidaciones Quincenales ({payouts.length})</span>
          </button>
        </div>

        {/* Barra de Búsqueda y Botón de Sincronización */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'audit' ? 'Buscar usuario, email o anfitrión...' : 'Buscar afiliado o banco...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="button"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Sincronizar datos en tiempo real desde la base de datos"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Notificación de Estado / Feedback de Sincronización */}
      {feedbackMessage && (
        <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{feedbackMessage}</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {lastRefreshedAt.toLocaleTimeString('es-CL')}
          </span>
        </div>
      )}

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-400 uppercase">Referidos Registrados</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalReferredUsers}</p>
          <span className="text-[11px] text-zinc-500">{trialCount} en prueba • {activeProCount} Pro</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Convertidos a Pro</span>
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{activeProCount}</p>
          <span className="text-[11px] text-zinc-400">
            {totalReferredUsers > 0 ? Math.round((activeProCount / totalReferredUsers) * 100) : 0}% tasa de conversión
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-400 uppercase">Afiliados por Liquidar</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{payouts.length}</p>
          <span className="text-[11px] text-zinc-500">Corte días 1 y 15</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-400 uppercase">Total Pendiente</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{formatCLP(totalPayableClp)}</p>
          <span className="text-[11px] text-zinc-500">Comisiones 25% por abonar</span>
        </div>
      </div>

      {/* PESTAÑA 1: AUDITORÍA DE REFERIDOS EN TIEMPO REAL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Registros con Atribución de Referido ({filteredReferrals.length})
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Actualización en vivo vía Turso LibSQL
            </span>
          </div>

          {filteredReferrals.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
              <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No hay registros para mostrar</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Los nuevos usuarios que se registren mediante enlaces de referidos aparecerán aquí en tiempo real.
              </p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Usuario Registrado</th>
                      <th className="py-3 px-4">Referido Por (Anfitrión)</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Fecha de Registro</th>
                      <th className="py-3 px-4 text-right">Comisiones Aportadas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredReferrals.map((ref) => {
                      const isPro = ref.referredUserStatus === 'ACTIVE';
                      return (
                        <tr key={ref.referredUserId} className="hover:bg-white/[0.02] transition-colors">
                          {/* Usuario Invitado */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{ref.referredUserName}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{ref.referredUserEmail}</div>
                          </td>

                          {/* Anfitrión / Código y Datos Bancarios */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-cyan-300 flex items-center gap-1.5">
                              <span>@{ref.referrerCode}</span>
                            </div>
                            <div className="text-[11px] text-zinc-400">{ref.referrerName}</div>
                            
                            {/* Estado y detalle de cuenta bancaria */}
                            <div className="mt-1 pt-1 border-t border-white/5">
                              {ref.referrerBankAccount ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-300">
                                  <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span className="truncate max-w-[180px]">
                                    {ref.referrerBankAccount.bankName} • {ref.referrerBankAccount.accountType}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const b = ref.referrerBankAccount!;
                                      const text = `Titular: ${b.holderName}\nRUT: ${b.rut}\nBanco: ${b.bankName}\nTipo: ${b.accountType}\nCuenta: ${b.accountNumber}`;
                                      navigator.clipboard.writeText(text);
                                      setCopiedAccount(ref.referrerId);
                                      setTimeout(() => setCopiedAccount(null), 2500);
                                    }}
                                    className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer ml-auto"
                                    title="Copiar datos bancarios del anfitrión"
                                  >
                                    {copiedAccount === ref.referrerId ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-amber-500/70" />
                                  <span>Sin datos bancarios</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Estado Membresía */}
                          <td className="py-3.5 px-4">
                            {isPro ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Sparkles className="w-3 h-3" />
                                <span>Plan Pro Activo</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Clock className="w-3 h-3" />
                                <span>Prueba Gratuita (Trial)</span>
                              </span>
                            )}
                          </td>

                          {/* Fecha */}
                          <td className="py-3.5 px-4 font-mono text-zinc-400">
                            {ref.registeredAt.toLocaleDateString('es-CL', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Comisiones Aportadas */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold">
                            {ref.totalCommissionsGeneratedClp > 0 ? (
                              <span className="text-emerald-400">
                                {formatCLP(ref.totalCommissionsGeneratedClp)}
                              </span>
                            ) : (
                              <span className="text-zinc-500">$0 CLP</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: LIQUIDACIONES BANCARIAS QUINCENALES */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Afiliados con Saldo Acumulado por Cobrar ({filteredPayouts.length})
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Día 1 y 15 de cada mes
            </span>
          </div>

          {filteredPayouts.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-white mb-1">
                Todas las comisiones están al día
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No hay liquidaciones pendientes de pago en este ciclo quincenal.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPayouts.map((p) => {
                const hasBank = !!p.bankAccount;
                const isProcessing = processingId === p.affiliateId;
                const isCopied = copiedAccount === p.affiliateId;

                return (
                  <div
                    key={p.affiliateId}
                    className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-cyan-500/30 transition-all"
                  >
                    {/* Datos del Afiliado */}
                    <div className="space-y-1.5 min-w-[240px]">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{p.affiliateName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                          {p.pendingCommissionsCount} comisiones
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">{p.affiliateEmail}</p>
                    </div>

                    {/* Datos Bancarios para Transferencia */}
                    <div className="flex-1 lg:px-6 lg:border-x lg:border-white/10 text-xs">
                      {hasBank ? (
                        <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{p.bankAccount!.bankName}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => copyBankDetails(p)}
                              className="text-[11px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer min-h-[32px] px-2"
                              title="Copiar datos para transferir"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar datos</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-zinc-300 font-mono">
                            {p.bankAccount!.accountType} • {p.bankAccount!.accountNumber}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            RUT: {p.bankAccount!.rut} ({p.bankAccount!.holderName})
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-300 py-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>El afiliado aún no ingresa sus datos bancarios</span>
                        </div>
                      )}
                    </div>

                    {/* Monto y Botón de Acción */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">A Pagar</span>
                        <p className="text-xl sm:text-2xl font-black text-emerald-400">
                          {formatCLP(p.totalPayableClp)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMarkAsPaid(p.affiliateId)}
                        disabled={isProcessing || !hasBank}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isProcessing ? 'Registrando...' : 'Marcar como Pagado'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
