const authService = require('../services/authService');
const { sendResponse } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../constants/httpStatus');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return sendResponse(
      res,
      HTTP_STATUS.CREATED,
      'Account registered successfully. Please log in.',
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password, res);
    return sendResponse(res, HTTP_STATUS.OK, 'Login successful', { user });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  try {
    authService.logout(res);
    return sendResponse(res, HTTP_STATUS.OK, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendResponse(res, HTTP_STATUS.OK, 'Current user retrieved', { user });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const user = await authService.refreshToken(token, res);
    return sendResponse(res, HTTP_STATUS.OK, 'Token refreshed successfully', { user });
  } catch (error) {
    next(error);
  }
};

const authController = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
};

module.exports = authController;
