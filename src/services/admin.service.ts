import { Admin } from '../models/Admin';
import { generateToken } from '../utils/jwt.utils';
import { AdminLoginInput } from '../validations/admin.validation';

export interface LoginResult {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const loginAdmin = async (data: AdminLoginInput): Promise<LoginResult | null> => {
  // Find admin by email (case-insensitive because email is lowercased in the model)
  const admin = await Admin.findOne({ email: data.email });

  if (!admin) {
    // Return null for both "email not found" AND "wrong password"
    // Why: Never tell the attacker which one is wrong — that narrows their search
    return null;
  }

  const isMatch = await admin.comparePassword(data.password);

  if (!isMatch) {
    return null; // same null — attacker can't distinguish between bad email and bad password
  }

  const token = generateToken({
    id: admin._id.toString(),
    email: admin.email,
    role: admin.role,
  });

  return {
    token,
    admin: {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};
