import { describe, it, expect } from 'vitest';
import { slugifyCardName, generateCardSlug, cardFormSchema } from '@/entities/card/schemas';

describe('Card Slug Engine & Normalization', () => {
  it('normalizes common names with accents and special characters', () => {
    expect(slugifyCardName('Carlos Mendoza')).toBe('carlos-mendoza');
    expect(slugifyCardName('Dr. René González!')).toBe('dr-rene-gonzalez');
    expect(slugifyCardName('María José Nuñez')).toBe('maria-jose-nunez');
  });

  it('collapses multiple whitespace, hyphens and punctuation cleanly', () => {
    expect(slugifyCardName('Matías    Riquelme')).toBe('matias-riquelme');
    expect(slugifyCardName('---Andrés---Silva---')).toBe('andres-silva');
    expect(slugifyCardName('Software / AI & Cloud Engineer')).toBe('software-ai-cloud-engineer');
  });

  it('provides a resilient fallback when name is empty or only special characters', () => {
    expect(slugifyCardName('')).toBe('tarjeta');
    expect(slugifyCardName('   ')).toBe('tarjeta');
    expect(slugifyCardName('!@#$%^&*()')).toBe('tarjeta');
  });

  it('generates a clean card slug without suffix by default', () => {
    const slug = generateCardSlug('Valentina Castro');
    expect(slug).toBe('valentina-castro');
  });

  it('generates a unique card slug with suffix when requested', () => {
    const slug = generateCardSlug('Valentina Castro', true);
    expect(slug).toMatch(/^valentina-castro-[a-z0-9]{4}$/);
  });

  it('validates normalized slugs against cardFormSchema', () => {
    const validSlug = slugifyCardName('Carlos Mendoza');
    const result = cardFormSchema.shape.slug.safeParse(validSlug);
    expect(result.success).toBe(true);
  });
});
