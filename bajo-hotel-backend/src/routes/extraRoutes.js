import express from 'express';
import * as extraController from '../controllers/extraController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Master Data Routes
router.get('/vehicles', extraController.getVehicles);
router.get('/tour-guides', extraController.getTourGuides);
router.get('/shuttle-services', extraController.getShuttleServices);

// Addon Booking Routes
router.post('/bookings/:bookingId/vehicles', authenticateToken, extraController.bookVehicle);
router.post('/bookings/:bookingId/tour-guides', authenticateToken, extraController.bookTourGuide);
router.post('/bookings/:bookingId/shuttle', authenticateToken, extraController.bookShuttle);

export default router;
