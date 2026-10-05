import { SmartCvBuilder } from '@/features/ai-smart-cv/components/SmartCvBuilder';
import { getSmartCvByIdAction } from '@/features/ai-smart-cv/actions';
import { checkUserEntitlementAction } from '@/features/pricing/actions';
import { TrialBanner } from '@/features/pricing/components/TrialBanner';

export const dynamic = 'force-dynamic';

interface SmartCvPageProps {
  searchParams?: Promise<{ id?: string }>;
}

export default async function SmartCvPage({ searchParams }: SmartCvPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const cvId = resolvedParams.id;

  // Carga paralela de permisos de suscripción y datos del CV persistido (si existe)
  const [entitlement, cvResult] = await Promise.all([
    checkUserEntitlementAction(),
    cvId ? getSmartCvByIdAction(cvId) : Promise.resolve(null),
  ]);

  const initialData = cvResult?.success && cvResult.data ? cvResult.data : undefined;
  const initialCvId = cvResult?.success && cvResult.id ? cvResult.id : undefined;
  const initialScore = cvResult?.success && typeof cvResult.atsScore === 'number' ? cvResult.atsScore : undefined;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Banner de estado de membresía / trial 3 días */}
      <TrialBanner entitlement={entitlement} />

      {/* Luces volumétricas de fondo */}
      <div className="absolute top-[-10%] left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      <div className="flex-1 py-10">
        <SmartCvBuilder
          initialData={initialData}
          initialCvId={initialCvId}
          initialScore={initialScore}
        />
      </div>
    </div>
  );
}
