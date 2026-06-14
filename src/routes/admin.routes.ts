import { Router } from 'express';
import { login, getMe } from '../controllers/admin.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { adminLoginSchema } from '../validations/admin.validation';

const router = Router();

// POST /api/admin/auth/login — strict rate limit to slow brute-force attempts
router.post('/login', authLimiter, validate(adminLoginSchema), login);

// GET /api/admin/auth/me — protected, returns current admin profile
router.get('/me', authenticate, getMe);

export default router;
