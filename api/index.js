// Vercel serverless function entry point
import { createApp } from '../backend/dist/app.js';

let app;

export default async function handler(req, res) {
  try {
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasCronSecret: !!process.env.CRON_SECRET,
    });

    if (!app) {
      const requiredEnvVars = ['DATABASE_URL'];
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.error('Missing required environment variables:', missingVars);
        return res.status(500).json({
          error: 'Server configuration error',
          message: 'Missing required environment variables',
          missing: missingVars
        });
      }
      
      app = createApp();
    }
    
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
