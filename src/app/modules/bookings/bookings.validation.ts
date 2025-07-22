import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    resource: z.string().min(1, 'Resource is required'),
    requestedBy: z.string().min(1, 'Requested by is required'),
    startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid start time',
    }),
    endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid end time',
    }),
    userId: z.string().min(1, 'User ID is required'),
  }),
});

export const bookingValidator = {
  createBookingSchema,
};

export default bookingValidator;
