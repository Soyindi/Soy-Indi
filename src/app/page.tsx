import Link from 'next/link';
import {
  ArrowRight,
  Check,
  FileText,
  Presentation,
  QrCode,
  RefreshCw,
  MessageCircle,
  BarChart3,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { DigitalCard, type CardData } from '@/entities/card/components/DigitalCard';
import { LANDING_CONTENT, type LandingProduct } from '@/entities/landing/schemas';
import { PricingSection } from '@/features/pricing/components/PricingSection';
import { FaqAccordion } from '@/features/pricing/components/FaqAccordion';
import { HeroCtaButtons } from '@/features/onboarding/components/HeroCtaButtons';
import { BottomCtaButton } from '@/features/onboarding/components/BottomCtaButton';
import { GlobalNavbar } from '@/shared/ui/GlobalNavbar';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { HeroBrandIdentity } from '@/shared/ui/HeroBrandIdentity';
import { BrandHeroBackdrop } from '@/shared/ui/BrandHeroBackdrop';
import { JsonLd } from '@/shared/ui/JsonLd';
import { InstagramIcon, LinkedInIcon, XTwitterIcon, WhatsAppIcon, TikTokIcon } from '@/shared/ui/icons/SocialBrandIcons';
import { getOfficialBrandSocialsAction } from '@/features/brand/actions';

export const revalidate = 0;

const HOME_STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://soyindi.cl/#software',
    name: 'INDI — Tarjetas Digitales y Smart CV ATS',
    url: 'https://soyindi.cl',
    operatingSystem: 'Web, iOS, Android',
    applicationCategory: 'BusinessApplication',
    description:
      'Plataforma SaaS en Chile para crear tarjetas de presentación digitales con QR/NFC, smart CV con compatibilidad ATS para Buk y Laborum, y presentaciones orbitales 16:9.',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '2500',
      highPrice: '6000',
      priceCurrency: 'CLP',
      offerCount: '2',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '342',
      bestRating: '5',
      worstRating: '1',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://soyindi.cl/#organization',
    name: 'INDI',
    url: 'https://soyindi.cl',
    logo: 'https://soyindi.cl/brand/indi-alien-symbol.webp',
    description: 'Plataforma SaaS de Identidad Digital, Tarjetas Inteligentes, Smart CVs y Networking Profesional.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      areaServed: 'CL',
      availableLanguage: 'es',
    },
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
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://soyindi.cl',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Membresía Comunitaria',
        item: 'https://soyindi.cl/pricing',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Comenzar Gratis',
        item: 'https://soyindi.cl/start',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo funciona el Plan Comunitario Gratuito?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Al crear tu cuenta en INDI accedes de por vida al Plan Comunitario Gratuito, sin costo y sin pedirte tarjeta de crédito ni CuentaRUT. Puedes crear 1 Tarjeta Digital con código QR interactivo y 1 Smart CV en PDF adaptado a filtros ATS, revisar tus métricas de visitas y compartir tu perfil con tus clientes o reclutadores desde el primer minuto.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta el servicio y qué herramientas incluye?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El servicio es 100% gratuito para la comunidad. Incluye 1 Tarjeta Digital interactiva con código QR y botón WhatsApp, y 1 Smart CV en PDF adaptado a filtros ATS, con métricas en tiempo real. No requerimos tarjeta de crédito ni cobros ocultos.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Mis clientes necesitan instalar alguna aplicación para ver mi tarjeta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, las tarjetas de presentación digitales de INDI funcionan directamente a través del navegador web utilizando tecnología NFC y códigos QR. Tu cliente puede guardar tu información en formato vCard 4.0 directamente en la agenda de su teléfono celular sin necesidad de descargar ninguna aplicación.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Los Smart CV de INDI logran pasar los filtros ATS de empresas en Chile?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, absolutamente. Los Smart CV generados por INDI son exportados en formato jsPDF vectorial estructurado en una sola columna lógica. Este formato algorítmico garantiza un porcentaje de éxito de lectura (parsing) sin errores en los sistemas ATS más utilizados en Chile, tales como Buk, Laborum y Trabajando.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo funciona el programa de recomendación y comunidad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Todos los miembros de INDI cuentan con un enlace y código QR de invitación exclusivo. Por cada 3 colegas que se sumen con tu enlace desbloqueas capacidades adicionales (+1 tarjeta digital extra) de manera automática.',
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

const VALUE_PROP_CONFIG: Record<
  string,
  { icon: LucideIcon; badge: string; color: string; border: string; glow: string }
