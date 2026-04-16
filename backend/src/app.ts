import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import type { Request } from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { userRouter } from "./modules/users/users.routes.js";
import { customerRouter } from "./modules/customers/customers.routes.js";
import { deliveryRouter } from "./modules/deliveries/deliveries.routes.js";
import { reminderRouter } from "./modules/reminders/reminders.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { reportsRouter } from "./modules/reports/reports.routes.js";
import { logger } from "./lib/logger.js";
import { repairMissingRevisitReminders, updateReminderStatuses } from "./modules/reminders/reminders.service.js";

function hasValidCronSecret(req: Request) {
  if (!env.CRON_SECRET) {
    return true;
  }

  return req.get("authorization") === `Bearer ${env.CRON_SECRET}`;
}

export function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false, // Allow frontend assets
  }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(","),
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 200,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use("/uploads", express.static(env.UPLOAD_DIR));

  app.get("/", (_req, res) => {
    res.json({
      ok: true,
      service: "wholesale-backend",
      message: "Separate backend deployment is active.",
    });
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/internal/jobs/reminders/sync", async (req, res, next) => {
    if (!hasValidCronSecret(req)) {
      return res.status(401).json({ ok: false, message: "Unauthorized cron request." });
    }

    try {
      await updateReminderStatuses();
      logger.info("Reminder status sync completed");
      res.json({ ok: true, job: "reminder-status-sync" });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/internal/jobs/reminders/repair", async (req, res, next) => {
    if (!hasValidCronSecret(req)) {
      return res.status(401).json({ ok: false, message: "Unauthorized cron request." });
    }

    try {
      const repairedCount = await repairMissingRevisitReminders();
      logger.info({ repairedCount }, "Reminder repair completed");
      res.json({ ok: true, job: "reminder-repair", repairedCount });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/internal/jobs/reminders/maintenance", async (req, res, next) => {
    if (!hasValidCronSecret(req)) {
      return res.status(401).json({ ok: false, message: "Unauthorized cron request." });
    }

    try {
      await updateReminderStatuses();
      const repairedCount = await repairMissingRevisitReminders();
      logger.info({ repairedCount }, "Reminder maintenance completed");
      res.json({
        ok: true,
        job: "reminder-maintenance",
        repairedCount,
      });
    } catch (error) {
      next(error);
    }
  });

  // API routes
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/customers", customerRouter);
  app.use("/api/v1/deliveries", deliveryRouter);
  app.use("/api/v1/reminders", reminderRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/reports", reportsRouter);

  app.use(errorHandler);

  return app;
}
