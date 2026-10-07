'use client';

import React, { useState, useRef, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DigitalCard, CardData } from '@/entities/card/components/DigitalCard';
import { upsertCardAction, checkCardSlugAvailabilityAction, SlugAvailabilityResult } from '@/features/card-builder/actions';
import { generateBioVariantsAction } from '@/features/card-builder/ai-bio-actions';
import { AppEditorHeader } from '@/shared/ui/AppEditorHeader';
import { CARD_DESIGN_PRESETS, CardDesignPreset } from '@/entities/card/themes';
import { slugifyCardName, generateCardSlug } from '@/entities/card/schemas';
import { compressImageClient } from '@/shared/lib/imageCompression';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Palette, 
  Share2, 
  User, 
  Phone, 
  Globe, 
  Lightbulb, 
  Loader2,
  ExternalLink,
  Layers,
  ShieldCheck,
  MapPin,
  UploadCloud,
  Trash2,
  RefreshCw,
  Copy,
  CheckCheck,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

interface CardBuilderProps {
  initialData?: Partial<CardData>;
  cardId?: string;
}

export function CardBuilder({ initialData, cardId }: CardBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'social' | 'theme'>('profile');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [bioVariants, setBioVariants] = useState<Array<{ tone: string; label: string; bio: string }>>([]);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Estados para compresión client-side de foto
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [photoCompressionInfo, setPhotoCompressionInfo] = useState<{
    originalKb: number;
    compressedKb: number;
    ratio: number;
  } | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Inicialización inteligente del slug: derivado del nombre si existe o del default profesional
  const [initialSlug] = useState(() => {
    if (initialData?.slug) return initialData.slug;
    return generateCardSlug(initialData?.title || 'carlos-mendoza');
  });

  // Rastrear si el usuario modificó deliberadamente el slug a mano
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(() => Boolean(initialData?.slug));
  const [isCopiedSlug, setIsCopiedSlug] = useState(false);

  // Estados de verificación de disponibilidad en tiempo real con debounce
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<SlugAvailabilityResult>({
    available: true,
    status: 'available',
    suggestions: [],
  });

  // Estado reactivo del formulario
  const [formData, setFormData] = useState<CardData>({
    slug: initialData?.slug || initialSlug,
    title: initialData?.title || 'Carlos Mendoza',
    profession: initialData?.profession || 'Especialista en Marketing Digital',
    about: initialData?.about || 'Ayudo a marcas y empresas a escalar sus ventas mediante estrategias de adquisición y analítica de datos.',
    whatsapp: initialData?.whatsapp || '+56987654321',
    emailContact: initialData?.emailContact || 'carlos@mendoza.com',
    websiteUrl: initialData?.websiteUrl || 'https://carlosmendoza.com',
    linkedinUrl: initialData?.linkedinUrl || 'https://linkedin.com/in/carlosmendoza',
    instagramUrl: initialData?.instagramUrl || 'https://instagram.com/carlosmendoza',
    photoUrl: initialData?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    address: initialData?.address || 'Av. Providencia 1208, Oficina 702, Santiago, Chile',
    themeConfig: {
      themeId: initialData?.themeConfig?.themeId || 'stellar',
      primaryColorOklch: initialData?.themeConfig?.primaryColorOklch || '#6366f1',
      particleBehavior: initialData?.themeConfig?.particleBehavior || 'ambient',
      particleIntensity: initialData?.themeConfig?.particleIntensity || 'balanced',
      cardFinish: initialData?.themeConfig?.cardFinish || 'classic',
      surfaceTexture: initialData?.themeConfig?.surfaceTexture || 'radial-glow',
    },
  });

  // Efecto debounced (350ms) para comprobar disponibilidad de slug en Turso
  useEffect(() => {
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
        const result = await checkCardSlugAvailabilityAction(formData.slug, cardId, formData.profession);
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
  }, [formData.slug, cardId, formData.profession]);

  // Manejador genérico de inputs con auto-sincronización del slug según el nombre
  const handleChange = (field: keyof CardData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-sincronizar el slug si el usuario escribe su nombre y aún no ha personalizado el slug a mano
      if (field === 'title' && !isSlugManuallyEdited) {
        const derivedSlug = slugifyCardName(value);
        if (derivedSlug) {
          updated.slug = derivedSlug;
        }
      }

      return updated;
    });
  };

  // Manejador manual de cambio de slug
  const handleSlugChange = (rawSlug: string) => {
    setIsSlugManuallyEdited(true);
    const sanitized = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, slug: sanitized }));
  };

  // Restablecer/regenerar slug desde el nombre actual
  const handleRegenerateSlugFromName = () => {
    const derivedSlug = slugifyCardName(formData.title || 'mi-tarjeta');
    setFormData((prev) => ({ ...prev, slug: derivedSlug }));
    setIsSlugManuallyEdited(false);
  };

  // Aplicar sugerencia inteligente alternativa en 1 clic
  const handleApplyAlternativeSlug = (altSlug: string) => {
    setFormData((prev) => ({ ...prev, slug: altSlug }));
    setIsSlugManuallyEdited(true);
  };

  // Copiar URL pública de la tarjeta
  const handleCopyPublicUrl = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://soyindi.cl';
      const url = `${origin}/c/${formData.slug}`;
      await navigator.clipboard.writeText(url);
      setIsCopiedSlug(true);
      setTimeout(() => setIsCopiedSlug(false), 2000);
    } catch {
      // Fallback silencioso
    }
  };

  // Manejador del theme
  const handleThemeChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      themeConfig: {
        ...prev.themeConfig,
        [field]: value,
      },
    }));
  };

  // Manejador de subida y compresión WebP en cliente
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingPhoto(true);
      setErrorMsg(null);

      // Comprimir en cliente a máx 800px y calidad WebP 0.82
      const result = await compressImageClient(file, {
        maxDimension: 800,
        quality: 0.82,
        mimeType: 'image/webp',
      });

      // Intentar subir a Cloudflare R2 vía streaming multipart
      let finalPhotoUrl = result.dataUrl;
      try {
        const formData = new FormData();
        formData.append('file', result.file);
        formData.append('category', 'avatars');

        const uploadRes = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            finalPhotoUrl = uploadData.url;
          }
        }
      } catch (uploadErr) {
        console.warn('Fallback a almacenamiento local tras error en upload:', uploadErr);
      }

      handleChange('photoUrl', finalPhotoUrl);
      setPhotoCompressionInfo({
        originalKb: Math.round(result.originalSize / 1024),
        compressedKb: Math.round(result.compressedSize / 1024),
        ratio: result.compressionRatioPercent,
      });
    } catch (err: any) {
      console.error('Error al comprimir foto:', err);
      setErrorMsg('No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsCompressingPhoto(false);
      // Reset input value para permitir re-selección del mismo archivo
      if (photoFileInputRef.current) {
        photoFileInputRef.current.value = '';
      }
    }
  };

  // Guardar en Turso
  const handleSave = () => {
    setErrorMsg(null);
    setSavedSuccess(false);

    startTransition(async () => {
      const res = await upsertCardAction(
        {
          slug: formData.slug,
          title: formData.title,
          profession: formData.profession,
          about: formData.about,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          emailContact: formData.emailContact,
          websiteUrl: formData.websiteUrl,
          linkedinUrl: formData.linkedinUrl,
          instagramUrl: formData.instagramUrl,
          photoUrl: formData.photoUrl,
          address: formData.address,
          themeConfig: {
            themeId: formData.themeConfig?.themeId || 'stellar',
            primaryColorOklch: formData.themeConfig?.primaryColorOklch || '#6366f1',
            backgroundColorOklch: formData.themeConfig?.backgroundColorOklch || '#090a10',
            particleBehavior: formData.themeConfig?.particleBehavior || 'ambient',
            particleIntensity: formData.themeConfig?.particleIntensity || 'balanced',
            fontFamily: 'Inter',
            enableGlassRefraction: true,
            cardFinish: formData.themeConfig?.cardFinish || 'classic',
            surfaceTexture: formData.themeConfig?.surfaceTexture || 'radial-glow',
            badgeText: formData.themeConfig?.badgeText || null,
            ctaLabel: formData.themeConfig?.ctaLabel || null,
          },
          bentoBlocks: formData.bentoBlocks || [],
        },
        cardId
      );

      if (!res.success) {
        setErrorMsg(res.error || 'Ocurrió un error');
      } else {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard?${cardId ? 'updated=true' : 'created=true'}&slug=${res.data?.slug}`);
        }, 900);
      }
    });
  };

  // Generación inteligente de 3 variantes con IA
  const handleGenerateAiBios = async () => {
    if (!formData.title || !formData.profession) return;
    setIsGeneratingBio(true);
    try {
      const res = await generateBioVariantsAction({
        title: formData.title,
        profession: formData.profession,
      });
      if (res.success && res.data) {
        setBioVariants(res.data);
      }
    } catch (e) {
      console.error('Error generando variantes de bio:', e);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Barra superior con botón de retorno al Dashboard */}
      <AppEditorHeader
        sectionTitle={cardId ? "Editar Tarjeta INDI" : "Crear Tarjeta INDI"}
        categoryName="Tarjetas Digitales"
        categoryHref="/dashboard?tab=cards"
        badgeText={cardId ? "Modo Edición" : "Sincronización 60 FPS"}
      >
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando en Turso...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>¡Guardado! Redirigiendo...</span>
            </>
          ) : (
            <>
              <span>Guardar y Publicar</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </AppEditorHeader>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Grid: Editor a la Izquierda, Previsualización a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Panel de Controles / Formulario */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8">
          {/* Pestañas */}
          <div className="flex items-center gap-2 mb-8 p-1.5 rounded-2xl bg-black/40 border border-white/5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Perfil</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contacto</span>
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'social'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Redes</span>
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Efectos</span>
            </button>
          </div>

          {/* Tab 1: Perfil */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono font-semibold uppercase text-zinc-400">
                    Enlace Personalizado (Slug Público)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleRegenerateSlugFromName}
                      title="Sincronizar slug con tu nombre"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-indigo-400 px-2 py-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Desde nombre</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPublicUrl}
                      title="Copiar enlace de tarjeta"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-emerald-400 px-2 py-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {isCopiedSlug ? (
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
                    : 'border-white/10 focus-within:border-indigo-500/80'
                }`}>
                  <span className="text-zinc-500 font-mono select-none text-xs sm:text-sm">soyindi.cl/c/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none pl-1"
                    placeholder="tu-nombre"
                    spellCheck={false}
                  />

                  {/* Estado dinámico de disponibilidad con Turso */}
                  <div className="flex items-center gap-1.5 ml-2">
                    {isCheckingSlug ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Ej. Carlos Mendoza"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                    Especialidad / Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => handleChange('profession', e.target.value)}
                    className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Ej. Arquitecto de Software"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Sobre Mí (Bio Profesional)
                  </label>
                  <button
                    type="button"
                    disabled={isGeneratingBio}
                    onClick={handleGenerateAiBios}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors disabled:opacity-50"
                  >
                    {isGeneratingBio ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generando con IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generar con IA (3 Opciones)</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.about || ''}
                  onChange={(e) => handleChange('about', e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Una breve descripción de tu propuesta de valor..."
                />

                {/* Variantes de IA generadas en tiempo real */}
                {bioVariants.length > 0 && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-white/[0.04] border border-cyan-500/20 space-y-2 animate-fade-in">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
                      Opciones sugeridas por IA:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {bioVariants.map((opt) => (
                        <button
                          key={opt.tone}
                          type="button"
                          onClick={() => handleChange('about', opt.bio)}
                          className="p-2.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 hover:border-cyan-400/40 text-left transition-all group"
                        >
                          <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-cyan-300 uppercase block mb-1">
                            {opt.label}
                          </span>
                          <p className="text-xs text-zinc-300 leading-snug">{opt.bio}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Foto de Perfil con Compresión WebP en Cliente */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono font-semibold uppercase text-zinc-400">
                    Foto de Perfil o Avatar (WebP Ultra-Comprimido)
                  </label>
                  {isCompressingPhoto && (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Optimizando...
                    </span>
                  )}
                </div>

                {/* Zona de Subida y Previsualización */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="file"
                      ref={photoFileInputRef}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={handlePhotoFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => photoFileInputRef.current?.click()}
                      disabled={isCompressingPhoto}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UploadCloud className="w-4 h-4 text-cyan-400" />
                      <span>Subir Foto (Auto-WebP)</span>
                    </button>

                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('photoUrl', '');
                          setPhotoCompressionInfo(null);
                        }}
                        className="min-h-[44px] min-w-[44px] px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs flex items-center justify-center transition-all cursor-pointer"
                        title="Quitar foto actual"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Métricas de Compresión */}
                {photoCompressionInfo && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
                    <span>⚡ Optimizado WebP: {photoCompressionInfo.originalKb} KB ➔ {photoCompressionInfo.compressedKb} KB</span>
                    <span className="font-bold">-{photoCompressionInfo.ratio}% tamaño</span>
                  </div>
                )}

                {/* Input de URL directa opcional */}
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={formData.photoUrl?.startsWith('data:image/') ? '' : (formData.photoUrl || '')}
                    onChange={(e) => {
                      handleChange('photoUrl', e.target.value);
                      setPhotoCompressionInfo(null);
                    }}
                    className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs"
                    placeholder="O pega una URL web externa (https://...)"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Las fotos subidas se comprimen en tu navegador a formato WebP sin saturar tu red.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Contacto */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                  Número de WhatsApp (con código de país)
                </label>
                <input
                  type="text"
                  value={formData.whatsapp || ''}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  placeholder="+56 9 1234 5678"
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Genera el botón directo a chat con mensaje personalizado automático.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                  Correo Electrónico de Contacto
                </label>
                <input
                  type="email"
                  value={formData.emailContact || ''}
                  onChange={(e) => handleChange('emailContact', e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  placeholder="contacto@tuempresa.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dirección Física u Oficina (Genera Mapa)</span>
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Ej. Av. Providencia 1208, Oficina 702, Santiago, Chile"
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Despliega automáticamente un mapa interactivo con accesos directos a Google Maps y Waze en tu tarjeta.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Redes Sociales */}
          {activeTab === 'social' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                  Sitio Web Personal o Portafolio
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl || ''}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs"
                  placeholder="https://tuportafolio.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                  Perfil de LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-xs"
                  placeholder="https://linkedin.com/in/tu-usuario"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                  Perfil de Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors font-mono text-xs"
                  placeholder="https://instagram.com/tu-usuario"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Estilo, Presets & Efectos */}
          {activeTab === 'theme' && (
            <div className="space-y-7 animate-fade-in">
              {/* Presets Curados de Diseño */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Presets de Diseño Curados</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">OKLCH P3</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CARD_DESIGN_PRESETS.map((preset) => {
                    const isSelected = formData.themeConfig?.themeId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            themeConfig: {
                              ...prev.themeConfig,
                              themeId: preset.id,
                              primaryColorOklch: preset.primaryColorOklch,
                              backgroundColorOklch: preset.backgroundColorOklch,
                              particleBehavior: preset.particleBehavior,
                              particleIntensity: preset.particleIntensity,
                              cardFinish: preset.cardFinish,
                              surfaceTexture: preset.surfaceTexture,
                            },
                          }));
                        }}
                        className={`min-h-[56px] p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/10 border-cyan-400/80 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400/30'
                            : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-sm"
                            style={{ backgroundColor: preset.primaryColorOklch }}
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {preset.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 line-clamp-1">
                              {preset.category}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-cyan-400 shrink-0 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Acabado de Tarjeta (Material Finish) */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-3">
                  Acabado de Tarjeta (Material Finish)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'luminous-glass', label: 'Opal Light (Claro)' },
                    { id: 'aurora-light', label: 'Aurora (Luminoso)' },
                    { id: 'classic', label: 'Clásico Glass' },
                    { id: 'holographic', label: 'Holográfico' },
                    { id: 'titanium', label: 'Titanio' },
                    { id: 'obsidian', label: 'Obsidiana' },
                    { id: 'minimal', label: 'Monocromo' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleThemeChange('cardFinish', f.id)}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        (formData.themeConfig?.cardFinish || 'classic') === f.id
                          ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400/50'
                          : 'glass-pill text-zinc-400 hover:text-white border-white/5'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textura de Superficie */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-3">
                  Textura de Superficie
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'frosted-prism', label: 'Prisma Escarchado' },
                    { id: 'radial-glow', label: 'Resplandor' },
                    { id: 'dot-grid', label: 'Dot Grid' },
                    { id: 'none', label: 'Liso' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleThemeChange('surfaceTexture', t.id)}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        (formData.themeConfig?.surfaceTexture || 'radial-glow') === t.id
                          ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/50'
                          : 'glass-pill text-zinc-400 hover:text-white border-white/5'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Personalizado de Acento */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Color Personalizado de Acento
                  </label>
                  <span className="text-[11px] font-mono font-semibold text-zinc-300">
                    {formData.themeConfig?.primaryColorOklch}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2.5">
                  {[
                    { name: 'Índigo Intenso', color: '#4f46e5' },
                    { name: 'Cian Luminoso', color: '#0284c7' },
                    { name: 'Menta Fresco', color: '#10b981' },
                    { name: 'Ámbar Cálido', color: '#f59e0b' },
                    { name: 'Rosa Magenta', color: '#ec4899' },
                    { name: 'Violeta Eléctrico', color: '#8b5cf6' },
                    { name: 'Zafiro Claro', color: '#38bdf8' },
                    { name: 'Verde Esmeralda', color: '#059669' },
                    { name: 'Coral Solar', color: '#f97316' },
                    { name: 'Fucsia Neón', color: '#d946ef' },
                    { name: 'Acero Claro', color: '#94a3b8' },
                    { name: 'Blanco Nieve', color: '#f8fafc' },
                  ].map((c) => {
                    const isCurrent = formData.themeConfig?.primaryColorOklch === c.color;
                    return (
                      <button
                        key={c.color}
                        type="button"
                        title={c.name}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            themeConfig: {
                              ...prev.themeConfig,
                              themeId: 'custom',
                              primaryColorOklch: c.color,
                            },
                          }));
                        }}
                        className={`h-11 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-white scale-105 shadow-lg shadow-white/10 ring-2 ring-white/30'
                            : 'border-transparent hover:scale-95 opacity-85 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.color }}
                      >
                        {isCurrent && (
                          <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-md" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comportamiento SmartParticles */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-3">
                  Comportamiento SmartParticles v3.0
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['ambient', 'interactive', 'static'] as const).map((b) => {
                    const isSelected = (formData.themeConfig?.particleBehavior || 'ambient') === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleThemeChange('particleBehavior', b)}
                        className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/40'
                            : 'glass-pill text-zinc-400 hover:text-white border-white/5 hover:border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />}
                        <span>{b === 'ambient' ? 'Flotación' : b === 'interactive' ? 'Interactivo' : 'Estático'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intensidad de Partículas */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-3">
                  Intensidad de Partículas
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['subtle', 'balanced', 'prominent'] as const).map((lvl) => {
                    const isSelected = (formData.themeConfig?.particleIntensity || 'balanced') === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleThemeChange('particleIntensity', lvl)}
                        className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                            : 'glass-pill text-zinc-400 hover:text-white border-white/5 hover:border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                        <span>{lvl === 'subtle' ? 'Sutil' : lvl === 'balanced' ? 'Equilibrado' : 'Prominente'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel de Previsualización en Vivo */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
              Vista Previa en Vivo
            </span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sincronizado
            </span>
          </div>

          <DigitalCard card={formData} isInteractive={false} />
        </div>
      </div>

      {/* Barra de acción flotante para móviles (Thumb Zone ergonómica) */}
      <div className="fixed bottom-4 inset-x-4 z-40 sm:hidden">
        <div className="glass-panel p-2.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 pl-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-medium text-zinc-300">
              {savedSuccess ? '¡Guardado!' : 'Sin guardar'}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 max-w-[200px] min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Guardado</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Guardar Tarjeta</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
