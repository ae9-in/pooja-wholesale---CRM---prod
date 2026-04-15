# Separate Deployment Guide - Backend & Frontend

## Overview
We'll deploy:
- **Backend** on Vercel (or Railway/Render) - API only
- **Frontend** on Vercel - Static site

---

## Part 1: Deploy Backend (API)

### Option A: Deploy Backend on Vercel

#### 1. Create `backend/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

#### 2. Create `backend/.vercelignore`
```
node_modules
tests
src
*.ts
tsconfig.json
.env
.env.local
```

#### 3. Backend Environment Variables (Vercel)
Add these in Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://jishnu:jishnu123@cluster07.uw7kga7.mongodb.net/wholesale_crm?retryWrites=true&w=majority&appName=Cluster07
JWT_ACCESS_SECRET=super-secret-jwt-access-key-change-in-production-min-10-chars
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=super-secret-jwt-refresh-key-change-in-production-min-10-chars
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE_MB=5
```

#### 4. Deploy Backend
```bash
cd backend
vercel --prod
```

**Your backend will be at:** `https://your-backend.vercel.app`

---

### Option B: Deploy Backend on Render (Recommended for Node.js)

#### 1. Create `backend/render.yaml`
```yaml
services:
  - type: web
    name: wholesale-backend
    env: node
    buildCommand: npm install && npm run prisma:generate && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        sync: false
      - key: JWT_ACCESS_SECRET
        sync: false
      - key: JWT_ACCESS_EXPIRES_IN
        value: 1d
      - key: JWT_REFRESH_SECRET
        sync: false
      - key: JWT_REFRESH_EXPIRES_IN
        value: 7d
      - key: CORS_ORIGIN
        value: "*"
      - key: UPLOAD_DIR
        value: /tmp/uploads
      - key: MAX_FILE_SIZE_MB
        value: 5
```

#### 2. Deploy on Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Select the `backend` folder as root directory
5. Add environment variables (DATABASE_URL, JWT secrets)
6. Click "Create Web Service"

**Your backend will be at:** `https://your-backend.onrender.com`

---

### Option C: Deploy Backend on Railway (Easiest)

#### 1. Deploy on Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Railway will auto-detect Node.js
5. Set root directory to `backend`
6. Add environment variables in Railway dashboard
7. Deploy!

**Your backend will be at:** `https://your-backend.railway.app`

---

## Part 2: Deploy Frontend (Static Site)

### 1. Update Frontend API URL

Edit `frontend/src/services/api.ts`:

```typescript
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ... rest of the file
```

### 2. Create `frontend/.env.production`
```
VITE_API_URL=https://your-backend.vercel.app
```

Replace `your-backend.vercel.app` with your actual backend URL.

### 3. Create `frontend/vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Deploy Frontend on Vercel

#### Option 1: Using Vercel CLI
```bash
cd frontend
vercel --prod
```

#### Option 2: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Framework Preset: Vite
4. Root Directory: `frontend`
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.vercel.app` (your backend URL)
8. Click "Deploy"

**Your frontend will be at:** `https://your-frontend.vercel.app`

---

## Part 3: Update CORS

After deploying frontend, update backend CORS:

### In Backend Environment Variables:
Change:
```
CORS_ORIGIN=*
```

To:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

This is more secure!

---

## Summary

### Backend URLs (choose one):
- Vercel: `https://your-backend.vercel.app`
- Render: `https://your-backend.onrender.com`
- Railway: `https://your-backend.railway.app`

### Frontend URL:
- Vercel: `https://your-frontend.vercel.app`

### Environment Variables Needed:

**Backend:**
- NODE_ENV=production
- PORT=3000 (or 10000 for Render)
- DATABASE_URL=mongodb+srv://...
- JWT_ACCESS_SECRET=...
- JWT_ACCESS_EXPIRES_IN=1d
- JWT_REFRESH_SECRET=...
- JWT_REFRESH_EXPIRES_IN=7d
- CORS_ORIGIN=https://your-frontend.vercel.app
- UPLOAD_DIR=/tmp/uploads
- MAX_FILE_SIZE_MB=5

**Frontend:**
- VITE_API_URL=https://your-backend.vercel.app

---

## Testing

1. Test backend: `https://your-backend.vercel.app/health`
   - Should return: `{"ok":true}`

2. Test frontend: `https://your-frontend.vercel.app`
   - Should load without errors
   - Should connect to backend API

---

## Recommended Setup

**Best combination:**
- Backend: Railway or Render (better for Node.js apps)
- Frontend: Vercel (best for static sites)

**Why?**
- Railway/Render handle Node.js apps better (no serverless issues)
- Vercel is perfect for static React apps
- Easier to debug and manage separately
