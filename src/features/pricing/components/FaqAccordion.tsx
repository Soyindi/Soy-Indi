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
      'Dispones de 3 planes adaptados a tu etapa: Starter por $2.500 CLP/mes ($6.000 semestral), Pro (Recomendado) por $4.990 CLP/mes ($15.000 semestral) con analíticas completas y sin límites de visualización, o Max por $8.990 CLP/mes ($29.990 semestral) para volumen ilimitado. En todos los planes semestrales ahorras hasta un 60%.',
  },
  {
    question: '¿Mis clientes necesitan instalar alguna aplicación para ver mi tarjeta?',
    answer:
      'No, para nada. Tu cliente solo escanea tu código QR con la cámara de su celular o toca el enlace que le envíes por WhatsApp, y tu tarjeta se abre al instante en su navegador (funciona perfecto en cualquier iPhone o Android).',
  },
  {
    question: '¿Qué pasa cuando se terminen mis 3 días de prueba?',
    answer:
      'Tu información, tarjetas y currículum quedan resguardados de forma segura en tu cuenta. Para mantener tus enlaces públicos activos y continuar registrando visitas y clics de clientes, puedes activar tu plan Starter desde $2.500 CLP/mes, Pro por $4.990 CLP/mes o Max según tus requerimientos.',
  },
  {
    question: '¿Cómo sé cuántas personas están viendo mi tarjeta o escribiéndome?',
    answer:
      'En tu panel privado de INDI tienes estadísticas en tiempo real: ves cuántas personas abrieron tu tarjeta, cuántas tocaron tu botón de WhatsApp, cuántas te guardaron en sus contactos del celular y tu porcentaje de efectividad comercial. Así sabes exactamente qué impacto tiene tu presencia digital.',
  },
  {
    question: '¿Mis clientes tienen que escribir mi número a mano para guardarme?',
    answer:
      'No. Tu tarjeta incluye un botón inteligente de "Guardar Contacto". Al presionarlo, el celular de tu cliente descarga tu ficha de contacto completa (con tu nombre, foto, WhatsApp, correo y dirección) y la guarda directamente en su agenda sin tener que tipear nada.',
  },
  {
    question: '¿Qué medios de pago puedo usar en Chile?',
    answer:
      'Puedes pagar de forma rápida y segura con Cuenta RUT, tarjeta de débito o crédito mediante Webpay (Flow.cl), transferencia instantánea Cuenta-a-Cuenta con Fintoc, o Mercado Pago. Para pagos fuera de Chile también se aceptan tarjetas internacionales.',
  },
  {
    question: '¿Cómo funciona el programa de recomendación y afiliados?',
    answer:
      'Todos los miembros de INDI tienen un enlace y código QR de afiliado exclusivo en su panel. Ganas el 25% de comisión en pesos chilenos sobre cada suscripción cobrada: desde $625 CLP mensual ($1.500 semestral) en Starter, hasta $2.248 CLP mensual ($7.498 semestral) en Max. Las comisiones se abonan directamente a tu Cuenta RUT o banco chileno cada 15 días (días 1 y 15 de cada mes).',
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
