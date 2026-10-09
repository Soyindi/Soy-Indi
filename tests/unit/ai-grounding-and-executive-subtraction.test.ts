import { describe, it, expect, vi } from 'vitest';
import { rewriteCvSectionAction } from '@/features/ai-smart-cv/actions';
import { refineSlideWithAiAction } from '@/features/orbital-presentations/actions';
import { MULTIMODAL_CV_PROMPT } from '@/features/ai-smart-cv/lib/multimodal-parser';

// Mockear llamada de red a la API de IA para garantizar pruebas unitarias instantáneas (<100ms) y deterministas
vi.mock('@/shared/api/nvidia-nim', () => ({
  callNvidiaNimChat: vi.fn().mockImplementation(async (messages: any[]) => {
    const promptText = messages.map((m: any) => m.content).join(' ');
    if (promptText.includes('action_title')) {
      return {
        success: true,
        content: JSON.stringify({
          actionTitle: 'La optimización digital reduce la latencia en un 70%, acelerando la conversión comercial',
          suggestedVisualType: 'metrics',
          rationale: 'Titular estratégico de alto impacto generado.',
        }),
        modelUsed: 'mock-gemini-2.5',
      };
    }
    return {
      success: true,
      content: JSON.stringify({
        speakerNotes: 'Destacar ante el comité que la ventaja competitiva radica en la reducción de costos operativos y no en descuentos comerciales.',
        rationale: 'Guion conversacional generado.',
      }),
      modelUsed: 'mock-gemini-2.5',
    };
  }),
}));

describe('AI Architecture, Strict Grounding & Executive Subtraction (tests/unit)', () => {
  describe('Smart CV AI Prompts & Extract-or-Flag Strategy', () => {
    it('MULTIMODAL_CV_PROMPT prohíbe explícitamente etiquetas redundantes e implementa el patrón Extract or Flag', () => {
      expect(MULTIMODAL_CV_PROMPT).toContain('STRICT ZERO-HALLUCINATION');
      expect(MULTIMODAL_CV_PROMPT).toContain('needs_metric');
      expect(MULTIMODAL_CV_PROMPT).toContain('SHOW, DON\'T LABEL');
      expect(MULTIMODAL_CV_PROMPT).toContain('EU AI Act');
      expect(MULTIMODAL_CV_PROMPT).toContain('Google XYZ');
      // Prohíbe etiquetas obvias
      expect(MULTIMODAL_CV_PROMPT).toContain('PROHIBICIÓN DE ETIQUETAS Y PREFIJOS OBVIOS');
    });

    it('rewriteCvSectionAction no inventa métricas porcentuales falsas si el usuario no aportó números', async () => {
      const inputWithoutMetric = 'Administré servidores web y resolví problemas de conectividad';
      const res = await rewriteCvSectionAction({
        text: inputWithoutMetric,
        type: 'BULLET',
        mode: 'XYZ_IMPACT',
        targetRole: 'DevOps Engineer',
      });

      expect(res.success).toBe(true);
      expect(res.suggestions.length).toBeGreaterThan(0);
      
      // No debe inventar cifras arbitrarias fijas como "35%" o "90%" si no venían en el texto
      for (const sug of res.suggestions) {
        expect(sug).not.toContain('35%');
        expect(sug).not.toContain('90%');
        // Debe usar llamados claros a cuantificar entre corchetes
        expect(sug).toMatch(/\[.*(?:métrica|impacto|volumen|mejora).*\]/i);
      }
    });

    it('rewriteCvSectionAction preserva y contextualiza métricas reales si el usuario sí aportó números', async () => {
      const inputWithRealMetric = 'Optimicé consultas SQL reduciendo la latencia de 120ms a 18ms para 50k usuarios';
      const res = await rewriteCvSectionAction({
        text: inputWithRealMetric,
        type: 'BULLET',
        mode: 'XYZ_IMPACT',
        targetRole: 'Backend Engineer',
      });

      expect(res.success).toBe(true);
      expect(res.suggestions.length).toBeGreaterThan(0);
      expect(res.suggestions[0]).toContain('18ms');
    });
  });

  describe('Orbital Presentations Executive Subtraction & Action Titles', () => {
    it('refineSlideWithAiAction genera un Action Title con tesis concluyente y sin prefijos obvios', async () => {
      const slide = {
        id: 'test-slide-1',
        title: 'Métricas de Adopción',
        subtitle: 'Resumen del trimestre',
        actionTitle: '',
        visualType: 'metrics' as const,
        keyPoints: ['Crecimiento acelerado', 'Retención de clientes'],
        speakerNotes: '',
      };

      const res = await refineSlideWithAiAction({
        slide,
        action: 'action_title',
        presentationContext: {
          presentationTitle: 'Revisión Estratégica Q4',
          targetAudience: 'investors',
          tone: 'orbital_cyber',
        },
      });

      expect(res.success).toBe(true);
      expect(res.data?.actionTitle).toBeDefined();
      
      const title = res.data!.actionTitle!;
      // No debe contener prefijos obvios como "Introducción:", "Resumen:", "Objetivo:"
      expect(title.toLowerCase()).not.toContain('introducción:');
      expect(title.toLowerCase()).not.toContain('resumen:');
      expect(title.toLowerCase()).not.toContain('objetivo:');
      // Debe ser asertivo y de longitud ejecutiva <= 15 palabras
      const wordCount = title.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(16);
    });

    it('refineSlideWithAiAction provee notas del orador con directrices conversacionales sin repetir el título como una etiqueta', async () => {
      const slide = {
        id: 'test-slide-2',
        title: 'Estrategia de Expansión',
        subtitle: 'Proyección 2026',
        actionTitle: 'La expansión regional captura el 25% del mercado desatendido',
        visualType: 'concept' as const,
        keyPoints: ['Alianzas locales', 'Infraestructura cloud'],
        speakerNotes: '',
      };

      const res = await refineSlideWithAiAction({
        slide,
        action: 'speaker_notes',
      });

      expect(res.success).toBe(true);
      expect(res.data?.speakerNotes).toBeDefined();
      expect(res.data!.speakerNotes!.length).toBeGreaterThan(20);
      expect(res.data!.speakerNotes!).not.toContain('Introducción:');
    });
  });
});
