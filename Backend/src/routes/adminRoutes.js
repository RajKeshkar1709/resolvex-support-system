const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const ticketController = require('../controllers/ticketController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  updateStatusValidator,
  updatePriorityValidator,
  assignTicketValidator,
} = require('../validators');
const { ROLES } = require('../constants/roles');

// Strictly enforce ADMIN role for all routes in this router
router.use(authenticateUser, authorizeRoles(ROLES.ADMIN));

router.get('/tickets', adminController.getAllTickets);
router.get('/tickets/:id', ticketController.getTicketById);
router.patch('/tickets/:id/status', validate(updateStatusValidator), adminController.updateTicketStatus);
router.patch('/tickets/:id/priority', validate(updatePriorityValidator), adminController.updateTicketPriority);
router.patch('/tickets/:id/assign', validate(assignTicketValidator), adminController.assignTicket);
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/stats', adminController.getDashboardStats);
router.get('/activity', adminController.getGlobalActivity);
router.get('/admins', adminController.getAdminsList);

module.exports = router;
