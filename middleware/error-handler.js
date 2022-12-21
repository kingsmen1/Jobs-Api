const { CustomAPIError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || statusCode.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong",
  };
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }
  return res.status(customError.statusCode).json(customError.msg);
};

module.exports = errorHandlerMiddleware;
