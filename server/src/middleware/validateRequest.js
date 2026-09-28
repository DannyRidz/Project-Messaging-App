import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

export function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const details = result.array({ onlyFirstError: true }).map((error) => ({
    field: error.path || "body",
    message: error.msg,
  }));

  return next(new AppError(400, "Validation failed", details));
}
