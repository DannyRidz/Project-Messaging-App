import bcrypt from "bcryptjs";
import { matchedData } from "express-validator";
import { createUser } from "../models/user.js";
import { AppError } from "../utils/AppError.js";

export async function register(req, res) {
  const { username, email, password } = matchedData(req, {
    locations: ["body"],
  });

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await createUser({
      username,
      email,
      passwordHash,
    });

    res.status(201).json({ user });
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(409, "Username or email is already in use");
    }

    throw error;
  }
}
