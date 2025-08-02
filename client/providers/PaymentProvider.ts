export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  customerDocument?: string;
  billingCycle: 'monthly' | 'yearly';
  planType: 'premium' | 'enterprise';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class PaymentProvider {
  protected apiKey: string;
  protected environment: 'sandbox' | 'production';

  constructor(apiKey: string, environment: 'sandbox' | 'production' = 'sandbox') {
    this.apiKey = apiKey;
    this.environment = environment;
  }

  abstract processPayment(paymentData: PaymentData): Promise<PaymentResult>;
  abstract createSubscription(paymentData: PaymentData): Promise<PaymentResult>;
  abstract cancelSubscription(subscriptionId: string): Promise<PaymentResult>;
  abstract getPaymentStatus(transactionId: string): Promise<PaymentResult>;
}
