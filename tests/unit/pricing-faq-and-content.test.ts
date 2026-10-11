import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PRICING_TIERS } from '@/entities/subscription/types';

describe('Auditoría de Contenido y FAQ de Precios Multi-Tier 2026 (tests/unit)', () => {
  it('FaqAccordion.tsx expone con precisión la estructura de precios de los 3 planes (Starter, Pro, Max) y medios de pago', () => {
    const faqPath = path.resolve(
      process.cwd(),
      'src/features/pricing/components/FaqAccordion.tsx'
    );
    const content = fs.readFileSync(faqPath, 'utf-8');

    // Validación de planes y precios en la respuesta
    expect(content).toContain('Starter por $2.500 CLP/mes');
    expect(content).toContain('Pro (Recomendado) por $4.990 CLP/mes');
    expect(content).toContain('Max por $8.990 CLP/mes');
    expect(content).toContain('$6.000 semestral');
    expect(content).toContain('$15.000 semestral');
    expect(content).toContain('$29.990 semestral');

    // Validación de pasarelas de pago locales chilenas
    expect(content).toContain('Webpay (Flow.cl)');
    expect(content).toContain('Fintoc');
    expect(content).toContain('Mercado Pago');

    // Validación de comisiones de afiliados
    expect(content).toContain('25% de comisión en pesos chilenos');
    expect(content).toContain('desde $625 CLP mensual ($1.500 semestral) en Starter, hasta $2.248 CLP mensual ($7.498 semestral) en Max');
  });

  it('el esquema JSON-LD de page.tsx expone la información sincronizada de planes y pasarelas', () => {
    const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('Starter por $2.500 CLP al mes');
    expect(content).toContain('Pro por $4.990 CLP al mes');
    expect(content).toContain('Max por $8.990 CLP al mes');
    expect(content).toContain('Flow.cl');
    expect(content).toContain('Fintoc A2A');
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

  it('TrialBanner.tsx y MobileNavDrawer.tsx reflejan la oferta de planes desde $2.500/mes', () => {
    const bannerPath = path.resolve(
      process.cwd(),
      'src/features/pricing/components/TrialBanner.tsx'
    );
    const bannerContent = fs.readFileSync(bannerPath, 'utf-8');
    expect(bannerContent).toContain('desde $2.500 / mes');

    const drawerPath = path.resolve(
      process.cwd(),
      'src/shared/ui/MobileNavDrawer.tsx'
    );
    const drawerContent = fs.readFileSync(drawerPath, 'utf-8');
    expect(drawerContent).toContain('desde $2.500/mes (Starter, Pro, Max)');
  });
});
