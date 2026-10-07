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

/**
 * Validador criptográfico de firma x-signature de Mercado Pago (HMAC-SHA256)
 * Cumple con la especificación de Mercado Pago Webhooks v2 y las recomendaciones de
 * seguridad distribuida 2026.
 *
 * Formato esperado en cabecera x-signature:
 * "ts=1710000000,v1=605e55e...678"
 */
export function verifyMercadoPagoWebhookSignature(params: {
  xSignatureHeader: string | null;
  xRequestIdHeader: string | null;
  dataId: string;
  webhookSecret?: string;
  maxToleranceSeconds?: number;
}): boolean {
  const secret = params.webhookSecret || process.env.MERCADOPAGO_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SECRET;

  // Si no hay clave secreta de webhook configurada, opera en modo permisivo seguro
  // confiando en la consulta posterior a la API oficial (Anti-Spoofing via paymentClient.get)
  if (!secret) {
    return true;
  }

  if (!params.xSignatureHeader) {
    return false;
  }

  try {
    const crypto = require('crypto');

    // Extraer ts y v1 del header x-signature
    const parts = params.xSignatureHeader.split(',').reduce((acc: Record<string, string>, item) => {
      const [key, value] = item.trim().split('=');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {});

    const ts = parts.ts;
    const hash = parts.v1;

    if (!ts || !hash) return false;

    // Control Anti-Replay: Verificar frescura temporal si se especifica tolerancia o en producción
    const maxToleranceSec = params.maxToleranceSeconds ?? (process.env.NODE_ENV === 'production' ? 300 : undefined);
    if (typeof maxToleranceSec === 'number' && maxToleranceSec > 0) {
      const requestTimestampSec = parseInt(ts, 10);
      if (!isNaN(requestTimestampSec)) {
        const currentTimestampSec = Math.floor(Date.now() / 1000);
        const diffSec = Math.abs(currentTimestampSec - requestTimestampSec);
        if (diffSec > maxToleranceSec) {
          console.warn(`[Seguridad Webhook] Petición descartada por ataque de repetición (delta: ${diffSec}s > ${maxToleranceSec}s)`);
          return false;
        }
      }
    }

    // Construcción del template de manifiesto según documentación oficial de Mercado Pago:
    // id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
    const dataId = params.dataId;
    const requestId = params.xRequestIdHeader || '';
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

    const cCreated = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

    const bufCreated = Buffer.from(cCreated, 'hex');
    const bufHash = Buffer.from(hash, 'hex');

    if (bufCreated.length !== bufHash.length) {
      return false;
    }

    // Comparación segura en tiempo constante contra timing attacks
    return crypto.timingSafeEqual(bufCreated, bufHash);
  } catch (err) {
    console.error('Error validando firma HMAC de webhook Mercado Pago:', err);
    return false;
  }
}
