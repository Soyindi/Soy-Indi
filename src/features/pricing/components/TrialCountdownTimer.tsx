'use client';

import React, { useEffect, useState } from 'react';
import { TimeRemainingBreakdown, calculateTimeRemaining } from '@/entities/subscription/types';
import { Clock } from 'lucide-react';

interface TrialCountdownTimerProps {
  expiresAt: number | null;
  initialTimeRemaining?: TimeRemainingBreakdown;
  onExpire?: () => void;
  compact?: boolean;
}

export function TrialCountdownTimer({
  expiresAt,
  initialTimeRemaining,
  onExpire,
  compact = false,
}: TrialCountdownTimerProps) {
  // Prevenir Hydration Mismatch inicializando con el estado calculado por el servidor
  const [timeLeft, setTimeLeft] = useState<TimeRemainingBreakdown>(() => {
    if (initialTimeRemaining) return initialTimeRemaining;
    return calculateTimeRemaining(expiresAt);
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(expiresAt);
      setTimeLeft(remaining);

      if (remaining.isExpired) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  // Si ya expiró
  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        <span>Tiempo agotado</span>
      </span>
    );
  }

  // Formato con ceros iniciales
  const pad = (n: number) => n.toString().padStart(2, '0');

  const daysStr = `${timeLeft.days}d`;
  const hoursStr = `${pad(timeLeft.hours)}h`;
  const minutesStr = `${pad(timeLeft.minutes)}m`;
  const secondsStr = `${pad(timeLeft.seconds)}s`;

  if (compact) {
    return (
      <div
        role="timer"
        aria-label="Tiempo restante de prueba"
        className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-300 tracking-wider tabular-nums"
      >
        <Clock className="w-3.5 h-3.5 opacity-80 animate-pulse text-amber-400 shrink-0" />
        <span>{daysStr}</span>
        <span className="opacity-40">:</span>
        <span>{hoursStr}</span>
        <span className="opacity-40">:</span>
        <span>{minutesStr}</span>
        <span className="opacity-40">:</span>
        <span className="text-amber-400">{secondsStr}</span>
      </div>
    );
  }

  return (
    <div
      role="timer"
      aria-label="Cuenta regresiva de prueba gratuita"
      className="inline-flex items-center gap-1 sm:gap-1.5 font-mono text-xs font-bold tracking-wider tabular-nums"
    >
      {/* Segmento: Días */}
      <div className="flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white shadow-xs">
        <span>{daysStr}</span>
      </div>
      <span className="text-zinc-500 font-sans font-light select-none">:</span>

      {/* Segmento: Horas */}
      <div className="flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-100 shadow-xs">
        <span>{hoursStr}</span>
      </div>
      <span className="text-zinc-500 font-sans font-light select-none">:</span>

      {/* Segmento: Minutos */}
      <div className="flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-100 shadow-xs">
        <span>{minutesStr}</span>
      </div>
      <span className="text-zinc-500 font-sans font-light select-none">:</span>

      {/* Segmento: Segundos */}
      <div className="flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-xs">
        <span>{secondsStr}</span>
      </div>
    </div>
  );
}
