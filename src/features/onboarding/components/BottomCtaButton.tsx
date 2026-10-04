'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/shared/lib/auth-client';
import { ArrowRight, Sparkles } from 'lucide-react';

interface BottomCtaButtonProps {
  className?: string;
}

export function BottomCtaButton({ className = '' }: BottomCtaButtonProps) {
  const { data: sessionData } = useSession();
  const isAuthenticated = !!sessionData?.user;

  if (isAuthenticated) {
    return (
      <Link
        href="/start"
        className={`inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all min-h-[48px] ${className}`}
      >
        <Sparkles className="w-4 h-4 text-cyan-200" />
        <span>Ir a Crear / Onboarding Hub</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    );
  }

  return (
    <Link
      href="/login?mode=signup&callbackUrl=/start"
      className={`inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all min-h-[48px] ${className}`}
    >
      <span>Crear mi Cuenta Gratis</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}
