import { Router } from 'express';
import {
  createPaymentSession,
  handleWebhook,
  handleSuccess,
  handleFailure,
} from '../controllers/payment.controller';

const router = Router();

// Task 12: Frontend calls this right after booking is created
// Body: { bookingId: string }
// Returns: { checkoutUrl, sessionId }
router.post('/create-session', createPaymentSession);

// Task 16: Geidea calls this server-to-server with payment result
// NO auth middleware here — Geidea is an external service, not an admin user.
// Security is handled by signature verification inside the controller itself.
router.post('/webhook', handleWebhook);

// Task 14: Geidea redirects patient's browser here after successful payment
router.get('/success', handleSuccess);

// Task 15: Geidea redirects patient's browser here after failed payment
router.get('/failure', handleFailure);

export default router;
