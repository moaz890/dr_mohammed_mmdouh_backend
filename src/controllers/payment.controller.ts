import { Request, Response, NextFunction } from 'express';
import { geideaService } from '../services/geidea.service';
import { Booking } from '../models/Booking';
import { env } from '../config/env';

// ── Create Payment Session ──────────────────────────────────────────
export const createPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.body as { bookingId: string };

    // Find the booking — we need the amount and to verify it exists
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Safety check: don't create a new session for an already-paid booking
    if (booking.paymentStatus === 'paid') {
      res.status(400).json({ success: false, message: 'Booking is already paid' });
      return;
    }

    // Build the session with our booking ID as merchantReferenceId
    // This is the key that links Geidea's order back to our MongoDB booking
    const session = await geideaService.createSession({
      amount: booking.amount,
      currency: 'EGP',
      merchantReferenceId: booking._id.toString(),
      // Geidea calls this webhook to tell us the payment result (server-to-server)
      callbackUrl: `${env.BACKEND_URL}/api/payments/webhook`,
      // Geidea redirects the patient's browser here after payment
      returnUrl: `${env.FRONTEND_URL}/ar/booking/${booking._id}`,
      language: 'ar',
    });

    // Store the Geidea session ID on the booking for traceability
    // If a dispute arises later, we can map our booking to Geidea's records
    await Booking.findByIdAndUpdate(bookingId, {
      transactionId: session.sessionId,
    });

    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: session.checkoutUrl,
        sessionId: session.sessionId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Webhook Endpoint ─────────────────────────────────────────────────
// Geidea calls this server-to-server after every payment attempt.
// This is the ONLY place where we update booking/payment status in the DB.
// It does NOT depend on the patient's browser — it fires even if they close the tab.
export const handleWebhook = async (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Promise<void> => {
  const payload = req.body as {
    merchantReferenceId: string; // our booking._id
    orderId: string;             // Geidea's internal order ID
    amount: number;
    currency: string;
    status: string;              // "Success" | "Failed"
    timestamp: string;
    signature: string;
  };

  // ── Verify Webhook Signature ──────────────────────────────────────
  // If the signature doesn't match, this is NOT from Geidea — reject it.
  // We return 401 here (not 200) because we want Geidea to know it sent bad data.
  // For ALL other errors below we return 200 to prevent Geidea retrying forever.
  const isValid = geideaService.verifyWebhookSignature(payload);
  if (!isValid) {
    res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    return;
  }

  const { merchantReferenceId, orderId, status } = payload;

  // Find the booking using merchantReferenceId (which is our booking._id)
  const booking = await Booking.findById(merchantReferenceId);

  if (!booking) {
    // Return 200 so Geidea doesn't retry — this booking genuinely doesn't exist
    res.status(200).json({ success: true, message: 'Booking not found, acknowledged' });
    return;
  }

  // Guard: Don't process the same payment twice
  // (Geidea may send duplicate webhooks if the first didn't get a timely 200)
  if (booking.paymentStatus === 'paid') {
    res.status(200).json({ success: true, message: 'Already processed' });
    return;
  }

  if (status === 'Success') {
    // ── Handle Successful Payment ─────────────────────────────────
    // Both statuses update together atomically — a confirmed booking must be paid.
    // We also save Geidea's orderId so we can reference it in Geidea's portal later.
    await Booking.findByIdAndUpdate(merchantReferenceId, {
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      transactionId: orderId, // update to Geidea's actual orderId (more useful than sessionId)
    });

    console.log(`✅ Payment confirmed for booking ${merchantReferenceId}`);
  } else {
    // ──  Failed Payment ─────────────────────────────────────
    // bookingStatus stays 'pending' — the patient can retry payment later.
    // We only update paymentStatus to reflect the failed attempt.
    await Booking.findByIdAndUpdate(merchantReferenceId, {
      paymentStatus: 'failed',
    });

    console.log(`❌ Payment failed for booking ${merchantReferenceId}`);
  }

  // Always respond 200 to Geidea — this ACKs receipt of the webhook.
  // If we return anything else, Geidea will retry the webhook repeatedly.
  res.status(200).json({ success: true });
};

// ── Task 14: Payment Success Redirect ─────────────────────────────────────────
// Geidea redirects the patient's browser here after successful payment.
// UI only — the DB was already updated by the webhook above.
export const handleSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { merchantReferenceId } = req.query as { merchantReferenceId?: string };

    if (!merchantReferenceId) {
      res.redirect(`${env.FRONTEND_URL}/ar/booking/failure`);
      return;
    }

    res.redirect(`${env.FRONTEND_URL}/ar/booking/${merchantReferenceId}?status=success`);
  } catch (error) {
    next(error);
  }
};

// ── Payment Failure Redirect ─────────────────────────────────────────
export const handleFailure = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { merchantReferenceId } = req.query as { merchantReferenceId?: string };

    const failureUrl = merchantReferenceId
      ? `${env.FRONTEND_URL}/ar/booking/${merchantReferenceId}?status=failed`
      : `${env.FRONTEND_URL}/ar/booking/failure`;

    res.redirect(failureUrl);
  } catch (error) {
    next(error);
  }
};
