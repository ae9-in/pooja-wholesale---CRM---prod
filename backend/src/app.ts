import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { userRouter } from "./modules/users/users.routes.js";
import { customerRouter } from "./modules/customers/customers.routes.js";
import { deliveryRouter } from "./modules/deliveries/deliveries.routes.js";
import { reminderRouter } from "./modules/reminders/reminders.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { reportsRouter } from "./modules/reports/reports.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // API routes
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/customers", customerRouter);
  app.use("/api/v1/deliveries", deliveryRouter);
  app.use("/api/v1/reminders", reminderRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/reports", reportsRouter);

  // Serve frontend static files in production (not needed for Vercel)
  if (env.NODE_ENV === "production" && process.env.VERCEL !== "1") {
    const frontendPath = path.resolve(__dirname, "../../frontend/dist");
    
    app.use(express.static(frontendPath, {
      maxAge: '1d',
      etag: true,
    }));
    
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  }

  app.use(errorHandler);

  return app;
}
