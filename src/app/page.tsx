import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Globe, 
  Check, 
  X, 
  FileText, 
  Presentation, 
  QrCode,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';
import { DigitalCard } from '@/entities/card/components/DigitalCard';
import { PricingSection } from '@/features/pricing/components/PricingSection';
import { FaqAccordion } from '@/features/pricing/components/FaqAccordion';
import { GlobalNavbar } from '@/shared/ui/GlobalNavbar';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-between">
      {/* Luces volumétricas perimetrales */}
      <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-blue-700/15 blur-[150px] pointer-events-none" />

      {/* Header / Navbar Global Reactivo con Detección de Sesión */}
      <GlobalNavbar />

      {/* BLOQUE 1: HERO SECTION CON LIVE INTERACTIVE DEMO */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Columna Izquierda: Mensaje y Call to Action */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-medium text-cyan-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plataforma Todo-en-Uno • 15 Días de Prueba Gratis</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Tu Identidad Digital, Currículum y Presentaciones{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300">
                en un solo enlace vivo.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-8 max-w-2xl">
              Reemplaza las tarjetas de papel que se pierden o terminan en la basura. Conecta a clientes
              directamente por WhatsApp, supera los filtros ATS de reclutamiento y proyecta diapositivas
              cinemáticas a $1.000 CLP al mes.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <Link
                href="/login?mode=signup&callbackUrl=/start"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[48px]"
              >
                <span>Comenzar Prueba de 15 Días</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass-panel text-zinc-300 hover:text-white font-medium text-sm transition-all min-h-[48px]"
              >
                <span>Conocer Plan Semestral ($6.000)</span>
              </Link>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Configuración en 2 min
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Cancela cuando quieras
              </span>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Demo en Vivo con SmartParticles */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="text-center mb-3">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
                ● Tarjeta Interactiva en Vivo (Prueba los botones)
              </span>
            </div>

            <DigitalCard
              card={{
                slug: 'demo',
                title: 'Matías Riquelme',
                profession: 'Ingeniero de Software & Tech Lead',
                about: 'Especialista en arquitecturas web distribuidas, Edge computing y sistemas de alta concurrencia.',
                whatsapp: '+56912345678',
                emailContact: 'contacto@matiasriquelme.dev',
                websiteUrl: 'https://matiasriquelme.dev',
                linkedinUrl: 'https://linkedin.com',
                instagramUrl: 'https://instagram.com',
                photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                themeConfig: {
                  themeId: 'stellar',
                  primaryColorOklch: '#6366f1',
                  particleBehavior: 'interactive',
                  particleIntensity: 'balanced',
                },
              }}
            />
          </div>
        </div>
      </section>

      {/* BLOQUE 2: COMPARATIVA BRUTAL (PAPEL VS INDI) */}
      <section id="comparativa" className="relative z-10 max-w-5xl mx-auto px-6 py-16 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            ¿Por qué el 93% de las tarjetas de papel fracasan?
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            La forma tradicional de networking quedó obsoleta. Compara los números reales:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta Tradicional */}
          <div className="glass-panel rounded-3xl p-8 border border-red-500/20 bg-red-950/10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                Tarjetas de Papel Impresas
              </span>
              <X className="w-5 h-5 text-red-400" />
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Cuestan ~$35.000 CLP</strong> por caja de 100 unidades y se agotan rápido.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Si cambias de teléfono o cargo</strong>, debes botarlas todas a la basura.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Cero analítica:</strong> Imposible saber si alguien la leyó o la botó.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>El cliente tiene que digitar tu número a mano (fricción total).</span>
              </li>
            </ul>
          </div>

          {/* Tarjeta Digital INDI */}
          <div className="glass-panel rounded-3xl p-8 border-2 border-emerald-500/30 bg-emerald-950/10 shadow-xl shadow-emerald-500/10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Tarjeta Digital INDI (2026)
              </span>
              <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-zinc-200">
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                <span><strong>Solo $1.000 CLP al mes</strong> ($6.000 semestral) para uso ilimitado.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                <span><strong>Actualización en segundos:</strong> Cambia foto, datos o redes al instante.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                <span><strong>Un clic a WhatsApp:</strong> Abre el chat de inmediato con mensaje listo.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                <span><strong>Métricas en vivo:</strong> Cuenta cuántas personas te visitan y hacen clic.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* BLOQUE 3: EL TRIDENTE DE PRODUCTOS (BENTO GRID) */}
      <section id="soluciones" className="relative z-10 max-w-7xl mx-auto px-6 py-20 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Tres Soluciones de Élite.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
              Un Solo Ecosistema.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Todo lo necesario para tu presencia profesional y de negocios integrado en tu membresía:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pilar 1 */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tarjetas & QR Interactivo</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Diseño Glassmorphism 2.0 tridimensional, SmartParticles anti-colisión y botón directo a WhatsApp con previsualización en redes sociales.
              </p>
            </div>
            <Link
              href="/cards/new"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              <span>Diseñar Tarjeta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pilar 2 */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart CV (Calibración ATS)</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Auditoría heurística con Score 0-100 para superar los filtros automatizados de reclutadores, con vista de impresión A4 estándar.
              </p>
            </div>
            <Link
              href="/cv"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              <span>Auditar mi Currículum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pilar 3 */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between hover:border-teal-500/40 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
                <Presentation className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Orbital Studio 16:9</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Presentaciones cinemáticas con iluminación volumétrica e inteligencia artificial para estructurar diapositivas automáticamente.
              </p>
            </div>
            <Link
              href="/presentations"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              <span>Abrir Estudio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* BLOQUE 4: SECCIÓN DE PRECIOS INTEGRADA */}
      <section id="precios" className="relative z-10 py-16 border-t border-white/5 scroll-mt-24">
        <PricingSection showTitle={true} />
      </section>

      {/* BLOQUE 5: FAQ ANTI-OBJECIONES */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-20 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Preguntas Frecuentes
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Todo claro antes de iniciar tu prueba gratuita de 15 días:
          </p>
        </div>

        <FaqAccordion />
      </section>

      {/* BLOQUE 6: BANNER DE CIERRE */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24 text-center">
        <div className="glass-panel rounded-3xl p-10 sm:p-14 border border-indigo-500/30 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Comienza hoy tu prueba de 15 días gratis
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto mb-8">
              Tu enlace público estará listo en 2 minutos. Comparte por WhatsApp, activa tu QR y comprueba la diferencia.
            </p>
            <Link
              href="/login?mode=signup&callbackUrl=/start"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all min-h-[48px]"
            >
              <span>Comenzar Prueba Gratuita Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© 2026 INDI Platform. Diseñado para alta velocidad y conversión.</p>
        <div className="flex items-center gap-6">
          <Link href="/cards" className="hover:text-zinc-300 transition-colors">Tarjetas</Link>
          <Link href="/cv" className="hover:text-zinc-300 transition-colors">Smart CV</Link>
          <Link href="/presentations" className="hover:text-zinc-300 transition-colors">Presentaciones</Link>
          <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Precios</Link>
        </div>
      </footer>
    </div>
  );
}
