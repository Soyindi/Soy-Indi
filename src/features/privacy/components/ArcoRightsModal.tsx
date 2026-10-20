'use client';

import React, { useState, useTransition } from 'react';
import { exportUserDataAction, deleteAndAnonymizeUserAccountAction } from '@/features/privacy/actions';
import { 
  X, 
  ShieldCheck, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  FileText, 
  RefreshCw, 
  Lock,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface ArcoRightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

type ArcoTab = 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion';

export function ArcoRightsModal({ isOpen, onClose, userEmail }: ArcoRightsModalProps) {
  const [activeTab, setActiveTab] = useState<ArcoTab>('acceso');
  const [isPendingExport, startExportTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Formulario de Rectificación
  const [rectificationField, setRectificationField] = useState('Nombre de Usuario');
  const [rectificationDetail, setRectificationDetail] = useState('');
  const [rectificationSuccess, setRectificationSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportData = () => {
    setExportMessage(null);
    startExportTransition(async () => {
      const res = await exportUserDataAction();
      if (res.success && res.data) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `indi-export-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportMessage('¡Copia descargada con éxito! Archivo JSON generado de forma segura.');
      } else {
        setExportMessage(res.error || 'No fue posible exportar los datos en este momento.');
      }
    });
  };

  const handleDeleteAccount = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const res = await deleteAndAnonymizeUserAccountAction(undefined, deleteConfirmation);
      if (res.success) {
        window.location.href = '/login?mode=signup&deleted=true';
      } else {
        setDeleteError(res.error || 'No se pudo eliminar la cuenta.');
      }
    });
  };

  const handleSendRectification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rectificationDetail.trim()) return;

    const subject = encodeURIComponent(`[ARCO - Rectificación] Solicitud de ${userEmail || 'Usuario'}`);
    const body = encodeURIComponent(
      `Estimado Oficial de Protección de Datos de INDI (Ley 21.719):\n\n` +
      `Por medio de la presente, solicito la rectificación formal de mis datos personales:\n\n` +
      `Campo a corregir: ${rectificationField}\n` +
      `Detalle de la corrección solicitada: ${rectificationDetail}\n` +
      `Correo registrado: ${userEmail || 'No especificado'}\n\n` +
      `Agradezco la confirmación y aplicación de esta rectificación conforme a la ley.`
    );

    window.open(`mailto:privacidad@soyindi.cl?subject=${subject}&body=${body}`, '_blank');
    setRectificationSuccess(true);
    setTimeout(() => setRectificationSuccess(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-zinc-900 border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-cyan-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Tus Derechos ARCO
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Ley N° 21.719
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Garantía legal de Acceso, Rectificación, Cancelación y Oposición.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Pestañas ARCO */}
        <div className="flex items-center gap-1.5 p-2 bg-zinc-950/80 border-b border-white/5 overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('acceso')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'acceso'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Acceso (Portabilidad)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rectificacion')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rectificacion'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rectificación</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelacion')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cancelacion'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Cancelación (Olvido)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('oposicion')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'oposicion'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Oposición</span>
          </button>
        </div>

        {/* Contenido Dinámico según Derecho Seleccionado */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* 1. DERECHO DE ACCESO Y PORTABILIDAD */}
          {activeTab === 'acceso' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Derecho de Acceso y Portabilidad (Artículo 5)</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Tienes el derecho legal de obtener una copia estructurada, completa y legible por máquina de todos tus datos personales, tarjetas digitales, currículums y registros almacenados en INDI.
                </p>
              </div>

              {exportMessage && (
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{exportMessage}</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="text-xs text-zinc-400 space-y-1">
                  <p className="font-semibold text-zinc-200">El archivo JSON incluye:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-400 text-[11px]">
                    <li>Perfil de usuario (Nombre, Correo, Identificador único).</li>
                    <li>Tarjetas digitales creadas con enlaces, configuraciones y telemetría.</li>
                    <li>Currículums Smart CV y puntajes ATS.</li>
                    <li>Registro histórico de consentimientos.</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={isPendingExport}
                  className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPendingExport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando archivo de exportación...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Descargar Copia Completa (JSON)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 2. DERECHO DE RECTIFICACIÓN */}
          {activeTab === 'rectificacion' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  <span>Derecho de Rectificación (Artículo 6)</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Si tu nombre, correo o cualquier dato registral en INDI es inexacto, desactualizado o incompleto, tienes derecho a su rectificación inmediata y sin costo.
                </p>
              </div>

              {rectificationSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Se ha generado tu solicitud de rectificación formal. Te contactaremos en menos de 48 horas hábiles.</span>
                </div>
              )}

              <form onSubmit={handleSendRectification} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Dato a Rectificar
                  </label>
                  <select
                    value={rectificationField}
                    onChange={(e) => setRectificationField(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  >
                    <option value="Nombre de Usuario">Nombre o Razón Social</option>
                    <option value="Correo Electrónico">Correo Electrónico Registrado</option>
                    <option value="Datos Profesionales">Datos de Perfil Profesional</option>
                    <option value="Otro">Otro dato registral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Detalle de la Corrección
                  </label>
                  <textarea
                    rows={3}
                    value={rectificationDetail}
                    onChange={(e) => setRectificationDetail(e.target.value)}
                    placeholder="Indica el dato actual y el nuevo dato correcto..."
                    required
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Enviar Solicitud Formal al DPO</span>
                </button>
              </form>
            </div>
          )}

          {/* 3. DERECHO DE CANCELACIÓN (OLVIDO) */}
          {activeTab === 'cancelacion' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Derecho de Cancelación / Supresión (Artículo 7)</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Puedes solicitar la eliminación irreversible y destructiva de tu cuenta, suprimiendo de forma inmediata todas tus tarjetas digitales, currículums, archivos multimedia y registros asociados.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-white">Esta acción no se puede deshacer.</p>
                    <p className="text-zinc-400 text-[11px]">
                      Tus URLs públicas (`/c/tu-slug` y `/cv/tu-slug`) quedarán liberadas inmediatamente.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                    Para confirmar la eliminación permanente, escribe exactamente:
                    <strong className="text-rose-400 ml-1">ELIMINAR MI CUENTA</strong>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="ELIMINAR MI CUENTA"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-950 border border-rose-500/30 text-white font-mono text-xs placeholder-zinc-700 focus:outline-none focus:border-rose-400 mb-2"
                  />

                  {deleteError && (
                    <p className="text-xs text-rose-400 mb-2 font-medium">{deleteError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'ELIMINAR MI CUENTA' || isPendingDelete}
                    className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30"
                  >
                    {isPendingDelete ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Eliminando cuenta y datos...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Confirmar Supresión Permanente</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. DERECHO DE OPOSICIÓN */}
          {activeTab === 'oposicion' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Derecho de Oposición (Artículo 8)</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Tienes el derecho a oponerte a que tus datos sean utilizados para fines distintos a la provisión estricta del servicio de tarjetas digitales y currículums.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 text-xs text-zinc-300 leading-relaxed">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Compromiso de Privacidad por Diseño de INDI:</span>
                  </div>
                  <ul className="space-y-1.5 text-zinc-400 text-[11px] list-disc list-inside">
                    <li><strong>Cero Venta de Datos:</strong> Nunca comercializamos ni cedemos tu información a brokers o empresas de publicidad.</li>
                    <li><strong>Sin Rastreadores Invasivos:</strong> Operamos sin cookies de terceros para publicidad comportamental.</li>
                    <li><strong>Tratamiento Exclusivo:</strong> Los datos se utilizan única y exclusivamente para renderizar tu perfil público y calcular tu compatibilidad ATS.</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-zinc-500">¿Dudas o requerimientos adicionales?</span>
                  <a
                    href="mailto:privacidad@soyindi.cl?subject=[ARCO%20-%20Oposición]%20Consulta%20General"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold text-xs"
                  >
                    <span>Contactar al DPO (privacidad@soyindi.cl)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie de Página del Modal */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span>Ley N° 21.719 de Protección de Datos Personales • Chile</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
