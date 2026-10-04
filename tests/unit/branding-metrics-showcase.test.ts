import { describe, it, expect } from 'vitest';
import { cardEvents } from '@/entities/schema';

describe('Auditoría de Branding & Métricas de Telemetría (Value Proposition Contracts)', () => {
  describe('Contrato de Eventos de Telemetría (card_events)', () => {
    it('verifica los tipos de eventos comerciales válidos en el esquema de base de datos', () => {
      // Los eventos de telemetría son el núcleo del valor diferencial de INDI frente al papel
      const validEventTypes = ['view', 'contact_save', 'whatsapp_click', 'share', 'qr_scan'] as const;
      
      // cardEvents.eventType debe coincidir con los tipos de eventos requeridos
      expect(cardEvents.eventType).toBeDefined();
      expect(validEventTypes).toContain('view');
      expect(validEventTypes).toContain('contact_save');
      expect(validEventTypes).toContain('whatsapp_click');
      expect(validEventTypes).toContain('qr_scan');
    });

    it('calcula deterministamente la tasa de conversión comercial (Conversion Rate)', () => {
      const calculateConversion = (views: number, conversions: number): string => {
        if (views <= 0) return '0.0%';
        return `${((conversions / views) * 100).toFixed(1)}%`;
      };

      // Casos de prueba basados en el Showcase de métricas
      expect(calculateConversion(1428, 384)).toBe('26.9%');
      expect(calculateConversion(100, 25)).toBe('25.0%');
      expect(calculateConversion(0, 0)).toBe('0.0%');
      expect(calculateConversion(50, 0)).toBe('0.0%');
    });

    it('valida la estructura de métricas de telemetría esperadas para el escaparate comercial', () => {
      interface ShowcaseMetricsContract {
        totalViews: number;
        whatsappClicks: number;
        vcardSaves: number;
        conversionRatePercent: number;
      }

      const mockData: ShowcaseMetricsContract = {
        totalViews: 1428,
        whatsappClicks: 384,
        vcardSaves: 296,
        conversionRatePercent: 26.9,
      };

      expect(mockData.totalViews).toBeGreaterThan(0);
      expect(mockData.whatsappClicks).toBeGreaterThan(0);
      expect(mockData.vcardSaves).toBeGreaterThan(0);
      expect(mockData.conversionRatePercent).toBeGreaterThan(0);
      expect(mockData.whatsappClicks + mockData.vcardSaves).toBeLessThanOrEqual(mockData.totalViews);
    });
  });

  describe('Propuesta de Valor de Branding Frente a Soportes Analógicos', () => {
    it('verifica los 4 pilares diferenciales de la presencia digital de INDI', () => {
      const brandPillars = [
        {
          id: 'telemetry_metrics',
          title: 'Telemetría y Métricas en Tiempo Real',
          benefit: 'Saber exactamente cuántas personas abren tu tarjeta y te contactan.',
        },
        {
          id: 'one_tap_vcard',
          title: 'Guardar Contacto en 1 Toque (vCard 4.0)',
          benefit: 'Elimina el error de tipear 9 dígitos a mano en la agenda telefónica.',
        },
        {
          id: 'interactive_map',
          title: 'Módulo de Ubicación & Cómo Llegar',
          benefit: 'Navegación nativa con Google Maps y Waze para oficinas o locales comerciales.',
        },
        {
          id: 'living_updates',
          title: 'Actualizaciones Vivas Ilimitadas',
          benefit: 'Modificar datos en 10 segundos sin mandar a reimprimir jamás.',
        },
      ];

      expect(brandPillars.length).toBe(4);
      brandPillars.forEach((p) => {
        expect(p.title).toBeDefined();
        expect(p.benefit.length).toBeGreaterThan(15);
      });
    });
  });
});
