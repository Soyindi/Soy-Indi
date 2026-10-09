import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Payment Gateway Deep Research Prompt & Migration Specification 2026 (tests/unit)', () => {
  const jsonPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_PAYMENT_GATEWAY_MIGRATION_2026.json'
  );
  const mdPath = path.resolve(
    process.cwd(),
    'docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_PAYMENT_GATEWAY_MIGRATION_2026.md'
  );

  it('el archivo JSON de investigación de pasarelas existe y es JSON válido', () => {
    expect(fs.existsSync(jsonPath)).toBe(true);
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    expect(rawContent.length).toBeGreaterThan(1000);

    let parsed: any;
    expect(() => {
      parsed = JSON.parse(rawContent);
    }).not.toThrow();

    expect(parsed).toBeDefined();
    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.title).toContain('Payment Gateway Migration');
    expect(parsed.metadata.platform).toBe('INDI (https://soyindi.cl)');
  });

  it('el JSON contiene directivas de ejecución para Gemini orientadas a Fintech y Staff Engineering', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    expect(parsed.execution_directives).toBeDefined();
    expect(parsed.execution_directives.role).toContain('Principal Fintech Architect');
    expect(parsed.execution_directives.role).toContain('Head of Payments Engineering');
    expect(parsed.execution_directives.target_jurisdiction).toContain('Chile');
    expect(parsed.execution_directives.temperature).toBeLessThanOrEqual(0.3);

    // Business model and Pricing verification
    expect(parsed.metadata.business_model.matrix_name).toBe('El Semestre Irresistible');
    expect(parsed.metadata.business_model.pricing_tiers.starter.monthly_clp).toBe(2500);
    expect(parsed.metadata.business_model.pricing_tiers.starter.semiannual_clp).toBe(6000);
    expect(parsed.metadata.business_model.pricing_tiers.pro.monthly_clp).toBe(4990);
    expect(parsed.metadata.business_model.pricing_tiers.pro.semiannual_clp).toBe(15000);
    expect(parsed.metadata.business_model.pricing_tiers.max.monthly_clp).toBe(8990);
    expect(parsed.metadata.business_model.pricing_tiers.max.semiannual_clp).toBe(29990);
    expect(parsed.metadata.business_model.affiliate_commission_rate).toBe(0.25);
  });

  it('contempla con rigor los 7 ejes estratégicos de investigación para resolver el rechazo de tarjetas y migración', () => {
    const rawContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    expect(parsed.research_pillars).toBeInstanceOf(Array);
    expect(parsed.research_pillars.length).toBe(7);

    const pillarIds = parsed.research_pillars.map((p: any) => p.pillar_id);
    expect(pillarIds).toContain('pillar_1_mercadopago_rejection_forensics');
    expect(pillarIds).toContain('pillar_2_chile_fintech_trends_2026');
    expect(pillarIds).toContain('pillar_3_gateway_benchmark_matrix');
    expect(pillarIds).toContain('pillar_4_decision_matrix_and_recommendation');
    expect(pillarIds).toContain('pillar_5_technical_architecture_and_contracts');
    expect(pillarIds).toContain('pillar_6_affiliates_and_reconciliation');
    expect(pillarIds).toContain('pillar_7_migration_roadmap_zero_downtime');

    // Eje 1: Forense de Mercado Pago y rechazos de tarjetas
    const p1 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_1_mercadopago_rejection_forensics');
    const p1Text = JSON.stringify(p1);
    expect(p1Text).toContain('Mach');
    expect(p1Text).toContain('Tenpo');
    expect(p1Text).toContain('CuentaRUT');
    expect(p1Text).toContain('antifraude');

    // Eje 2: Tendencias en Chile
    const p2 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_2_chile_fintech_trends_2026');
    const p2Text = JSON.stringify(p2);
    expect(p2Text).toContain('Webpay Plus');
    expect(p2Text).toContain('Fintoc');

    // Eje 3: Evaluación de 6 pasarelas
    const p3 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_3_gateway_benchmark_matrix');
    const gateways = p3.gateways_evaluated.map((g: any) => g.name);
    expect(gateways).toContain('Fintoc');
    expect(gateways).toContain('Webpay Plus / Transbank');
    expect(gateways).toContain('Flow.cl');
    expect(gateways).toContain('Stripe Chile');
    expect(gateways).toContain('Kushki / dLocal Go');

    // Eje 4: Matriz de decisión ponderada
    const p4 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_4_decision_matrix_and_recommendation');
    expect(p4.criteria_weights.chile_authorization_rate).toBe(0.30);
    expect(p4.criteria_weights.cost_and_fixed_fee_efficiency).toBe(0.20);

    // Eje 7: Roadmap de migración zero-downtime
    const p7 = parsed.research_pillars.find((p: any) => p.pillar_id === 'pillar_7_migration_roadmap_zero_downtime');
    expect(p7.phases.length).toBe(5);
  });

  it('el archivo Markdown complementario existe y contiene la formulación completa del prompt maestro', () => {
    expect(fs.existsSync(mdPath)).toBe(true);
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain('PROMPT MAESTRO DE DEEP RESEARCH PARA GEMINI');
    expect(mdContent).toContain('MERCADO PAGO');
    expect(mdContent).toContain('Fintoc');
    expect(mdContent).toContain('Webpay Plus');
    expect(mdContent).toContain('Flow.cl');
    expect(mdContent).toContain('Stripe Chile');
    expect(mdContent).toContain('El Semestre Irresistible');
  });
});
