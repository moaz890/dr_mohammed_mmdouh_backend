import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { sanitize } from './middleware/sanitize.middleware';
import { generalLimiter } from './middleware/rateLimit.middleware';

const app = express();

// Security: Set secure HTTP headers (Task 37)
app.use(
  helmet({
    // API-only backend — allow cross-origin resource access for the frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS: Allow requests from the Next.js frontend
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing: limit payload size to reduce abuse surface
app.use(express.json({ limit: '10kb' }));

// Input sanitization: strip NoSQL operator keys from all inputs (Task 39)
app.use(sanitize);

// Rate limiting: global API protection (Task 38)
app.use(generalLimiter);

// Logging: Log all HTTP requests in development
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/auth', adminRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler (Task 40) ────────────────────────────────────────────
// MUST be registered LAST — Express identifies error handlers by their 4-parameter signature
app.use(errorHandler);

export default app;
