import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PRICING_TIERS } from '@/entities/subscription/types';

describe('Auditoría de Contenido y FAQ de Precios Multi-Tier 2026 (tests/unit)', () => {
  it('FaqAccordion.tsx expone con precisión la estructura del Plan Comunitario Gratuito', () => {
    const faqPath = path.resolve(
      process.cwd(),
      'src/features/pricing/components/FaqAccordion.tsx'
    );
    const content = fs.readFileSync(faqPath, 'utf-8');

    // Validación de plan comunitario gratuito en la respuesta
    expect(content).toContain('Plan Comunitario Gratuito');
    expect(content).toContain('100% gratuito para toda la comunidad');
    expect(content).toContain('1 Tarjeta Digital interactiva con código QR');
    expect(content).toContain('1 Smart CV en PDF adaptado a filtros ATS');

    // Validación de incentivos comunitarios
    expect(content).toContain('Por cada 3 amigos o colegas que se sumen');
    expect(content).toContain('+1 tarjeta extra de forma automática');
  });

  it('el esquema JSON-LD de page.tsx expone la información sincronizada del Plan Comunitario', () => {
    const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('Plan Comunitario Gratuito');
    expect(content).toContain('100% gratuito para la comunidad');
    expect(content).toContain('Membresía Comunitaria');
    expect(content).toContain('Por cada 3 colegas que se sumen con tu enlace');
  });

  it('los precios del catálogo oficial PRICING_TIERS coinciden matemáticamente con los contratos internos', () => {
    expect(PRICING_TIERS.starter.monthly.priceClp).toBe(2500);
    expect(PRICING_TIERS.starter.semiannual.priceClp).toBe(6000);

    expect(PRICING_TIERS.pro.monthly.priceClp).toBe(4990);
    expect(PRICING_TIERS.pro.semiannual.priceClp).toBe(15000);

    expect(PRICING_TIERS.max.monthly.priceClp).toBe(8990);
    expect(PRICING_TIERS.max.semiannual.priceClp).toBe(29990);

    // Cálculo del 25% de comisión mínima (Starter mensual) y máxima (Max semestral)
    const minCommission = Math.round(PRICING_TIERS.starter.monthly.priceClp * 0.25);
    const maxCommission = Math.round(PRICING_TIERS.max.semiannual.priceClp * 0.25);
    expect(minCommission).toBe(625);
    expect(maxCommission).toBe(7498);
  });

  it('TrialBanner.tsx y MobileNavDrawer.tsx reflejan la oferta comunitaria sin fricción', () => {
    const bannerPath = path.resolve(
      process.cwd(),
      'src/features/pricing/components/TrialBanner.tsx'
    );
    const bannerContent = fs.readFileSync(bannerPath, 'utf-8');
    expect(bannerContent).toContain('Plan Comunitario');
    expect(bannerContent).toContain('Membresía Comunitaria');

    const drawerPath = path.resolve(
      process.cwd(),
      'src/shared/ui/MobileNavDrawer.tsx'
    );
    const drawerContent = fs.readFileSync(drawerPath, 'utf-8');
    expect(drawerContent).toContain('Plan Comunitario Gratuito');
  });
});
