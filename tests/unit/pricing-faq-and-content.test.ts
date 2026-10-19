import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PRICING_TIERS } from '@/entities/subscription/types';

describe('Auditoría de Contenido y FAQ de Precios Multi-Tier 2026 (tests/unit)', () => {
  it('FaqAccordion.tsx expone con precisión la estructura del Plan Comunitario Gratuito y lista de espera Pro/Max', () => {
    const faqPath = path.resolve(
      process.cwd(),
      'src/features/pricing/components/FaqAccordion.tsx'
    );
    const content = fs.readFileSync(faqPath, 'utf-8');

    // Validación de planes comunitarios y lista de espera en la respuesta
    expect(content).toContain('Plan Comunitario Gratuito');
    expect(content).toContain('Plan Starter es 100% gratuito para la comunidad');
    expect(content).toContain('Pro ($4.990 CLP/mes o $15.000 semestral)');
    expect(content).toContain('Max ($8.990 CLP/mes o $29.990 semestral)');
    expect(content).toContain('lista de espera con acceso anticipado');

    // Validación de comisiones de afiliados
    expect(content).toContain('25% de comisión en pesos chilenos');
    expect(content).toContain('Por cada 3 amigos que se sumen');
  });

  it('el esquema JSON-LD de page.tsx expone la información sincronizada del Plan Comunitario y planes Pro', () => {
    const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('Plan Comunitario Gratuito');
    expect(content).toContain('Plan Starter es 100% gratuito para la comunidad');
    expect(content).toContain('Pro ($4.990 CLP al mes o $15.000 semestral)');
    expect(content).toContain('Max ($8.990 CLP al mes o $29.990 semestral)');
    expect(content).toContain('25% de comisión en los planes avanzados');
  });

  it('los precios del catálogo oficial PRICING_TIERS coinciden matemáticamente con los textos de FAQ', () => {
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
    expect(maxCommission).toBe(7498); // o Math.floor(29990 * 0.25) = 7497.5
  });

  it('TrialBanner.tsx y MobileNavDrawer.tsx reflejan la oferta comunitaria y planes Pro', () => {
    const bannerPath = path.resolve(
      process.cwd(),
      'src/features/pricing/components/TrialBanner.tsx'
    );
    const bannerContent = fs.readFileSync(bannerPath, 'utf-8');
    expect(bannerContent).toContain('Planes Pro');

    const drawerPath = path.resolve(
      process.cwd(),
      'src/shared/ui/MobileNavDrawer.tsx'
    );
    const drawerContent = fs.readFileSync(drawerPath, 'utf-8');
    expect(drawerContent).toContain('Plan Comunitario Gratuito');
  });
});
