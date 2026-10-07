import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf-8');

describe('Hero Zero-Media Backdrop (sin splash de logo en móvil ni escritorio)', () => {
  const backdrop = read('src/shared/ui/BrandHeroBackdrop.tsx');
  const home = read('src/app/page.tsx');

  it('BrandHeroBackdrop no renderiza imágenes, pósters ni video', () => {
    expect(backdrop).not.toMatch(/<img\b/);
    expect(backdrop).not.toMatch(/<video\b/);
    expect(backdrop).not.toMatch(/poster=/);
    expect(backdrop).not.toMatch(/brand-reveal|brandRevealVideo|fallbackUrl/);
  });

  it('BrandHeroBackdrop es un Server Component sin JS de cliente', () => {
    expect(backdrop).not.toMatch(/['"]use client['"]/);
    expect(backdrop).not.toMatch(/useEffect|useState|matchMedia/);
  });

  it('BrandHeroBackdrop es decorativo y accesible (aria-hidden)', () => {
    expect(backdrop).toMatch(/aria-hidden="true"/);
    expect(backdrop).toMatch(/pointer-events-none/);
  });

  it('el hero de la home mantiene un único logotipo protagonista', () => {
    const heroStart = home.indexOf('<BrandHeroBackdrop />');
    const heroEnd = home.indexOf('</section>', heroStart);
    const hero = home.slice(heroStart, heroEnd);
    expect(hero.match(/<Image\b/g)?.length ?? 0).toBe(1);
    expect(hero).not.toMatch(/<video\b/);
    expect(hero).not.toMatch(/<BrandLogo\b/);
  });
});
