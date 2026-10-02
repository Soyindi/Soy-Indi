'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SmartParticles } from '@/features/visual-effects/SmartParticles';
import { 
  Phone, 
  Mail, 
  Globe, 
  Share2, 
  QrCode, 
  Check, 
  Sparkles,
  UserPlus
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { downloadVCard } from '@/shared/lib/vcard';

// Importar QRCode dinámicamente para SSR seguro
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

export interface CardData {
  title: string;
  profession: string;
  about?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  emailContact?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  photoUrl?: string | null;
  slug: string;
  themeConfig?: {
    themeId?: string;
    primaryColorOklch?: string;
    backgroundColorOklch?: string;
    particleBehavior?: 'static' | 'interactive' | 'ambient';
    particleIntensity?: 'subtle' | 'balanced' | 'prominent';
    badgeText?: string | null;
    ctaLabel?: string | null;
    cardFinish?: 'classic' | 'holographic' | 'titanium' | 'obsidian' | 'minimal';
    surfaceTexture?: 'none' | 'dot-grid' | 'radial-glow';
  };
  bentoBlocks?: Array<{
    id: string;
    type: 'link' | 'metric' | 'featured_project' | 'testimonial';
    title: string;
    subtitle?: string | null;
    url?: string | null;
    metricValue?: string | null;
    metricDelta?: string | null;
  }>;
}

interface DigitalCardProps {
  card: CardData;
  isInteractive?: boolean;
}

export function DigitalCard({ card, isInteractive = true }: DigitalCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vcardSaved, setVcardSaved] = useState(false);

  const finish = card.themeConfig?.cardFinish || 'classic';
  const texture = card.themeConfig?.surfaceTexture || 'radial-glow';
  const primaryColor = card.themeConfig?.primaryColorOklch || '#6366f1';

  // Clases dinámicas según el acabado de material (Material Finish)
  const finishClasses = {
    classic: 'border-white/10 shadow-2xl',
    holographic: 'border-cyan-400/30 shadow-[0_0_50px_-12px_rgba(99,102,241,0.35)] ring-1 ring-white/20',
    titanium: 'border-slate-400/30 bg-zinc-950/80 shadow-2xl ring-1 ring-slate-400/20',
    obsidian: 'border-amber-500/30 shadow-[0_0_50px_-15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/20',
    minimal: 'border-white/20 shadow-xl bg-black/90',
  }[finish];

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/c/${card.slug}`
    : `https://indi.bio/c/${card.slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.title} — ${card.profession}`,
          text: card.about || `Conecta con ${card.title} en un solo clic`,
          url: fullUrl,
        });
        return;
      } catch {
        // Fallback al portapapeles
      }
    }
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadContact = () => {
    downloadVCard({
      slug: card.slug,
      title: card.title,
      profession: card.profession,
      about: card.about,
      phone: card.phone,
      whatsapp: card.whatsapp,
      emailContact: card.emailContact,
      websiteUrl: card.websiteUrl,
      linkedinUrl: card.linkedinUrl,
      instagramUrl: card.instagramUrl,
    });
    setVcardSaved(true);
    setTimeout(() => setVcardSaved(false), 2500);
  };

  // Construir link de WhatsApp con mensaje personalizado
  const whatsappUrl = card.whatsapp
    ? `https://wa.me/${card.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hola ${card.title}, vi tu tarjeta digital en INDI y me gustaría conectar contigo.`
      )}`
    : null;

  return (
    <SmartParticles
      enabled={true}
      intensity={card.themeConfig?.particleIntensity || 'balanced'}
      behavior={card.themeConfig?.particleBehavior || 'ambient'}
      color={card.themeConfig?.primaryColorOklch || '#6366f1'}
      className="w-full max-w-sm mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={isInteractive ? { y: -4, scale: 1.01 } : undefined}
        className={`glass-panel relative rounded-[2rem] p-6 sm:p-8 text-white overflow-hidden transition-all duration-300 ${finishClasses}`}
      >
        {/* Textura de fondo Dot Grid sutil */}
        {texture === 'dot-grid' && (
          <div 
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
        )}

        {/* Glow Superior Reactivo */}
        {texture !== 'none' && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 blur-3xl pointer-events-none opacity-40 transition-colors duration-500"
            style={{
              background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Badge Superior Contextual */}
        {card.themeConfig?.badgeText && (
          <div className="relative z-10 flex justify-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-white/10 border border-white/15 text-cyan-300 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              <span>{card.themeConfig.badgeText}</span>
            </span>
          </div>
        )}

        {/* Header de la Tarjeta */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Foto de Perfil con Anillo de Degradado */}
          <div className="relative w-24 h-24 mb-5 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-teal-300 animate-pulse blur-sm opacity-60" />
            <div className="relative w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-cyan-400">
              {card.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.photoUrl}
                  alt={card.title}
                  className="w-full h-full rounded-full object-cover bg-zinc-900"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-900 to-zinc-900 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
                  {card.title.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            {card.title}
          </h2>
          <p className="text-xs uppercase tracking-widest font-semibold text-cyan-300/90 mb-4 font-mono">
            {card.profession}
          </p>

          {card.about && (
            <p className="text-sm text-zinc-300/90 font-normal leading-relaxed mb-6 max-w-xs">
              {card.about}
            </p>
          )}
        </div>

        {/* Acciones Principales (Banda de Contacto & vCard) */}
        <div className="relative z-10 flex flex-col gap-2.5 mb-6">
          {/* Botón Guardar en Contactos (vCard 4.0 One-Tap) */}
          <button
            onClick={handleDownloadContact}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
          >
            {vcardSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                <span>¡Contacto Descargado!</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Guardar en Contactos</span>
              </>
            )}
          </button>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Conectar por WhatsApp</span>
            </a>
          )}

          {card.emailContact && (
            <a
              href={`mailto:${card.emailContact}`}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl glass-pill text-zinc-200 hover:text-white font-medium text-xs hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>{card.emailContact}</span>
            </a>
          )}
        </div>

        {/* Bloques Bento Modulares (Vitrina Interactiva) */}
        {card.bentoBlocks && card.bentoBlocks.length > 0 && (
          <div className="relative z-10 flex flex-col gap-2.5 mb-6 pt-2">
            {card.bentoBlocks.map((block) => (
              <div
                key={block.id}
                className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between text-left"
              >
                <div>
                  <h4 className="text-xs font-semibold text-white tracking-wide">
                    {block.title}
                  </h4>
                  {block.subtitle && (
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
                      {block.subtitle}
                    </p>
                  )}
                </div>
                {block.metricValue && (
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {block.metricValue}
                    </span>
                    {block.metricDelta && (
                      <span className="block text-[9px] font-mono text-emerald-400">
                        {block.metricDelta}
                      </span>
                    )}
                  </div>
                )}
                {block.url && (
                  <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Redes Sociales y Enlaces Externos con Touch Target ergonómico >= 44x44px */}
        <div className="relative z-10 flex items-center justify-center gap-3 mb-6 pt-4 border-t border-white/5">
          {card.websiteUrl && (
            <a
              href={card.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl glass-pill flex items-center justify-center text-zinc-300 hover:text-white hover:border-cyan-400/40 hover:scale-105 active:scale-95 transition-all"
              title="Sitio Web"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
          {card.linkedinUrl && (
            <a
              href={card.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl glass-pill flex items-center justify-center text-zinc-300 hover:text-white hover:border-blue-400/40 hover:scale-105 active:scale-95 transition-all"
              title="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 1 0 0-3.36 1.68 1.68 0 0 0 0 3.36m1.39 9.74v-8.37H5.07v8.37h2.78z" />
              </svg>
            </a>
          )}
          {card.instagramUrl && (
            <a
              href={card.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl glass-pill flex items-center justify-center text-zinc-300 hover:text-white hover:border-pink-400/40 hover:scale-105 active:scale-95 transition-all"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
          )}
        </div>

        {/* Modal QR Code desplegable */}
        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 mb-6 p-4 rounded-2xl bg-white flex flex-col items-center justify-center text-black"
          >
            <QRCodeSVG value={fullUrl} size={150} level="M" />
            <p className="text-[11px] font-mono font-medium text-zinc-500 mt-2">
              Escanea para abrir en tu móvil
            </p>
          </motion.div>
        )}

        {/* Footer / Barra de Herramientas de la Tarjeta */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <button
            onClick={() => setShowQR(!showQR)}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>{showQR ? 'Ocultar QR' : 'Ver QR'}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-all font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">¡Enlace Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir</span>
              </>
            )}
          </button>
        </div>

        {/* Badge Sutil de INDI */}
        <div className="mt-5 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 tracking-wider font-mono transition-colors"
          >
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>CREADO CON INDI</span>
          </a>
        </div>
      </motion.div>
    </SmartParticles>
  );
}
