'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { QrCode, Download, Check, Sparkles, X, Share2 } from 'lucide-react';
import { BrandLogo } from '@/shared/ui/BrandLogo';

// Dynamic import of QRCodeSVG with ssr: false for SSR safety
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

interface ReferralQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  directSignupUrl: string;
}

export function ReferralQrModal({
  isOpen,
  onClose,
  referralCode,
  directSignupUrl,
}: ReferralQrModalProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadQr = () => {
    try {
      const svgElement = document.getElementById('referral-qr-code-svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Alta resolución para impresión profesional 1000x1000
        canvas.width = 1024;
        canvas.height = 1024;

        if (ctx) {
          // Fondo oscuro estilizado premium o blanco accesible
          ctx.fillStyle = '#09090b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Dibujar tarjeta interior blanca para contraste óptico del escáner
          const padding = 112;
          const qrSize = canvas.width - padding * 2;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(padding - 24, padding - 24, qrSize + 48, qrSize + 48, 32);
          ctx.fill();

          ctx.drawImage(img, padding, padding, qrSize, qrSize);

          // Pie de marca
          ctx.fillStyle = '#a1a1aa';
          ctx.font = 'bold 28px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`soyindi.cl • @${referralCode}`, canvas.width / 2, canvas.height - 48);

          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `indi-referral-qr-${referralCode}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          setDownloaded(true);
          setTimeout(() => setDownloaded(false), 3000);
        }
      };

      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    } catch (err) {
      console.error('Error al descargar código QR:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directSignupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Código QR de Afiliado Oficial"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-zinc-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 text-white overflow-hidden flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar accesible */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/5"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Resplandor ambiental de fondo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] pointer-events-none" />

        {/* Badge superior */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Código QR Oficial de Afiliado</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
          Escanea para Unirte a INDI
        </h3>
        <p className="text-xs text-zinc-400 mb-6 max-w-xs">
          Muestra este código en eventos presenciales o descárgalo para tus afiches, tarjetas y presentaciones.
        </p>

        {/* Contenedor del Código QR con fondo blanco para contraste óptico universal */}
        <div className="p-5 rounded-3xl bg-white shadow-xl shadow-cyan-500/10 border-4 border-emerald-500/20 flex flex-col items-center justify-center mb-6">
          <div id="referral-qr-code-svg">
            <QRCodeSVG
              value={directSignupUrl}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#09090b"
              bgColor="#ffffff"
            />
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-900 uppercase tracking-wider">
            <span>ref: {referralCode}</span>
          </div>
        </div>

        {/* Acciones principales ergonómicas con touch targets >= 44px */}
        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={handleDownloadQr}
            className={`w-full min-h-[48px] px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              downloaded
                ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 shadow-emerald-500/20'
            }`}
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡Imagen PNG Descargada!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar Código QR (PNG Alta Calidad)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Enlace de referido copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-zinc-400" />
                <span>Copiar Enlace Directo</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-5 text-[10px] text-zinc-500 font-mono">
          Al escanear, el invitado recibe 3 días gratis y queda vinculado a tu 25% de comisión.
        </p>
      </div>
    </div>
  );
}
