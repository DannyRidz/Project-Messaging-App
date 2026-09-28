import { body } from "express-validator";

export const registrationRules = [
  body("username")
    .isString()
    .withMessage("Username must be text")
    .bail()
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must contain 3 to 20 characters")
    .bail()
    .matches(/^[a-z0-9_]+$/)
    .withMessage("Username may contain only letters, numbers, and underscores"),

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
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .bail()
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must be at most 72 UTF-8 bytes"),

  body("confirmPassword")
    .isString()
    .withMessage("Confirm your password")
    .bail()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords must match"),
];