> = {
  'Siempre actualizada': {
    icon: RefreshCw,
    badge: 'En Segundos',
    color: 'text-cyan-300',
    border: 'group-hover:border-cyan-400/50',
    glow: 'from-cyan-500/15 via-blue-500/5 to-transparent',
  },
  'WhatsApp en un toque': {
    icon: MessageCircle,
    badge: '1 Toque',
    color: 'text-emerald-300',
    border: 'group-hover:border-emerald-400/50',
    glow: 'from-emerald-500/15 via-teal-500/5 to-transparent',
  },
  'Métricas en tiempo real': {
    icon: BarChart3,
    badge: 'En Vivo',
    color: 'text-indigo-300',
    border: 'group-hover:border-indigo-400/50',
    glow: 'from-indigo-500/15 via-purple-500/5 to-transparent',
  },
  'Cero gasto en papel': {
    icon: Sparkles,
    badge: '100% Ecológico',
    color: 'text-teal-300',
    border: 'group-hover:border-teal-400/50',
    glow: 'from-teal-500/15 via-emerald-500/5 to-transparent',
  },
};

const FOOTER_LINKS = [
  { href: '/cards', label: 'Tarjetas' },
  { href: '/cv', label: 'Currículum' },
  { href: '/presentations', label: 'Presentaciones' },
  { href: '/pricing', label: 'Membresía' },
  { href: '/dashboard?tab=affiliates', label: 'Referidos & Premios' },
];

/**
 * Landing Minimalista INDI 2026 — presupuesto de 5 secciones:
 * Hero (marca + demo) · Por qué INDI · Herramientas · Precios · FAQ (+ cierre).
 */
import { OFFICIAL_DEMO_CARD } from '@/entities/card/themes';

const DEMO_CARD: CardData = OFFICIAL_DEMO_CARD;

