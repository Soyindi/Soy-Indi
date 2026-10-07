import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Protocolo Canónico de Orquestación Agéntica 2026 (tests/unit)', () => {
  const specPath = path.resolve(process.cwd(), 'docs/specifications/AGENT_ORCHESTRATION_PROMPT_2026.md');

  it('el archivo de especificación canónica existe y no está vacío', () => {
    expect(fs.existsSync(specPath)).toBe(true);
    const content = fs.readFileSync(specPath, 'utf-8');
    expect(content.length).toBeGreaterThan(500);
  });

  it('la especificación contiene las directivas fundamentales de ingeniería (FSD, Git Push, Doc-as-Code)', () => {
    const content = fs.readFileSync(specPath, 'utf-8');
    
    // Verificación de directivas mandatorias
    expect(content).toContain('git push origin');
    expect(content).toContain('Conventional Commits');
    expect(content).toContain('FSD');
    expect(content).toContain('npm run typecheck');
    expect(content).toContain('npm test');
    expect(content).toContain('Base 8');
    expect(content).toContain('WCAG 2.2 AA');
    expect(content).toContain('BLUEPRINT_2026.md');
    expect(content).toContain('AGENTS.md');
  });

  it('provee los dos templates de prompt (Maestro y Fast-Track)', () => {
    const content = fs.readFileSync(specPath, 'utf-8');
    expect(content).toContain('Prompt Maestro Oficial');
    expect(content).toContain('Prompt Fast-Track');
    expect(content).toContain('Pre-flight');
    expect(content).toContain('Reporte Ejecutivo de Entrega');
  });
});
