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
  aiCreditsMonthly: number;
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
    trialDays: 15,
    aiCreditsMonthly: 30,
    features: [
      { text: '15 Días de Prueba Gratis (Sin tarjeta requerida)' },
      { text: 'Tarjetas Digitales Ilimitadas con SmartParticles v3.0' },
      { text: 'Botón directo a chat de WhatsApp con mensaje personalizado' },
      { text: 'Generador de QR interactivo de alta resolución' },
      { text: 'Previsualización dinámica en WhatsApp y LinkedIn con @vercel/og' },
      { text: 'Sin marca de agua en tus tarjetas compartidas' },
      { text: 'Smart CV con análisis ATS básico' },
      { text: 'Visualizador de Presentaciones Cinematográficas 16:9' },
      { text: '30 Créditos de IA mensuales para auditorías y presentaciones' },
      { text: 'Analíticas en tiempo real (visitas y clics)' },
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
    trialDays: 15,
    aiCreditsMonthly: 30,
    features: [
      { text: '🔥 60% de Ahorro frente al pago mensual', highlight: true },
      { text: '15 Días de Prueba VIP Gratis (Sin tarjeta requerida)' },
      { text: 'Tarjetas Digitales Ilimitadas con SmartParticles v3.0' },
      { text: 'Botón directo a chat de WhatsApp con mensaje personalizado' },
      { text: 'Generador de QR interactivo de alta resolución' },
      { text: 'Previsualización dinámica en WhatsApp y redes sociales' },
      { text: 'Marca Blanca 100% limpia (Sin logos de INDI)' },
      { text: 'Smart CV completo con calibración ATS y exportación A4' },
      { text: 'Orbital Studio: Presentaciones 16:9 con temas y efectos orbitales' },
      { text: '30 Créditos de IA mensuales renovables para ATS y diapositivas' },
      { text: 'Métricas completas de conversión y soporte preferente' },
    ],
  },
};
