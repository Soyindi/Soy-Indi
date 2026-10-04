'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileText,
  Clock,
  Users,
  Volume2,
  Cpu,
  Loader2,
  AlertCircle,
  X,
  FileCode,
  Image as ImageIcon,
  LayoutTemplate,
} from 'lucide-react';
import {
  PresentationSlide,
  TargetAudience,
  PresentationTone,
  DocumentArchetype,
  PresentationDecompositionRequest,
} from '@/entities/presentation/schemas';
import {
  decomposeAndGeneratePresentationAction,
  parsePresentationDocumentAction,
} from '@/features/orbital-presentations/actions';

import { PresentationTheme } from '@/entities/presentation/schemas';

interface SmartPresentationDropzoneProps {
  onDecomposed: (
    slides: PresentationSlide[],
    metadata: { title?: string; slug?: string; theme?: PresentationTheme; pacingSeconds?: number }
  ) => void;
  onClose?: () => void;
}

const PACING_OPTIONS = [
  { minutes: 3, label: '3 min', desc: 'Elevator / Lightning Pitch', slides: '~3 slides' },
  { minutes: 5, label: '5 min', desc: 'Comité Ejecutivo / Standup', slides: '~5 slides' },
  { minutes: 10, label: '10 min', desc: 'Keynote / Demo Day', slides: '~8 slides' },
  { minutes: 20, label: '20 min', desc: 'Deep Dive / Masterclass', slides: '~12 slides' },
];

const AUDIENCES: { id: TargetAudience; label: string }[] = [
  { id: 'investors', label: 'Inversionistas (VC / Seed)' },
  { id: 'b2b_clients', label: 'Clientes & B2B' },
  { id: 'engineering', label: 'Equipo de Ingeniería' },
  { id: 'general', label: 'Audiencia General' },
];

const TONES: { id: PresentationTone; label: string }[] = [
  { id: 'orbital_cyber', label: 'Orbital Cyber (Futurista / Tech)' },
  { id: 'emerald_aurora', label: 'Emerald Aurora (Crecimiento / ESG)' },
  { id: 'deep_space', label: 'Deep Space (Impacto / Disruptivo)' },
  { id: 'solar_obsidian', label: 'Solar Obsidian (Corporativo / Premium)' },
];

const ARCHETYPES: { id: DocumentArchetype | 'auto'; label: string; desc: string }[] = [
  { id: 'auto', label: 'Auto-Adaptativo (Recomendado)', desc: 'Detecta si es técnico, negocio o auditoría' },
  { id: 'business_pitch', label: 'Pitch Deck & Negocio', desc: 'Problema, mercado, modelo y tracción' },
  { id: 'technical_architecture', label: 'Arquitectura Técnica', desc: 'Topología, APIs, resiliencia y datos' },
  { id: 'audit_report', label: 'Informe & Auditoría', desc: 'Hallazgos, métricas y mitigación' },
  { id: 'executive_strategy', label: 'Estrategia Ejecutiva', desc: 'Pilares, visión y hoja de ruta' },
  { id: 'narrative_educational', label: 'Educacional / Guía', desc: 'Fundamentos, lecciones y conceptos' },
];

