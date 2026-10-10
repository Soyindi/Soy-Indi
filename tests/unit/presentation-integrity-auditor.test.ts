import { describe, it, expect } from 'vitest';
import {
  assertSyntacticCompleteness,
  auditAndRepairPresentationSlides,
} from '@/features/orbital-presentations/lib/presentation-auditor';
import { synthesizeConciseActionTitle } from '@/features/orbital-presentations/lib/document-parser';
import { PresentationSlide } from '@/entities/presentation/schemas';

describe('Presentation Syntactic Completeness & Integrity Auditor', () => {
  describe('assertSyntacticCompleteness', () => {
    it('elimina palabras huérfanas al final de una frase', () => {
      const truncated1 = 'La arquitectura de software distribuida para el';
      const result1 = assertSyntacticCompleteness(truncated1);
      expect(result1.isComplete).toBe(false);
      expect(result1.repairedText).toBe('La arquitectura de software distribuida');

      const truncated2 = 'Estrategia de crecimiento acelerado con';
      const result2 = assertSyntacticCompleteness(truncated2);
      expect(result2.repairedText).toBe('Estrategia de crecimiento acelerado');
    });

    it('elimina puntos suspensivos mutilantes y repara el final', () => {
      const withEllipsis = 'Implementación del nuevo protocolo de seguridad...';
      const result = assertSyntacticCompleteness(withEllipsis);
      expect(result.repairedText).not.toContain('...');
      expect(result.repairedText).toBe('Implementación del nuevo protocolo de seguridad');
    });

    it('respeta frases bien formadas de longitud ejecutiva', () => {
      const wellFormed = 'El nuevo modelo operativo reduce la fricción en un 40% en equipos comerciales';
      const result = assertSyntacticCompleteness(wellFormed);
      expect(result.isComplete).toBe(true);
      expect(result.repairedText).toBe(wellFormed);
    });
  });

  describe('synthesizeConciseActionTitle', () => {
    it('no mutila con slice ciego a 13 palabras si la tesis tiene 16 palabras coherentes', () => {
      const fullThesis = 'La adopción de microservicios perimetrales optimiza los tiempos de carga en dispositivos móviles de alta demanda';
      const synthesized = synthesizeConciseActionTitle(fullThesis);
      expect(synthesized).toBe(fullThesis);
      expect(synthesized).not.toContain('...');
      expect(synthesized.endsWith('en')).toBe(false);
    });

    it('recorta en fronteras de puntuación natural cuando la oración es excesivamente larga', () => {
      const longSentence = 'Este es el resumen ejecutivo principal sobre la transformación digital de la compañía, logrando un impacto medible en todas las regiones del país durante el año 2026 sin comprometer el presupuesto.';
      const synthesized = synthesizeConciseActionTitle(longSentence);
      expect(synthesized.length).toBeLessThan(longSentence.length);
      expect(synthesized).not.toContain('...');
      // No debe terminar en preposición
      expect(synthesized).not.toMatch(/\s(de|en|para|con|el|la|los|las|por|a)$/i);
    });
  });

  describe('auditAndRepairPresentationSlides', () => {
    it('audita y repara slides con títulos truncados o incompletos', () => {
      const rawSlides: PresentationSlide[] = [
        {
          id: 'slide-1',
          title: 'Texto 1: Panorama General de la',
          actionTitle: 'La transformación tecnológica requiere inversión en',
          subtitle: 'Subtítulo',
          semanticIntent: 'executive_scqa',
          visualType: 'concept',
          layout: 'split-2col',
          keyPoints: [
            'Punto 1 que habla de',
            'Punto 2 completamente estructurado y claro.',
          ],
          timelineData: [
            {
              step: 'Fase 1',
              title: 'Lanzamiento del',
              description: 'Detalle de la fase',
            },
          ],
        },
      ];

      const report = auditAndRepairPresentationSlides(rawSlides);

      expect(report.repairedCount).toBeGreaterThan(0);
      
      const slide = report.auditedSlides[0];
      // Título sin "Texto 1:" y sin palabra huérfana "de la"
      expect(slide.title).toBe('Panorama General');
      // Action title sin palabra huérfana "en"
      expect(slide.actionTitle).toBe('La transformación tecnológica requiere inversión.');
      // KeyPoints reparados
      expect(slide.keyPoints[0]).toBe('Punto 1 que habla');
      // Timeline title reparado
      expect(slide.timelineData?.[0].title).toBe('Lanzamiento');
    });
  });
});
