'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Cómo funcionan los 15 días de prueba gratuita?',
    answer:
      'Al crear tu cuenta o diseñar tu primera tarjeta, obtienes acceso VIP inmediato a todas las funciones durante 15 días completos: sin ingresar tarjeta de crédito ni compromisos. Puedes compartir tu enlace y código QR con clientes de inmediato.',
  },
  {
    question: '¿Por qué el plan semestral de $6.000 CLP es tan conveniente?',
    answer:
      'Equivale a solo $1.000 CLP al mes (literalmente menos de lo que cuesta un café). Pagas una sola vez cada 6 meses, ahorras un 60% frente a la suscripción mensual y te olvidas de micro-cargos recurrentes en tu tarjeta o Cuenta RUT.',
  },
  {
    question: '¿La otra persona necesita tener instalada alguna aplicación para ver mi tarjeta?',
    answer:
      'No. Tu tarjeta abre en milisegundos directamente en el navegador de cualquier smartphone (iPhone o Android) al escanear el código QR o abrir el enlace compartido por WhatsApp o redes.',
  },
  {
    question: '¿Qué sucede cuando finalizan mis 15 días de prueba?',
    answer:
      'Tus datos, tarjeta, currículum y presentaciones permanecen guardados intactos en tu panel. Solo debes activar tu membresía semestral o mensual para que tu enlace público y código QR sigan respondiendo a tus visitas.',
  },
  {
    question: '¿Cómo funcionan los créditos de Inteligencia Artificial?',
    answer:
      'Recibes 30 créditos de IA mensuales renovables incluidos en tu plan. Cada auditoría profunda ATS consume 2 créditos y la generación completa de una presentación consume 5 créditos. Las visitas a tus tarjetas, códigos QR y enlaces son 100% ilimitados.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos todos los medios de pago en Chile mediante Webpay: Tarjetas de Crédito, Débito y Cuenta RUT (BancoEstado). Para usuarios internacionales, aceptamos tarjetas vía Stripe.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {FAQ_ITEMS.map((item, idx) => (
        <div
          key={idx}
          className="glass-panel rounded-2xl overflow-hidden border border-white/10 transition-colors"
        >
          <button
            onClick={() => toggle(idx)}
            className="w-full p-5 text-left flex items-center justify-between gap-4 text-white hover:text-cyan-300 transition-colors focus:outline-none"
            aria-expanded={openIndex === idx}
          >
            <span className="text-sm sm:text-base font-bold tracking-tight">
              {item.question}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-300 ${
                openIndex === idx ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {openIndex === idx && (
            <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 animate-fade-in">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
