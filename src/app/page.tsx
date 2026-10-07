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
import { BrandHeroBackdrop } from '@/shared/ui/BrandHeroBackdrop';
import { BRAND_ASSETS } from '@/entities/brand/schemas';
import { JsonLd } from '@/shared/ui/JsonLd';
import Image from 'next/image';

const HOME_STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'INDI',
    url: 'https://soyindi.cl',
    logo: 'https://soyindi.cl/brand/indi-alien-symbol.webp',
    description: 'Plataforma SaaS de Identidad Digital, Tarjetas Inteligentes, Smart CVs y Networking Profesional.',
    sameAs: [
      'https://www.linkedin.com/company/soyindi',
      'https://instagram.com/soyindi.cl',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'INDI — Identidad Digital y Networking',
    url: 'https://soyindi.cl',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://soyindi.cl/c/{search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo funcionan los 3 días de prueba gratis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Al crear tu cuenta tienes 3 días completos para usar todo gratis, sin ningún compromiso y sin pedirte tarjeta de crédito. Puedes crear tu tarjeta, personalizarla con tus datos, revisar tus métricas de visitas y compartir tu link o tu código QR con tus clientes desde el primer minuto.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta el servicio después de los 3 días?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes suscribirte por solo $2.500 CLP al mes para mantener tus tarjetas digitales, métricas, currículum profesional y presentaciones activas. O si prefieres ahorrar un 60%, puedes optar por el plan semestral de $6.000 CLP cada 6 meses (equivalente a $1.000 al mes).',
        },
      },
      {
        '@type': 'Question',
        name: '¿Mis clientes necesitan instalar alguna aplicación para ver mi tarjeta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, para nada. Tu cliente solo escanea tu código QR con la cámara de su celular o toca el enlace que le envíes por WhatsApp, y tu tarjeta se abre al instante en su navegador.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué medios de pago puedo usar en Chile?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes pagar de forma rápida y segura con Cuenta RUT, tarjeta de débito o tarjeta de crédito mediante Webpay / Mercado Pago.',
        },
      },
    ],
  },
];

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
const DEMO_CARD = {
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
} as const;

export default function HomePage() {
  const { hero, valueProps, products, closing } = LANDING_CONTENT;
  const stacked = BRAND_ASSETS.stackedHero;

  return (
    <div className="relative min-h-screen flex flex-col">
      <JsonLd data={HOME_STRUCTURED_DATA} />
      <div id="inicio" className="absolute top-0 left-0 w-0 h-0" aria-hidden="true" />

      <GlobalNavbar />

      <main className="relative z-10 flex-1">
        {/* 1 · HERO: halo CSS (zero-media) + logo vertical como único protagonista */}
        <section className="relative isolate min-h-[calc(100svh-72px)] flex items-center justify-center px-6 py-16 overflow-hidden">
          <BrandHeroBackdrop />
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
            <div className="relative w-40 sm:w-48 aspect-[768/640] overflow-hidden mb-8">
              <Image
                src={stacked.url}
                alt={stacked.alt}
                fill
                priority
                sizes="(min-width: 640px) 192px, 160px"
                className="object-cover mix-blend-screen drop-shadow-[0_0_32px_rgba(34,211,238,0.35)]"
              />
            </div>
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-300 mb-4">
                {hero.eyebrow}
              </p>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
                {hero.title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-teal-300">
                  {hero.highlight}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-200 leading-relaxed mb-8 max-w-xl">{hero.subtitle}</p>
              <HeroCtaButtons className="mb-8 justify-center" />
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-zinc-300 font-medium">
                {hero.trustBadges.map((badge) => (
                  <li key={badge} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    {badge}
                  </li>
                ))}
              </ul>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
            {products.map((product) => {
              const Icon = PRODUCT_ICONS[product.id];
              return (
                <Link
                  key={product.id}
                  href={product.href}
                  className="group glass-panel rounded-3xl p-6 flex items-start gap-4 hover:border-indigo-400/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                >
                  <Icon className="w-6 h-6 text-cyan-300 shrink-0 mt-1" aria-hidden="true" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{product.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{product.description}</p>
                    <span className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-cyan-300">
                      {product.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
            </div>
            <div className="lg:col-span-5 flex flex-col items-center">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                Ejemplo real · interactivo
              </span>
              <DigitalCard card={DEMO_CARD} />
            </div>
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
