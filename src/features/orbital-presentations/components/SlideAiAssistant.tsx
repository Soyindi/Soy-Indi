'use client';

import React, { useState, useTransition } from 'react';
import {
  Sparkles,
  Wand2,
  Check,
  Loader2,
  RefreshCw,
  Lightbulb,
  MessageSquareQuote,
  ListOrdered,
  Volume2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  PresentationSlide,
  TargetAudience,
  PresentationTone,
} from '@/entities/presentation/schemas';
import { refineSlideWithAiAction } from '@/features/orbital-presentations/actions';

interface SlideAiAssistantProps {
  slide: PresentationSlide;
  presentationTitle?: string;
  targetAudience?: TargetAudience;
  tone?: PresentationTone;
  slideIndex?: number;
  totalSlides?: number;
  onApplyEnhancements: (updates: Partial<PresentationSlide>) => void;
}

export function SlideAiAssistant({
  slide,
  presentationTitle,
  targetAudience = 'investors',
  tone = 'orbital_cyber',
  slideIndex,
  totalSlides,
  onApplyEnhancements,
}: SlideAiAssistantProps) {
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<
    'action_title' | 'punchy_bullets' | 'speaker_notes' | 'all_enhancements' | null
  >(null);
  const [lastRationale, setLastRationale] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedAction, setAppliedAction] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handleTriggerRefinement = (
    action: 'action_title' | 'punchy_bullets' | 'speaker_notes' | 'all_enhancements'
  ) => {
    setActiveAction(action);
    setLastRationale(null);
    setErrorMessage(null);

    startTransition(async () => {
      const res = await refineSlideWithAiAction({
        slide,
        action,
        presentationContext: {
          presentationTitle,
          targetAudience,
          tone,
          slideIndex,
          totalSlides,
        },
      });

      if (res.success && res.data) {
        const updates: Partial<PresentationSlide> = {};

        if (action === 'action_title' || action === 'all_enhancements') {
          if (res.data.actionTitle) updates.actionTitle = res.data.actionTitle;
        }

        if (action === 'punchy_bullets' || action === 'all_enhancements') {
          if (res.data.keyPoints && res.data.keyPoints.length > 0) {
            updates.keyPoints = res.data.keyPoints;
          }
        }

        if (action === 'speaker_notes' || action === 'all_enhancements') {
          if (res.data.speakerNotes) updates.speakerNotes = res.data.speakerNotes;
        }

        if (action === 'all_enhancements' && res.data.suggestedVisualType) {
          updates.visualType = res.data.suggestedVisualType;
        }

        onApplyEnhancements(updates);
        setLastRationale(res.data.rationale || 'Mejora aplicada con éxito.');
        setAppliedAction(action);
        setTimeout(() => setAppliedAction(null), 3000);
      } else if (!res.success) {
        setErrorMessage(res.error || 'No fue posible optimizar la diapositiva.');
      }
      setActiveAction(null);
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-cyan-500/25 bg-gradient-to-br from-indigo-950/30 via-black/40 to-cyan-950/20 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Copiloto IA de Diapositiva
            </h4>
            <p className="text-[10px] text-zinc-400">
              Metodología McKinsey & Síntesis Ejecutiva
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="min-h-[44px] min-w-[44px] p-2 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          title={isExpanded ? 'Contraer asistente' : 'Expandir asistente'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* 1. Generar Titular Estratégico */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTriggerRefinement('action_title')}
              className={`min-h-[44px] p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                appliedAction === 'action_title'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/40 border-white/10 hover:border-cyan-400/40 hover:bg-white/5 text-zinc-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold block">Titular Estratégico</span>
                <span className="text-[9px] text-zinc-400 block">Conclusión clara y directa (&lt;14 palabras)</span>
              </div>
            </button>

            {/* 2. Viñetas de Impacto */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTriggerRefinement('punchy_bullets')}
              className={`min-h-[44px] p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                appliedAction === 'punchy_bullets'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/40 border-white/10 hover:border-cyan-400/40 hover:bg-white/5 text-zinc-200'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold block">Viñetas de Impacto</span>
                <span className="text-[9px] text-zinc-400 block">Con verbos de acción</span>
              </div>
            </button>

            {/* 3. Guion del Orador */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTriggerRefinement('speaker_notes')}
              className={`min-h-[44px] p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                appliedAction === 'speaker_notes'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/40 border-white/10 hover:border-cyan-400/40 hover:bg-white/5 text-zinc-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold block">Notas del Orador</span>
                <span className="text-[9px] text-zinc-400 block">Guion verbal (~45-60s)</span>
              </div>
            </button>

            {/* 4. Optimización Completa */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTriggerRefinement('all_enhancements')}
              className={`min-h-[44px] p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                appliedAction === 'all_enhancements'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-indigo-600/20 border-indigo-500/30 hover:bg-indigo-600/30 text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold block">Optimizar Diapositiva</span>
                <span className="text-[9px] text-zinc-300 block">Título, viñetas y orador</span>
              </div>
            </button>
          </div>

          {/* Estado de Carga o Feedback */}
          {isPending && (
            <div className="flex items-center gap-2 text-xs text-cyan-300 py-1 font-mono animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sintetizando mejoras con IA para la diapositiva...</span>
            </div>
          )}

          {lastRationale && !isPending && (
            <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[10px] text-cyan-200/90 font-mono">
              💡 {lastRationale}
            </div>
          )}

          {errorMessage && !isPending && (
            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[10px] text-rose-300 font-mono">
              ⚠️ {errorMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
}

