'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, SlidersHorizontal, Check, X, Cookie } from 'lucide-react';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  LEGAL_ENTITY_CONFIG,
  buildConsentRecord,
  type CookieConsentRecord,
} from '@/entities/privacy/compliance-config';

export function CookieConsentBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showGranular, setShowGranular] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [lastRecord, setLastRecord] = useState<CookieConsentRecord | null>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      if (!raw) {
        setIsVisible(true);
      } else {
        const parsed = JSON.parse(raw) as CookieConsentRecord;
        if (parsed && parsed.policyVersion === LEGAL_ENTITY_CONFIG.policyVersion) {
          setLastRecord(parsed);
          setFunctional(Boolean(parsed.categories?.functional));
          setAnalytics(Boolean(parsed.categories?.analytics));
          setMarketing(Boolean(parsed.categories?.marketing));
        } else {
          setIsVisible(true);
        }
      }
    } catch {
      setIsVisible(true);
    }

    const handleOpenSettings = () => {
      setIsVisible(true);
      setShowGranular(true);
    };

    window.addEventListener('indi:open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('indi:open-cookie-settings', handleOpenSettings);
  }, []);

  const persistDecision = (
    nextCategories: { functional: boolean; analytics: boolean; marketing: boolean },
    method: CookieConsentRecord['interactionMethod']
  ) => {
    const record = buildConsentRecord({
      categories: nextCategories,
      interactionMethod: method,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });

    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
      document.cookie = `indi_cmp_optin=${encodeURIComponent(
        JSON.stringify({
          id: record.consentId,
          v: record.policyVersion,
          f: record.categories.functional ? 1 : 0,
          a: record.categories.analytics ? 1 : 0,
          m: record.categories.marketing ? 1 : 0,
        })
      )}; path=/; max-age=${180 * 24 * 60 * 60}; SameSite=Lax`;
    } catch {
      // Ignorar si almacenamiento restringido
    }

    setLastRecord(record);
    setFunctional(nextCategories.functional);
    setAnalytics(nextCategories.analytics);
    setMarketing(nextCategories.marketing);
    setIsVisible(false);
    setShowGranular(false);
  };

  if (!isMounted) return null;

  // Botón discreto de revocación permanente cuando el banner está cerrado (Art. 12 Ley 21.719)
  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsVisible(true);
          setShowGranular(true);
        }}
        className="fixed bottom-4 left-4 z-40 min-h-[40px] px-3 py-1.5 rounded-full bg-zinc-950/90 hover:bg-zinc-900 border border-white/15 text-zinc-400 hover:text-cyan-300 text-[11px] font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer"
        aria-label="Gestionar o revocar consentimiento de cookies (Ley 21.719)"
        title="Gestionar o revocar consentimiento de cookies"
      >
        <Cookie className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="hidden sm:inline">Cookies &amp; Privacidad</span>
      </button>
    );
  }

  return (
    <section
      role="region"
      aria-label="Gestión de consentimiento de cookies y privacidad (Ley N° 21.719)"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none"
    >
      <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-950/95 border border-cyan-500/30 shadow-2xl backdrop-blur-xl p-5 sm:p-6 pointer-events-auto text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Control de Privacidad y Cookies (Opt-In Estricto)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Ley N° 21.719 • Chile
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                En <strong>{LEGAL_ENTITY_CONFIG.tradeName}</strong> respetamos tu privacidad desde el diseño. Por defecto,{' '}
                <strong>bloqueamos cualquier cookie analítica o publicitaria</strong> hasta que otorgues tu consentimiento expreso. Solo utilizamos cookies técnicas estrictamente necesarias para mantener tu sesión segura. Consulta nuestra{' '}
                <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-semibold">
                  Política de Privacidad
                </Link>{' '}
                y{' '}
                <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-semibold">
                  Términos y Condiciones
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Panel de Configuración Granular (Casillas desmarcadas por defecto) */}
        {showGranular && (
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* 1. Estrictamente Necesarias */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-white block">1. Estrictamente Necesarias (Técnicas)</span>
                  <span className="text-[11px] text-zinc-400">
                    Autenticación HttpOnly Better-Auth, seguridad CSRF y atribución de código de invitación solicitado por el usuario.
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                  Siempre Activas
                </span>
              </div>

              {/* 2. Funcionales */}
              <label
                htmlFor="cmp-cat-functional"
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3 cursor-pointer hover:border-cyan-500/30 transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">2. Preferencias Funcionales</span>
                  <span className="text-[11px] text-zinc-400">
                    Recuerda preferencias visuales de editor y ajustes de interfaz no esenciales.
                  </span>
                </div>
                <input
                  id="cmp-cat-functional"
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-cyan-400 rounded cursor-pointer shrink-0"
                />
              </label>

              {/* 3. Analíticas */}
              <label
                htmlFor="cmp-cat-analytics"
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3 cursor-pointer hover:border-cyan-500/30 transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">3. Analíticas de Rendimiento</span>
                  <span className="text-[11px] text-zinc-400">
                    Métricas agregadas y anónimas para optimizar tiempos de carga Web Vitals.
                  </span>
                </div>
                <input
                  id="cmp-cat-analytics"
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-cyan-400 rounded cursor-pointer shrink-0"
                />
              </label>

              {/* 4. Publicitarias */}
              <label
                htmlFor="cmp-cat-marketing"
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3 cursor-pointer hover:border-cyan-500/30 transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">4. Publicitarias y Terceros</span>
                  <span className="text-[11px] text-zinc-400">
                    Seguimiento de campañas externas (INDI no comercializa datos a terceros).
                  </span>
                </div>
                <input
                  id="cmp-cat-marketing"
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-cyan-400 rounded cursor-pointer shrink-0"
                />
              </label>
            </div>

            {lastRecord && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-zinc-400">
                <span>ID Trazabilidad: {lastRecord.consentId}</span>
                <span>Fecha: {new Date(lastRecord.timestampIso).toLocaleString('es-CL')}</span>
              </div>
            )}
          </div>
        )}

        {/* Botonera Simétrica Sin Dark Patterns (Idéntico Peso Visual para Rechazar Todo y Aceptar Todo) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setShowGranular(!showGranular)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>{showGranular ? 'Ocultar Opciones' : 'Configurar Categorías'}</span>
          </button>

          {showGranular && (
            <button
              type="button"
              onClick={() =>
                persistDecision({ functional, analytics, marketing }, 'custom_granular')
              }
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-xs font-bold text-indigo-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 text-indigo-300" />
              <span>Guardar Selección</span>
            </button>
          )}

          {/* RECHAZAR TODO — Idéntico tamaño, borde, tipografía y peso visual que Aceptar Todo */}
          <button
            type="button"
            onClick={() =>
              persistDecision(
                { functional: false, analytics: false, marketing: false },
                lastRecord ? 'revoked' : 'reject_all'
              )
            }
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Rechazar Todo</span>
          </button>

          {/* ACEPTAR TODO — Idéntico tamaño, borde, tipografía y peso visual que Rechazar Todo */}
          <button
            type="button"
            onClick={() =>
              persistDecision(
                { functional: true, analytics: true, marketing: true },
                'accept_all'
              )
            }
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Aceptar Todo</span>
          </button>
        </div>
      </div>
    </section>
  );
}
