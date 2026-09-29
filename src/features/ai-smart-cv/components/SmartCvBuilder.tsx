'use client';

import React, { useState, useTransition } from 'react';
import { CVFormValues, AtsAuditResult, VerifiedCredential } from '@/entities/cv/schemas';
import { auditAtsScoreAction, upsertSmartCvAction } from '@/features/ai-smart-cv/actions';
import { CvDocumentPreview } from '@/features/ai-smart-cv/components/CvDocumentPreview';
import { ImportDocumentModal } from '@/features/ai-smart-cv/components/ImportDocumentModal';
import { InlineAiWriter } from '@/features/ai-smart-cv/components/InlineAiWriter';
import { AppEditorHeader } from '@/shared/ui/AppEditorHeader';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  FileText, 
  Printer, 
  Loader2,
  Award,
  UploadCloud,
  Eye,
  Edit3,
  Layers,
  HelpCircle,
  Plus,
  Trash2
} from 'lucide-react';

export function SmartCvBuilder() {
  const [isPending, startTransition] = useTransition();
  const [auditPending, startAuditTransition] = useTransition();
  const [isDropzoneProcessing, setIsDropzoneProcessing] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentScore, setCurrentScore] = useState<number>(85);
  const [auditReport, setAuditReport] = useState<AtsAuditResult | null>(null);

  // Modo de visualización: 'split' (ambos), 'edit' (solo editor), 'preview' (solo documento)
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  const [formData, setFormData] = useState<CVFormValues>({
    title: 'CV Ejecutivo 2026',
    targetRole: 'Senior Full Stack Engineer & Software Architect',
    templateId: 'executive-modern',
    content: {
      fullName: 'Matías Riquelme',
      email: 'matias@indi.bio',
      phone: '+56 9 8765 4321',
      location: 'Santiago / Remoto Global',
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
              needs_metric: true, // Requiere métrica
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

  const handlePrint = () => {
    window.print();
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
          <span>Importar Documento</span>
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

        {/* Imprimir / PDF */}
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-all"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Imprimir / PDF</span>
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
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.content.fullName}
                    onChange={(e) => handleContentChange('fullName', e.target.value)}
                    className="w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.content.email}
                    onChange={(e) => handleContentChange('email', e.target.value)}
                    className="w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:border-cyan-400"
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
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Experiencia Laboral (Fórmula Google XYZ)
                </span>
                <span className="text-[11px] font-mono text-teal-400">Paso 3 de 4</span>
              </div>

              <div className="space-y-4">
                {formData.content.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...formData.content.experience];
                          updated[idx].role = e.target.value;
                          handleContentChange('experience', updated);
                        }}
                        className="text-xs font-medium text-white bg-zinc-900/80 rounded-lg px-2.5 py-1.5 border border-white/5"
                        placeholder="Cargo"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...formData.content.experience];
                          updated[idx].company = e.target.value;
                          handleContentChange('experience', updated);
                        }}
                        className="text-xs text-zinc-300 bg-zinc-900/80 rounded-lg px-2.5 py-1.5 border border-white/5"
                        placeholder="Empresa"
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
                        className="w-full text-xs text-zinc-200 bg-zinc-900/80 rounded-lg p-2.5 border border-white/5 resize-none leading-relaxed"
                        placeholder="Logré [X], medido por [Y], haciendo [Z]..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección: Educación y Títulos */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  Educación & Diplomas
                </span>
                <span className="text-[11px] font-mono text-purple-400">Paso 4 de 4</span>
              </div>

              <div className="space-y-2">
                {formData.content.education.map((edu, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{edu.degree}</p>
                      <p className="text-[11px] text-zinc-400">{edu.institution} • {edu.year}</p>
                    </div>
                    {edu.credentialType === 'DEGREE' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        Validado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Columna Documento Previsualizado (Tipografía Suiza A4) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'w-full'} sticky top-6`}>
            <div className="flex items-center justify-between mb-3 px-1 text-xs text-zinc-400 font-mono">
              <span>DOCUMENTO A4 (ATS COMPATIBLE)</span>
              <span>ESTÁNDAR EDITORIAL SUIZO</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <CvDocumentPreview cv={formData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
