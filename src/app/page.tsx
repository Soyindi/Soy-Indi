import Link from 'next/link';
import { ArrowRight, Check, FileText, Presentation, QrCode, type LucideIcon } from 'lucide-react';
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
        name: 'Planes y Precios',
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
          text: 'Al crear tu cuenta en INDI accedes de por vida al Plan Comunitario Gratuito, sin costo y sin pedirte tarjeta de crédito. Puedes crear 1 Tarjeta Digital con código QR interactivo y 1 Smart CV en PDF adaptado a filtros ATS, revisar tus métricas de visitas y compartir tu perfil con tus clientes o reclutadores desde el primer minuto.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta el servicio y qué incluyen los planes Pro y Max?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El Plan Starter es 100% gratuito para la comunidad. Para profesionales con alto volumen que requieran múltiples tarjetas, analíticas avanzadas y plantillas exclusivas, los planes Pro ($4.990 CLP al mes o $15.000 semestral) y Max ($8.990 CLP al mes o $29.990 semestral) se encuentran actualmente en lista de espera con acceso anticipado.',
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
        name: '¿Cómo funciona el programa de recomendación y afiliados?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Todos los miembros de INDI cuentan con un enlace y código QR de afiliado exclusivo. Por cada 3 colegas desbloqueas capacidades adicionales y recibes el 25% de comisión en los planes avanzados transferido a tu banco o CuentaRUT.',
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
  { href: '/dashboard?tab=affiliates', label: 'Afiliados (25% CLP)' },
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
        <section className="relative isolate min-h-[calc(100svh-72px)] flex items-center justify-center px-6 py-16 overflow-hidden">
          <BrandHeroBackdrop />
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
            <HeroBrandIdentity />
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

        {/* 3 · HERRAMIENTAS ACTIVAS */}
        <section id="soluciones" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400 mb-2 block">
                Herramientas Comunitarias 2026
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
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
                  className={`group glass-panel rounded-3xl p-6 flex items-start gap-4 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                    isRoadmap
                      ? 'border-white/5 opacity-80 hover:opacity-100 hover:border-cyan-500/30'
                      : 'hover:border-indigo-400/40'
                  }`}
                >
                  <Icon className={`w-6 h-6 shrink-0 mt-1 ${isRoadmap ? 'text-zinc-400 group-hover:text-cyan-300' : 'text-cyan-300'}`} aria-hidden="true" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{product.title}</h3>
                      {isRoadmap && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
                          Próximamente
                        </span>
                      )}
                    </div>
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
