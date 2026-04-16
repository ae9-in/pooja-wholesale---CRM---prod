import type { Express } from "express";

let appPromise: Promise<Express> | null = null;
const sourceAppUrl = new URL("../backend/src/app.ts", import.meta.url).href;

async function getApp() {
  if (!appPromise) {
    appPromise = import(sourceAppUrl).then(({ createApp }) => createApp());
  }

  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("Root serverless function bootstrap error:", error);

    return res.status(500).json({
      message: "Server failed to start",
      error: error instanceof Error ? error.message : "Unknown startup error",
    });
  }
}
