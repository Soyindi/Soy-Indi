import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

/**
 * Cliente oficial Mercado Pago SDK v2
 * Configurado con token de producción o sandbox según la variable de entorno
 */
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN || '';

export const mercadopagoClient = new MercadoPagoConfig({
  accessToken: accessToken || 'TEST-DUMMY-ACCESS-TOKEN-2026',
  options: {
    timeout: 7000,
  },
});

export const preferenceClient = new Preference(mercadopagoClient);
export const paymentClient = new Payment(mercadopagoClient);

export function isMercadoPagoConfigured(): boolean {
  return Boolean(accessToken && accessToken !== 'TEST-DUMMY-ACCESS-TOKEN-2026');
}
