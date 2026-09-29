import { Router } from "express";

import { recordActivity } from "../controllers/presence.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const presenceRouter = Router();

presenceRouter.use(requireAuth);

presenceRouter.post("/", recordActivity);
