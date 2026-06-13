import { Schema, model, Document } from 'mongoose';

export interface IBooking extends Document {
  patientName: string;
  phone: string;
  email?: string;
  appointmentDate: string; // stored as ISO date string (YYYY-MM-DD) for simplicity
  appointmentTime: string; // stored as "HH:MM" string — avoids timezone math on the server
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  amount: number;
  transactionId?: string; // assigned by Geidea after payment session is created
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      // Optional — clinic contacts patients via WhatsApp primarily
    },
    appointmentDate: {
      type: String,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      // Always starts as pending — only Geidea webhook changes this to paid/failed
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      // Becomes confirmed only after successful payment webhook
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    transactionId: {
      type: String,
      // Set by Geidea when a payment session is created
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields — no manual date management
    timestamps: true,
  }
);

// Index on phone for fast lookup when admin searches by patient phone
BookingSchema.index({ phone: 1 });

// Index on paymentStatus + bookingStatus for efficient dashboard filtering
BookingSchema.index({ paymentStatus: 1, bookingStatus: 1 });

export const Booking = model<IBooking>('Booking', BookingSchema);
