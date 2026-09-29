import { PresentationStudio } from '@/features/orbital-presentations/components/PresentationStudio';
import { checkUserEntitlementAction } from '@/features/pricing/actions';
import { TrialBanner } from '@/features/pricing/components/TrialBanner';

export const dynamic = 'force-dynamic';

export default async function PresentationsPage() {
  const entitlement = await checkUserEntitlementAction();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Banner de estado de membresía / trial 15 días */}
      <TrialBanner entitlement={entitlement} />

      {/* Luces volumétricas de fondo */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      <div className="flex-1 py-10">
        <PresentationStudio />
      </div>
    </div>
  );
}
