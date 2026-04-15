import { config } from "dotenv";
import { z } from "zod";

config({ path: process.env.NODE_ENV === "test" ? ".env.test" : undefined });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.string().default("1d"),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
});

export const env = envSchema.parse(process.env);
