import { Router } from "express";

import {
  getFriends,
  saveFriend,
  deleteFriend,
} from "../controllers/friends.js";

import { friendIdRules } from "../validators/friend.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateRequest } from "../middleware/validateRequest.js";

export const friendsRouter = Router();

friendsRouter.use(requireAuth);

friendsRouter.get("/", getFriends);

friendsRouter.put("/:friendId", ...friendIdRules, validateRequest, saveFriend);

friendsRouter.delete(
  "/:friendId",
  ...friendIdRules,
  validateRequest,
  deleteFriend,
);
