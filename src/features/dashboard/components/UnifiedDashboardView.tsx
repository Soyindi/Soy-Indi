'use client';

import React, { useState, useTransition } from 'react';
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
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Edit3
} from 'lucide-react';
import { deleteCardAction, toggleCardActiveAction } from '@/features/card-builder/dashboard-actions';
import { deletePresentationAction } from '@/features/orbital-presentations/actions';
import { deleteSmartCvAction } from '@/features/ai-smart-cv/actions';
import { useSession, signOut } from '@/shared/lib/auth-client';
import { AuthModal } from '@/features/dashboard/components/AuthModal';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

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
  initialTab?: 'cards' | 'cvs' | 'presentations';
  justCreatedSlug?: string | null;
}

export function UnifiedDashboardView({
  initialCards,
  initialCvs,
  initialPresentations,
  initialTab = 'cards',
  justCreatedSlug,
}: UnifiedDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'cards' | 'cvs' | 'presentations'>(initialTab);
  const [cardsList, setCardsList] = useState<CardItem[]>(initialCards);
  const [cvsList, setCvsList] = useState<CvItem[]>(initialCvs);
  const [presentationsList, setPresentationsList] = useState<any[]>(initialPresentations);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedPresSlug, setCopiedPresSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: sessionData, isPending: isSessionLoading } = useSession();

  // Filtrado de tarjetas
  const filteredCards = cardsList.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Totales de analítica
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
            >
              <span>Ver en Vivo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Barra de Navegación Global del Dashboard */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/start"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm"
            title="Volver al Selector de Inicio"
          >
            <span className="text-zinc-500 group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Menú de Inicio</span>
          </Link>

          <Link href="/" className="flex items-center gap-2" title="Ir a la Web Principal">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-black/80 rounded-[7px] flex items-center justify-center">
                <span className="font-black text-xs text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-200">
                  IN
                </span>
              </div>
            </div>
            <span className="text-sm font-bold tracking-tight text-white hidden sm:inline-block">INDI</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/pricing"
            className="text-xs text-zinc-400 hover:text-white transition hidden md:inline-block"
          >
            Planes y Precios
          </Link>
          <Link
            href="/start"
            className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 font-mono font-medium transition"
          >
            + Nuevo Proyecto
          </Link>

          {/* Estado de Cuenta / Autenticación Multi-Cuenta */}
          {sessionData?.user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] shrink-0" title={sessionData.user.email || ''}>
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
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold hover:opacity-95 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acceder con Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        callbackUrl="/dashboard"
      />

      {/* Cabecera Principal del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-medium text-indigo-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Suite Profesional Unificada INDI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Panel de Control General
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Administra tus tarjetas digitales, currículums calibrados con ATS y presentaciones en un solo lugar.
          </p>
        </div>

        {/* Botón contextual de creación rápida */}
        <div className="flex items-center gap-2">
          {activeTab === 'cards' && (
            <Link
              href="/cards/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Tarjeta</span>
            </Link>
          )}
          {activeTab === 'cvs' && (
            <Link
              href="/cv"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Crear o Mejorar CV</span>
            </Link>
          )}
          {activeTab === 'presentations' && (
            <Link
              href="/presentations"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Presentación</span>
            </Link>
          )}
        </div>
      </div>

      {/* Selector de Pestañas Unificado (Tabs) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/10 mb-8 max-w-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
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
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'cvs'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Smart CVs ({initialCvs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('presentations')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'presentations'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MonitorPlay className="w-4 h-4" />
          <span>Presentaciones ({initialPresentations.length})</span>
        </button>
      </div>

      {/* ================= PESTAÑA 1: TARJETAS DIGITALES ================= */}
      {activeTab === 'cards' && (
        <div className="space-y-8 animate-fade-in">
          {/* Métricas rápidas calculadas con Telemetría en Tiempo Real */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-panel rounded-2xl p-5 flex items-center justify-between border border-cyan-500/20">
              <div>
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Total Visitas
                </span>
                <p className="text-3xl font-black text-white mt-1">{totalViews.toLocaleString()}</p>
                <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  Lecturas en Edge
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Eye className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 flex items-center justify-between border border-indigo-500/20">
              <div>
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Clicks & vCard
                </span>
                <p className="text-3xl font-black text-white mt-1">{totalClicks.toLocaleString()}</p>
                <span className="text-[11px] text-indigo-400 font-mono mt-1 block">Contactos & WhatsApp</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <MousePointerClick className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 flex items-center justify-between border border-purple-500/20">
              <div>
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Conversión
                </span>
                <p className="text-3xl font-black text-white mt-1">
                  {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0'}%
                </p>
                <span className="text-[11px] text-purple-400 font-mono flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3" />
                  Efectividad vCard
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 flex items-center justify-between border border-emerald-500/20">
              <div>
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Tarjetas Activas
                </span>
                <p className="text-3xl font-black text-white mt-1">
                  {activeCardsCount} <span className="text-sm font-normal text-zinc-500">/ {cardsList.length}</span>
                </p>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Públicas y accesibles
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Buscador */}
          <div className="flex items-center gap-3 glass-panel rounded-2xl px-4 py-3 border border-white/5">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar tarjeta por nombre, especialidad o enlace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none w-full"
            />
          </div>

          {/* Listado de Tarjetas */}
          {filteredCards.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-white/5">
              <QrCode className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No se encontraron tarjetas</h3>
              <p className="text-xs text-zinc-400 mb-6">Crea tu primera tarjeta de presentación digital con enlace vivo.</p>
              <Link
                href="/cards/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Tarjeta Ahora</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={`glass-panel rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                    card.isActive ? 'border-white/10 hover:border-indigo-500/40' : 'border-white/5 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{card.title}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{card.profession}</p>
                      </div>
                      <button
                        onClick={() => handleToggleActiveCard(card.id, card.isActive)}
                        className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer ${
                          card.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                        }`}
                        title={card.isActive ? 'Desactivar Tarjeta' : 'Activar Tarjeta'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 py-3 my-3 border-y border-white/5">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        {card.viewsCount || 0} visitas
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
                        {card.clicksCount || 0} clicks
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-500 truncate mb-4">
                      indi.bio/c/{card.slug}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
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
                      className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition flex items-center justify-center cursor-pointer"
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
            <div className="text-center py-16 glass-panel rounded-3xl border border-white/5">
              <BrainCircuit className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Aún no tienes Currículums creados</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Optimiza tu CV para superar los filtros ATS y genera un formato A4 profesional listo para enviar.
              </p>
              <Link
                href="/cv"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Optimizar mi CV con IA</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cvsList.map((cv) => {
                const score = cv.atsScore ?? 75;
                const scoreColor =
                  score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                  score >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                  'text-rose-400 bg-rose-500/10 border-rose-500/30';

                return (
                  <div
                    key={cv.id}
                    className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">{cv.title}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">{cv.targetRole}</p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-xl border font-mono font-bold text-xs ${scoreColor}`}>
                          ATS {score}/100
                        </div>
                      </div>

                      <div className="space-y-1.5 py-3 my-2 text-xs text-zinc-400 border-y border-white/5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Plantilla Imprimible: {cv.templateId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Actualizado: {new Date(cv.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <Link
                        href="/cv"
                        className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs shadow-sm hover:opacity-95 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Abrir Editor A4</span>
                      </Link>

                      <button
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
            <div className="text-center py-16 glass-panel rounded-3xl border border-white/5">
              <MonitorPlay className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No hay presentaciones registradas</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Diseña diapositivas cinemáticas en proporción 16:9 con asistente de Inteligencia Artificial.
              </p>
              <Link
                href="/presentations"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Presentación 16:9</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presentationsList.map((pres) => {
                const slidesCount = Array.isArray(pres.slidesData) ? pres.slidesData.length : 4;
                return (
                  <div
                    key={pres.id}
                    className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">{pres.title}</h3>
                          <span className="text-[11px] font-mono text-zinc-500 mt-0.5 block truncate">
                            /{pres.slug}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[10px]">
                          16:9 HD
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 py-3 my-2 border-y border-white/5">
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
                        href={`/presentations?slug=${pres.slug || ''}`}
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
    </div>
  );
}
