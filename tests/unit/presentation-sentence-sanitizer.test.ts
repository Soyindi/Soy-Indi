import { describe, it, expect } from 'vitest';
import {
  sanitizeSentenceClause,
  splitSentencesSafely,
  truncateByWordBoundary,
} from '@/features/orbital-presentations/lib/document-parser';

describe('Presentation Text Sanitizer & Clause Reconstitution', () => {
  it('reconstituye sujeto contextual ante fragmentos que arrancan con "era mío, sino del sistema..."', () => {
    const raw = 'era mío, sino del sistema: el manejo de la información era deficiente';
    const cleaned = sanitizeSentenceClause(raw);
    expect(cleaned).toBe('El sistema presentó: el manejo de la información era deficiente');
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

  it('divide oraciones respetando abreviaturas sin partirlas por el punto', () => {
    const text = 'Tenemos varios desafíos, ejp. el despliegue continuo de microservicios. Además la tasa de conversión subió a 4.5% anual.';
    const parts = splitSentencesSafely(text);
    expect(parts.length).toBe(2);
    expect(parts[0]).toContain('ejp. el despliegue continuo');
    expect(parts[1]).toContain('4.5% anual');
  });

  it('trunca por límite de palabra completa sin cortar palabras al medio', () => {
    const longText = 'La implementación de la arquitectura distribuida en nodos perimetrales permite garantizar una latencia inferior a cincuenta milisegundos en todas las regiones.';
    const truncated = truncateByWordBoundary(longText, 60);
    expect(truncated.endsWith('...')).toBe(true);
    // No debe terminar cortando una palabra como "distrib..."
    expect(truncated).not.toContain('distrib...');
  });

  it('maneja strings vacíos o nulos sin lanzar errores', () => {
    expect(sanitizeSentenceClause('')).toBe('');
    expect(sanitizeSentenceClause('   ')).toBe('');
  });
});
