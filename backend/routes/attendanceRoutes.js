import express from 'express';
import { markAttendance, getAttendanceRecords, getStudentAttendanceHistory, getAnalyticsSummary } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, markAttendance)
  .get(protect, getAttendanceRecords);

router.get('/analytics', protect, getAnalyticsSummary);
router.get('/student/:studentId', protect, getStudentAttendanceHistory);

export default router;
