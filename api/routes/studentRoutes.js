// routes/studentRoutes.js
import { Router } from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect, requireAdmin, allowAdminOrSelf } from '../middlewares/authMiddleware.js';

const router = Router();

// Admin creates students
router.post('/', protect, requireAdmin, createStudent);

// Admin gets all students
router.get('/', protect, requireAdmin, getAllStudents);

// Admin or that student by ID
router.get('/:id', protect, allowAdminOrSelf, getStudentById);
router.patch('/:id', protect, allowAdminOrSelf, updateStudent);
router.delete('/:id', protect, allowAdminOrSelf, deleteStudent);

export default router;
