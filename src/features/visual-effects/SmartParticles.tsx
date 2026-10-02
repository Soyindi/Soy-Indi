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

    const counts = { subtle: 4, balanced: 8, prominent: 14 };
    const count = counts[intensity] || 8;

    // Zonas seguras periféricas con dispersión envolvente
    const safeZones = [
      { left: '6%', top: '8%' },
      { left: '92%', top: '10%' },
      { left: '4%', top: '35%' },
      { left: '95%', top: '42%' },
      { left: '8%', top: '80%' },
      { left: '92%', top: '82%' },
      { left: '14%', top: '60%' },
      { left: '86%', top: '65%' },
      { left: '48%', top: '4%' },
      { left: '52%', top: '96%' },
      { left: '2%', top: '20%' },
      { left: '96%', top: '22%' },
      { left: '10%', top: '92%' },
      { left: '90%', top: '94%' },
    ];

    return Array.from({ length: count }).map((_, i) => {
      const pos = safeZones[i % safeZones.length];
      const delay = (i * 0.3).toFixed(2);
      const duration = behavior === 'static' 
        ? '5s' 
        : behavior === 'interactive' 
        ? (2.8 + (i % 3) * 0.6).toFixed(2) + 's' 
        : (3.8 + (i % 3) * 0.7).toFixed(2) + 's';
      
      const size = behavior === 'static' ? '10px' : behavior === 'interactive' ? '9px' : '7px';

      return (
        <div
          key={`particle-${intensity}-${behavior}-${i}`}
          className={`smart-particle smart-particle-${behavior}`}
          style={
            {
              left: pos.left,
              top: pos.top,
              '--particle-color': color,
              '--particle-delay': `${delay}s`,
              '--particle-duration': duration,
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
