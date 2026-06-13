import { Schema, model, Document, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Prevents duplicate admin accounts with the same email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['admin', 'staff'],
      default: 'staff',
      // 'admin' has full access; 'staff' can view but not delete bookings
      // (role-based access control can be added later without schema changes)
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: hash the password before storing
// This runs automatically on every save — no controller can bypass it
AdminSchema.pre('save', async function () {
  // Only hash if the password field was actually modified
  // (avoids re-hashing an already-hashed password on unrelated updates)
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12); // 12 rounds = strong but still fast
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compare a plain-text candidate password against the stored hash
// Used during login — keeps bcrypt logic out of the auth controller
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Admin = model<IAdmin>('Admin', AdminSchema);
