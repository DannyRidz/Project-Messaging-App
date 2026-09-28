import { body } from "express-validator";

export const loginRules = [
  body("email")
    .isString()
    .withMessage("Email must be text")
    .bail()
    .trim()
    .toLowerCase()
    .isLength({ max: 254 })
    .withMessage("Email is too long")
    .bail()
    .isEmail()
    .withMessage("Enter a valid email address"),

  body("password")
    .isString()
    .withMessage("Password must be text")
    .bail()
    .isLength({ min: 1 })
    .withMessage("Enter your password")
    .bail()
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must be at most 72 UTF-8 bytes"),
];
