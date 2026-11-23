'use client';

import React, { useState, useTransition } from 'react';
import { CVContent, ApplicationPitchResult } from '@/entities/cv/schemas';
import { generateApplicationPitchAction } from '@/features/ai-smart-cv/actions';
import {
  Send,
  Copy,
  Check,
  Loader2,
  Mail,
  MessageCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { LinkedInIcon } from '@/shared/ui/icons/SocialBrandIcons';

interface ApplicationPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvContent: CVContent;
  targetRole: string;
  cvSlug?: string;
}

export function ApplicationPitchModal({
  isOpen,
  onClose,
  cvContent,
  targetRole,
  cvSlug,
}: ApplicationPitchModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [hiringManagerName, setHiringManagerName] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [activeChannel, setActiveChannel] = useState<'linkedin' | 'whatsapp' | 'email'>('linkedin');
  const [pitch, setPitch] = useState<ApplicationPitchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleGenerate = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await generateApplicationPitchAction({
        cvContent,
        targetRole: targetRole || 'Profesional',
        cvSlug,
        companyName: companyName.trim() || undefined,
        hiringManagerName: hiringManagerName.trim() || undefined,
        jobDescriptionText: jobDescriptionText.trim() || undefined,
        language: cvContent.language || 'es',
      });

      if (res.success && res.data) {
        setPitch(res.data);
      } else {
        setErrorMsg(res.error || 'No se pudo generar el kit de postulación.');
      }
    });
  };

  const handleCopy = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Silencioso
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-950 border border-emerald-500/30 shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 to-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Pitch & Carta de Postulación Multicanal</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Genera mensajes persuasivos para LinkedIn, WhatsApp y Correo con tu link INDI incluido
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                Empresa Destino (Opcional)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej. Mercado Libre, Buk, BCI..."
                className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                Nombre del Reclutador (Opcional)
              </label>
              <input
                type="text"
                value={hiringManagerName}
                onChange={(e) => setHiringManagerName(e.target.value)}
                placeholder="Ej. Camila, Equipo de Talento..."
                className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
              Contexto del Aviso Laboral (Opcional)
            </label>
            <textarea
              rows={2}
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              placeholder="Pega un resumen breve de la vacante para personalizar aún más tu mensaje..."
              className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isPending}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redactando Kit de Postulación...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{pitch ? 'Regenerar Mensajes' : 'Generar Pitch y Carta'}</span>
                </>
              )}
            </button>
          </div>

          {pitch && (
            <div className="space-y-4 pt-4 border-t border-white/10 animate-fade-in">
              {/* Tabs de Canal */}
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/50 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveChannel('linkedin')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeChannel === 'linkedin'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <LinkedInIcon className="w-3.5 h-3.5" />
                  <span>LinkedIn DM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel('whatsapp')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeChannel === 'whatsapp'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel('email')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeChannel === 'email'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Correo / Cover Letter</span>
                </button>
              </div>

              {/* Contenido del canal activo */}
              {activeChannel === 'linkedin' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {pitch.linkedinDm}
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopy(pitch.linkedinDm, 'linkedin')}
                      className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedField === 'linkedin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'linkedin' ? '¡Copiado!' : 'Copiar para LinkedIn'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeChannel === 'whatsapp' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {pitch.whatsappPitch}
                  </p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(pitch.whatsappPitch, 'whatsapp')}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedField === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'whatsapp' ? '¡Copiado!' : 'Copiar Mensaje'}</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(pitch.whatsappPitch)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir en WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {activeChannel === 'email' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="text-xs">
                    <span className="text-zinc-400 font-mono">Asunto: </span>
                    <span className="text-white font-semibold">{pitch.formalEmail.subject}</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap border-t border-white/10 pt-3">
                    {pitch.formalEmail.body}
                  </p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `Asunto: ${pitch.formalEmail.subject}\n\n${pitch.formalEmail.body}`,
                          'email'
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedField === 'email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'email' ? '¡Copiado!' : 'Copiar Correo'}</span>
                    </button>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(pitch.formalEmail.subject)}&body=${encodeURIComponent(pitch.formalEmail.body)}`}
                      className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Abrir App de Correo</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
