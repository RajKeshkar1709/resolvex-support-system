const Ticket = require('../models/Ticket');
const AppError = require('../utils/appError');
const { generateTicketNumber } = require('../utils/ticketNumberGen');
const {
  TICKET_STATUS
} = require('../constants/ticketStatus');
const { ROLES } = require('../constants/roles');
const { HTTP_STATUS } = require('../constants/httpStatus');
const eventBus = require('../events/eventBus');
const EVENT_NAMES = require('../events/eventNames');

const createTicket = async (ticketData, currentUser) => {
  const ticketNumber = await generateTicketNumber();

  const ticket = await Ticket.create({
    ...ticketData,
    ticketNumber,
    createdBy: currentUser._id,
    status: TICKET_STATUS.OPEN,
  });

  await ticket.populate('createdBy', 'name email role');

  // Emit event for decoupled side effects
  eventBus.emit(EVENT_NAMES.TICKET_CREATED, {
    ticket,
    actor: currentUser,
  });

  return ticket;
};

const getUserTickets = async (userId, queryOptions) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    category,
    search,
    sortBy = 'createdAt',
    order = 'desc',
  } = queryOptions;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter = { createdBy: userId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { ticketNumber: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortCriteria = { [sortBy]: sortOrder };

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('assignedTo', 'name email')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Ticket.countDocuments(filter),
  ]);

  return {
    tickets,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

const getTicketById = async (ticketId, currentUser) => {
  const ticket = await Ticket.findById(ticketId)
    .populate('createdBy', 'name email  role')
    .populate('assignedTo', 'name email role');

  if (!ticket) {
    throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
  }

  // Object-level permission check: Only author or Admin can view
  const isOwner = ticket.createdBy._id.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to view this ticket', HTTP_STATUS.FORBIDDEN);
  }

  return ticket;
};

const updateTicket = async (ticketId, updateData, currentUser) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
  }

  // Object-level authorization
  if (ticket.createdBy.toString() !== currentUser._id.toString()) {
    throw new AppError('You can only edit your own tickets', HTTP_STATUS.FORBIDDEN);
  }

  // Users can only edit tickets that are still OPEN
  if (ticket.status !== TICKET_STATUS.OPEN) {
    throw new AppError(
      `Cannot edit a ticket that is currently ${ticket.status}. Only OPEN tickets can be modified.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const allowedUpdates = ['title', 'description', 'category'];
  const changes = {};

  allowedUpdates.forEach((field) => {
    if (updateData[field] !== undefined) {
      changes[field] = { old: ticket[field], new: updateData[field] };
      ticket[field] = updateData[field];
    }
  });

  await ticket.save();
  await ticket.populate('createdBy', 'name email role');

  eventBus.emit(EVENT_NAMES.TICKET_UPDATED, {
    ticket,
    actor: currentUser,
    changes,
  });

  return ticket;
};

const deleteTicket = async (ticketId, currentUser) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
  }

  // Only ticket creator can delete, and only if still OPEN
  if (ticket.createdBy.toString() !== currentUser._id.toString()) {
    throw new AppError('You can only delete your own tickets', HTTP_STATUS.FORBIDDEN);
  }

  if (ticket.status !== TICKET_STATUS.OPEN) {
    throw new AppError(
      `Cannot delete a ticket that is ${ticket.status}. Only OPEN tickets may be deleted.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Clean up associated comments, notifications, and activity logs when ticket is deleted
  const Notification = require('../models/Notification');
  const Comment = require('../models/Comment');
  const ActivityLog = require('../models/ActivityLog');

  await Promise.all([
    Ticket.findByIdAndDelete(ticketId),
    Notification.deleteMany({ ticket: ticketId }),
    Comment.deleteMany({ ticket: ticketId }),
    ActivityLog.deleteMany({ ticket: ticketId }),
  ]);

  return { id: ticketId };
};

const ticketService = {
  createTicket,
  getUserTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
};

module.exports = ticketService;
