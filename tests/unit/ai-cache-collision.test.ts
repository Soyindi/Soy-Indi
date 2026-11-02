import { describe, it, expect } from 'vitest';
import { generateRequestKey, getCachedResponse, setCachedResponse } from '@/shared/lib/aiCircuitBreaker';
import { rewriteCvSectionAction } from '@/features/ai-smart-cv/actions';

describe('AI Cache Collision & Experience Isolation Audit (INDI 2026)', () => {
  const longSystemPrompt = `Eres un Redactor Ejecutivo y Estratega de Empleabilidad de nivel mundial especializado en currículums para el estándar corporativo 2026.
ARQUETIPO DEL CANDIDATO: TECNOLOGÍA E INGENIERÍA
TONO RECOMENDADO: Ejecutivo
PALABRAS CLAVE DEL SECTOR: Microservicios, Arquitectura Cloud, Resiliencia, Observabilidad, PostgreSQL, TypeScript, CI/CD, DevOps, Escalabilidad, Seguridad, Docker, Kubernetes.
REGLAS DE ORO OBLIGATORIAS:
1. STRICT ZERO-HALLUCINATION: No inventes métricas específicas que el usuario NO haya proporcionado.
2. Si es una viñeta laboral, aplica la fórmula de Google XYZ: "Logré [X], medido por [Y], mediante [Z]".
3. Mantén estricta coherencia con el contexto provisto.
4. Devuelve ÚNICAMENTE un objeto JSON válido con la clave "suggestions", conteniendo un array de exactamente 3 variantes distintas.`;

  it('garantiza claves SHA-256 distintas para prompts largos con diferente contenido de experiencia', () => {
    // Experiencia 1: Complejo Penitenciario Castro
    const msgsExp1 = [
      { role: 'system', content: longSystemPrompt },
      {
        role: 'user',
        content: `CONTEXTO LABORAL: Cargo "Enfermero Clínico", Empresa "Complejo Penitenciario Castro". VIÑETA: "Atención de urgencia y curaciones avanzadas".`,
      },
    ];

    // Experiencia 2: Cuidados Paliativos Universales
    const msgsExp2 = [
      { role: 'system', content: longSystemPrompt },
      {
        role: 'user',
        content: `CONTEXTO LABORAL: Cargo "Coordinador de Salud", Empresa "Cuidados Paliativos Universales". VIÑETA: "Gestión de visitas domiciliarias y fichas clínicas".`,
      },
    ];

    const key1 = generateRequestKey(msgsExp1, { responseFormat: { type: 'json_object' } });
    const key2 = generateRequestKey(msgsExp2, { responseFormat: { type: 'json_object' } });

    // Ambas claves deben ser hashes SHA-256 de 64 caracteres
    expect(key1).toHaveLength(64);
    expect(key2).toHaveLength(64);

    // Deben ser 100% distintas, previniendo la colisión de micro-caché y el cruce de experiencias
    expect(key1).not.toBe(key2);
  });

  it('garantiza que la micro-caché en memoria aísla las respuestas por clave hash SHA-256', () => {
    const msgsA = [
      { role: 'system', content: longSystemPrompt },
      { role: 'user', content: 'Cargo: Analista de Finanzas, Viñeta: Conciliación bancaria' },
    ];
    const msgsB = [
      { role: 'system', content: longSystemPrompt },
      { role: 'user', content: 'Cargo: Jefe de Bodega, Viñeta: Control de inventario' },
    ];

    const keyA = generateRequestKey(msgsA);
    const keyB = generateRequestKey(msgsB);

    setCachedResponse(keyA, 'Respuesta exclusiva para Finanzas', 'gemini-flash');

    expect(getCachedResponse(keyA)?.content).toBe('Respuesta exclusiva para Finanzas');
    expect(getCachedResponse(keyB)).toBeNull(); // No debe compartir caché bajo ninguna circunstancia
  });

  it('garantiza que el fallback determinista para viñetas utiliza el cargo de la experiencia y no el targetRole global', async () => {
    // Si el usuario postula a "Jefe de Operaciones" (targetRole), pero esta experiencia es de "Cajero" en "Supermercados Líder"
    const result = await rewriteCvSectionAction({
      text: 'Atención a clientes en caja y cuadratura diaria',
      type: 'BULLET',
      mode: 'XYZ_IMPACT',
      targetRole: 'Jefe de Operaciones Global',
      role: 'Cajero Polifuncional',
      company: 'Supermercados Líder',
    });

    expect(result.success).toBe(true);
    expect(result.suggestions).toHaveLength(3);

    // Las sugerencias deben mencionar la empresa específica y el rol de esta experiencia concreta
    const joined = result.suggestions.join(' ');
    expect(joined).toContain('Supermercados Líder');
    expect(joined).toContain('Cajero Polifuncional');

    // No debe forzar el targetRole ajeno en las viñetas del cargo de Cajero
    expect(joined).not.toContain('para Jefe de Operaciones Global');
  });

  it('permite que el resumen ejecutivo (SUMMARY) sí incorpore el targetRole como objetivo de carrera', async () => {
    const result = await rewriteCvSectionAction({
      text: 'Profesional proactivo con ganas de aprender y aportar al equipo',
      type: 'SUMMARY',
      mode: 'EXECUTIVE',
      targetRole: 'Director de Ciberseguridad',
      role: 'Analista SOC',
      company: 'Banco de Chile',
    });

    expect(result.success).toBe(true);
    expect(result.suggestions).toHaveLength(3);

    const joined = result.suggestions.join(' ');
    expect(joined).toContain('Director de Ciberseguridad');
  });
});
