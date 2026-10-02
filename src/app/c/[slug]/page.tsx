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
        url: 'https://indi.bio/c/demo',
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

  const ogImageUrl = `https://indi.bio/api/og?title=${encodeURIComponent(card.title)}&role=${encodeURIComponent(card.profession)}&about=${encodeURIComponent(card.about || '')}&photo=${encodeURIComponent(card.photoUrl || '')}`;

  return {
    title: `${card.title} — ${card.profession} | INDI`,
    description: card.about || `Conecta directamente con ${card.title} en un solo clic por WhatsApp o redes.`,
    alternates: {
      canonical: `https://indi.bio/c/${card.slug}`,
    },
    openGraph: {
      title: `${card.title} — ${card.profession}`,
      description: card.about || `Conecta directamente con ${card.title} en un solo clic por WhatsApp o redes.`,
      url: `https://indi.bio/c/${card.slug}`,
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
              title: 'Matías Riquelme',
              profession: 'Ingeniero de Software & Fundador',
              about: 'Especialista en arquitecturas web distribuidas, Edge computing y sistemas de alta concurrencia.',
              whatsapp: '+56912345678',
              emailContact: 'contacto@matiasriquelme.dev',
              websiteUrl: 'https://matiasriquelme.dev',
              linkedinUrl: 'https://linkedin.com',
              instagramUrl: 'https://instagram.com',
              photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              address: 'Av. Providencia 1208, Providencia, Santiago, Chile',
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
    );
  }

  const card = await db.query.cards.findFirst({
    where: eq(cards.slug, slug),
  });

  if (!card) notFound();

  // Incrementar métricas de visitas reales y registrar evento atómico de telemetría
  try {
    const { cardEvents } = await import('@/entities/schema');
    await Promise.all([
      db
        .update(cards)
        .set({ viewsCount: sql`${cards.viewsCount} + 1` })
        .where(eq(cards.id, card.id)),
      db.insert(cardEvents).values({
        cardId: card.id,
        eventType: 'view',
        source: 'direct',
        device: 'mobile',
      }),
    ]);
  } catch (err) {
    console.error('Error actualizando contador de visitas:', err);
  }

  return (
    <div className="relative min-h-screen pb-16 flex flex-col justify-between overflow-hidden">
      {/* Cabecera contextual ergonómica */}
      <PublicContextualHeader ownerMode={false} />

      {/* Luces volumétricas de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

      <div className="my-auto px-4">
        <DigitalCard card={card} />
      </div>
    </div>
  );
}
