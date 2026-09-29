'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool, Upload, Type } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (signatureData: {
    url: string;
    type: 'DRAWN' | 'UPLOADED' | 'TYPOGRAPHIC';
    date: string;
  }) => void;
  currentFullName: string;
}

export function SignatureModal({
  isOpen,
  onClose,
  onSaveSignature,
  currentFullName,
}: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload' | 'type'>('type');
  const [selectedFont, setSelectedFont] = useState<'cursive1' | 'cursive2' | 'cursive3'>('cursive1');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Canvas para dibujar firma
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Inicializar canvas
  useEffect(() => {
    if (isOpen && activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a'; // Tinta oscura azulada elegante
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Manejadores de dibujo
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Subir imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generar firma tipográfica a SVG/Canvas
  const generateTypographicSignature = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#0f172a';
    ctx.textBaseline = 'middle';

    const name = currentFullName || 'Firma Profesional';
    if (selectedFont === 'cursive1') {
      ctx.font = 'italic 46px "Brush Script MT", cursive, sans-serif';
    } else if (selectedFont === 'cursive2') {
      ctx.font = 'italic 40px "Lucida Handwriting", cursive, serif';
    } else {
      ctx.font = 'italic 42px "Segoe Script", cursive, sans-serif';
    }

    ctx.fillText(name, 20, 70);
    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    const currentDate = new Date().toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
    });

    if (activeTab === 'draw') {
      if (!canvasRef.current || !hasDrawn) return;
      onSaveSignature({
        url: canvasRef.current.toDataURL('image/png'),
        type: 'DRAWN',
        date: currentDate,
      });
    } else if (activeTab === 'upload') {
      if (!uploadedImage) return;
      onSaveSignature({
        url: uploadedImage,
        type: 'UPLOADED',
        date: currentDate,
      });
    } else {
      const dataUrl = generateTypographicSignature();
      onSaveSignature({
        url: dataUrl,
        type: 'TYPOGRAPHIC',
        date: currentDate,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <PenTool className="w-4 h-4 text-cyan-400" />
              Adjuntar Firma Digital Ejecutiva
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Estampa tu rúbrica formal al pie del CV para postulaciones directas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas de método de firma */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/5 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('type')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'type'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Caligráfica
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'draw'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Dibujar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Subir PNG
          </button>
        </div>

        {/* Contenido según pestaña */}
        {activeTab === 'type' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Selecciona el estilo de rúbrica formal para <strong className="text-white">{currentFullName}</strong>:
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'cursive1', label: 'Estilo Ejecutivo Clásico', fontClass: 'font-serif italic text-2xl' },
                { id: 'cursive2', label: 'Estilo Rúbrica Fluida', fontClass: 'italic text-xl tracking-wider' },
                { id: 'cursive3', label: 'Estilo Directivo Moderno', fontClass: 'font-mono italic text-xl' },
              ].map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setSelectedFont(font.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedFont === font.id
                      ? 'border-cyan-400 bg-cyan-950/30'
                      : 'border-white/5 bg-black/30 hover:border-white/20'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">{font.label}</span>
                    <span className={`text-slate-100 ${font.fontClass}`}>
                      {currentFullName || 'Firma Profesional'}
                    </span>
                  </div>
                  {selectedFont === font.id && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'draw' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Dibuja tu firma con el ratón o pantalla táctil:</span>
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar
              </button>
            </div>
            <div className="rounded-xl border border-white/20 bg-white overflow-hidden shadow-inner flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={450}
                height={160}
                className="w-full h-40 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-3">
            <label className="block border-2 border-dashed border-white/20 hover:border-cyan-400/50 rounded-xl p-6 text-center cursor-pointer bg-black/20 hover:bg-white/[0.02] transition-all">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploadedImage ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={uploadedImage} alt="Firma subida" className="max-h-24 object-contain filter invert" />
                  <span className="text-[11px] text-cyan-300">Haz clic para cambiar imagen</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-cyan-400" />
                  <p className="text-xs text-slate-300 font-medium">Sube una foto o PNG de tu firma</p>
                  <span className="text-[10px] text-slate-500">Recomendado: fondo transparente (PNG)</span>
                </div>
              )}
            </label>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
          >
            Estampar Firma en CV
          </button>
        </div>
      </div>
    </div>
  );
}
