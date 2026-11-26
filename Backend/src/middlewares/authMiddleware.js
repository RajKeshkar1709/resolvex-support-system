const User = require('../models/User');
const AppError = require('../utils/appError');
const { verifyAccessToken } = require('../services/tokenService');
const { HTTP_STATUS } = require('../constants/httpStatus');

const authenticateUser = async (req, res, next) => {
  try {
    let token = null;

    // Check cookie first (primary)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not authenticated. Please log in.', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    const decoded = verifyAccessToken(token);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    if (!currentUser.isActive) {
      return next(
        new AppError('User account has been deactivated.', HTTP_STATUS.FORBIDDEN)
      );
    }

    // Attach authenticated user to request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError('Your session has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED)
      );
    }
    return next(
      new AppError('Invalid authentication token.', HTTP_STATUS.UNAUTHORIZED)
    );
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          HTTP_STATUS.FORBIDDEN
        )
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizeRoles,
};
