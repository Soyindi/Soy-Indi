import { describe, it, expect } from 'vitest';
import { generateBioVariantsAction } from '@/features/card-builder/ai-bio-actions';

describe('AI Multi-Variant Bio Generator', () => {
  it('debe rechazar entradas sin título o sin especialidad', async () => {
    const res = await generateBioVariantsAction({
      title: '',
      profession: '',
    });
    expect(res.success).toBe(false);
  });

  it('debe generar exactamente 3 variantes estilísticas diferenciadas (Ejecutivo, Innovador, Cercano)', async () => {
    const res = await generateBioVariantsAction({
      title: 'Carlos Mendoza',
      profession: 'Ingeniero de Software Cloud',
    });

    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data).toHaveLength(3);

    const tones = res.data?.map((opt) => opt.tone);
    expect(tones).toContain('executive');
    expect(tones).toContain('innovative');
    expect(tones).toContain('approachable');

    // Verificar que todas incluyan el cargo o especialidad
    res.data?.forEach((opt) => {
      expect(opt.bio).toContain('Ingeniero de Software Cloud');
      expect(opt.bio.length).toBeGreaterThan(20);
    });
  });
});
