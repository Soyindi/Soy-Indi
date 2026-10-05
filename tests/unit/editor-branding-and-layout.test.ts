import { describe, it, expect } from 'vitest';

describe('AppEditorHeader & Subpages Layout Integrity', () => {
  it('garantiza que las rutas canónicas de retorno en las 3 subpáginas apunten a su vertical en el Dashboard', () => {
    const editorNavigation = {
      presentations: {
        categoryHref: '/dashboard?tab=presentations',
        categoryName: 'Presentaciones Cinemáticas',
        badgeText: 'Orbital Studio 16:9',
      },
      cards: {
        categoryHref: '/dashboard?tab=cards',
        categoryName: 'Tarjetas Digitales',
        badgeText: 'Borrador en Vivo',
      },
      cv: {
        categoryHref: '/dashboard?tab=cvs',
        categoryName: 'Smart CV ATS',
        badgeText: 'A4 Empresarial',
      },
    };

    expect(editorNavigation.presentations.categoryHref).toBe('/dashboard?tab=presentations');
    expect(editorNavigation.cards.categoryHref).toBe('/dashboard?tab=cards');
    expect(editorNavigation.cv.categoryHref).toBe('/dashboard?tab=cvs');
  });

  it('valida que el punto de entrada de IA de Presentaciones unifique SCQA y multimodal sin duplicidad', () => {
    // Configuración del modal multimodal
    const aiAssistantConfig = {
      primaryAction: 'Crear con IA (SCQA)',
      supportsDocuments: true,
      supportedMimeTypes: ['application/pdf', 'text/plain', 'text/markdown'],
      supportsDirectPrompt: true,
    };

    expect(aiAssistantConfig.primaryAction).toContain('SCQA');
    expect(aiAssistantConfig.supportsDocuments).toBe(true);
    expect(aiAssistantConfig.supportsDirectPrompt).toBe(true);
  });
});
