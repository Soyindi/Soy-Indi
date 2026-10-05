'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from '@/shared/lib/auth-client';
import { MobileNavDrawer } from './MobileNavDrawer';
import { BrandLogo } from './BrandLogo';
import { AuthModal } from '@/features/dashboard/components/AuthModal';
import { Sparkles, LayoutDashboard, LogIn, LogOut, Plus } from 'lucide-react';

interface GlobalNavbarProps {
  className?: string;
}

export function GlobalNavbar({ className = '' }: GlobalNavbarProps) {
  const { data: sessionData, isPending } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authCallbackUrl, setAuthCallbackUrl] = useState('/dashboard');

  const openAuth = (mode: 'login' | 'signup', callbackUrl: string) => {
    setAuthMode(mode);
    setAuthCallbackUrl(callbackUrl);
    setIsAuthModalOpen(true);
  };

  const user = sessionData?.user;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-xl bg-zinc-950/80 border-b border-white/5 transition-all ${className}`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          {/* Logotipo Oficial Cinemático (Solo Video Imponente) con retorno a #inicio */}
          <BrandLogo linkToHome={true} size="md" priority={true} showText={false} />

        {/* Navegación Desktop Contextual */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          {user ? (
            <>
              <Link href="/dashboard" className="text-white hover:text-cyan-300 transition-colors">
                Mi Panel
              </Link>
              <Link href="/cards/new" className="hover:text-white transition-colors">
                Tarjetas
              </Link>
              <Link href="/cv" className="hover:text-white transition-colors">
                Smart CV
              </Link>
              <Link href="/presentations" className="hover:text-white transition-colors">
                Presentaciones
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Planes
              </Link>
            </>
          ) : (
            <>
              <a href="#soluciones" className="hover:text-white transition-colors">
                Herramientas
              </a>
              <a href="#comparativa" className="hover:text-white transition-colors">
                ¿Por qué INDI?
              </a>
              <a href="#precios" className="hover:text-white transition-colors">
                Precios ($1.000/mes)
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                Preguntas Frecuentes
              </a>
            </>
          )}
        </nav>

        {/* Acciones y Estado de Autenticación */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            /* Usuario Autenticado */
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Mi Panel</span>
              </Link>

              <Link
                href="/start"
                className="min-h-[44px] hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo</span>
              </Link>

              {/* Avatar de Google */}
              <div
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] shrink-0"
                title={user.email || user.name || ''}
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || 'Usuario'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                    {(user.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Botón de Logout */}
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer flex items-center justify-center"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Usuario Visitante (No Autenticado) */
            <>
              <button
                type="button"
                onClick={() => openAuth('login', '/dashboard')}
                className="text-xs font-semibold px-3 py-2 text-zinc-400 hover:text-white transition-colors min-h-[44px] flex items-center cursor-pointer"
              >
                Ingresar
              </button>

              <Link
                href="/pricing"
                className="hidden sm:inline-flex min-h-[44px] items-center text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-300 hover:text-white transition-all"
              >
                Ver Planes
              </Link>

              <button
                type="button"
                onClick={() => openAuth('signup', '/start')}
                className="min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition-all text-center cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prueba 3 Días</span>
              </button>
            </>
          )}

          {/* Menú Drawer Móvil */}
          <MobileNavDrawer />
        </div>
      </div>
    </header>

      {/* Modal Reactivo para autenticación sin abandonar la página si está en Home */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
        callbackUrl={authCallbackUrl}
      />
    </>
  );
}
