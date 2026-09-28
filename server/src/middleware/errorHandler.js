import { AppError } from "../utils/AppError.js";

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = 500;
  let message = "Something went wrong";
  let details = [];

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Request body must contain valid JSON";
  } else if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  }

  if (statusCode >= 500) {
    console.error(error.message);
  }

  res.status(statusCode).json({
    error: {
      message,
      details,
    },
  });
}
