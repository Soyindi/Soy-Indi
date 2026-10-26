import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/shared/api/db';
import { cards } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { DigitalCard } from '@/entities/card/components/DigitalCard';
import { OFFICIAL_DEMO_CARD } from '@/entities/card/themes';
import { PublicContextualHeader } from '@/shared/ui/PublicContextualHeader';
import { JsonLd } from '@/shared/ui/JsonLd';
import { getAppBaseUrl, buildCanonicalUrl } from '@/entities/brand/domain';
import { ShieldAlert, Sparkles } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getAppBaseUrl();

  // Si es slug demo, retornamos metadatos de presentación sincronizados con OFFICIAL_DEMO_CARD
  if (slug === 'demo') {
    const ogImageUrl = `${baseUrl}/api/og?type=card&title=${encodeURIComponent(OFFICIAL_DEMO_CARD.title)}&role=${encodeURIComponent(OFFICIAL_DEMO_CARD.profession)}&about=${encodeURIComponent(OFFICIAL_DEMO_CARD.about)}&verified=1`;
    const demoCanonicalUrl = buildCanonicalUrl('/c/demo');

    return {
      title: `${OFFICIAL_DEMO_CARD.title} — ${OFFICIAL_DEMO_CARD.profession} | INDI`,
      description: `Conecta directamente con ${OFFICIAL_DEMO_CARD.title} en un solo clic por WhatsApp o redes.`,
      alternates: {
        canonical: demoCanonicalUrl,
      },
      openGraph: {
        title: `${OFFICIAL_DEMO_CARD.title} — ${OFFICIAL_DEMO_CARD.profession}`,
        description: OFFICIAL_DEMO_CARD.about || 'Tarjeta de identidad interactiva y networking profesional.',
        url: demoCanonicalUrl,
        siteName: 'INDI Digital Identity',
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: OFFICIAL_DEMO_CARD.title }],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${OFFICIAL_DEMO_CARD.title} — ${OFFICIAL_DEMO_CARD.profession}`,
        description: OFFICIAL_DEMO_CARD.about || 'Tarjeta de identidad interactiva y networking profesional.',
        images: [ogImageUrl],
      },
    };
  }

  const card = await db.query.cards.findFirst({
    where: eq(cards.slug, slug),
  });

  if (!card || !card.isActive) {
    return {
      title: 'Tarjeta No Disponible | INDI',
      robots: { index: false, follow: false },
    };
  }

  const canonicalCardUrl = buildCanonicalUrl(`/c/${card.slug}`);
  const ogImageUrl = `${baseUrl}/api/og?type=card&title=${encodeURIComponent(card.title)}&role=${encodeURIComponent(card.profession)}&about=${encodeURIComponent(card.about || '')}&photo=${encodeURIComponent(card.photoUrl || '')}&verified=1`;

  return {
    title: `${card.title} — ${card.profession} | INDI`,
    description: card.about || `Conecta directamente con ${card.title} en un solo clic por WhatsApp o redes.`,
    alternates: {
      canonical: canonicalCardUrl,
    },
    openGraph: {
      title: `${card.title} — ${card.profession}`,
      description: card.about || `Conecta directamente con ${card.title} en un solo clic por WhatsApp o redes.`,
      url: canonicalCardUrl,
      siteName: 'INDI Digital Identity',
      locale: 'es_LA',
      type: 'profile',
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${card.title} — ${card.profession}`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${card.title} | ${card.profession}`,
      description: card.about || `Tarjeta interactiva profesional.`,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicCardPage({ params }: PageProps) {
  const { slug } = await params;

  // Mock interactivo para visualización instantánea demo
  if (slug === 'demo') {
    return (
      <div className="relative min-h-dvh pb-16 flex flex-col justify-between overflow-x-hidden">
        {/* Cabecera contextual ergonómica */}
        <PublicContextualHeader ownerMode={false} />

        {/* Luces volumétricas de fondo */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

        <div className="my-auto px-4">
          <DigitalCard card={OFFICIAL_DEMO_CARD} />
        </div>
      </div>
    );
  }

  const card = await db.query.cards.findFirst({
    where: eq(cards.slug, slug),
  });

  if (!card) notFound();

  // Si el propietario pausó / desactivó temporalmente su tarjeta desde el Dashboard
  if (!card.isActive) {
    return (
      <div className="relative min-h-dvh flex flex-col justify-between overflow-x-hidden bg-zinc-950 text-white">
        <PublicContextualHeader ownerMode={false} />
        <div className="my-auto px-4 py-12 flex items-center justify-center">
          <div className="max-w-md w-full rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Tarjeta Temporalmente Pausada
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
              El titular de este perfil digital ha pausado temporalmente la visibilidad pública de su tarjeta.
            </p>
            <Link
              href="/login?mode=signup&callbackUrl=/cards/new"
              className="min-h-[48px] w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear mi Tarjeta Digital Gratis</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canonicalCardUrl = buildCanonicalUrl(`/c/${card.slug}`);

  // Datos estructurados Schema.org para indexación profunda de perfiles profesionales en Google
  const sameAsLinks = [
    card.websiteUrl,
    card.linkedinUrl,
    card.instagramUrl,
  ].filter((url): url is string => Boolean(url));

  const cardJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: card.createdAt ? new Date(card.createdAt).toISOString() : undefined,
    dateModified: card.updatedAt ? new Date(card.updatedAt).toISOString() : undefined,
    mainEntity: {
      '@type': 'Person',
      name: card.title,
      jobTitle: card.profession,
      description: card.about || undefined,
      image: card.photoUrl || undefined,
      url: canonicalCardUrl,
      sameAs: sameAsLinks.length > 0 ? sameAsLinks : undefined,
    },
  };

  return (
    <div className="relative min-h-dvh pb-16 flex flex-col justify-between overflow-x-hidden">
      <JsonLd data={cardJsonLd} />
      {/* Cabecera contextual ergonómica */}
      <PublicContextualHeader ownerMode={false} />

      {/* Luces volumétricas de fondo de gran escala con auras claras */}
      <div className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full bg-indigo-500/25 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-sky-400/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/20 blur-[140px] pointer-events-none" />

      <div className="my-auto px-4 sm:px-6 w-full max-w-lg mx-auto flex justify-center">
        <DigitalCard
          card={{
            ...card,
            bentoBlocks: card.themeConfig?.bentoBlocks ?? [],
          }}
        />
      </div>
    </div>
  );
}
