// controllers/adminController.js
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/admins
 * Admin only – get all admin accounts
 */
export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' }).select('-password');
  res.status(200).json({
    success: true,
    count: admins.length,
    admins,
  });
});

/**
 * GET /api/admins/:id
 * Admin only – get a specific admin by ID
 */
export const getAdminById = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ _id: req.params.id, role: 'admin' }).select(
    '-password'
  );

  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  res.status(200).json({
    success: true,
    admin,
  });
});

/**
 * PATCH /api/admins/:id
 * Admin only – update an admin (including self)
 */
export const updateAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, age, telephoneNumber, isActive } = req.body;

  const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  if (name !== undefined) admin.name = name;
  if (email !== undefined) admin.email = email;
  if (age !== undefined) admin.age = age;
  if (telephoneNumber !== undefined) admin.telephoneNumber = telephoneNumber;

  // allow admin to deactivate another admin if you want
  if (isActive !== undefined) {
    admin.isActive = isActive;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
  }

  const updated = await admin.save();

  res.status(200).json({
    success: true,
    message: 'Admin updated successfully',
    admin: {
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      age: updated.age,
      telephoneNumber: updated.telephoneNumber,
      isActive: updated.isActive,
    },
  });
});

/**
 * DELETE /api/admins/:id
 * Admin only – delete an admin
 * (Optional safety: prevent deleting the last admin)
 */
export const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ _id: req.params.id, role: 'admin' });

  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  const adminCount = await User.countDocuments({ role: 'admin' });

  // Optional guard: don't let them delete the only admin
  if (adminCount <= 1) {
    throw new ApiError(400, 'Cannot delete the only admin account');
  }

  await admin.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Admin deleted successfully',
  });
});
