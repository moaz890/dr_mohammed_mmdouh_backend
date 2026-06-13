import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';

// Protects routes that require a logged-in admin
// Why Bearer token in Authorization header (not cookies):
// Our backend and frontend are on different origins.
// httpOnly cookies work cross-origin but require SameSite=None + HTTPS setup.
// Bearer tokens in headers are simpler and equally secure when HTTPS is used in production.
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract token from "Authorization: Bearer <token>" header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    // Token is expired, tampered with, or signed with a different secret
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  // Attach the decoded payload to req.user so downstream controllers know who's calling
  req.user = payload;
  next();
};
