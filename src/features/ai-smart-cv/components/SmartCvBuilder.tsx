'use client';

import React, { useState, useTransition } from 'react';
import { CVFormValues, AtsAuditResult } from '@/entities/cv/schemas';
import { auditAtsScoreAction, upsertSmartCvAction } from '@/features/ai-smart-cv/actions';
import { CvDocumentPreview } from '@/features/ai-smart-cv/components/CvDocumentPreview';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  Trash2, 
  FileText, 
  Printer, 
  Loader2,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export function SmartCvBuilder() {
  const [isPending, startTransition] = useTransition();
  const [auditPending, startAuditTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentScore, setCurrentScore] = useState<number>(78);
  const [auditReport, setAuditReport] = useState<AtsAuditResult | null>(null);

  const [formData, setFormData] = useState<CVFormValues>({
    title: 'CV Ejecutivo 2026',
    targetRole: 'Full Stack Engineer & Tech Lead',
    templateId: 'executive-modern',
    content: {
      fullName: 'Matías Riquelme',
      email: 'matias@indi.bio',
      phone: '+56 9 8765 4321',
      location: 'Santiago / Remoto',
      summary: 'Ingeniero de Software Senior con más de 7 años de experiencia diseñando plataformas web escalables, arquitecturas serverless en el Edge y liderando equipos de alto desempeño con metodologías ágiles.',
      skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Turso SQLite', 'SQL', 'Docker', 'CI/CD', 'Arquitectura Cloud', 'APIs REST'],
      experience: [
        {
          company: 'Acme SaaS Global',
          role: 'Tech Lead & Senior Software Engineer',
          period: '2023 - Presente',
          bullets: [
            'Lideré la migración de arquitectura monolítica a Serverless Edge, reduciendo la latencia P99 en un 65%.',
            'Diseñé sistemas de autenticación y flujos de pago integrados con Stripe y MercadoPago.',
            'Coordiné el roadmap técnico de 8 desarrolladores mediante sprints Scrum.',
          ],
        },
        {
          company: 'Innovatech LatAm',
          role: 'Full Stack Developer',
          period: '2021 - 2023',
          bullets: [
            'Desarrollo de interfaces reactivas de alta conversión con Next.js y Tailwind CSS.',
            'Optimización de consultas SQL complejas en bases de datos relacionales con Drizzle ORM.',
          ],
        },
      ],
      education: [
        {
          degree: 'Ingeniería en Computación e Informática',
          institution: 'Universidad de Chile',
          year: '2016 - 2021',
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-medium text-cyan-400 mb-2">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Motor Smart CV con Calibración ATS</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Optimizador de CV & Resume
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Adapta tu currículum a los filtros automatizados ATS de reclutadores y empresas tecnológicas.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* Barra de Score ATS */}
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
              Basado en densidad de palabras clave, estructura de viñetas y métricas de impacto.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAtsAudit}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium underline underline-offset-4"
        >
          {auditReport ? 'Actualizar Análisis' : 'Ver Informe Completo de Auditoría'}
        </button>
      </div>

      {/* Informe Desplegado de Auditoría si existe */}
      {auditReport && (
        <div className="mb-8 glass-panel rounded-2xl p-6 border border-cyan-500/20 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2 font-mono uppercase">
              <CheckCircle className="w-4 h-4" />
              Puntos Fuertes Detectados:
            </span>
            <ul className="space-y-1.5 text-zinc-300 list-disc list-inside">
              {auditReport.strengths.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-2 font-mono uppercase">
              <AlertTriangle className="w-4 h-4" />
              Oportunidades de Mejora:
            </span>
            <ul className="space-y-1.5 text-zinc-300 list-disc list-inside">
              {auditReport.improvements.map((imp, idx) => (
                <li key={idx}>{imp}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Grid: Formulario del CV vs. Documento Renderizado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor de Secciones */}
        <div className="lg:col-span-6 space-y-6">
          {/* Datos Personales */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              1. Rol y Datos Principales
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">Cargo / Rol Objetivo (Clave para ATS)</label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Habilidades Técnicas */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              2. Habilidades y Palabras Clave
            </h3>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2">
                Habilidades separadas por comas (Detectadas por motores ATS)
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

          {/* Experiencia Laboral */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              3. Experiencias de Alto Impacto
            </h3>
            <div className="space-y-4">
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
                      rows={2}
                      value={exp.bullets.join('\n')}
                      onChange={(e) => {
                        const updated = [...formData.content.experience];
                        updated[idx].bullets = e.target.value.split('\n').filter(Boolean);
                        handleContentChange('experience', updated);
                      }}
                      className="w-full rounded-lg bg-zinc-900 border border-white/10 px-2.5 py-1.5 text-xs text-white resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vista Previa del Documento ATS */}
        <div className="lg:col-span-6 sticky top-6">
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
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
