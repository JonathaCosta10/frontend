import { PaymentProvider, PaymentData, PaymentResult } from './PaymentProvider';

export class MercadoLivreProvider extends PaymentProvider {
  private baseUrl: string;

  constructor(apiKey: string, environment: 'sandbox' | 'production' = 'sandbox') {
    super(apiKey, environment);
    this.baseUrl = environment === 'sandbox' 
      ? 'https://api.mercadopago.com/sandbox'
      : 'https://api.mercadopago.com';
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const payload = {
        transaction_amount: paymentData.amount,
        description: paymentData.description,
        payment_method_id: 'credit_card',
        payer: {
          email: paymentData.customerEmail,
          first_name: paymentData.customerName.split(' ')[0],
          last_name: paymentData.customerName.split(' ').slice(1).join(' '),
          identification: {
            type: 'CPF',
            number: paymentData.customerDocument || '11111111111'
          }
        },
        notification_url: `${window.location.origin}/api/webhooks/mercadopago`,
        external_reference: `organizesee_${paymentData.planType}_${Date.now()}`
      };

      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `${Date.now()}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`MercadoPago API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: result.id?.toString(),
        paymentUrl: result.point_of_interaction?.transaction_data?.ticket_url,
        metadata: {
          status: result.status,
          payment_method: result.payment_method_id,
          installments: result.installments
        }
      };
    } catch (error) {
      console.error('MercadoPago payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no MercadoPago'
      };
    }
  }

  async createSubscription(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const payload = {
        reason: `Assinatura ${paymentData.planType} - Organizesee`,
        auto_recurring: {
          frequency: paymentData.billingCycle === 'monthly' ? 1 : 12,
          frequency_type: 'months',
          transaction_amount: paymentData.amount,
          currency_id: 'BRL'
        },
        payer_email: paymentData.customerEmail,
        back_url: `${window.location.origin}/dashboard`,
        external_reference: `sub_organizesee_${paymentData.planType}_${Date.now()}`
      };

      const response = await fetch(`${this.baseUrl}/preapproval`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`MercadoPago subscription error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: result.id,
        paymentUrl: result.init_point,
        metadata: {
          status: result.status,
          frequency: result.auto_recurring?.frequency,
          frequency_type: result.auto_recurring?.frequency_type
        }
      };
    } catch (error) {
      console.error('MercadoPago subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar assinatura no MercadoPago'
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/preapproval/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        throw new Error(`MercadoPago cancel error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: subscriptionId,
        metadata: {
          status: result.status,
          cancelled_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('MercadoPago cancellation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao cancelar assinatura no MercadoPago'
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`MercadoPago status error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: transactionId,
        metadata: {
          status: result.status,
          status_detail: result.status_detail,
          payment_method: result.payment_method_id,
          amount: result.transaction_amount,
          currency: result.currency_id,
          created_at: result.date_created,
          updated_at: result.date_last_updated
        }
      };
    } catch (error) {
      console.error('MercadoPago status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar status no MercadoPago'
      };
    }
  }
}
