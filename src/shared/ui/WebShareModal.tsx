'use client';

import React, { useState, useEffect } from 'react';
import {
  ShareEntityType,
  buildCanonicalShareUrl,
  generateShareCopy,
  buildWhatsAppShareUrl,
  buildLinkedInShareUrl,
  buildTwitterShareUrl,
} from '@/shared/lib/shareCopy';
import {
  X,
  Copy,
  Check,
  Share2,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 1 0 0-3.36 1.68 1.68 0 0 0 0 3.36m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

export interface WebShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  role?: string;
  about?: string;
  slug: string;
  entityType: ShareEntityType;
  photoUrl?: string;
  referralCode?: string | null;
  onShareTracked?: (medium: string) => void;
}

export function WebShareModal({
  isOpen,
  onClose,
  title,
  role,
  about,
  slug,
  entityType,
  photoUrl,
  referralCode,
  onShareTracked,
}: WebShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // URLs canónicas para cada canal
  const defaultUrl = buildCanonicalShareUrl({
    entityType,
    slug,
    medium: 'native',
    referralCode,
  });

  const whatsappUrl = buildCanonicalShareUrl({
    entityType,
    slug,
    medium: 'whatsapp',
    referralCode,
  });

  const linkedinUrl = buildCanonicalShareUrl({
    entityType,
    slug,
    medium: 'linkedin',
    referralCode,
  });

  const twitterUrl = buildCanonicalShareUrl({
    entityType,
    slug,
    medium: 'twitter',
    referralCode,
  });

  const copyUrl = buildCanonicalShareUrl({
    entityType,
    slug,
    medium: 'clipboard',
    referralCode,
  });

  const shareCopy = generateShareCopy({
    entityType,
    title,
    role,
    url: defaultUrl,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'share' in navigator) {
      setCanNativeShare(true);
    }
  }, []);

  // Retroalimentación háptica y bloqueo de scroll
  useEffect(() => {
    if (isOpen) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([15, 30, 15]);
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerHaptics = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(20);
    }
  };

  const handleCopy = async () => {
    triggerHaptics();
    onShareTracked?.('clipboard');
    try {
      await navigator.clipboard.writeText(copyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    triggerHaptics();
    onShareTracked?.('native');
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareCopy.headline,
          text: shareCopy.body,
          url: defaultUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    triggerHaptics();
    onShareTracked?.('whatsapp');
    const textWithUrl = generateShareCopy({
      entityType,
      title,
      role,
      url: whatsappUrl,
    }).fullMessage;
    window.open(buildWhatsAppShareUrl(textWithUrl), '_blank', 'noopener,noreferrer');
  };

  const handleLinkedIn = () => {
    triggerHaptics();
    onShareTracked?.('linkedin');
    window.open(buildLinkedInShareUrl(linkedinUrl, title, about), '_blank', 'noopener,noreferrer');
  };

  const handleTwitter = () => {
    triggerHaptics();
    onShareTracked?.('twitter');
    const tweetText = `${shareCopy.headline}`;
    window.open(buildTwitterShareUrl(tweetText, twitterUrl), '_blank', 'noopener,noreferrer');
  };

  // Badge contextual para preview
  const badgeLabel =
    entityType === 'card'
      ? 'Tarjeta Digital'
      : entityType === 'cv'
        ? 'Smart CV ATS'
        : 'Presentación 16:9';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compartir perfil digital"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg bg-zinc-950/95 border border-zinc-800/80 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl shadow-indigo-950/40 text-white overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">Compartir Perfil</h3>
              <p className="text-xs text-zinc-400">Social Graph & Enlace Oficial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll si es necesario */}
        <div className="py-5 space-y-5 overflow-y-auto pr-1">
          {/* Vista Previa de la Tarjeta Social (Safe Zone 1:1 Preview) */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-extrabold text-indigo-300">
                  {title.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-semibold tracking-wider text-indigo-300 uppercase mb-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{badgeLabel}</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">{title}</h4>
              <p className="text-xs text-zinc-400 truncate">{role || 'Identidad Oficial INDI'}</p>
              <p className="text-[11px] text-zinc-500 truncate mt-0.5">soyindi.cl</p>
            </div>
          </div>

          {/* Botón Primario: Web Share API si está disponible */}
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full min-h-[48px] py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span>Abrir menú de compartir del teléfono</span>
            </button>
          )}

          {/* Accesos Directos a Canales Sociales */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
              Enviar por canal directo
            </span>
            <div className="grid grid-cols-3 gap-3">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="min-h-[52px] p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-900/40 active:scale-[0.98] text-emerald-300 font-medium flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">WhatsApp</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleLinkedIn}
                className="min-h-[52px] p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 hover:bg-blue-900/40 active:scale-[0.98] text-blue-300 font-medium flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <LinkedInIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">LinkedIn</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={handleTwitter}
                className="min-h-[52px] p-3 rounded-xl bg-zinc-900 border border-zinc-700/60 hover:bg-zinc-800 active:scale-[0.98] text-zinc-200 font-medium flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <ExternalLink className="w-5 h-5 text-zinc-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">X / Twitter</span>
              </button>
            </div>
          </div>

          {/* Copiar Enlace Directo */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              Enlace directo canónico
            </span>
            <div className="flex items-center gap-2 p-1.5 pl-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-300 font-mono truncate flex-1">{copyUrl}</span>
              <button
                onClick={handleCopy}
                className={`min-h-[44px] px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
                aria-label="Copiar enlace al portapapeles"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="pt-3 border-t border-zinc-900 text-center">
          <p className="text-[11px] text-zinc-500">
            Optimizada con <strong className="text-zinc-400 font-semibold">Zona Segura 1:1</strong> para previsualizaciones impecables.
          </p>
        </div>
      </div>
    </div>
  );
}
