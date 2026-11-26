const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const responsePayload = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { pagination: meta }),
  };

  return res.status(statusCode).json(responsePayload);
};

module.exports = { sendResponse };
