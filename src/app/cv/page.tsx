import { SmartCvBuilder } from '@/features/ai-smart-cv/components/SmartCvBuilder';
import { getSmartCvByIdAction, getUserSmartCvsAction } from '@/features/ai-smart-cv/actions';
import { assertQuotaAvailableAction, checkUserEntitlementAction } from '@/features/pricing/actions';
import { TrialBanner } from '@/features/pricing/components/TrialBanner';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { db } from '@/shared/api/db';
import { user as userTable } from '@/entities/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface SmartCvPageProps {
  searchParams?: Promise<{ id?: string; new?: string; ref?: string }>;
}

export default async function SmartCvPage({ searchParams }: SmartCvPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  let cvId = resolvedParams.id;
  const forceNew = resolvedParams.new === 'true';

  const sessionResult = await getSafeAuthenticatedUserId();
  const currentUserId = sessionResult.userId;

  // Atribución de referido idempotente si el usuario llega directo a /cv tras registrarse
  if (currentUserId) {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const { REFERRAL_COOKIE_NAME, sanitizeReferralCode } = await import('@/entities/affiliate/referral-cookie');
      const rawCookieRef = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
      const activeRefCode = sanitizeReferralCode(resolvedParams.ref) || sanitizeReferralCode(rawCookieRef);
      if (activeRefCode) {
        const { attributeReferralAction } = await import('@/features/affiliates/actions');
        await attributeReferralAction(currentUserId, activeRefCode);
      }
    } catch {
      // Silencioso
    }
  }

  // Carga paralela de permisos de suscripción, CVs existentes y cuota disponible
  const [entitlement, cvResult, userCvsRes, quotaRes, dbUser] = await Promise.all([
    checkUserEntitlementAction(currentUserId || undefined),
    cvId ? getSmartCvByIdAction(cvId, currentUserId || undefined) : Promise.resolve(null),
    !cvId && currentUserId ? getUserSmartCvsAction(currentUserId) : Promise.resolve(null),
    !cvId && currentUserId ? assertQuotaAvailableAction(currentUserId, 'cvs') : Promise.resolve(null),
    !cvId && currentUserId
      ? db.query.user.findFirst({
          where: eq(userTable.id, currentUserId),
          columns: { name: true, email: true },
        }).catch(() => null)
      : Promise.resolve(null),
  ]);

  let effectiveCvResult = cvResult;
  let autoLoadedExistingCv = false;

  if (
    !cvId &&
    userCvsRes?.success &&
    Array.isArray(userCvsRes.data) &&
    userCvsRes.data.length > 0 &&
    (!forceNew || (quotaRes && !quotaRes.allowed))
  ) {
    // Si el usuario navega a /cv sin ?id= y ya tiene un CV guardado (o alcanzó su cuota 1/1 del Plan Comunitario),
    // cargamos su CV más reciente automáticamente para que pueda editarlo, optimizarlo con IA o exportarlo a PDF sin bloqueos.
    const latestCv = userCvsRes.data[0];
    cvId = latestCv.id;
    effectiveCvResult = await getSmartCvByIdAction(latestCv.id, currentUserId || undefined);
    autoLoadedExistingCv = true;
  }

  const initialData = effectiveCvResult?.success && effectiveCvResult.data ? effectiveCvResult.data : undefined;
  const initialCvId = effectiveCvResult?.success && effectiveCvResult.id ? effectiveCvResult.id : undefined;
  const initialScore = effectiveCvResult?.success && typeof effectiveCvResult.atsScore === 'number' ? effectiveCvResult.atsScore : undefined;

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
          defaultUserName={dbUser?.name || undefined}
          defaultUserEmail={dbUser?.email || undefined}
          autoLoadedExistingCv={autoLoadedExistingCv}
          quotaSummary={
            quotaRes
              ? {
                  currentCount: quotaRes.currentCount,
                  maxLimit: quotaRes.maxLimit,
                  allowedNew: quotaRes.allowed,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
