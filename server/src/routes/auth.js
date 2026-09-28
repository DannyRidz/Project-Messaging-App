import { Router } from "express";
import { register } from "../controllers/auth.js";
import { login, getCurrentUser, logout } from "../controllers/session.js";
import { registrationRules } from "../validators/register.js";
import { loginRules } from "../validators/login.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

authRouter.post("/register", ...registrationRules, validateRequest, register);

authRouter.post("/login", ...loginRules, validateRequest, login);

authRouter.get("/me", requireAuth, getCurrentUser);

authRouter.post("/logout", logout);
