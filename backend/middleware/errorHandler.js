// Centralized error handling middleware for ALTS FOOD spot API
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging during development
  console.error('API Error:', err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `The requested item or resource could not be found (${err.value}).`;
    return sendError(res, message, 404);
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `An account or record already exists with this ${field}.`;
    return sendError(res, message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return sendError(res, message, 400);
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token. Please sign in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Your session has expired. Please log in again.', 401);
  }

  // Default to 500 Server Error
  return sendError(res, error.message || 'Internal Server Error', error.statusCode || 500, err);
};

module.exports = errorHandler;
