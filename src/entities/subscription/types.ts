export type PlanInterval = 'monthly' | 'semiannual';

export interface PlanFeature {
  text: string;
  highlight?: boolean;
}

export interface PlanConfig {
  id: string;
  name: string;
  priceClp: number;
  priceUsd: number;
  intervalText: string;
  monthlyEquivalentClp: number;
  monthlyEquivalentUsd: number;
  discountPercentage?: number;
  trialDays: number;
  features: PlanFeature[];
}

export const PRICING_PLANS: Record<PlanInterval, PlanConfig> = {
  monthly: {
    id: 'plan_monthly',
    name: 'Plan Mensual Flexible',
    priceClp: 2500,
    priceUsd: 3,
    intervalText: 'facturado cada mes',
    monthlyEquivalentClp: 2500,
    monthlyEquivalentUsd: 3,
    trialDays: 3,
    features: [
      { text: '3 Días de Prueba Gratis (Sin ingresar tarjeta)' },
      { text: 'Tarjetas Digitales Ilimitadas para todos tus negocios' },
      { text: 'Botón directo para abrir chat de WhatsApp con tus clientes' },
      { text: 'Código QR listo para imprimir en stickers o mostrar en tu celular' },
      { text: 'Métricas y contador de visitas y clics en tiempo real' },
      { text: 'Creador de Currículum en PDF listo para imprimir y postular' },
      { text: 'Presentaciones cinemáticas en pantalla completa para propuestas' },
      { text: 'Se ve impecable al compartir en WhatsApp, Facebook e Instagram' },
      { text: 'Sin marcas de agua ni restricciones en tus tarjetas' },
    ],
  },
  semiannual: {
    id: 'plan_semiannual',
    name: 'Plan Semestral Recomendado',
    priceClp: 6000,
    priceUsd: 7,
    intervalText: 'facturado cada 6 meses ($1.000 CLP / mes)',
    monthlyEquivalentClp: 1000,
    monthlyEquivalentUsd: 1.16,
    discountPercentage: 60,
    trialDays: 3,
    features: [
      { text: '🔥 Ahorras el 60% frente al pago mensual', highlight: true },
      { text: '3 Días de Prueba Gratis (Sin ingresar tarjeta)' },
      { text: 'Tarjetas Digitales Ilimitadas para todos tus negocios' },
      { text: 'Botón directo para abrir chat de WhatsApp con tus clientes' },
      { text: 'Código QR listo para imprimir en stickers o mostrar en tu celular' },
      { text: 'Métricas completas de visitas y clics con analíticas en tiempo real' },
      { text: 'Creador de Currículum en PDF listo para imprimir y postular' },
      { text: 'Presentaciones cinemáticas en pantalla completa para propuestas' },
      { text: 'Tu propia marca 100% limpia (Sin logos de INDI)' },
      { text: 'Soporte prioritario y actualizaciones continuas' },
    ],
  },
};
