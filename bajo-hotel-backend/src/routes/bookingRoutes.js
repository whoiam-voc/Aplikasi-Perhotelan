import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All booking routes require authentication
router.post('/', authenticateToken, bookingController.createBooking);
router.get('/', authenticateToken, bookingController.getUserBookings);
router.get('/:id', authenticateToken, bookingController.getBookingById);
router.put('/:id/status', authenticateToken, bookingController.updateBookingStatus); // for admin or checkout processing simulation

export default router;
