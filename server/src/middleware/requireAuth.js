import { findUserById } from "../models/user.js";
import { AppError } from "../utils/AppError.js";

export async function requireAuth(req, res, next) {
  const userId = req.session?.userId;

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError(401, "Please log in");
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(401, "Please log in");
  }

  req.user = user;

  next();
}
