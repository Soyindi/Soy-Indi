'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Award, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SmartDocumentDropzoneProps {
  onCvParsed: (extractedCv: any) => void;
  onCredentialParsed: (credential: any) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  currentEducation: Array<{ degree: string; institution: string; year: string }>;
}

export function SmartDocumentDropzone({
  onCvParsed,
  onCredentialParsed,
  isProcessing,
  setIsProcessing,
  currentEducation,
}: SmartDocumentDropzoneProps) {
  const [activeTab, setActiveTab] = useState<'cv' | 'credential'>('cv');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const credentialFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, type: 'cv' | 'credential') => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      let fileToSend = file;
      let clientExtractedText = '';

      // 1. Si es imagen (foto de CV o captura de diploma), comprimir en cliente a WebP (< 150KB)
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
          console.warn('[SmartDocumentDropzone] Fallback con archivo original tras error de compresión:', compErr);
        }
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // 2. Si es PDF, extraer texto directamente en el navegador con unpdf (Client-Side Parsing)
        // Esto reduce una carga de 10MB a menos de 10KB, evitando por completo el error HTTP 413 de Vercel/AWS.
        setStatusMessage('Extrayendo texto del PDF directamente en tu navegador...');
        try {
          const { extractTextFromPdfClient } = await import('@/shared/lib/clientDocumentExtractor');
          clientExtractedText = await extractTextFromPdfClient(file);
        } catch (pdfClientErr) {
          console.warn('[SmartDocumentDropzone] Extracción client-side no disponible, usando fallback:', pdfClientErr);
        }
      }

      // 3. Si el archivo sigue siendo muy pesado (> 4.2 MB) y no se pudo extraer texto (ej. PDF escaneado como imagen pura)
      if (fileToSend.size > 4.2 * 1024 * 1024 && !clientExtractedText) {
        throw new Error(
          `El archivo "${file.name}" (${(fileToSend.size / (1024 * 1024)).toFixed(1)} MB) supera el límite de transferencia de red (4.5 MB). Si es un documento escaneado, puedes subirlo como imagen JPG/PNG para compresión automática.`
        );
      }

      const formData = new FormData();
      formData.append('fileName', file.name);

      // Si el archivo es menor a 4.2 MB, lo adjuntamos siempre para validación de firma o procesamiento multimodal
      if (fileToSend.size <= 4.2 * 1024 * 1024) {
        formData.append('file', fileToSend);
      }

      if (clientExtractedText && clientExtractedText.trim().length > 20) {
        formData.append('extractedText', clientExtractedText);
      }

      if (type === 'cv') {
        formData.append('type', 'cv');
        setStatusMessage('Analizando competencias y aplicando sanitización EU AI Act...');
        
        let result: any = null;
        try {
          const res = await fetch('/api/cv/parse', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            if (res.status === 413) {
              throw new Error(`El archivo "${file.name}" excede el límite de carga de la red (4.5 MB).`);
            }
            const errorText = await res.text();
            let parsedError = '';
            try {
              const errJson = JSON.parse(errorText);
              parsedError = errJson.error;
            } catch {
              parsedError = errorText || `Error HTTP ${res.status}`;
            }
            throw new Error(parsedError || 'Error procesando documento en el servidor.');
          }

          result = await res.json();
        } catch (fetchErr: any) {
          console.warn('[SmartDocumentDropzone] Fallback a Server Action:', fetchErr);
          if (fetchErr?.message?.includes('4.5 MB') || fetchErr?.message?.includes('413')) {
            throw fetchErr;
          }
          const { parseCvDocumentAction } = await import('@/features/ai-smart-cv/actions');
          result = await parseCvDocumentAction(formData);
        }

        if (result?.success && result.data) {
          setStatusMessage('¡Extracción completada con éxito! Reescritura STAR / Google XYZ lista.');
          onCvParsed(result.data);
          setTimeout(() => setStatusMessage(null), 4000);
        } else {
          setErrorMessage(result?.error || 'No pudimos procesar el archivo.');
        }
      } else {
        formData.append('type', 'credential');
        formData.append('currentEducation', JSON.stringify(currentEducation));
        setStatusMessage('Inspeccionando diploma y buscando coincidencias con tu sección de Educación...');
        
        let result: any = null;
        try {
          const res = await fetch('/api/cv/parse', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            if (res.status === 413) {
              throw new Error(`El archivo "${file.name}" excede el límite de carga de la red (4.5 MB).`);
            }
            const errorText = await res.text();
            let parsedError = '';
            try {
              const errJson = JSON.parse(errorText);
              parsedError = errJson.error;
            } catch {
              parsedError = errorText || `Error HTTP ${res.status}`;
            }
            throw new Error(parsedError || 'Error procesando diploma en el servidor.');
          }

          result = await res.json();
        } catch (fetchErr: any) {
          console.warn('[SmartDocumentDropzone] Fallback a Server Action de credencial:', fetchErr);
          if (fetchErr?.message?.includes('4.5 MB') || fetchErr?.message?.includes('413')) {
            throw fetchErr;
          }
          const { parseCredentialDocumentAction } = await import('@/features/ai-smart-cv/actions');
          result = await parseCredentialDocumentAction(formData, currentEducation);
        }

        if (result?.success && result.credential) {
          setStatusMessage('¡Título académico validado y vinculado semánticamente!');
          onCredentialParsed(result.credential);
          setTimeout(() => setStatusMessage(null), 4000);
        } else {
          setErrorMessage(result?.error || 'No se pudo verificar el título.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error durante el análisis del documento.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file, activeTab);
    }
  };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-8">
      {/* Resplandor superior */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Selector de tipo de carga */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Ingesta Inteligente de Documentos Multimodal
            </h3>
            <p className="text-xs text-slate-400">
              Soporte para layouts complejos, diplomas universitarios y reescritura STAR / Google XYZ
            </p>
          </div>
        </div>

        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('cv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'cv'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Subir Currículum
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credential')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'credential'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Adjuntar Título / Diploma
          </button>
        </div>
      </div>

      {/* Zona de Drop interactiva */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => {
          if (isProcessing) return;
          if (activeTab === 'cv') cvFileInputRef.current?.click();
          else credentialFileInputRef.current?.click();
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
          isProcessing
            ? 'border-cyan-500/40 bg-cyan-950/20 pointer-events-none'
            : 'border-white/15 hover:border-cyan-400/50 hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={cvFileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) handleFileUpload(file, 'cv');
          }}
        />
        <input
          ref={credentialFileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) handleFileUpload(file, 'credential');
          }}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm font-medium text-white">{statusMessage || 'Procesando archivo...'}</p>
            <span className="text-xs text-slate-400">Extrayendo texto, tablas y métricas cuantificables...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-1 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-200 font-medium">
              {activeTab === 'cv'
                ? 'Arrastra tu CV en PDF o imagen para auto-completar el formulario'
                : 'Arrastra tu Título Universitario, Diploma o Certificación'}
            </p>
            <p className="text-xs text-slate-400">
              Formatos soportados: PDF, PNG, JPG hasta 10MB • Detección Qwen2.5-VL / Gemini Vision
            </p>
          </div>
        )}
      </div>

      {/* Feedback de estado exitoso o error */}
      {statusMessage && !isProcessing && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
