import { PaymentProvider, PaymentData, PaymentResult } from './PaymentProvider';

export class SantanderProvider extends PaymentProvider {
  private baseUrl: string;
  private clientId: string;

  constructor(apiKey: string, clientId: string, environment: 'sandbox' | 'production' = 'sandbox') {
    super(apiKey, environment);
    this.clientId = clientId;
    this.baseUrl = environment === 'sandbox'
      ? 'https://api-sandbox.santander.com.br'
      : 'https://api.santander.com.br';
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/auth/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.apiKey}`)}`
      },
      body: 'grant_type=client_credentials&scope=payments'
    });

    if (!response.ok) {
      throw new Error('Falha na autenticação Santander');
    }

    const data = await response.json();
    return data.access_token;
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        amount: {
          value: paymentData.amount.toFixed(2),
          currency: 'BRL'
        },
        description: paymentData.description,
        reference: `organizesee_${paymentData.planType}_${Date.now()}`,
        payer: {
          email: paymentData.customerEmail,
          name: paymentData.customerName,
          document: {
            type: 'CPF',
            number: paymentData.customerDocument || '11111111111'
          }
        },
        payment_method: {
          type: 'credit_card'
        },
        notification_url: `${window.location.origin}/api/webhooks/santander`
      };

      const response = await fetch(`${this.baseUrl}/payments/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Application-Key': this.clientId
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Santander API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: result.payment_id,
        paymentUrl: result.checkout_url,
        metadata: {
          status: result.status,
          payment_method: result.payment_method?.type,
          reference: result.reference
        }
      };
    } catch (error) {
      console.error('Santander payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no Santander'
      };
    }
  }

  async createSubscription(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        plan: {
          name: `Plano ${paymentData.planType} - Organizesee`,
          description: paymentData.description,
          amount: {
            value: paymentData.amount.toFixed(2),
            currency: 'BRL'
          },
          frequency: paymentData.billingCycle === 'monthly' ? 'MONTHLY' : 'YEARLY'
        },
        subscriber: {
          email: paymentData.customerEmail,
          name: paymentData.customerName,
          document: {
            type: 'CPF',
            number: paymentData.customerDocument || '11111111111'
          }
        },
        start_date: new Date().toISOString(),
        reference: `sub_organizesee_${paymentData.planType}_${Date.now()}`
      };

      const response = await fetch(`${this.baseUrl}/subscriptions/v1/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Application-Key': this.clientId
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Santander subscription error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: result.subscription_id,
        paymentUrl: result.approval_url,
        metadata: {
          status: result.status,
          frequency: result.plan?.frequency,
          start_date: result.start_date
        }
      };
    } catch (error) {
      console.error('Santander subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar assinatura no Santander'
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/subscriptions/v1/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Application-Key': this.clientId
        },
        body: JSON.stringify({
          reason: 'Customer request',
          cancelled_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Santander cancel error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: subscriptionId,
        metadata: {
          status: result.status,
          cancelled_at: result.cancelled_at,
          reason: result.reason
        }
      };
    } catch (error) {
      console.error('Santander cancellation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao cancelar assinatura no Santander'
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/payments/v1/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Application-Key': this.clientId
        }
      });

      if (!response.ok) {
        throw new Error(`Santander status error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: transactionId,
        metadata: {
          status: result.status,
          amount: result.amount?.value,
          currency: result.amount?.currency,
          payment_method: result.payment_method?.type,
          created_at: result.created_at,
          updated_at: result.updated_at
        }
      };
    } catch (error) {
      console.error('Santander status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar status no Santander'
      };
    }
  }
}
