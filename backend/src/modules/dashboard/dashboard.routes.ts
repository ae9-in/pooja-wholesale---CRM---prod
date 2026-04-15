import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { dashboardController } from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get("/summary", asyncHandler(dashboardController.summary));
dashboardRouter.get("/upcoming-reminders", asyncHandler(dashboardController.upcomingReminders));
dashboardRouter.get("/overdue-reminders", asyncHandler(dashboardController.overdueReminders));
dashboardRouter.get("/recent-customers", asyncHandler(dashboardController.recentCustomers));
dashboardRouter.get("/delivery-summary", asyncHandler(dashboardController.deliverySummary));
dashboardRouter.get("/status-breakdown", asyncHandler(dashboardController.statusBreakdown));
