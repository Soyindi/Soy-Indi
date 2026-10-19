'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Cómo funciona el Plan Comunitario Gratuito?',
    answer:
      'Al crear tu cuenta en INDI accedes de por vida al Plan Comunitario Gratuito, sin costo y sin pedirte tarjeta de crédito. Puedes crear 1 Tarjeta Digital con código QR interactivo y 1 Smart CV en PDF adaptado a filtros ATS, revisar tus métricas de visitas y compartir tu perfil con tus clientes o reclutadores desde el primer minuto.',
  },
  {
    question: '¿Cuánto cuesta el servicio y qué incluyen los planes Pro y Max?',
    answer:
      'El Plan Starter es 100% gratuito para la comunidad. Para profesionales con alto volumen que requieran múltiples tarjetas, analíticas avanzadas y plantillas exclusivas, los planes Pro ($4.990 CLP/mes o $15.000 semestral) y Max ($8.990 CLP/mes o $29.990 semestral) se encuentran actualmente en lista de espera con acceso anticipado.',
  },
  {
    question: '¿Mis clientes necesitan instalar alguna aplicación para ver mi tarjeta?',
    answer:
      'No, para nada. Tu cliente solo escanea tu código QR con la cámara de su celular o toca el enlace que le envíes por WhatsApp, y tu tarjeta se abre al instante en su navegador (funciona perfecto en cualquier iPhone o Android).',
  },
  {
    question: '¿Tengo algún límite de tiempo en mi Plan Gratuito?',
    answer:
      'No tienes límite de tiempo. Tu tarjeta digital y tu Smart CV permanecen activos de manera permanente. No cerraremos tu cuenta ni exigiremos cobros sorpresivos para mantener tus enlaces funcionando.',
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
    question: '¿Cómo funciona el programa de recomendación y afiliados?',
    answer:
      'Todos los miembros de INDI tienen un enlace y código QR de afiliado exclusivo en su panel. Por cada 3 amigos que se sumen con tu enlace desbloqueas capacidades adicionales (+1 tarjeta), y cuando activemos los planes Pro y Max recibirás el 25% de comisión en pesos chilenos directamente en tu cuenta bancaria o CuentaRUT.',
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
