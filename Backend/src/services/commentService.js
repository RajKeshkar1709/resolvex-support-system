const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const AppError = require('../utils/appError');
const { ROLES } = require('../constants/roles');
const { HTTP_STATUS } = require('../constants/httpStatus');
const eventBus = require('../events/eventBus');
const EVENT_NAMES = require('../events/eventNames');

const addComment = async (ticketId, message, currentUser) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
  }

  const isOwner = ticket.createdBy.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError('You can only comment on tickets that belong to you', HTTP_STATUS.FORBIDDEN);
  }

  const comment = await Comment.create({
    ticket: ticketId,
    user: currentUser._id,
    message,
  });

  await comment.populate('user', 'name email role');

  // Emit event for activity logging and counter-party notification
  eventBus.emit(EVENT_NAMES.COMMENT_ADDED, {
    ticket,
    comment,
    actor: currentUser,
  });

  return comment;
};

const getCommentsByTicket = async (ticketId, currentUser) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
  }

  const isOwner = ticket.createdBy.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to view comments on this ticket', HTTP_STATUS.FORBIDDEN);
  }

  const comments = await Comment.find({ ticket: ticketId })
    .populate('user', 'name email role')
    .sort({ createdAt: 1 })
    .lean();

  return comments;
};

const commentService = {
  addComment,
  getCommentsByTicket,
};

module.exports = commentService;
