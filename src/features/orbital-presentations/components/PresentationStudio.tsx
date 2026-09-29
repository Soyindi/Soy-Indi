'use client';

import React, { useState, useTransition } from 'react';
import { PresentationSlide, PresentationTheme, PresentationFormValues } from '@/entities/presentation/schemas';
import { SlideViewer } from '@/features/orbital-presentations/components/SlideViewer';
import { generateAiSlidesAction, upsertPresentationAction } from '@/features/orbital-presentations/actions';
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
  Maximize2,
  Wand2
} from 'lucide-react';

const AVAILABLE_THEMES: PresentationTheme[] = [
  {
    id: 'orbital-cyber',
    name: 'Orbital Cyber',
    primaryColor: '#6366f1',
    accentColor: '#22d3ee',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 75%)',
    enableParticles: true,
  },
  {
    id: 'emerald-aurora',
    name: 'Emerald Aurora',
    primaryColor: '#059669',
    accentColor: '#34d399',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #064e3b 0%, #051410 75%)',
    enableParticles: true,
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    primaryColor: '#8b5cf6',
    accentColor: '#f43f5e',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #3b0764 0%, #07030d 75%)',
    enableParticles: true,
  },
];

export function PresentationStudio() {
  const [isPending, startTransition] = useTransition();
  const [aiGenerating, startAiTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [aiTopicPrompt, setAiTopicPrompt] = useState('Arquitectura Serverless 2026');

  const [presentation, setPresentation] = useState<PresentationFormValues>({
    title: 'Evolución Arquitectónica SaaS 2026',
    slug: 'arquitectura-saas-2026',
    isPublic: true,
    themeSettings: AVAILABLE_THEMES[0],
    slidesData: [
      {
        id: 'slide-1',
        title: 'Arquitectura Distribuida en el Edge',
        subtitle: 'Baja latencia global con Turso SQLite y Vercel',
        visualType: 'concept',
        keyPoints: [
          'Eliminación total del agotamiento de conexiones en Serverless.',
          'Réplicas locales embebidas con tiempos de respuesta <10ms.',
          'Open Graph dinámico generado en milisegundos para redes sociales.',
        ],
        speakerNotes: 'Iniciar con la visión del proyecto y ventajas técnicas.',
      },
      {
        id: 'slide-2',
        title: 'Métricas de Lighthouse y Rendimiento',
        subtitle: 'Garantía 95+ en Core Web Vitals en móvil y escritorio',
        visualType: 'metrics',
        keyPoints: [
          'Largest Contentful Paint (LCP) inferior a 1 segundo.',
          'Cumulative Layout Shift (CLS) = 0 garantizado.',
          'Interacción sin latencia gracias a React 19 y Server Actions.',
        ],
        speakerNotes: 'Demostrar los datos cuantitativos obtenidos en auditorías.',
      },
      {
        id: 'slide-3',
        title: 'Seguridad y Autenticación Autónoma',
        subtitle: 'Better-Auth integrado en esquema de Drizzle ORM',
        visualType: 'architecture',
        keyPoints: [
          'Cero dependencias de servicios externos con costos por MAU.',
          'Cookies HttpOnly seguras con caché perimetral de 5 minutos.',
          'Esquema unificado y tipado de extremo a extremo.',
        ],
        speakerNotes: 'Explicar la soberanía de datos y ahorro de costos.',
      },
    ],
  });

  const activeSlide = presentation.slidesData[currentSlideIndex] || presentation.slidesData[0];

  // Generar diapositivas con IA
  const handleGenerateAi = () => {
    startAiTransition(async () => {
      const res = await generateAiSlidesAction(aiTopicPrompt, 4);
      if (res.success && res.data) {
        setPresentation((prev) => ({
          ...prev,
          slidesData: res.data,
        }));
        setCurrentSlideIndex(0);
      }
    });
  };

  // Guardar en la base de datos
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-medium text-cyan-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Orbital Studio • Presentaciones Cinematográficas</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Editor de Presentaciones
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Crea diapositivas cinemáticas interactivas con iluminación volumétrica y orquestación por IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savedSuccess ? '¡Guardada!' : 'Guardar Presentación'}</span>
          </button>
        </div>
      </div>

      {/* Barra de Asistente IA Generador */}
      <div className="mb-8 glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-indigo-500/20">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Wand2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-semibold text-white shrink-0">
            Generar Diapositivas con IA:
          </span>
          <input
            type="text"
            value={aiTopicPrompt}
            onChange={(e) => setAiTopicPrompt(e.target.value)}
            className="w-full sm:w-80 rounded-xl bg-black/50 border border-white/10 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            placeholder="Tema de la presentación..."
          />
        </div>

        <button
          onClick={handleGenerateAi}
          disabled={aiGenerating}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/40 text-xs font-semibold transition-all disabled:opacity-50"
        >
          {aiGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analizando y Estructurando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Generar Presentación</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Visualizador 16:9 Central + Controles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
        {/* Visualizador de Diapositiva Principal */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <SlideViewer
            slide={activeSlide}
            theme={presentation.themeSettings}
            slideNumber={currentSlideIndex + 1}
            totalSlides={presentation.slidesData.length}
          />

          {/* Controles de Navegación de Diapositivas */}
          <div className="flex items-center justify-between w-full mt-5 px-2">
            <button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {/* Selector de diapositiva en mini-pills */}
            <div className="flex items-center gap-2">
              {presentation.slidesData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlideIndex === idx
                      ? 'bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/50'
                      : 'bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  title={`Ir a diapositiva ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={currentSlideIndex === presentation.slidesData.length - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-30 transition-all"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel Lateral de Personalización y Temas */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selector de Temas */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              Temas Cinematográficos
            </h3>

            <div className="space-y-3">
              {AVAILABLE_THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setPresentation({ ...presentation, themeSettings: th })}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    presentation.themeSettings.id === th.id
                      ? 'bg-indigo-600/20 border-cyan-400 shadow-lg'
                      : 'bg-black/30 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-xl border border-white/20"
                      style={{ background: th.backgroundGradient }}
                    />
                    <span className="text-xs font-bold text-white">{th.name}</span>
                  </div>

                  {presentation.themeSettings.id === th.id && (
                    <Check className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Configuración de Enlace */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Enlace Público
            </h3>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-cyan-300">
              indi.bio/p/{presentation.slug}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
