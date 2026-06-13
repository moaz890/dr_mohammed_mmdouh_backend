import { Request, Response, NextFunction } from 'express';
import { loginAdmin } from '../services/admin.service';
import { AdminLoginInput } from '../validations/admin.validation';

// Task 20: Admin Login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as AdminLoginInput;
    const result = await loginAdmin(data);

    if (!result) {
      // Generic message — don't reveal whether email or password was wrong
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/auth/me — returns the currently logged-in admin's profile
// Why useful: Frontend uses this on page load to verify the token is still valid
// and to restore the admin's name/role without storing it in localStorage
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user is populated by the authenticate middleware
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};
