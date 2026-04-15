# Vercel Separate Deployment - Build Commands

## Backend Deployment on Vercel

### Vercel Dashboard Settings:

**Project Settings:**
- **Framework Preset:** Other
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run prisma:generate && npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Environment Variables (Backend):
```
NODE_ENV=production
DATABASE_URL=mongodb+srv://jishnu:jishnu123@cluster07.uw7kga7.mongodb.net/wholesale_crm?retryWrites=true&w=majority&appName=Cluster07
JWT_ACCESS_SECRET=super-secret-jwt-access-key-change-in-production-min-10-chars
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=super-secret-jwt-refresh-key-change-in-production-min-10-chars
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE_MB=5
```

---

## Frontend Deployment on Vercel

### Vercel Dashboard Settings:

**Project Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Environment Variables (Frontend):
```
VITE_API_URL=https://your-backend-name.vercel.app
```

**Important:** Replace `your-backend-name.vercel.app` with your actual backend URL after deploying backend!

---

## Step-by-Step Deployment

### Step 1: Deploy Backend First

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Project Name:** `wholesale-backend`
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run prisma:generate && npm run build`
   - **Output Directory:** `dist`
4. Click "Environment Variables" and add all 8 backend variables
5. Click "Deploy"
6. **Copy your backend URL** (e.g., `https://wholesale-backend.vercel.app`)

### Step 2: Deploy Frontend

1. Go to https://vercel.com/new (again, for a new project)
2. Import the SAME GitHub repository
3. Configure:
   - **Project Name:** `wholesale-frontend`
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click "Environment Variables" and add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://wholesale-backend.vercel.app` (your backend URL from Step 1)
5. Click "Deploy"

### Step 3: Update Backend CORS

1. Go to your backend project in Vercel
2. Settings → Environment Variables
3. Find `CORS_ORIGIN` and change from `*` to your frontend URL:
   ```
   CORS_ORIGIN=https://wholesale-frontend.vercel.app
   ```
4. Go to Deployments → Click "..." → Redeploy

---

## Quick Copy-Paste

### Backend Build Command:
```
npm install && npm run prisma:generate && npm run build
```

### Frontend Build Command:
```
npm run build
```

---

## Testing

### Test Backend:
```
https://wholesale-backend.vercel.app/health
```
Should return: `{"ok":true}`

### Test Frontend:
```
https://wholesale-frontend.vercel.app
```
Should load the login page without errors.

---

## Troubleshooting

### Backend Issues:
- Check Function Logs in Vercel Dashboard
- Verify all environment variables are set
- Make sure MongoDB Atlas allows connections from 0.0.0.0/0

### Frontend Issues:
- Check VITE_API_URL is set correctly
- Check browser console for CORS errors
- Verify backend URL is accessible

---

## Summary

**Backend URL:** `https://wholesale-backend.vercel.app`
**Frontend URL:** `https://wholesale-frontend.vercel.app`

**Backend Env Vars:** 8 variables (DATABASE_URL, JWT secrets, etc.)
**Frontend Env Vars:** 1 variable (VITE_API_URL)
