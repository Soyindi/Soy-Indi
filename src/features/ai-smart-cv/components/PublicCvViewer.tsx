'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CVFormValues } from '@/entities/cv/schemas';
import { CvDocumentPreview } from '@/features/ai-smart-cv/components/CvDocumentPreview';
import { generateAndDownloadCvPdf } from '@/features/ai-smart-cv/lib/pdf-engine';
import {
  Download,
  Share2,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  ArrowLeft,
  Loader2,
  Copy,
} from 'lucide-react';

interface PublicCvViewerProps {
  cv: CVFormValues;
  slug: string;
  atsScore?: number;
}

export function PublicCvViewer({ cv, slug, atsScore = 90 }: PublicCvViewerProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pageFormat, setPageFormat] = useState<'letter' | 'a4'>('letter');

  const { content } = cv;

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await generateAndDownloadCvPdf(cv, { format: pageFormat });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Error al generar PDF en cliente:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const shareData = {
      title: `${content.fullName} • ${cv.targetRole}`,
      text: `Revisa el currículum digital e interactivo de ${content.fullName} en INDI:`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback a copiar portapapeles si el usuario cancela o falla
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Error copiando link:', err);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#090a10] text-zinc-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Luces volumétricas perimetrales */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />

      {/* Barra Superior Flotante del Visor Digital */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-zinc-950/75 border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 font-mono"
            >
              INDI
            </Link>
            <span className="text-zinc-600">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white truncate max-w-[140px] sm:max-w-xs">
                {content.fullName || cv.title}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>ATS {atsScore}/100</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector Carta / A4 */}
            <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setPageFormat('letter')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  pageFormat === 'letter'
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Carta
              </button>
              <button
                type="button"
                onClick={() => setPageFormat('a4')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  pageFormat === 'a4'
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                A4
              </button>
            </div>

            {/* Botón Compartir */}
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Compartir o copiar enlace del CV"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-300">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>

            {/* Botón Descargar PDF Vectorial ATS */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="min-h-[44px] px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              title="Descargar versión PDF vectorial con texto 100% seleccionable para ATS"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Generando PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200 stroke-[3]" />
                  <span>¡Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal con Hoja de CV y Acciones Rápidas */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 sm:pb-12">
        {/* Banner de Contacto Directo & Perfil Profesional */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{content.fullName}</span>
                <span className="text-[11px] font-normal text-zinc-400 hidden sm:inline">
                  • {cv.targetRole}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Currículum digital verificado y exportable en formato compatible con filtros ATS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {content.email && (
              <a
                href={`mailto:${content.email}`}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition flex items-center justify-center"
                title={`Enviar correo a ${content.email}`}
              >
                <Mail className="w-4 h-4 text-cyan-400" />
              </a>
            )}
            {content.phone && (
              <a
                href={`tel:${content.phone}`}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition flex items-center justify-center"
                title={`Llamar a ${content.phone}`}
              >
                <Phone className="w-4 h-4 text-emerald-400" />
              </a>
            )}
            {content.indiCardSlug && (
              <Link
                href={`/c/${content.indiCardSlug}`}
                target="_blank"
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Ver Tarjeta de Presentación Digital"
              >
                <span>Ver Tarjeta INDI</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Lienzo del Documento de CV */}
        <div className="w-full flex justify-center overflow-x-auto pb-4">
          <CvDocumentPreview cv={cv} pageFormat={pageFormat} />
        </div>
      </main>

      {/* Barra de Acciones Móvil Fija (Thumb Zone) */}
      <div className="fixed bottom-4 inset-x-4 sm:hidden z-40 p-2 rounded-2xl glass-panel border border-white/15 shadow-2xl flex items-center justify-between gap-2 backdrop-blur-2xl">
        <button
          type="button"
          onClick={handleShare}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-white/10 text-zinc-200 border border-white/15 active:scale-95 transition"
          aria-label="Compartir Currículum"
        >
          {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5 text-cyan-400" />}
        </button>

        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="flex-1 min-h-[48px] px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {downloadingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generando PDF...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>¡PDF Listo!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Descargar PDF ATS</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Minimalista */}
      <footer className="w-full py-6 text-center text-xs text-zinc-600 border-t border-white/5">
        <p>Currículum digital impulsado por INDI • Plataforma de Identidad y Productividad 2026</p>
      </footer>
    </div>
  );
}
