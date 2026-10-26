'use client';

import React, { useState, useTransition } from 'react';
import { exportUserDataAction, deleteAndAnonymizeUserAccountAction } from '@/features/privacy/actions';
import { DATA_SUBPROCESSORS_REGISTRY } from '@/shared/lib/dataPrivacy';
import { signOut } from '@/shared/lib/auth-client';
import { ShieldCheck, Download, Trash2, AlertTriangle, ExternalLink, CheckCircle2, Search } from 'lucide-react';

interface PrivacySettingsTabProps {
  userEmail?: string;
  searchQuery?: string;
  onOpenArcoModal?: () => void;
}

export function PrivacySettingsTab({ userEmail, searchQuery = '', onOpenArcoModal }: PrivacySettingsTabProps) {
  const [isPendingExport, startExportTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSubprocessors = normalizedQuery
    ? DATA_SUBPROCESSORS_REGISTRY.filter(
        (sub) =>
          sub.name.toLowerCase().includes(normalizedQuery) ||
          sub.purpose.toLowerCase().includes(normalizedQuery) ||
          sub.location.toLowerCase().includes(normalizedQuery) ||
          sub.dpaStatus.toLowerCase().includes(normalizedQuery)
      )
    : DATA_SUBPROCESSORS_REGISTRY;

  const handleExportData = () => {
    setExportMessage(null);
    startExportTransition(async () => {
      const res = await exportUserDataAction();
      if (res.success && res.data) {
        // Descargar archivo JSON al navegador de forma segura
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `indi-export-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportSuccess(true);
        setExportMessage('Tus datos han sido exportados exitosamente en formato JSON.');
      } else {
        setExportSuccess(false);
        setExportMessage(res.error || 'No fue posible exportar los datos en este momento.');
      }
    });
  };

  const handleDeleteAccount = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const res = await deleteAndAnonymizeUserAccountAction(undefined, deleteConfirmation);
      if (res.success) {
        try {
          await signOut();
        } catch {
          // Continuar redirección incluso si la sesión ya fue eliminada en el servidor
        }
        window.location.href = '/login?mode=signup&deleted=true';
      } else {
        setDeleteError(res.error || 'No se pudo eliminar la cuenta.');
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Cabecera Informativa Normativa */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Privacidad de Datos y Derechos ARCO
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ley N° 21.719
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                En INDI garantizamos el pleno ejercicio de tus derechos de Acceso, Rectificación, Cancelación,
                Oposición y Portabilidad bajo los más altos estándares de privacidad por diseño.
                {userEmail ? ` Titular activo: ${userEmail}.` : ''}
              </p>
            </div>
          </div>

          {onOpenArcoModal && (
            <button
              type="button"
              onClick={onOpenArcoModal}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-center"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ver Guía ARCO Completa</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Acciones de Privacidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta: Exportación de Datos (Portabilidad) */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Exportar Mis Datos Personales</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Descarga un archivo JSON estructurado con toda tu información: perfil de usuario, tarjetas digitales,
              currículums (Smart CVs), presentaciones y registros asociados.
            </p>
          </div>

          <div>
            {exportMessage && (
              <div
                className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  exportSuccess
                    ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {exportSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{exportMessage}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleExportData}
              disabled={isPendingExport}
              className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isPendingExport ? 'Exportando datos...' : 'Descargar Archivo JSON'}</span>
            </button>
          </div>
        </div>

        {/* Tarjeta: Eliminación y Supresión de Cuenta (Derecho al Olvido) */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-rose-500/20 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Eliminar y Anonimizar Mi Cuenta</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Aplica la supresión destructiva permanente de tus tarjetas, currículums, presentaciones y tokens de sesión.
              Tu identidad será anonimizada de acuerdo al estándar de la Ley 21.719.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Solicitar Eliminación Permanente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventario Canónico de Subprocesadores (DPA - Artículo 15) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-white/10">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-1">
            Inventario Oficial de Encargados del Tratamiento (Subprocesadores)
          </h3>
          <p className="text-xs text-zinc-400">
            En cumplimiento del Artículo 15 de la Ley 21.719, declaramos los proveedores tecnológicos que tratan datos
            personales para la prestación del servicio SaaS:
          </p>
        </div>

        {filteredSubprocessors.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/5 text-center space-y-2">
            <Search className="w-5 h-5 text-zinc-500 mx-auto" />
            <p className="text-xs font-semibold text-zinc-300">
              No se encontraron encargados de tratamiento que coincidan con &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubprocessors.map((subprocessor, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-zinc-200">{subprocessor.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {subprocessor.location}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3">{subprocessor.purpose}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                  <span className="text-zinc-400">DPA: {subprocessor.dpaStatus}</span>
                  <a
                    href={subprocessor.privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[36px] px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>Política</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación Destructiva */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-rose-500/30 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 id="delete-account-modal-title" className="text-lg font-bold text-white">
                ¿Confirmas la eliminación permanente?
              </h4>
              <p className="text-xs text-zinc-400 mt-2">
                Esta acción es irreversible. Se eliminarán todas tus tarjetas, CVs, presentaciones y sesiones activas.
                Para confirmar, escribe exactamente: <strong className="text-rose-400">ELIMINAR MI CUENTA</strong>
              </p>
            </div>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="ELIMINAR MI CUENTA"
              aria-label="Confirmación para eliminar cuenta"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-rose-500"
            />

            {deleteError && (
              <p className="text-xs text-rose-400 text-center font-medium">{deleteError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                  setDeleteError(null);
                }}
                className="min-h-[44px] flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation.trim() !== 'ELIMINAR MI CUENTA' || isPendingDelete}
                className="min-h-[44px] flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPendingDelete ? 'Eliminando...' : 'Eliminar Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
