import fs from "node:fs";
import path from "node:path";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { startReminderJobs } from "./jobs/reminder.jobs.js";

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
  startReminderJobs();
});
