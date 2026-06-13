import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security: Set secure HTTP headers
app.use(helmet());

// CORS: Allow requests from the Next.js frontend
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing: Parse incoming JSON request bodies
app.use(express.json());

// Logging: Log all HTTP requests in development
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
// All booking endpoints live under /api/bookings
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
// MUST be registered LAST — Express identifies error handlers by their 4-parameter signature
app.use(errorHandler);

export default app;
