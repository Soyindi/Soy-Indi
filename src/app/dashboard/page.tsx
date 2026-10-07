import React from 'react';
import { getUserCardsAction } from '@/features/card-builder/dashboard-actions';
import { getUserSmartCvsAction } from '@/features/ai-smart-cv/actions';
import { getUserPresentationsAction } from '@/features/orbital-presentations/actions';
import { checkUserEntitlementAction } from '@/features/pricing/actions';
import { TrialBanner } from '@/features/pricing/components/TrialBanner';
import { UnifiedDashboardView } from '@/features/dashboard/components/UnifiedDashboardView';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/shared/lib/auth';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<{
    tab?: 'cards' | 'cvs' | 'presentations';
    created?: string;
    slug?: string;
  }>;
}

export default async function UnifiedDashboardPage({ searchParams }: DashboardPageProps) {
  // Guardrail de autenticación: Si estamos en contexto de request y no hay sesión, redirigir a login
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const params = await searchParams;
  const initialTab = params.tab || 'cards';
  const justCreatedSlug = params.created === 'true' ? params.slug : null;

  // Atribución complementaria de referidos si el usuario recién llega por enlace o cookie
  const rawParamRef = (params as any)?.ref;
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const { REFERRAL_COOKIE_NAME, sanitizeReferralCode } = await import('@/entities/affiliate/referral-cookie');
    const rawCookieRef = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
    const activeRefCode = sanitizeReferralCode(rawParamRef) || sanitizeReferralCode(rawCookieRef);
    if (activeRefCode && session?.user?.id) {
      const { attributeReferralAction } = await import('@/features/affiliates/actions');
      await attributeReferralAction(session.user.id, activeRefCode);
    }
  } catch {
    // Silencioso
  }

  // Carga paralela de entidades y estado de membresía desde Turso SQLite
  const { getAffiliateOverviewAction } = await import('@/features/affiliates/actions');
  const [cardsResult, cvsResult, presentationsResult, entitlement, affiliateResult] = await Promise.all([
    getUserCardsAction(session.user.id),
    getUserSmartCvsAction(session.user.id),
    getUserPresentationsAction(session.user.id),
    checkUserEntitlementAction(session.user.id),
    getAffiliateOverviewAction(session.user.id),
  ]);

  const cards = cardsResult.data || [];
  const cvs = (cvsResult.data || []) as any[];
  const presentations = (presentationsResult.data || []) as any[];
  const affiliateOverview = affiliateResult.success && affiliateResult.data ? affiliateResult.data : null;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-zinc-950">
      {/* Banner de estado de membresía / trial 3 días */}
      <TrialBanner entitlement={entitlement} />

      {/* Luces volumétricas de fondo */}
      <div className="absolute top-[-10%] right-[10%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />

      {/* Vista unificada con pestañas */}
      <main className="flex-1 py-6 relative z-10">
        <UnifiedDashboardView
          initialCards={cards}
          initialCvs={cvs}
          initialPresentations={presentations}
          initialAffiliateOverview={affiliateOverview}
          initialTab={initialTab as any}
          justCreatedSlug={justCreatedSlug}
        />
      </main>
    </div>
  );
}
