'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Plus, 
  ExternalLink, 
  Eye, 
  MousePointerClick, 
  Trash2, 
  Copy, 
  Check, 
  Power, 
  QrCode,
  Share2, 
  Layers, 
  TrendingUp, 
  Search,
  FileText,
  MonitorPlay,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Play,
  Edit3,
  X
} from 'lucide-react';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { deleteCardAction, toggleCardActiveAction } from '@/features/card-builder/dashboard-actions';
import { deletePresentationAction } from '@/features/orbital-presentations/actions';
import { deleteSmartCvAction } from '@/features/ai-smart-cv/actions';
import { useSession, signOut } from '@/shared/lib/auth-client';
import { AuthModal } from '@/features/dashboard/components/AuthModal';
import { DashboardEmptyState } from '@/features/dashboard/components/DashboardEmptyState';
import { LogIn, LogOut, Users } from 'lucide-react';
import { AffiliateDashboardTab } from '@/features/affiliates/components/AffiliateDashboardTab';
import type { AffiliateOverview } from '@/entities/affiliate/schemas';

interface CardItem {
  id: string;
  slug: string;
  title: string;
  profession: string;
  viewsCount: number;
  clicksCount: number;
  isActive: boolean;
  createdAt: Date;
  photoUrl?: string | null;
  themeConfig?: any;
}

interface CvItem {
  id: string;
  title: string;
  targetRole: string;
  slug?: string | null;
  isPublic?: boolean | null;
  viewsCount?: number | null;
  atsScore: number | null;
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PresentationItem {
  id: string;
  title: string;
  slug: string;
  isPublic: boolean;
  viewsCount: number;
  slidesData?: any;
  createdAt: Date;
}

interface UnifiedDashboardViewProps {
  initialCards: CardItem[];
  initialCvs: CvItem[];
  initialPresentations: PresentationItem[];
  initialAffiliateOverview?: AffiliateOverview | null;
  initialTab?: 'cards' | 'cvs' | 'presentations' | 'affiliates';
  justCreatedSlug?: string | null;
}

export function UnifiedDashboardView({
  initialCards,
  initialCvs,
  initialPresentations,
  initialAffiliateOverview,
  initialTab = 'cards',
  justCreatedSlug,
}: UnifiedDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'cards' | 'cvs' | 'presentations' | 'affiliates'>(initialTab);

  // Sincronizar pestaña activa cuando se navega con parámetro ?tab= en la URL
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [cardsList, setCardsList] = useState<CardItem[]>(initialCards);
  const [cvsList, setCvsList] = useState<CvItem[]>(initialCvs);
  const [presentationsList, setPresentationsList] = useState<any[]>(initialPresentations);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedPresSlug, setCopiedPresSlug] = useState<string | null>(null);
  const [copiedCvSlug, setCopiedCvSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: sessionData } = useSession();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atajo de teclado accesible global: Ctrl+K o '/' para enfocar buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtrado reactivo contextual según la pestaña activa
  const filteredCards = cardsList.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCvs = cvsList.filter(
    (cv) =>
      cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cv.slug && cv.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPresentations = presentationsList.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.slug && p.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Totales de analítica para Tarjetas
  const totalViews = cardsList.reduce((acc, c) => acc + (c.viewsCount || 0), 0);
  const totalClicks = cardsList.reduce((acc, c) => acc + (c.clicksCount || 0), 0);
  const activeCardsCount = cardsList.filter((c) => c.isActive).length;

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/c/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleCopyPresentationLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedPresSlug(slug);
    setTimeout(() => setCopiedPresSlug(null), 2500);
  };

