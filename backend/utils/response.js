// Consistent JSON response helpers for food spot REST API

const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
  const payload = {
    success: false,
    message,
  };
  if (error && process.env.NODE_ENV === 'development') {
    payload.error = error;
  }
  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
