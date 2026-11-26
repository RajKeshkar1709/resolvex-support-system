const commentService = require('../services/commentService');
const { sendResponse } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../constants/httpStatus');

const addComment = async (req, res, next) => {
  try {
    const comment = await commentService.addComment(
      req.params.id,
      req.body.message,
      req.user
    );
    return sendResponse(res, HTTP_STATUS.CREATED, 'Comment posted successfully', comment);
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getCommentsByTicket(req.params.id, req.user);
    return sendResponse(res, HTTP_STATUS.OK, 'Comments retrieved successfully', comments);
  } catch (error) {
    next(error);
  }
};

const commentController = {
  addComment,
  getComments,
};

module.exports = commentController;
