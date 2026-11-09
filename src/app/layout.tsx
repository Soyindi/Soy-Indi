import type { Metadata, Viewport } from 'next';
import './globals.css';
import { APP_CACHE_VERSION, CACHE_STORAGE_VERSION_KEY } from '@/shared/lib/cacheGovernance';
import { CookieConsentBanner } from '@/shared/ui/CookieConsentBanner';

export const viewport: Viewport = {
  themeColor: '#080A12',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://soyindi.cl'),
  title: 'Tarjetas Digitales en Chile con Google Wallet y QR | INDI',
  description: 'Crea tu tarjeta digital de presentación en Chile. Compatible con Google Wallet para acceso instantáneo en tu celular, código QR y Smart CV ATS.',
  alternates: {
    canonical: 'https://soyindi.cl',
  },
  openGraph: {
    title: 'Tarjetas Digitales en Chile con Google Wallet y QR | INDI',
    description: 'Crea tu tarjeta digital de presentación en Chile. Compatible con Google Wallet para acceso instantáneo en tu celular, código QR y Smart CV ATS.',
    url: 'https://soyindi.cl',
    siteName: 'INDI',
    images: [
      {
        url: 'https://soyindi.cl/brand/indi-tech-lockup.webp',
        width: 1376,
        height: 768,
        alt: 'INDI — Tarjetas Digitales de Presentación en Chile con Google Wallet',
      },
    ],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarjetas Digitales en Chile con Google Wallet y QR | INDI',
    description: 'Crea tu tarjeta digital de presentación en Chile. Compatible con Google Wallet para acceso instantáneo en tu celular.',
    images: ['https://soyindi.cl/brand/indi-tech-lockup.webp'],
  },
  icons: {
    icon: [
      { url: `/icon.svg?v=${APP_CACHE_VERSION}`, sizes: 'any', type: 'image/svg+xml' },
      { url: `/brand/indi-alien-symbol-sm.webp?v=${APP_CACHE_VERSION}`, sizes: '128x128', type: 'image/webp' },
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
      <head>
        {/* Micro-Guard de Limpieza Móvil: Desregistra Service Workers y purga CacheStorage de cualquier versión PWA previa */}
        <script
          id="indi-cache-guard"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(regs){for(var i=0;i<regs.length;i++)regs[i].unregister()});}var v="${APP_CACHE_VERSION}";if(localStorage.getItem("${CACHE_STORAGE_VERSION_KEY}")!==v){if('caches' in window){caches.keys().then(function(k){k.forEach(function(n){caches.delete(n)})});}localStorage.setItem("${CACHE_STORAGE_VERSION_KEY}",v);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
