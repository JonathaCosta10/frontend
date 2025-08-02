import { PaymentProvider, PaymentData, PaymentResult } from './PaymentProvider';

export class NubankProvider extends PaymentProvider {
  private baseUrl: string;
  private clientId: string;

  constructor(apiKey: string, clientId: string, environment: 'sandbox' | 'production' = 'sandbox') {
    super(apiKey, environment);
    this.clientId = clientId;
    this.baseUrl = environment === 'sandbox'
      ? 'https://api-sandbox.nubank.com.br'
      : 'https://api.nubank.com.br';
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.apiKey}`)}`
      },
      body: 'grant_type=client_credentials&scope=payments'
    });

    if (!response.ok) {
      throw new Error('Nubank authentication failed');
    }

    const data = await response.json();
    return data.access_token;
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        amount: Math.round(paymentData.amount * 100), // Nubank uses cents
        currency: 'BRL',
        description: paymentData.description,
        customer: {
          email: paymentData.customerEmail,
          name: paymentData.customerName,
          document: paymentData.customerDocument || '11111111111'
        },
        payment_method: {
          type: 'credit_card'
        },
        metadata: {
          plan_type: paymentData.planType,
          billing_cycle: paymentData.billingCycle,
          source: 'organizesee'
        },
        callback_url: `${window.location.origin}/api/webhooks/nubank`,
        reference_id: `organizesee_${paymentData.planType}_${Date.now()}`
      };

      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `${Date.now()}`,
          'User-Agent': 'Organizesee/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Nubank API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: result.id,
        paymentUrl: result.payment_url,
        metadata: {
          status: result.status,
          payment_method: result.payment_method?.type,
          amount: result.amount / 100, // Convert back from cents
          currency: result.currency,
          reference_id: result.reference_id
        }
      };
    } catch (error) {
      console.error('Nubank payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no Nubank'
      };
    }
  }

  async createSubscription(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        amount: Math.round(paymentData.amount * 100), // Nubank uses cents
        currency: 'BRL',
        interval: paymentData.billingCycle === 'monthly' ? 'month' : 'year',
        interval_count: 1,
        product_name: `Plano ${paymentData.planType} - Organizesee`,
        description: paymentData.description,
        customer: {
          email: paymentData.customerEmail,
          name: paymentData.customerName,
          document: paymentData.customerDocument || '11111111111'
        },
        trial_period_days: 0,
        metadata: {
          plan_type: paymentData.planType,
          source: 'organizesee'
        },
        webhook_url: `${window.location.origin}/api/webhooks/nubank/subscription`,
        reference_id: `sub_organizesee_${paymentData.planType}_${Date.now()}`
      };

      const response = await fetch(`${this.baseUrl}/v1/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `sub-${Date.now()}`,
          'User-Agent': 'Organizesee/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Nubank subscription error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: result.id,
        paymentUrl: result.checkout_url,
        metadata: {
          status: result.status,
          interval: result.interval,
          interval_count: result.interval_count,
          amount: result.amount / 100,
          currency: result.currency,
          reference_id: result.reference_id
        }
      };
    } catch (error) {
      console.error('Nubank subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar assinatura no Nubank'
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v1/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Organizesee/1.0'
        },
        body: JSON.stringify({
          cancel_at_period_end: false,
          reason: 'requested_by_customer'
        })
      });

      if (!response.ok) {
        throw new Error(`Nubank cancel error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: subscriptionId,
        metadata: {
          status: result.status,
          cancelled_at: result.cancelled_at,
          reason: result.cancel_reason
        }
      };
    } catch (error) {
      console.error('Nubank cancellation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao cancelar assinatura no Nubank'
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v1/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Organizesee/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Nubank status error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: transactionId,
        metadata: {
          status: result.status,
          amount: result.amount / 100, // Convert from cents
          currency: result.currency,
          payment_method: result.payment_method?.type,
          reference_id: result.reference_id,
          created_at: result.created_at,
          updated_at: result.updated_at,
          fees: result.fees ? result.fees.map((fee: any) => ({
            type: fee.type,
            amount: fee.amount / 100
          })) : []
        }
      };
    } catch (error) {
      console.error('Nubank status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar status no Nubank'
      };
    }
  }
}
