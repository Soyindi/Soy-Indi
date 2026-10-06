import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/shared/api/db';
import { cards } from '@/entities/schema';
import { eq, sql } from 'drizzle-orm';
import { DigitalCard } from '@/entities/card/components/DigitalCard';
import { PublicContextualHeader } from '@/shared/ui/PublicContextualHeader';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Si es slug demo, retornamos metadatos de presentación
  if (slug === 'demo') {
    const ogImageUrl = `http://localhost:3000/api/og?title=${encodeURIComponent('Matías Riquelme')}&role=${encodeURIComponent('Ingeniero de Software & Arquitecto Cloud')}&about=${encodeURIComponent('Especialista en arquitecturas web distribuidas, Edge computing y sistemas de alta concurrencia.')}`;

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

  const ogImageUrl = `https://soyindi.cl/api/og?title=${encodeURIComponent(card.title)}&role=${encodeURIComponent(card.profession)}&about=${encodeURIComponent(card.about || '')}&photo=${encodeURIComponent(card.photoUrl || '')}`;

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
      <div className="relative min-h-screen pb-16 flex flex-col justify-between overflow-hidden">
        {/* Cabecera contextual ergonómica */}
        <PublicContextualHeader ownerMode={false} />

        {/* Luces volumétricas de fondo */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

        <div className="my-auto px-4">
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
    );
  }

  const card = await db.query.cards.findFirst({
    where: eq(cards.slug, slug),
  });

  if (!card) notFound();

  return (
    <div className="relative min-h-screen pb-16 flex flex-col justify-between overflow-hidden">
      {/* Cabecera contextual ergonómica */}
      <PublicContextualHeader ownerMode={false} />

      {/* Luces volumétricas de fondo de gran escala */}
      <div className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full bg-indigo-600/25 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[140px] pointer-events-none" />

      <div className="my-auto px-4 sm:px-6 w-full max-w-lg mx-auto flex justify-center">
        <DigitalCard card={card} />
      </div>
    </div>
  );
}
