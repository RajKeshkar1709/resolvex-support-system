const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  createTicketValidator,
  updateTicketValidator,
  createCommentValidator,
} = require('../validators');
const { ROLES } = require('../constants/roles');

// All ticket routes require authentication
router.use(authenticateUser);

// User-specific ticket operations
router.post('/', authorizeRoles(ROLES.USER), validate(createTicketValidator), ticketController.createTicket);
router.get('/', authorizeRoles(ROLES.USER), ticketController.getUserTickets);
router.get('/:id', ticketController.getTicketById);
router.patch('/:id', authorizeRoles(ROLES.USER), validate(updateTicketValidator), ticketController.updateTicket);
router.delete('/:id', authorizeRoles(ROLES.USER), ticketController.deleteTicket);

// Activity logs for a specific ticket
router.get('/:id/activity', ticketController.getTicketActivity);

// Comments on tickets
router.post('/:id/comments', validate(createCommentValidator), commentController.addComment);
router.get('/:id/comments', commentController.getComments);

module.exports = router;
