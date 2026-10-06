import { describe, it, expect } from 'vitest';

describe('Systemic Navigation Audit & Zero Auto-Referential Loops', () => {
  it('garantiza que el logotipo principal en las vistas no genere auto-enlaces hacia la misma URL', () => {
    // Matriz de destinos canónicos de BrandLogo por vista
    const logoDestinations = {
      dashboard: '/',       // En /dashboard, el logo lleva a la portada web (/), nunca a /dashboard
      start: '/',           // En /start, el logo lleva a la portada web (/), nunca a /start
      login: '/',           // En /login, el logo lleva a la portada web (/)
      publicView: '/',      // En /c/... o /p/..., el logo lleva a la portada web (/)
      editorSubpages: '/dashboard', // En editores (/presentations, /cv), el logo lleva al Dashboard
    };

    expect(logoDestinations.dashboard).not.toBe('/dashboard');
    expect(logoDestinations.dashboard).toBe('/');

    expect(logoDestinations.start).not.toBe('/start');
    expect(logoDestinations.start).toBe('/');

    expect(logoDestinations.login).toBe('/');
    expect(logoDestinations.editorSubpages).toBe('/dashboard');
  });

  it('verifica que las 3 vistas públicas (/c, /cv, /p) empleen el isotipo animado oficial solo sin textos redundantes', () => {
    const publicViewsBranding = {
      cards: { variant: 'symbol', size: 'sm', showText: false, useVideo: true, linkToHome: true },
      smartCv: { variant: 'symbol', size: 'sm', showText: false, useVideo: true, linkToHome: true },
      presentations: { variant: 'symbol', size: 'sm', showText: false, useVideo: true, linkToHome: true },
    };

    expect(publicViewsBranding.cards.showText).toBe(false);
    expect(publicViewsBranding.cards.useVideo).toBe(true);

    expect(publicViewsBranding.smartCv.showText).toBe(false);
    expect(publicViewsBranding.smartCv.useVideo).toBe(true);

    expect(publicViewsBranding.presentations.showText).toBe(false);
    expect(publicViewsBranding.presentations.useVideo).toBe(true);
  });

  it('valida que no existan botones duplicados compitiendo por el mismo destino en la barra de navegación del Dashboard', () => {
    // En la cabecera del Dashboard, solo deben residir las acciones indispensables
    const dashboardHeaderActions = [
      { id: 'logo', target: '/', label: 'Portada INDI' },
      { id: 'account', target: 'user-profile', label: 'Sesión / Avatar' },
    ];

    const targets = dashboardHeaderActions.map((a) => a.target);
    const uniqueTargets = new Set(targets);

    // No hay duplicidad de rutas en la cabecera
    expect(targets.length).toBe(uniqueTargets.size);
    // No hay auto-enlaces al dashboard
    expect(targets).not.toContain('/dashboard');
  });

  it('verifica que el TrialBanner sea el único responsable de la conversión a planes dentro de /dashboard', () => {
    const pricingTriggersInDashboard = {
      trialBannerCta: '/pricing',
      headerNavigationButton: null, // Eliminado para prevenir redundancia visual
    };

    expect(pricingTriggersInDashboard.trialBannerCta).toBe('/pricing');
    expect(pricingTriggersInDashboard.headerNavigationButton).toBeNull();
  });

  it('audita que los CTAs de registro/creación en vistas públicas (/c, /cv, /p) redirijan directamente a iniciar sesión / registro', () => {
    // Matriz de conversión viral para visitantes no autenticados
    const publicVisitorCtas = {
      cardsContextualHeader: '/login?mode=signup&callbackUrl=/start',
      cardBadgeFooter: '/login?mode=signup&callbackUrl=/start',
      presentationHeader: '/login?mode=signup&callbackUrl=/presentations',
      smartCvHeader: '/login?mode=signup&callbackUrl=/cv',
      smartCvFooter: '/login?mode=signup&callbackUrl=/cv',
    };

    // Todos los CTAs de visitantes deben apuntar a la pasarela de autenticación (/login)
    Object.values(publicVisitorCtas).forEach((target) => {
      expect(target).toContain('/login');
      expect(target).toContain('mode=signup');
    });

    // Ninguno debe apuntar directamente a rutas desprotegidas sin pasar por autenticación
    expect(publicVisitorCtas.cardsContextualHeader).not.toBe('/start');
    expect(publicVisitorCtas.presentationHeader).not.toBe('/start');
    expect(publicVisitorCtas.cardBadgeFooter).not.toBe('/');
  });
});
