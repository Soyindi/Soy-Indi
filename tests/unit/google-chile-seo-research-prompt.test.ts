import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Google Chile SEO #1 Deep Research Prompt Specification (tests/unit)', () => {
  const jsonPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_GOOGLE_CHILE_SEO_NO1_2026.json'
  );
  const mdPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_GOOGLE_CHILE_SEO_NO1_2026.md'
  );

  it('el archivo JSON de especificación existe y es un JSON válido', () => {
    expect(fs.existsSync(jsonPath)).toBe(true);
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    expect(rawContent.length).toBeGreaterThan(1000);

    let parsed: any;
    expect(() => {
      parsed = JSON.parse(rawContent);
    }).not.toThrow();

    expect(parsed).toBeDefined();
    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.title).toContain('Google Chile');
    expect(parsed.metadata.platform).toBe('INDI (https://soyindi.cl)');
    expect(parsed.metadata.canonical_specification).toContain('PROMPT_GEMINI_DEEP_RESEARCH_GOOGLE_CHILE_SEO_NO1_2026.json');
  });

  it('el JSON contiene la configuración de runtime y directivas ejecutivas para Gemini', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    // Directivas ejecutivas
    expect(parsed.execution_directives).toBeDefined();
    expect(parsed.execution_directives.role).toContain('Principal SEO Architect');
    expect(parsed.execution_directives.role).toContain('VP of Organic Growth');
    expect(parsed.execution_directives.objective).toContain('https://soyindi.cl');
    expect(parsed.execution_directives.objective).toContain('Google Chile');
    expect(parsed.execution_directives.temperature).toBeLessThanOrEqual(0.3);

    // Stack de runtime
    expect(parsed.metadata.runtime_stack).toBeDefined();
    expect(parsed.metadata.runtime_stack.framework).toContain('Next.js 16');
    expect(parsed.metadata.runtime_stack.styling).toContain('Tailwind CSS v4');
    expect(parsed.metadata.runtime_stack.persistence).toContain('Turso');
    expect(parsed.metadata.runtime_stack.market_scope).toContain('Chile');
  });

  it('declara rigurosamente los 6 ejes estratégicos de investigación para posicionamiento #1', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    expect(parsed.research_pillars).toBeInstanceOf(Array);
    expect(parsed.research_pillars.length).toBe(6);

    const pillarIds = parsed.research_pillars.map((p: any) => p.pillar_id);
    expect(pillarIds).toContain('pillar_1_chile_market_intent_and_keyword_matrix');
    expect(pillarIds).toContain('pillar_2_nextjs_technical_seo_and_core_web_vitals');
    expect(pillarIds).toContain('pillar_3_programmatic_seo_and_landing_architecture');
    expect(pillarIds).toContain('pillar_4_structured_data_and_ai_overviews');
    expect(pillarIds).toContain('pillar_5_chilean_backlink_authority_and_digital_pr');
    expect(pillarIds).toContain('pillar_6_execution_roadmap_and_kpi_dashboard');

    // Valida que cada pilar tenga títulos y alcances definidos
    parsed.research_pillars.forEach((pillar: any) => {
      expect(pillar.title).toBeDefined();
      expect(pillar.scope).toBeInstanceOf(Array);
      expect(pillar.scope.length).toBeGreaterThan(0);
    });
  });

  it('el archivo Markdown complementario existe y contiene el prompt estructurado con todas las directivas clave', () => {
    expect(fs.existsSync(mdPath)).toBe(true);
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain('Prompt Maestro de Deep Research');
    expect(mdContent).toContain('google.cl');
    expect(mdContent).toContain('https://soyindi.cl');
    expect(mdContent).toContain('Next.js 16 App Router');
    expect(mdContent).toContain('ARQUEOLOGÍA DE INTENCIÓN DE BÚSQUEDA');
    expect(mdContent).toContain('SEO TÉCNICO PERIMETRAL');
    expect(mdContent).toContain('SEO PROGRAMÁTICO');
    expect(mdContent).toContain('DATOS ESTRUCTURADOS JSON-LD');
    expect(mdContent).toContain('AUTORIDAD DE DOMINIO LOCAL (.CL)');
    expect(mdContent).toContain('PLAN DE ACCIÓN CRONOLÓGICO A 90 DÍAS');
  });
});
