import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema, updateBookingSchema } from '../validations/booking.validation';

const router = Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

// Task 7: Patient submits booking form
// validate middleware runs BEFORE controller — invalid data never reaches the DB
router.post('/', validate(createBookingSchema), bookingController.createBooking);

// Task 8: Patient/frontend fetches a single booking (e.g. after payment redirect)
router.get('/:id', bookingController.getBookingById);

// ── Admin Routes ──────────────────────────────────────────────────────────────
// Note: auth middleware will be added in Phase 7 (Task 22)
// Keeping admin routes in the same file for now and splitting later is easier
// than splitting prematurely and having to merge

// Task 9: Admin dashboard — list all bookings with optional filters
router.get('/admin/all', bookingController.getAllBookings);

// Task 10: Admin updates booking or payment status
router.patch('/admin/:id', validate(updateBookingSchema), bookingController.updateBooking);

export default router;
