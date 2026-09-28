import bcrypt from "bcryptjs";
import { matchedData } from "express-validator";
import { findUserByEmail } from "../models/user.js";
import { AppError } from "../utils/AppError.js";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "../middleware/session.js";

function sessionAction(req, action) {
  return new Promise((resolve, reject) => {
    req.session[action]((error) => {
      if (error) {
        return reject(error);
      }

      resolve();
    });
  });
}

export async function login(req, res) {
  const { email, password } = matchedData(req, {
    locations: ["body"],
  });

  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password");
  }

  await sessionAction(req, "regenerate");

  req.session.userId = user.id;

  await sessionAction(req, "save");

  const { passwordHash, ...publicUser } = user;

  res.json({ user: publicUser });
}

export function getCurrentUser(req, res) {
  res.json({ user: req.user });
}

export async function logout(req, res) {
  await sessionAction(req, "destroy");

  res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions);
  res.status(204).end();
}
