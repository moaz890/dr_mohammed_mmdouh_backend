import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface AppError extends Error {
  statusCode?: number;
  code?: number; // MongoDB error code (e.g. 11000 = duplicate key)
}

// Global error handler — must have 4 parameters for Express to recognize it as an error handler
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle MongoDB duplicate key error (e.g. duplicate admin email)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists';
  }

  // Handle Mongoose invalid ObjectId (malformed booking ID in URL)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Handle Mongoose schema validation errors
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
  }

  // Handle JWT errors that may bubble up from verifyToken
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  // Handle malformed JSON body from express.json()
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only include the full stack trace in development — never expose internals in production
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
