import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { remindersController } from "./reminders.controller.js";
import {
  reminderCompleteSchema,
  reminderCreateSchema,
  reminderRescheduleSchema,
  reminderSnoozeSchema,
  reminderUpdateSchema,
} from "./reminders.validation.js";

export const reminderRouter = Router();

reminderRouter.use(authenticate);

reminderRouter.get("/", asyncHandler(remindersController.list));
reminderRouter.get("/:id", asyncHandler(remindersController.getById));
reminderRouter.post("/", validate(reminderCreateSchema), asyncHandler(remindersController.create));
reminderRouter.patch("/:id", validate(reminderUpdateSchema), asyncHandler(remindersController.update));
reminderRouter.patch("/:id/complete", validate(reminderCompleteSchema), asyncHandler(remindersController.complete));
reminderRouter.patch("/:id/snooze", validate(reminderSnoozeSchema), asyncHandler(remindersController.snooze));
reminderRouter.patch("/:id/reschedule", validate(reminderRescheduleSchema), asyncHandler(remindersController.reschedule));
reminderRouter.patch("/:id/cancel", asyncHandler(remindersController.cancel));
