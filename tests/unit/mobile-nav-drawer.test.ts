import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Regresión: el <header> usa backdrop-filter, que crea un containing block
 * para descendientes `position: fixed`. El drawer móvil debe renderizarse
 * vía portal en document.body o queda confinado a la altura del header.
 */
describe('MobileNavDrawer — portal fuera del header', () => {
  const src = readFileSync(resolve(__dirname, '../../src/shared/ui/MobileNavDrawer.tsx'), 'utf8');

  it('renderiza el panel con createPortal en document.body', () => {
    expect(src).toContain("from 'react-dom'");
    expect(src).toMatch(/createPortal\([\s\S]*document\.body/);
  });

  it('expone semántica de diálogo modal accesible', () => {
    expect(src).toContain('role="dialog"');
    expect(src).toContain('aria-modal="true"');
  });
});
