import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf-8');

describe('Identidad Visual y Precarga Cinemática de Clase Mundial (INDI 2026)', () => {
  const preloader = read('src/shared/ui/SmartPreloader.tsx');
  const heroIdentity = read('src/shared/ui/HeroBrandIdentity.tsx');
  const layout = read('src/app/layout.tsx');
  const iconSvg = read('src/app/icon.svg');

  it('SmartPreloader implementa máscara radial continua fotónica (Zero-Box Masking)', () => {
    expect(preloader).toContain('maskImage');
    expect(preloader).toContain('WebkitMaskImage');
    expect(preloader).toContain('radial-gradient');
    // Verifica que use los formatos de video livianos oficiales
    expect(preloader).toContain('/brand/indi-logo-animated.webm');
    expect(preloader).toContain('/brand/indi-logo-animated.mp4');
  });

  it('SmartPreloader cumple con accesibilidad WCAG 2.2 AA', () => {
    expect(preloader).toContain('role="status"');
    expect(preloader).toContain('aria-live="polite"');
    expect(preloader).toContain('INDI · IDENTITY EDGE');
  });

  it('HeroBrandIdentity elimina el logo tosco cuadrado mediante máscara radial y video cinemático', () => {
    expect(heroIdentity).toContain('maskImage');
    expect(heroIdentity).toContain('radial-gradient');
    expect(heroIdentity).toContain('/brand/indi-logo-animated.webm');
    expect(heroIdentity).toContain('/brand/indi-logo-animated.mp4');
    // Fallback accesible para movimiento reducido
    expect(heroIdentity).toContain('motion-reduce:block');
    expect(heroIdentity).toContain('/brand/indi-isotipo-transparent.svg');
    // Cero cajas rígidas aspect-[768/640]
    expect(heroIdentity).not.toContain('aspect-[768/640]');
  });

  it('todas las rutas públicas cuentan con pantalla de precarga reactiva loading.tsx montando SmartPreloader', () => {
    const cardLoading = read('src/app/c/[slug]/loading.tsx');
    const cvLoading = read('src/app/cv/[slug]/loading.tsx');
    const presLoading = read('src/app/p/[slug]/loading.tsx');
    const globalLoading = read('src/app/loading.tsx');

    expect(cardLoading).toContain('SmartPreloader');
    expect(cvLoading).toContain('SmartPreloader');
    expect(presLoading).toContain('SmartPreloader');
    expect(globalLoading).toContain('SmartPreloader');
  });

  it('layout.tsx declara viewport con themeColor #080A12 para sincronizar la barra móvil del navegador', () => {
    expect(layout).toContain('export const viewport: Viewport');
    expect(layout).toContain("themeColor: '#080A12'");
    expect(layout).toContain("colorScheme: 'dark'");
  });

  it('icon.svg utiliza geometría circular orgánica eliminando rectángulos cuadrados rígidos', () => {
    expect(iconSvg).toContain('<circle cx="32" cy="32" r="30"');
    expect(iconSvg).not.toContain('<rect x="2" y="2" width="60" height="60"');
  });
});
