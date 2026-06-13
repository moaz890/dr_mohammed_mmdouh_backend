/**
 * Seed Script — creates the initial admin account
 *
 * Why a script instead of an API endpoint:
 * Admin registration must NEVER be publicly accessible.
 * This script runs once from the server terminal.
 * After the first admin exists, additional admins can be added
 * through the database directly or a future protected admin-only endpoint.
 *
 * Usage: npx ts-node src/scripts/seed-admin.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { Admin } from '../models/Admin';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('Connected to MongoDB');

  const existing = await Admin.findOne({ email: 'admin@clinic.com' });

  if (existing) {
    console.log('Admin already exists. Skipping.');
    process.exit(0);
  }

  await Admin.create({
    name: 'Admin',
    email: 'admin@clinic.com',
    password: 'Admin@12345',   // Change this immediately after first login!
    role: 'admin',
  });

  console.log('✅ Admin created: admin@clinic.com / Admin@12345');
  console.log('⚠️  Change the password immediately after first login!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
