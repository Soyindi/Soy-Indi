import React from 'react';
import Link from 'next/link';
import { 
  Plus, 
  QrCode, 
  FileText, 
  MonitorPlay, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Share2,
  Smartphone,
  Layers
} from 'lucide-react';

interface DashboardEmptyStateProps {
  type: 'cards' | 'cvs' | 'presentations';
}

interface EmptyStateConfig {
  title: string;
  badge: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  accentGradient: string;
  accentBorder: string;
  accentText: string;
  icon: React.ReactNode;
  steps: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

const CONFIGS: Record<'cards' | 'cvs' | 'presentations', EmptyStateConfig> = {
  cards: {
    title: 'Comienza con tu primera Tarjeta Digital',
    badge: 'Presencia & Networking Activo',
    description: 'Reemplaza el papel por una tarjeta viva con link único, contacto directo a WhatsApp, archivo vCard descargable y código QR.',
    ctaText: 'Crear Mi Primera Tarjeta',
    ctaHref: '/cards/new',
    accentGradient: 'from-indigo-500 to-cyan-500',
    accentBorder: 'border-cyan-500/25',
    accentText: 'text-cyan-400',
    icon: <QrCode className="w-8 h-8 text-cyan-400" />,
    steps: [
      {
        title: '1. Personaliza tu Perfil',
        description: 'Agrega tu nombre, especialidad, foto comprimida en WebP y biografía profesional asistida con IA.',
        icon: <Smartphone className="w-4 h-4 text-cyan-400" />
      },
      {
        title: '2. Enlaces & WhatsApp',
        description: 'Configura tus canales directos, catálogo de servicios, testimonios y vCard 4.0 instantánea.',
        icon: <Share2 className="w-4 h-4 text-indigo-400" />
      },
      {
        title: '3. Enlace Vivo & Código QR',
        description: 'Publica tu slug personalizado y compártelo al instante en reuniones, redes o stickers.',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      }
    ]
  },
  cvs: {
    title: 'Impulsa tu carrera con un Smart CV A4',
    badge: 'Optimización ATS & Formato ISO 216',
    description: 'Crea o importa tu currículum para auditarlo frente a filtros de Recursos Humanos, generar un enlace público y exportarlo a PDF vectorial.',
    ctaText: 'Crear o Mejorar CV con IA',
    ctaHref: '/cv',
    accentGradient: 'from-emerald-500 to-teal-500',
    accentBorder: 'border-emerald-500/25',
    accentText: 'text-emerald-400',
    icon: <FileText className="w-8 h-8 text-emerald-400" />,
    steps: [
      {
        title: '1. Carga o Redacción Guiada',
        description: 'Pega tu trayectoria o sube un documento PDF para que el motor extraiga tus logros y referencias.',
        icon: <Layers className="w-4 h-4 text-emerald-400" />
      },
      {
        title: '2. Auditoría ATS Algorítmica',
        description: 'Recibe puntuación de 0 a 100, recomendaciones de verbos de acción y métricas cuantificables.',
        icon: <Sparkles className="w-4 h-4 text-teal-400" />
      },
      {
        title: '3. Web Link & PDF Vectorial A4',
        description: 'Genera una URL viva `/cv/tu-nombre` y descarga un PDF con texto 100% indexable y justificado.',
        icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />
      }
    ]
  },
  presentations: {
    title: 'Diseña Presentaciones Cinemáticas 16:9',
    badge: 'McKinsey SCQA Standard',
    description: 'Transforma ideas, informes o notas en diapositivas ejecutivas con Action Titles, copilotaje por slide y visualización en vivo.',
    ctaText: 'Crear Presentación 16:9',
    ctaHref: '/presentations',
    accentGradient: 'from-amber-500 to-orange-500',
    accentBorder: 'border-amber-500/25',
    accentText: 'text-amber-400',
    icon: <MonitorPlay className="w-8 h-8 text-amber-400" />,
    steps: [
      {
        title: '1. Ingesta de Documentos',
        description: 'Carga archivos PDF o textos para estructurar diapositivas automáticamente según el ritmo de tu charla.',
        icon: <Layers className="w-4 h-4 text-amber-400" />
      },
      {
        title: '2. Copiloto IA por Diapositiva',
        description: 'Alinea títulos de acción ejecutivos (<14 palabras) y notas del orador cronometradas en un clic.',
        icon: <Sparkles className="w-4 h-4 text-orange-400" />
      },
      {
        title: '3. Proyección Orbital & Modo Orador',
        description: 'Expón en vivo en pantalla completa 16:9 con transiciones fluidas y notas confidenciales en tiempo real.',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      }
    ]
  }
};

export function DashboardEmptyState({ type }: DashboardEmptyStateProps) {
  const config = CONFIGS[type];

  return (
    <div className={`glass-panel rounded-3xl p-6 sm:p-10 border ${config.accentBorder} relative overflow-hidden transition-all shadow-xl`}>
      {/* Luz volumétrica interna sutil */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${config.accentGradient} opacity-10 blur-3xl pointer-events-none`} />

      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Isotipo con aura */}
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-lg">
          {config.icon}
        </div>

        {/* Badge contextual */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-xs font-semibold text-zinc-300 mb-3">
          <Sparkles className={`w-3.5 h-3.5 ${config.accentText}`} />
          <span>{config.badge}</span>
        </div>

        {/* Título y descripción ejecutiva */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          {config.title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed mb-8">
          {config.description}
        </p>

        {/* Guía visual en 3 pasos (Bento Cards horizontales) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-8 text-left">
          {config.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex flex-col justify-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                  {step.icon}
                </div>
                <h4 className="text-xs font-bold text-white tracking-tight">{step.title}</h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Botón de Acción Principal Magnético (Touch target >= 44px) */}
        <div className="w-full sm:w-auto">
          <Link
            href={config.ctaHref}
            className={`min-h-[48px] min-w-[200px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r ${config.accentGradient} text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/15 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{config.ctaText}</span>
            <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
          </Link>
        </div>
      </div>
    </div>
  );
}
