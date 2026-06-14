import { Router } from 'express';
import {
  createPaymentSession,
  handleWebhook,
  handleSuccess,
  handleFailure,
} from '../controllers/payment.controller';
import { validate } from '../middleware/validate.middleware';
import { paymentLimiter } from '../middleware/rateLimit.middleware';
import { createPaymentSessionSchema } from '../validations/payment.validation';

const router = Router();

// Frontend calls this right after booking is created
router.post(
  '/create-session',
  paymentLimiter,
  validate(createPaymentSessionSchema),
  createPaymentSession
);

// Geidea calls this server-to-server with payment result
// NO auth middleware — security is handled by signature verification in the controller
router.post('/webhook', handleWebhook);

// Geidea redirects patient's browser here after successful payment
router.get('/success', handleSuccess);

// Geidea redirects patient's browser here after failed payment
router.get('/failure', handleFailure);

export default router;
