import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#080A12',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://soyindi.cl'),
  title: 'INDI — Plataforma SaaS de Identidad Digital y Networking',
  description: 'Tarjetas digitales inteligentes, Smart CVs y presentaciones interactivas con rendimiento Edge ultra-rápido.',
  alternates: {
    canonical: 'https://soyindi.cl',
  },
  openGraph: {
    title: 'INDI — Plataforma SaaS de Identidad Digital y Networking',
    description: 'Tarjetas digitales inteligentes, Smart CVs y presentaciones interactivas con rendimiento Edge ultra-rápido.',
    url: 'https://soyindi.cl',
    siteName: 'INDI',
    images: [
      {
        url: 'https://soyindi.cl/brand/indi-tech-lockup.webp',
        width: 1376,
        height: 768,
        alt: 'INDI — Identidad Digital & Networking Profesional',
      },
    ],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INDI — Plataforma SaaS de Identidad Digital y Networking',
    description: 'Tarjetas digitales inteligentes, Smart CVs y presentaciones interactivas.',
    images: ['https://soyindi.cl/brand/indi-tech-lockup.webp'],
  },
  icons: {
    icon: [
      { url: '/brand/indi-isotipo-transparent.svg?v=2026.2', type: 'image/svg+xml' },
      { url: '/brand/indi-alien-symbol-sm.webp?v=2026.2', sizes: '32x32', type: 'image/webp' },
    ],
    apple: [
      { url: '/brand/indi-isotipo-transparent.svg?v=2026.2', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
