import { describe, it, expect } from 'vitest';
import { PRICING_TIERS, PlanTier, calculateTimeRemaining } from '@/entities/subscription/types';
import { POST as flowReturnHandler } from '@/app/checkout/return/flow/route';
import { NextRequest } from 'next/server';

describe('Post-Payment Flow & Return Synchronization (INDI 2026)', () => {
  it('garantiza que calculateTimeRemaining devuelva cálculo determinista y decremento exacto', () => {
    const now = Date.now();
    const future = now + (2 * 24 * 60 * 60 * 1000) + (5 * 60 * 60 * 1000) + (30 * 60 * 1000) + (15 * 1000);
    const breakdown = calculateTimeRemaining(future, now);

    expect(breakdown.isExpired).toBe(false);
    expect(breakdown.days).toBe(2);
    expect(breakdown.hours).toBe(5);
    expect(breakdown.minutes).toBe(30);
    expect(breakdown.seconds).toBe(15);

    // Cuando el tiempo ya pasó
    const past = now - 1000;
    const expiredBreakdown = calculateTimeRemaining(past, now);
    expect(expiredBreakdown.isExpired).toBe(true);
    expect(expiredBreakdown.days).toBe(0);
    expect(expiredBreakdown.hours).toBe(0);
  });

  it('Flow return handler redirige adecuadamente a /checkout/success con HTTP 303', async () => {
    const formData = new FormData();
    formData.append('token', 'flow_test_return_token_123');

    const req = new NextRequest('https://soyindi.cl/checkout/return/flow', {
      method: 'POST',
      body: formData,
    });

    const response = await flowReturnHandler(req);
    expect(response.status).toBe(303);
    const location = response.headers.get('location');
    expect(location).toContain('/checkout/success');
  });

  it('Flow return handler maneja peticiones sin token redirigiendo a error', async () => {
    const formData = new FormData();

    const req = new NextRequest('https://soyindi.cl/checkout/return/flow', {
      method: 'POST',
      body: formData,
    });

    const response = await flowReturnHandler(req);
    expect(response.status).toBe(303);
    const location = response.headers.get('location');
    expect(location).toContain('/checkout/success?error=missing_token');
  });

  it('todos los tiers de precios cuentan con estructura íntegra para facturación mensual y semestral', () => {
    const tiers: PlanTier[] = ['starter', 'pro', 'max'];
    for (const t of tiers) {
      const config = PRICING_TIERS[t];
      expect(config.monthly.priceClp).toBeGreaterThan(0);
      expect(config.semiannual.priceClp).toBeGreaterThan(0);
      expect(config.limits.hasWatermark).toBe(false);
    }
  });
});
