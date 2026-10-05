import React from 'react';
import { AuthModal } from '@/features/dashboard/components/AuthModal';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/shared/ui/BrandLogo';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | INDI 2026',
  description: 'Inicia sesión o crea tu cuenta en INDI para gestionar tus tarjetas digitales, CVs y presentaciones con IA.',
};

import { AuthRedirectParamsSchema } from '@/entities/auth/schemas';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/shared/lib/auth';

interface LoginPageProps {
  searchParams: Promise<{
    mode?: string;
    callbackUrl?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const rawParams = await searchParams;
  const parsed = AuthRedirectParamsSchema.safeParse(rawParams);
  const { mode, callbackUrl } = parsed.success
    ? parsed.data
    : { mode: 'login' as const, callbackUrl: '/dashboard' };

  // Guardrail de Experiencia de Usuario: Si el usuario ya cuenta con sesión activa en Better-Auth,
  // evitar mostrar nuevamente el formulario y redirigir al destino contextual seguro (callbackUrl o /dashboard).
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });
  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-950 flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Luces volumétricas de fondo */}
      <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />

      {/* Header minimalista */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors min-h-[44px] px-3 py-2 rounded-xl hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>

        <Link href="/" title="Ir a la portada">
          <BrandLogo size="md" showText={false} />
        </Link>
      </header>

      {/* Contenedor del Modal embebido en página */}
      <main className="relative z-10 flex-1 flex items-center justify-center">
        <AuthModal
          isOpen={true}
          defaultMode={mode}
          callbackUrl={callbackUrl}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto text-center text-xs text-zinc-600 font-mono mt-8">
        INDI Platform • Arquitectura Multi-Tenant con Google OAuth y Better-Auth • 2026
      </footer>
    </div>
  );
}
