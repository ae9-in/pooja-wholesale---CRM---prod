import cron from "node-cron";
import { logger } from "../lib/logger.js";
import {
  repairMissingRevisitReminders,
  updateReminderStatuses,
} from "../modules/reminders/reminders.service.js";

export function startReminderJobs() {
  // Run every hour to keep reminders up-to-date
  cron.schedule("0 * * * *", async () => {
    logger.info("Running reminder status updater");
    await updateReminderStatuses();
  });

  // Run every 6 hours to check for missing reminders
  cron.schedule("0 */6 * * *", async () => {
    logger.info("Running reminder integrity checker");
    const repairedCount = await repairMissingRevisitReminders();
    logger.info({ repairedCount }, "Reminder integrity checker completed");
  });

  // Run immediately on startup
  logger.info("Running initial reminder status update");
  updateReminderStatuses().catch((err) => logger.error(err, "Initial reminder update failed"));
  
  logger.info("Running initial reminder integrity check");
  repairMissingRevisitReminders()
    .then((count) => logger.info({ repairedCount: count }, "Initial integrity check completed"))
    .catch((err) => logger.error(err, "Initial integrity check failed"));
}
