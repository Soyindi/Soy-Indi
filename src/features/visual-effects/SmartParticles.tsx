'use client';

import React, { useMemo } from 'react';
import './SmartParticles.css';

export interface SmartParticlesProps {
  enabled?: boolean;
  intensity?: 'subtle' | 'balanced' | 'prominent';
  behavior?: 'static' | 'interactive' | 'ambient';
  color?: string;
  children: React.ReactNode;
  className?: string;
}

export function SmartParticles({
  enabled = true,
  intensity = 'balanced',
  behavior = 'ambient',
  color = '#6366f1',
  children,
  className = '',
}: SmartParticlesProps) {
  const particles = useMemo(() => {
    if (!enabled) return [];

    const counts = { subtle: 4, balanced: 6, prominent: 10 };
    const count = counts[intensity] || 6;

    // Zonas seguras anti-colisión (solo bordes y esquinas periféricas)
    const safeZones = [
      { left: '10%', top: '10%' },
      { left: '90%', top: '12%' },
      { left: '6%', top: '35%' },
      { left: '94%', top: '40%' },
      { left: '8%', top: '82%' },
      { left: '92%', top: '85%' },
      { left: '15%', top: '65%' },
      { left: '85%', top: '60%' },
      { left: '48%', top: '6%' },
      { left: '52%', top: '94%' },
    ];

    return Array.from({ length: count }).map((_, i) => {
      const pos = safeZones[i % safeZones.length];
      const delay = (i * 0.35).toFixed(2);
      const duration = (3.5 + (i % 3) * 0.8).toFixed(2);
      const size = behavior === 'static' ? '9px' : behavior === 'interactive' ? '8px' : '6px';

      return (
        <div
          key={`particle-${i}`}
          className={`smart-particle smart-particle-${behavior}`}
          style={
            {
              left: pos.left,
              top: pos.top,
              '--particle-color': color,
              '--particle-delay': `${delay}s`,
              '--particle-duration': `${duration}s`,
              '--particle-size': size,
            } as React.CSSProperties
          }
        />
      );
    });
  }, [enabled, intensity, behavior, color]);

  return (
    <div className={`smart-particles-container ${className}`}>
      {enabled && <div className="smart-particles-layer">{particles}</div>}
      <div className="smart-particles-content">{children}</div>
    </div>
  );
}
