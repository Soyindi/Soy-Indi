import { CardBuilder } from '@/features/card-builder/components/CardBuilder';
import { getCardByIdAction, getUserCardsAction } from '@/features/card-builder/dashboard-actions';
import { assertQuotaAvailableAction, checkUserEntitlementAction } from '@/features/pricing/actions';
import { TrialBanner } from '@/features/pricing/components/TrialBanner';
import { getSafeAuthenticatedUserId } from '@/shared/lib/session';
import { db } from '@/shared/api/db';
import { user as userTable } from '@/entities/schema';
import { eq } from 'drizzle-orm';

interface NewCardPageProps {
  searchParams?: Promise<{ id?: string }>;
}

export default async function NewCardPage({ searchParams }: NewCardPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  let cardId = resolvedParams.id;

  const sessionResult = await getSafeAuthenticatedUserId();
  const currentUserId = sessionResult.userId;

  const [entitlement, cardRes, userCardsRes, quotaRes, dbUser] = await Promise.all([
    checkUserEntitlementAction(currentUserId || undefined),
    cardId ? getCardByIdAction(cardId, currentUserId || undefined) : Promise.resolve(null),
    !cardId && currentUserId ? getUserCardsAction(currentUserId) : Promise.resolve(null),
    !cardId && currentUserId ? assertQuotaAvailableAction(currentUserId, 'cards') : Promise.resolve(null),
    !cardId && currentUserId
      ? db.query.user.findFirst({
          where: eq(userTable.id, currentUserId),
          columns: { name: true, email: true },
        }).catch(() => null)
      : Promise.resolve(null),
  ]);

  let initialData: any = undefined;
  let autoLoadedExistingCard = false;

  if (cardRes && cardRes.success && cardRes.data) {
    initialData = cardRes.data;
  } else if (
    !cardId &&
    quotaRes &&
    !quotaRes.allowed &&
    userCardsRes?.success &&
    Array.isArray(userCardsRes.data) &&
    userCardsRes.data.length > 0
  ) {
    // Si el usuario llegó a /cards/new sin ?id= pero ya alcanzó el límite de su plan (ej. 1/1 en Plan Comunitario),
    // cargamos automáticamente su tarjeta existente en modo edición para evitar bloqueos frustrantes al guardar.
    const primaryCard = userCardsRes.data[0];
    cardId = primaryCard.id;
    initialData = primaryCard;
    autoLoadedExistingCard = true;
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-zinc-950">
      {/* Banner de estado de membresía / trial 3 días */}
      <TrialBanner entitlement={entitlement} />
      {/* Luces volumétricas y auras luminosas de fondo */}
      <div className="absolute top-[-8%] left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-[5%] w-[500px] h-[500px] rounded-full bg-sky-400/18 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[25%] w-[550px] h-[550px] rounded-full bg-teal-400/15 blur-[140px] pointer-events-none" />

      <div className="flex-1 py-10">
        <CardBuilder
          initialData={initialData}
          cardId={cardId}
          defaultUserName={dbUser?.name || undefined}
          defaultUserEmail={dbUser?.email || undefined}
          autoLoadedExistingCard={autoLoadedExistingCard}
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

