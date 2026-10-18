const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

// Middleware to verify JWT token and attach authenticated user to req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized. Please log in to access this resource.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodspot_super_secure_college_mini_project_secret_key_2026');
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 'The user belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Your login session has expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid token. Authorization denied.', 401);
  }
};

// Middleware to restrict access to administrator accounts only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return sendError(res, 'Access denied. Administrator privileges required.', 403);
};

module.exports = {
  protect,
  adminOnly,
};
