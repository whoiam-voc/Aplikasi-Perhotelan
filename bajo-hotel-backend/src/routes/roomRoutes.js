import express from 'express';
import * as roomController from '../controllers/roomController.js';

const router = express.Router();

router.get('/availability', roomController.getRoomsAvailability);

export default router;
