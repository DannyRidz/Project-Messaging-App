import { param } from "express-validator";

export const friendIdRules = [
  param("friendId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Invalid friend ID")
    .bail()
    .toInt(),
];
