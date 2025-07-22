import { Prisma } from '@prisma/client';
import calculatePagination, {
  PaginationOptions,
} from '../../../helpers/pagination';
import prisma from '../../../shared/prisma';

type BookingFilters = {
  resource?: string;
  requestedBy?: string;
  date?: string; // ISO string
};

const getPaginatedBookings = async (
  filters: BookingFilters,
  options: PaginationOptions
) => {
  const {
    limit: take,
    skip,
    page,
    sortBy = 'startTime',
    sortOrder = 'asc',
  } = calculatePagination(options);

  const { date, ...otherFilters } = filters;

  const conditions: Prisma.BookingWhereInput[] = [];

  // Exact match filters (resource, requestedBy)
  if (Object.keys(otherFilters).length > 0) {
    conditions.push({
      AND: Object.entries(otherFilters).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
  }

  // Date range filter (full day)
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    conditions.push({
      startTime: { gte: start, lte: end },
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

export default {
  getPaginatedBookings,
};
