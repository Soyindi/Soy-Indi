export type PlanTier = 'starter' | 'pro' | 'max';
export type PlanInterval = 'monthly' | 'semiannual';
export type PaymentProvider = 'flow' | 'fintoc' | 'webpay' | 'mercadopago';

export interface PlanFeature {
  text: string;
  highlight?: boolean;
}

export interface TierLimits {
  cards: number | 'unlimited';
  cvs: number | 'unlimited';
  presentations: number | 'unlimited';
  hasWatermark: boolean;
  analyticsLevel: 'basic' | 'standard' | 'advanced';
  aiTier: 'standard' | 'fast_lane' | 'top_nim';
}

export interface TierPlanDetail {
  priceClp: number;
  priceUsd: number;
  intervalText: string;
  monthlyEquivalentClp: number;
  monthlyEquivalentUsd: number;
  discountPercentage?: number;
}

export interface TierPlanConfig {
  id: PlanTier;
  name: string;
  badge: string;
  tagline: string;
  isPopular?: boolean;
  limits: TierLimits;
  monthly: TierPlanDetail;
  semiannual: TierPlanDetail;
  features: PlanFeature[];
}

export const PRICING_TIERS: Record<PlanTier, TierPlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Plan Starter',
    badge: '🟢 Starter',
    tagline: 'Ideal para profesionales independientes y nuevos negocios',
    limits: {
      cards: 3,
      cvs: 1,
      presentations: 2,
      hasWatermark: false,
      analyticsLevel: 'basic',
      aiTier: 'standard',
    },
    monthly: {
      priceClp: 2500,
      priceUsd: 3,
      intervalText: 'facturado cada mes',
      monthlyEquivalentClp: 2500,
      monthlyEquivalentUsd: 3,
    },
    semiannual: {
      priceClp: 6000,
      priceUsd: 7,
      intervalText: 'facturado cada 6 meses ($1.000 CLP / mes)',
      monthlyEquivalentClp: 1000,
      monthlyEquivalentUsd: 1.16,
      discountPercentage: 60,
    },
    features: [
      { text: 'Hasta 3 perfiles de Tarjetas Digitales' },
      { text: '1 currículum base en PDF ATS' },
      { text: 'Hasta 2 presentaciones 16:9 con IA' },
      { text: 'Visitas Edge básicas y contador' },
      { text: 'Botón directo a WhatsApp y código QR' },
      { text: 'Copiloto de IA estándar' },
      { text: 'Sin marca de agua (Identidad profesional limpia)', highlight: true },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Plan Pro',
    badge: '🔵 Recomendado',
    tagline: 'La suite completa para escalar tu captación de clientes',
    isPopular: true,
    limits: {
      cards: 10,
      cvs: 5,
      presentations: 10,
      hasWatermark: false,
      analyticsLevel: 'standard',
      aiTier: 'fast_lane',
    },
    monthly: {
      priceClp: 4990,
      priceUsd: 6,
      intervalText: 'facturado cada mes',
      monthlyEquivalentClp: 4990,
      monthlyEquivalentUsd: 6,
    },
    semiannual: {
      priceClp: 15000,
      priceUsd: 17,
      intervalText: 'facturado cada 6 meses ($2.500 CLP / mes)',
      monthlyEquivalentClp: 2500,
      monthlyEquivalentUsd: 2.83,
      discountPercentage: 50,
    },
    features: [
      { text: 'Hasta 10 perfiles de Tarjetas Digitales', highlight: true },
      { text: 'Hasta 5 versiones de Smart CV con auditoría ATS' },
      { text: 'Hasta 10 presentaciones orbitales 16:9' },
      { text: 'Analíticas completas: Visitas, clics WhatsApp y vCard' },
      { text: 'Enlaces Profesionales Personalizados (/c/tu-nombre)', highlight: true },
      { text: 'IA Copiloto con prioridad en fila (Fast-lane)' },
      { text: 'Soporte prioritario y actualizaciones continuas' },
    ],
  },
  max: {
    id: 'max',
    name: 'Plan Max',
    badge: '🟣 Plan Max',
    tagline: 'Poder y volumen ilimitado para líderes y agencias',
    limits: {
      cards: 'unlimited',
      cvs: 'unlimited',
      presentations: 'unlimited',
      hasWatermark: false,
      analyticsLevel: 'advanced',
      aiTier: 'top_nim',
    },
    monthly: {
      priceClp: 8990,
      priceUsd: 10,
      intervalText: 'facturado cada mes',
      monthlyEquivalentClp: 8990,
      monthlyEquivalentUsd: 10,
    },
    semiannual: {
      priceClp: 29990,
      priceUsd: 33,
      intervalText: 'facturado cada 6 meses (~$4.990 CLP / mes)',
      monthlyEquivalentClp: 4998,
      monthlyEquivalentUsd: 5.5,
      discountPercentage: 44,
    },
    features: [
      { text: 'Tarjetas Digitales Ilimitadas para todos tus negocios', highlight: true },
      { text: 'Currículums ATS Ilimitados sin restricciones', highlight: true },
      { text: 'Presentaciones 16:9 Ilimitadas con diapositivas infinitas' },
      { text: 'Panel de métricas avanzado y embudo de conversión' },
      { text: 'Identidad Corporativa Limpia sin Enlaces Públicos Forzados', highlight: true },
      { text: 'Modelos de IA tope de línea (NVIDIA NIM Llama 3.3 / DeepSeek)' },
      { text: 'Soporte VIP directo y personalizaciones exclusivas' },
    ],
  },
};

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

