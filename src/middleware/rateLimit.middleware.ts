import { rateLimit } from 'express-rate-limit';

const rateLimitResponse = {
  success: false,
  message: 'Too many requests, please try again later',
};

// General API limit — protects all routes from abuse
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
  skip: (req) =>
    req.path === '/health' || req.path === '/api/payments/webhook',
});

// Stricter limit on login — slows brute-force password attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});

// Booking creation limit — prevents spam bookings from a single IP
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});

// Payment session limit — prevents repeated session creation abuse
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});
