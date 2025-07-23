import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import bookingsController from './bookings.controller';
import bookingValidator from './bookings.validation';

const bookingRouter = Router();

bookingRouter
  .route('/weekly-booking')
  .get(bookingsController.getWeeklyBookings);

bookingRouter
  .route('/available-slots')
  .get(bookingsController.checkSlotAvailability);

bookingRouter
  .route('/')
  .post(
    validateRequest(bookingValidator.createBookingSchema),
    bookingsController.createBooking
  )
  .get(bookingsController.getPaginatedBookings);

bookingRouter.route('/:id').delete(bookingsController.deleteBooking);

export default bookingRouter;
