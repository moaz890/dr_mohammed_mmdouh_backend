import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

// Generate a signed JWT token
// Why 7d expiry: Short enough to limit damage if a token is stolen,
// long enough that clinic staff don't have to re-login every day.
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
};

// Verify a token and return its payload
// Returns null instead of throwing — callers decide how to handle invalid tokens
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};
