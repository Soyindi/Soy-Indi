import { PresentationStudio } from '@/features/orbital-presentations/components/PresentationStudio';
import { getPresentationByIdAction } from '@/features/orbital-presentations/actions';
import { checkUserEntitlementAction } from '@/features/pricing/actions';
import { TrialBanner } from '@/features/pricing/components/TrialBanner';
import { PresentationFormValues } from '@/entities/presentation/schemas';

export const dynamic = 'force-dynamic';

interface PresentationsPageProps {
  searchParams: Promise<{
    slug?: string;
    id?: string;
  }>;
}

export default async function PresentationsPage({ searchParams }: PresentationsPageProps) {
  const [entitlement, params] = await Promise.all([
    checkUserEntitlementAction(),
    searchParams,
  ]);

  let initialPresentation: PresentationFormValues | undefined;
  let initialPresentationId: string | undefined;

  const targetLookup = params.id || params.slug;
  if (targetLookup) {
    try {
      const presResult = await getPresentationByIdAction(targetLookup);
      if (presResult.success && presResult.data) {
        initialPresentation = presResult.data;
        initialPresentationId = presResult.id;
      }
    } catch (err) {
      console.error('Error cargando presentación inicial para el estudio:', err);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Banner de estado de membresía / trial 3 días */}
      <TrialBanner entitlement={entitlement} />

      {/* Luces volumétricas de fondo */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      <div className="flex-1 py-10">
        <PresentationStudio
          initialData={initialPresentation}
          initialPresentationId={initialPresentationId}
        />
      </div>
    </div>
  );
}
