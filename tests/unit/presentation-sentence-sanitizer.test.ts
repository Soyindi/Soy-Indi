import { describe, it, expect } from 'vitest';
import {
  sanitizeSentenceClause,
  splitSentencesSafely,
  truncateByWordBoundary,
  cleanAdministrativePreamble,
  stripAdministrativePrefix,
  synthesizeConciseActionTitle,
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

  it('purga rótulos de formulario y preámbulos administrativos con cleanAdministrativePreamble', () => {
    const rawAdmin = 'Texto 1: Expectativas académicas Programa: PPGSP Candidato: Matías Ricardo Riquelme Cárdenas • Nivel: Maestría Lo que más me marcó del trabajo penitenciario fue la falta de oportunidades.';
    const cleaned = cleanAdministrativePreamble(rawAdmin);
    expect(cleaned).not.toContain('Texto 1:');
    expect(cleaned).not.toContain('Candidato:');
    expect(cleaned).not.toContain('Programa:');
    expect(cleaned).toContain('Lo que más me marcó del trabajo penitenciario');
  });

  it('remueve prefijos administrativos simples con stripAdministrativePrefix', () => {
    const pref = 'Texto 1: Expectativas académicas e intereses';
    expect(stripAdministrativePrefix(pref)).toBe('Expectativas académicas e intereses');

    const cand = 'Candidato: Juan Pérez • Proyecto de Tesis';
    expect(stripAdministrativePrefix(cand)).toBe('Proyecto de Tesis');
  });

  it('sintetiza Action Titles concisos (<15 palabras) con synthesizeConciseActionTitle', () => {
    const longParagraph = 'Texto 1: Expectativas académicas, intereses y perspectivas de retorno Programa: PPGSP Candidato: Matías Ricardo Riquelme Cárdenas • Nivel: Maestría Lo que más me marcó del trabajo penitenciario, en Concepción, fue ver otra realidad y los prejuicios que muchas veces cargan las personas.';
    const actionTitle = synthesizeConciseActionTitle(longParagraph);
    const wordCount = actionTitle.split(/\s+/).length;

    expect(wordCount).toBeLessThanOrEqual(15);
    expect(actionTitle).not.toContain('Texto 1:');
    expect(actionTitle).not.toContain('Candidato:');
    expect(actionTitle.length).toBeGreaterThan(10);
  });

  it('maneja strings vacíos o nulos sin lanzar errores', () => {
    expect(sanitizeSentenceClause('')).toBe('');
    expect(sanitizeSentenceClause('   ')).toBe('');
    expect(cleanAdministrativePreamble('')).toBe('');
    expect(stripAdministrativePrefix('')).toBe('');
    expect(synthesizeConciseActionTitle('')).toBe('Conclusión y síntesis estratégica');
  });
});
