'use client';

import React, { useState } from 'react';
import { AdminAffiliatePayoutItem } from '@/entities/affiliate/schemas';
import { markAffiliateCommissionsAsPaidAction } from '../actions';
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
  Search
} from 'lucide-react';

interface AdminPayoutsViewProps {
  initialPayouts: AdminAffiliatePayoutItem[];
}

export function AdminPayoutsView({ initialPayouts }: AdminPayoutsViewProps) {
  const [payouts, setPayouts] = useState<AdminAffiliatePayoutItem[]>(initialPayouts);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleMarkAsPaid = async (affiliateId: string) => {
    if (!confirm('¿Confirmas que ya realizaste la transferencia bancaria a este afiliado?')) {
      return;
    }

    try {
      setProcessingId(affiliateId);
      const res = await markAffiliateCommissionsAsPaidAction(affiliateId);
      if (res.success) {
        setPayouts((prev) => prev.filter((p) => p.affiliateId !== affiliateId));
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

  const totalPayableOverall = payouts.reduce((acc, p) => acc + p.totalPayableClp, 0);

  const filteredPayouts = payouts.filter((p) =>
    p.affiliateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.affiliateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.bankAccount?.rut && p.bankAccount.rut.includes(searchTerm))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Resumen de liquidaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-zinc-400">Total a Transferir Hoy</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">
            {formatCLP(totalPayableOverall)}
          </p>
          <span className="text-[11px] text-zinc-500">Corte quincenal actual</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-zinc-400">Afiliados con Saldo</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">{payouts.length}</p>
          <span className="text-[11px] text-zinc-500">Listos para transferir</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-zinc-400">Frecuencia de Pago</span>
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-lg font-bold text-white mt-1">Días 1 y 15 de cada mes</p>
          <span className="text-[11px] text-cyan-300/80">Ciclo quincenal estándar</span>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Lista de Transferencias Bancarias Pendientes
        </h2>

        <div className="w-full sm:w-72">
          <div className="glass-panel rounded-xl px-3 py-2 border border-white/10 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por afiliado o RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Tabla o Tarjetas de liquidaciones */}
      {filteredPayouts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 text-zinc-400">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">¡Al Día con los Pagos!</h3>
          <p className="text-xs max-w-sm mx-auto text-zinc-400">
            No hay liquidaciones pendientes para este corte quincenal. Todas las comisiones han sido procesadas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayouts.map((p) => {
            const hasBank = !!p.bankAccount;
            const isProcessing = processingId === p.affiliateId;

            return (
              <div
                key={p.affiliateId}
                className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-emerald-500/30 transition-all"
              >
                {/* Datos del afiliado */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{p.affiliateName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {p.pendingCommissionsCount} {p.pendingCommissionsCount === 1 ? 'venta' : 'ventas'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{p.affiliateEmail}</p>
                </div>

                {/* Datos bancarios de transferencia */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-300 min-w-[280px]">
                  {hasBank ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-emerald-400 font-semibold">{p.bankAccount!.bankName}</strong>
                        <button
                          type="button"
                          onClick={() => copyBankDetails(p)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedAccount === p.affiliateId ? (
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
  );
}
