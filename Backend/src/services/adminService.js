const Ticket = require('../models/Ticket');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/appError');
const {
  TICKET_STATUS,
  ALLOWED_STATUS_TRANSITIONS,
} = require('../constants/ticketStatus');
const { ROLES } = require('../constants/roles');
const { HTTP_STATUS } = require('../constants/httpStatus');
const eventBus = require('../events/eventBus');
const EVENT_NAMES = require('../events/eventNames');

const getAllTickets = async (queryOptions) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    category,
    assignedTo,
    search,
    sortBy = 'createdAt',
    order = 'desc',
  } = queryOptions;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignedTo) filter.assignedTo = assignedTo;

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
      .populate('createdBy', 'name email')
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

const updateTicketStatus = async (ticketId, newStatus, currentAdmin) => {
  const ticket = await Ticket.findById(ticketId).populate('createdBy', 'name email');
  if (!ticket) {
    throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
  }

  const currentStatus = ticket.status;

  if (currentStatus === newStatus) {
    return ticket;
  }

  // Validate state machine transition
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowed ? allowed.join(', ') : 'None'}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  ticket.status = newStatus;
  if (newStatus === TICKET_STATUS.RESOLVED) {
    ticket.resolvedAt = new Date();
  } else if (newStatus === TICKET_STATUS.CLOSED) {
    ticket.closedAt = new Date();
  } else {
    // Re-opened
    ticket.resolvedAt = null;
    ticket.closedAt = null;
  }

  await ticket.save();

  eventBus.emit(EVENT_NAMES.TICKET_STATUS_CHANGED, {
    ticket,
    actor: currentAdmin,
    previousStatus: currentStatus,
    newStatus,
  });

  return ticket;
};

const updateTicketPriority = async (ticketId, newPriority, currentAdmin) => {
  const ticket = await Ticket.findById(ticketId).populate('createdBy', 'name email');
  if (!ticket) {
    throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
  }

  const previousPriority = ticket.priority;
  if (previousPriority === newPriority) {
    return ticket;
  }

  ticket.priority = newPriority;
  await ticket.save();

  eventBus.emit(EVENT_NAMES.TICKET_PRIORITY_CHANGED, {
    ticket,
    actor: currentAdmin,
    previousPriority,
    newPriority,
  });

  return ticket;
};

const assignTicket = async (ticketId, assignedToUserId, currentAdmin) => {
  const ticket = await Ticket.findById(ticketId).populate('createdBy', 'name email');
  if (!ticket) {
    throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
  }

  const assignedUser = await User.findById(assignedToUserId);
  if (!assignedUser || assignedUser.role !== ROLES.ADMIN) {
    throw new AppError('Tickets can only be assigned to active Admin users', HTTP_STATUS.BAD_REQUEST);
  }

  ticket.assignedTo = assignedUser._id;
  // Auto transition to IN_PROGRESS if currently OPEN
  let previousStatus = ticket.status;
  if (ticket.status === TICKET_STATUS.OPEN) {
    ticket.status = TICKET_STATUS.IN_PROGRESS;
  }

  await ticket.save();
  await ticket.populate('assignedTo', 'name email');

  eventBus.emit(EVENT_NAMES.TICKET_ASSIGNED, {
    ticket,
    actor: currentAdmin,
    assignedToUser: assignedUser,
  });

  if (previousStatus !== ticket.status) {
    eventBus.emit(EVENT_NAMES.TICKET_STATUS_CHANGED, {
      ticket,
      actor: currentAdmin,
      previousStatus,
      newStatus: ticket.status,
    });
  }

  return ticket;
};

const getDashboardStats = async () => {
  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    priorityDistribution,
    categoryDistribution,
    recentTickets,
    recentActivity,
  ] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: TICKET_STATUS.OPEN }),
    Ticket.countDocuments({ status: TICKET_STATUS.IN_PROGRESS }),
    Ticket.countDocuments({ status: TICKET_STATUS.RESOLVED }),
    Ticket.countDocuments({ status: TICKET_STATUS.CLOSED }),
    Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    Ticket.find()
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    ActivityLog.find()
      .populate('actor', 'name email role')
      .populate('ticket', 'ticketNumber title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  // Format priority stats
  const priorityMap = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
  priorityDistribution.forEach((item) => {
    if (priorityMap[item._id] !== undefined) {
      priorityMap[item._id] = item.count;
    }
  });

  return {
    counts: {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
    },
    priorityDistribution: priorityMap,
    categoryDistribution: categoryDistribution.map((item) => ({
      category: item._id,
      count: item.count,
    })),
    recentTickets,
    recentActivity,
  };
};

const getGlobalActivity = async (limit = 30) => {
  const activities = await ActivityLog.find()
    .populate('actor', 'name email role')
    .populate('ticket', 'ticketNumber title status priority')
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))
    .lean();

  return activities;
};

const getAdminsList = async () => {
  const admins = await User.find({ role: ROLES.ADMIN, isActive: true })
    .select('name email role')
    .lean();
  return admins;
};

const adminService = {
  getAllTickets,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  getDashboardStats,
  getGlobalActivity,
  getAdminsList,
};

module.exports = adminService;
