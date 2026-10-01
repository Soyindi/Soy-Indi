import { PresentationStudio } from '@/features/orbital-presentations/components/PresentationStudio';
import { checkUserEntitlementAction } from '@/features/pricing/actions';
import { TrialBanner } from '@/features/pricing/components/TrialBanner';
import { db } from '@/shared/api/db';
import { presentations } from '@/entities/schema';
import { eq } from 'drizzle-orm';
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

  if (params.slug || params.id) {
    try {
      const found = await db.query.presentations.findFirst({
        where: params.id
          ? eq(presentations.id, params.id)
          : eq(presentations.slug, params.slug!),
      });

      if (found) {
        initialPresentation = {
          title: found.title,
          slug: found.slug || '',
          isPublic: found.isPublic,
          slidesData: found.slidesData as any,
          themeSettings: found.themeSettings as any,
        };
        initialPresentationId = found.id;
      }
    } catch (err) {
      console.error('Error cargando presentación inicial para el estudio:', err);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Banner de estado de membresía / trial 15 días */}
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
