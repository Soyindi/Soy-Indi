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
  Calendar,
  Layers,
  TrendingUp,
  Search
} from 'lucide-react';
import { deleteCardAction, toggleCardActiveAction } from '@/features/card-builder/dashboard-actions';

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

interface CardsDashboardViewProps {
  initialCards: CardItem[];
}

export function CardsDashboardView({ initialCards }: CardsDashboardViewProps) {
  const [cardsList, setCardsList] = useState<CardItem[]>(initialCards);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filtrado reactivo por término de búsqueda
  const filteredCards = cardsList.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Totales agregados
  const totalViews = cardsList.reduce((acc, c) => acc + (c.viewsCount || 0), 0);
  const totalClicks = cardsList.reduce((acc, c) => acc + (c.clicksCount || 0), 0);
  const activeCardsCount = cardsList.filter((c) => c.isActive).length;

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/c/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la tarjeta "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteCardAction(id);
      if (res.success) {
        setCardsList((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-medium text-indigo-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestor de Identidad Digital</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Mis Tarjetas Digitales
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Monitorea el impacto de tus enlaces, visitas en tiempo real y gestiona tus perfiles.
          </p>
        </div>

        <Link
          href="/cards/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Crear Nueva Tarjeta</span>
        </Link>
      </div>

      {/* Tarjetas de Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Total Visitas
            </span>
            <p className="text-3xl font-black text-white mt-1">
              {totalViews.toLocaleString()}
            </p>
            <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Lecturas Edge
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Interacciones (Clicks)
            </span>
            <p className="text-3xl font-black text-white mt-1">
              {totalClicks.toLocaleString()}
            </p>
            <span className="text-[11px] text-indigo-400 font-mono mt-1 block">
              WhatsApp & Redes
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Tarjetas Activas
            </span>
            <p className="text-3xl font-black text-white mt-1">
              {activeCardsCount} <span className="text-sm font-normal text-zinc-500">/ {cardsList.length}</span>
            </p>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
              ● Online y Visibles
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, cargo o enlace..."
            className="w-full rounded-xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Listado de Tarjetas */}
      {filteredCards.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <QrCode className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No se encontraron tarjetas</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
            Aún no has creado tarjetas o el filtro de búsqueda no coincide con ninguna.
          </p>
          <Link
            href="/cards/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear mi primera tarjeta</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((c) => (
            <div
              key={c.id}
              className={`glass-panel rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                !c.isActive ? 'opacity-60 border-zinc-800' : 'hover:border-indigo-500/40 hover:-translate-y-1'
              }`}
            >
              <div>
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-indigo-500 to-cyan-400">
                      {c.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.photoUrl}
                          alt={c.title}
                          className="w-full h-full rounded-full object-cover bg-zinc-900"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-sm text-white">
                          {c.title.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white leading-tight">
                        {c.title}
                      </h4>
                      <p className="text-xs text-cyan-300 font-medium font-mono mt-0.5">
                        {c.profession}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      c.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    {c.isActive ? 'ACTIVA' : 'PAUSADA'}
                  </span>
                </div>

                {/* Enlace público */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/5 text-xs font-mono text-zinc-400 mb-5">
                  <span className="truncate mr-2">indi.bio/c/{c.slug}</span>
                  <button
                    onClick={() => handleCopyLink(c.slug)}
                    className="p-1 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                    title="Copiar Enlace"
                  >
                    {copiedSlug === c.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Métricas individuales */}
                <div className="grid grid-cols-2 gap-3 mb-5 py-3 border-y border-white/5 text-center">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Visitas</span>
                    <p className="text-lg font-bold text-white mt-0.5">{c.viewsCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Clicks</span>
                    <p className="text-lg font-bold text-cyan-400 mt-0.5">{c.clicksCount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Botonera de Acciones */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/c/${c.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-all"
                  >
                    <span>Ver</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => handleToggleActive(c.id, c.isActive)}
                    disabled={isPending}
                    className={`p-2 rounded-lg border transition-all ${
                      c.isActive
                        ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={c.isActive ? 'Pausar Tarjeta' : 'Activar Tarjeta'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(c.id, c.title)}
                  disabled={isPending}
                  className="p-2 rounded-lg border border-red-500/10 text-zinc-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                  title="Eliminar Tarjeta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
