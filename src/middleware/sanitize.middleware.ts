import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../utils/sanitize.utils';

// Defense-in-depth layer applied before route handlers.
// Zod validation handles body shape; this strips operator keys from all inputs.
export const sanitize = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeInput(req.query) as Request['query'];
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeInput(req.params) as Request['params'];
  }

  next();
};
