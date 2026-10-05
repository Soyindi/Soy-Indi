import { describe, it, expect } from 'vitest';
import { 
  generatePresentationSlug,
  isReservedPresentationSlug, 
  generatePresentationSlugAlternatives, 
  RESERVED_PRESENTATION_SLUGS 
} from '@/entities/presentation/schemas';
import { checkPresentationSlugAvailabilityAction } from '@/features/orbital-presentations/actions';

describe('Orbital Presentation Slug Availability & Reserved Routes Protection', () => {
  it('generates clean executive slugs without forced random suffixes by default', () => {
    const slug = generatePresentationSlug('Pitch Deck Serie A 2026');
    expect(slug).toBe('pitch-deck-serie-a-2026');

    const slugProduct = generatePresentationSlug('Lanzamiento Plataforma IA');
    expect(slugProduct).toBe('lanzamiento-plataforma-ia');
  });

  it('allows optional random suffix when explicitly requested', () => {
    const slugWithSuffix = generatePresentationSlug('Pitch Deck Serie A', true);
    expect(slugWithSuffix).toMatch(/^pitch-deck-serie-a-[a-z0-9]{4}$/);
  });

  it('correctly identifies reserved system paths for Presentations', () => {
    expect(isReservedPresentationSlug('admin')).toBe(true);
    expect(isReservedPresentationSlug('dashboard')).toBe(true);
    expect(isReservedPresentationSlug('pricing')).toBe(true);
    expect(isReservedPresentationSlug('api')).toBe(true);
    expect(isReservedPresentationSlug('new')).toBe(true);
    expect(isReservedPresentationSlug('studio')).toBe(true);
    expect(isReservedPresentationSlug('templates')).toBe(true);
    expect(isReservedPresentationSlug('present')).toBe(true);
  });

  it('allows standard deck titles that do not collide with reserved paths', () => {
    expect(isReservedPresentationSlug('pitch-deck-2026')).toBe(false);
    expect(isReservedPresentationSlug('analisis-financiero-q3')).toBe(false);
    expect(isReservedPresentationSlug('estrategia-corporativa')).toBe(false);
  });

  it('generates executive alternative suggestions when a presentation slug is taken or reserved', () => {
    const suggestions = generatePresentationSlugAlternatives('pitch-deck-2026');
    expect(suggestions.length).toBeGreaterThanOrEqual(2);
    expect(suggestions.length).toBeLessThanOrEqual(3);
    
    // Ninguna sugerencia debe colisionar con los slugs reservados
    suggestions.forEach((suggestion) => {
      expect(RESERVED_PRESENTATION_SLUGS.has(suggestion)).toBe(false);
      expect(suggestion).not.toBe('pitch-deck-2026');
    });
  });

  it('handles empty or short slugs gracefully in checkPresentationSlugAvailabilityAction', async () => {
    const shortResult = await checkPresentationSlugAvailabilityAction('ab');
    expect(shortResult.available).toBe(false);
    expect(shortResult.status).toBe('invalid');

    const invalidCharResult = await checkPresentationSlugAvailabilityAction('pitch deck!');
    expect(invalidCharResult.available).toBe(false);
    expect(invalidCharResult.status).toBe('invalid');
  });

  it('flags reserved words as reserved and returns alternative suggestions', async () => {
    const reservedResult = await checkPresentationSlugAvailabilityAction('dashboard');
    expect(reservedResult.available).toBe(false);
    expect(reservedResult.status).toBe('reserved');
    expect(reservedResult.suggestions.length).toBeGreaterThan(0);
  });
});
