import { matchedData } from "express-validator";
import { findAttachmentForUser } from "../models/attachment.js";
import { AppError } from "../utils/AppError.js";

export async function getAttachment(req, res) {
  const { attachmentId } = matchedData(req, {
    locations: ["params"],
  });

  const attachment = await findAttachmentForUser(attachmentId, req.user.id);

  if (!attachment) {
    throw new AppError(404, "Attachment not found");
  }

  res.set({
    "Content-Type": attachment.mimeType,
    "Content-Length": String(attachment.data.length),
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": 'inline; filename="attachment.webp"',
  });

  res.send(attachment.data);
}