export function SmartPresentationDropzone({
  onDecomposed,
  onClose,
}: SmartPresentationDropzoneProps) {
  const [inputText, setInputText] = useState('');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(5);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('investors');
  const [tone, setTone] = useState<PresentationTone>('orbital_cyber');
  const [archetype, setArchetype] = useState<DocumentArchetype | 'auto'>('auto');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isExtracting, setIsExtracting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    setUploadedFileName(file.name);

    // 1. Archivos de texto directo (TXT, MD, CSV, JSON)
    if (
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.csv')
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          setInputText(text.trim());
        }
      };
      reader.readAsText(file);
      return;
    }

    // 2. Archivos PDF, imágenes o documentos binarios que requieren extracción profunda
    setIsExtracting(true);
    try {
      let fileToSend = file;

      // Si el archivo subido es una imagen (captura de diapositiva o gráfico), comprimir en cliente a WebP
      if (file.type.startsWith('image/')) {
        try {
          const { compressImageClient } = await import('@/shared/lib/imageCompression');
          const compressed = await compressImageClient(file, {
            maxDimension: 1600,
            quality: 0.85,
            mimeType: 'image/webp',
          });
          fileToSend = compressed.file;
        } catch (compErr) {
          console.warn('[SmartPresentationDropzone] Fallback con archivo original tras error de compresión:', compErr);
        }
      }

      const formData = new FormData();
      formData.append('file', fileToSend);

      let res: { success: boolean; extractedText?: string; error?: string } | null = null;
      try {
        const response = await fetch('/api/presentations/parse', {
          method: 'POST',
          body: formData,
        });
        res = await response.json();
      } catch (fetchErr) {
        console.warn('[SmartPresentationDropzone] Fallback a Server Action:', fetchErr);
        res = await parsePresentationDocumentAction(formData);
      }

      if (res?.success && res.extractedText) {
        setInputText(res.extractedText.trim());
      } else {
        setErrorMessage(
          res?.error || `No se pudo extraer texto del archivo "${file.name}". Puedes pegar el texto manualmente abajo.`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el archivo.';
      setErrorMessage(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || inputText.length < 10) {
      setErrorMessage('Por favor ingresa al menos 10 caracteres o sube un archivo representativo.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: PresentationDecompositionRequest = {
        rawContent: inputText,
        fileName: uploadedFileName || undefined,
        durationMinutes: targetDurationMinutes,
        targetAudience,
        presentationTone: tone,
        documentArchetype: archetype !== 'auto' ? archetype : undefined,
      };

      const res = await decomposeAndGeneratePresentationAction(payload);
      if (res.success && res.data) {
        onDecomposed(res.data.slidesData, {
          title: res.data.title,
          slug: res.data.slug,
          theme: res.data.themeSettings,
          pacingSeconds: Math.round((targetDurationMinutes * 60) / res.data.slidesData.length),
        });
        if (onClose) onClose();
      } else {
        setErrorMessage(res.error || 'Ocurrió un error al descomponer la presentación.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de comunicación con el motor de IA.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-950/95 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden animate-fade-in">
      {/* Fondo con brillo ambiental */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header del Asistente */}
      <div className="flex items-start justify-between pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 border border-indigo-400/40 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Deconstrucción Inteligente SCQA
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                NVIDIA NIM • Llama 3.3 70B
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Sube un archivo, pega un texto o escribe un concepto para transformarlo en una narrativa cinematográfica.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl glass-pill text-zinc-400 hover:text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all"
            aria-label="Cerrar asistente"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 relative z-10">
        {/* Dropzone & Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Contenido Fuente o Archivo</span>
          </label>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20'
                : uploadedFileName
                ? 'border-emerald-500/50 bg-emerald-950/10'
                : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-400/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.doc,.docx,.json,.csv,image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                {isExtracting ? (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                ) : uploadedFileName ? (
                  <FileCode className="w-5 h-5 text-emerald-400" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <div className="text-xs sm:text-sm text-zinc-200">
                {isExtracting ? (
                  <span className="font-semibold text-cyan-300 animate-pulse">
                    Extrayendo contenido de {uploadedFileName}...
                  </span>
                ) : uploadedFileName ? (
                  <span className="font-semibold text-emerald-300">
                    Archivo procesado con éxito: {uploadedFileName}
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-white">Haz clic para subir un archivo</span>{' '}
                    o arrástralo aquí
                  </>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                Soporta PDF, Markdown, TXT, Word, CSV o Capturas de Datos
              </p>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder="O escribe aquí tus notas, tesis de inversión, propuesta técnica, plan de producto o concepto..."
            className="w-full rounded-2xl bg-black/50 border border-white/10 p-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-all font-sans leading-relaxed"
          />
        </div>

        {/* Parámetros: Duración, Arquetipo, Audiencia y Tono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pacing / Duración */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Tiempo de Exposición</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PACING_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.minutes}
                  onClick={() => setTargetDurationMinutes(opt.minutes)}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left flex flex-col justify-center transition-all ${
                    targetDurationMinutes === opt.minutes
                      ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-cyan-400 text-white shadow-md'
                      : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    <span className="text-[10px] font-mono text-cyan-300">{opt.slides}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Arquetipo del Documento */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-purple-400" />
              <span>Arquetipo / Formato</span>
            </label>
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value as any)}
              className="w-full min-h-[44px] rounded-xl bg-black/60 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-sans cursor-pointer"
            >
              {ARCHETYPES.map((arch) => (
                <option key={arch.id} value={arch.id} className="bg-zinc-900 text-white">
                  {arch.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500">
              Adapta la jerarquía y los tipos de diapositiva al estilo del material.
            </p>
          </div>

          {/* Audiencia Objetivo */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Audiencia Objetivo</span>
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
              className="w-full min-h-[44px] rounded-xl bg-black/60 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-sans cursor-pointer"
            >
              {AUDIENCES.map((aud) => (
                <option key={aud.id} value={aud.id} className="bg-zinc-900 text-white">
                  {aud.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500">
              Modula la densidad técnica, KPIs y el vocabulario.
            </p>
          </div>

          {/* Tono de la Narrativa */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Tono Narrativo</span>
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as PresentationTone)}
              className="w-full min-h-[44px] rounded-xl bg-black/60 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-sans cursor-pointer"
            >
              {TONES.map((t) => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                  {t.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500">
              Alinea el estilo visual y el impacto de los llamadas a acción.
            </p>
          </div>
        </div>

        {/* Mensaje de Error si ocurre */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botón de Acción Principal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Estructura de 4 Fases: Situación ➔ Complicación ➔ Pregunta ➔ Respuesta</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="w-full sm:w-auto min-h-[44px] px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Descomponiendo y Generando con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Estructurar Presentación ({targetDurationMinutes} min)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
