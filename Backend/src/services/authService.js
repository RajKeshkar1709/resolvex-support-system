const User = require('../models/User');
const AppError = require('../utils/appError');
const { ROLES } = require('../constants/roles');
const { HTTP_STATUS } = require('../constants/httpStatus');
const {
  verifyRefreshToken,
  sendTokenCookies,
  clearTokenCookies,
} = require('./tokenService');

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists', HTTP_STATUS.CONFLICT);
  }

  // Explicitly enforce USER role for public registration
  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.USER,
  });

  return user;
};

const login = async (email, password, res) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError('Account has been deactivated. Please contact support.', HTTP_STATUS.FORBIDDEN);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  sendTokenCookies(res, user);

  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

const logout = (res) => {
  clearTokenCookies(res);
};

const refreshToken = async (token, res) => {
  if (!token) {
    throw new AppError('No refresh token provided', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError('User not found or deactivated', HTTP_STATUS.UNAUTHORIZED);
    }

    sendTokenCookies(res, user);
    return user;
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
  }
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }
  return user;
};

const authService = {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
};

module.exports = authService;
