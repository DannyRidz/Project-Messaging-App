import { matchedData } from "express-validator";
import {
  updateUserProfile,
  findPublicUserById,
  findUsers,
} from "../models/user.js";
import { AppError } from "../utils/AppError.js";

export function getMyProfile(req, res) {
  res.json({ user: req.user });
}

export async function updateMyProfile(req, res) {
  const { displayName, bio } = matchedData(req, {
    locations: ["body"],
  });

  if (displayName === undefined && bio === undefined) {
    throw new AppError(400, "Provide a display name or bio");
  }

  const user = await updateUserProfile(req.user.id, {
    displayName,
    bio,
  });

  if (!user) {
    throw new AppError(404, "Account not found");
  }

  res.json({ user });
}

export async function getPublicProfile(req, res) {
  const { userId } = matchedData(req, {
    locations: ["params"],
  });

  const user = await findPublicUserById(userId);

  if (!user) {
    throw new AppError(404, "Account not found");
  }

  res.json({ user });
}

export async function searchUsers(req, res) {
  const { q = "" } = matchedData(req, {
    locations: ["query"],
  });

  const users = await findUsers(req.user.id, q);

  res.json({ users });
}
