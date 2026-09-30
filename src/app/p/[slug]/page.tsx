import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/shared/api/db';
import { presentations } from '@/entities/schema';
import { eq, sql } from 'drizzle-orm';
import { PublicPresentationViewer } from '@/features/orbital-presentations/components/PublicPresentationViewer';
import { PresentationSlide, PresentationTheme } from '@/entities/presentation/schemas';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === 'demo') {
    return {
      title: 'Presentación Demo Orbital • 16:9 | INDI',
      description: 'Estudio de presentaciones cinematográficas interactivas generadas con IA.',
      openGraph: {
        title: 'Presentación Demo Orbital | INDI',
        description: 'Diapositivas 16:9 con iluminación volumétrica y diseño cinemático.',
        url: 'https://indi.bio/p/demo',
        siteName: 'INDI Orbital Studio',
        type: 'article',
      },
    };
  }

  const presentation = await db.query.presentations.findFirst({
    where: eq(presentations.slug, slug),
  });

  if (!presentation) {
    return { title: 'Presentación No Encontrada | INDI' };
  }

  return {
    title: `${presentation.title} — Presentación Orbital | INDI`,
    description: `Visualiza la presentación interactiva 16:9 "${presentation.title}" en INDI Orbital Studio.`,
    openGraph: {
      title: presentation.title,
      description: `Presentación cinematográfica 16:9 en INDI Orbital Studio.`,
      url: `https://indi.bio/p/${presentation.slug}`,
      siteName: 'INDI Orbital Studio',
      type: 'article',
    },
  };
}

export default async function PublicPresentationPage({ params }: PageProps) {
  const { slug } = await params;

  // Mock demo interactivo
  if (slug === 'demo') {
    const demoSlides: PresentationSlide[] = [
      {
        id: '1',
        title: 'INDI: El Nuevo Estándar de Identidad Digital',
        subtitle: 'Networking de Alto Impacto, Smart CVs y Presentaciones Cinemáticas',
        visualType: 'concept',
        keyPoints: [
          '88% de las tarjetas de papel se desechan en menos de una semana.',
          'Enlace vivo de alta conversión con QR y botón de WhatsApp.',
          'Métricas en tiempo real y arquitectura de latencia sub-milisegundo.',
        ],
      },
      {
        id: '2',
        title: 'Métricas de Conversión y Rendimiento',
        subtitle: 'Resultados comparativos frente a soluciones tradicionales',
        visualType: 'metrics',
        keyPoints: [
          '3.4x más interacciones por contacto vía WhatsApp directo.',
          'Score de 95+ garantizado en Google Lighthouse.',
          'Cero costos de infraestructura base bajo arquitectura LibSQL Serverless.',
        ],
      },
    ];

    const demoTheme: PresentationTheme = {
      id: 'orbital-dark',
      name: 'Orbital Cyber',
      primaryColor: '#6366f1',
      accentColor: '#22d3ee',
      backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 70%)',
      enableParticles: true,
    };

    return (
      <PublicPresentationViewer
        title="INDI: El Nuevo Estándar de Identidad Digital"
        slides={demoSlides}
        theme={demoTheme}
        slug="demo"
      />
    );
  }

  const presentation = await db.query.presentations.findFirst({
    where: eq(presentations.slug, slug),
  });

  if (!presentation) {
    notFound();
  }

  // Incrementar métricas de visitas reales
  try {
    await db
      .update(presentations)
      .set({ viewsCount: sql`${presentations.viewsCount} + 1` })
      .where(eq(presentations.id, presentation.id));
  } catch (err) {
    console.error('Error actualizando contador de visitas de presentación:', err);
  }

  const slides = (presentation.slidesData as PresentationSlide[]) || [];
  const theme = (presentation.themeSettings as PresentationTheme) || {
    id: 'orbital-dark',
    name: 'Orbital Cyber',
    primaryColor: '#6366f1',
    accentColor: '#22d3ee',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 70%)',
    enableParticles: true,
  };

  return (
    <PublicPresentationViewer
      title={presentation.title}
      slides={slides}
      theme={theme}
      slug={presentation.slug || ''}
    />
  );
}
