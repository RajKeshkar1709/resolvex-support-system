const AppError = require('../utils/appError');
const { HTTP_STATUS } = require('../constants/httpStatus');

const notFoundHandler = (req, res, next) => {
  next(
    new AppError(
      `Cannot find endpoint ${req.method} ${req.originalUrl} on this server`,
      HTTP_STATUS.NOT_FOUND
    )
  );
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    err = new AppError(`Invalid format for ${err.path}: ${err.value}`, HTTP_STATUS.BAD_REQUEST);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new AppError(`Duplicate value entered for ${field}. Please use another value.`, HTTP_STATUS.CONFLICT);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    err = new AppError(`Invalid input data: ${message}`, HTTP_STATUS.BAD_REQUEST);
  }

  // Respond in consistent API format
  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal error occurred',
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
