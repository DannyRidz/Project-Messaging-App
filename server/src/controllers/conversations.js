import { matchedData } from "express-validator";
import {
  listUserConversations,
  listConversationMembers,
  getOrCreateDirectConversation,
  createGroupConversation,
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

export async function startGroupConversation(req, res) {
  const { name, memberIds } = matchedData(req, {
    locations: ["body"],
  });

  if (memberIds.includes(req.user.id)) {
    throw new AppError(400, "Do not include yourself in the selected users");
  }

  const conversation = await createGroupConversation(
    req.user.id,
    name,
    memberIds,
  );

  if (!conversation) {
    throw new AppError(404, "A selected account was not found");
  }

  const members = await listConversationMembers(conversation.id);

  res.status(201).json({
    conversation: {
      ...conversation,
      members,
    },
  });
}
