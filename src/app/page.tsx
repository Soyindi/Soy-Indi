import Link from 'next/link';
import { ArrowRight, Check, FileText, Presentation, QrCode, type LucideIcon } from 'lucide-react';
import { DigitalCard } from '@/entities/card/components/DigitalCard';
import { LANDING_CONTENT, type LandingProduct } from '@/entities/landing/schemas';
import { PricingSection } from '@/features/pricing/components/PricingSection';
import { FaqAccordion } from '@/features/pricing/components/FaqAccordion';
import { HeroCtaButtons } from '@/features/onboarding/components/HeroCtaButtons';
import { BottomCtaButton } from '@/features/onboarding/components/BottomCtaButton';
import { GlobalNavbar } from '@/shared/ui/GlobalNavbar';
import { BrandLogo } from '@/shared/ui/BrandLogo';

const PRODUCT_ICONS: Record<LandingProduct['id'], LucideIcon> = {
  card: QrCode,
  cv: FileText,
  presentation: Presentation,
};

const FOOTER_LINKS = [
  { href: '/cards', label: 'Tarjetas' },
  { href: '/cv', label: 'Currículum' },
  { href: '/presentations', label: 'Presentaciones' },
  { href: '/pricing', label: 'Precios' },
];

/**
 * Landing Minimalista INDI 2026 — presupuesto de 5 secciones:
 * Hero (marca + demo) · Por qué INDI · Herramientas · Precios · FAQ (+ cierre).
 */
export default function HomePage() {
  const { hero, valueProps, products, closing } = LANDING_CONTENT;

  return (
    <div className="relative min-h-screen flex flex-col">
      <div id="inicio" className="absolute top-0 left-0 w-0 h-0" aria-hidden="true" />

      {/* Un único halo de marca (antes: 3 blobs que competían con el logo) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-16%] left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-indigo-600/16 blur-[160px]" />
      </div>

      <GlobalNavbar />

      <main className="relative z-10 flex-1">
        {/* 1 · HERO */}
        <section className="max-w-6xl mx-auto px-6 pt-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <BrandLogo variant="horizontal" size="xl" priority className="mb-8" />
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-300 mb-4">
                {hero.eyebrow}
              </p>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
                {hero.title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-teal-300">
                  {hero.highlight}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-8 max-w-xl">{hero.subtitle}</p>
              <HeroCtaButtons className="mb-8" />
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-400 font-medium">
                {hero.trustBadges.map((badge) => (
                  <li key={badge} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    {badge}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                Ejemplo real · interactivo
              </span>
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

        {/* 2 · POR QUÉ INDI (reemplaza la comparativa papel vs digital) */}
        <section id="comparativa" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-24 border-t border-white/5">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-8">¿Por qué INDI?</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((prop) => (
              <div key={prop.title}>
                <dt className="text-sm font-bold text-white mb-2">{prop.title}</dt>
                <dd className="text-sm text-zinc-400 leading-relaxed">{prop.description}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 3 · HERRAMIENTAS */}
        <section id="soluciones" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-8">
            Tres herramientas, una cuenta.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => {
              const Icon = PRODUCT_ICONS[product.id];
              return (
                <Link
                  key={product.id}
                  href={product.href}
                  className="group glass-panel rounded-3xl p-8 flex flex-col gap-4 hover:border-indigo-400/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                >
                  <Icon className="w-6 h-6 text-cyan-300" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-white">{product.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed flex-1">{product.description}</p>
                  <span className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-cyan-300">
                    {product.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4 · PRECIOS */}
        <section id="precios" className="py-16 border-t border-white/5 scroll-mt-24">
          <PricingSection showTitle={true} />
        </section>

        {/* 5 · FAQ + CIERRE */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-16 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-center mb-8">
            Preguntas frecuentes
          </h2>
          <FaqAccordion />
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
          <div className="glass-panel rounded-3xl p-8 sm:p-16 flex flex-col items-center">
            <BrandLogo variant="symbol" size="lg" className="mb-6" />
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">{closing.title}</h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto mb-8">{closing.subtitle}</p>
            <BottomCtaButton />
          </div>
        </section>
      </main>

      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <BrandLogo variant="horizontal" size="sm" linkToHome={true} />
          <p>© 2026 INDI</p>
        </div>
        <nav aria-label="Enlaces del pie" className="flex flex-wrap justify-center gap-2 font-medium">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center min-h-[44px] px-2 hover:text-cyan-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
