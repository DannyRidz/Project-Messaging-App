import { findConversationForUser } from "../models/conversation.js";
import { AppError } from "../utils/AppError.js";

export async function requireConversationMember(req, res, next) {
  if (!req.user) {
    throw new AppError(401, "Please log in");
  }

  const rawId = req.params.conversationId;
  const conversationId = Number(rawId);

  if (
    !/^[1-9][0-9]*$/.test(rawId) ||
    !Number.isInteger(conversationId) ||
    conversationId > 2147483647
  ) {
    throw new AppError(400, "Invalid conversation ID");
  }

  const conversation = await findConversationForUser(
    conversationId,
    req.user.id,
  );

  if (!conversation) {
    throw new AppError(404, "Conversation not found");
  }

  req.conversation = conversation;

  next();
}
