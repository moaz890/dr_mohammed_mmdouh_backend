import { Router } from 'express';
import { login, getMe } from '../controllers/admin.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { adminLoginSchema } from '../validations/admin.validation';

const router = Router();

// Task 20: POST /api/admin/auth/login
// Public — validate body then attempt login
router.post('/login', validate(adminLoginSchema), login);

// GET /api/admin/auth/me — protected, returns current admin profile
// authenticate runs first — if token is invalid, request never reaches getMe
router.get('/me', authenticate, getMe);

export default router;
