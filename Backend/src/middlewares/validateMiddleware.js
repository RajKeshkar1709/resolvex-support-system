const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');
const { HTTP_STATUS } = require('../constants/httpStatus');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations in parallel
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return next(
      new AppError(
        'Validation failed. Please verify input fields.',
        HTTP_STATUS.BAD_REQUEST,
        extractedErrors
      )
    );
  };
};

module.exports = validate;
