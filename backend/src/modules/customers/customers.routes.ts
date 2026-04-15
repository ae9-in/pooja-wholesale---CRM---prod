import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { customersController } from "./customers.controller.js";
import {
  customerCreateSchema,
  customerNoteSchema,
  customerStatusSchema,
  customerUpdateSchema,
} from "./customers.validation.js";

export const customerRouter = Router();

customerRouter.use(authenticate);

customerRouter.get("/", asyncHandler(customersController.list));
customerRouter.post(
  "/",
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(customerCreateSchema),
  asyncHandler(customersController.create),
);
customerRouter.get("/:id", asyncHandler(customersController.getById));
customerRouter.patch(
  "/:id",
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(customerUpdateSchema),
  asyncHandler(customersController.update),
);
customerRouter.patch("/:id/status", validate(customerStatusSchema), asyncHandler(customersController.updateStatus));
customerRouter.delete("/:id", authorize(Role.SUPER_ADMIN, Role.ADMIN), asyncHandler(customersController.remove));
customerRouter.get("/:id/notes", asyncHandler(customersController.notes));
customerRouter.post("/:id/notes", validate(customerNoteSchema), asyncHandler(customersController.addNote));
customerRouter.get("/:id/deliveries", asyncHandler(customersController.deliveries));
