import { z } from 'zod';

// ---------- Create Booking ----------

export const createBookingSchema = z.object({
  patientName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),

  phone: z
    .string()
    .regex(
      /^(\+?966|0)?5\d{8}$/,
      'Invalid Egyptian phone number (e.g. 01XXXXXXXX)'
    )
    .trim(),

  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .optional()
    .or(z.literal('')),

  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      // Reject past dates — clinic can't accept bookings for yesterday
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }, 'Appointment date cannot be in the past'),

  appointmentTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'),

  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),

  amount: z.number().min(0, 'Amount cannot be negative'),
});

// Infer the TypeScript type directly from the schema — no manual interface needed
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ---------- Update Booking (admin only) ----------

export const updateBookingSchema = z.object({
  bookingStatus: z
    .enum(['pending', 'confirmed', 'cancelled'])
    .optional(),

  paymentStatus: z
    .enum(['pending', 'paid', 'failed'])
    .optional(),

  notes: z.string().max(500).optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
