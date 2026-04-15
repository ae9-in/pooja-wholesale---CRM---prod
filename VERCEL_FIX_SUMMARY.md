# Vercel Deployment Fix - Root Cause Analysis

## Problem
Getting 404 errors for `favicon.ico` and `index.html` on Vercel deployment.

## Root Causes Identified

### 1. Wrong API Destination
**Issue**: `vercel.json` was routing API calls to `/api/server` which doesn't exist.
```json
// WRONG
"destination": "/api/server"
```

**Fix**: Changed to `/api/index` to match the actual serverless function file.
```json
// CORRECT
"destination": "/api/index"
```

### 2. Missing Filesystem Handler
**Issue**: Vercel wasn't serving static files from `frontend/dist` because there was no explicit filesystem handler.

**Fix**: Added `"handle": "filesystem"` in the routes configuration to tell Vercel to check for static files before falling back to the catch-all route.

### 3. Improper Serverless Function Wrapper
**Issue**: The `api/index.js` was directly exporting the Express app, which doesn't work properly with Vercel's serverless environment.

**Fix**: Wrapped the Express app in a proper Vercel handler function:
```javascript
export default async function handler(req, res) {
  if (!app) {
    app = createApp();
  }
  return app(req, res);
}
```

## Files Changed

1. **vercel.json**
   - Fixed API routing from `/api/server` to `/api/index`
   - Added proper routes configuration with filesystem handler
   - Kept both `rewrites` and `routes` for compatibility

2. **api/index.js**
   - Changed from direct export to proper Vercel handler function
   - Added lazy initialization of Express app

3. **.vercelignore** (new file)
   - Ensures only necessary files are deployed
   - Excludes source files, keeping only built artifacts

## How It Works Now

1. **Static Files**: Vercel serves files from `frontend/dist` (configured via `outputDirectory`)
2. **API Routes**: Requests to `/api/v1/*` and `/health` are routed to the serverless function at `api/index.js`
3. **SPA Fallback**: All other routes fall back to `/index.html` for React Router to handle
4. **Filesystem Priority**: The `"handle": "filesystem"` ensures static files are checked before the catch-all route

## Deployment Steps

1. Push changes to GitHub (already done)
2. Vercel will automatically redeploy
3. Verify the deployment:
   - Check that `index.html` loads
   - Check that API endpoints work: `/health` and `/api/v1/*`
   - Check that frontend routing works

## Environment Variables Required on Vercel

```
DATABASE_URL=mongodb+srv://jishnu:jishnu123@cluster07.uw7kga7.mongodb.net/wholesale_crm?retryWrites=true&w=majority&appName=Cluster07
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*
UPLOAD_DIR=uploads
```

## Testing Checklist

After deployment, test:
- [ ] Homepage loads (`/`)
- [ ] Login page works (`/login`)
- [ ] API health check (`/health`)
- [ ] Dashboard API (`/api/v1/dashboard/summary`)
- [ ] Customer list API (`/api/v1/customers`)
- [ ] Frontend routing (navigate between pages)
- [ ] Static assets (favicon, CSS, JS bundles)

## Notes

- The build command is optimized to: `npm run build` (builds both backend and frontend)
- Frontend is built to `frontend/dist`
- Backend is built to `backend/dist`
- Prisma client is generated during the build process
- The serverless function at `api/index.js` handles all API requests
