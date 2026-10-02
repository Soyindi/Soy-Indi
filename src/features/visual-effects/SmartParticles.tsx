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
    // Geometría Estratégica Interna (Garantía Cero Desborde 4% a 96%)
    // Todas las partículas habitan dentro de los márgenes y curvas de la tarjeta
    const strategicAnchors = [
      // Cuadrante 1: Aura del Avatar (Espacio libre alrededor de la foto sin tapar el rostro)
      { left: '20%', top: '15%', size: '6px', depth: '0.85' },
      { left: '80%', top: '15%', size: '7px', depth: '0.9' },
      { left: '50%', top: '5%', size: '8px', depth: '1' },

      // Cuadrante 2: Vértices Superiores Curvos
      { left: '6%', top: '7%', size: '7px', depth: '0.75' },
      { left: '94%', top: '7%', size: '7px', depth: '0.8' },

      // Cuadrante 3: Flancos de Lectura (Zonas libres entre Nombre y Botón)
      { left: '5%', top: '38%', size: '7px', depth: '0.65' },
      { left: '95%', top: '40%', size: '8px', depth: '0.7' },

      // Cuadrante 4: Flancos de Acción (Adyacentes al Botón de Guardar Contacto)
      { left: '6%', top: '54%', size: '6px', depth: '0.7' },
      { left: '94%', top: '56%', size: '7px', depth: '0.85' },

      // Cuadrante 5: Flancos Bento e Iconos
      { left: '6%', top: '76%', size: '7px', depth: '0.75' },
      { left: '94%', top: '78%', size: '6px', depth: '0.8' },

      // Cuadrante 6: Zócalo de Cierre Inferior (Por encima de la barra QR / Compartir)
      { left: '16%', top: '92%', size: '6px', depth: '0.6' },
      { left: '84%', top: '92%', size: '7px', depth: '0.7' },
      { left: '50%', top: '94%', size: '7px', depth: '0.85' },
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
