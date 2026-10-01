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
import { PublicPresentationViewer } from '@/features/orbital-presentations/components/PublicPresentationViewer';
import { SmartPresentationDropzone } from '@/features/orbital-presentations/components/SmartPresentationDropzone';
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
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface PresentationStudioProps {
  initialData?: PresentationFormValues;
  initialPresentationId?: string;
}

export function PresentationStudio({
  initialData,
  initialPresentationId,
}: PresentationStudioProps = {}) {
  const [isPending, startTransition] = useTransition();
  const [aiGenerating, startAiTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'theme'>('editor');
  const [isLivePresenting, setIsLivePresenting] = useState(false);
  const [showDecomposerModal, setShowDecomposerModal] = useState(false);
  const [presentationId, setPresentationId] = useState<string | null>(initialPresentationId || null);

  const [aiTopicPrompt, setAiTopicPrompt] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('pitch-deck');

  // Inicializar con la plantilla de Pitch Deck o la data cargada
  const defaultTemplate = PRESENTATION_TEMPLATES[0];
  const [presentation, setPresentation] = useState<PresentationFormValues>(
    initialData || defaultTemplate.data
  );

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
    if (!aiTopicPrompt.trim()) {
      setShowDecomposerModal(true);
      return;
    }
    startAiTransition(async () => {
      const res = await generateAiSlidesAction(aiTopicPrompt, selectedTemplateCategory, 4);
      if (res.success && res.data) {
        setPresentation((prev) => ({
          ...prev,
          title: aiTopicPrompt.trim(),
          slidesData: res.data,
        }));
        setCurrentSlideIndex(0);
      }
    });
  };

  // Guardar en la base de datos Turso de forma idempotente
  const handleSave = () => {
    startTransition(async () => {
      const res = await upsertPresentationAction(presentation, presentationId || undefined);
      if (res.success) {
        if (res.id) {
          setPresentationId(res.id);
        }
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    });
  };

  // Reordenar diapositivas
  const moveSlideLeft = (index: number) => {
    if (index <= 0) return;
    const newSlides = [...presentation.slidesData];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index - 1];
    newSlides[index - 1] = temp;
    setPresentation((prev) => ({ ...prev, slidesData: newSlides }));
    setCurrentSlideIndex(index - 1);
  };

  const moveSlideRight = (index: number) => {
    if (index >= presentation.slidesData.length - 1) return;
    const newSlides = [...presentation.slidesData];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + 1];
    newSlides[index + 1] = temp;
    setPresentation((prev) => ({ ...prev, slidesData: newSlides }));
    setCurrentSlideIndex(index + 1);
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
      {/* Modal / Overlay de Deconstrucción Inteligente SCQA con NVIDIA NIM */}
      {showDecomposerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto custom-scrollbar">
            <SmartPresentationDropzone
              onDecomposed={(newSlides, meta) => {
                setPresentation((prev) => ({
                  ...prev,
                  title: meta.title || prev.title,
                  slidesData: newSlides,
                }));
                setCurrentSlideIndex(0);
                setShowDecomposerModal(false);
              }}
              onClose={() => setShowDecomposerModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modo Presentación en Vivo In-Situ (Cero 404, Directo desde Memoria) */}
      {isLivePresenting && (
        <div className="fixed inset-0 z-50 bg-black animate-fade-in">
          <PublicPresentationViewer
            title={presentation.title}
            slides={presentation.slidesData}
            theme={presentation.themeSettings}
            slug={presentation.slug || 'live-preview'}
            onExit={() => setIsLivePresenting(false)}
          />
        </div>
      )}

      {/* Header universal con retroceso al Dashboard */}
      <AppEditorHeader
        sectionTitle="Editor de Presentaciones"
        categoryName="Presentaciones Cinemáticas"
        categoryHref="/dashboard?tab=presentations"
        badgeText="Orbital Studio 16:9"
      >
        <div className="flex items-center gap-2">
          {/* Botón Deconstrucción Inteligente SCQA */}
          <button
            onClick={() => setShowDecomposerModal(true)}
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white hover:bg-cyan-500/30 text-xs font-semibold transition-all active:scale-[0.98]"
            title="Sube archivos o conceptos para desestructurar con IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Descomponer con IA</span>
          </button>

          {/* Botón Presentar en Vivo In-Situ */}
          <button
            onClick={() => setIsLivePresenting(true)}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white border border-white/15 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Presentar en Vivo</span>
          </button>

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

      {/* Barra de Asistente IA Generador Rápido */}
      <div className="mb-8 glass-panel rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-3 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Wand2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-mono font-semibold text-white shrink-0">
              Tema Rápido:
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
            onClick={() => setShowDecomposerModal(true)}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Modo Avanzado (SCQA / Archivos)</span>
          </button>

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
                <span>Generación Directa</span>
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
                <>
                  {/* Botones de reordenamiento de diapositiva */}
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 ml-1">
                    <button
                      onClick={() => moveSlideLeft(currentSlideIndex)}
                      disabled={currentSlideIndex === 0}
                      className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
                      title="Mover diapositiva hacia la izquierda (anterior posición)"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSlideRight(currentSlideIndex)}
                      disabled={currentSlideIndex === presentation.slidesData.length - 1}
                      className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
                      title="Mover diapositiva hacia la derecha (siguiente posición)"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleDeleteSlide}
                    className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
                    title="Eliminar diapositiva actual"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
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

              {/* Action Title (Principio de la Pirámide de McKinsey) */}
              <div>
                <label className="block text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Action Title (Pirámide McKinsey)</span>
                  <span className="text-[10px] text-zinc-500">Asertivo &lt;15 palabras</span>
                </label>
                <input
                  type="text"
                  value={activeSlide.actionTitle || ''}
                  onChange={(e) => updateActiveSlide('actionTitle', e.target.value)}
                  placeholder="Conclusión clave y asertiva de la diapositiva..."
                  className="w-full min-h-[44px] rounded-xl bg-black/50 border border-cyan-500/30 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                />
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

              {/* Puntos Clave / Key Points (Viñetas Argumentales) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    Puntos Clave ({activeSlide.keyPoints?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...(activeSlide.keyPoints || []), 'Nuevo punto argumental'];
                      updateActiveSlide('keyPoints', updated);
                    }}
                    className="text-[10px] font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Añadir Viñeta
                  </button>
                </div>
                <div className="space-y-2">
                  {(activeSlide.keyPoints || []).map((kp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={kp}
                        onChange={(e) => {
                          const updated = [...activeSlide.keyPoints];
                          updated[idx] = e.target.value;
                          updateActiveSlide('keyPoints', updated);
                        }}
                        className="flex-1 min-h-[38px] rounded-xl bg-black/50 border border-white/10 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = activeSlide.keyPoints.filter((_, i) => i !== idx);
                          updateActiveSlide('keyPoints', updated);
                        }}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-rose-400 transition cursor-pointer rounded-xl hover:bg-rose-500/10"
                        title="Eliminar punto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editores Contextuales por Tipología Visual */}
              {activeSlide.visualType === 'metrics' && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">
                      Tarjetas de Métricas / KPIs
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = activeSlide.metricsData || [];
                        updateActiveSlide('metricsData', [
                          ...current,
                          { label: 'Nueva Métrica', value: '100%', change: '+10%', trend: 'up' },
                        ]);
                      }}
                      className="text-[10px] font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Métrica
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(activeSlide.metricsData || []).map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={m.label}
                            onChange={(e) => {
                              const updated = [...(activeSlide.metricsData || [])];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              updateActiveSlide('metricsData', updated);
                            }}
                            placeholder="Etiqueta"
                            className="flex-1 rounded-lg bg-black/60 border border-white/10 px-2 py-1 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (activeSlide.metricsData || []).filter((_, i) => i !== idx);
                              updateActiveSlide('metricsData', updated);
                            }}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-rose-400 p-1 rounded-xl hover:bg-rose-500/10 cursor-pointer"
                            title="Eliminar métrica"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={m.value}
                            onChange={(e) => {
                              const updated = [...(activeSlide.metricsData || [])];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              updateActiveSlide('metricsData', updated);
                            }}
                            placeholder="Valor (ej: 42.8%)"
                            className="rounded-lg bg-black/60 border border-white/10 px-2 py-1 text-xs text-cyan-300 font-bold"
                          />
                          <input
                            type="text"
                            value={m.change || ''}
                            onChange={(e) => {
                              const updated = [...(activeSlide.metricsData || [])];
                              updated[idx] = { ...updated[idx], change: e.target.value };
                              updateActiveSlide('metricsData', updated);
                            }}
                            placeholder="Delta (ej: +340%)"
                            className="rounded-lg bg-black/60 border border-white/10 px-2 py-1 text-xs text-emerald-400 font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSlide.visualType === 'comparison' && activeSlide.comparisonData && (
                <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-3">
                  <span className="text-[11px] font-mono font-bold text-rose-300 uppercase block">
                    Títulos de Comparativa
                  </span>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Antes / Tradicional</label>
                      <input
                        type="text"
                        value={activeSlide.comparisonData.beforeTitle}
                        onChange={(e) => {
                          updateActiveSlide('comparisonData', {
                            ...activeSlide.comparisonData,
                            beforeTitle: e.target.value,
                          });
                        }}
                        className="w-full rounded-lg bg-black/60 border border-white/10 px-2.5 py-1.5 text-xs text-rose-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Después / INDI 2026</label>
                      <input
                        type="text"
                        value={activeSlide.comparisonData.afterTitle}
                        onChange={(e) => {
                          updateActiveSlide('comparisonData', {
                            ...activeSlide.comparisonData,
                            afterTitle: e.target.value,
                          });
                        }}
                        className="w-full rounded-lg bg-black/60 border border-white/10 px-2.5 py-1.5 text-xs text-emerald-300 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSlide.visualType === 'quote' && activeSlide.quoteData && (
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-amber-300 uppercase block">
                    Contenido del Testimonio
                  </span>
                  <textarea
                    rows={2}
                    value={activeSlide.quoteData.quote}
                    onChange={(e) => {
                      updateActiveSlide('quoteData', {
                        ...activeSlide.quoteData,
                        quote: e.target.value,
                      });
                    }}
                    placeholder="Cita textual..."
                    className="w-full rounded-lg bg-black/60 border border-white/10 p-2 text-xs text-zinc-200"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={activeSlide.quoteData.author}
                      onChange={(e) => {
                        updateActiveSlide('quoteData', {
                          ...activeSlide.quoteData,
                          author: e.target.value,
                        });
                      }}
                      placeholder="Autor"
                      className="rounded-lg bg-black/60 border border-white/10 px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={activeSlide.quoteData.role || ''}
                      onChange={(e) => {
                        updateActiveSlide('quoteData', {
                          ...activeSlide.quoteData,
                          role: e.target.value,
                        });
                      }}
                      placeholder="Cargo / Entidad"
                      className="rounded-lg bg-black/60 border border-white/10 px-2 py-1 text-xs text-cyan-300 font-mono"
                    />
                  </div>
                </div>
              )}

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
