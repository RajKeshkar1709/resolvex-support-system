const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const { HTTP_STATUS } = require('../constants/httpStatus');

const getUserNotifications = async (userId, queryOptions) => {
  const { page = 1, limit = 20 } = queryOptions;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter = { recipient: userId };

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('ticket', 'ticketNumber title status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
  return { unreadCount: count };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return { message: 'All notifications marked as read' };
};

const notificationService = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

module.exports = notificationService;
