'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from '@/shared/lib/auth-client';
import { Menu, X, Sparkles, Layers, FileText, MonitorPlay, Tag, ArrowRight, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNavDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  // Bloquear scroll del fondo cuando el menú esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const visitorNavItems = [
    {
      title: 'Soluciones Integradas',
      href: '#soluciones',
      description: 'Tarjetas con QR, Smart CV y Presentaciones 16:9',
      icon: Layers,
    },
    {
      title: '¿Por qué INDI?',
      href: '#comparativa',
      description: 'Comparativa frente a tarjetas de papel tradicionales',
      icon: Sparkles,
    },
    {
      title: 'Precios & Planes ($1.000/mes)',
      href: '#precios',
      description: '15 días gratis y luego solo $6.000 CLP cada 6 meses',
      icon: Tag,
    },
    {
      title: 'Preguntas Frecuentes',
      href: '#faq',
      description: 'Garantías, métodos de pago y activación instantánea',
      icon: FileText,
    },
  ];

  const userNavItems = [
    {
      title: 'Mi Panel de Control',
      href: '/dashboard',
      description: 'Gestiona tarjetas, CVs y presentaciones en un solo lugar',
      icon: Layers,
    },
    {
      title: 'Diseñar Tarjeta Digital',
      href: '/cards/new',
      description: 'Editor con QR dinámico y botón directo a WhatsApp',
      icon: Tag,
    },
    {
      title: 'Smart CV (ATS)',
      href: '/cv',
      description: 'Auditoría heurística y exportación A4 para reclutadores',
      icon: FileText,
    },
    {
      title: 'Presentaciones 16:9',
      href: '/presentations',
      description: 'Diapositivas cinematográficas con asistencia de IA',
      icon: MonitorPlay,
    },
  ];

  const navItems = user ? userNavItems : visitorNavItems;

  return (
    <div className="md:hidden">
      {/* Botón táctil ergonómico de 44x44px */}
      <button
        onClick={() => setIsOpen(true)}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-pill text-zinc-300 hover:text-white border border-white/10 active:scale-95 transition-all"
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5 text-zinc-200" />
      </button>

      {/* Drawer Móvil con Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop oscuro con desenfoque */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Panel Lateral */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-full max-w-xs sm:max-w-sm h-full bg-zinc-950/95 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              {/* Cabecera del Drawer */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 p-[1px]">
                      <div className="w-full h-full bg-black/80 rounded-[7px] flex items-center justify-center">
                        <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-200">
                          IN
                        </span>
                      </div>
                    </div>
                    <span className="text-base font-bold tracking-tight text-white">INDI</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      2026
                    </span>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-pill text-zinc-400 hover:text-white border border-white/10 active:scale-95 transition-all"
                    aria-label="Cerrar menú"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Enlaces Principales */}
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="group flex items-start gap-3.5 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all active:scale-[0.98]"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-colors">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Botón CTA inferior en Zona del Pulgar */}
              <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] shrink-0">
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
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs active:scale-[0.98] transition-all shadow-md shadow-indigo-500/20"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Ir a Mi Panel de Control</span>
                    </Link>

                    <button
                      type="button"
                      onClick={async () => {
                        setIsOpen(false);
                        await signOut();
                        window.location.reload();
                      }}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-zinc-300 hover:text-rose-300 font-medium text-xs active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login?mode=login&callbackUrl=/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs active:scale-[0.98] transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5 text-zinc-400" />
                      <span>¿Ya tienes cuenta? Iniciar Sesión</span>
                    </Link>

                    <Link
                      href="/login?mode=signup&callbackUrl=/start"
                      onClick={() => setIsOpen(false)}
                      className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Prueba Gratis 15 Días</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Link>

                    <div className="text-center text-[11px] font-mono text-zinc-400">
                      Sin tarjeta de crédito • Acceso total
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
