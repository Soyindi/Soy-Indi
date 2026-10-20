'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Phone, Mail, Building, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { submitCardLeadAction } from '../lead-actions';

interface ExchangeContactModalProps {
  cardId: string;
  cardTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeContactModal({
  cardId,
  cardTitle,
  isOpen,
  onClose,
}: ExchangeContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Por favor ingresa tu nombre completo (mínimo 2 letras).');
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setErrorMessage('Debes indicar al menos un teléfono de WhatsApp o un correo electrónico.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await submitCardLeadAction({
        cardId,
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        company: company.trim() || null,
        note: note.trim() || null,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'No se pudo registrar tu contacto. Intenta de nuevo.');
        setIsLoading(false);
        return;
      }

      // Haptic feedback si está soportado en móvil
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 20, 40]);
        } catch {
          // Ignorar si el navegador bloquea vibración
        }
      }

      setIsSuccess(true);
      setIsLoading(false);

      // Auto-cierre tras 2.5 segundos de confirmación
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setName('');
        setPhone('');
        setEmail('');
        setCompany('');
        setNote('');
      }, 2500);
    } catch {
      setErrorMessage('Ocurrió un error inesperado al enviar tus datos.');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-exchange-title"
          >
            {/* Botón Cerrar accesible */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-neutral-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label="Cerrar ventana"
            >
              <X className="h-5 w-5" />
            </button>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white">¡Contacto Compartido!</h3>
                <p className="mt-2 text-sm text-neutral-300">
                  Tus datos han sido enviados directamente a <span className="font-semibold text-white">{cardTitle}</span>.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Conexión profesional registrada con éxito</span>
                </div>
              </motion.div>
            ) : (
              <div>
                <div className="mb-5">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Conexión Instantánea</span>
                  </div>
                  <h2
                    id="modal-exchange-title"
                    className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl"
                  >
                    Intercambiar Contacto
                  </h2>
                  <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                    Comparte tus datos con <span className="text-neutral-200 font-medium">{cardTitle}</span> para mantenerte en comunicación directa.
                  </p>
                </div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Nombre y Apellido <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Francisca Valenzuela"
                        disabled={isLoading}
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 transition focus:border-emerald-500/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-300">
                        WhatsApp / Teléfono
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                          <Phone className="h-4 w-4" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+56 9 1234 5678"
                          disabled={isLoading}
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 transition focus:border-emerald-500/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-300">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@empresa.com"
                          disabled={isLoading}
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 transition focus:border-emerald-500/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Empresa o Cargo (Opcional)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                        <Building className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Ej. Directora en Austral Innovación"
                        disabled={isLoading}
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 transition focus:border-emerald-500/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Mensaje breve (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Un gusto conectar contigo en el evento..."
                      disabled={isLoading}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-neutral-500 transition focus:border-emerald-500/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 font-semibold text-neutral-950 shadow-lg shadow-emerald-500/20 transition active:scale-[0.98] disabled:opacity-50 hover:from-emerald-400 hover:to-teal-400"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Enviar mi Contacto</span>
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-center text-[10px] text-neutral-500">
                      Tus datos son privados y se envían de forma segura y directa al profesional.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
