const ActivityLog = require('../models/ActivityLog');
const Ticket = require('../models/Ticket');
const AppError = require('../utils/appError');
const { ROLES } = require('../constants/roles');
const { HTTP_STATUS } = require('../constants/httpStatus');

const getTicketActivity = async (ticketId, currentUser) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
  }

  const isOwner = ticket.createdBy.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError('Not authorized to view activity for this ticket', HTTP_STATUS.FORBIDDEN);
  }

  const activities = await ActivityLog.find({ ticket: ticketId })
    .populate('actor', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  return activities;
};

const activityService = {
  getTicketActivity,
};

module.exports = activityService;
