'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DigitalCard, CardData } from '@/entities/card/components/DigitalCard';
import { upsertCardAction } from '@/features/card-builder/actions';
import { AppEditorHeader } from '@/shared/ui/AppEditorHeader';
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
  ExternalLink
} from 'lucide-react';

interface CardBuilderProps {
  initialData?: Partial<CardData>;
}

export function CardBuilder({ initialData }: CardBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'social' | 'theme'>('profile');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estado reactivo del formulario
  const [formData, setFormData] = useState<CardData>({
    slug: initialData?.slug || 'mi-tarjeta',
    title: initialData?.title || 'Carlos Mendoza',
    profession: initialData?.profession || 'Especialista en Marketing Digital',
    about: initialData?.about || 'Ayudo a marcas y empresas a escalar sus ventas mediante estrategias de adquisición y analítica de datos.',
    whatsapp: initialData?.whatsapp || '+56987654321',
    emailContact: initialData?.emailContact || 'carlos@mendoza.com',
    websiteUrl: initialData?.websiteUrl || 'https://carlosmendoza.com',
    linkedinUrl: initialData?.linkedinUrl || 'https://linkedin.com/in/carlosmendoza',
    instagramUrl: initialData?.instagramUrl || 'https://instagram.com/carlosmendoza',
    photoUrl: initialData?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    themeConfig: {
      themeId: initialData?.themeConfig?.themeId || 'stellar',
      primaryColorOklch: initialData?.themeConfig?.primaryColorOklch || '#6366f1',
      particleBehavior: initialData?.themeConfig?.particleBehavior || 'ambient',
      particleIntensity: initialData?.themeConfig?.particleIntensity || 'balanced',
    },
  });

  // Manejador genérico de inputs
  const handleChange = (field: keyof CardData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  // Guardar en Turso
  const handleSave = () => {
    setErrorMsg(null);
    setSavedSuccess(false);

    startTransition(async () => {
      const res = await upsertCardAction({
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
        themeConfig: {
          themeId: formData.themeConfig?.themeId || 'stellar',
          primaryColorOklch: formData.themeConfig?.primaryColorOklch || '#6366f1',
          backgroundColorOklch: '#090a10',
          particleBehavior: formData.themeConfig?.particleBehavior || 'ambient',
          particleIntensity: formData.themeConfig?.particleIntensity || 'balanced',
          fontFamily: 'Inter',
          enableGlassRefraction: true,
        },
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Ocurrió un error');
      } else {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard?created=true&slug=${res.data?.slug}`);
        }, 900);
      }
    });
  };

  // Sugerencia inteligente rescatada del proyecto legacy
  const applySmartBioSuggestion = () => {
    handleChange(
      'about',
      `Impulso el crecimiento estratégico en ${formData.profession || 'mi área'}, combinando metodologías ágiles y orientación a resultados de alto impacto.`
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Barra superior con botón de retorno al Dashboard */}
      <AppEditorHeader
        sectionTitle="Diseñador de Tarjeta INDI"
        categoryName="Tarjetas Digitales"
        categoryHref="/dashboard"
        badgeText="Sincronización 60 FPS"
      >
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
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
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
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
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
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
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
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
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
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
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                  Enlace Personalizado (Slug Público)
                </label>
                <div className="flex items-center rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm">
                  <span className="text-zinc-500 font-mono">indi.bio/c/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 bg-transparent text-white font-mono focus:outline-none ml-1"
                    placeholder="tu-nombre"
                  />
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
                    onClick={applySmartBioSuggestion}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Sugerencia Inteligente</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.about || ''}
                  onChange={(e) => handleChange('about', e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Una breve descripción de tu propuesta de valor..."
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-2">
                  URL Foto de Perfil (o Avatar)
                </label>
                <input
                  type="text"
                  value={formData.photoUrl || ''}
                  onChange={(e) => handleChange('photoUrl', e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs"
                  placeholder="https://..."
                />
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

          {/* Tab 4: Efectos & Partículas */}
          {activeTab === 'theme' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-3">
                  Color de Acento & Partículas
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {[
                    { name: 'Índigo', color: '#6366f1' },
                    { name: 'Cian', color: '#06b6d4' },
                    { name: 'Esmeralda', color: '#10b981' },
                    { name: 'Oro', color: '#f59e0b' },
                    { name: 'Rosa', color: '#ec4899' },
                    { name: 'Púrpura', color: '#8b5cf6' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => handleThemeChange('primaryColorOklch', c.color)}
                      className={`h-11 rounded-xl flex items-center justify-center border-2 transition-all ${
                        formData.themeConfig?.primaryColorOklch === c.color
                          ? 'border-white scale-105 shadow-lg'
                          : 'border-transparent hover:scale-95'
                      }`}
                      style={{ backgroundColor: c.color }}
                    >
                      {formData.themeConfig?.primaryColorOklch === c.color && (
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-3">
                  Comportamiento SmartParticles v3.0
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['ambient', 'interactive', 'static'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleThemeChange('particleBehavior', b)}
                      className={`py-3 px-4 rounded-xl border text-xs font-semibold capitalize transition-all ${
                        formData.themeConfig?.particleBehavior === b
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                          : 'glass-pill text-zinc-400 hover:text-white border-white/5'
                      }`}
                    >
                      {b === 'ambient' ? 'Flotación' : b === 'interactive' ? 'Interactivo' : 'Estático'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-400 mb-3">
                  Intensidad de Partículas
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['subtle', 'balanced', 'prominent'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleThemeChange('particleIntensity', lvl)}
                      className={`py-3 px-4 rounded-xl border text-xs font-semibold capitalize transition-all ${
                        formData.themeConfig?.particleIntensity === lvl
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                          : 'glass-pill text-zinc-400 hover:text-white border-white/5'
                      }`}
                    >
                      {lvl === 'subtle' ? 'Sutil' : lvl === 'balanced' ? 'Equilibrado' : 'Prominente'}
                    </button>
                  ))}
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
    </div>
  );
}
