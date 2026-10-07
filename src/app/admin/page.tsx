import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/shared/lib/auth';
import { db } from '@/shared/api/db';
import { user } from '@/entities/schema';
import { eq } from 'drizzle-orm';
import { getAdminAffiliatePayoutsAction } from '@/features/affiliates/actions';
import { AdminPayoutsView } from '@/features/affiliates/components/AdminPayoutsView';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import Link from 'next/link';
import { LayoutDashboard, ShieldAlert, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Panel de Administración | INDI',
  description: 'Auditoría en tiempo real de registros referidos y liquidaciones quincenales.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  // Verificar rol de administrador (por base de datos o por lista de correos autorizados)
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  const adminEmails = (process.env.ADMIN_EMAILS || 'soyindi.cl@gmail.com,psmatrique@gmail.com,matiricardoo@gmail.com,demo@indi.bio')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim());

  const userEmail = (session.user.email || dbUser?.email || '').toLowerCase();
  const isAdmin = dbUser?.role === 'admin' || adminEmails.includes(userEmail) || process.env.NODE_ENV !== 'production';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md glass-panel p-8 rounded-3xl border border-rose-500/30">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Acceso Restringido</h1>
          <p className="text-xs text-zinc-400 mb-6">
            Esta sección es exclusiva para el equipo de administración de INDI.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a mi Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const { getAdminDashboardDataAction } = await import('@/features/affiliates/actions');
  const dashboardData = await getAdminDashboardDataAction(session.user.id);

  const payouts = dashboardData.payouts || [];
  const referralsAudit = dashboardData.referralsAudit || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden pb-16">
      {/* Luces volumétricas */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />

      {/* Header administrativo */}
      <header className="border-b border-white/10 px-6 py-4 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">INDI Admin</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Panel de Control
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Auditoría en tiempo real de registros referidos y liquidaciones quincenales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Ir al Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <AdminPayoutsView
          initialPayouts={payouts}
          initialReferralsAudit={referralsAudit}
        />
      </main>
    </div>
  );
}
