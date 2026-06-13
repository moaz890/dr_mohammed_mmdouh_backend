import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { createBookingSchema, updateBookingSchema } from '../validations/booking.validation';

const router = Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

// Patient submits booking form
// validate middleware runs BEFORE controller — invalid data never reaches the DB
router.post('/', validate(createBookingSchema), bookingController.createBooking);

// Patient/frontend fetches a single booking (e.g. after payment redirect)
router.get('/:id', bookingController.getBookingById);

// ── Admin Routes ──────────────────────────────────────────────────────────────

// Admin dashboard — list all bookings with optional filters
// authenticate: must have a valid JWT to access admin data
router.get('/admin/all', authenticate, bookingController.getAllBookings);

// Admin updates booking or payment status
router.patch('/admin/:id', authenticate, validate(updateBookingSchema), bookingController.updateBooking);

export default router;
