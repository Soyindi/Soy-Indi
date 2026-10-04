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
import { HeroCtaButtons } from '@/features/onboarding/components/HeroCtaButtons';
import { BottomCtaButton } from '@/features/onboarding/components/BottomCtaButton';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Anchor invisible para navegación instantánea hacia el tope */}
      <div id="inicio" className="absolute top-0 left-0 w-0 h-0 pointer-events-none opacity-0" aria-hidden="true" />

      {/* Luces volumétricas perimetrales aisladas para evitar scroll horizontal sin recortar el scroll del documento */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute top-[35%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-blue-700/15 blur-[150px]" />
      </div>

      {/* Header / Navbar Global Reactivo con Detección de Sesión */}
      <GlobalNavbar />

      {/* BLOQUE 1: HERO SECTION CON LIVE INTERACTIVE DEMO */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Columna Izquierda: Mensaje y Call to Action */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-medium text-cyan-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Para Emprendedores y Profesionales • 3 Días Gratis</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Haz crecer tu negocio y comparte tus servicios{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300">
                con un solo link en tu celular.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-8 max-w-2xl">
              Dile adiós a las tarjetas de papel que se pierden o terminan en la basura. 
              Con INDI, tus clientes te escriben a WhatsApp en un toque, conocen tus trabajos y te guardan en sus contactos al instante, por solo $1.000 pesos al mes.
            </p>

            <HeroCtaButtons className="mb-8" />

            <div className="flex items-center gap-6 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                No te pedimos tarjeta
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Listo en 2 minutos
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Sin amarras ni contratos
              </span>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Demo en Vivo con SmartParticles */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="text-center mb-3">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
                ● Ejemplo Real (Toca los botones para probarla)
              </span>
            </div>

            <DigitalCard
              card={{
                slug: 'demo',
                title: 'Carlos Mendoza',
                profession: 'Especialista en Marketing Digital',
                about: 'Ayudo a marcas y empresas a escalar sus ventas mediante estrategias de adquisición y analítica de datos.',
                whatsapp: '+56987654321',
                emailContact: 'carlos@mendoza.com',
                websiteUrl: 'https://carlosmendoza.com',
                linkedinUrl: 'https://linkedin.com/in/carlosmendoza',
                instagramUrl: 'https://instagram.com/carlosmendoza',
                photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
                address: 'Av. Providencia 1208, Oficina 702, Santiago, Chile',
                themeConfig: {
                  themeId: 'stellar',
                  primaryColorOklch: '#6366f1',
                  particleBehavior: 'ambient',
                  particleIntensity: 'balanced',
                  cardFinish: 'classic',
                  surfaceTexture: 'radial-glow',
                },
              }}
            />
          </div>
        </div>
      </section>

      {/* BLOQUE 2: COMPARATIVA CLARA (PAPEL VS INDI) */}
      <section id="comparativa" className="relative z-10 max-w-5xl mx-auto px-6 py-16 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            ¿Por qué ya casi nadie usa tarjetas de papel?
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            La forma antigua de dar tu contacto se quedó en el pasado. Mira lo que pasa en la vida real:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta Tradicional */}
          <div className="glass-panel rounded-3xl p-8 border border-red-500/20 bg-red-950/10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                Tarjetas de Papel de Imprenta
              </span>
              <X className="w-5 h-5 text-red-400" />
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Son caras:</strong> Pagas cerca de $35.000 por una cajita de 100 tarjetas y se te acaban justo cuando las necesitas.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Si cambias tu número o dirección:</strong> Tienes que botar toda la caja a la basura y volver a mandar a imprimir.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>No sabes qué pasó:</strong> Nunca sabrás si la persona guardó tu teléfono o si la dejó tirada en un cajón.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Da flojera escribir el número:</strong> El cliente tiene que tipear tu teléfono dígito por dígito para hablarte.</span>
              </li>
            </ul>
          </div>

          {/* Tarjeta Digital INDI */}
          <div className="glass-panel rounded-3xl p-8 border-2 border-emerald-500/30 bg-emerald-950/10 shadow-xl shadow-emerald-500/10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Tu Tarjeta Digital con INDI
              </span>
              <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-zinc-200">
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                <span><strong>Súper económica:</strong> Solo $2.500 pesos al mes (o $1.000/mes con el plan semestral) para compartirla todas las veces que quieras.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                <span><strong>La editas cuando quieras:</strong> Cambias tu foto, tu número o tus ofertas en segundos desde tu teléfono sin pagar de más.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                <span><strong>A un toque de WhatsApp:</strong> Tu cliente presiona un botón y te abre la conversación de inmediato.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                <span><strong>Ves cuánta gente te visita:</strong> Sabes cuántas personas abrieron tu tarjeta y cuántas te hablaron.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* BLOQUE 3: CÓMO TE AYUDA INDI EN TU DÍA A DÍA */}
      <section id="soluciones" className="relative z-10 max-w-7xl mx-auto px-6 py-20 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Todo lo que necesitas para tu negocio.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
              Fácil y sin enredos.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-300">
            Tres herramientas prácticas incluidas en una sola cuenta para mostrar lo que haces con orgullo:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Herramienta 1 */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tu Tarjeta Digital con Código QR</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Un link elegante con tu foto, tus servicios y tu catálogo. Tus clientes escanean tu código QR con la cámara de su teléfono o tocan tu enlace para chatear contigo directo por WhatsApp.
              </p>
            </div>
            <Link
              href="/cards/new"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              <span>Crear mi Tarjeta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Herramienta 2 */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Currículum Profesional Fácil</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Crea o mejora tu currículum paso a paso con la ayuda de un asistente inteligente. Te da consejos sencillos para destacar tu experiencia y lo descargas listo en PDF para postular a empleos.
              </p>
            </div>
            <Link
              href="/cv"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              <span>Preparar mi Currículum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Herramienta 3 */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between hover:border-teal-500/40 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
                <Presentation className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Presentaciones para Clientes</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Muestra tus propuestas, presupuestos o proyectos en diapositivas limpias y profesionales que puedes proyectar en tu computador, tablet o celular en cualquier reunión.
              </p>
            </div>
            <Link
              href="/presentations"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              <span>Ver Presentaciones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* BLOQUE 4: SECCIÓN DE PRECIOS INTEGRADA */}
      <section id="precios" className="relative z-10 py-16 border-t border-white/5 scroll-mt-24">
        <PricingSection showTitle={true} />
      </section>

      {/* BLOQUE 5: PREGUNTAS FRECUENTES CLARAS */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-20 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Preguntas Frecuentes
          </h2>
          <p className="text-sm text-zinc-300 mt-2">
            Todo claro y sin enredos antes de empezar tus 3 días gratis:
          </p>
        </div>

        <FaqAccordion />
      </section>

      {/* BLOQUE 6: BANNER DE CIERRE */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24 text-center">
        <div className="glass-panel rounded-3xl p-10 sm:p-14 border border-indigo-500/30 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Comienza hoy tus 3 días gratis
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto mb-8">
              Tu tarjeta estará lista en 2 minutos. Compártela en tus redes o por WhatsApp y empieza a recibir nuevos clientes.
            </p>
            <BottomCtaButton />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© 2026 INDI. La forma más fácil de mostrar tu trabajo y hacer crecer tu negocio.</p>
        <div className="flex items-center gap-6">
          <Link href="/cards" className="hover:text-zinc-300 transition-colors">Tarjetas</Link>
          <Link href="/cv" className="hover:text-zinc-300 transition-colors">Currículum</Link>
          <Link href="/presentations" className="hover:text-zinc-300 transition-colors">Presentaciones</Link>
          <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Precios</Link>
        </div>
      </footer>
    </div>
  );
}
