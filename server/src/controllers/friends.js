import { matchedData } from "express-validator";

import { listFriends, addFriend, removeFriend } from "../models/friendship.js";

import { findPublicUserById } from "../models/user.js";

import { AppError } from "../utils/AppError.js";

export async function getFriends(req, res) {
  const friends = await listFriends(req.user.id);

  res.json({ friends });
}

export async function saveFriend(req, res) {
  const { friendId } = matchedData(req, {
    locations: ["params"],
  });

  if (friendId === req.user.id) {
    throw new AppError(400, "You cannot add yourself as a friend");
  }

  const friend = await findPublicUserById(friendId);

  if (!friend) {
    throw new AppError(404, "Account not found");
  }

  let created;

  try {
    created = await addFriend(req.user.id, friendId);
  } catch (error) {
    if (error.code === "23503") {
      throw new AppError(404, "Account not found");
    }

    throw error;
  }

  res.status(created ? 201 : 200).json({ friend });
}

export async function deleteFriend(req, res) {
  const { friendId } = matchedData(req, {
    locations: ["params"],
  });

  if (friendId === req.user.id) {
    throw new AppError(400, "You cannot remove yourself as a friend");
  }

  await removeFriend(req.user.id, friendId);

  res.status(204).end();
}
