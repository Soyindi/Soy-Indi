'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Cómo funcionan los 3 días de prueba gratis?',
    answer:
      'Al crear tu cuenta tienes 3 días completos para usar todo gratis, sin ningún compromiso y sin pedirte tarjeta de crédito. Puedes crear tu tarjeta, personalizarla con tus datos, revisar tus métricas de visitas y compartir tu link o tu código QR con tus clientes desde el primer minuto.',
  },
  {
    question: '¿Cuánto cuesta el servicio después de los 3 días?',
    answer:
      'Puedes suscribirte por solo $2.500 CLP al mes para mantener tus tarjetas digitales, métricas, currículum profesional y presentaciones activas. O si prefieres ahorrar un 60%, puedes optar por el plan semestral de $6.000 CLP cada 6 meses (equivalente a $1.000 al mes).',
  },
  {
    question: '¿Mis clientes necesitan instalar alguna aplicación para ver mi tarjeta?',
    answer:
      'No, para nada. Tu cliente solo escanea tu código QR con la cámara de su celular o toca el enlace que le envíes por WhatsApp, y tu tarjeta se abre al instante en su navegador (funciona perfecto en cualquier iPhone o Android).',
  },
  {
    question: '¿Qué pasa cuando se terminen mis 3 días de prueba?',
    answer:
      'Tu información, tu tarjeta y tus diseños quedan guardados de forma segura en tu cuenta. Para que tu tarjeta siga visible en internet para tus clientes y continúes registrando visitas y clics, solo debes activar tu suscripción mensual de $2.500 CLP o semestral de $6.000 CLP.',
  },
  {
    question: '¿Qué medios de pago puedo usar en Chile?',
    answer:
      'Puedes pagar de forma rápida y segura con Cuenta RUT, tarjeta de débito o tarjeta de crédito mediante Webpay (BancoEstado y todos los bancos chilenos). Para quienes están fuera de Chile, también aceptamos tarjetas internacionales.',
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
