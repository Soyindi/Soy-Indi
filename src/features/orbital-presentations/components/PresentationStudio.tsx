'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  PresentationSlide,
  PresentationTheme,
  PresentationFormValues,
  PresentationVisualType,
} from '@/entities/presentation/schemas';
import {
  PRESENTATION_TEMPLATES,
  PRESENTATION_THEMES,
} from '@/entities/presentation/templates';
import { SlideViewer } from '@/features/orbital-presentations/components/SlideViewer';
import {
  generateAiSlidesAction,
  upsertPresentationAction,
} from '@/features/orbital-presentations/actions';
import { AppEditorHeader } from '@/shared/ui/AppEditorHeader';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Palette,
  Check,
  Loader2,
  Save,
  Play,
  Wand2,
  LayoutGrid,
  FileText,
  Layers,
  Settings,
  Eye,
  BarChart3,
  Zap,
  Clock,
  Quote,
} from 'lucide-react';

export function PresentationStudio() {
  const [isPending, startTransition] = useTransition();
  const [aiGenerating, startAiTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'theme'>('editor');

  const [aiTopicPrompt, setAiTopicPrompt] = useState('Arquitectura Serverless 2026');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('pitch-deck');

  // Inicializar con la plantilla de Pitch Deck de alta conversión
  const defaultTemplate = PRESENTATION_TEMPLATES[0];
  const [presentation, setPresentation] = useState<PresentationFormValues>(defaultTemplate.data);

  const activeSlide =
    presentation.slidesData[currentSlideIndex] || presentation.slidesData[0];

  // Aplicar plantilla curada completa
  const handleApplyTemplate = (templateId: string) => {
    const tmpl = PRESENTATION_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setPresentation({
        ...tmpl.data,
      });
      setCurrentSlideIndex(0);
    }
  };

  // Generar diapositivas con IA
  const handleGenerateAi = () => {
    startAiTransition(async () => {
      const res = await generateAiSlidesAction(aiTopicPrompt, selectedTemplateCategory, 4);
      if (res.success && res.data) {
        setPresentation((prev) => ({
          ...prev,
          slidesData: res.data,
        }));
        setCurrentSlideIndex(0);
      }
    });
  };

  // Guardar en la base de datos Turso
  const handleSave = () => {
    startTransition(async () => {
      const res = await upsertPresentationAction(presentation);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    });
  };

  // Navegación
  const nextSlide = () => {
    if (currentSlideIndex < presentation.slidesData.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // Añadir nueva diapositiva
  const handleAddSlide = () => {
    const newSlide: PresentationSlide = {
      id: crypto.randomUUID(),
      title: 'Nueva Diapositiva',
      subtitle: 'Subtítulo descriptivo de la diapositiva',
      visualType: 'concept',
      layout: 'standard',
      badgeText: `DIAPOSITIVA ${presentation.slidesData.length + 1}`,
      keyPoints: [
        'Primer punto clave representativo.',
        'Segundo punto con valor complementario.',
      ],
      speakerNotes: 'Notas del orador para guiar la exposición.',
    };

    setPresentation((prev) => ({
      ...prev,
      slidesData: [...prev.slidesData, newSlide],
    }));
    setCurrentSlideIndex(presentation.slidesData.length);
  };

  // Eliminar diapositiva actual
  const handleDeleteSlide = () => {
    if (presentation.slidesData.length <= 1) return;
    const newSlides = presentation.slidesData.filter((_, idx) => idx !== currentSlideIndex);
    setPresentation((prev) => ({
      ...prev,
      slidesData: newSlides,
    }));
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  // Actualizar campo de la diapositiva activa
  const updateActiveSlide = (field: keyof PresentationSlide, value: any) => {
    const updated = [...presentation.slidesData];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      [field]: value,
    };
    setPresentation((prev) => ({
      ...prev,
      slidesData: updated,
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8">
      {/* Header universal con retroceso al Dashboard */}
      <AppEditorHeader
        sectionTitle="Editor de Presentaciones"
        categoryName="Presentaciones Cinemáticas"
        categoryHref="/dashboard?tab=presentations"
        badgeText="Orbital Studio 16:9"
      >
        <div className="flex items-center gap-2">
          <Link
            href={`/p/${presentation.slug || 'demo'}`}
            target="_blank"
            className="min-h-[44px] hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Presentar en Vivo</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savedSuccess ? '¡Guardada!' : 'Guardar Presentación'}</span>
          </button>
        </div>
      </AppEditorHeader>

      {/* Selector de Pestañas Superiores del Estudio */}
      <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl glass-panel border border-white/10 max-w-md">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'editor'
              ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Contenido</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'templates'
              ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Plantillas ({PRESENTATION_TEMPLATES.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'theme'
              ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Diseño</span>
        </button>
      </div>

      {/* Barra de Asistente IA Generador */}
      <div className="mb-8 glass-panel rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-3 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Wand2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-mono font-semibold text-white shrink-0">
              Generar con IA:
            </span>
          </div>
          <input
            type="text"
            value={aiTopicPrompt}
            onChange={(e) => setAiTopicPrompt(e.target.value)}
            className="w-full sm:w-80 min-h-[44px] rounded-xl bg-black/50 border border-white/10 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
            placeholder="Tema central o pitch de la presentación..."
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={handleGenerateAi}
            disabled={aiGenerating}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-cyan-300 hover:bg-indigo-600/50 text-xs font-semibold transition-all disabled:opacity-50"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando Diapositivas...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Generar Diapositivas con IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Central: Visualizador 16:9 + Controles Laterales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        {/* Visualizador Principal */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <SlideViewer
            slide={activeSlide}
            theme={presentation.themeSettings}
            slideNumber={currentSlideIndex + 1}
            totalSlides={presentation.slidesData.length}
            showNotes={showSpeakerNotes}
          />

          {/* Barra de Controles y Miniaturas de Diapositiva */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-6 gap-4 px-2">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-30 transition-all border border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                onClick={nextSlide}
                disabled={currentSlideIndex === presentation.slidesData.length - 1}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-30 transition-all border border-white/10"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Diapositiva en Mini-Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
              {presentation.slidesData.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-center ${
                    currentSlideIndex === idx
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-cyan-400 shadow-md'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                  title={s.title}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={handleAddSlide}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold transition-all flex items-center justify-center"
                title="Añadir diapositiva"
              >
                <Plus className="w-4 h-4" />
              </button>

              {presentation.slidesData.length > 1 && (
                <button
                  onClick={handleDeleteSlide}
                  className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-all flex items-center justify-center"
                  title="Eliminar diapositiva actual"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel Lateral Modular según Pestaña */}
        <div className="lg:col-span-4 space-y-6">
          {/* PESTAÑA 1: EDITOR DE CONTENIDO DE LA DIAPOSITIVA */}
          {activeTab === 'editor' && (
            <div className="glass-panel rounded-3xl p-6 space-y-5 border border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Diapositiva {currentSlideIndex + 1} de {presentation.slidesData.length}
                </h3>

                <button
                  onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                  className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition-all ${
                    showSpeakerNotes
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-white/5 text-zinc-400 border-white/10'
                  }`}
                >
                  {showSpeakerNotes ? 'Ocultar Notas' : 'Ver Notas'}
                </button>
              </div>

              {/* Selector de Tipo Visual / Layout */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Tipología de Diapositiva
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'concept', label: 'Concepto', icon: Sparkles },
                    { id: 'metrics', label: 'Métricas', icon: BarChart3 },
                    { id: 'comparison', label: 'Comparativa', icon: Zap },
                    { id: 'timeline', label: 'Roadmap', icon: Clock },
                    { id: 'quote', label: 'Cita', icon: Quote },
                    { id: 'architecture', label: 'Arquitectura', icon: Layers },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = activeSlide.visualType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() =>
                          updateActiveSlide('visualType', t.id as PresentationVisualType)
                        }
                        className={`min-h-[44px] p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-indigo-600/30 border-cyan-400 text-cyan-300 shadow-sm'
                            : 'bg-black/30 border-white/5 text-zinc-400 hover:border-white/10'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título de la diapositiva */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Título de Diapositiva
                </label>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateActiveSlide('title', e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-black/50 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Subtítulo */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Subtítulo / Bajada
                </label>
                <input
                  type="text"
                  value={activeSlide.subtitle || ''}
                  onChange={(e) => updateActiveSlide('subtitle', e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-black/50 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Badge de cabecera */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Distintivo Superior (Badge)
                </label>
                <input
                  type="text"
                  value={activeSlide.badgeText || ''}
                  onChange={(e) => updateActiveSlide('badgeText', e.target.value)}
                  placeholder="Ej: EL PROBLEMA, TRACCIÓN Q3"
                  className="w-full min-h-[44px] rounded-xl bg-black/50 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Notas del orador */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Notas Privadas del Orador
                </label>
                <textarea
                  value={activeSlide.speakerNotes || ''}
                  onChange={(e) => updateActiveSlide('speakerNotes', e.target.value)}
                  rows={3}
                  placeholder="Puntos a recordar al hablar en vivo..."
                  className="w-full rounded-xl bg-black/50 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>
            </div>
          )}

          {/* PESTAÑA 2: CATÁLOGO DE PLANTILLAS PROFESIONALES */}
          {activeTab === 'templates' && (
            <div className="glass-panel rounded-3xl p-6 space-y-4 border border-white/10">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" />
                Plantillas Profesionales 2026
              </h3>

              <div className="space-y-3">
                {PRESENTATION_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl.id)}
                    className="w-full text-left p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-cyan-400/50 hover:bg-white/5 transition-all flex flex-col gap-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                      {tmpl.description}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-500 mt-2">
                      {tmpl.slidesCount} diapositivas estructuradas
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA 3: TEMAS Y DISEÑO CINEMATOGRÁFICO */}
          {activeTab === 'theme' && (
            <div className="glass-panel rounded-3xl p-6 space-y-5 border border-white/10">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Paletas y Gradientes OKLCH
              </h3>

              <div className="space-y-3">
                {PRESENTATION_THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setPresentation({ ...presentation, themeSettings: th })}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between min-h-[44px] ${
                      presentation.themeSettings.id === th.id
                        ? 'bg-indigo-600/20 border-cyan-400 shadow-lg'
                        : 'bg-black/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-xl border border-white/20 shrink-0"
                        style={{ background: th.backgroundGradient }}
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">{th.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Volumetría Reactiva
                        </span>
                      </div>
                    </div>

                    {presentation.themeSettings.id === th.id && (
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Configuración de Enlace Público */}
              <div className="pt-4 border-t border-white/10">
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Enlace de Acceso Público
                </label>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-cyan-300 truncate">
                  indi.bio/p/{presentation.slug}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BARRA DE ACCIONES INFERIOR FIJA PARA MÓVIL (THUMB ZONE) */}
      <div className="fixed bottom-4 inset-x-4 sm:hidden z-40 p-2 rounded-2xl glass-panel border border-white/15 shadow-2xl flex items-center justify-between gap-2">
        <button
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 text-zinc-300 disabled:opacity-30 border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : savedSuccess ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{savedSuccess ? '¡Guardada!' : 'Guardar'}</span>
        </button>

        <button
          onClick={nextSlide}
          disabled={currentSlideIndex === presentation.slidesData.length - 1}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 text-zinc-300 disabled:opacity-30 border border-white/10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
