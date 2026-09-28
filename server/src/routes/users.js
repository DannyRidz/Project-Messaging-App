import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  searchUsers,
} from "../controllers/users.js";
import { profileRules, userIdRules } from "../validators/profile.js";
import { userSearchRules } from "../validators/conversation.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateRequest } from "../middleware/validateRequest.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/", ...userSearchRules, validateRequest, searchUsers);

usersRouter.get("/me", getMyProfile);

usersRouter.patch("/me", ...profileRules, validateRequest, updateMyProfile);

usersRouter.get("/:userId", ...userIdRules, validateRequest, getPublicProfile);
