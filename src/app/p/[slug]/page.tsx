import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/shared/api/db';
import { presentations } from '@/entities/schema';
import { eq, sql } from 'drizzle-orm';
import { PublicPresentationViewer } from '@/features/orbital-presentations/components/PublicPresentationViewer';
import { PresentationSlide, PresentationTheme } from '@/entities/presentation/schemas';

import { PRESENTATION_TEMPLATES } from '@/entities/presentation/templates';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Prioridad Absoluta: Buscar en la base de datos Turso SQLite la presentación personalizada del usuario
  const presentation = await db.query.presentations.findFirst({
    where: eq(presentations.slug, slug),
  });

  if (presentation) {
    const ogImageUrl = `https://soyindi.cl/api/og?type=presentation&title=${encodeURIComponent(presentation.title)}&role=${encodeURIComponent('Presentación Orbital 16:9')}&about=${encodeURIComponent('Visualiza la propuesta comercial cinematográfica en INDI.')}&verified=1`;

    return {
      title: `${presentation.title} — Presentación Orbital | INDI`,
      description: `Visualiza la presentación interactiva 16:9 "${presentation.title}" en INDI Orbital Studio.`,
      alternates: {
        canonical: `https://soyindi.cl/p/${presentation.slug}`,
      },
      openGraph: {
        title: presentation.title,
        description: `Presentación cinematográfica 16:9 en INDI Orbital Studio.`,
        url: `https://soyindi.cl/p/${presentation.slug}`,
        siteName: 'INDI Orbital Studio',
        type: 'article',
        images: [
          {
            url: ogImageUrl,
            secureUrl: ogImageUrl,
            width: 1200,
            height: 630,
            alt: presentation.title,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: presentation.title,
        description: `Presentación cinematográfica 16:9 en INDI Orbital Studio.`,
        images: [ogImageUrl],
      },
    };
  }

  // 2. Mock demo interactivo
  if (slug === 'demo') {
    const ogImageUrl = `https://soyindi.cl/api/og?type=presentation&title=${encodeURIComponent('Presentación Demo Orbital')}&role=${encodeURIComponent('Estudio Cinemático 16:9')}&about=${encodeURIComponent('Diapositivas 16:9 con iluminación volumétrica y diseño cinematográfico.')}&verified=1`;

    return {
      title: 'Presentación Demo Orbital • 16:9 | INDI',
      description: 'Estudio de presentaciones cinematográficas interactivas generadas con IA.',
      alternates: {
        canonical: 'https://soyindi.cl/p/demo',
      },
      openGraph: {
        title: 'Presentación Demo Orbital | INDI',
        description: 'Diapositivas 16:9 con iluminación volumétrica y diseño cinemático.',
        url: 'https://soyindi.cl/p/demo',
        siteName: 'INDI Orbital Studio',
        type: 'article',
        images: [
          {
            url: ogImageUrl,
            secureUrl: ogImageUrl,
            width: 1200,
            height: 630,
            alt: 'Presentación Demo Orbital',
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Presentación Demo Orbital | INDI',
        description: 'Diapositivas 16:9 con iluminación volumétrica y diseño cinemático.',
        images: [ogImageUrl],
      },
    };
  }

  // 3. Fallback de plantilla curada (únicamente si no existe una versión guardada por el usuario en BD)
  const templateMatch = PRESENTATION_TEMPLATES.find((t) => t.data.slug === slug || t.id === slug);
  if (templateMatch) {
    return {
      title: `${templateMatch.name} — Presentación Orbital | INDI`,
      description: templateMatch.description,
      alternates: {
        canonical: `https://soyindi.cl/p/${slug}`,
      },
      openGraph: {
        title: templateMatch.name,
        description: templateMatch.description,
        url: `https://soyindi.cl/p/${slug}`,
        siteName: 'INDI Orbital Studio',
        type: 'article',
      },
    };
  }

  return { title: 'Presentación en Vivo | INDI Orbital Studio' };
}

export default async function PublicPresentationPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Prioridad Absoluta: Buscar en la base de datos Turso SQLite la presentación personalizada
  const presentation = await db.query.presentations.findFirst({
    where: eq(presentations.slug, slug),
  });

  if (presentation) {
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

  // 2. Mock demo interactivo
  if (slug === 'demo') {
    const demoSlides: PresentationSlide[] = [
      {
        id: '1',
        title: 'INDI: El Nuevo Estándar de Identidad Digital',
        subtitle: 'Networking de Alto Impacto, Smart CVs y Presentaciones Cinemáticas',
        visualType: 'concept',
        layout: 'standard',
        badgeText: 'VISIÓN 2026',
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
        layout: 'kpi-cards',
        badgeText: 'TELEMETRÍA EN VIVO',
        keyPoints: [
          '3.4x más interacciones por contacto vía WhatsApp directo.',
          'Score de 95+ garantizado en Google Lighthouse.',
          'Cero costos de infraestructura base bajo arquitectura LibSQL Serverless.',
        ],
        metricsData: [
          { label: 'Conversión a WhatsApp', value: '42.8%', change: '+340%', trend: 'up' },
          { label: 'Score Lighthouse', value: '98/100', change: 'Top 1%', trend: 'up' },
          { label: 'Latencia Edge', value: '<20ms', change: '-85%', trend: 'up' },
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
      fontFamily: 'sans',
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

  // 3. Fallback de plantilla curada (únicamente como demostración de ejemplo si no existe en BD)
  const templateMatch = PRESENTATION_TEMPLATES.find((t) => t.data.slug === slug || t.id === slug);
  if (templateMatch) {
    return (
      <PublicPresentationViewer
        title={templateMatch.name}
        slides={templateMatch.data.slidesData}
        theme={templateMatch.data.themeSettings}
        slug={templateMatch.data.slug}
      />
    );
  }

  // 4. Si no existe ni en DB ni en plantillas, vista de borrador en vivo
  const draftSlides: PresentationSlide[] = [
    {
      id: 'draft-1',
      title: 'Presentación en Preparación',
      subtitle: `El slug "${slug}" aún no ha sido publicado o sincronizado con la nube.`,
      visualType: 'concept',
      layout: 'standard',
      badgeText: 'ESTUDIO EN VIVO',
      keyPoints: [
        'Guarda tu presentación en el Editor de INDI para habilitar este enlace público permanente.',
        'Puedes usar el botón "Presentar en Vivo" directamente dentro del editor sin esperas.',
        'Arquitectura Edge Serverless con latencia sub-milisegundo.',
      ],
    },
  ];

  const draftTheme: PresentationTheme = {
    id: 'orbital-cyber',
    name: 'Cyber Draft',
    primaryColor: '#6366f1',
    accentColor: '#06b6d4',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 70%)',
    enableParticles: true,
    fontFamily: 'sans',
  };

  return (
    <PublicPresentationViewer
      title="Borrador Orbital • INDI"
      slides={draftSlides}
      theme={draftTheme}
      slug={slug}
    />
  );
}
