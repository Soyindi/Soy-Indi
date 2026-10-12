import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/shared/api/db';
import { cards } from '@/entities/schema';
import { eq, sql } from 'drizzle-orm';
import { DigitalCard } from '@/entities/card/components/DigitalCard';
import { PublicContextualHeader } from '@/shared/ui/PublicContextualHeader';
import { JsonLd } from '@/shared/ui/JsonLd';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Si es slug demo, retornamos metadatos de presentación
  if (slug === 'demo') {
    const ogImageUrl = `https://soyindi.cl/api/og?type=card&title=${encodeURIComponent('Matías Riquelme')}&role=${encodeURIComponent('Ingeniero de Software & Arquitecto Cloud')}&about=${encodeURIComponent('Especialista en arquitecturas web distribuidas, Edge computing y sistemas de alta concurrencia.')}&verified=1`;

    return {
      title: 'Matías Riquelme — Ingeniero de Software & Arquitecto Cloud | INDI',
      description: 'Conecta directamente con Matías Riquelme en un solo clic por WhatsApp o redes.',
      openGraph: {
        title: 'Matías Riquelme — Ingeniero de Software',
        description: 'Tarjeta de identidad interactiva y networking profesional.',
        url: 'https://soyindi.cl/c/demo',
        siteName: 'INDI Digital Identity',
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'Matías Riquelme' }],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Matías Riquelme — Ingeniero de Software',
        description: 'Tarjeta de identidad interactiva y networking profesional.',
        images: [ogImageUrl],
      },
    };
  }

  const card = await db.query.cards.findFirst({
    where: eq(cards.slug, slug),
  });

  if (!card) {
    return { title: 'Tarjeta No Encontrada | INDI' };
  }

  const ogImageUrl = `https://soyindi.cl/api/og?type=card&title=${encodeURIComponent(card.title)}&role=${encodeURIComponent(card.profession)}&about=${encodeURIComponent(card.about || '')}&photo=${encodeURIComponent(card.photoUrl || '')}&verified=1`;

  return {
    title: `${card.title} — ${card.profession} | INDI`,
    description: card.about || `Conecta directamente con ${card.title} en un solo clic por WhatsApp o redes.`,
    alternates: {
      canonical: `https://soyindi.cl/c/${card.slug}`,
    },
    openGraph: {
      title: `${card.title} — ${card.profession}`,
      description: card.about || `Conecta directamente con ${card.title} en un solo clic por WhatsApp o redes.`,
      url: `https://soyindi.cl/c/${card.slug}`,
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
          <DigitalCard
            card={{
              slug: 'demo',
              title: 'Valentina Silva',
              profession: 'Directora de Growth & Producto',
              about: 'Lidero estrategias de crecimiento y producto digital en LatAm. Conectemos para impulsar tu próximo proyecto.',
              whatsapp: '+56987654321',
              emailContact: 'valentina@indi.cl',
              websiteUrl: 'https://soyindi.cl',
              linkedinUrl: 'https://linkedin.com/in/valentina-silva',
              instagramUrl: 'https://instagram.com/valentina.growth',
              photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
              address: 'Av. Andrés Bello 2457, Piso 18, Las Condes, Santiago',
              themeConfig: {
                themeId: 'solar-sunset',
                primaryColorOklch: '#ea580c',
                backgroundColorOklch: '#fafaf9',
                particleBehavior: 'interactive',
                particleIntensity: 'prominent',
                cardFinish: 'luminous-glass',
                surfaceTexture: 'frosted-prism',
                coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
                badgeText: '🚀 Growth & Producto',
                operationalStatus: 'open_now',
              },
              bentoBlocks: [
                {
                  id: 'metric-1',
                  type: 'metric',
                  title: 'Tasa de Conversión Web',
                  subtitle: 'Optimización de funnels B2B & SaaS',
                  metricValue: '+42%',
                  metricDelta: '↑ récord trimestral',
                },
                {
                  id: 'project-1',
                  type: 'featured_project',
                  title: 'Portafolio de Casos de Éxito',
                  subtitle: 'Auditorías de producto y UX estratégica',
                  url: 'https://soyindi.cl',
                },
              ],
            }}
          />
        </div>
      </div>
    );
  }

  const card = await db.query.cards.findFirst({
    where: eq(cards.slug, slug),
  });

  if (!card) notFound();

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
      url: `https://soyindi.cl/c/${card.slug}`,
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
        <DigitalCard card={card} />
      </div>
    </div>
  );
}
