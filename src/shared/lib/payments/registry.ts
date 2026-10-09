import { PaymentProvider } from '@/entities/subscription/types';
import { PaymentProviderAdapter } from './types';
import { flowAdapter } from './flow';
import { fintocAdapter } from './fintoc';
import { webpayAdapter } from './webpay';
import { mercadopagoAdapter } from './mercadopago';

/**
 * Registry de Adaptadores de Pago de INDI
 * Resuelve dinámicamente el proveedor de pagos solicitado con fallback seguro.
 */
export class PaymentAdapterRegistry {
  private adapters: Map<PaymentProvider, PaymentProviderAdapter> = new Map();

  constructor() {
    this.register(flowAdapter);
    this.register(fintocAdapter);
    this.register(webpayAdapter);
    this.register(mercadopagoAdapter);
  }

  register(adapter: PaymentProviderAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(provider: PaymentProvider = 'flow'): PaymentProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      console.warn(`[PaymentAdapterRegistry] Proveedor '${provider}' no encontrado. Usando fallback Flow.`);
      return flowAdapter;
    }
    return adapter;
  }

  /**
   * Obtiene el proveedor recomendado según disponibilidad y país
   */
  getDefaultProvider(): PaymentProvider {
    if (flowAdapter.isConfigured()) return 'flow';
    if (fintocAdapter.isConfigured()) return 'fintoc';
    if (webpayAdapter.isConfigured()) return 'webpay';
    if (mercadopagoAdapter.isConfigured()) return 'mercadopago';
    return 'flow'; // Default primario para Chile (cero barrera de entrada)
  }
}

export const paymentRegistry = new PaymentAdapterRegistry();

