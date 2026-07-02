import express from 'express';
import { getStudents, getStudentById, addStudent, updateStudent, deleteStudent, addStudentsBulk } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getStudents)
  .post(protect, addStudent);

router.post('/bulk', protect, addStudentsBulk);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, updateStudent)
  .delete(protect, deleteStudent);

export default router;
