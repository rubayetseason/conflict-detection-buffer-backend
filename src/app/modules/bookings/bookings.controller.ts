import { addMinutes, isBefore, parseISO, subMinutes } from 'date-fns';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import prisma from '../../../shared/prisma';
import bookingService from './booking.service';

const BUFFER_MINUTES = 10;

const createBooking = async (req: Request, res: Response) => {
  const { resource, requestedBy, startTime, endTime, userId } = req.body;
  const start = parseISO(startTime);
  const end = parseISO(endTime);

  if (isBefore(end, start)) {
    return res
      .status(400)
      .json({ message: 'End time must be after start time' });
  }

  const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  if (diffInMinutes < 15) {
    return res.status(400).json({ message: 'Minimum duration is 15 minutes' });
  }

  const bufferedStart = subMinutes(start, BUFFER_MINUTES);
  const bufferedEnd = addMinutes(end, BUFFER_MINUTES);

  const conflict = await prisma.booking.findFirst({
    where: {
      resource,
      AND: [
        { startTime: { lte: bufferedEnd } },
        { endTime: { gte: bufferedStart } },
      ],
    },
  });

  if (conflict) {
    return res.status(400).json({
      message: 'Booking conflicts with an existing one (includes buffer time).',
    });
  }

  const booking = await prisma.booking.create({
    data: {
      resource,
      requestedBy,
      startTime: start,
      endTime: end,
      userId,
    },
  });

  return res.status(201).json({ success: true, data: booking });
};

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

const getBookingById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  return res.json({ success: true, data: booking });
};

const deleteBooking = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.booking.delete({
    where: { id },
  });

  return res.json({ success: true, message: 'Booking deleted successfully' });
};

export default {
  createBooking,
  getPaginatedBookings,
  getBookingById,
  deleteBooking,
};
