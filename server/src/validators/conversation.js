import { body, query } from "express-validator";

export const userSearchRules = [
  query("q")
    .optional()
    .isString()
    .withMessage("Search must be text")
    .bail()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Search must contain at most 50 characters"),
];

export const directConversationRules = [
  body("recipientId")
    .custom(
      (value) => Number.isInteger(value) && value > 0 && value <= 2147483647,
    )
    .withMessage("Recipient ID must be a positive integer"),
];
