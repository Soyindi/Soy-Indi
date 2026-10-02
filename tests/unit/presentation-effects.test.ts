import { describe, it, expect } from 'vitest';
import { presentationThemeSchema } from '@/entities/presentation/schemas';

describe('Presentation Cinematic Effects & Theme Enhancements', () => {
  it('debe validar opciones de transición, aura volumétrica y tipografía en temas', () => {
    const customTheme = {
      id: 'custom-neon',
      name: 'Custom Neon',
      primaryColor: '#6366f1',
      accentColor: '#22d3ee',
      backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 75%)',
      enableParticles: true,
      fontFamily: 'sans',
      transitionEffect: 'slide' as const,
      ambientAuraIntensity: 'dramatic' as const,
      fontPairing: 'serif' as const,
    };

    const res = presentationThemeSchema.safeParse(customTheme);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.transitionEffect).toBe('slide');
      expect(res.data.ambientAuraIntensity).toBe('dramatic');
      expect(res.data.fontPairing).toBe('serif');
    }
  });

  it('debe asignar valores por defecto estables si se omiten las nuevas opciones', () => {
    const minimalTheme = {
      id: 'minimal-dark',
      name: 'Minimal Dark',
      primaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #3b0764 0%, #07030d 75%)',
    };

    const res = presentationThemeSchema.safeParse(minimalTheme);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.transitionEffect).toBe('fade');
      expect(res.data.ambientAuraIntensity).toBe('dramatic');
      expect(res.data.fontPairing).toBe('sans');
    }
  });
});
