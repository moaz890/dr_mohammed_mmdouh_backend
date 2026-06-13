import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';
import { CreateBookingInput, UpdateBookingInput } from '../validations/booking.validation';

// ---------- Task 7 ----------
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as CreateBookingInput;
    const booking = await bookingService.createBooking(data);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error); // pass to global error handler — never swallow errors silently
  }
};

// ---------- Task 8 ----------
export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await bookingService.getBookingById(req.params.id as string);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ---------- Task 9 ----------
export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Query params come in as strings — pass them directly; service handles undefined
    const { bookingStatus, paymentStatus, search } = req.query as {
      bookingStatus?: string;
      paymentStatus?: string;
      search?: string;
    };

    const bookings = await bookingService.getAllBookings({
      bookingStatus,
      paymentStatus,
      search,
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Task 10 ----------
export const updateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as UpdateBookingInput;
    const booking = await bookingService.updateBooking(req.params.id as string, data);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
