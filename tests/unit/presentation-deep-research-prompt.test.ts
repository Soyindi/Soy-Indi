import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Intelligent Presentations Deep Research Prompt 2026 (tests/unit)', () => {
  const jsonPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_INTELLIGENT_PRESENTATIONS_INFRASTRUCTURE_2026.json'
  );
  const mdPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_INTELLIGENT_PRESENTATIONS_INFRASTRUCTURE_2026.md'
  );

  it('el archivo JSON de especificación existe y es JSON válido', () => {
    expect(fs.existsSync(jsonPath)).toBe(true);
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    expect(rawContent.length).toBeGreaterThan(500);

    let parsed: any;
    expect(() => {
      parsed = JSON.parse(rawContent);
    }).not.toThrow();

    expect(parsed).toBeDefined();
    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.title).toContain('NotebookLM');
    expect(parsed.metadata.platform).toBe('INDI (https://soyindi.cl)');
  });

  it('el archivo Markdown del prompt maestro existe y contiene las instrucciones para Gemini', () => {
    expect(fs.existsSync(mdPath)).toBe(true);
    const mdContent = fs.readFileSync(mdPath, 'utf-8');

    expect(mdContent).toContain('NOTEBOOKLM');
    expect(mdContent).toContain('EJE 1: ARQUITECTURA COGNITIVA TIPO NOTEBOOKLM');
    expect(mdContent).toContain('EJE 2: AGENTES AUTÓNOMOS VS. SKILLS ESPECIALIZADAS');
    expect(mdContent).toContain('EJE 3: DEL TEXTO PLANO AL LIENZO 16:9');
    expect(mdContent).toContain('EJE 4: INFRAESTRUCTURA EFICIENTE');
    expect(mdContent).toContain('EJE 5: CONTRATOS TÉCNICOS');
  });

  it('el JSON contiene los 5 ejes estratégicos de investigación requeridos', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    expect(parsed.research_pillars).toBeInstanceOf(Array);
    expect(parsed.research_pillars.length).toBe(5);

    const pillarIds = parsed.research_pillars.map((p: any) => p.pillar_id);
    expect(pillarIds).toContain('pillar_1_notebooklm_cognitive_architecture');
    expect(pillarIds).toContain('pillar_2_agents_vs_skills_decision_matrix');
    expect(pillarIds).toContain('pillar_3_document_to_canvas_distillation');
    expect(pillarIds).toContain('pillar_4_efficient_infrastructure_and_latency');
    expect(pillarIds).toContain('pillar_5_production_prompt_and_contracts');
  });

  it('declara correctamente el stack de runtime de Next.js 16 y los roles de orquestación', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    expect(parsed.metadata.runtime_stack.framework).toContain('Next.js 16');
    expect(parsed.metadata.runtime_stack.persistence).toContain('Turso');
    expect(parsed.execution_directives.role).toContain('Principal AI Architect');
    expect(parsed.execution_directives.temperature).toBeLessThanOrEqual(0.3);
  });
});
