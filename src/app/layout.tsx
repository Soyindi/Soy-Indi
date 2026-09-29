import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INDI — Plataforma SaaS de Identidad Digital y Networking',
  description: 'Tarjetas digitales inteligentes, Smart CVs y presentaciones interactivas con rendimiento Edge ultra-rápido.',
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
