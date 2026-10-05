import { describe, it, expect } from 'vitest';
import { 
  generateCvSlug,
  isReservedCvSlug, 
  generateCvSlugAlternatives, 
  RESERVED_CV_SLUGS 
} from '@/entities/cv/schemas';
import { checkCvSlugAvailabilityAction } from '@/features/ai-smart-cv/actions';

describe('Smart CV Slug Availability & Reserved Routes Protection', () => {
  it('generates clean executive slugs without forced random suffixes by default', () => {
    const slug = generateCvSlug('Matías Riquelme');
    expect(slug).toBe('matias-riquelme');

    const slugRole = generateCvSlug('Ingeniero de Software Senior');
    expect(slugRole).toBe('ingeniero-de-software-senior');
  });

  it('allows optional random suffix when explicitly requested', () => {
    const slugWithSuffix = generateCvSlug('Matías Riquelme', true);
    expect(slugWithSuffix).toMatch(/^matias-riquelme-[a-z0-9]{4}$/);
  });

  it('correctly identifies reserved system paths for CV', () => {
    expect(isReservedCvSlug('admin')).toBe(true);
    expect(isReservedCvSlug('dashboard')).toBe(true);
    expect(isReservedCvSlug('pricing')).toBe(true);
    expect(isReservedCvSlug('api')).toBe(true);
    expect(isReservedCvSlug('new')).toBe(true);
    expect(isReservedCvSlug('preview')).toBe(true);
    expect(isReservedCvSlug('ats')).toBe(true);
    expect(isReservedCvSlug('login')).toBe(true);
  });

  it('allows standard user names that do not collide with reserved paths', () => {
    expect(isReservedCvSlug('carlos-mendoza')).toBe(false);
    expect(isReservedCvSlug('matias-riquelme')).toBe(false);
    expect(isReservedCvSlug('valeria-araya-lead')).toBe(false);
  });

  it('generates executive alternative suggestions when a CV slug is taken or reserved', () => {
    const suggestions = generateCvSlugAlternatives('carlos-mendoza', 'Senior Architect');
    expect(suggestions.length).toBeGreaterThanOrEqual(2);
    expect(suggestions.length).toBeLessThanOrEqual(3);
    
    // Ninguna sugerencia debe colisionar con los slugs reservados
    suggestions.forEach((suggestion) => {
      expect(RESERVED_CV_SLUGS.has(suggestion)).toBe(false);
      expect(suggestion).not.toBe('carlos-mendoza');
    });
  });

  it('handles empty or short slugs gracefully in checkCvSlugAvailabilityAction', async () => {
    const shortResult = await checkCvSlugAvailabilityAction('ab');
    expect(shortResult.available).toBe(false);
    expect(shortResult.status).toBe('invalid');

    const invalidCharResult = await checkCvSlugAvailabilityAction('matias riquelme!');
    expect(invalidCharResult.available).toBe(false);
    expect(invalidCharResult.status).toBe('invalid');
  });

  it('flags reserved words as reserved and returns alternative suggestions', async () => {
    const reservedResult = await checkCvSlugAvailabilityAction('dashboard');
    expect(reservedResult.available).toBe(false);
    expect(reservedResult.status).toBe('reserved');
    expect(reservedResult.suggestions.length).toBeGreaterThan(0);
  });
});
