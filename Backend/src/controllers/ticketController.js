const ticketService = require('../services/ticketService');
const activityService = require('../services/activityService');
const { sendResponse } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../constants/httpStatus');

const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user);
    return sendResponse(res, HTTP_STATUS.CREATED, 'Ticket created successfully', ticket);
  } catch (error) {
    next(error);
  }
};

const getUserTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getUserTickets(req.user._id, req.query);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      'Tickets retrieved successfully',
      result.tickets,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    return sendResponse(res, HTTP_STATUS.OK, 'Ticket retrieved successfully', ticket);
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user);
    return sendResponse(res, HTTP_STATUS.OK, 'Ticket updated successfully', ticket);
  } catch (error) {
    next(error);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const result = await ticketService.deleteTicket(req.params.id, req.user);
    return sendResponse(res, HTTP_STATUS.OK, 'Ticket deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

const getTicketActivity = async (req, res, next) => {
  try {
    const activities = await activityService.getTicketActivity(req.params.id, req.user);
    return sendResponse(res, HTTP_STATUS.OK, 'Ticket activity history retrieved', activities);
  } catch (error) {
    next(error);
  }
};

const ticketController = {
  createTicket,
  getUserTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketActivity,
};

module.exports = ticketController;
