'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  CVFormValues,
  AtsAuditResult,
  VerifiedCredential,
  generateCvSlug,
  slugifyCvTitle,
} from '@/entities/cv/schemas';
import { 
  auditAtsScoreAction, 
  upsertSmartCvAction, 
  checkCvSlugAvailabilityAction,
  CvSlugAvailabilityResult 
} from '@/features/ai-smart-cv/actions';
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
  Wand2,
  Copy,
  ExternalLink,
  RefreshCw,
  Share2,
  Check,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export interface SmartCvBuilderProps {
  initialData?: Partial<CVFormValues>;
  initialCvId?: string;
  initialScore?: number;
}

export function SmartCvBuilder({
  initialData,
  initialCvId,
  initialScore,
}: SmartCvBuilderProps = {}) {
  const [isPending, startTransition] = useTransition();
  const [auditPending, startAuditTransition] = useTransition();
  const [isDropzoneProcessing, setIsDropzoneProcessing] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [currentCvId, setCurrentCvId] = useState<string | undefined>(initialCvId);
  const [currentScore, setCurrentScore] = useState<number>(initialScore ?? 85);
  const [auditReport, setAuditReport] = useState<AtsAuditResult | null>(null);

  // Modo de visualización: 'split' (ambos), 'edit' (solo editor), 'preview' (solo documento)
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  // Formato unificado de página: A4 Internacional (Grado Empresarial)
  const [pageFormat, setPageFormat] = useState<'a4' | 'letter'>('a4');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Rastrear si el usuario modificó deliberadamente el slug a mano
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(() => Boolean(initialData?.slug));
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<CvSlugAvailabilityResult>({
    available: true,
    status: 'available',
    suggestions: [],
  });

  const [formData, setFormData] = useState<CVFormValues>(() => ({
    title: initialData?.title || 'CV Ejecutivo 2026',
    targetRole: initialData?.targetRole || 'Senior Full Stack Engineer & Software Architect',
    slug: initialData?.slug || generateCvSlug(initialData?.content?.fullName || 'matias-riquelme', false),
    isPublic: initialData?.isPublic ?? true,
    templateId: initialData?.templateId || 'executive-modern',
    content: {
      fullName: initialData?.content?.fullName ?? 'Matías Riquelme',
      email: initialData?.content?.email ?? 'matias@indi.bio',
      phone: initialData?.content?.phone ?? '+56 9 8765 4321',
      location: initialData?.content?.location ?? 'Santiago / Remoto Global',
      rut: initialData?.content?.rut ?? '18.492.041-K',
      linkedinUrl: initialData?.content?.linkedinUrl ?? 'linkedin.com/in/matias-riquelme',
      websiteUrl: initialData?.content?.websiteUrl ?? 'github.com/matiquelmec',
      signatureUrl: initialData?.content?.signatureUrl ?? '',
      signatureType: initialData?.content?.signatureType ?? 'NONE',
      signatureDate: initialData?.content?.signatureDate ?? '',
      summary: initialData?.content?.summary ?? 'Ingeniero de Software Senior con más de 7 años de experiencia diseñando arquitecturas serverless de alta concurrencia en el Edge, microservicios distribuidos con SQLite y liderando equipos multidisciplinarios bajo metodologías ágiles.',
      skills: initialData?.content?.skills ?? ['TypeScript', 'React 19', 'Next.js 16', 'Turso SQLite', 'Drizzle ORM', 'Tailwind CSS v4', 'Arquitectura Serverless', 'Cloudflare Workers', 'Zod', 'Docker'],
      experience: initialData?.content?.experience ?? [
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
      education: initialData?.content?.education ?? [
        {
          degree: 'Ingeniería Civil en Computación e Informática',
          institution: 'Universidad de Chile',
          year: '2016 - 2021',
          credentialType: 'DEGREE',
        },
      ],
      credentials: initialData?.content?.credentials ?? [
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
      references: initialData?.content?.references ?? [
        {
          name: 'Dra. Carolina Morales',
          role: 'Directora de Operaciones Clínicas',
          company: 'Hospital Clínico',
          contact: '+56 9 9123 4567 • cmorales@hospital.cl',
        },
      ],
    },
  }));

  // Efecto debounced (350ms) para comprobar disponibilidad de slug de CV en Turso
  React.useEffect(() => {
    if (!formData.slug || formData.slug.length < 3) {
      setSlugAvailability({
        available: false,
        status: 'invalid',
        message: 'Mínimo 3 caracteres.',
        suggestions: [],
      });
      return;
    }

    let isMounted = true;
    setIsCheckingSlug(true);

    const timer = setTimeout(async () => {
      try {
        const result = await checkCvSlugAvailabilityAction(formData.slug!, currentCvId, formData.targetRole);
        if (isMounted) {
          setSlugAvailability(result);
          setIsCheckingSlug(false);
        }
      } catch {
        if (isMounted) {
          setIsCheckingSlug(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [formData.slug, currentCvId, formData.targetRole]);

  // Manejador manual de cambio de slug
  const handleSlugChange = (rawSlug: string) => {
    setIsSlugManuallyEdited(true);
    const sanitized = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, slug: sanitized }));
  };

  // Restablecer/regenerar slug desde el nombre actual
  const handleRegenerateSlugFromName = () => {
    const derivedSlug = generateCvSlug(formData.content.fullName || formData.targetRole || 'cv', false);
    setFormData((prev) => ({ ...prev, slug: derivedSlug }));
    setIsSlugManuallyEdited(false);
  };

  // Aplicar sugerencia alternativa en 1 clic
  const handleApplyAlternativeSlug = (altSlug: string) => {
    setFormData((prev) => ({ ...prev, slug: altSlug }));
    setIsSlugManuallyEdited(true);
  };

  // Sincronizar estado cuando se cargue initialData o initialCvId
  React.useEffect(() => {
    if (initialCvId) {
      setCurrentCvId(initialCvId);
    }
    if (initialScore !== undefined) {
      setCurrentScore(initialScore);
    }
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        content: {
          ...prev.content,
          ...(initialData.content || {}),
        },
      }));
    }
  }, [initialCvId, initialData, initialScore]);

  const handleContentChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        content: {
          ...prev.content,
          [field]: value,
        },
      };

      // Auto-sincronizar el slug si el usuario escribe su nombre y aún no ha personalizado el slug a mano
      if (field === 'fullName' && !isSlugManuallyEdited) {
        const derivedSlug = generateCvSlug(value, false);
        if (derivedSlug) {
          updated.slug = derivedSlug;
        }
      }

      return updated;
    });
  };

  const handleCvParsed = (extractedCv: Partial<CVFormValues>) => {
    setFormData((prev) => {
      const newFullName = extractedCv.content?.fullName || prev.content.fullName;
      const newTargetRole = extractedCv.targetRole || prev.targetRole;
      const autoSlug = !isSlugManuallyEdited && newFullName ? generateCvSlug(newFullName, false) : prev.slug;

      return {
        ...prev,
        title: extractedCv.title || (newFullName ? `CV de ${newFullName}` : prev.title),
        slug: autoSlug || prev.slug,
        targetRole: newTargetRole,
        content: {
          ...prev.content,
          ...extractedCv.content,
        },
      };
    });
  };

  const handleCredentialParsed = (credential: VerifiedCredential) => {
    setFormData((prev) => {
      const existingCredentials = prev.content.credentials || [];
      const updatedEducation = [...prev.content.education];

      // 1. Detección de duplicado / emparejamiento inteligente
      let targetIndex = credential.mappedEducationIndex;

      if (targetIndex === undefined || targetIndex < 0 || !updatedEducation[targetIndex]) {
        // Búsqueda de respaldo por coincidencia de palabras clave
        const normCred = `${credential.credentialName} ${credential.issuingInstitution}`
          .toLowerCase()
          .replace(/[^a-záéíóúñ0-9]/g, ' ');
        const credTokens = normCred.split(' ').filter((w) => w.length > 3);

        targetIndex = updatedEducation.findIndex((edu) => {
          const normEdu = `${edu.degree} ${edu.institution}`
            .toLowerCase()
            .replace(/[^a-záéíóúñ0-9]/g, ' ');
          const hits = credTokens.filter((t) => normEdu.includes(t)).length;
          return credTokens.length > 0 && hits / credTokens.length >= 0.4;
        });
        if (targetIndex < 0) targetIndex = undefined;
      }

      const isCourseOrDiploma =
        credential.credentialName.toLowerCase().includes('diplom') ||
        credential.credentialName.toLowerCase().includes('curso') ||
        credential.credentialName.toLowerCase().includes('capacitac') ||
        credential.credentialName.toLowerCase().includes('constancia');

      const credentialType = isCourseOrDiploma ? 'CERTIFICATION' : 'DEGREE';

      if (targetIndex !== undefined && updatedEducation[targetIndex]) {
        // REGLA 1: YA EXISTE EN EL CURRÍCULUM -> NO SE DUPLICA, SE VALIDA CON CÓDIGO CRIPTOGRÁFICO
        updatedEducation[targetIndex] = {
          ...updatedEducation[targetIndex],
          credentialType,
          verifiedCredentialId: credential.verificationCode,
        };
      } else {
        // REGLA 2: ES UN TÍTULO/CERTIFICACIÓN NUEVA -> SE INCLUYE AL CURRÍCULUM CON FORMATO ESTÁNDAR
        updatedEducation.push({
          degree: credential.credentialName,
          institution: credential.issuingInstitution,
          year: credential.issueDate || 'Certificado Oficial',
          credentialType,
          verifiedCredentialId: credential.verificationCode,
        });
      }

      // Evitar duplicados en la lista de credenciales por código de verificación
      const filteredCredentials = existingCredentials.filter(
        (c) => c.verificationCode !== credential.verificationCode
      );

      return {
        ...prev,
        content: {
          ...prev.content,
          education: updatedEducation,
          credentials: [...filteredCredentials, credential],
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

  const handleAddReference = () => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        references: [
          ...(prev.content.references || []),
          {
            name: 'Nombre de Referencia',
            role: 'Cargo Profesional',
            company: 'Empresa o Institución',
            contact: '+56 9 0000 0000',
          },
        ],
      },
    }));
  };

  const handleDeleteReference = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        references: (prev.content.references || []).filter((_, i) => i !== idx),
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
      setSaveError(null);
      const res = await upsertSmartCvAction(formData, currentCvId);
      if (res.success) {
        setSavedSuccess(true);
        if (res.id) setCurrentCvId(res.id);
        if (res.score) setCurrentScore(res.score);
        if (res.slug) {
          setFormData((prev) => ({ ...prev, slug: res.slug }));
        }
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setSaveError(res.error || 'Error al guardar el currículum.');
        setTimeout(() => setSaveError(null), 5000);
      }
    });
  };

  const handleCopyCvLink = async () => {
    if (typeof window === 'undefined' || !formData.slug) return;
    try {
      const url = `${window.location.origin}/cv/${formData.slug}`;
      await navigator.clipboard.writeText(url);
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
    } catch (err) {
      console.error('Error al copiar link de CV:', err);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await generateAndDownloadCvPdf(formData, { format: 'a4' });
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
        categoryHref="/dashboard?tab=cvs"
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

        {/* Formato Unificado Empresarial A4 */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-zinc-300">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>A4 Ejecutivo (ISO 216)</span>
        </div>

        {/* Descargar PDF Directo en 1 Clic */}
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className={`inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 ${
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
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
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

      {/* Alerta de Error de Guardado */}
      {saveError && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>{saveError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="text-rose-400 hover:text-white text-xs font-bold px-2 py-1 min-h-[44px] flex items-center"
          >
            Cerrar
          </button>
        </div>
      )}

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
            {/* Banner de Ingesta Rápida (1 Clic) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-slate-900/60 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    ¿Ya tienes un CV en PDF o imagen?
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Importa tu documento para auto-completar todos los campos con IA y redacción STAR en segundos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 shrink-0 min-h-[40px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Importar CV</span>
              </button>
            </div>

            {/* Sección: Enlace Digital & Visibilidad */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Enlace Digital del CV
                </span>
                {formData.slug && (
                  <Link
                    href={`/cv/${formData.slug}`}
                    target="_blank"
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                  >
                    <span>Ver CV Digital</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Enlace Personalizado (Slug)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRegenerateSlugFromName}
                      title="Sincronizar slug con tu nombre"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-cyan-400 px-2 py-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Desde nombre</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCvLink}
                      title="Copiar enlace del CV"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-emerald-400 px-2 py-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {copiedSlug ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className={`flex items-center rounded-xl bg-black/50 border px-3.5 py-2.5 text-sm transition-colors ${
                  !slugAvailability.available && !isCheckingSlug
                    ? 'border-amber-500/50 focus-within:border-amber-500'
                    : 'border-white/10 focus-within:border-cyan-400/80'
                }`}>
                  <span className="text-zinc-500 font-mono select-none text-xs sm:text-sm">soyindi.cl/cv/</span>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 bg-transparent text-cyan-300 font-mono text-xs sm:text-sm focus:outline-none pl-1"
                    placeholder="tu-nombre"
                    spellCheck={false}
                  />

                  {/* Estado dinámico de disponibilidad con Turso */}
                  <div className="flex items-center gap-1.5 ml-2">
                    {isCheckingSlug ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                        <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                        <span className="hidden sm:inline">Verificando</span>
                      </span>
                    ) : slugAvailability.status === 'available' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check className="w-2.5 h-2.5" />
                        <span>Disponible</span>
                      </span>
                    ) : slugAvailability.status === 'reserved' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Reservado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>En uso</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Alternativas inteligentes de 1 toque si el slug está ocupado o reservado */}
                {!slugAvailability.available && slugAvailability.suggestions.length > 0 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-fade-in">
                    <p className="text-[11px] font-medium text-amber-300 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{slugAvailability.message} Alternativas recomendadas:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {slugAvailability.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleApplyAlternativeSlug(suggestion)}
                          className="min-h-[32px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 transition-colors cursor-pointer"
                        >
                          <span>{suggestion}</span>
                          <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-1.5 px-1">
                  <p className="text-[11px] text-zinc-500">
                    {isSlugManuallyEdited
                      ? 'Slug personalizado manualmente.'
                      : 'Se actualiza automáticamente al cambiar tu nombre.'}
                  </p>
                  <span className="text-[10px] font-mono text-zinc-600">min. 3 car.</span>
                </div>
              </div>
            </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-zinc-400">Nombre Completo</label>
                    {!formData.content.fullName && (
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.content.fullName}
                    onChange={(e) => handleContentChange('fullName', e.target.value)}
                    placeholder="Tu Nombre Completo"
                    className="w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-zinc-400">Email Profesional</label>
                    {!formData.content.email && (
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={formData.content.email}
                    onChange={(e) => handleContentChange('email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={`w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border focus:outline-none ${
                      !formData.content.email ? 'border-amber-500/30 focus:border-amber-400' : 'border-white/5 focus:border-cyan-400'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-zinc-400">Teléfono</label>
                    {!formData.content.phone && (
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={formData.content.phone}
                    onChange={(e) => handleContentChange('phone', e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className={`w-full text-xs text-white bg-black/30 rounded-xl px-3 py-2 border focus:outline-none font-mono ${
                      !formData.content.phone ? 'border-amber-500/30 focus:border-amber-400' : 'border-white/5 focus:border-cyan-400'
                    }`}
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
                    skills={formData.content.skills}
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

                    {/* Viñetas con Asistente de Redacción Individual Contextualizado */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono text-zinc-400">Logros Cuantificables</label>
                        <InlineAiWriter
                          currentText={exp.bullets.join('\n') || ''}
                          type="BULLET"
                          role={exp.role}
                          company={exp.company}
                          targetRole={formData.targetRole}
                          skills={formData.content.skills}
                          onApply={(newText) => {
                            const updated = [...formData.content.experience];
                            // Si el texto generado contiene varias líneas o viñetas, dividirlas
                            const newLines = newText
                              .split('\n')
                              .map((b) => b.replace(/^[\s•\-\*·\u2022\u25cf\u25cb\u25e6\u2219\u22c5\u00b7>]+/, '').trim())
                              .filter(Boolean);

                            if (newLines.length > 0) {
                              updated[idx].bullets = newLines;
                            } else {
                              updated[idx].bullets = [newText.trim()];
                            }
                            handleContentChange('experience', updated);
                          }}
                        />
                      </div>

                      <textarea
                        rows={3}
                        value={exp.bullets.join('\n')}
                        onChange={(e) => {
                          const newBullets = e.target.value
                            .split('\n')
                            .map((b) => b.replace(/^[\s•\-\*·\u2022\u25cf\u25cb\u25e6\u2219\u22c5\u00b7>]+/, '').trim())
                            .filter(Boolean);
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

            {/* Sección: Referencias Laborales */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Referencias Laborales
                  </span>
                  <span className="text-[11px] font-mono text-indigo-400">Verificación y Contactos</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddReference}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-medium transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Referencia</span>
                </button>
              </div>

              {(!formData.content.references || formData.content.references.length === 0) ? (
                <div className="p-4 rounded-xl bg-black/20 border border-dashed border-white/10 text-center text-xs text-zinc-500">
                  No hay referencias agregadas. Pulsa &quot;Agregar Referencia&quot; o importa tu CV para detectarlas.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.content.references.map((ref, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between text-xs gap-3 group">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) => {
                            const updated = [...(formData.content.references || [])];
                            updated[idx].name = e.target.value;
                            handleContentChange('references', updated);
                          }}
                          className="w-full font-semibold text-white bg-transparent border-b border-transparent focus:border-indigo-400/40 focus:outline-none text-xs"
                          placeholder="Nombre completo de la referencia"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={ref.role}
                            onChange={(e) => {
                              const updated = [...(formData.content.references || [])];
                              updated[idx].role = e.target.value;
                              handleContentChange('references', updated);
                            }}
                            className="text-[11px] text-indigo-300 bg-transparent border-b border-transparent focus:border-indigo-400/40 focus:outline-none"
                            placeholder="Cargo / Relación"
                          />
                          <input
                            type="text"
                            value={ref.company}
                            onChange={(e) => {
                              const updated = [...(formData.content.references || [])];
                              updated[idx].company = e.target.value;
                              handleContentChange('references', updated);
                            }}
                            className="text-[11px] text-zinc-400 bg-transparent border-b border-transparent focus:border-indigo-400/40 focus:outline-none"
                            placeholder="Empresa / Institución"
                          />
                        </div>
                        <div className="pt-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-mono text-zinc-400">Contacto Verificable (Teléfono / Email):</span>
                            {!ref.contact && (
                              <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1 rounded">
                                Vital para el reclutador
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={ref.contact || ''}
                            onChange={(e) => {
                              const updated = [...(formData.content.references || [])];
                              updated[idx].contact = e.target.value;
                              handleContentChange('references', updated);
                            }}
                            className={`w-full text-xs font-mono rounded-lg px-2.5 py-1.5 bg-black/40 border focus:outline-none transition-colors ${
                              !ref.contact ? 'border-amber-500/30 text-amber-200 placeholder-amber-400/40 focus:border-amber-400' : 'border-white/10 text-cyan-300 focus:border-cyan-400'
                            }`}
                            placeholder="+56 9 1234 5678 o nombre@empresa.com"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteReference(idx)}
                        className="text-zinc-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Eliminar referencia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Columna Documento Previsualizado (Tipografía Suiza) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'w-full'} sticky top-6`}>
            <div className="flex items-center justify-between mb-3 px-1 text-xs text-zinc-400 font-mono">
              <span className="uppercase font-semibold text-slate-300">
                FORMATO UNIFICADO A4 INTERNACIONAL (210x297mm)
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">GRADO EMPRESARIAL • ATS</span>
            </div>

            <div className="w-full">
              <CvDocumentPreview cv={formData} pageFormat="a4" />
            </div>
          </div>
        )}
      </div>

      {/* Barra de acción móvil fija (Thumb Zone ergonómica) */}
      <div className="fixed bottom-4 inset-x-4 z-40 sm:hidden">
        <div className="glass-panel p-2.5 rounded-2xl flex items-center justify-between gap-2 shadow-2xl border border-white/10 backdrop-blur-xl">
          <button
            type="button"
            onClick={handleSaveCv}
            disabled={isPending}
            className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : savedSuccess ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400" />
            )}
            <span>{savedSuccess ? 'Guardado' : 'Guardar'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>PDF Vectorial</span>
          </button>
        </div>
      </div>
    </div>
  );
}
