import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { validate, validateQuery } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { bookingLimiter } from '../middleware/rateLimit.middleware';
import {
  createBookingSchema,
  updateBookingSchema,
  bookingFiltersSchema,
} from '../validations/booking.validation';

const router = Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

// Patient submits booking form
router.post(
  '/',
  bookingLimiter,
  validate(createBookingSchema),
  bookingController.createBooking
);

// Patient/frontend fetches a single booking (e.g. after payment redirect)
router.get('/:id', bookingController.getBookingById);

// ── Admin Routes ──────────────────────────────────────────────────────────────

// Admin dashboard — list all bookings with optional filters
router.get(
  '/admin/all',
  authenticate,
  validateQuery(bookingFiltersSchema),
  bookingController.getAllBookings
);

// Admin updates booking or payment status
router.patch(
  '/admin/:id',
  authenticate,
  validate(updateBookingSchema),
  bookingController.updateBooking
);

export default router;
