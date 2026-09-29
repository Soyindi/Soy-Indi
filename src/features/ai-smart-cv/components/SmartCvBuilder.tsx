'use client';

import React, { useState, useTransition } from 'react';
import { CVFormValues, AtsAuditResult, VerifiedCredential } from '@/entities/cv/schemas';
import { auditAtsScoreAction, upsertSmartCvAction } from '@/features/ai-smart-cv/actions';
import { CvDocumentPreview } from '@/features/ai-smart-cv/components/CvDocumentPreview';
import { ImportDocumentModal } from '@/features/ai-smart-cv/components/ImportDocumentModal';
import { SignatureModal } from '@/features/ai-smart-cv/components/SignatureModal';
import { InlineAiWriter } from '@/features/ai-smart-cv/components/InlineAiWriter';
import { generateAndDownloadCvPdf } from '@/features/ai-smart-cv/lib/pdf-engine';
import { AppEditorHeader } from '@/shared/ui/AppEditorHeader';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  FileText, 
  Loader2,
  Award,
  UploadCloud,
  Eye,
  Edit3,
  Layers,
  PenTool,
  Link2,
  Globe,
  Trash2,
  Download,
  Plus,
  Wand2
} from 'lucide-react';

export function SmartCvBuilder() {
  const [isPending, startTransition] = useTransition();
  const [auditPending, startAuditTransition] = useTransition();
  const [isDropzoneProcessing, setIsDropzoneProcessing] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentScore, setCurrentScore] = useState<number>(85);
  const [auditReport, setAuditReport] = useState<AtsAuditResult | null>(null);

  // Modo de visualización: 'split' (ambos), 'edit' (solo editor), 'preview' (solo documento)
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  // Formato de página: 'letter' (EE.UU./Tech/Silicon Valley) o 'a4' (LatAm/Europa/Global)
  const [pageFormat, setPageFormat] = useState<'letter' | 'a4'>('letter');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CVFormValues>({
    title: 'CV Ejecutivo 2026',
    targetRole: 'Senior Full Stack Engineer & Software Architect',
    templateId: 'executive-modern',
    content: {
      fullName: 'Matías Riquelme',
      email: 'matias@indi.bio',
      phone: '+56 9 8765 4321',
      location: 'Santiago / Remoto Global',
      rut: '18.492.041-K',
      linkedinUrl: 'linkedin.com/in/matias-riquelme',
      websiteUrl: 'github.com/matiquelmec',
      signatureUrl: '',
      signatureType: 'NONE',
      signatureDate: '',
      summary: 'Ingeniero de Software Senior con más de 7 años de experiencia diseñando arquitecturas serverless de alta concurrencia en el Edge, microservicios distribuidos con SQLite y liderando equipos multidisciplinarios bajo metodologías ágiles.',
      skills: ['TypeScript', 'React 19', 'Next.js 16', 'Turso SQLite', 'Drizzle ORM', 'Tailwind CSS v4', 'Arquitectura Serverless', 'Cloudflare Workers', 'Zod', 'Docker'],
      experience: [
        {
          company: 'Indi Digital Ecosystems',
          role: 'Lead Architect & Core Engineer',
          period: '2024 - Presente',
          bullets: [
            'Diseñé la arquitectura distribuida en Turso LibSQL, reduciendo la latencia P95 a 18ms para más de 100k consultas concurrentes.',
            'Implementé un sistema de caché de borde para perfiles públicos, alcanzando una tasa de acierto del 98% en Cloudflare.',
          ],
          detailedBullets: [
            {
              text: 'Diseñé la arquitectura distribuida en Turso LibSQL, reduciendo la latencia P95 a 18ms para más de 100k consultas concurrentes.',
              needs_metric: false,
            },
            {
              text: 'Implementé un sistema de caché de borde para perfiles públicos, alcanzando una tasa de acierto del 98% en Cloudflare.',
              needs_metric: false,
            },
          ],
        },
        {
          company: 'Vanguard Tech LatAm',
          role: 'Senior Frontend Engineer',
          period: '2021 - 2024',
          bullets: [
            'Lideré la migración completa a Next.js App Router, recortando el First Contentful Paint en un 42% en redes 4G.',
            'Estandaricé la librería de componentes bajo directrices de accesibilidad WCAG y APCA para todo el equipo de producto.',
          ],
          detailedBullets: [
            {
              text: 'Lideré la migración completa a Next.js App Router, recortando el First Contentful Paint en un 42% en redes 4G.',
              needs_metric: false,
            },
            {
              text: 'Estandaricé la librería de componentes bajo directrices de accesibilidad WCAG y APCA para todo el equipo de producto.',
              needs_metric: true,
            },
          ],
        },
      ],
      education: [
        {
          degree: 'Ingeniería Civil en Computación e Informática',
          institution: 'Universidad de Chile',
          year: '2016 - 2021',
          credentialType: 'DEGREE',
        },
      ],
      credentials: [
        {
          id: 'cred-1',
          issuingInstitution: 'Universidad de Chile',
          credentialName: 'Título Profesional de Ingeniero Civil en Computación',
          issueDate: '2021',
          verificationCode: 'UCH-REG-849204-CL',
          validationStatus: 'SEMANTIC_MATCH',
          mappedEducationIndex: 0,
        },
      ],
    },
  });

  const handleContentChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  const handleCvParsed = (extractedCv: Partial<CVFormValues>) => {
    setFormData((prev) => ({
      ...prev,
      title: extractedCv.title || prev.title,
      targetRole: extractedCv.targetRole || prev.targetRole,
      content: {
        ...prev.content,
        ...extractedCv.content,
      },
    }));
  };

  const handleCredentialParsed = (credential: VerifiedCredential) => {
    setFormData((prev) => {
      const existingCredentials = prev.content.credentials || [];
      const updatedEducation = [...prev.content.education];

      if (
        credential.mappedEducationIndex !== undefined &&
        updatedEducation[credential.mappedEducationIndex]
      ) {
        updatedEducation[credential.mappedEducationIndex] = {
          ...updatedEducation[credential.mappedEducationIndex],
          credentialType: 'DEGREE',
          verifiedCredentialId: credential.verificationCode,
        };
      }

      return {
        ...prev,
        content: {
          ...prev.content,
          education: updatedEducation,
          credentials: [...existingCredentials, credential],
        },
      };
    });
  };

  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        experience: [
          ...prev.content.experience,
          {
            company: 'Nueva Institución / Empresa',
            role: 'Cargo Profesional',
            period: '2023 - Presente',
            bullets: ['Logré [resultado de impacto], medido por [métrica], haciendo [acción técnica].'],
            detailedBullets: [{ text: 'Logré [resultado], medido por [métrica], haciendo [acción].', needs_metric: true }],
          },
        ],
      },
    }));
  };

  const handleDeleteExperience = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        experience: prev.content.experience.filter((_, i) => i !== idx),
      },
    }));
  };

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        education: [
          ...prev.content.education,
          {
            degree: 'Título Profesional o Grado',
            institution: 'Universidad o Instituto',
            year: 'Año de Graduación',
            credentialType: 'UNVERIFIED',
          },
        ],
      },
    }));
  };

  const handleDeleteEducation = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        education: prev.content.education.filter((_, i) => i !== idx),
      },
    }));
  };

  const handlePurgeEducationDates = () => {
    setFormData((prev) => {
      const isDateOnly = (text: string) => {
        const lower = text.toLowerCase();
        return (
          /^(santiago|valdiviana|chile|puerto|punta)?[,\s]*\d{1,2}\s+de\s+[a-z]+\s+(?:del?\s+)?\d{4}/i.test(lower) ||
          /^\d{1,2}\s+de\s+[a-z]+\s+de\s+\d{4}/i.test(lower) ||
          /^fecha\s+de\s+emisi/i.test(lower)
        );
      };
      const cleaned = prev.content.education.filter(
        (edu) => !isDateOnly(edu.degree) && !isDateOnly(edu.institution) && edu.degree.length > 3
      );
      return {
        ...prev,
        content: {
          ...prev.content,
          education: cleaned.length > 0 ? cleaned : prev.content.education,
        },
      };
    });
  };

  const handleSaveSignature = (signatureData: {
    url: string;
    type: 'DRAWN' | 'UPLOADED' | 'TYPOGRAPHIC';
    date: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        signatureUrl: signatureData.url,
        signatureType: signatureData.type,
        signatureDate: signatureData.date,
      },
    }));
  };

  const handleRemoveSignature = () => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        signatureUrl: '',
        signatureType: 'NONE',
        signatureDate: '',
      },
    }));
  };

  const handleRunAtsAudit = () => {
    startAuditTransition(async () => {
      const res = await auditAtsScoreAction(formData);
      if (res.success) {
        setCurrentScore(res.data.score);
        setAuditReport(res.data);
      }
    });
  };

  const handleSaveCv = () => {
    startTransition(async () => {
      const res = await upsertSmartCvAction(formData);
      if (res.success) {
        setSavedSuccess(true);
        if (res.score) setCurrentScore(res.score);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    });
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await generateAndDownloadCvPdf(formData, { format: pageFormat });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error al generar PDF vectorial directo:', err);
      setDownloadError(err?.message || 'Error al generar el PDF. Por favor reintenta.');
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Header Minimalista Suizo */}
      <AppEditorHeader
        sectionTitle="Optimizador de CV"
        categoryName="Smart CV (ATS)"
        categoryHref="/dashboard"
        badgeText="Swiss Canvas"
      >
        {/* Selector de modo de vista */}
        <div className="hidden md:flex bg-slate-900/80 p-0.5 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'split' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Dividido
          </button>
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'edit' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'preview' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Previsualizar
          </button>
        </div>

        {/* Botón Discreto de Importación */}
        <button
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-medium transition-all"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Importar</span>
        </button>

        {/* Botón de Firma Digital */}
        <button
          type="button"
          onClick={() => setIsSignatureModalOpen(true)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
            formData.content.signatureUrl
              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <PenTool className="w-3.5 h-3.5 text-purple-400" />
          <span>{formData.content.signatureUrl ? 'Firma Adjunta' : 'Adjuntar Firma'}</span>
        </button>

        {/* Badge Compacto de Score ATS */}
        <button
          type="button"
          onClick={handleRunAtsAudit}
          disabled={auditPending}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-xs transition-all"
          title="Score de compatibilidad con filtros ATS"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-bold text-white">{currentScore}% ATS</span>
        </button>

        {/* Selector Dinámico de Formato de Página */}
        <div className="hidden sm:flex bg-slate-900/80 p-0.5 rounded-xl border border-white/10 text-xs font-mono">
          <button
            type="button"
            onClick={() => setPageFormat('letter')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              pageFormat === 'letter' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
            title="Formato Carta (8.5x11 pulgadas - Estándar EE.UU./Canadá/Tech)"
          >
            Carta (US)
          </button>
          <button
            type="button"
            onClick={() => setPageFormat('a4')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              pageFormat === 'a4' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
            title="Formato A4 (210x297mm - Estándar Europa/LatAm/Global)"
          >
            A4
          </button>
        </div>

        {/* Descargar PDF Directo en 1 Clic */}
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 ${
            downloadSuccess
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/20'
              : downloadError
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}
          title="Descarga directa del archivo PDF vectorial (Compatible con ATS)"
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : downloadSuccess ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>
            {isDownloading
              ? 'Generando PDF...'
              : downloadSuccess
              ? '¡PDF Descargado!'
              : downloadError
              ? 'Error al descargar'
              : 'Descargar PDF'}
          </span>
        </button>

        {/* Guardar CV */}
        <button
          onClick={handleSaveCv}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : savedSuccess ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          <span>{savedSuccess ? '¡Guardado!' : 'Guardar'}</span>
        </button>
      </AppEditorHeader>

      {/* Modal de Importación Desacoplado */}
      <ImportDocumentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onCvParsed={handleCvParsed}
        onCredentialParsed={handleCredentialParsed}
        isProcessing={isDropzoneProcessing}
        setIsProcessing={setIsDropzoneProcessing}
        currentEducation={formData.content.education}
      />

      {/* Modal de Firma Digital */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={handleSaveSignature}
        currentFullName={formData.content.fullName}
      />

      {/* Lienzo Principal con Filosofía Minimalista */}
      <div className={`mt-6 grid gap-8 ${
        viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-4xl mx-auto'
      }`}>
        {/* Columna Formulario */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'w-full'} space-y-6`}>
            {/* Sección: Identidad Profesional */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Identidad Profesional
                </span>
                <span className="text-[11px] font-mono text-cyan-400">Paso 1 de 4</span>
              </div>

              <div>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetRole: e.target.value }))}
                  className="w-full text-base font-bold text-white bg-transparent border-b border-white/10 pb-2 focus:outline-none focus:border-cyan-400 placeholder-zinc-500"
                  placeholder="Cargo Objetivo (ej. Lead Software Architect)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.content.fullName}
                    onChange={(e) => handleContentChange('fullName', e.target.value)}
                    className="w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Email Profesional</label>
                  <input
                    type="email"
                    value={formData.content.email}
                    onChange={(e) => handleContentChange('email', e.target.value)}
                    className="w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* RUT / DNI y Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">RUT / Identificación Oficial</label>
                  <input
                    type="text"
                    value={formData.content.rut || ''}
                    onChange={(e) => handleContentChange('rut', e.target.value)}
                    placeholder="12.345.678-9"
                    className="w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Ubicación / Modalidad</label>
                  <input
                    type="text"
                    value={formData.content.location}
                    onChange={(e) => handleContentChange('location', e.target.value)}
                    placeholder="Santiago / Remoto Global"
                    className="w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Enlaces Profesionales Modernos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1 flex items-center gap-1.5">
                    <Link2 className="w-3 h-3 text-indigo-400" />
                    Perfil de LinkedIn
                  </label>
                  <input
                    type="text"
                    value={formData.content.linkedinUrl || ''}
                    onChange={(e) => handleContentChange('linkedinUrl', e.target.value)}
                    placeholder="linkedin.com/in/tu-perfil"
                    className="w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    Portafolio / GitHub
                  </label>
                  <input
                    type="text"
                    value={formData.content.websiteUrl || ''}
                    onChange={(e) => handleContentChange('websiteUrl', e.target.value)}
                    placeholder="github.com/tu-usuario"
                    className="w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Resumen con Copiloto de Redacción IA */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Resumen Ejecutivo</label>
                  <InlineAiWriter
                    currentText={formData.content.summary}
                    type="SUMMARY"
                    targetRole={formData.targetRole}
                    onApply={(newText) => handleContentChange('summary', newText)}
                  />
                </div>
                <textarea
                  rows={3}
                  value={formData.content.summary}
                  onChange={(e) => handleContentChange('summary', e.target.value)}
                  className="w-full text-xs text-zinc-200 bg-black/30 rounded-xl p-3 border border-white/5 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
                  placeholder="Sintetiza tu propuesta de valor y experiencia clave..."
                />
              </div>
            </div>

            {/* Sección: Habilidades */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Habilidades & Tecnologías ATS
                </span>
                <span className="text-[11px] font-mono text-indigo-400">Paso 2 de 4</span>
              </div>
              <input
                type="text"
                value={formData.content.skills.join(', ')}
                onChange={(e) =>
                  handleContentChange(
                    'skills',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full text-xs text-zinc-200 bg-black/30 rounded-xl px-3 py-2.5 border border-white/5 focus:outline-none focus:border-indigo-400 font-mono"
                placeholder="TypeScript, React, Turso SQLite, Docker..."
              />
            </div>

            {/* Sección: Experiencia Laboral con Inline AI Writer */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Experiencia Laboral (Fórmula Google XYZ)
                  </span>
                  <span className="text-[11px] font-mono text-teal-400">Paso 3 de 4</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 text-xs font-medium transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Cargo</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.content.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-3 relative group">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-[11px] font-mono text-zinc-500">#{idx + 1} • {exp.role || 'Nuevo Cargo'}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Eliminar este cargo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...formData.content.experience];
                          updated[idx].role = e.target.value;
                          handleContentChange('experience', updated);
                        }}
                        className="text-xs font-medium text-white bg-zinc-900/80 rounded-lg px-2.5 py-1.5 border border-white/5 focus:border-teal-500/40"
                        placeholder="Cargo profesional"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...formData.content.experience];
                          updated[idx].company = e.target.value;
                          handleContentChange('experience', updated);
                        }}
                        className="text-xs text-zinc-300 bg-zinc-900/80 rounded-lg px-2.5 py-1.5 border border-white/5 focus:border-teal-500/40"
                        placeholder="Empresa o Institución"
                      />
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => {
                          const updated = [...formData.content.experience];
                          updated[idx].period = e.target.value;
                          handleContentChange('experience', updated);
                        }}
                        className="text-xs font-mono text-zinc-400 bg-zinc-900/80 rounded-lg px-2.5 py-1.5 border border-white/5 focus:border-teal-500/40"
                        placeholder="ej. 2022 - Presente"
                      />
                    </div>

                    {/* Viñetas con Asistente de Redacción Individual */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono text-zinc-400">Logros Cuantificables</label>
                        <InlineAiWriter
                          currentText={exp.bullets[0] || ''}
                          type="BULLET"
                          targetRole={formData.targetRole}
                          onApply={(newText) => {
                            const updated = [...formData.content.experience];
                            if (updated[idx].bullets.length === 0) {
                              updated[idx].bullets = [newText];
                            } else {
                              updated[idx].bullets[0] = newText;
                            }
                            handleContentChange('experience', updated);
                          }}
                        />
                      </div>

                      <textarea
                        rows={3}
                        value={exp.bullets.join('\n')}
                        onChange={(e) => {
                          const newBullets = e.target.value.split('\n').filter(Boolean);
                          const updated = [...formData.content.experience];
                          updated[idx].bullets = newBullets;
                          handleContentChange('experience', updated);
                        }}
                        className="w-full text-xs text-zinc-200 bg-zinc-900/80 rounded-lg p-2.5 border border-white/5 resize-none leading-relaxed focus:border-teal-500/40"
                        placeholder="Logré [X], medido por [Y], haciendo [Z]..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección: Educación y Firma */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    Educación & Formación
                  </span>
                  <span className="text-[11px] font-mono text-purple-400">Paso 4 de 4</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePurgeEducationDates}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-medium transition-all"
                    title="Depurar fechas aisladas que no sean títulos"
                  >
                    <span>Depurar Fechas</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[11px] font-medium transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {formData.content.education.map((edu, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between text-xs gap-3 group">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...formData.content.education];
                          updated[idx].degree = e.target.value;
                          handleContentChange('education', updated);
                        }}
                        className="w-full font-semibold text-white bg-transparent border-b border-transparent focus:border-purple-400/40 focus:outline-none mb-1 text-xs"
                        placeholder="Título o Grado"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...formData.content.education];
                            updated[idx].institution = e.target.value;
                            handleContentChange('education', updated);
                          }}
                          className="flex-1 text-[11px] text-zinc-400 bg-transparent border-b border-transparent focus:border-purple-400/40 focus:outline-none"
                          placeholder="Universidad / Instituto"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...formData.content.education];
                            updated[idx].year = e.target.value;
                            handleContentChange('education', updated);
                          }}
                          className="w-24 text-[11px] font-mono text-zinc-400 bg-transparent border-b border-transparent focus:border-purple-400/40 focus:outline-none text-right"
                          placeholder="Año"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(idx)}
                      className="text-zinc-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                      title="Eliminar este título o certificación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Estado de la Firma */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      {formData.content.signatureUrl ? 'Firma Digital Estampada' : 'Firma no configurada'}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {formData.content.signatureUrl ? `Estampada el ${formData.content.signatureDate}` : 'Opcional para postulaciones directas'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {formData.content.signatureUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all text-xs"
                      title="Quitar firma"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-medium transition-all"
                  >
                    {formData.content.signatureUrl ? 'Cambiar Firma' : 'Adjuntar Firma'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Columna Documento Previsualizado (Tipografía Suiza) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'w-full'} sticky top-6`}>
            <div className="flex items-center justify-between mb-3 px-1 text-xs text-zinc-400 font-mono">
              <span className="uppercase font-semibold text-slate-300">
                FORMATO {pageFormat === 'letter' ? 'CARTA (US LETTER • 8.5x11")' : 'A4 (GLOBAL • 210x297mm)'}
              </span>
              <span className="text-[11px] text-cyan-400">DUAL-TARGET ATS</span>
            </div>

            <div className="w-full">
              <CvDocumentPreview cv={formData} pageFormat={pageFormat} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
