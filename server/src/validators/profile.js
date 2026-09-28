import { body, param } from "express-validator";

export const profileRules = [
  body("displayName")
    .optional()
    .isString()
    .withMessage("Display name must be text")
    .bail()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Display name must contain 1 to 50 characters"),

  body("bio")
    .optional()
    .isString()
    .withMessage("Bio must be text")
    .bail()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must contain at most 500 characters"),
];

export const userIdRules = [
  param("userId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Invalid user ID")
    .bail()
    .toInt(),
];
