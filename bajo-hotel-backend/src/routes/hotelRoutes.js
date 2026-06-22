import express from 'express';
import * as hotelController from '../controllers/hotelController.js';

const router = express.Router();

router.get('/', hotelController.getHotels);
router.get('/:id', hotelController.getHotelById);

export default router;
