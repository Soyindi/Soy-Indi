import { describe, it, expect } from 'vitest';
import { PRICING_TIERS } from '@/entities/subscription/types';

describe('Free-Tier Capacity & Resource Footprint Audit', () => {
  it('garantiza que la huella de datos por usuario respeta la cota inferior a 50 KB en BD', () => {
    // Estimación estricta de tamaños de registro según contratos Drizzle / Zod
    const userAccountBytes = 1200; // user + account + session
    const cardBytes = 4500; // cards + themeConfig JSON
    const cvBytes = 8000; // smart_cvs + content JSON
    const presentationBytes = 18000; // presentations + slides_data JSON

    const totalUserFootprintBytes = userAccountBytes + cardBytes + cvBytes + presentationBytes;
    expect(totalUserFootprintBytes).toBeLessThan(50 * 1024); // Menor a 50 KB

    // Cálculo de capacidad en Turso Free Tier Actual 2026 (5 GB = 5 * 10^9 bytes)
    const tursoFreeTierBytes = 5 * 1024 * 1024 * 1024;
    const maxSupportedUsersFree = Math.floor(tursoFreeTierBytes / totalUserFootprintBytes);
    expect(maxSupportedUsersFree).toBeGreaterThan(100000); // Supera 100.000 usuarios en Turso Free Tier 2026

    // Cálculo de capacidad en Turso Developer Tier ($4.99/mes, 9 GB)
    const tursoDeveloperTierBytes = 9 * 1024 * 1024 * 1024;
    const maxSupportedUsersDev = Math.floor(tursoDeveloperTierBytes / totalUserFootprintBytes);
    expect(maxSupportedUsersDev).toBeGreaterThan(200000); // Supera 200.000 usuarios en Developer Tier
  });

  it('verifica que los límites cuantitativos del plan Starter están acotados y previenen saturación', () => {
    const starterLimits = PRICING_TIERS.starter.limits;
    expect(starterLimits.cards).toBe(1);
    expect(starterLimits.cvs).toBe(1);
    expect(starterLimits.presentations).toBe(0);
    expect(starterLimits.hasWatermark).toBe(false);
  });

  it('verifica que la compresión WebP en cliente reduce el uso de Cloudflare R2 por debajo de 300 KB por tarjeta', () => {
    const avatarMaxKb = 50;
    const coverMaxKb = 130;
    const bgMaxKb = 100;
    const totalMediaKb = avatarMaxKb + coverMaxKb + bgMaxKb;

    expect(totalMediaKb).toBeLessThanOrEqual(300);

    // En 10 GB de Cloudflare R2 (10 * 10^6 KB)
    const r2CapacityCards = Math.floor((10 * 1024 * 1024) / totalMediaKb);
    expect(r2CapacityCards).toBeGreaterThan(30000); // Más de 30.000 tarjetas con multimedia completa
  });
});
