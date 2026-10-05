import { describe, it, expect } from 'vitest';
import { 
  isReservedCardSlug, 
  generateSlugAlternatives, 
  RESERVED_CARD_SLUGS 
} from '@/entities/card/schemas';
import { checkCardSlugAvailabilityAction } from '@/features/card-builder/actions';

describe('Smart Card Slug Availability & Reserved Routes Protection', () => {
  it('correctly identifies reserved system paths', () => {
    expect(isReservedCardSlug('admin')).toBe(true);
    expect(isReservedCardSlug('dashboard')).toBe(true);
    expect(isReservedCardSlug('pricing')).toBe(true);
    expect(isReservedCardSlug('api')).toBe(true);
    expect(isReservedCardSlug('cv')).toBe(true);
    expect(isReservedCardSlug('presentations')).toBe(true);
    expect(isReservedCardSlug('login')).toBe(true);
  });

  it('allows standard user names that do not collide with reserved paths', () => {
    expect(isReservedCardSlug('carlos-mendoza')).toBe(false);
    expect(isReservedCardSlug('matias-riquelme')).toBe(false);
    expect(isReservedCardSlug('dr-rodrigo-vega')).toBe(false);
  });

  it('generates 3 executive alternative suggestions when a slug is taken', () => {
    const suggestions = generateSlugAlternatives('carlos-mendoza', 'Especialista en Marketing');
    expect(suggestions.length).toBeGreaterThanOrEqual(2);
    expect(suggestions.length).toBeLessThanOrEqual(3);
    
    // Ninguna sugerencia debe colisionar con los slugs reservados
    suggestions.forEach((suggestion) => {
      expect(RESERVED_CARD_SLUGS.has(suggestion)).toBe(false);
      expect(suggestion).not.toBe('carlos-mendoza');
    });
  });

  it('handles empty or short slugs gracefully in checkCardSlugAvailabilityAction', async () => {
    const shortResult = await checkCardSlugAvailabilityAction('ab');
    expect(shortResult.available).toBe(false);
    expect(shortResult.status).toBe('invalid');

    const invalidCharResult = await checkCardSlugAvailabilityAction('carlos mendoza!');
    expect(invalidCharResult.available).toBe(false);
    expect(invalidCharResult.status).toBe('invalid');
  });

  it('flags reserved words as reserved and returns alternative suggestions', async () => {
    const reservedResult = await checkCardSlugAvailabilityAction('dashboard');
    expect(reservedResult.available).toBe(false);
    expect(reservedResult.status).toBe('reserved');
    expect(reservedResult.suggestions.length).toBeGreaterThan(0);
  });
});