  const handleCopyCvLink = (slug: string) => {
    const url = `${window.location.origin}/cv/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedCvSlug(slug);
    setTimeout(() => setCopiedCvSlug(null), 2500);
  };

  const handleDeleteCard = (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la tarjeta "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteCardAction(id);
      if (res.success) {
        setCardsList((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  const handleDeleteCv = (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el currículum "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteSmartCvAction(id);
      if (res.success) {
        setCvsList((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  const handleDeletePresentation = (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la presentación "${title}"?`)) return;

    startTransition(async () => {
      const res = await deletePresentationAction(id);
      if (res.success) {
        setPresentationsList((prev) => prev.filter((p) => p.id !== id));
      }
    });
  };

  const handleToggleActiveCard = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleCardActiveAction(id, currentStatus);
      if (res.success) {
        setCardsList((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
        );
      }
    });
  };

  // Metadatos de la acción contextual activa
  const contextualAction = {
    cards: {
      href: '/cards/new',
      label: 'Nueva Tarjeta',
      gradient: 'from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-cyan-500/20',
      icon: <QrCode className="w-4 h-4" />
    },
    cvs: {
      href: '/cv',
      label: 'Crear o Mejorar CV',
      gradient: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20',
      icon: <FileText className="w-4 h-4" />
    },
    presentations: {
      href: '/presentations',
      label: 'Nueva Presentación',
      gradient: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20',
      icon: <MonitorPlay className="w-4 h-4" />
    },
    affiliates: {
      href: '/dashboard?tab=affiliates',
      label: 'Compartir Mi Enlace',
      gradient: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20',
      icon: <Users className="w-4 h-4" />
    }
  }[activeTab] || {
    href: '/cards/new',
    label: 'Nueva Tarjeta',
    gradient: 'from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-cyan-500/20',
    icon: <QrCode className="w-4 h-4" />
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8">
      {/* Notificación de éxito post-creación */}
      {justCreatedSlug && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs sm:text-sm font-semibold">
              ¡Tu proyecto se ha publicado con éxito en Turso SQLite!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/c/${justCreatedSlug}`}
              target="_blank"
              className="min-h-[44px] text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
            >
              <span>Ver en Vivo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Barra de Navegación Global del Dashboard (Minimalista & Cero Redundancias) */}
      <header className="flex items-center justify-between pb-4 sm:pb-6 mb-6 sm:mb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Logo Oficial INDI con retorno a la Portada Web */}
          <Link href="/" title="Ir a la portada de INDI" className="flex items-center gap-2 group">
            <BrandLogo size="md" showText={false} />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Estado de Cuenta / Autenticación Multi-Cuenta */}

          {/* Estado de Cuenta / Autenticación Multi-Cuenta */}
          {sessionData?.user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] shrink-0" 
                title={sessionData.user.email || sessionData.user.name || 'Usuario'}
              >
                {sessionData.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sessionData.user.image}
                    alt={sessionData.user.name || 'Usuario'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                    {(sessionData.user.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer flex items-center justify-center"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold hover:opacity-95 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acceder</span>
            </button>
          )}
        </div>
      </header>

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        callbackUrl="/dashboard"
      />

      {/* Cabecera Principal del Dashboard con Jerarquía Ejecutiva */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold text-cyan-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Suite Profesional Unificada INDI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Panel de Control General
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Administra tus tarjetas digitales, currículums calibrados con ATS y presentaciones cinemáticas en un solo lugar.
          </p>
        </div>

        {/* Botón contextual primario en escritorio */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href={contextualAction.href}
            className={`min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r ${contextualAction.gradient} text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{contextualAction.label}</span>
          </Link>
        </div>
      </div>

      {/* Barra de Herramientas Unificada (Selector de Pestañas + Buscador Contextual) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 sm:mb-8">
        {/* Selector de Pestañas Unificado con snap horizontal */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel border border-white/10 overflow-x-auto scrollbar-none snap-x">
          <button
            onClick={() => setActiveTab('cards')}
            className={`min-h-[44px] min-w-[130px] flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer snap-start ${
              activeTab === 'cards'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Tarjetas ({cardsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cvs')}
            className={`min-h-[44px] min-w-[140px] flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer snap-start ${
              activeTab === 'cvs'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Smart CVs ({cvsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('presentations')}
            className={`min-h-[44px] min-w-[160px] flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer snap-start ${
              activeTab === 'presentations'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MonitorPlay className="w-4 h-4" />
            <span>Presentaciones ({presentationsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('affiliates')}
            className={`min-h-[44px] min-w-[150px] flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer snap-start ${
              activeTab === 'affiliates'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Afiliados (25% CLP)</span>
          </button>
        </div>

        {/* Buscador inteligente integrado con atajo de teclado */}
        <div className="relative flex-1 max-w-md">
          <div className="flex items-center gap-2.5 glass-panel rounded-2xl px-3.5 py-2.5 border border-white/10 focus-within:border-cyan-500/50 transition-colors">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Buscar en ${activeTab === 'cards' ? 'tarjetas' : activeTab === 'cvs' ? 'currículums' : 'presentaciones'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none w-full"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 select-none">
                Ctrl K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* ================= PESTAÑA 1: TARJETAS DIGITALES ================= */}
      {activeTab === 'cards' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* Métricas rápidas calculadas con Telemetría en Tiempo Real */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`glass-panel rounded-2xl p-5 flex items-center justify-between border ${cardsList.length > 0 ? 'border-cyan-500/20' : 'border-white/5 opacity-80'}`}>
              <div>
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Total Visitas
                </span>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">{totalViews.toLocaleString()}</p>
                <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {totalViews > 0 ? 'Lecturas en Edge' : 'Esperando visitas'}
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Eye className="w-5 h-5" />
              </div>
            </div>

            <div className={`glass-panel rounded-2xl p-5 flex items-center justify-between border ${cardsList.length > 0 ? 'border-indigo-500/20' : 'border-white/5 opacity-80'}`}>
              <div>
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Clicks & vCard
                </span>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">{totalClicks.toLocaleString()}</p>
                <span className="text-[11px] text-indigo-400 font-mono mt-1 block">Contactos & WhatsApp</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <MousePointerClick className="w-5 h-5" />
              </div>
            </div>

            <div className={`glass-panel rounded-2xl p-5 flex items-center justify-between border ${cardsList.length > 0 ? 'border-purple-500/20' : 'border-white/5 opacity-80'}`}>
              <div>
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Conversión
                </span>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0'}%
                </p>
                <span className="text-[11px] text-purple-400 font-mono flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3" />
                  Efectividad vCard
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className={`glass-panel rounded-2xl p-5 flex items-center justify-between border ${cardsList.length > 0 ? 'border-emerald-500/20' : 'border-white/5 opacity-80'}`}>
              <div>
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Tarjetas Activas
                </span>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {activeCardsCount} <span className="text-sm font-normal text-zinc-500">/ {cardsList.length}</span>
                </p>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Públicas y vivas
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Listado de Tarjetas o Estado Vacío Inductivo */}
          {cardsList.length === 0 ? (
            <DashboardEmptyState type="cards" />
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-3xl border border-white/5">
              <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Sin coincidencias para &ldquo;{searchQuery}&rdquo;</h3>
              <p className="text-xs text-zinc-400 mb-4">Intenta buscar por otro término o limpia el filtro.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 transition cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={`glass-panel rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between ${
                    card.isActive ? 'border-white/10 hover:border-indigo-500/40' : 'border-white/5 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{card.title}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{card.profession}</p>
                      </div>
                      <button
                        onClick={() => handleToggleActiveCard(card.id, card.isActive)}
                        className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer ${
                          card.isActive ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                        }`}
                        title={card.isActive ? 'Desactivar Tarjeta' : 'Activar Tarjeta'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 py-2.5 my-2 border-y border-white/5">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        {card.viewsCount || 0} visitas
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
                        {card.clicksCount || 0} clicks
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-500 truncate mb-3">
                      /c/{card.slug}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => handleCopyLink(card.slug)}
                      className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
                    >
                      {copiedSlug === card.slug ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/c/${card.slug}`}
                      target="_blank"
                      className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition flex items-center justify-center"
                      title="Ver Tarjeta en Vivo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/cards/new?id=${card.id}`}
                      className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition flex items-center justify-center"
                      title="Editar Tarjeta"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDeleteCard(card.id, card.title)}
                      className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition flex items-center justify-center cursor-pointer"
                      title="Eliminar Tarjeta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= PESTAÑA 2: SMART CVS (ATS) ================= */}
      {activeTab === 'cvs' && (
        <div className="space-y-6 animate-fade-in">
          {cvsList.length === 0 ? (
            <DashboardEmptyState type="cvs" />
          ) : filteredCvs.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-3xl border border-white/5">
              <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Sin coincidencias para &ldquo;{searchQuery}&rdquo;</h3>
              <p className="text-xs text-zinc-400 mb-4">Intenta buscar por otro cargo o nombre de currículum.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 transition cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCvs.map((cv) => {
                const score = cv.atsScore ?? 75;
                const scoreColor =
                  score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                  score >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                  'text-rose-400 bg-rose-500/10 border-rose-500/30';

                return (
                  <div
                    key={cv.id}
                    className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{cv.title}</h3>
                            {cv.isPublic !== false ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Digital Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                                Privado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{cv.targetRole}</p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-xl border font-mono font-bold text-xs ${scoreColor}`}>
                          ATS {score}/100
                        </div>
                      </div>

                      {cv.slug && (
                        <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-zinc-300 font-mono">
                          <Share2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="truncate">/cv/{cv.slug}</span>
                        </div>
                      )}

                      <div className="space-y-1.5 py-2.5 my-2 text-xs text-zinc-400 border-y border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Plantilla: {cv.templateId}</span>
                          </div>
                          {typeof cv.viewsCount === 'number' && (
                            <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
                              <Eye className="w-3.5 h-3.5 text-teal-400" />
                              <span>{cv.viewsCount} {cv.viewsCount === 1 ? 'visita' : 'visitas'}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Actualizado: {new Date(cv.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      {cv.slug && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopyCvLink(cv.slug!)}
                            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
                          >
                            {copiedCvSlug === cv.slug ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar Link</span>
                              </>
                            )}
                          </button>

                          <Link
                            href={`/cv/${cv.slug}`}
                            target="_blank"
                            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition flex items-center justify-center"
                            title="Ver CV Digital en Vivo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </>
                      )}

                      <Link
                        href={`/cv?id=${cv.id}`}
                        className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs shadow-sm hover:opacity-95 transition ${!cv.slug ? 'flex-1' : ''}`}
                        title="Abrir Editor A4"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className={cv.slug ? 'hidden sm:inline' : 'inline'}>Editar</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteCv(cv.id, cv.title)}
                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition flex items-center justify-center cursor-pointer"
                        title="Eliminar Currículum"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= PESTAÑA 3: PRESENTACIONES ================= */}
      {activeTab === 'presentations' && (
        <div className="space-y-6 animate-fade-in">
          {presentationsList.length === 0 ? (
            <DashboardEmptyState type="presentations" />
          ) : filteredPresentations.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-3xl border border-white/5">
              <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Sin coincidencias para &ldquo;{searchQuery}&rdquo;</h3>
              <p className="text-xs text-zinc-400 mb-4">Intenta buscar por otro título de presentación.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 transition cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPresentations.map((pres) => {
                const slidesCount = Array.isArray(pres.slidesData) ? pres.slidesData.length : 4;
                return (
                  <div
                    key={pres.id}
                    className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{pres.title}</h3>
                          <span className="text-[11px] font-mono text-zinc-500 mt-0.5 block truncate">
                            /p/{pres.slug}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[10px]">
                          16:9 HD
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 py-2.5 my-2 border-y border-white/5">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          {slidesCount} diapositivas
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          {pres.viewsCount || 0} vistas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleCopyPresentationLink(pres.slug)}
                        className="min-h-[44px] px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                        title="Copiar enlace de presentación"
                      >
                        {copiedPresSlug === pres.slug ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copiar Link</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/presentations?id=${pres.id}`}
                        className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs shadow-sm hover:opacity-95 transition"
                      >
                        <MonitorPlay className="w-3.5 h-3.5" />
                        <span>Abrir Estudio</span>
                      </Link>

                      <Link
                        href={`/p/${pres.slug || 'demo'}`}
                        target="_blank"
                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition flex items-center justify-center text-xs font-semibold"
                        title="Ver presentación en vivo"
                      >
                        <Play className="w-3.5 h-3.5 text-cyan-400" />
                      </Link>

                      <button
                        onClick={() => handleDeletePresentation(pres.id, pres.title)}
                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition flex items-center justify-center cursor-pointer"
                        title="Eliminar presentación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= PESTAÑA 4: PROGRAMA DE AFILIADOS ================= */}
      {activeTab === 'affiliates' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {initialAffiliateOverview ? (
            <AffiliateDashboardTab overview={initialAffiliateOverview} />
          ) : (
            <div className="glass-panel rounded-3xl p-8 text-center text-zinc-400">
              Cargando información del programa de afiliados...
            </div>
          )}
        </div>
      )}

      {/* Floating Action Bar Móvil (Thumb Zone Ergonómico para móviles) */}
      <div className="fixed bottom-4 inset-x-4 sm:hidden z-30 pointer-events-none">
        <div className="pointer-events-auto max-w-sm mx-auto p-1.5 rounded-2xl glass-panel border border-white/15 shadow-2xl backdrop-blur-2xl">
          <Link
            href={contextualAction.href}
            className={`min-h-[48px] w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r ${contextualAction.gradient} text-white font-bold text-xs shadow-lg active:scale-[0.98] transition-all`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{contextualAction.label}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
