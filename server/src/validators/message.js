import { body, query } from "express-validator";

export const sendMessageRules = [
  body("body")
    .isString()
    .withMessage("Message must be text")
    .bail()
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage("Message must contain between 1 and 4000 characters"),
];

export const messageQueryRules = [
  query("afterId")
    .optional()
    .isString()
    .withMessage("afterId must be a single value")
    .bail()
    .isInt({ min: 0, max: 2147483647 })
    .withMessage("afterId must be a valid message ID or zero")
    .bail()
    .toInt(),

  query("beforeId")
    .optional()
    .isString()
    .withMessage("beforeId must be a single value")
    .bail()
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("beforeId must be a valid message ID")
    .bail()
    .toInt(),

  query("limit")
    .optional()
    .isString()
    .withMessage("limit must be a single value")
    .bail()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100")
    .bail()
    .toInt(),
];

export const imageMessageRules = [
  body("body")
    .optional()
    .isString()
    .withMessage("Caption must be text")
    .bail()
    .trim()
    .isLength({ max: 4000 })
    .withMessage("Caption must contain at most 4000 characters"),
];
