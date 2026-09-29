import { matchedData } from "express-validator";
import { createMessage, listMessages } from "../models/message.js";
import { AppError } from "../utils/AppError.js";
import { normalizeImage } from "../utils/normalizeImage.js";

export async function sendMessage(req, res) {
  const { body } = matchedData(req, {
    locations: ["body"],
  });

  const message = await createMessage(req.conversation.id, req.user.id, body);

  if (!message) {
    throw new AppError(404, "Conversation not found");
  }

  res.status(201).json({
    message: {
      ...message,
      sender: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.displayName,
      },
      attachments: [],
    },
  });
}

export async function getMessages(req, res) {
  const {
    afterId,
    beforeId,
    limit = 50,
  } = matchedData(req, {
    locations: ["query"],
  });

  if (afterId !== undefined && beforeId !== undefined) {
    throw new AppError(400, "Use either afterId or beforeId, not both");
  }

  const result = await listMessages(req.conversation.id, {
    afterId,
    beforeId,
    limit,
  });

  res.json(result);
}

export async function sendImageMessage(req, res) {
  if (!req.file) {
    throw new AppError(400, "Choose an image to upload");
  }

  const { body = "" } = matchedData(req, {
    locations: ["body"],
  });

  const attachment = await normalizeImage(req.file.buffer);

  const message = await createMessage(
    req.conversation.id,
    req.user.id,
    body,
    attachment,
  );

  if (!message) {
    throw new AppError(404, "Conversation not found");
  }

  res.status(201).json({
    message: {
      ...message,
      sender: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.displayName,
      },
    },
  });
}
