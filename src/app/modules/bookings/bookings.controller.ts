import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import bookingService from './booking.service';

const createBooking = catchAsync(async (req, res) => {
  const data = req.body;
  const response = await bookingService.createBooking(data);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Post created successfully',
    data: response,
  });
});

const getPaginatedBookings = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['resource', 'requestedBy', 'date']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);

  const result = await bookingService.getPaginatedBookings(filters, options);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Bookings fetched successfully',
    data: result,
  });
});

const getWeeklyBookings = catchAsync(async (req: Request, res: Response) => {
  const { date } = req.query;
  const bookings = await bookingService.getWeeklyBookings(date as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Weekly bookings fetched successfully',
    data: bookings,
  });
});

const checkSlotAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const { resource, startTime, endTime } = req.query;

    const available = await bookingService.checkSlotAvailability({
      resource: resource as string,
      startTime: startTime as string,
      endTime: endTime as string,
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: available
        ? 'Slot is available'
        : 'Slot is not available due to a conflict',
      available,
    });
  }
);

const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await bookingService.deleteBooking(id);

  return res.status(httpStatus.OK).json({
    success: true,
    message: 'Booking deleted successfully',
  });
});

export default {
  createBooking,
  getPaginatedBookings,
  getWeeklyBookings,
  checkSlotAvailability,
  deleteBooking,
};
