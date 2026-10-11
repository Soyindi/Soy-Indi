import { describe, it, expect } from 'vitest';
import { cardFormSchema, cardThemeConfigSchema } from '@/entities/card/schemas';
import { CARD_DESIGN_PRESETS, INDUSTRY_COVERS_GALLERY } from '@/entities/card/themes';

describe('Atmospheric Identity & Scrim Background Engine (INDI 2026)', () => {
  it('debe validar configuración de tema con portada de pastelería e imagen de fondo', () => {
    const bakeryTheme = {
      themeId: 'gourmet-bakery',
      primaryColorOklch: '#d97706',
      backgroundColorOklch: '#1c120c',
      cardFinish: 'classic' as const,
      surfaceTexture: 'radial-glow' as const,
      coverImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
      backgroundOverlayBlur: 'medium' as const,
      backgroundOverlayOpacity: 0.65,
      operationalStatus: 'taking_orders' as const,
      customStatusText: '🍰 Pastelería Abierta • Pedidos por WhatsApp',
      badgeText: '🍰 Pastelería Artesanal',
    };

    const parsed = cardThemeConfigSchema.safeParse(bakeryTheme);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.coverImageUrl).toBe('https://images.unsplash.com/photo-1509440159596-0249088772ff');
      expect(parsed.data.backgroundOverlayBlur).toBe('medium');
      expect(parsed.data.backgroundOverlayOpacity).toBe(0.65);
      expect(parsed.data.operationalStatus).toBe('taking_orders');
    }
  });

  it('debe mantener retrocompatibilidad total con tarjetas previas sin campos de atmósfera', () => {
    const legacyTheme = {
      themeId: 'stellar',
      primaryColorOklch: '#6366f1',
    };

    const parsed = cardThemeConfigSchema.safeParse(legacyTheme);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.backgroundType).toBe('theme');
      expect(parsed.data.backgroundOverlayBlur).toBe('medium');
      expect(parsed.data.backgroundOverlayOpacity).toBe(0.5);
      expect(parsed.data.operationalStatus).toBe('none');
      expect(parsed.data.coverImageUrl).toBeUndefined();
    }
  });

  it('incluye el preset gourmet-bakery y beauty-salon en CARD_DESIGN_PRESETS', () => {
    const bakeryPreset = CARD_DESIGN_PRESETS.find((p) => p.id === 'gourmet-bakery');
    expect(bakeryPreset).toBeDefined();
    expect(bakeryPreset?.name).toBe('Gourmet Bakery & Café');
    expect(bakeryPreset?.category).toContain('Gastronomía');
    expect(bakeryPreset?.coverImageUrl).toContain('unsplash');
    expect(bakeryPreset?.operationalStatus).toBe('taking_orders');

    const beautyPreset = CARD_DESIGN_PRESETS.find((p) => p.id === 'beauty-salon');
    expect(beautyPreset).toBeDefined();
    expect(beautyPreset?.name).toBe('Atelier & Beauty Spa');
    expect(beautyPreset?.operationalStatus).toBe('available_by_appointment');
  });

  it('valida que la galería INDUSTRY_COVERS_GALLERY posea items curados de alta definición con URLs seguras', () => {
    expect(INDUSTRY_COVERS_GALLERY.length).toBeGreaterThanOrEqual(5);

    const bakeryItem = INDUSTRY_COVERS_GALLERY.find((i) => i.id === 'bakery-artisan');
    expect(bakeryItem).toBeDefined();
    expect(bakeryItem?.url).toMatch(/^https:\/\//);
    expect(bakeryItem?.suggestedBadge).toContain('Pastelería');

    INDUSTRY_COVERS_GALLERY.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.thumbnail).toMatch(/^https:\/\//);
      expect(item.suggestedPrimaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('valida una tarjeta completa de pastelería dentro de cardFormSchema', () => {
    const bakeryCard = {
      slug: 'dulce-aroma-bakery',
      title: 'Pastelería Dulce Aroma',
      profession: 'Repostería Fina & Tortas de Autor',
      about: 'Especialistas en tortas personalizadas, masas madre y café de grano.',
      phone: '+56998765432',
      whatsapp: '+56998765432',
      emailContact: 'contacto@dulcearoma.cl',
      websiteUrl: 'https://dulcearoma.cl',
      address: 'Calle Los Ciruelos 450, Providencia, Santiago',
      themeConfig: {
        themeId: 'gourmet-bakery',
        primaryColorOklch: '#d97706',
        backgroundColorOklch: '#1c120c',
        cardFinish: 'classic' as const,
        surfaceTexture: 'radial-glow' as const,
        coverImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
        backgroundImageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
        backgroundOverlayBlur: 'deep' as const,
        backgroundOverlayOpacity: 0.7,
        operationalStatus: 'taking_orders' as const,
        customStatusText: '🍰 Pedidos de Tortas Abiertos',
        badgeText: '🍰 Pastelería Artesanal',
      },
    };

    const result = cardFormSchema.safeParse(bakeryCard);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.themeConfig.operationalStatus).toBe('taking_orders');
      expect(result.data.themeConfig.coverImageUrl).toBe('https://images.unsplash.com/photo-1509440159596-0249088772ff');
    }
  });
});
