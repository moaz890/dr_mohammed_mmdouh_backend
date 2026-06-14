import { Request, Response } from 'express';

// Catch-all for unmatched routes — must run after all route handlers, before errorHandler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
