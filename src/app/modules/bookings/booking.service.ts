import { Booking, Prisma } from '@prisma/client';
import {
  addDays,
  addMinutes,
  endOfDay,
  isBefore,
  parseISO,
  startOfDay,
  subMinutes,
} from 'date-fns';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import calculatePagination, {
  PaginationOptions,
} from '../../../helpers/pagination';
import prisma from '../../../shared/prisma';
import { BUFFER_MINUTES } from './booking.constants';
import { IBookingFilters, SlotCheckParams } from './bookings.interface';

const createBooking = async (data: Booking) => {
  const { resource, requestedBy, startTime, endTime, userId } = data;
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isBefore(end, start)) {
    throw new ApiError(400, 'End time must be after start time');
  }

  const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  if (diffInMinutes < 15) {
    throw new ApiError(400, 'Minimum duration is 15 minutes');
  }

  if (diffInMinutes > 120) {
    throw new ApiError(400, 'Maximum duration is 2 hours');
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
    throw new ApiError(
      400,
      'Booking conflicts with an existing one (includes buffer time).'
    );
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

  return booking;
};

const getPaginatedBookings = async (
  filters: IBookingFilters,
  options: PaginationOptions
) => {
  const {
    limit: take,
    skip,
    page,
    sortBy = 'startTime',
    sortOrder = 'asc',
  } = calculatePagination(options);

  const { startDate, endDate, ...otherFilters } = filters;

  const conditions: Prisma.BookingWhereInput[] = [];

  // Exact match filters (resource, requestedBy)
  if (Object.keys(otherFilters).length > 0) {
    conditions.push({
      AND: Object.entries(otherFilters).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
  }

  if (startDate && endDate) {
    conditions.push({
      startTime: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    });
  }

  const whereCondition = conditions.length ? { AND: conditions } : {};

  const [result, total] = await Promise.all([
    prisma.booking.findMany({
      where: whereCondition,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
    }),
    prisma.booking.count({ where: whereCondition }),
  ]);

  return {
    meta: { total, page, limit: take },
    data: result,
  };
};

const getWeeklyBookings = async (dateStr: string) => {
  if (!dateStr) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Date is required');
  }

  const startDate = startOfDay(new Date(dateStr));
  const endDate = endOfDay(addDays(startDate, 6)); // 7 days inclusive

  const bookings = await prisma.booking.findMany({
    where: {
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  return bookings;
};

const checkSlotAvailability = async ({
  resource,
  startTime,
  endTime,
}: SlotCheckParams): Promise<boolean> => {
  if (!resource || !startTime || !endTime) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameters');
  }

  const start = parseISO(startTime);
  const end = parseISO(endTime);

  if (isBefore(end, start)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'End time must be after start time'
    );
  }

  const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  if (diffInMinutes < 15) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Minimum duration is 15 minutes'
    );
  }
  if (diffInMinutes > 120) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Maximum duration is 2 hours');
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

  return !conflict;
};

const deleteBooking = async (id: string): Promise<void> => {
  const existing = await prisma.booking.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  await prisma.booking.delete({
    where: { id },
  });
};

export default {
  createBooking,
  getPaginatedBookings,
  getWeeklyBookings,
  checkSlotAvailability,
  deleteBooking,
};
