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

  res.status(statusCode).json({
    success: false,
    message,
    // Only include the full stack trace in development — never expose internals in production
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
