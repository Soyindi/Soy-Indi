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

  const pathPrefix =
    entityType === 'card' ? '/c/' : entityType === 'cv' ? '/cv/' : '/p/';
  const cleanDisplayUrl = `soyindi.cl${pathPrefix}${slug}`;

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
    tone: 'minimal',
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'share' in navigator) {
      setCanNativeShare(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(15);
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      navigator.vibrate?.(15);
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
      // Fallback silencioso
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
      tone: 'minimal',
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
    window.open(buildTwitterShareUrl(shareCopy.headline, twitterUrl), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compartir"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-sm bg-zinc-950/95 border border-zinc-800/80 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Minimalista con Identidad Compacta */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl bg-indigo-600/25 border border-indigo-500/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-indigo-300">
                  {title.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{title}</h3>
              <p className="text-xs text-zinc-400 truncate">{role || cleanDisplayUrl}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-5 space-y-3">
          {/* 1. Acción Principal: Copiar Enlace Limpio en 1 Toque */}
          <div className="flex items-center gap-2 p-1.5 pl-3.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
            <span className="text-xs text-zinc-300 font-mono truncate flex-1">
              {cleanDisplayUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              aria-label="Copiar enlace"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Botón Destacado: Enviar por WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar por WhatsApp</span>
          </button>

          {/* 3. Canales Rápidos Secundarios */}
          <div className={`grid ${canNativeShare ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-1`}>
            <button
              onClick={handleLinkedIn}
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-[0.98] text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <LinkedInIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>LinkedIn</span>
            </button>

            <button
              onClick={handleTwitter}
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-[0.98] text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>X</span>
            </button>

            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="min-h-[44px] px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-[0.98] text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Más...</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
