# Deploy Frontend - Quick Guide

## Prerequisites
- Backend must be deployed first
- You need the backend URL (e.g., `https://your-backend.onrender.com`)

---

## Step 1: Update Backend URL

Edit `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url-here.onrender.com
```

Replace with your actual backend URL!

---

## Step 2: Deploy on Vercel

### Option A: Using Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

When prompted:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **wholesale-frontend**
- In which directory? **./** (current directory)
- Override settings? **N**

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.onrender.com`
6. Click "Deploy"

---

## Step 3: Update Backend CORS

After frontend is deployed, update backend CORS for security:

### In Backend Environment Variables:
Change:
```
CORS_ORIGIN=*
```

To:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

Then redeploy backend.

---

## Step 4: Test

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Should load without errors
3. Try logging in
4. Check browser console (F12) - should not see CORS or 500 errors

---

## Troubleshooting

### CORS Errors
- Make sure backend CORS_ORIGIN includes your frontend URL
- Check backend is running: `https://your-backend-url.com/health`

### API Connection Errors
- Verify VITE_API_URL is set correctly in Vercel
- Check backend URL is accessible
- Look at Network tab in browser DevTools

### 404 Errors on Refresh
- Make sure `frontend/vercel.json` exists with rewrites configuration

---

## Your Deployment URLs

**Backend:** `https://your-backend.onrender.com`
**Frontend:** `https://your-frontend.vercel.app`

Save these URLs for future reference!
