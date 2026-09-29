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

export const groupConversationRules = [
  body("name")
    .isString()
    .withMessage("Group name must be text")
    .bail()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage("Group name must contain 1 to 60 characters"),

  body("memberIds")
    .custom(
      (value) =>
        Array.isArray(value) &&
        value.length >= 2 &&
        value.length <= 9 &&
        value.every(
          (id) => Number.isInteger(id) && id > 0 && id <= 2147483647,
        ) &&
        new Set(value).size === value.length,
    )
    .withMessage("Choose 2 to 9 different users for the group"),
];
