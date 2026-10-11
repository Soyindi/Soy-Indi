'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ServerCrash, 
  Sparkles, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';

export type ErrorType = 'general' | 'ai_unavailable' | 'database_timeout' | 'not_found' | 'network_offline';

interface SystemErrorFallbackProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  type?: ErrorType;
  title?: string;
  description?: string;
  actionText?: string;
  showHomeButton?: boolean;
}

const ERROR_META: Record<ErrorType, {
  icon: React.ReactNode;
  defaultTitle: string;
  defaultDescription: string;
  badge: string;
  badgeColor: string;
  retryText: string;
}> = {
  general: {
    icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
    defaultTitle: 'Interrupción Temporal del Servicio',
    defaultDescription: 'El sistema experimentó una anomalía inesperada. Tus datos están seguros y no se ha perdido información.',
    badge: 'RECUPERACIÓN AUTOMÁTICA',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    retryText: 'Reintentar Operación',
  },
  ai_unavailable: {
    icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
    defaultTitle: 'Copiloto de IA Temporalmente Ocupado',
    defaultDescription: 'Los modelos de lenguaje de alta demanda están experimentando alta concurrencia. El motor heurístico y tus datos siguen 100% operativos.',
    badge: 'CIRCUIT BREAKER ACTIVO',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    retryText: 'Reintentar con Copiloto Alternativo',
  },
  database_timeout: {
    icon: <ServerCrash className="w-8 h-8 text-rose-400" />,
    defaultTitle: 'Conexión a Base de Datos en Espera',
    defaultDescription: 'La réplica perimetral está sincronizando transacciones. Tu sesión permanece intacta; reintenta en unos instantes.',
    badge: 'SINCRONIZACIÓN PERIMETRAL',
    badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    retryText: 'Reconectar con el Servidor',
  },
  not_found: {
    icon: <ShieldAlert className="w-8 h-8 text-indigo-400" />,
    defaultTitle: 'Recurso No Encontrado',
    defaultDescription: 'La página, tarjeta digital o presentación que buscas no existe o fue reubicada a un nuevo enlace.',
    badge: 'ESTADO 404',
    badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    retryText: 'Actualizar Página',
  },
  network_offline: {
    icon: <AlertTriangle className="w-8 h-8 text-emerald-400" />,
    defaultTitle: 'Sin Conexión a Internet',
    defaultDescription: 'Detectamos una pérdida en la conectividad de red. Verifica tu señal o reconéctate a Wi-Fi para continuar.',
    badge: 'MODO OFFLINE',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    retryText: 'Comprobar Conexión',
  },
};

/**
 * SystemErrorFallback — Componente Canónico de Resiliencia UI (INDI 2026)
 * 
 * Presenta errores de sistema, desconexión o caídas de IA de forma elegante,
 * no catastrófica, con retícula Base 8, contrastes WCAG 2.2 AA y botones de recuperación.
 */
export function SystemErrorFallback({
  error,
  reset,
  type = 'general',
  title,
  description,
  actionText,
  showHomeButton = true,
}: SystemErrorFallbackProps) {
  const meta = ERROR_META[type];
  const finalTitle = title || meta.defaultTitle;
  const finalDescription = description || error?.message || meta.defaultDescription;
  const finalActionText = actionText || meta.retryText;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center p-4 sm:p-6 select-none"
    >
      {/* Halos Volumétricos Suaves */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

      {/* Contenedor Flotante de Cristal Esmerilado */}
      <div className="relative z-10 max-w-lg w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 text-center shadow-2xl backdrop-blur-xl">
        {/* Isotipo Oficial Canónico */}
        <div className="flex justify-center mb-5">
          <BrandLogo variant="horizontal" size="sm" />
        </div>

        {/* Badge de Diagnóstico */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border mb-4 shadow-sm select-none"
          style={{}}
        >
          <span className={`px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
            {meta.badge}
          </span>
        </div>

        {/* Ícono de Estado Central */}
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-inner">
          {meta.icon}
        </div>

        {/* Título Principal */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          {finalTitle}
        </h2>

        {/* Bajada Explicativa Empática */}
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
          {finalDescription}
        </p>

        {/* Digest de Error Técnico (si existe) para Soporte */}
        {error?.digest && (
          <div className="mb-6 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-400 select-all">
            Código de diagnóstico: <span className="text-zinc-200">{error.digest}</span>
          </div>
        )}

        {/* Barra de Acciones Ergonómica (Touch Targets >= 44px) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-white/5">
          {reset && (
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{finalActionText}</span>
            </button>
          )}

          {showHomeButton && (
            <Link
              href="/"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Ir al Inicio</span>
            </Link>
          )}
        </div>

        {/* Soporte Directo */}
        <div className="mt-5 pt-4 border-t border-white/5 text-[11px] text-zinc-500 flex items-center justify-center gap-1">
          <span>¿El problema persiste?</span>
          <a
            href="https://wa.me/56964344404?text=Hola%20equipo%20INDI,%20experiment%C3%A9%20un%20error%20en%20la%20plataforma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-0.5 ml-1"
          >
            <span>Contactar Soporte Técnico</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
