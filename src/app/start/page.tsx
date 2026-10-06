import React from 'react';
import Link from 'next/link';
import { checkUserEntitlementAction } from '@/features/pricing/actions';
import { OnboardingChoiceGrid } from '@/features/onboarding/components/OnboardingChoiceGrid';
import { SmartParticles } from '@/features/visual-effects/SmartParticles';
import { BrandLogo } from '@/shared/ui/BrandLogo';

export const dynamic = 'force-dynamic';

interface OnboardingStartPageProps {
  searchParams?: Promise<{ ref?: string }>;
}

export default async function OnboardingStartPage({ searchParams }: OnboardingStartPageProps) {
  const params = searchParams ? await searchParams : {};
  const refCode = params.ref;
  const entitlement = await checkUserEntitlementAction();

  // Si viene un código de referido y hay sesión, atribuir
  if (refCode) {
    try {
      const { headers } = await import('next/headers');
      const { auth } = await import('@/shared/lib/auth');
      const headerList = await headers();
      const session = await auth.api.getSession({ headers: headerList });
      if (session?.user?.id) {
        const { attributeReferralAction } = await import('@/features/affiliates/actions');
        await attributeReferralAction(session.user.id, refCode);
      }
    } catch (err) {
      // Atribución silenciosa
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-950 flex flex-col justify-between py-12">
      {/* Luces volumétricas */}
      <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />

      {/* Barra de Marca Minimalista con Retícula Base 8 */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 mb-8 flex items-center justify-between">
        <Link href="/" title="Ir a la portada de INDI" className="flex items-center gap-2 group">
          <BrandLogo size="md" showText={false} />
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/pricing"
            className="text-xs text-zinc-400 hover:text-white font-medium transition min-h-[44px] px-3.5 py-2 rounded-xl hover:bg-white/5 flex items-center"
          >
            Planes y Membresía
          </Link>

          <Link
            href="/dashboard"
            className="text-xs text-zinc-200 hover:text-white font-semibold transition min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <span>Ir a Mi Panel</span>
          </Link>
        </div>
      </header>

      {/* Contenido Principal con el Grid */}
      <main className="relative z-10 flex-1 flex items-center">
        <OnboardingChoiceGrid
          daysRemaining={entitlement.daysRemaining}
        />
      </main>

      {/* Pie de página sutil */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-12 text-center text-xs text-zinc-600 font-mono">
        INDI Platform • Arquitectura Serverless Turso + Cloudflare Edge • 2026
      </footer>
    </div>
  );
}
