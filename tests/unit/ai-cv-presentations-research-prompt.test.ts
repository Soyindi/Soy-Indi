import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Deep Research Prompt AI CV & Presentations Specification 2026 (tests/unit)', () => {
  const jsonPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_CV_AND_PRESENTATIONS_AI_2026.json'
  );
  const mdPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_CV_AND_PRESENTATIONS_AI_2026.md'
  );

  it('el archivo JSON de especificación existe y es JSON válido', () => {
    expect(fs.existsSync(jsonPath)).toBe(true);
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    expect(rawContent.length).toBeGreaterThan(1000);

    let parsed: any;
    expect(() => {
      parsed = JSON.parse(rawContent);
    }).not.toThrow();

    expect(parsed).toBeDefined();
    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.title).toContain('Deep Research Maestro');
    expect(parsed.metadata.platform).toBe('INDI (https://soyindi.cl)');
  });

  it('el JSON contiene la configuración de runtime y directivas ejecutivas para Gemini', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    // Directivas de ejecución
    expect(parsed.execution_directives).toBeDefined();
    expect(parsed.execution_directives.role).toContain('Principal AI Architect');
    expect(parsed.execution_directives.role).toContain('Staff NLP Engineer');
    expect(parsed.execution_directives.strict_grounding).toBe(true);
    expect(parsed.execution_directives.zero_hallucination_guarantee).toBe(true);
    expect(parsed.execution_directives.temperature).toBeLessThanOrEqual(0.3);

    // Stack de runtime
    expect(parsed.metadata.runtime_stack).toBeDefined();
    expect(parsed.metadata.runtime_stack.framework).toContain('Next.js 16');
    expect(parsed.metadata.runtime_stack.cv_engine).toContain('Smart CV Engine');
    expect(parsed.metadata.runtime_stack.presentations_engine).toContain('Orbital Presentations');
  });

  it('contempla con rigor los 5 ejes estratégicos de investigación requeridos', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    expect(parsed.research_pillars).toBeInstanceOf(Array);
    expect(parsed.research_pillars.length).toBe(5);

    const pillarIds = parsed.research_pillars.map((p: any) => p.pillar_id);
    expect(pillarIds).toContain('pillar_1_grounding_and_hallucination_elimination');
    expect(pillarIds).toContain('pillar_2_executive_subtraction_and_structural_purity');
    expect(pillarIds).toContain('pillar_3_smart_cv_industrial_refinement');
    expect(pillarIds).toContain('pillar_4_orbital_presentations_mckinsey_scqa');
    expect(pillarIds).toContain('pillar_5_few_shot_contracts_and_json_governance');

    // Eje 1: Grounding y anti-alucinaciones
    const pillar1 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_1_grounding_and_hallucination_elimination');
    const p1Text = JSON.stringify(pillar1);
    expect(p1Text).toContain('Grounding');
    expect(p1Text).toContain('needs_metric');
    expect(p1Text).toContain('EU AI Act');

    // Eje 2: Substracción ejecutiva y eliminación de etiquetas obvias
    const pillar2 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_2_executive_subtraction_and_structural_purity');
    const p2Text = JSON.stringify(pillar2);
    expect(p2Text).toContain('Show, Don\'t Label');
    expect(p2Text).toContain('Action Titles');

    // Eje 3: Smart CV ATS y Google XYZ
    const pillar3 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_3_smart_cv_industrial_refinement');
    const p3Text = JSON.stringify(pillar3);
    expect(p3Text).toContain('Google XYZ');
    expect(p3Text).toContain('ATS');

    // Eje 4: Presentaciones orbitales SCQA
    const pillar4 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_4_orbital_presentations_mckinsey_scqa');
    const p4Text = JSON.stringify(pillar4);
    expect(p4Text).toContain('SCQA');
    expect(p4Text).toContain('16:9');
    expect(p4Text.toLowerCase()).toContain('notas del orador');

    // Eje 5: Esquemas Zod y Few-Shots
    const pillar5 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_5_few_shot_contracts_and_json_governance');
    const p5Text = JSON.stringify(pillar5);
    expect(p5Text).toContain('Zod');
    expect(p5Text).toContain('Few-Shot');
  });

  it('el archivo Markdown complementario existe y contiene las instrucciones para Gemini', () => {
    expect(fs.existsSync(mdPath)).toBe(true);
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain('PROMPT MAESTRO DE DEEP RESEARCH PARA GEMINI');
    expect(mdContent).toContain('EJE 1: ARQUITECTURA DE GROUNDING ESTRICTO');
    expect(mdContent).toContain('EJE 2: SUBSTRACCIÓN EJECUTIVA');
    expect(mdContent).toContain('EJE 3: INGENIERÍA DE PROMPTS PARA SMART CV');
    expect(mdContent).toContain('EJE 4: NARRATIVA SCQA');
    expect(mdContent).toContain('EJE 5: CONTRATOS ESTRUCTURADOS JSON');
  });
});
