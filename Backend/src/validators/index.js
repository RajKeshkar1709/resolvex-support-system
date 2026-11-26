const { body } = require('express-validator');
const {
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CATEGORY,
} = require('../constants/ticketStatus');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const createTicketValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Ticket title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Ticket description is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(TICKET_CATEGORY))
    .withMessage(`Category must be one of: ${Object.values(TICKET_CATEGORY).join(', ')}`),
  body('priority')
    .optional()
    .isIn(Object.values(TICKET_PRIORITY))
    .withMessage(`Priority must be one of: ${Object.values(TICKET_PRIORITY).join(', ')}`),
];

const updateTicketValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('description').optional().trim(),
];

const updateStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(TICKET_STATUS))
    .withMessage(`Status must be one of: ${Object.values(TICKET_STATUS).join(', ')}`),
];

const updatePriorityValidator = [
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(Object.values(TICKET_PRIORITY))
    .withMessage(`Priority must be one of: ${Object.values(TICKET_PRIORITY).join(', ')}`),
];

const assignTicketValidator = [
  body('assignedTo')
    .notEmpty()
    .withMessage('assignedTo user ID is required')
    .isMongoId()
    .withMessage('assignedTo must be a valid MongoDB ObjectId'),
];

const createCommentValidator = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Comment message is required')
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters'),
];

module.exports = {
  registerValidator,
  loginValidator,
  createTicketValidator,
  updateTicketValidator,
  updateStatusValidator,
  updatePriorityValidator,
  assignTicketValidator,
  createCommentValidator,
};
