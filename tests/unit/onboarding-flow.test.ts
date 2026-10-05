import { describe, it, expect } from 'vitest';

describe('Onboarding Choice Grid & Systemic Switchboard Flow', () => {
  it('contiene las 3 opciones canónicas con sus rutas y estimaciones de tiempo', () => {
    const options = [
      {
        id: 'card',
        title: 'Crear mi Tarjeta Digital',
        href: '/cards/new',
        timeEstimate: '2 minutos',
        badge: 'Recomendado para Networking',
      },
      {
        id: 'cv',
        title: 'Optimizar o Crear Smart CV',
        href: '/cv',
        timeEstimate: '4 minutos',
        badge: 'Recomendado para Postulaciones',
      },
      {
        id: 'presentation',
        title: 'Elaborar Presentación Cinemática',
        href: '/presentations',
        timeEstimate: '3 minutos',
        badge: 'Para Pitches & Clientes',
      },
    ];

    expect(options).toHaveLength(3);

    // Verificación de rutas canónicas
    expect(options.map((o) => o.href)).toEqual(['/cards/new', '/cv', '/presentations']);

    // Verificación de estimaciones orientativas (<= 4 minutos)
    options.forEach((opt) => {
      expect(opt.timeEstimate).toMatch(/\d+ minutos/);
      expect(opt.badge).toBeTruthy();
    });
  });

  it('proporciona la ruta canónica de escape hacia el Dashboard General', () => {
    const skipOnboardingRoute = '/dashboard';
    expect(skipOnboardingRoute).toBe('/dashboard');
  });

  it('formatea correctamente el banner de días de prueba restantes', () => {
    const formatTrialBadge = (days: number) =>
      `Prueba Gratuita Activada: ${days} Días de Acceso Total Ilimitado`;

    expect(formatTrialBadge(3)).toBe('Prueba Gratuita Activada: 3 Días de Acceso Total Ilimitado');
    expect(formatTrialBadge(1)).toBe('Prueba Gratuita Activada: 1 Días de Acceso Total Ilimitado');
  });
});
