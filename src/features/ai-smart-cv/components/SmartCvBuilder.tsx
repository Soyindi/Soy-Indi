'use client';

import React, { useState, useTransition } from 'react';
import { CVFormValues, AtsAuditResult, VerifiedCredential } from '@/entities/cv/schemas';
import { auditAtsScoreAction, upsertSmartCvAction } from '@/features/ai-smart-cv/actions';
import { CvDocumentPreview } from '@/features/ai-smart-cv/components/CvDocumentPreview';
import { SmartDocumentDropzone } from '@/features/ai-smart-cv/components/SmartDocumentDropzone';
import { AppEditorHeader } from '@/shared/ui/AppEditorHeader';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  FileText, 
  Printer, 
  Loader2,
  Award,
  Zap,
  HelpCircle
} from 'lucide-react';

export function SmartCvBuilder() {
  const [isPending, startTransition] = useTransition();
  const [auditPending, startAuditTransition] = useTransition();
  const [isDropzoneProcessing, setIsDropzoneProcessing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentScore, setCurrentScore] = useState<number>(85);
  const [auditReport, setAuditReport] = useState<AtsAuditResult | null>(null);

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
            'Implementé un sistema de caché de borde para compartir perfiles en redes sociales con generación instantánea de OpenGraph.',
          ],
          detailedBullets: [
            {
              text: 'Diseñé la arquitectura distribuida en Turso LibSQL, reduciendo la latencia P95 a 18ms para más de 100k consultas concurrentes.',
              needs_metric: false,
            },
            {
              text: 'Implementé un sistema de caché de borde para compartir perfiles en redes sociales con generación instantánea de OpenGraph.',
              needs_metric: true, // Requiere métrica de impacto
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

  // Manejador de campos generales
  const handleContentChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  // Callback cuando la ingesta multimodal de CV termina
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

  // Callback cuando se adjunta y valida un diploma / título
  const handleCredentialParsed = (credential: VerifiedCredential) => {
    setFormData((prev) => {
      const existingCredentials = prev.content.credentials || [];
      const updatedEducation = [...prev.content.education];

      // Si se emparejó con un registro existente de educación, actualizar su tipo
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

  // Ejecutar auditoría ATS con IA
  const handleRunAtsAudit = () => {
    startAuditTransition(async () => {
      const res = await auditAtsScoreAction(formData);
      if (res.success) {
        setCurrentScore(res.data.score);
        setAuditReport(res.data);
      }
    });
  };

  // Guardar CV
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

  // Imprimir / Exportar a PDF nativo
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header con botón de retroceso a /dashboard */}
      <AppEditorHeader
        sectionTitle="Optimizador de CV & Resume"
        categoryName="Smart CV (ATS)"
        categoryHref="/dashboard"
        badgeText="Dual-Target ATS • Qwen2.5-VL"
      >
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-zinc-300 hover:text-white text-xs font-semibold transition-all"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Imprimir / PDF</span>
        </button>

        <button
          onClick={handleRunAtsAudit}
          disabled={auditPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/40 text-xs font-semibold transition-all disabled:opacity-50"
        >
          {auditPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          )}
          <span>Auditar ATS</span>
        </button>

        <button
          onClick={handleSaveCv}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : savedSuccess ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          <span>{savedSuccess ? '¡Guardado!' : 'Guardar CV'}</span>
        </button>
      </AppEditorHeader>

      {/* Dropzone Inteligente de CV y Títulos Académicos */}
      <SmartDocumentDropzone
        onCvParsed={handleCvParsed}
        onCredentialParsed={handleCredentialParsed}
        isProcessing={isDropzoneProcessing}
        setIsProcessing={setIsDropzoneProcessing}
        currentEducation={formData.content.education}
      />

      {/* Barra de Score ATS & Alertas Regulatorias */}
      <div className="mb-8 glass-panel rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-500/20">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-200">
            {currentScore}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Score de Compatibilidad ATS</span>
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                currentScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {currentScore >= 80 ? 'EXCELENTE' : 'OPTIMIZABLE'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Dual-Target: Capa semántica lineal para Workday/Greenhouse + Presentación tipográfica para reclutadores.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAtsAudit}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium underline underline-offset-4"
        >
          Re-analizar con IA
        </button>
      </div>

      {/* Alertas de Mitigación de Alucinaciones (EU AI Act) */}
      {auditReport?.hallucinationWarnings && auditReport.hallucinationWarnings.length > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-amber-300">Auditoría de Impacto Cuantitativo (Google XYZ)</span>
            <p className="text-amber-200/80">
              {auditReport.hallucinationWarnings[0]}
            </p>
          </div>
        </div>
      )}

      {/* Layout Editor: Columna Formulario + Columna Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario Estructurado */}
        <div className="lg:col-span-6 space-y-6">
          {/* Datos Personales & Cargo Objetivo */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              1. Identidad Profesional & Rol Objetivo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">Cargo o Rol Deseado</label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetRole: e.target.value }))}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="ej. Senior Full Stack Engineer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.content.fullName}
                    onChange={(e) => handleContentChange('fullName', e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Email Profesional</label>
                  <input
                    type="email"
                    value={formData.content.email}
                    onChange={(e) => handleContentChange('email', e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">Resumen de Propuesta de Valor</label>
                <textarea
                  rows={3}
                  value={formData.content.summary}
                  onChange={(e) => handleContentChange('summary', e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Habilidades Técnicas Normalizadas */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              2. Habilidades y Palabras Clave (ESCO / ATS)
            </h3>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2">
                Habilidades separadas por comas (Optimizadas para indexación algorítmica)
              </label>
              <input
                type="text"
                value={formData.content.skills.join(', ')}
                onChange={(e) =>
                  handleContentChange(
                    'skills',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="TypeScript, React, SQL, Liderazgo..."
              />
            </div>
          </div>

          {/* Experiencia Laboral con fórmula Google XYZ y Alerta needs_metric */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                3. Experiencias de Alto Impacto (STAR / XYZ)
              </h3>
              <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                Fórmula Google XYZ
              </span>
            </div>

            <div className="space-y-5">
              {formData.content.experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const updated = [...formData.content.experience];
                        updated[idx].role = e.target.value;
                        handleContentChange('experience', updated);
                      }}
                      className="rounded-lg bg-zinc-900 border border-white/10 px-2.5 py-1.5 text-xs text-white"
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
                      className="rounded-lg bg-zinc-900 border border-white/10 px-2.5 py-1.5 text-xs text-white"
                      placeholder="Empresa"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Logros y funciones (1 por línea)
                    </label>
                    <textarea
                      rows={3}
                      value={exp.bullets.join('\n')}
                      onChange={(e) => {
                        const newBullets = e.target.value.split('\n').filter(Boolean);
                        const updated = [...formData.content.experience];
                        updated[idx].bullets = newBullets;
                        // Actualizar también detailedBullets
                        updated[idx].detailedBullets = newBullets.map((b) => ({
                          text: b,
                          needs_metric: !/\d+|%|\$|millones|miles/i.test(b),
                        }));
                        handleContentChange('experience', updated);
                      }}
                      className="w-full rounded-lg bg-zinc-900 border border-white/10 px-2.5 py-1.5 text-xs text-white resize-none"
                    />
                  </div>

                  {/* Badges de advertencia de métricas cuantitativas */}
                  {exp.detailedBullets && exp.detailedBullets.some((b) => b.needs_metric) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Una o más viñetas carecen de métrica verificable (%, $, tiempo o cantidad).</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Títulos Universitarios y Credenciales Verificadas */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              4. Educación y Credenciales Académicas
            </h3>

            <div className="space-y-3">
              {formData.content.education.map((edu, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{edu.degree}</p>
                    <p className="text-[11px] text-slate-400">{edu.institution} • {edu.year}</p>
                  </div>
                  {edu.credentialType === 'DEGREE' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      Validado Documentalmente
                    </span>
                  )}
                </div>
              ))}

              {formData.content.credentials && formData.content.credentials.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block">
                    Documentos de Respaldo Analizados:
                  </span>
                  {formData.content.credentials.map((cred) => (
                    <div key={cred.id} className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-purple-200 font-medium">{cred.credentialName}</span>
                        <p className="text-[10px] text-slate-400">{cred.issuingInstitution} • Folio: {cred.verificationCode}</p>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                        Similitud Coseno
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vista Previa del Documento Dual-Target ATS */}
        <div className="lg:col-span-6 sticky top-6">
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Documento Formateado (Vista de Impresión)
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">Formato A4 Estándar</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <CvDocumentPreview cv={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}
