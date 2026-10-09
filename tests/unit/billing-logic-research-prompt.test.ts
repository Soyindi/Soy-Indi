import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Gemini Deep Research Prompt: Billing & Multi-Plan Architecture 2026', () => {
  const mdPath = resolve(
    __dirname,
    '../../docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_BILLING_AND_SUBSCRIPTION_LOGIC_2026.md'
  );
  const jsonPath = resolve(
    __dirname,
    '../../docs/specifications/PROMPT_GEMINI_DEEP_RESEARCH_BILLING_AND_SUBSCRIPTION_LOGIC_2026.json'
  );

  it('verifica la existencia de las especificaciones en Markdown y JSON', () => {
    expect(existsSync(mdPath)).toBe(true);
    expect(existsSync(jsonPath)).toBe(true);
  });

  it('el prompt Markdown cubre los 6 ejes críticos de billing SaaS', () => {
    const content = readFileSync(mdPath, 'utf8');
    expect(content).toContain('EJE 1: COEXISTENCIA Y TRANSICIÓN DE PLANES');
    expect(content).toContain('EJE 2: EL CICLO DE VIDA DEL TEMPORIZADOR');
    expect(content).toContain('EJE 3: PROTOCOLO DE COMPRA Y VERIFICACIÓN CRIPTOGRÁFICA');
    expect(content).toContain('EJE 4: STATE MACHINE DE USUARIO Y SUSCRIPCIÓN');
    expect(content).toContain('EJE 5: GOBERNANZA DE CACHÉ DE SESIÓN');
    expect(content).toContain('EJE 6: ARQUITECTURA DE IMPLEMENTACIÓN');
    expect(content).toContain('Flow.cl');
    expect(content).toContain('getStatus');
    expect(content).toContain('Proration Calculation');
  });

  it('el esquema JSON es válido y contiene los 6 ejes de investigación', () => {
    const raw = readFileSync(jsonPath, 'utf8');
    const parsed = JSON.parse(raw);
    expect(parsed.title).toBe('MasterPromptGeminiDeepResearchBillingLogic2026');
    expect(parsed.researchAxes).toHaveLength(6);
    expect(parsed.researchAxes[0].id).toBe('eje_1_multi_plan_coexistence_and_transitions');
  });

  it('OnboardingChoiceGrid declara soporte dinámico para usuarios con suscripción activa', () => {
    const componentPath = resolve(
      __dirname,
      '../../src/features/onboarding/components/OnboardingChoiceGrid.tsx'
    );
    const code = readFileSync(componentPath, 'utf8');
    expect(code).toContain('isSubscribed');
    expect(code).toContain('Membresía INDI');
    expect(code).toContain('Prueba Gratuita Activada');
  });
});
