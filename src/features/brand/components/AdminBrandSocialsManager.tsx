'use client';

import React, { useState } from 'react';
import { BrandSocialLinks } from '@/entities/brand/socials';
import { updateOfficialBrandSocialsAction } from '@/features/brand/actions';
import { InstagramIcon, LinkedInIcon, XTwitterIcon, WhatsAppIcon } from '@/shared/ui/icons/SocialBrandIcons';
import { Save, Check, RefreshCw, AlertCircle, Share2, Globe, Sparkles } from 'lucide-react';

interface AdminBrandSocialsManagerProps {
  initialSocials: BrandSocialLinks;
}

export function AdminBrandSocialsManager({ initialSocials }: AdminBrandSocialsManagerProps) {
  const [socials, setSocials] = useState<BrandSocialLinks>(initialSocials);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await updateOfficialBrandSocialsAction(socials);
      if (res.success && res.data) {
        setSocials(res.data);
        setSuccessMessage('¡Redes sociales actualizadas y sincronizadas en la portada!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.error || 'No se pudieron actualizar las redes sociales.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-4 h-4 text-pink-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Gestión de Canales y Redes Sociales Oficiales
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Configura los enlaces oficiales de la marca INDI que se exhiben en la portada web, pie de página y menú móvil.
          </p>
        </div>

        {/* Vista previa viva en el admin */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-white/10">
          <span className="text-[11px] font-mono text-zinc-400 px-2">Previsualización:</span>
          {socials.instagramUrl && (
            <a
              href={socials.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-pink-500/20 text-zinc-400 hover:text-pink-400 transition"
              title="Instagram"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
          )}
          {socials.linkedinUrl && (
            <a
              href={socials.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 transition"
              title="LinkedIn"
            >
              <LinkedInIcon className="w-3.5 h-3.5" />
            </a>
          )}
          {socials.xUrl && (
            <a
              href={socials.xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/20 text-zinc-400 hover:text-white transition"
              title="X"
            >
              <XTwitterIcon className="w-3.5 h-3.5" />
            </a>
          )}
          {socials.whatsappUrl && (
            <a
              href={socials.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition"
              title="WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Instagram */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-pink-400">
            <InstagramIcon className="w-4 h-4" />
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Instagram Oficial
            </label>
          </div>
          <p className="text-[11px] text-zinc-400">
            Perfil de comunidad y vitrina visual de la marca.
          </p>
          <input
            type="url"
            value={socials.instagramUrl}
            onChange={(e) => setSocials({ ...socials, instagramUrl: e.target.value })}
            placeholder="https://instagram.com/soyindi.cl"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors font-mono"
          />
        </div>

        {/* LinkedIn */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <LinkedInIcon className="w-4 h-4" />
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              LinkedIn Corporativo
            </label>
          </div>
          <p className="text-[11px] text-zinc-400">
            Página de empresa para captación de profesionales y B2B.
          </p>
          <input
            type="url"
            value={socials.linkedinUrl}
            onChange={(e) => setSocials({ ...socials, linkedinUrl: e.target.value })}
            placeholder="https://www.linkedin.com/company/soyindi"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>

        {/* X / Twitter */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-zinc-200">
            <XTwitterIcon className="w-4 h-4" />
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              X (Antes Twitter)
            </label>
          </div>
          <p className="text-[11px] text-zinc-400">
            Canal de noticias, actualizaciones y soporte ágil.
          </p>
          <input
            type="url"
            value={socials.xUrl}
            onChange={(e) => setSocials({ ...socials, xUrl: e.target.value })}
            placeholder="https://x.com/soyindicorporate"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </div>

        {/* WhatsApp Soporte */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <WhatsAppIcon className="w-4 h-4" />
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              WhatsApp de Atención & Soporte
            </label>
          </div>
          <p className="text-[11px] text-zinc-400">
            Canal de contacto directo 1-to-1 para usuarios y clientes.
          </p>
          <input
            type="url"
            value={socials.whatsappUrl}
            onChange={(e) => setSocials({ ...socials, whatsappUrl: e.target.value })}
            placeholder="https://wa.me/56900000000"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando Cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar y Aplicar Redes Sociales</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
