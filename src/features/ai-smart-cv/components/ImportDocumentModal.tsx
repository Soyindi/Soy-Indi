'use client';

import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { SmartDocumentDropzone } from '@/features/ai-smart-cv/components/SmartDocumentDropzone';

interface ImportDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCvParsed: (extractedCv: any) => void;
  onCredentialParsed: (credential: any) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  currentEducation: Array<{ degree: string; institution: string; year: string }>;
}

export function ImportDocumentModal({
  isOpen,
  onClose,
  onCvParsed,
  onCredentialParsed,
  isProcessing,
  setIsProcessing,
  currentEducation,
}: ImportDocumentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Importación Inteligente Multimodal
              </h2>
              <p className="text-xs text-slate-400">
                Procesamiento de documentos con Qwen2.5-VL y Gemini Vision
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <SmartDocumentDropzone
          onCvParsed={(data) => {
            onCvParsed(data);
            setTimeout(onClose, 1200);
          }}
          onCredentialParsed={(cred) => {
            onCredentialParsed(cred);
            setTimeout(onClose, 1200);
          }}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          currentEducation={currentEducation}
        />
      </div>
    </div>
  );
}
