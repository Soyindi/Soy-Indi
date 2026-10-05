import { describe, it, expect } from 'vitest';

describe('Unified Dashboard Architecture & Data Calculations', () => {
  it('calcula la tasa de conversión con precisión evitando divisiones por cero', () => {
    const calculateConversion = (views: number, clicks: number) => {
      if (views <= 0) return '0.0';
      return ((clicks / views) * 100).toFixed(1);
    };

    // Caso 1: Sin visitas ni clicks (cuenta nueva)
    expect(calculateConversion(0, 0)).toBe('0.0');

    // Caso 2: Con visitas pero 0 clicks
    expect(calculateConversion(150, 0)).toBe('0.0');

    // Caso 3: Métricas activas con decimales
    expect(calculateConversion(100, 25)).toBe('25.0');
    expect(calculateConversion(3, 1)).toBe('33.3');
  });

  it('filtra correctamente tarjetas digitales por múltiples campos sin distinguir mayúsculas', () => {
    const mockCards = [
      { id: '1', title: 'Matías Riquelme', profession: 'Arquitecto de Software', slug: 'matias-tech' },
      { id: '2', title: 'Consultoría Estratégica', profession: 'Advisor Ejecutivo', slug: 'consultoria-indi' },
      { id: '3', title: 'Dra. Valentina Paz', profession: 'Médico Cirujano', slug: 'dra-valentina' },
    ];

    const filterCards = (query: string) => {
      const q = query.toLowerCase();
      return mockCards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.profession.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
    };

    expect(filterCards('matias')).toHaveLength(1);
    expect(filterCards('cirujano')).toHaveLength(1);
    expect(filterCards('indi')).toHaveLength(1);
    expect(filterCards('inexistente')).toHaveLength(0);
    expect(filterCards('')).toHaveLength(3);
  });

  it('filtra Smart CVs y Presentaciones por slug o título adecuadamente', () => {
    const mockCvs = [
      { id: 'cv-1', title: 'CV Tech Lead 2026', targetRole: 'Staff Engineer', slug: 'matias-cv' },
      { id: 'cv-2', title: 'CV Marketing Lead', targetRole: 'CMO', slug: 'marketing-exec' },
    ];

    const mockPresentations = [
      { id: 'p-1', title: 'Pitch Deck Slingshot Seed', slug: 'slingshot-deck' },
      { id: 'p-2', title: 'Arquitectura Cloud 2026', slug: 'cloud-arch' },
    ];

    const filterCvs = (query: string) =>
      mockCvs.filter(
        (cv) =>
          cv.title.toLowerCase().includes(query.toLowerCase()) ||
          cv.targetRole.toLowerCase().includes(query.toLowerCase()) ||
          (cv.slug && cv.slug.toLowerCase().includes(query.toLowerCase()))
      );

    const filterPres = (query: string) =>
      mockPresentations.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          (p.slug && p.slug.toLowerCase().includes(query.toLowerCase()))
      );

    expect(filterCvs('Staff')).toHaveLength(1);
    expect(filterCvs('matias-cv')).toHaveLength(1);
    expect(filterPres('Pitch')).toHaveLength(1);
    expect(filterPres('cloud-arch')).toHaveLength(1);
  });

  it('asigna el botón contextual correcto y rutas canónicas para cada vertical', () => {
    const getContextualAction = (activeTab: 'cards' | 'cvs' | 'presentations') => {
      const map = {
        cards: { href: '/cards/new', label: 'Nueva Tarjeta' },
        cvs: { href: '/cv', label: 'Crear o Mejorar CV' },
        presentations: { href: '/presentations', label: 'Nueva Presentación' },
      };
      return map[activeTab];
    };

    expect(getContextualAction('cards')).toEqual({ href: '/cards/new', label: 'Nueva Tarjeta' });
    expect(getContextualAction('cvs')).toEqual({ href: '/cv', label: 'Crear o Mejorar CV' });
    expect(getContextualAction('presentations')).toEqual({ href: '/presentations', label: 'Nueva Presentación' });
  });
});
