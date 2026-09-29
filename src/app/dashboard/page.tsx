import React from 'react';
import { getUserCardsAction } from '@/features/card-builder/dashboard-actions';
import { getUserSmartCvsAction } from '@/features/ai-smart-cv/actions';
import { getUserPresentationsAction } from '@/features/orbital-presentations/actions';
import { checkUserEntitlementAction } from '@/features/pricing/actions';
import { TrialBanner } from '@/features/pricing/components/TrialBanner';
import { UnifiedDashboardView } from '@/features/dashboard/components/UnifiedDashboardView';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<{
    tab?: 'cards' | 'cvs' | 'presentations';
    created?: string;
    slug?: string;
  }>;
}

export default async function UnifiedDashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const initialTab = params.tab || 'cards';
  const justCreatedSlug = params.created === 'true' ? params.slug : null;

  // Carga paralela de entidades y estado de membresía desde Turso SQLite
  const [cardsResult, cvsResult, presentationsResult, entitlement] = await Promise.all([
    getUserCardsAction(),
    getUserSmartCvsAction(),
    getUserPresentationsAction(),
    checkUserEntitlementAction(),
  ]);

  const cards = cardsResult.data || [];
  const cvs = (cvsResult.data || []) as any[];
  const presentations = (presentationsResult.data || []) as any[];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-zinc-950">
      {/* Banner de estado de membresía / trial 15 días */}
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
          initialTab={initialTab}
          justCreatedSlug={justCreatedSlug}
        />
      </main>
    </div>
  );
}
