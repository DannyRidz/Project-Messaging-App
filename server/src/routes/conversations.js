import { Router } from "express";

import {
  getConversations,
  getConversation,
  startDirectConversation,
  startGroupConversation,
} from "../controllers/conversations.js";

import {
  getMessages,
  sendMessage,
  sendImageMessage,
} from "../controllers/messages.js";

import {
  directConversationRules,
  groupConversationRules,
} from "../validators/conversation.js";

import {
  messageQueryRules,
  sendMessageRules,
  imageMessageRules,
} from "../validators/message.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { requireConversationMember } from "../middleware/requireConversationMember.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { uploadImage } from "../middleware/uploadImage.js";

export const conversationsRouter = Router();

conversationsRouter.use(requireAuth);

conversationsRouter.get("/", getConversations);

conversationsRouter.post(
  "/direct",
  ...directConversationRules,
  validateRequest,
  startDirectConversation,
);

conversationsRouter.post(
  "/group",
  ...groupConversationRules,
  validateRequest,
  startGroupConversation,
);

conversationsRouter.get(
  "/:conversationId/messages",
  requireConversationMember,
  ...messageQueryRules,
  validateRequest,
  getMessages,
);

conversationsRouter.post(
  "/:conversationId/messages",
  requireConversationMember,
  ...sendMessageRules,
  validateRequest,
  sendMessage,
);

conversationsRouter.post(
  "/:conversationId/images",
  requireConversationMember,
  uploadImage,
  ...imageMessageRules,
  validateRequest,
  sendImageMessage,
);

conversationsRouter.get(
  "/:conversationId",
  requireConversationMember,
  getConversation,
);