/**
 * Catálogo compatible hacia atrás para integraciones existentes
 */
export const PRICING_PLANS: Record<PlanInterval, PlanConfig> = {
  monthly: {
    id: 'plan_starter_monthly',
    name: 'Plan Starter Mensual',
    priceClp: PRICING_TIERS.starter.monthly.priceClp,
    priceUsd: PRICING_TIERS.starter.monthly.priceUsd,
    intervalText: PRICING_TIERS.starter.monthly.intervalText,
    monthlyEquivalentClp: PRICING_TIERS.starter.monthly.monthlyEquivalentClp,
    monthlyEquivalentUsd: PRICING_TIERS.starter.monthly.monthlyEquivalentUsd,
    trialDays: 3,
    features: PRICING_TIERS.starter.features,
  },
  semiannual: {
    id: 'plan_starter_semiannual',
    name: 'Plan Starter Semestral',
    priceClp: PRICING_TIERS.starter.semiannual.priceClp,
    priceUsd: PRICING_TIERS.starter.semiannual.priceUsd,
    intervalText: PRICING_TIERS.starter.semiannual.intervalText,
    monthlyEquivalentClp: PRICING_TIERS.starter.semiannual.monthlyEquivalentClp,
    monthlyEquivalentUsd: PRICING_TIERS.starter.semiannual.monthlyEquivalentUsd,
    discountPercentage: PRICING_TIERS.starter.semiannual.discountPercentage,
    trialDays: 3,
    features: PRICING_TIERS.starter.features,
  },
};

export interface TimeRemainingBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMs: number;
}

export interface UserEntitlement {
  hasAccess: boolean;
  isTrial: boolean;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  tier: PlanTier;
  limits: TierLimits;
  daysRemaining: number;
  expiresAt: number | null;
  timeRemaining: TimeRemainingBreakdown;
}

/**
 * Función pura determinista para desglosar el tiempo restante en días, horas, minutos y segundos.
 */
export function calculateTimeRemaining(
  targetDate: number | Date | null | undefined,
  currentDate: number | Date = Date.now()
): TimeRemainingBreakdown {
  if (!targetDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalMs: 0,
    };
  }

  const targetMs = typeof targetDate === 'number' ? targetDate : targetDate.getTime();
  const currentMs = typeof currentDate === 'number' ? currentDate : currentDate.getTime();
  const diffMs = targetMs - currentMs;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalMs: 0,
    };
  }

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalMs: diffMs,
  };
}
