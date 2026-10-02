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

    // Geometría Estratégica por Capas (Proporción Áurea & Eye-Tracking)
    // 1. Anillo Orbital de Avatar (Aura de identidad focal)
    // 2. Vértices Áureos Perimetrales (Guías de contorno de tarjeta)
    // 3. Anclas de Base (Soporte visual inferior sin oclusión)
    const strategicAnchors = [
      // Cuadrante 1: Corona de Avatar (Acento superior de identidad)
      { left: '22%', top: '14%', size: '6px', depth: '0.85' },
      { left: '78%', top: '15%', size: '7px', depth: '0.9' },
      { left: '50%', top: '2%', size: '8px', depth: '1' },

      // Cuadrante 2: Vértices Áureos Superiores
      { left: '3%', top: '8%', size: '9px', depth: '0.75' },
      { left: '97%', top: '9%', size: '8px', depth: '0.8' },

      // Cuadrante 3: Flancos de Lectura (Alineados con el espacio vacío entre Avatar y Botones)
      { left: '-1%', top: '38%', size: '7px', depth: '0.65' },
      { left: '101%', top: '42%', size: '9px', depth: '0.7' },

      // Cuadrante 4: Flancos de Acción (Alineados con los extremos del botón vCard)
      { left: '1%', top: '56%', size: '6px', depth: '0.7' },
      { left: '99%', top: '58%', size: '8px', depth: '0.85' },

      // Cuadrante 5: Periferia Inferior & Bento Blocks
      { left: '4%', top: '78%', size: '8px', depth: '0.75' },
      { left: '96%', top: '80%', size: '7px', depth: '0.8' },

      // Cuadrante 6: Zócalo de Cierre (Borde inferior)
      { left: '16%', top: '96%', size: '6px', depth: '0.6' },
      { left: '84%', top: '95%', size: '8px', depth: '0.7' },
      { left: '50%', top: '99%', size: '7px', depth: '0.85' },
    ];

    // Selección armónica de anclas según intensidad:
    // subtle: 4 esquinas áureas periféricas
    // balanced: 8 anclas (avatar + flancos + base)
    // prominent: 14 anclas (órbita completa)
    const selectedIndices = intensity === 'subtle'
      ? [0, 4, 9, 13]
      : intensity === 'balanced'
      ? [0, 1, 2, 5, 6, 7, 10, 13]
      : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    return selectedIndices.map((anchorIdx, i) => {
      const anchor = strategicAnchors[anchorIdx];
      const delay = (i * 0.28).toFixed(2);
      const duration = behavior === 'static' 
        ? '5s' 
        : behavior === 'interactive' 
        ? (2.6 + (i % 3) * 0.5).toFixed(2) + 's' 
        : (3.6 + (i % 3) * 0.6).toFixed(2) + 's';

      return (
        <div
          key={`particle-${intensity}-${behavior}-${i}`}
          className={`smart-particle smart-particle-${behavior}`}
          style={
            {
              left: anchor.left,
              top: anchor.top,
              opacity: anchor.depth,
              '--particle-color': color,
              '--particle-delay': `${delay}s`,
              '--particle-duration': duration,
              '--particle-size': anchor.size,
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
