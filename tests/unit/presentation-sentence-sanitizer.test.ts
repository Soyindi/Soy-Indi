import { describe, it, expect } from 'vitest';
import { sanitizeSentenceClause } from '@/features/orbital-presentations/lib/document-parser';

describe('Presentation Text Sanitizer & Clause Reconstitution', () => {
  it('elimina fragmentos subordinados huérfanos que comienzan con "era mío, sino..."', () => {
    const raw = 'era mío, sino del sistema: el manejo de la información era deficiente';
    const cleaned = sanitizeSentenceClause(raw);
    expect(cleaned).toBe('Del sistema: el manejo de la información era deficiente');
  });

  it('elimina cláusulas huérfanas como "sino que..." y capitaliza el resultado', () => {
    const raw = 'sino que debemos acelerar el despliegue de la infraestructura';
    const cleaned = sanitizeSentenceClause(raw);
    expect(cleaned).toBe('Debemos acelerar el despliegue de la infraestructura');
  });

  it('elimina conjunciones adversativas aisladas como "pero..."', () => {
    const raw = 'pero las estimaciones reflejan una mejora del 40%';
    const cleaned = sanitizeSentenceClause(raw);
    expect(cleaned).toBe('Las estimaciones reflejan una mejora del 40%');
  });

  it('elimina conectores como "por lo tanto" o "ya que"', () => {
    const raw = 'por lo tanto, la rentabilidad anual aumentó un 15%';
    const cleaned = sanitizeSentenceClause(raw);
    expect(cleaned).toBe('La rentabilidad anual aumentó un 15%');
  });

  it('limpia signos de puntuación iniciales redundantes y preserva la oración intacta', () => {
    const raw = '- ,; Definición de arquitectura de sistemas en producción';
    const cleaned = sanitizeSentenceClause(raw);
    expect(cleaned).toBe('Definición de arquitectura de sistemas en producción');
  });

  it('maneja strings vacíos o nulos sin lanzar errores', () => {
    expect(sanitizeSentenceClause('')).toBe('');
    expect(sanitizeSentenceClause('   ')).toBe('');
  });
});
