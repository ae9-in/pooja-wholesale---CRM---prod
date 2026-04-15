// Vercel serverless function entry point
import { createApp } from '../backend/dist/app.js';

let app;

export default async function handler(req, res) {
  if (!app) {
    app = createApp();
  }
  return app(req, res);
}
