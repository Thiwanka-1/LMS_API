// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Not authorized, user not found or inactive');
    }

    req.user = user;
    next();
  } catch (err) {
    next(new ApiError(401, 'Not authorized, invalid or expired token'));
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin role required'));
  }
  next();
};

// For routes with :id param -> admin OR that same student
export const allowAdminOrSelf = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'student' && req.user._id.toString() === req.params.id) {
    return next();
  }

  return next(new ApiError(403, 'Access denied'));
};
