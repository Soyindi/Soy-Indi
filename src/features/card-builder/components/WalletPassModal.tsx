'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Download, UserPlus, Sparkles, Check, ArrowUpRight, Share2, ShieldCheck, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadVCardWithPhoto } from '@/shared/lib/vcard';

interface WalletPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'apple' | 'google';
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
  initialTab = 'apple',
  card,
}: WalletPassModalProps) {
  const [activeTab, setActiveTab] = useState<'apple' | 'google'>(initialTab);
  const [isVcardSaved, setIsVcardSaved] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const cardUrl = `https://soyindi.cl/c/${card.slug}`;

  const handleSaveContact = () => {
    downloadVCardWithPhoto({
      title: card.title,
      profession: card.profession,
      slug: card.slug,
      phone: card.phone || card.whatsapp || undefined,
      emailContact: card.emailContact || undefined,
      websiteUrl: card.websiteUrl || undefined,
      photoUrl: card.photoUrl || undefined,
      address: card.address || undefined,
      about: card.about || undefined,
    });

    setIsVcardSaved(true);
    setTimeout(() => setIsVcardSaved(false), 2500);
  };

  // Genera y descarga una tarjeta gráfica HD (PNG 1080x1920 / 9:16) con el pase y código QR
  const handleDownloadLockscreenPass = async () => {
    setIsDownloadingImage(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Fondo oscuro elegante con gradiente cósmico
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#090a12');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Resplandor superior
      const glowGrad = ctx.createRadialGradient(540, 400, 50, 540, 400, 600);
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1080, 1000);

      // Tarjeta Pass central (rectángulo redondeado)
      const passX = 100;
      const passY = 320;
      const passW = 880;
      const passH = 1280;
      const radius = 48;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(passX, passY, passW, passH, radius);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();
      ctx.restore();

      // Cabecera del Pase
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('INDI PASS • DIGITAL IDENTITY', passX + 60, passY + 90);

      // Línea divisoria
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(passX + 60, passY + 120);
      ctx.lineTo(passX + passW - 60, passY + 120);
      ctx.stroke();

      // Nombre del Titular
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px sans-serif';
      ctx.fillText(card.title, passX + 60, passY + 200);

      // Especialidad
      ctx.fillStyle = '#94a3b8';
      ctx.font = '36px sans-serif';
      ctx.fillText(card.profession, passX + 60, passY + 260);

      // Contenedor blanco para el código QR
      const qrBoxX = passX + (passW - 560) / 2;
      const qrBoxY = passY + 340;
      const qrBoxSize = 560;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // Dibujar QR SVG sobre canvas
      const svgElement = document.getElementById('wallet-qr-code-svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        const qrImg = new Image();

        await new Promise((resolve) => {
          qrImg.onload = () => {
            ctx.drawImage(qrImg, qrBoxX + 40, qrBoxY + 40, qrBoxSize - 80, qrBoxSize - 80);
            URL.revokeObjectURL(blobURL);
            resolve(true);
          };
          qrImg.src = blobURL;
        });
      }

      // Pie del Pase
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cardUrl, 540, passY + 980);

      ctx.fillStyle = '#64748b';
      ctx.font = '28px sans-serif';
      ctx.fillText('Escanea con la cámara de tu celular • Acceso sin internet', 540, passY + 1040);
      ctx.fillText('Fija esta imagen en tu Pantalla de Bloqueo o Galería', 540, passY + 1100);

      // Descargar archivo PNG
      const link = document.createElement('a');
      link.download = `${card.slug}-wallet-pass.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Error generando tarjeta gráfica de pase:', err);
    } finally {
      setIsDownloadingImage(false);
    }
  };

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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-zinc-950/95 border border-white/10 rounded-3xl shadow-2xl p-6 text-white overflow-hidden max-h-[90vh] flex flex-col z-10"
          >
            {/* Cabecera del Diálogo */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Billetera & Acceso Offline
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Ten tu tarjeta a mano en 1 toque
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Pestañas Apple / Google */}
            <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('apple')}
                className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'apple'
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.84-12-14.4-6.19-9.5-10.96-20.19-14.31-32.06-3.35-11.88-5.03-23.23-5.03-34.05 0-14.16 3.52-25.96 10.55-35.41 7.03-9.45 15.89-14.28 26.58-14.5 4.9.12 10.4 1.34 16.5 3.66 6.09 2.32 10.14 3.53 12.14 3.64 1.78-.11 5.92-1.37 12.42-3.79 6.5-2.41 12.01-3.6 16.53-3.56 12.03.74 21.64 5.37 28.84 13.88-10.5 6.35-15.65 15.22-15.43 26.6.22 8.94 3.63 16.42 10.22 22.44 6.59 6.02 14.52 9.53 23.79 10.53-2.16 6.54-4.79 13.06-7.89 19.57zM119.22 31.81c0-7.04 2.55-13.79 7.66-20.25 5.11-6.46 11.53-10.74 19.26-12.83.33 1.33.5 2.56.5 3.69 0 7.27-2.67 14.21-8.01 20.82-5.34 6.61-11.83 10.66-19.46 12.15-.1-.78-.16-1.97-.16-3.58z"/>
                </svg>
                <span>Apple Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('google')}
                className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'google'
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Wallet</span>
              </button>
            </div>

            {/* Contenido Scrolleable */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
              {/* Tarjeta Visual de Pase (Preview Estilo Wallet) */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/60 border border-indigo-500/30 text-center relative overflow-hidden shadow-inner">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-60" />

                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-indigo-300 uppercase mb-3">
                  <span>INDI PASS</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> VERIFICADO
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-tight">
                  {card.title}
                </h4>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  {card.profession}
                </p>

                {/* Código QR Central en alta definición */}
                <div className="inline-block p-3.5 bg-white rounded-2xl my-3 shadow-lg">
                  <QRCodeSVG
                    id="wallet-qr-code-svg"
                    value={cardUrl}
                    size={150}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <p className="text-[11px] text-zinc-400 font-mono">
                  {cardUrl}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Escaneable por cualquier cámara sin conexión
                </p>
              </div>

              {/* Botón 1: Guardar en Contactos con Foto (vCard 4.0) */}
              <button
                type="button"
                onClick={handleSaveContact}
                className="w-full min-h-[48px] flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
              >
                {isVcardSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Guardado en tus Contactos!</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Guardar en Contactos con Foto HD</span>
                  </>
                )}
              </button>

              {/* Botón 2: Descargar Tarjeta para Bloqueo / Galería */}
              <button
                type="button"
                onClick={handleDownloadLockscreenPass}
                disabled={isDownloadingImage}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 hover:text-white rounded-xl text-xs font-medium active:scale-[0.98] transition-all"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Tarjeta de Bloqueo Descargada!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>
                      {isDownloadingImage ? 'Generando imagen...' : 'Descargar Tarjeta para Pantalla de Bloqueo'}
                    </span>
                  </>
                )}
              </button>

              {/* Instrucciones de Acceso Rápido según el Sistema Operativo */}
              <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {activeTab === 'apple' ? 'Acceso 1-Toque en iPhone' : 'Acceso 1-Toque en Android'}
                  </span>
                </div>

                {activeTab === 'apple' ? (
                  <ol className="text-[11px] text-zinc-400 space-y-1.5 list-decimal pl-4">
                    <li>
                      Pulsa el botón <strong>Compartir</strong> en Safari (icono cuadrado con flecha <Share2 className="w-3 h-3 inline text-indigo-400" />).
                    </li>
                    <li>
                      Desliza y selecciona <strong>"Añadir a pantalla de inicio"</strong>.
                    </li>
                    <li>
                      Tu tarjeta quedará guardada como una app nativa con acceso offline instantáneo.
                    </li>
                  </ol>
                ) : (
                  <ol className="text-[11px] text-zinc-400 space-y-1.5 list-decimal pl-4">
                    <li>
                      Pulsa el menú de <strong>tres puntos</strong> en Google Chrome.
                    </li>
                    <li>
                      Selecciona <strong>"Añadir a la pantalla principal"</strong> o <strong>"Instalar aplicación"</strong>.
                    </li>
                    <li>
                      Acceso rápido a tu perfil y código QR desde tus aplicaciones.
                    </li>
                  </ol>
                )}
              </div>
            </div>

            {/* Pie de página de cierre */}
            <div className="pt-3 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] py-2.5 text-xs text-zinc-400 hover:text-white font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
