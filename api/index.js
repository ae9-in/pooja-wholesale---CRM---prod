// Vercel serverless function entry point
import { createApp } from '../backend/dist/app.js';

let app;

export default async function handler(req, res) {
  try {
    // Log environment check
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasJWTAccess: !!process.env.JWT_ACCESS_SECRET,
      hasJWTRefresh: !!process.env.JWT_REFRESH_SECRET,
    });

    if (!app) {
      // Check for required environment variables
      const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET'
      ];
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.error('Missing required environment variables:', missingVars);
        return res.status(500).json({
          error: 'Server configuration error',
          message: 'Missing required environment variables',
          missing: missingVars
        });
      }
      
      console.log('Creating Express app...');
      app = createApp();
      console.log('Express app created successfully');
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
