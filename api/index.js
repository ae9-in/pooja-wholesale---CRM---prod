// Vercel serverless function entry point
import { createApp } from '../backend/dist/app.js';

const app = createApp();

export default app;
