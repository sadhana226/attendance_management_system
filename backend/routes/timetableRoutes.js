import express from 'express';
import { getTimetable, addTimetableSlot, removeTimetableSlot } from '../controllers/timetableController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTimetable)
  .post(protect, addTimetableSlot);

router.route('/:id')
  .delete(protect, removeTimetableSlot);

export default router;
