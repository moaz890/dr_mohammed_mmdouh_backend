import { Booking, IBooking } from '../models/Booking';
import { CreateBookingInput, UpdateBookingInput } from '../validations/booking.validation';

// ---------- Task 7: Create Booking ----------
// Why: Separating creation logic here means we can call it from the payment flow too
// without duplicating code. The controller just hands us validated data.
export const createBooking = async (
  data: CreateBookingInput
): Promise<IBooking> => {
  const booking = await Booking.create({
    ...data,
    // These statuses are always set by the server, never trusted from the client
    paymentStatus: 'pending',
    bookingStatus: 'pending',
    // Normalize empty email to undefined so it's not stored as an empty string
    email: data.email || undefined,
  });

  return booking;
};

// ---------- Task 8: Get Booking By ID ----------
// Why public: After Geidea redirects the patient back, the frontend fetches
// this to display the confirmation/failure page
export const getBookingById = async (id: string): Promise<IBooking | null> => {
  return Booking.findById(id);
};

// ---------- Task 9: Get All Bookings (Admin) ----------
// Supports optional filtering by status so the dashboard can filter
// without fetching everything and filtering on the frontend (expensive)
export const getAllBookings = async (filters: {
  bookingStatus?: string;
  paymentStatus?: string;
  search?: string; // search by patient name or phone
}): Promise<IBooking[]> => {
  const query: Record<string, unknown> = {};

  if (filters.bookingStatus) {
    query.bookingStatus = filters.bookingStatus;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.search) {
    // $or lets us search across multiple fields with one query
    query.$or = [
      { patientName: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } },
    ];
  }

  // Most recent bookings first — clinic staff always cares about today's appointments
  return Booking.find(query).sort({ createdAt: -1 });
};

// ---------- Task 10: Update Booking (Admin) ----------
// Why runValidators: ensures enum values (pending/confirmed/cancelled) are enforced
// even on updates — not just on initial creation
export const updateBooking = async (
  id: string,
  data: UpdateBookingInput
): Promise<IBooking | null> => {
  return Booking.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
};
