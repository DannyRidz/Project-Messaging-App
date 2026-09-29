import { Router } from "express";
import { param } from "express-validator";

import { getAttachment } from "../controllers/attachments.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateRequest } from "../middleware/validateRequest.js";

export const attachmentsRouter = Router();

attachmentsRouter.use(requireAuth);

attachmentsRouter.get(
  "/:attachmentId",
  param("attachmentId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Invalid attachment ID")
    .bail()
    .toInt(),
  validateRequest,
  getAttachment,
);
