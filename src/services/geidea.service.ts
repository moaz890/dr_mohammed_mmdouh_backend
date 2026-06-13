import axios from 'axios';
import crypto from 'crypto';
import { env } from '../config/env';

// The shape of data we send to Geidea to create a payment session
interface CreateSessionPayload {
  amount: number;
  currency: string;
  merchantReferenceId: string; // our booking._id — links Geidea's order back to our DB
  callbackUrl: string;         // webhook URL: Geidea POSTs payment result here
  returnUrl: string;           // redirect URL: patient's browser lands here after payment
  language?: 'ar' | 'en';
}

// The shape of what Geidea returns
interface GeideaSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}

export class GeideaService {
  private readonly baseUrl: string;
  private readonly merchantKey: string;
  private readonly apiPassword: string;

  constructor() {
    this.baseUrl = env.GEIDEA_BASE_URL;
    this.merchantKey = env.GEIDEA_MERCHANT_PUBLIC_KEY;
    this.apiPassword = env.GEIDEA_API_PASSWORD;
  }

  // ── Create Payment Session ──────────────────────────────────────────────────
  // Why: Geidea requires a server-to-server call first to get a checkout URL.
  // The patient's browser never talks to Geidea directly before this step.
  async createSession(payload: CreateSessionPayload): Promise<GeideaSessionResponse> {
    // Generate a timestamp for the request signature
    const timestamp = new Date().toISOString();

    // Build the signature:
    // Geidea uses HMAC-SHA256 on a concatenated string of specific fields.
    // This proves the request came from us — not from someone who intercepted the network.
    const signatureData = `${this.merchantKey}${timestamp}${payload.amount.toFixed(2)}${payload.currency}`;
    const signature = crypto
      .createHmac('sha256', this.apiPassword)
      .update(signatureData)
      .digest('hex');

    const response = await axios.post(
      `${this.baseUrl}/payment/v1/session`,
      {
        amount: payload.amount,
        currency: payload.currency,
        merchantReferenceId: payload.merchantReferenceId,
        callbackUrl: payload.callbackUrl,
        returnUrl: payload.returnUrl,
        language: payload.language || 'ar',
        timestamp,
        signature,
        merchantPublicKey: this.merchantKey,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        // 10 second timeout — if Geidea is slow, fail fast rather than hanging
        timeout: 10000,
      }
    );

    return {
      sessionId: response.data.session?.id,
      checkoutUrl: response.data.session?.checkoutUrl,
    };
  }

  // ── Verify Webhook Signature ────────────────────────────────────────────────
  // Why: Anyone on the internet can POST to your webhook URL.
  // Without signature verification, an attacker could fake a "payment success"
  // and get their booking confirmed for free.
  // Geidea signs its webhook payloads — we verify that signature here.
  verifyWebhookSignature(payload: {
    merchantReferenceId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    timestamp: string;
    signature: string;
  }): boolean {
    const { merchantReferenceId, orderId, amount, currency, status, timestamp, signature } = payload;

    const signatureData = `${this.merchantKey}${timestamp}${amount.toFixed(2)}${currency}${orderId}${merchantReferenceId}${status}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.apiPassword)
      .update(signatureData)
      .digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    // (comparing strings character-by-character leaks info about how close a guess is)
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch {
      return false;
    }
  }
}

// Export a singleton so we don't recreate the class on every request
export const geideaService = new GeideaService();
