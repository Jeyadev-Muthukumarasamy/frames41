import crypto from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';

/**
 * Razorpay order response
 */
interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

/**
 * Razorpay payment response
 */
interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  captured: boolean;
  order_id: string;
}

/**
 * Razorpay client
 * Simple HTTP client for Razorpay API
 */
export class RazorpayClient {
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly baseUrl = 'https://api.razorpay.com/v1';

  constructor() {
    this.keyId = env.RAZORPAY_KEY_ID || '';
    this.keySecret = env.RAZORPAY_KEY_SECRET || '';

    if (!this.keyId || !this.keySecret) {
      logger.warn('Razorpay credentials not configured');
    }
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const init: RequestInit = {
      method,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      init.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, init);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Razorpay API error: ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Create Razorpay order
   */
  async createOrder(amount: number, receipt: string, notes?: Record<string, string>): Promise<RazorpayOrder> {
    // Convert amount to paise (smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    return this.request<RazorpayOrder>('POST', '/orders', {
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes,
    });
  }

  /**
   * Fetch payment details
   */
  async fetchPayment(paymentId: string): Promise<RazorpayPayment> {
    return this.request<RazorpayPayment>('GET', `/payments/${paymentId}`);
  }

  /**
   * Verify payment signature
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (signature.length !== expectedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature.length !== expectedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}

// Export singleton instance
export const razorpayClient = new RazorpayClient();
