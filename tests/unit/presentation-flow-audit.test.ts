import { describe, it, expect } from 'vitest';
import {
  presentationSlideSchema,
  presentationFormSchema,
  PresentationSlide,
  PresentationFormValues,
} from '@/entities/presentation/schemas';

describe('Auditoría Integral del Flujo de Presentaciones (Studio UX & Contracts)', () => {
  describe('Integridad de Contratos y Campos de Pirámide McKinsey (Action Title & Key Points)', () => {
    it('valida una diapositiva con actionTitle y keyPoints editados', () => {
      const slide: PresentationSlide = {
        id: 'test-slide-1',
        title: 'Métricas de Conversión',
        actionTitle: 'Incrementar la conversión a WhatsApp un 340% mediante QR interactivo',
        subtitle: 'Resultados comparativos frente a soportes analógicos',
        visualType: 'metrics',
        layout: 'kpi-cards',
        badgeText: 'TELEMETRÍA EN VIVO',
        keyPoints: [
          '3.4x más interacciones registradas en los primeros 14 días.',
          'Score Lighthouse de 98 garantizado en infraestructura edge.',
          'Cero costos de hosting gracias a LibSQL y Turso Serverless.',
        ],
        speakerNotes: 'Hacer énfasis en el ROI directo para el cliente.',
        metricsData: [
          { label: 'Tasa de Respuesta', value: '42.8%', change: '+340%', trend: 'up' },
          { label: 'Tiempo de Carga', value: '<20ms', change: '-85%', trend: 'up' },
        ],
      };

      const parsed = presentationSlideSchema.safeParse(slide);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.actionTitle).toBeDefined();
        expect(parsed.data.keyPoints.length).toBe(3);
        expect(parsed.data.metricsData?.length).toBe(2);
      }
    });

    it('valida una diapositiva con estructura de comparativa A/B antes/después', () => {
      const slide: PresentationSlide = {
        id: 'test-comp-1',
        title: 'Transformación de Paradigma',
        actionTitle: 'Superar la desconexión del papel mediante enlaces vivos de alta retención',
        visualType: 'comparison',
        layout: 'split-2col',
        badgeText: 'VENTAJA COMPETITIVA',
        keyPoints: ['Comparativa directa de prestaciones técnicas.'],
        comparisonData: {
          beforeTitle: 'Tarjetas de Cartulina',
          beforeItems: ['88% tiradas a la basura', 'Datos estáticos que caducan', 'Cero analítica de impacto'],
          afterTitle: 'INDI Orbital 2026',
          afterItems: ['Contacto a 1 click por WhatsApp', 'Actualización viva en tiempo real', 'Telemetría de visitas'],
        },
      };

      const parsed = presentationSlideSchema.safeParse(slide);
      expect(parsed.success).toBe(true);
    });

    it('valida una presentación completa con metadatos y múltiples diapositivas', () => {
      const formValues: PresentationFormValues = {
        title: 'INDI Seed Round Pitch 2026',
        slug: 'indi-seed-round-2026',
        isPublic: true,
        themeSettings: {
          id: 'orbital-dark',
          name: 'Orbital Cyber',
          primaryColor: '#6366f1',
          accentColor: '#22d3ee',
          backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 75%)',
          enableParticles: true,
        },
        slidesData: [
          {
            id: 's1',
            title: 'Visión General',
            actionTitle: 'Liderar la transición de la identidad corporativa analógica a la digital',
            visualType: 'concept',
            layout: 'standard',
            keyPoints: ['Propuesta de valor clara.'],
          },
          {
            id: 's2',
            title: 'Tracción',
            actionTitle: 'Consolidar crecimiento mensual compuesto del 28%',
            visualType: 'metrics',
            layout: 'kpi-cards',
            keyPoints: ['Métricas validadas en producción.'],
          },
        ],
      };

      const parsed = presentationFormSchema.safeParse(formValues);
      expect(parsed.success).toBe(true);
    });
  });

  describe('Reordenamiento Inmutable de Diapositivas (Deck Ordering Logic)', () => {
    it('intercambia correctamente dos diapositivas consecutivas sin mutar el array original', () => {
      const slides: PresentationSlide[] = [
        { id: '1', title: 'Slide 1', visualType: 'concept', layout: 'standard', keyPoints: [] },
        { id: '2', title: 'Slide 2', visualType: 'metrics', layout: 'kpi-cards', keyPoints: [] },
        { id: '3', title: 'Slide 3', visualType: 'quote', layout: 'quote-focus', keyPoints: [] },
      ];

      // Mover Slide 2 hacia la izquierda (posición 0)
      const moveIndex = 1;
      const reordered = [...slides];
      const temp = reordered[moveIndex];
      reordered[moveIndex] = reordered[moveIndex - 1];
      reordered[moveIndex - 1] = temp;

      expect(reordered[0].id).toBe('2');
      expect(reordered[1].id).toBe('1');
      expect(reordered[2].id).toBe('3');
      expect(slides[0].id).toBe('1'); // Inmutabilidad comprobada
    });
  });
});
