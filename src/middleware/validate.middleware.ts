import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Generic middleware factory: takes any Zod schema, returns an Express middleware
// Why factory pattern: one function covers ALL routes — no copy-pasting validation logic
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Format Zod v4 errors into a clean array for the frontend to consume
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    // Overwrite req.body with the sanitized, transformed result
    // (e.g. .trim() and .toLowerCase() are applied by Zod during parse)
    req.body = result.data;
    next();
  };

// Same factory pattern as validate(), but for query string parameters
export const validateQuery =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    req.query = result.data as Request['query'];
    next();
  };
