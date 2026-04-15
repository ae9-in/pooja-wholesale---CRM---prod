import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { reportsController } from "./reports.controller.js";

export const reportsRouter = Router();

reportsRouter.use(authenticate);
reportsRouter.get("/customers", asyncHandler(reportsController.customers));
reportsRouter.get("/deliveries", asyncHandler(reportsController.deliveries));
reportsRouter.get("/reminders", asyncHandler(reportsController.reminders));
reportsRouter.get("/revisit-performance", asyncHandler(reportsController.revisitPerformance));
