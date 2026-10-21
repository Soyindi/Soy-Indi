import React from 'react';
import Link from 'next/link';
import { checkUserEntitlementAction } from '@/features/pricing/actions';
import { OnboardingChoiceGrid } from '@/features/onboarding/components/OnboardingChoiceGrid';
import { BrandLogo } from '@/shared/ui/BrandLogo';

export const dynamic = 'force-dynamic';

interface OnboardingStartPageProps {
  searchParams?: Promise<{ ref?: string }>;
}

export default async function OnboardingStartPage({ searchParams }: OnboardingStartPageProps) {
  const params = searchParams ? await searchParams : {};
  const { cookies, headers } = await import('next/headers');
  const cookieStore = await cookies();
  const { REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_MAX_AGE, sanitizeReferralCode } = await import(
    '@/entities/affiliate/referral-cookie'
  );

  // 1. Obtener código desde searchParams o cookie persistente
  const rawParamRef = params.ref;
  const rawCookieRef = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
  const activeRefCode = sanitizeReferralCode(rawParamRef) || sanitizeReferralCode(rawCookieRef);

  // 2. Resolver sesión y derecho de acceso del usuario
  let session = null;
  try {
    const { auth } = await import('@/shared/lib/auth');
    const headerList = await headers();
    session = await auth.api.getSession({ headers: headerList });
  } catch {
    // Silencioso
  }

  const entitlement = await checkUserEntitlementAction(session?.user?.id);

  // 3. Si hay sesión activa y código válido, atribuir idempotentemente
  if (activeRefCode && session?.user?.id) {
    try {
      const { attributeReferralAction } = await import('@/features/affiliates/actions');
      await attributeReferralAction(session.user.id, activeRefCode);
    } catch (err) {
      // Atribución silenciosa
    }
  }

  // 4. Obtener información visual del referente si aplica
  let referralPartner = null;
  if (activeRefCode) {
    const { getReferralPartnerInfoAction } = await import('@/features/affiliates/actions');
    referralPartner = await getReferralPartnerInfoAction(activeRefCode);
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-950 flex flex-col justify-between py-6 sm:py-8">
      {/* Atmósfera viva SmartParticles y auras volumétricas OKLCH */}
      
      <div className="absolute top-[-15%] left-[25%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/20 via-sky-500/15 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-emerald-500/15 via-teal-500/10 to-transparent blur-[150px] pointer-events-none" />

      {/* Barra de Marca Minimalista con Retícula Base 8 */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 mb-4 sm:mb-6 flex items-center justify-between">
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
            className="text-xs text-zinc-200 hover:text-white font-semibold transition min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 flex items-center gap-1.5 shadow-sm active:scale-[0.98] backdrop-blur-md"
          >
            <span>Ir a Mi Panel</span>
          </Link>
        </div>
      </header>

      {/* Contenido Principal con el Grid */}
      <main className="relative z-10 flex-1 w-full flex items-center justify-center my-auto py-4 sm:py-8">
        <OnboardingChoiceGrid
          daysRemaining={entitlement.daysRemaining}
          referralPartner={referralPartner}
          entitlement={entitlement}
        />
      </main>

      {/* Pie de página sutil */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 mt-6 sm:mt-8 text-center text-xs text-zinc-600 font-mono tracking-tight">
        INDI Platform • Arquitectura Serverless Turso + Cloudflare Edge • 2026
      </footer>
    </div>
  );
}
