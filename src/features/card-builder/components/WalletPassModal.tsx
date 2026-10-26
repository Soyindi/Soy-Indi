'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface WalletPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'apple' | 'google';
  hasAppleCertificates?: boolean;
  card: {
    slug: string;
    title: string;
    profession: string;
    about?: string | null;
    photoUrl?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    emailContact?: string | null;
    websiteUrl?: string | null;
    address?: string | null;
  };
}

export function WalletPassModal({
  isOpen,
  onClose,
  card,
}: WalletPassModalProps) {
  const cardUrl = `https://soyindi.cl/c/${card.slug}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container Minimalista */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm bg-zinc-950/95 border border-white/10 rounded-3xl shadow-2xl p-6 text-white overflow-hidden z-10"
          >
            {/* Cabecera Limpia */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    Google Wallet
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Pase digital con código QR
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vista Previa del Pase */}
            <div className="my-5 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/50 border border-indigo-500/25 text-center relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-indigo-300 uppercase mb-3">
                <span>INDI PASS</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> ACTIVO
                </span>
              </div>

              <h4 className="text-base font-bold text-white leading-tight truncate">
                {card.title}
              </h4>
              <p className="text-xs text-indigo-200/80 mt-0.5 truncate">
                {card.profession}
              </p>

              {/* Código QR Central */}
              <div className="inline-block p-3.5 bg-white rounded-2xl my-4 shadow-lg">
                <QRCodeSVG
                  id="wallet-qr-code-svg"
                  value={cardUrl}
                  size={148}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p className="text-[11px] text-zinc-400 font-mono">
                soyindi.cl/c/{card.slug}
              </p>
            </div>

            {/* Acción Única: Añadir a Google Wallet */}
            <a
              href={`/api/wallet/google/${card.slug}?action=save`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] flex items-center justify-center gap-2.5 px-4 py-3 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl text-xs font-bold shadow-lg active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Añadir a Google Wallet</span>
            </a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
