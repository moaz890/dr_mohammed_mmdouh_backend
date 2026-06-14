import { z } from 'zod';

export const createPaymentSessionSchema = z.object({
  bookingId: z
    .string()
    .regex(/^[a-f0-9]{24}$/i, 'Invalid booking ID format')
    .trim(),
});

export type CreatePaymentSessionInput = z.infer<typeof createPaymentSessionSchema>;
