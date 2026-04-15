import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authController } from "./auth.controller.js";
import { changePasswordSchema, loginSchema } from "./auth.validation.js";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));
authRouter.post("/logout", authenticate, asyncHandler(authController.logout));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
authRouter.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
);
