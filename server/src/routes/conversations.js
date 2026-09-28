import { Router } from "express";
import {
  getConversations,
  getConversation,
  startDirectConversation,
} from "../controllers/conversations.js";
import { directConversationRules } from "../validators/conversation.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireConversationMember } from "../middleware/requireConversationMember.js";
import { validateRequest } from "../middleware/validateRequest.js";

export const conversationsRouter = Router();

conversationsRouter.use(requireAuth);

conversationsRouter.get("/", getConversations);

conversationsRouter.post(
  "/direct",
  ...directConversationRules,
  validateRequest,
  startDirectConversation,
);

conversationsRouter.get(
  "/:conversationId",
  requireConversationMember,
  getConversation,
);
