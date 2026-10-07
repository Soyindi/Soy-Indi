import { CardBuilder } from '@/features/card-builder/components/CardBuilder';
import { getCardByIdAction } from '@/features/card-builder/dashboard-actions';

interface NewCardPageProps {
  searchParams?: Promise<{ id?: string }>;
}

export default async function NewCardPage({ searchParams }: NewCardPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const cardId = resolvedParams.id;

  let initialData: any = undefined;

  if (cardId) {
    const cardRes = await getCardByIdAction(cardId);
    if (cardRes.success && cardRes.data) {
      initialData = cardRes.data;
    }
  }

  return (
    <div className="min-h-screen py-10 relative overflow-hidden">
      {/* Luces volumétricas y auras luminosas de fondo */}
      <div className="absolute top-[-8%] left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-[5%] w-[500px] h-[500px] rounded-full bg-sky-400/18 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[25%] w-[550px] h-[550px] rounded-full bg-teal-400/15 blur-[140px] pointer-events-none" />

      <CardBuilder initialData={initialData} cardId={cardId} />
    </div>
  );
}

