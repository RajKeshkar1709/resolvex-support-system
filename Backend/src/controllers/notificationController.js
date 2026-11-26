const notificationService = require('../services/notificationService');
const { sendResponse } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../constants/httpStatus');

const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(req.user._id, req.query);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      'Notifications retrieved',
      {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
      },
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user._id);
    return sendResponse(res, HTTP_STATUS.OK, 'Unread count retrieved', result);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    return sendResponse(res, HTTP_STATUS.OK, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    return sendResponse(res, HTTP_STATUS.OK, 'All notifications marked as read', result);
  } catch (error) {
    next(error);
  }
};

const notificationController = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

module.exports = notificationController;
