'use client';

import React, { useState, useRef } from 'react';
import { 
  AffiliateOverview, 
  formatReferralCode
} from '@/entities/affiliate/schemas';
import { getAppBaseUrl } from '@/entities/brand/domain';
import { 
  checkReferralCodeAvailabilityAction,
  updateReferralCodeAction 
} from '../actions';
import { 
  Users, 
  Check, 
  ShieldCheck, 
  Sparkles,
  FileCheck,
  Edit3,
  Loader2,
  AlertCircle,
  Share2,
  QrCode,
  Gift,
  Award,
  FileText,
  MessageCircle,
  Copy
} from 'lucide-react';
import { ReferralQrModal } from './ReferralQrModal';
import { AffiliateEarningsCalculator } from './AffiliateEarningsCalculator';

interface AffiliateDashboardTabProps {
  overview: AffiliateOverview;
  onRefresh?: () => void;
}

export function AffiliateDashboardTab({ overview, onRefresh }: AffiliateDashboardTabProps) {
  const [copiedDirect, setCopiedDirect] = useState(false);
  const [copiedHub, setCopiedHub] = useState(false);

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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const checkRequestCounterRef = useRef(0);

  const baseUrl = getAppBaseUrl();
  const directSignupUrl = `${baseUrl}/login?mode=signup&ref=${currentCode}`;
  const onboardingHubUrl = `${baseUrl}/start?ref=${currentCode}`;

  const extraCardsUnlocked = Math.floor(overview.totalReferralsCount / 3);
  const extraCvsUnlocked = Math.floor(overview.totalReferralsCount / 5);
  const nextCardProgress = 3 - (overview.totalReferralsCount % 3);

  const ambassadorRank = 
    overview.totalReferralsCount >= 10 
      ? { title: 'Embajador Oro', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' }
      : overview.totalReferralsCount >= 5
      ? { title: 'Embajador Plata', color: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/30' }
      : overview.totalReferralsCount >= 3
      ? { title: 'Miembro Activo', color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' }
      : { title: 'Miembro Inicial', color: 'text-zinc-400 bg-white/10 border-white/10' };

  const handleCopyDirect = () => {
    navigator.clipboard.writeText(directSignupUrl);
    setCopiedDirect(true);
    setTimeout(() => setCopiedDirect(false), 2500);
  };

  const handleCopyHub = () => {
    navigator.clipboard.writeText(onboardingHubUrl);
    setCopiedHub(true);
    setTimeout(() => setCopiedHub(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const shareText = `¡Hola! Te invito a crear gratis tu Tarjeta Digital con QR y tu Smart CV adaptado a filtros ATS en INDI (Plan Comunitario 100% gratuito de por vida): ${directSignupUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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

    const requestId = ++checkRequestCounterRef.current;
    setIsCheckingCode(true);
    try {
      const res = await checkReferralCodeAvailabilityAction(formatted);
      if (requestId !== checkRequestCounterRef.current) return;
      setCodeStatus({
        available: res.available,
        message: res.message,
        status: res.status,
      });
    } catch {
      if (requestId !== checkRequestCounterRef.current) return;
      setCodeStatus({ available: false, message: 'Error al comprobar', status: 'invalid' });
    } finally {
      if (requestId === checkRequestCounterRef.current) {
        setIsCheckingCode(false);
      }
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header explicativo */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Programa Comunitario de Crecimiento 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Recomienda INDI y Desbloquea Más Herramientas
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Tu enlace de invitación otorga el <strong>Plan Comunitario Gratuito de por vida</strong> (Tarjeta Digital + Smart CV ATS) a cada colega que invites. Por cada 3 colegas que se unan con tu link, desbloqueas automáticamente <strong>+1 Tarjeta Digital extra</strong>, y por cada 5 colegas desbloqueas <strong>+1 Smart CV adicional</strong> para potenciar tu presencia profesional sin costo.
          </p>
        </div>
      </div>

      {/* Tarjeta de Progreso de Hitos Comunitarios */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/25 bg-gradient-to-br from-emerald-950/20 via-zinc-950/40 to-teal-950/20 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>Tus Recompensas Comunitarias</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  Desbloqueos Activos
                </span>
              </h3>
              <p className="text-xs text-zinc-300">
                Gana capacidad extra sin costo compartiendo tu link con otros profesionales y emprendedores.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Total invitados:</span>
            <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-mono font-bold text-sm">
              {overview.totalReferralsCount}
            </span>
          </div>
        </div>

        {/* Barra y Nivel de Hitos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hito 1 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            overview.totalReferralsCount >= 3
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
              : 'bg-white/5 border-white/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400">Nivel 1 • 3 Invitados</span>
              {overview.totalReferralsCount >= 3 ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ¡Desbloqueado!
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400">
                  Faltan {Math.max(0, 3 - overview.totalReferralsCount)}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white mb-1">+1 Tarjeta Digital Extra</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Expande tu presencia a 2 tarjetas activas con código QR y enlace independiente.
            </p>
          </div>

          {/* Hito 2 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            overview.totalReferralsCount >= 5
              ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
              : 'bg-white/5 border-white/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">Nivel 2 • 5 Invitados</span>
              {overview.totalReferralsCount >= 5 ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ¡Desbloqueado!
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400">
                  Faltan {Math.max(0, 5 - overview.totalReferralsCount)}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white mb-1">+1 Smart CV ATS & Insignia Plata</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Desbloqueas una segunda versión de Smart CV ATS y el distintivo de Embajador Plata.
            </p>
          </div>

          {/* Hito 3 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            overview.totalReferralsCount >= 10
              ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/5'
              : 'bg-white/5 border-white/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-purple-400">Nivel 3 • 10 Invitados</span>
              {overview.totalReferralsCount >= 10 ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ¡Desbloqueado!
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400">
                  Faltan {Math.max(0, 10 - overview.totalReferralsCount)}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Embajador Comunitario & Cupos Ilimitados</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Distintivo dorado de Embajador oficial, soporte preferente y capacidad ilimitada para tus proyectos.
            </p>
          </div>
        </div>

        {/* Resumen del bucle de valor */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Bucle de Doble Cara:</strong> Tu invitado recibe el Plan Gratuito de por vida y tú ganas capacidad instantánea.</span>
          </div>
          <span className="text-zinc-500 font-mono text-[11px]">Cero costo para ambos</span>
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

        {/* Enlace Único de Referido: Registro Directo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 shadow-lg shadow-indigo-950/40">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold">
                Tu Enlace Oficial de Afiliado (Registro Directo)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                Alta Conversión
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-zinc-200 break-all select-all font-medium">
              {directSignupUrl}
            </p>
            <p className="text-[11px] text-zinc-400">
              Lleva a tus invitados directo al formulario de creación de cuenta con tu beneficio VIP pre-aplicado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-emerald-500/30"
              title="Compartir enlace de invitación por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl glass-pill text-cyan-300 hover:text-white hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-cyan-500/30"
              title="Generar y descargar código QR de afiliado"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Código QR</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditingCode(!isEditingCode);
                setCodeCandidate(currentCode);
                setCodeStatus({ available: true, message: '', status: 'idle' });
              }}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl glass-pill text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-white/10"
              title="Personalizar tu código de afiliado"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEditingCode ? 'Cancelar' : 'Personalizar'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyDirect}
              className={`min-h-[44px] min-w-[140px] px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                copiedDirect
                  ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white shadow-cyan-500/20'
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
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enlace Secundario: Onboarding Hub (/start?ref=CODIGO) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Enlace al Hub de Herramientas (Onboarding)
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-300 break-all select-all mt-0.5">
              {onboardingHubUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyHub}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            {copiedHub ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">¡Hub Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copiar Hub</span>
              </>
            )}
          </button>
        </div>

        {/* Modal de Código QR de Afiliado */}
        <ReferralQrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          referralCode={currentCode}
          directSignupUrl={directSignupUrl}
        />

        {/* Panel Desplegable para Personalizar Código (100% Responsivo en 390px) */}
        {isEditingCode && (
          <div className="pt-4 border-t border-cyan-500/20 animate-fade-in space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 flex items-center rounded-xl bg-zinc-900 border border-cyan-500/30 focus-within:border-cyan-400 overflow-hidden min-h-[44px]">
                <span className="pl-3.5 pr-1.5 text-zinc-400 font-mono text-xs select-none shrink-0">
                  <span className="hidden sm:inline">soyindi.cl/login?mode=signup&amp;ref=</span>
                  <span className="sm:hidden">?ref=</span>
                </span>
                <input
                  type="text"
                  value={codeCandidate}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="mi-nombre-o-marca"
                  maxLength={24}
                  aria-label="Nuevo código de referido personalizado"
                  className="flex-1 min-w-0 min-h-[44px] pr-2 py-2 bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none"
                />
                <div className="pr-3 flex items-center shrink-0">
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

      {/* Métricas Principales de Crecimiento Comunitario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase">Colegas en tu Red</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{overview.totalReferralsCount}</p>
          <span className="text-[11px] text-zinc-400">En Plan Comunitario Gratuito</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Tarjetas Extra</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-400">+{extraCardsUnlocked}</p>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              {1 + extraCardsUnlocked} total
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">+1 por cada 3 colegas</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-cyan-950/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">Smart CVs Extra</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-cyan-400">+{extraCvsUnlocked}</p>
            <span className="text-xs font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full">
              {1 + extraCvsUnlocked} total
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">+1 por cada 5 colegas</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase">Próximo Hito</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">
            {overview.totalReferralsCount >= 10 ? '¡Meta Máxima!' : `Faltan ${nextCardProgress}`}
          </p>
          <span className="text-[11px] text-zinc-400">
            {overview.totalReferralsCount >= 10 ? 'Cupos ilimitados activos' : `Para tarjeta #${2 + extraCardsUnlocked}`}
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase">Nivel Comunitario</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${ambassadorRank.color}`}>
              {ambassadorRank.title}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-2 block">Crecimiento orgánico</span>
        </div>
      </div>

      {/* Guía Visual: Cómo Funciona el Bucle Comunitario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Cómo Creces con la Comunidad INDI
              </h3>
              <p className="text-xs text-zinc-400">
                Un modelo 100% colaborativo donde compartir herramientas profesionales te premia con mayor capacidad.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center">
                1
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Comparte tu Enlace</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Envía tu link o muestra tu código QR a colegas, clientes y emprendedores de tu red.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ellos Crean Gratis</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Obtienen su Tarjeta Digital y Smart CV ATS sin costo, sin tarjetas de crédito ni suscripciones.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center">
                3
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Desbloqueas Capacidad</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Tus cupos se expanden automáticamente (+1 tarjeta cada 3 colegas, +1 CV cada 5 colegas).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="text-white font-bold">Cero solicitud de datos bancarios o tarjetas</p>
                <p className="text-zinc-400 text-[11px]">INDI es 100% gratuito. No te pediremos cuentas bancarias, cobros ni datos financieros.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compromiso de Gobernanza y Privacidad */}
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 text-xs text-zinc-300 leading-relaxed space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gobernanza del Programa</span>
            </div>
            <ul className="space-y-2.5 text-zinc-400 text-[11px]">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Plan 100% Gratuito:</strong> Ni tú ni tus invitados pagan nada por utilizar las herramientas de INDI.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cupos Permanentes:</strong> Las tarjetas y CVs extra que desbloquees se mantienen vinculados a tu cuenta de por vida.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cero Fricción Financiera:</strong> Sin datos bancarios, sin pasarelas de pago y sin letra chica.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Privacidad Garantizada:</strong> Cumplimiento estricto de la Ley N° 21.719 de Protección de Datos Personales en Chile.</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold mb-3 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Estado de tu Red</span>
            </h4>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-zinc-400 space-y-2">
              <p className="text-white font-medium">
                🎯 {overview.totalReferralsCount} {overview.totalReferralsCount === 1 ? 'colega conectado' : 'colegas conectados'}
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Tus beneficios comunitarios se reflejan de inmediato al crear o editar tus Tarjetas Digitales y Currículums ATS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulador Educativo de Ganancias de Afiliado (25% en Planes Starter, Pro y Max) */}
      <AffiliateEarningsCalculator />
    </div>
  );
}
