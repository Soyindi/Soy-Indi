import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Deep Research Prompt JSON Specification 2026 (tests/unit)', () => {
  const jsonPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.json'
  );
  const mdPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.md'
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
    expect(parsed.metadata.title).toContain('Deep Research');
    expect(parsed.metadata.platform).toBe('INDI (https://soyindi.cl)');
  });

  it('el JSON contiene la configuración de runtime y directivas ejecutivas para Gemini', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    // Directivas de ejecución
    expect(parsed.execution_directives).toBeDefined();
    expect(parsed.execution_directives.role).toContain('Principal Design Technologist');
    expect(parsed.execution_directives.role).toContain('Head of SEO');
    expect(parsed.execution_directives.role).toContain('Executive Product Strategist');
    expect(parsed.execution_directives.temperature).toBeLessThanOrEqual(0.3);

    // Stack de runtime
    expect(parsed.metadata.runtime_stack).toBeDefined();
    expect(parsed.metadata.runtime_stack.framework).toContain('Next.js 16');
    expect(parsed.metadata.runtime_stack.framework).toContain('React 19');
    expect(parsed.metadata.runtime_stack.styling).toContain('Tailwind CSS v4');
    expect(parsed.metadata.runtime_stack.styling).toContain('OKLCH');
    expect(parsed.metadata.runtime_stack.persistence).toContain('Turso');
  });

  it('contempla con rigor los 5 ejes estratégicos de investigación requeridos', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    expect(parsed.research_pillars).toBeInstanceOf(Array);
    expect(parsed.research_pillars.length).toBe(5);

    const pillarIds = parsed.research_pillars.map((p: any) => p.pillar_id);
    expect(pillarIds).toContain('pillar_1_visual_sharing_previews');
    expect(pillarIds).toContain('pillar_2_world_class_favicon');
    expect(pillarIds).toContain('pillar_3_google_seo_programmatic');
    expect(pillarIds).toContain('pillar_4_ceo_growth_strategy');
    expect(pillarIds).toContain('pillar_5_smart_cv_and_presentations_experience');

    // Eje 1: Previews virales, Open Graph, WhatsApp, iMessage, @vercel/og
    const pillar1 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_1_visual_sharing_previews');
    const p1Text = JSON.stringify(pillar1);
    expect(p1Text).toContain('WhatsApp');
    expect(p1Text).toContain('LinkedIn');
    expect(p1Text).toContain('@vercel/og');
    expect(p1Text).toContain('1200x630');
    expect(p1Text).toContain('Cache-Control');

    // Eje 2: Favicon de clase mundial, SVG dark/light, optical sizing, PWA
    const pillar2 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_2_world_class_favicon');
    const p2Text = JSON.stringify(pillar2);
    expect(p2Text).toContain('SVG');
    expect(p2Text).toContain('prefers-color-scheme');
    expect(p2Text).toContain('favicon.ico');
    expect(p2Text).toContain('apple-touch-icon');
    expect(p2Text).toContain('Optical Sizing');
    expect(p2Text).toContain('Canvas API');

    // Eje 3: Posicionamiento Google, Schema.org JSON-LD, IndexNow, P-SEO
    const pillar3 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_3_google_seo_programmatic');
    const p3Text = JSON.stringify(pillar3);
    expect(p3Text).toContain('Schema.org');
    expect(p3Text).toContain('JSON-LD');
    expect(p3Text).toContain('ProfilePage');
    expect(p3Text).toContain('IndexNow');
    expect(p3Text).toContain('Core Web Vitals');

    // Eje 4: Estrategia CEO, PLG, viral loops (K-factor), planes y B2B
    const pillar4 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_4_ceo_growth_strategy');
    const p4Text = JSON.stringify(pillar4);
    expect(p4Text).toContain('Product-Led Growth');
    expect(p4Text).toContain('K-Factor');
    expect(p4Text).toContain('El Semestre Irresistible');
    expect(p4Text).toContain('INDI for Teams');
    expect(p4Text).toContain('LTV/CAC');

    // Eje 5: Experiencia curricular Smart CV & presentaciones orbitales
    const pillar5 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_5_smart_cv_and_presentations_experience');
    const p5Text = JSON.stringify(pillar5);
    expect(p5Text).toContain('ATS');
    expect(p5Text).toContain('A4');
    expect(p5Text).toContain('16:9');
    expect(p5Text).toContain('Privacidad');
  });

  it('el archivo Markdown complementario existe y referencia al documento canónico JSON', () => {
    expect(fs.existsSync(mdPath)).toBe(true);
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain('PROMPT_GEMINI_DEEP_RESEARCH_VISUAL_SEO_CEO_2026.json');
    expect(mdContent).toContain('Gemini 2.5');
    expect(mdContent).toContain('Deep Research');
  });
});
