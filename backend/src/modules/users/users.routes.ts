import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { usersController } from "./users.controller.js";
import { userCreateSchema, userUpdateSchema } from "./users.validation.js";

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.use(authorize("SUPER_ADMIN"));

userRouter.get("/", asyncHandler(usersController.list));
userRouter.post("/", validate(userCreateSchema), asyncHandler(usersController.create));
userRouter.get("/:id", asyncHandler(usersController.getById));
userRouter.patch("/:id", validate(userUpdateSchema), asyncHandler(usersController.update));
userRouter.patch("/:id/activate", asyncHandler(usersController.activate));
userRouter.patch("/:id/deactivate", asyncHandler(usersController.deactivate));
