import { matchedData } from "express-validator";
import {
  listUserConversations,
  listConversationMembers,
  getOrCreateDirectConversation,
} from "../models/conversation.js";
import { AppError } from "../utils/AppError.js";

export async function getConversations(req, res) {
  const conversations = await listUserConversations(req.user.id);

  res.json({ conversations });
}

export async function getConversation(req, res) {
  const members = await listConversationMembers(req.conversation.id);

  res.json({
    conversation: {
      ...req.conversation,
      members,
    },
  });
}

export async function startDirectConversation(req, res) {
  const { recipientId } = matchedData(req, {
    locations: ["body"],
  });

  if (recipientId === req.user.id) {
    throw new AppError(400, "Choose another user for a direct conversation");
  }

  const result = await getOrCreateDirectConversation(req.user.id, recipientId);

  if (!result) {
    throw new AppError(404, "Account not found");
  }

  const members = await listConversationMembers(result.conversation.id);

  res.status(result.created ? 201 : 200).json({
    conversation: {
      ...result.conversation,
      members,
    },
  });
}
