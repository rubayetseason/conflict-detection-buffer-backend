import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import bookingRouter from '../modules/bookings/bookings.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    routes: AuthRoutes,
  },
  {
    path: '/bookings',
    routes: bookingRouter,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.routes));
export default router;
