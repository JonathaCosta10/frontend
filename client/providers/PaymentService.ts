import { PaymentProvider, PaymentData, PaymentResult } from './PaymentProvider';
import { MercadoLivreProvider } from './MercadoLivreProvider';
import { SantanderProvider } from './SantanderProvider';
import { PayPalProvider } from './PayPalProvider';
import { NubankProvider } from './NubankProvider';

export type PaymentProviderType = 'mercadopago' | 'santander' | 'paypal' | 'nubank';

export class PaymentService {
  private providers: Map<PaymentProviderType, PaymentProvider> = new Map();
  private environment: 'sandbox' | 'production';

  constructor(environment: 'sandbox' | 'production' = 'sandbox') {
    this.environment = environment;
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize payment providers with configuration
    // In production, these should come from environment variables or secure configuration

    if (this.environment === 'sandbox') {
      // Sandbox credentials (fake/test)
      this.providers.set('mercadopago', new MercadoLivreProvider(
        'TEST-ACCESS-TOKEN', 
        'sandbox'
      ));

      this.providers.set('santander', new SantanderProvider(
        'test-api-key',
        'test-client-id',
        'sandbox'
      ));

      this.providers.set('paypal', new PayPalProvider(
        'test-secret',
        'test-client-id',
        'sandbox'
      ));

      this.providers.set('nubank', new NubankProvider(
        'test-api-key',
        'test-client-id',
        'sandbox'
      ));
    } else {
      // Production credentials - should come from secure environment variables
      this.providers.set('mercadopago', new MercadoLivreProvider(
        process.env.MERCADOPAGO_ACCESS_TOKEN || '',
        'production'
      ));

      this.providers.set('santander', new SantanderProvider(
        process.env.SANTANDER_API_KEY || '',
        process.env.SANTANDER_CLIENT_ID || '',
        'production'
      ));

      this.providers.set('paypal', new PayPalProvider(
        process.env.PAYPAL_CLIENT_SECRET || '',
        process.env.PAYPAL_CLIENT_ID || '',
        'production'
      ));

      this.providers.set('nubank', new NubankProvider(
        process.env.NUBANK_API_KEY || '',
        process.env.NUBANK_CLIENT_ID || '',
        'production'
      ));
    }
  }

  async processPayment(
    providerType: PaymentProviderType, 
    paymentData: PaymentData
  ): Promise<PaymentResult> {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      return {
        success: false,
        error: `Provider ${providerType} não está disponível`
      };
    }

    try {
      const result = await provider.processPayment(paymentData);
      
      // Log successful payments for analytics
      if (result.success) {
        console.log(`Payment processed successfully with ${providerType}:`, {
          transactionId: result.transactionId,
          amount: paymentData.amount,
          planType: paymentData.planType
        });
      }

      return result;
    } catch (error) {
      console.error(`Error processing payment with ${providerType}:`, error);
      return {
        success: false,
        error: `Erro ao processar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  async createSubscription(
    providerType: PaymentProviderType, 
    paymentData: PaymentData
  ): Promise<PaymentResult> {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      return {
        success: false,
        error: `Provider ${providerType} não está disponível`
      };
    }

    try {
      const result = await provider.createSubscription(paymentData);
      
      // Log successful subscriptions
      if (result.success) {
        console.log(`Subscription created successfully with ${providerType}:`, {
          subscriptionId: result.transactionId,
          amount: paymentData.amount,
          planType: paymentData.planType,
          billingCycle: paymentData.billingCycle
        });
      }

      return result;
    } catch (error) {
      console.error(`Error creating subscription with ${providerType}:`, error);
      return {
        success: false,
        error: `Erro ao criar assinatura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  async cancelSubscription(
    providerType: PaymentProviderType, 
    subscriptionId: string
  ): Promise<PaymentResult> {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      return {
        success: false,
        error: `Provider ${providerType} não está disponível`
      };
    }

    try {
      const result = await provider.cancelSubscription(subscriptionId);
      
      // Log cancellations
      if (result.success) {
        console.log(`Subscription cancelled successfully with ${providerType}:`, {
          subscriptionId: subscriptionId
        });
      }

      return result;
    } catch (error) {
      console.error(`Error cancelling subscription with ${providerType}:`, error);
      return {
        success: false,
        error: `Erro ao cancelar assinatura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  async getPaymentStatus(
    providerType: PaymentProviderType, 
    transactionId: string
  ): Promise<PaymentResult> {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      return {
        success: false,
        error: `Provider ${providerType} não está disponível`
      };
    }

    try {
      return await provider.getPaymentStatus(transactionId);
    } catch (error) {
      console.error(`Error getting payment status from ${providerType}:`, error);
      return {
        success: false,
        error: `Erro ao verificar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  getAvailableProviders(): PaymentProviderType[] {
    return Array.from(this.providers.keys());
  }

  getProviderDisplayName(providerType: PaymentProviderType): string {
    const names: Record<PaymentProviderType, string> = {
      'mercadopago': 'Mercado Pago',
      'santander': 'Santander',
      'paypal': 'PayPal',
      'nubank': 'Nubank'
    };

    return names[providerType] || providerType;
  }

  getProviderIcon(providerType: PaymentProviderType): string {
    const icons: Record<PaymentProviderType, string> = {
      'mercadopago': '💳',
      'santander': '🏦',
      'paypal': '🅿️',
      'nubank': '💜'
    };

    return icons[providerType] || '💳';
  }
}

// Export singleton instance
export const paymentService = new PaymentService(
  import.meta.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
);