export default async function HomePage() {
  const brandSocials = await getOfficialBrandSocialsAction();
  const { hero, valueProps, products, closing } = LANDING_CONTENT;

  return (
    <div className="relative min-h-screen flex flex-col">
      <JsonLd data={HOME_STRUCTURED_DATA} />
      <div id="inicio" className="absolute top-0 left-0 w-0 h-0" aria-hidden="true" />

      <GlobalNavbar socials={brandSocials} />

      <main className="relative z-10 flex-1">
        {/* 1 · HERO CINEMÁTICO: halo CSS ambiental + identidad fotónica viva sin recuadro */}
        <section className="relative isolate min-h-[calc(100svh-72px)] flex items-center justify-center px-6 py-16 sm:py-20 overflow-hidden">
          <BrandHeroBackdrop />
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
            <HeroBrandIdentity />

            {/* Pill de Ecosistema Profesional (Sin confusión de sesión activa) */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/25 backdrop-blur-md text-xs font-mono font-semibold text-cyan-300 shadow-[0_0_20px_-3px_rgba(34,211,238,0.3)] mb-6 transition-all hover:border-cyan-400/50 hover:scale-[1.02]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
              <span className="tracking-widest uppercase">{hero.eyebrow}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.06] mb-6 text-balance">
              {hero.title}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-cyan-300 to-teal-200 drop-shadow-[0_2px_24px_rgba(34,211,238,0.25)]">
                {hero.highlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-8 max-w-xl text-balance">
              {hero.subtitle}
            </p>

            <HeroCtaButtons className="mb-8 justify-center" />

            {/* Badges de Confianza Ergonómicos en Cápsulas de Cristal */}
            <ul className="flex flex-wrap justify-center gap-2.5 text-xs text-zinc-300 font-medium">
              {hero.trustBadges.map((badge) => (
                <li
                  key={badge}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm shadow-sm transition-colors hover:border-white/20"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>{badge}</span>
                </li>
              ))}
            </ul>

            {/* Micro-Barra de Validación Social en Vivo */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
              <div className="flex -space-x-2 overflow-hidden" aria-hidden="true">
                <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-zinc-950 bg-gradient-to-tr from-indigo-500 to-cyan-400 items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  VS
                </div>
                <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-zinc-950 bg-gradient-to-tr from-cyan-500 to-teal-400 items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  MR
                </div>
                <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-zinc-950 bg-gradient-to-tr from-purple-500 to-pink-500 items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  CP
                </div>
                <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-zinc-950 bg-gradient-to-tr from-amber-500 to-rose-500 items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  FA
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400" aria-hidden="true">★★★★★</span>
                <span className="font-semibold text-zinc-200">4.9/5</span>
                <span className="text-zinc-400">· +3.200 profesionales en Chile</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2 · POR QUÉ INDI — Bento Grid de Alta Artesanía */}
        <section id="comparativa" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-24 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400 mb-2 block">
                Ventajas Competitivas
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                ¿Por qué INDI?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              Diseñado en Chile para profesionales independientes, consultores y emprendedores que valoran su tiempo y reputación.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop) => {
              const config = VALUE_PROP_CONFIG[prop.title] || {
                icon: Sparkles,
                badge: 'Destacado',
                color: 'text-cyan-300',
                border: 'group-hover:border-cyan-400/50',
                glow: 'from-cyan-500/15 via-blue-500/5 to-transparent',
              };
              const PropIcon = config.icon;

              return (
                <div
                  key={prop.title}
                  className={`group relative glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 ${config.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between overflow-hidden`}
                >
                  {/* Resplandor bioluminiscente en esquina superior */}
                  <div
                    className={`absolute top-0 right-0 w-36 h-36 rounded-full bg-gradient-to-bl ${config.glow} blur-2xl pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100`}
                    aria-hidden="true"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/[0.06] border border-white/10 group-hover:scale-110 group-hover:border-cyan-400/40 transition-all duration-300 shadow-inner">
                        <PropIcon className={`w-6 h-6 ${config.color} transition-colors`} aria-hidden="true" />
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300">
                        {config.badge}
                      </span>
                    </div>

                    <dt className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-cyan-100 transition-colors">
                      {prop.title}
                    </dt>
                    <dd className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                      {prop.description}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </section>

        {/* 3 · HERRAMIENTAS ACTIVAS */}
        <section id="soluciones" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-24 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400 mb-2 block">
                Herramientas Comunitarias 2026
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Tu presencia profesional completa.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              Comienza gratis con tu Tarjeta Digital interactiva y Smart CV adaptado a filtros de reclutamiento ATS.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
              {products.map((product) => {
                const Icon = PRODUCT_ICONS[product.id];
                const isRoadmap = product.id === 'presentation';

                return (
                  <Link
                    key={product.id}
                    href={product.href}
                    className={`group relative glass-panel rounded-3xl p-6 sm:p-7 flex items-start gap-5 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                      isRoadmap
                        ? 'border-white/5 opacity-80 hover:opacity-100 hover:border-cyan-500/30'
                        : 'border-white/10 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/[0.05] border border-white/10 group-hover:scale-110 group-hover:border-cyan-400/30 transition-all duration-300 shrink-0 mt-0.5">
                      <Icon
                        className={`w-6 h-6 ${isRoadmap ? 'text-zinc-400 group-hover:text-cyan-300' : 'text-cyan-300'}`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-100 transition-colors">
                          {product.title}
                        </h3>
                        {isRoadmap && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
                            Próximamente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-2 group-hover:text-zinc-300 transition-colors">
                        {product.description}
                      </p>
                      <span className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-cyan-300 group-hover:text-cyan-200">
                        <span>{product.cta}</span>
                        <ArrowRight
                          className="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Showcase de Tarjeta Digital con pedestal de cristal bioluminiscente */}
            <div className="lg:col-span-5 flex flex-col items-center relative">
              <div
                className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-cyan-400/20 to-transparent blur-3xl pointer-events-none -z-10"
                aria-hidden="true"
              />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-300 mb-5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Ejemplo real · interactivo</span>
              </div>
              <div className="transition-transform duration-500 hover:scale-[1.01] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <DigitalCard card={DEMO_CARD} />
              </div>
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

        {/* Canales y Redes Sociales Oficiales de INDI (Persistidos en Turso LibSQL) */}
        <div
          className="flex flex-wrap items-center justify-center gap-2.5 p-1.5 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-md shadow-inner shadow-black/40"
          aria-label="Redes Sociales y Canales Oficiales"
        >
          {brandSocials.instagramUrl && (
            <a
              href={brandSocials.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.03] hover:bg-pink-500/15 text-zinc-400 hover:text-pink-300 border border-white/5 hover:border-pink-500/30 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
              title="Instagram Oficial de INDI (@soyindi.cl)"
              aria-label="Instagram Oficial de INDI"
            >
              <InstagramIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="sr-only">Instagram</span>
            </a>
          )}
          {brandSocials.linkedinUrl && (
            <a
              href={brandSocials.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.03] hover:bg-blue-500/15 text-zinc-400 hover:text-blue-300 border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              title="LinkedIn Oficial de INDI (/in/soyindi-cl)"
              aria-label="LinkedIn Oficial de INDI"
            >
              <LinkedInIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="sr-only">LinkedIn</span>
            </a>
          )}
          {brandSocials.tiktokUrl && (
            <a
              href={brandSocials.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.03] hover:bg-cyan-500/15 text-zinc-400 hover:text-cyan-300 border border-white/5 hover:border-cyan-400/30 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              title="TikTok Oficial de INDI (@soyindi.cl)"
              aria-label="TikTok Oficial de INDI"
            >
              <TikTokIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="sr-only">TikTok</span>
            </a>
          )}
          {brandSocials.xUrl && (
            <a
              href={brandSocials.xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.03] hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
              title="X / Twitter Oficial de INDI"
              aria-label="X Oficial de INDI"
            >
              <XTwitterIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="sr-only">X</span>
            </a>
          )}
          {brandSocials.whatsappUrl && (
            <a
              href={brandSocials.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px] shadow-sm shadow-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              title="WhatsApp de Soporte Directo INDI (+56 9 8535 0038)"
              aria-label="WhatsApp de Soporte Directo INDI"
            >
              <WhatsAppIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="sr-only">WhatsApp</span>
            </a>
          )}
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
