import { Router } from "express";
import { register } from "../controllers/auth.js";
import { registrationRules } from "../validators/register.js";
import { validateRequest } from "../middleware/validateRequest.js";

export const authRouter = Router();

authRouter.post("/register", ...registrationRules, validateRequest, register);
