'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { BRAND_ASSETS } from '@/entities/brand/schemas';
import { Play, Pause, Volume2, VolumeX, Sparkles, Download, Layers, ShieldCheck, Zap } from 'lucide-react';

export function BrandIdentityShowcase() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedAssetKey, setSelectedAssetKey] = useState<string>('alienSymbol');
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const selectedAsset = BRAND_ASSETS[selectedAssetKey] || BRAND_ASSETS.alienSymbol;

  return (
    <section id="identidad" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24">
      {/* Encabezado de Sección */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-medium text-cyan-300 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Identidad Visual Oficial • 2026 Design System</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Diseñado para destacar.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300">
            En cualquier pantalla.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
          Nuestra identidad visual fusiona geometría alienígena futurista con tipografía de precisión suiza. 
          Todos los recursos están optimizados en WebP de ultra-baja latencia (&lt;15 KB) para una carga instantánea.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Video Reveal Interactivo Cinemático */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/20 shadow-2xl shadow-indigo-500/10 group">
            {/* Ambient Backdrop Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 via-cyan-500/5 to-transparent pointer-events-none" />

            <video
              ref={videoRef}
              src={BRAND_ASSETS.brandRevealVideo.url}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-auto aspect-video object-cover"
              aria-label="Animación oficial de la marca INDI"
            />

            {/* Controles Flotantes del Video (Touch Targets >= 44px) */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? 'Pausar video' : 'Reproducir video'}
                  aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 text-cyan-300" /> : <Play className="w-5 h-5 text-cyan-300 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
                  aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-zinc-400" /> : <Volume2 className="w-5 h-5 text-cyan-300" />}
                </button>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono font-medium text-cyan-300">
                1080p Web-Optimized • 575 KB
              </div>
            </div>
          </div>

          {/* Especificaciones de Rendimiento Core Web Vitals */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
              <span className="block text-xl font-black text-emerald-400 mb-0.5">98.3%</span>
              <span className="text-[11px] text-zinc-400 font-medium">Compresión WebP</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
              <span className="block text-xl font-black text-cyan-400 mb-0.5">&lt;15 KB</span>
              <span className="text-[11px] text-zinc-400 font-medium">Peso Promedio</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
              <span className="block text-xl font-black text-indigo-400 mb-0.5">0.00</span>
              <span className="text-[11px] text-zinc-400 font-medium">Cumulative Shift</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Catálogo Interactivo de Recursos */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Selector de Recursos Oficiales
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {selectedAsset.aspectRatio}
              </span>
            </div>

            {/* Vista Previa del Activo Seleccionado */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center p-4 mb-4">
              <Image
                src={selectedAsset.url}
                alt={selectedAsset.alt}
                width={selectedAsset.width}
                height={selectedAsset.height}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_16px_rgba(34,211,238,0.2)]"
              />
            </div>

            {/* Metadatos y Descripción */}
            <div className="space-y-2 mb-4">
              <h3 className="text-base font-bold text-white">{selectedAsset.name}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{selectedAsset.description}</p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400 font-mono">
                <span className="text-cyan-300 font-semibold">Uso Oficial:</span> {selectedAsset.recommendedUse}
              </div>
            </div>

            {/* Selector de Activos en Botones Táctiles (>= 44px) */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { key: 'alienSymbol', label: 'Isotipo', icon: Layers },
                { key: 'techLockupSm', label: 'Lockup', icon: Zap },
                { key: 'stackedHero', label: 'Móvil', icon: ShieldCheck },
                { key: 'vectorLight', label: 'Vector', icon: Sparkles },
              ].map((item) => {
                const isSelected = selectedAssetKey === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedAssetKey(item.key)}
                    className={`min-h-[44px] p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                        : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Botón de Descarga Directa del Recurso Oficial */}
            <a
              href={selectedAsset.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Activo ({selectedAsset.format.toUpperCase()})</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
