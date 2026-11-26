const adminService = require('../services/adminService');
const { sendResponse } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../constants/httpStatus');

const getAllTickets = async (req, res, next) => {
  try {
    const result = await adminService.getAllTickets(req.query);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      'Admin tickets retrieved successfully',
      result.tickets,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await adminService.updateTicketStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    return sendResponse(res, HTTP_STATUS.OK, 'Ticket status updated successfully', ticket);
  } catch (error) {
    next(error);
  }
};

const updateTicketPriority = async (req, res, next) => {
  try {
    const ticket = await adminService.updateTicketPriority(
      req.params.id,
      req.body.priority,
      req.user
    );
    return sendResponse(res, HTTP_STATUS.OK, 'Ticket priority updated successfully', ticket);
  } catch (error) {
    next(error);
  }
};

const assignTicket = async (req, res, next) => {
  try {
    const ticket = await adminService.assignTicket(
      req.params.id,
      req.body.assignedTo,
      req.user
    );
    return sendResponse(res, HTTP_STATUS.OK, 'Ticket assigned successfully', ticket);
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return sendResponse(res, HTTP_STATUS.OK, 'Dashboard analytics retrieved', stats);
  } catch (error) {
    next(error);
  }
};

const getGlobalActivity = async (req, res, next) => {
  try {
    const activities = await adminService.getGlobalActivity(req.query.limit);
    return sendResponse(res, HTTP_STATUS.OK, 'Global activity logs retrieved', activities);
  } catch (error) {
    next(error);
  }
};

const getAdminsList = async (req, res, next) => {
  try {
    const admins = await adminService.getAdminsList();
    return sendResponse(res, HTTP_STATUS.OK, 'Active administrators retrieved', admins);
  } catch (error) {
    next(error);
  }
};

const adminController = {
  getAllTickets,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  getDashboardStats,
  getGlobalActivity,
  getAdminsList,
};

module.exports = adminController;
