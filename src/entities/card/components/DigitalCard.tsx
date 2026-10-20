'use client';
import React, { useState, useEffect } from 'react';
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
  UserPlus,
  MapPin,
  Navigation
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { downloadVCardWithPhoto } from '@/shared/lib/vcard';
import { getAccessibleTextColor } from '@/shared/lib/colorContrast';
import { trackCardEventAction } from '@/features/card-builder/analytics-actions';
import { trackResourceView } from '@/shared/lib/telemetryClient';
import { WebShareModal } from '@/shared/ui/WebShareModal';
import { getWhatsAppDigits, normalizeChileanPhone } from '@/shared/lib/phone';
import { ExchangeContactModal } from '@/features/card-builder/components/ExchangeContactModal';

// Importar QRCode dinámicamente para SSR seguro
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

export interface CardData {
  id?: string;
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
  address?: string | null;
  slug: string;
  themeConfig?: {
    themeId?: string;
    primaryColorOklch?: string;
    backgroundColorOklch?: string;
    particleBehavior?: 'static' | 'interactive' | 'ambient';
    particleIntensity?: 'subtle' | 'balanced' | 'prominent';
    badgeText?: string | null;
    ctaLabel?: string | null;
    cardFinish?: 'classic' | 'holographic' | 'titanium' | 'obsidian' | 'minimal' | 'luminous-glass' | 'aurora-light';
    surfaceTexture?: 'none' | 'dot-grid' | 'radial-glow' | 'frosted-prism';
    coverImageUrl?: string | null;
    backgroundImageUrl?: string | null;
    backgroundType?: 'theme' | 'mesh' | 'pattern' | 'custom-image';
    backgroundOverlayBlur?: 'none' | 'subtle' | 'medium' | 'deep';
    backgroundOverlayOpacity?: number;
    operationalStatus?: 'none' | 'open_now' | 'taking_orders' | 'available_by_appointment' | 'custom';
    customStatusText?: string | null;
  };
  bentoBlocks?: ReadonlyArray<{
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  // Telemetría pasiva desacoplada del render SSR
  useEffect(() => {
    if (card.slug && card.slug !== 'demo') {
      trackResourceView({ slug: card.slug, entityType: 'card' });
    }
  }, [card.slug]);

  const finish = card.themeConfig?.cardFinish || 'classic';
  const texture = card.themeConfig?.surfaceTexture || 'radial-glow';
  const primaryColor = card.themeConfig?.primaryColorOklch || '#6366f1';

  // Acabados de material drásticos, visibles y diferenciados
  const finishStyles: Record<string, {
    containerClass: string;
    borderStyle: React.CSSProperties;
    glowGradient: string;
    backgroundStyle: React.CSSProperties;
    tagLabel: string;
    tagColor: string;
    isLight?: boolean;
  }> = {
    'luminous-glass': {
      containerClass: 'shadow-[0_25px_60px_-15px_rgba(79,70,229,0.22)]',
      borderStyle: {
        borderColor: `${primaryColor}55`,
        boxShadow: `inset 0 1px 3px rgba(255,255,255,0.95), 0 20px 45px -15px ${primaryColor}28`,
      },
      glowGradient: `radial-gradient(circle at 50% 0%, ${primaryColor}45 0%, #38bdf835 50%, transparent 80%)`,
      backgroundStyle: {
        background: `linear-gradient(150deg, rgba(255, 255, 255, 0.94) 0%, rgba(243, 244, 246, 0.92) 50%, rgba(224, 231, 255, 0.88) 100%)`,
      },
      tagLabel: 'Opal Light Glass',
      tagColor: 'text-indigo-950 bg-indigo-100/90 border-indigo-300 font-bold',
      isLight: true,
    },
    'aurora-light': {
      containerClass: 'shadow-[0_25px_60px_-15px_rgba(2,132,199,0.22)]',
      borderStyle: {
        borderColor: `${primaryColor}66`,
        boxShadow: `inset 0 1px 3px rgba(255,255,255,0.95), 0 20px 45px -12px ${primaryColor}30`,
      },
      glowGradient: `radial-gradient(circle at 50% 0%, #06b6d455 0%, #2dd4bf35 45%, transparent 75%)`,
      backgroundStyle: {
        background: `linear-gradient(135deg, rgba(240, 253, 250, 0.96) 0%, rgba(248, 250, 252, 0.93) 50%, rgba(224, 242, 254, 0.9) 100%)`,
      },
      tagLabel: 'Aurora Lumina',
      tagColor: 'text-sky-950 bg-sky-100/90 border-sky-300 font-bold',
      isLight: true,
    },
    classic: {
      containerClass: 'shadow-2xl',
      borderStyle: { borderColor: `${primaryColor}33` },
      glowGradient: `radial-gradient(circle at 50% 0%, ${primaryColor}99 0%, ${primaryColor}22 45%, transparent 75%)`,
      backgroundStyle: {
        background: `radial-gradient(130% 100% at 50% 0%, ${primaryColor}26 0%, oklch(0.14 0.02 260 / 0.88) 100%)`,
      },
      tagLabel: 'Glassmorphism 2.0',
      tagColor: 'text-zinc-300 bg-white/10 border-white/15',
    },
    holographic: {
      containerClass: 'shadow-2xl',
      borderStyle: {
        borderColor: `${primaryColor}88`,
        boxShadow: `inset 0 1px 3px rgba(255,255,255,0.4), 0 0 30px ${primaryColor}40`,
      },
      glowGradient: `radial-gradient(circle at 50% 0%, ${primaryColor} 0%, #22d3ee 40%, transparent 80%)`,
      backgroundStyle: {
        background: `linear-gradient(145deg, ${primaryColor}33 0%, rgba(15, 23, 42, 0.92) 50%, rgba(8, 51, 68, 0.8) 100%)`,
      },
      tagLabel: 'Holographic Rim',
      tagColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40',
    },
    titanium: {
      containerClass: 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]',
      borderStyle: {
        borderColor: `${primaryColor}66`,
        boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.35), 0 0 20px ${primaryColor}25`,
      },
      glowGradient: `radial-gradient(circle at 50% 0%, ${primaryColor}bb 0%, #0ea5e9 35%, transparent 75%)`,
      backgroundStyle: {
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 60%, #020617 100%)',
      },
      tagLabel: 'Titanium Brushed',
      tagColor: 'text-slate-300 bg-slate-400/15 border-slate-400/30',
    },
    obsidian: {
      containerClass: 'shadow-2xl',
      borderStyle: {
        borderColor: `${primaryColor}99`,
        boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.25), 0 0 35px ${primaryColor}4d`,
      },
      glowGradient: `radial-gradient(circle at 50% 0%, ${primaryColor} 0%, ${primaryColor}66 45%, transparent 80%)`,
      backgroundStyle: {
        background: `linear-gradient(160deg, #18140e 0%, #090704 60%, ${primaryColor}1a 100%)`,
      },
      tagLabel: 'Obsidian Gold',
      tagColor: 'text-amber-300 bg-amber-500/20 border-amber-400/40',
    },
    minimal: {
      containerClass: 'shadow-2xl',
      borderStyle: { 
        borderColor: `${primaryColor}55`,
        boxShadow: `0 0 25px ${primaryColor}20`,
      },
      glowGradient: `radial-gradient(circle at 50% 0%, ${primaryColor}55 0%, transparent 60%)`,
      backgroundStyle: {
        background: '#040508',
      },
      tagLabel: 'Swiss Monochrome',
      tagColor: 'text-white bg-white/10 border-white/25',
    },
  };

  const activeFinish = finishStyles[finish] || finishStyles.classic;

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/c/${card.slug}`
    : `https://soyindi.cl/c/${card.slug}`;

  const buttonTextColor = getAccessibleTextColor(primaryColor);

  const handleShare = () => {
    trackCardEventAction({ slug: card.slug, eventType: 'share' }).catch(() => {});
    setIsShareModalOpen(true);
  };

  const handleDownloadContact = () => {
    // Telemetría silently
    trackCardEventAction({ slug: card.slug, eventType: 'contact_save' }).catch(() => {});

    downloadVCardWithPhoto({
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
      address: card.address,
      photoUrl: card.photoUrl,
    });
    setVcardSaved(true);
    setTimeout(() => setVcardSaved(false), 2500);
  };

  // Construir link de WhatsApp con mensaje personalizado de alta estética tipográfica
  const whatsappUrl = card.whatsapp
    ? `https://wa.me/${getWhatsAppDigits(card.whatsapp)}?text=${encodeURIComponent(
        `👋 ¡Hola ${card.title.trim()}! Vi tu *Tarjeta Digital INDI* (${card.profession.trim()}) y me gustaría conectar contigo sobre oportunidades y proyectos.`
      )}`
    : null;

  const isLightMode = Boolean(activeFinish.isLight);

  const hasCover = Boolean(card.themeConfig?.coverImageUrl);
  const hasBgImage = Boolean(card.themeConfig?.backgroundImageUrl);
  const operationalStatus = card.themeConfig?.operationalStatus;

  const getOperationalStatusDisplay = () => {
    if (!operationalStatus || operationalStatus === 'none') return null;
    switch (operationalStatus) {
      case 'open_now':
        return { label: 'Abierto ahora', color: 'bg-emerald-500' };
      case 'taking_orders':
        return { label: card.themeConfig?.customStatusText || 'Aceptando pedidos', color: 'bg-amber-500' };
      case 'available_by_appointment':
        return { label: 'Disponible con cita previa', color: 'bg-cyan-500' };
      case 'custom':
        return { label: card.themeConfig?.customStatusText || 'En servicio', color: 'bg-indigo-500' };
      default:
        return null;
    }
  };

  const statusDisplay = getOperationalStatusDisplay();

  return (
    <SmartParticles
      enabled={true}
      intensity={card.themeConfig?.particleIntensity || 'balanced'}
      behavior={card.themeConfig?.particleBehavior || 'ambient'}
      color={primaryColor}
      className="w-full max-w-sm sm:max-w-[430px] mx-auto transition-all duration-300"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={isInteractive ? { y: -4, scale: 1.01 } : undefined}
        className={`relative rounded-[2rem] p-6 sm:p-8 overflow-hidden transition-all duration-500 border backdrop-blur-2xl ${
          isLightMode ? 'text-slate-900' : 'text-white'
        } ${activeFinish.containerClass}`}
        style={{
          ...activeFinish.backgroundStyle,
          ...activeFinish.borderStyle,
        }}
      >
        {/* Fondo de Imagen Personalizado con Scrim Inteligente y Blur Adaptativo */}
        {hasBgImage && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
              style={{ backgroundImage: `url(${card.themeConfig!.backgroundImageUrl})` }}
            />
            <div 
              className={`absolute inset-0 transition-all duration-500 ${
                card.themeConfig?.backgroundOverlayBlur === 'none'
                  ? ''
                  : card.themeConfig?.backgroundOverlayBlur === 'subtle'
                  ? 'backdrop-blur-sm'
                  : card.themeConfig?.backgroundOverlayBlur === 'deep'
                  ? 'backdrop-blur-2xl'
                  : 'backdrop-blur-md'
              }`}
              style={{
                backgroundColor: isLightMode 
                  ? `rgba(255, 255, 255, ${card.themeConfig?.backgroundOverlayOpacity ?? 0.65})`
                  : `rgba(9, 10, 16, ${card.themeConfig?.backgroundOverlayOpacity ?? 0.65})`,
              }}
            />
          </div>
        )}

        {/* Textura de fondo Dot Grid sutil con alta nitidez */}
        {texture === 'dot-grid' && (
          <div 
            className="absolute inset-0 opacity-[0.22] pointer-events-none z-[1]"
            style={{
              backgroundImage: isLightMode 
                ? 'radial-gradient(rgba(15, 23, 42, 0.6) 1.2px, transparent 1.2px)'
                : 'radial-gradient(rgba(255, 255, 255, 0.85) 1.2px, transparent 1.2px)',
              backgroundSize: '18px 18px',
            }}
          />
        )}

        {/* Textura Prisma Escarchado (Frosted Prism) */}
        {texture === 'frosted-prism' && (
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay z-[1]"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 40%, rgba(255, 255, 255, 0.4) 60%, transparent 100%), radial-gradient(circle at 20% 20%, ${primaryColor}22 0%, transparent 50%)`,
              backgroundSize: '100% 100%, 100% 100%',
            }}
          />
        )}

        {/* Glow Superior Reactivo con gradiente del acabado */}
        {texture !== 'none' && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-36 blur-3xl pointer-events-none opacity-60 transition-all duration-700 z-[1]"
            style={{
              background: activeFinish.glowGradient,
            }}
          />
        )}

        {/* Banner Hero Superior de Fachada o Vitrina Temática */}
        {hasCover && (
          <div className="relative -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-4 h-32 sm:h-36 overflow-hidden rounded-t-[2rem] z-10 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.themeConfig!.coverImageUrl!}
              alt="Portada de negocio"
              className="w-full h-full object-cover select-none pointer-events-none transform transition-transform duration-700 group-hover:scale-105"
            />
            <div 
              className="absolute inset-0"
              style={{
                background: isLightMode
                  ? 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.25) 55%, rgba(0, 0, 0, 0.25) 100%)'
                  : 'linear-gradient(to top, rgba(9, 10, 16, 0.95) 0%, rgba(9, 10, 16, 0.25) 55%, rgba(0, 0, 0, 0.35) 100%)',
              }}
            />
          </div>
        )}

        {/* Badge Superior Contextual o Indicador de Acabado */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
          <span 
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border shadow-sm backdrop-blur-md ${activeFinish.tagColor}`}
            style={{ borderColor: `${primaryColor}66` }}
          >
            <Sparkles className="w-2.5 h-2.5" style={{ color: primaryColor }} />
            <span>{activeFinish.tagLabel}</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {card.themeConfig?.badgeText && (
              <span 
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase border shadow-sm backdrop-blur-md ${
                  isLightMode ? 'bg-black/5 text-slate-800 border-slate-300' : 'bg-white/10 text-white'
                }`}
                style={{ borderColor: `${primaryColor}55`, color: primaryColor }}
              >
                <span>{card.themeConfig.badgeText}</span>
              </span>
            )}
          </div>
        </div>

        {/* Header de la Tarjeta */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Foto de Perfil con Anillo de Degradado y Glow Reactivo (con solapamiento si hay portada) */}
          <div className={`relative w-24 h-24 group transition-all duration-300 ${hasCover ? '-mt-14 sm:-mt-16 mb-4' : 'mb-5'}`}>
            <div 
              className="absolute inset-0 rounded-full animate-pulse blur-md opacity-75 transition-all duration-500" 
              style={{
                background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`
              }}
            />
            <div 
              className="relative w-full h-full rounded-full p-[2.5px] transition-all duration-500 shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, #ffffff 40%, ${primaryColor})`
              }}
            >
              {card.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.photoUrl}
                  alt={card.title}
                  className="w-full h-full rounded-full object-cover bg-zinc-900 select-none pointer-events-auto shadow-inner"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              ) : (
                <div 
                  className={`w-full h-full rounded-full flex items-center justify-center text-2xl font-bold shadow-inner ${
                    isLightMode ? 'bg-slate-100 text-slate-800' : 'text-white'
                  }`}
                  style={{
                    background: isLightMode 
                      ? 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)' 
                      : 'linear-gradient(145deg, #18181b 0%, #09090b 100%)'
                  }}
                >
                  <span style={{ color: primaryColor }}>{card.title.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Insignia de Estado Operacional con LED Pulsante */}
          {statusDisplay && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border shadow-sm backdrop-blur-md mb-2 bg-black/30 text-white border-white/15">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusDisplay.color} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusDisplay.color}`}></span>
              </span>
              <span>{statusDisplay.label}</span>
            </div>
          )}

          <h2 className={`text-2xl font-bold tracking-tight mb-1 ${
            isLightMode ? 'text-slate-900' : 'text-white'
          }`}>
            {card.title}
          </h2>
          <p 
            className="text-xs uppercase tracking-widest font-bold mb-4 font-mono transition-colors duration-500"
            style={{ color: primaryColor }}
          >
            {card.profession}
          </p>

          {card.about && (
            <p className={`text-sm font-normal leading-relaxed mb-6 max-w-xs ${
              isLightMode ? 'text-slate-600' : 'text-zinc-300/90'
            }`}>
              {card.about}
            </p>
          )}
        </div>

        {/* Acciones Principales (Banda de Contacto & vCard) */}
        <div className="relative z-10 flex flex-col gap-2.5 mb-6">
          {/* Botón Guardar en Contactos (vCard 4.0 One-Tap con Color Reactivo y Contraste WCAG 2.2 AA) */}
          <button
            onClick={handleDownloadContact}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm shadow-xl active:scale-[0.98] transition-all duration-300"
            style={{
              color: buttonTextColor,
              background: `linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 70%, #000000) 100%)`,
              boxShadow: `0 10px 25px -5px ${primaryColor}55`,
            }}
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

          {/* Botón Intercambiar Contacto (Mini-CRM Bidireccional) */}
          <button
            onClick={() => setIsExchangeModalOpen(true)}
            className={`w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] ${
              isLightMode
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 border-emerald-500/30 shadow-xs'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Intercambiar Contacto</span>
          </button>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackCardEventAction({ slug: card.slug, eventType: 'whatsapp_click' }).catch(() => {});
              }}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Conectar por WhatsApp</span>
            </a>
          )}

          {card.emailContact && (
            <a
              href={`mailto:${card.emailContact}`}
              className={`w-full min-h-[44px] inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-medium active:scale-[0.98] transition-all ${
                isLightMode 
                  ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-300 shadow-sm' 
                  : 'glass-pill text-zinc-200 hover:text-white hover:bg-white/10'
              }`}
              style={{ borderColor: isLightMode ? undefined : `${primaryColor}33` }}
            >
              <Mail className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>{card.emailContact}</span>
            </a>
          )}
        </div>

        {/* Sección de Ubicación y Mapa Interactivo (si se definió dirección) */}
        {card.address && card.address.trim().length > 0 && (
          <div className={`relative z-10 mb-6 rounded-2xl overflow-hidden border backdrop-blur-md ${
            isLightMode ? 'bg-white/80 border-slate-200/90 shadow-sm' : 'bg-black/40 border-white/10'
          }`}>
            {/* Cabecera de Dirección */}
            <div className={`p-3.5 flex items-start gap-2.5 border-b ${
              isLightMode ? 'border-slate-200/80' : 'border-white/10'
            }`}>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${primaryColor}22`, color: primaryColor }}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] font-mono font-semibold uppercase block tracking-wider ${
                  isLightMode ? 'text-slate-500' : 'text-zinc-400'
                }`}>
                  Ubicación & Oficina
                </span>
                <p className={`text-xs font-medium leading-snug line-clamp-2 mt-0.5 ${
                  isLightMode ? 'text-slate-900' : 'text-white'
                }`}>
                  {card.address}
                </p>
              </div>
            </div>

            {/* Mapa Embebido con OpenStreetMap (Liviano, Privacy-First, Sin API Keys) */}
            <div className="relative w-full h-36 bg-zinc-900 overflow-hidden">
              <iframe
                title={`Mapa de ${card.title}`}
                className="w-full h-full border-0 filter contrast-[1.05] opacity-90 hover:opacity-100 transition-opacity"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-85%2C180%2C85&layer=mapnik&marker=${encodeURIComponent(card.address)}`}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-b-none" />
            </div>

            {/* Botón de Navegación Rápida GPS (Google Maps / Waze / Apple Maps) con touch target >= 44px */}
            <div className={`p-2.5 flex items-center justify-between gap-2 ${
              isLightMode ? 'bg-slate-50 border-t border-slate-200/60' : 'bg-black/60'
            }`}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] ${
                  isLightMode 
                    ? 'text-slate-800 bg-white hover:bg-slate-100 border-slate-200 shadow-xs' 
                    : 'text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>Abrir en Google Maps</span>
              </a>
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(card.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] ${
                  isLightMode 
                    ? 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200 shadow-xs' 
                    : 'text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
                }`}
                title="Abrir en Waze"
              >
                <span>Waze</span>
              </a>
            </div>
          </div>
        )}

        {/* Bloques Bento Modulares (Vitrina Interactiva) */}
        {card.bentoBlocks && card.bentoBlocks.length > 0 && (
          <div className="relative z-10 flex flex-col gap-2.5 mb-6 pt-2">
            {card.bentoBlocks.map((block) => (
              <div
                key={block.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between text-left ${
                  isLightMode 
                    ? 'bg-white/80 hover:bg-white border-slate-200/80 shadow-xs' 
                    : 'bg-white/[0.04] hover:border-white/20'
                }`}
                style={{ borderColor: isLightMode ? undefined : `${primaryColor}22` }}
              >
                <div>
                  <h4 className={`text-xs font-semibold tracking-wide ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}>
                    {block.title}
                  </h4>
                  {block.subtitle && (
                    <p className={`text-[11px] mt-0.5 leading-tight ${
                      isLightMode ? 'text-slate-500' : 'text-zinc-400'
                    }`}>
                      {block.subtitle}
                    </p>
                  )}
                </div>
                {block.metricValue && (
                  <div className="text-right">
                    <span 
                      className="text-xs font-mono font-bold"
                      style={{ color: primaryColor }}
                    >
                      {block.metricValue}
                    </span>
                    {block.metricDelta && (
                      <span className="block text-[9px] font-mono text-emerald-600">
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
                    className={`p-1 rounded-lg transition-colors ${
                      isLightMode ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Acceso a Billeteras Digitales Nativas (Apple & Google Wallet Offline) */}
        <div className="relative z-10 flex items-center justify-center gap-2 mb-6">
          <a
            href={`/api/wallet/apple/${card.slug}`}
            download={`${card.slug}-pass.json`}
            className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all active:scale-[0.98] ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-xs'
                : 'glass-pill text-zinc-300 hover:text-white border-white/10'
            }`}
            title="Guardar en Apple Wallet (Acceso con doble clic sin internet)"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.84-12-14.4-6.19-9.5-10.96-20.19-14.31-32.06-3.35-11.88-5.03-23.23-5.03-34.05 0-14.16 3.52-25.96 10.55-35.41 7.03-9.45 15.89-14.28 26.58-14.5 4.9.12 10.4 1.34 16.5 3.66 6.09 2.32 10.14 3.53 12.14 3.64 1.78-.11 5.92-1.37 12.42-3.79 6.5-2.41 12.01-3.6 16.53-3.56 12.03.74 21.64 5.37 28.84 13.88-10.5 6.35-15.65 15.22-15.43 26.6.22 8.94 3.63 16.42 10.22 22.44 6.59 6.02 14.52 9.53 23.79 10.53-2.16 6.54-4.79 13.06-7.89 19.57zM119.22 31.81c0-7.04 2.55-13.79 7.66-20.25 5.11-6.46 11.53-10.74 19.26-12.83.33 1.33.5 2.56.5 3.69 0 7.27-2.67 14.21-8.01 20.82-5.34 6.61-11.83 10.66-19.46 12.15-.1-.78-.16-1.97-.16-3.58z"/>
            </svg>
            <span>Apple Wallet</span>
          </a>
          <a
            href={`/api/wallet/google/${card.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all active:scale-[0.98] ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-xs'
                : 'glass-pill text-zinc-300 hover:text-white border-white/10'
            }`}
            title="Guardar en Google Wallet"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Wallet</span>
          </a>
        </div>

        {/* Redes Sociales y Enlaces Externos con Touch Target ergonómico >= 44x44px */}
        <div className={`relative z-10 flex items-center justify-center gap-3 mb-6 pt-4 border-t ${
          isLightMode ? 'border-slate-200' : 'border-white/5'
        }`}>
          {card.websiteUrl && (
            <a
              href={card.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-11 h-11 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${
                isLightMode 
                  ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs' 
                  : 'glass-pill text-zinc-300 hover:text-white'
              }`}
              style={{ borderColor: isLightMode ? undefined : `${primaryColor}33` }}
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
              className={`w-11 h-11 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${
                isLightMode 
                  ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs' 
                  : 'glass-pill text-zinc-300 hover:text-white'
              }`}
              style={{ borderColor: isLightMode ? undefined : `${primaryColor}33` }}
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
              className={`w-11 h-11 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${
                isLightMode 
                  ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs' 
                  : 'glass-pill text-zinc-300 hover:text-white'
              }`}
              style={{ borderColor: isLightMode ? undefined : `${primaryColor}33` }}
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
        <div className={`relative z-10 pt-4 border-t flex items-center justify-between text-xs ${
          isLightMode ? 'border-slate-200 text-slate-600' : 'border-white/10 text-zinc-400'
        }`}>
          <button
            onClick={() => setShowQR(!showQR)}
            className={`inline-flex items-center gap-1.5 transition-colors ${
              isLightMode ? 'hover:text-slate-900 font-medium' : 'hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{showQR ? 'Ocultar QR' : 'Ver QR'}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-medium transition-all"
            style={{
              background: isLightMode ? `${primaryColor}18` : `${primaryColor}26`,
              color: primaryColor,
              border: `1px solid ${primaryColor}44`,
            }}
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
            href="/login?mode=signup&callbackUrl=/start"
            className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 tracking-wider font-mono transition-colors"
          >
            <Sparkles className="w-2.5 h-2.5" style={{ color: primaryColor }} />
            <span>CREADO CON INDI</span>
          </a>
        </div>
      </motion.div>

      {/* Modal Universal de Compartir (Safe Zone 1:1 & Hápticos) */}
      <WebShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={card.title}
        role={card.profession}
        about={card.about || undefined}
        slug={card.slug}
        entityType="card"
        photoUrl={card.photoUrl || undefined}
        onShareTracked={() => {
          trackCardEventAction({ slug: card.slug, eventType: 'share' }).catch(() => {});
        }}
      />

      {/* Modal para Intercambio Bidireccional de Contactos */}
      <ExchangeContactModal
        cardId={card.id || 'demo'}
        cardTitle={card.title}
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
      />
    </SmartParticles>
  );
}
