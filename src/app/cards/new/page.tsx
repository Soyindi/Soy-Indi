import { CardBuilder } from '@/features/card-builder/components/CardBuilder';

export default function NewCardPage() {
  return (
    <div className="min-h-screen py-10 relative overflow-hidden">
      {/* Luces volumétricas de fondo */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      <CardBuilder />
    </div>
  );
}
