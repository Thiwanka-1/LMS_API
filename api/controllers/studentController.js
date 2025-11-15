// controllers/studentController.js
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/students
 * Admin only – create a student account
 */
export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, age, telephoneNumber } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const student = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'student',
    age,
    telephoneNumber,
  });

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      age: student.age,
      telephoneNumber: student.telephoneNumber,
    },
  });
});

/**
 * GET /api/students
 * Admin only – get all students
 */
export const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).select('-password');
  res.status(200).json({
    success: true,
    count: students.length,
    students,
  });
});

/**
 * GET /api/students/:id
 * Admin OR the student themself
 */
export const getStudentById = asyncHandler(async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: 'student' }).select(
    '-password'
  );

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  res.status(200).json({
    success: true,
    student,
  });
});

/**
 * PATCH /api/students/:id
 * Admin OR the student themself
 */
export const updateStudent = asyncHandler(async (req, res) => {
  const { name, /* email, */ password, age, telephoneNumber, isActive } = req.body;

  const student = await User.findOne({ _id: req.params.id, role: 'student' });

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  if (name !== undefined) student.name = name;
  // ❌ email is intentionally NOT updatable via this endpoint
  // if (email !== undefined) student.email = email;

  if (age !== undefined) student.age = age;
  if (telephoneNumber !== undefined) student.telephoneNumber = telephoneNumber;

  // Only admin can change isActive
  if (isActive !== undefined && req.user.role === 'admin') {
    student.isActive = isActive;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);
  }

  const updated = await student.save();

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    student: {
      id: updated._id,
      name: updated.name,
      email: updated.email, // still returned, but never changed here
      role: updated.role,
      age: updated.age,
      telephoneNumber: updated.telephoneNumber,
      isActive: updated.isActive,
    },
  });
});

/**
 * DELETE /api/students/:id
 * Admin OR the student themself
 */
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: 'student' });

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  await student.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully',
  });
});
