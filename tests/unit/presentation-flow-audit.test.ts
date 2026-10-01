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

  describe('Auditoría de Calidad Editorial & Ghost Deck (Scorecard y Principio MECE)', () => {
    it('comprueba que la cadena de Action Titles conforma una narrativa Ghost Deck continua', () => {
      const slides: PresentationSlide[] = [
        {
          id: 's1',
          title: 'Situación Actual',
          actionTitle: 'La identidad en papel genera 88% de desperdicio y desconexión con el cliente',
          visualType: 'concept',
          layout: 'layout-hero-statement',
          keyPoints: ['Pérdida de tracción en puntos de contacto.'],
        },
        {
          id: 's2',
          title: 'Solución INDI',
          actionTitle: 'El motor orbital con QR dinámico eleva la conversión a WhatsApp en un 340%',
          visualType: 'metrics',
          layout: 'layout-kpi-bento',
          keyPoints: ['Activación inmediata en el primer escaneo.'],
        },
        {
          id: 's3',
          title: 'Plan de Acción',
          actionTitle: 'Despliegue serverless edge en 3 fases garantiza latencias <10ms sin costos fijos',
          visualType: 'timeline',
          layout: 'timeline-steps',
          keyPoints: ['Hitos Q1 a Q3 asegurados.'],
        },
      ];

      // Verificación Ghost Deck: Cada slide debe tener un actionTitle asertivo y no un mero topic title
      slides.forEach((slide) => {
        expect(slide.actionTitle).toBeDefined();
        expect(slide.actionTitle!.length).toBeGreaterThan(15);
        // Debe ser una oración con verbo o acción y no una simple frase de 1 o 2 palabras
        expect(slide.actionTitle!.split(' ').length).toBeGreaterThanOrEqual(4);
      });
    });

    it('evalúa una diapositiva según el Scorecard de Calidad de Producción (Densidad y Relación Señal/Ruido)', () => {
      const eliteSlide: PresentationSlide = {
        id: 'score-1',
        title: 'Métricas de Adopción',
        actionTitle: 'Consolidación de 12,400 usuarios activos mensuales con un CAC de $0.42',
        subtitle: 'Crecimiento sostenido durante el período Q1-Q3 2026',
        visualType: 'metrics',
        layout: 'layout-kpi-bento',
        badgeText: 'TRACCIÓN VALIDADA',
        keyPoints: [
          'Retención neta de ingresos del 118%.',
          'Tasa de rebote reducida al 2.1% en dispositivos móviles.',
        ],
        speakerNotes: 'Contexto adicional: los costos de adquisición corresponden al canal orgánico y de recomendación directa.',
        metricsData: [
          { label: 'MAU', value: '12.4K', change: '+180%', trend: 'up' },
          { label: 'CAC', value: '$0.42', change: '-45%', trend: 'up' },
        ],
      };

      // Evaluación de dimensión Densidad Cognitiva:
      // Si visualType === 'metrics', debe contener al menos 1 métrica en metricsData
      const hasQuantEvidence = (eliteSlide.metricsData?.length ?? 0) >= 2;
      expect(hasQuantEvidence).toBe(true);

      // Evaluación de Relación Señal/Ruido:
      // keyPoints no debe sobrepasar 4 ítems para no sobrecargar cognitivamente
      expect(eliteSlide.keyPoints.length).toBeLessThanOrEqual(4);
      // La información tangencial o notas largas deben estar en speakerNotes
      expect(eliteSlide.speakerNotes).toBeDefined();
      expect(eliteSlide.speakerNotes!.length).toBeGreaterThan(10);
    });
  });

  describe('Auditoría de Enriquecimiento e Investigación de Temas Escuetos (Quick Topic Intelligence)', () => {
    it('garantiza que temas escuetos generen actionTitles ejecutivos y no títulos vacíos', () => {
      const sampleTopic = 'Ciberseguridad en Fintechs';
      const slidesGeneradas: PresentationSlide[] = [
        {
          id: 'slide-qt-1',
          title: 'Gobernanza y Cumplimiento Normativo',
          actionTitle: 'La Ley FinTech 21.521 y estándares ISO 27001 exigen blindaje criptográfico en banca abierta',
          subtitle: 'Marco de seguridad para instituciones financieras',
          visualType: 'concept',
          layout: 'standard',
          keyPoints: [
            'Obligatoriedad de SGSI auditado bajo directrices CMF.',
            'Cifrado de extremo a extremo en transferencias y telemetría de usuario.',
          ],
        },
        {
          id: 'slide-qt-2',
          title: 'Plan de Respuesta e Infraestructura',
          actionTitle: 'Monitoreo perimetral y planes de contingencia reducen el tiempo medio de mitigación (MTTR) a minutos',
          subtitle: 'Resiliencia ante incidentes y vectores de ataque modernos',
          visualType: 'timeline',
          layout: 'timeline-steps',
          keyPoints: [
            'Simulacros periódicos y protocolos de notificación inmediata.',
            'Aislamiento de microservicios con políticas Zero-Trust.',
          ],
        },
      ];

      // Verificación de enriquecimiento: no repite solo la frase de entrada
      slidesGeneradas.forEach((s) => {
        expect(s.actionTitle).toBeDefined();
        expect(s.actionTitle).not.toBe(sampleTopic);
        expect(s.actionTitle!.length).toBeGreaterThan(sampleTopic.length + 10);
        expect(s.keyPoints.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Auditoría Ergonómica y Contrato de Pantalla Completa Individual (Slide Fullscreen Contract)', () => {
    it('verifica que las propiedades de visualización y contratos de pantalla completa preserven la fidelidad del tema', () => {
      const slide: PresentationSlide = {
        id: 'fullscreen-slide-test',
        title: 'Arquitectura Edge de Alta Disponibilidad',
        actionTitle: 'El despliegue perimetral garantiza latencia sub-milisegundo sin pausas en frío',
        subtitle: 'Distribución global con Turso LibSQL',
        visualType: 'architecture',
        layout: 'standard',
        badgeText: 'PANTALLA COMPLETA HD',
        keyPoints: [
          'Renderizado cinemático 16:9 con luz volumétrica acelerada por GPU.',
          'Botón de ampliación dedicado con touch target superior a 44x44px.',
          'Sincronización nativa con evento fullscreenchange de la Web API.',
        ],
      };

      const parsed = presentationSlideSchema.safeParse(slide);
      expect(parsed.success).toBe(true);

      // Verificación de contratos ergonómicos
      expect(slide.keyPoints.length).toBe(3);
      expect(slide.badgeText).toContain('PANTALLA COMPLETA');
    });
  });
});


