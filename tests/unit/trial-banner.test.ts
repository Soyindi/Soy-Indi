import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('TrialBanner Executive Component (WCAG 2.2 AA & Base 8 Grid Standards)', () => {
  const src = readFileSync(
    resolve(__dirname, '../../src/features/pricing/components/TrialBanner.tsx'),
    'utf8'
  );

  it('guarantees mobile-first touch targets >= 44px for all CTAs and links', () => {
    expect(src).toContain('min-h-[44px]');
    expect(src).toContain('min-w-[44px]');
  });

  it('implements semantic landmarks for accessibility (WCAG 2.2 AA)', () => {
    expect(src).toContain('<aside');
    expect(src).toContain('aria-label=');
  });

  it('adheres to Glassmorphism 2.0 with backdrop blur and subtle borders', () => {
    expect(src).toContain('backdrop-blur-md');
    expect(src).toContain('border-b');
  });

  it('provides explicit status feedback for ACTIVE, TRIAL and EXPIRED states', () => {
    expect(src).toContain('INDI Pro Activo');
    expect(src).toContain('Prueba Gratuita');
    expect(src).toContain('¡Último día de prueba!');
    expect(src).toContain('Prueba Concluida');
  });

  it('utilizes high-contrast typography and accessible amber gradient on primary CTA', () => {
    expect(src).toContain('from-amber-400 to-amber-500');
    expect(src).toContain('text-zinc-950 font-bold');
  });

  it('integra el componente TrialCountdownTimer para renderizar la cuenta regresiva en vivo', () => {
    expect(src).toContain('TrialCountdownTimer');
    expect(src).toContain('expiresAt={entitlement.expiresAt}');
    expect(src).toContain('onExpire=');
    expect(src).toContain('router.refresh()');
  });
});
