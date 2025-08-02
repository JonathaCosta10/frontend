import { PaymentProvider, PaymentData, PaymentResult } from './PaymentProvider';

export class PayPalProvider extends PaymentProvider {
  private baseUrl: string;
  private clientId: string;

  constructor(apiKey: string, clientId: string, environment: 'sandbox' | 'production' = 'sandbox') {
    super(apiKey, environment);
    this.clientId = clientId;
    this.baseUrl = environment === 'sandbox'
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.apiKey}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error('PayPal authentication failed');
    }

    const data = await response.json();
    return data.access_token;
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'BRL',
            value: paymentData.amount.toFixed(2)
          },
          description: paymentData.description,
          custom_id: `organizesee_${paymentData.planType}_${Date.now()}`,
          payee: {
            email_address: 'payments@organizesee.com'
          }
        }],
        payer: {
          email_address: paymentData.customerEmail,
          name: {
            given_name: paymentData.customerName.split(' ')[0],
            surname: paymentData.customerName.split(' ').slice(1).join(' ')
          }
        },
        application_context: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
          cancel_url: `${window.location.origin}/pagamento?payment=cancelled`,
          brand_name: 'Organizesee',
          locale: 'pt-BR',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW'
        }
      };

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `organizesee-${Date.now()}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`PayPal API error: ${response.statusText}`);
      }

      const result = await response.json();
      const approveLink = result.links?.find((link: any) => link.rel === 'approve');

      return {
        success: true,
        transactionId: result.id,
        paymentUrl: approveLink?.href,
        metadata: {
          status: result.status,
          intent: result.intent,
          create_time: result.create_time
        }
      };
    } catch (error) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no PayPal'
      };
    }
  }

  async createSubscription(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      // First create a plan
      const planPayload = {
        product_id: 'ORGANIZESEE_PRODUCT',
        name: `Plano ${paymentData.planType} - Organizesee`,
        description: paymentData.description,
        billing_cycles: [{
          frequency: {
            interval_unit: paymentData.billingCycle === 'monthly' ? 'MONTH' : 'YEAR',
            interval_count: 1
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: paymentData.amount.toFixed(2),
              currency_code: 'BRL'
            }
          }
        }],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3
        }
      };

      const planResponse = await fetch(`${this.baseUrl}/v1/billing/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `plan-${Date.now()}`
        },
        body: JSON.stringify(planPayload)
      });

      const plan = await planResponse.json();

      // Now create subscription
      const subscriptionPayload = {
        plan_id: plan.id,
        start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
        subscriber: {
          email_address: paymentData.customerEmail,
          name: {
            given_name: paymentData.customerName.split(' ')[0],
            surname: paymentData.customerName.split(' ').slice(1).join(' ')
          }
        },
        application_context: {
          brand_name: 'Organizesee',
          locale: 'pt-BR',
          return_url: `${window.location.origin}/dashboard?subscription=success`,
          cancel_url: `${window.location.origin}/pagamento?subscription=cancelled`
        },
        custom_id: `sub_organizesee_${paymentData.planType}_${Date.now()}`
      };

      const subscriptionResponse = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `sub-${Date.now()}`
        },
        body: JSON.stringify(subscriptionPayload)
      });

      if (!subscriptionResponse.ok) {
        throw new Error(`PayPal subscription error: ${subscriptionResponse.statusText}`);
      }

      const subscription = await subscriptionResponse.json();
      const approveLink = subscription.links?.find((link: any) => link.rel === 'approve');

      return {
        success: true,
        transactionId: subscription.id,
        paymentUrl: approveLink?.href,
        metadata: {
          status: subscription.status,
          plan_id: subscription.plan_id,
          start_time: subscription.start_time
        }
      };
    } catch (error) {
      console.error('PayPal subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar assinatura no PayPal'
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reason: 'Customer requested cancellation'
        })
      });

      if (!response.ok) {
        throw new Error(`PayPal cancel error: ${response.statusText}`);
      }

      return {
        success: true,
        transactionId: subscriptionId,
        metadata: {
          status: 'CANCELLED',
          cancelled_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('PayPal cancellation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao cancelar assinatura no PayPal'
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`PayPal status error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        transactionId: transactionId,
        metadata: {
          status: result.status,
          intent: result.intent,
          amount: result.purchase_units?.[0]?.amount?.value,
          currency: result.purchase_units?.[0]?.amount?.currency_code,
          create_time: result.create_time,
          update_time: result.update_time
        }
      };
    } catch (error) {
      console.error('PayPal status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar status no PayPal'
      };
    }
  }
}
