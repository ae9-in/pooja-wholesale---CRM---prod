# Deploy Backend - Quick Guide

## Option 1: Vercel (Serverless)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd backend
vercel login
vercel --prod
```

### Step 3: Add Environment Variables
After deployment, add these in Vercel Dashboard:
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

### Step 4: Redeploy
```bash
vercel --prod
```

---

## Option 2: Render (Recommended - Better for Node.js)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add backend deployment config"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 3: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** wholesale-backend
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** `npm install && npm run prisma:generate && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 4: Add Environment Variables
Click "Environment" tab and add:
```
NODE_ENV=production
DATABASE_URL=mongodb+srv://jishnu:jishnu123@cluster07.uw7kga7.mongodb.net/wholesale_crm?retryWrites=true&w=majority&appName=Cluster07
JWT_ACCESS_SECRET=super-secret-jwt-access-key-change-in-production-min-10-chars
JWT_REFRESH_SECRET=super-secret-jwt-refresh-key-change-in-production-min-10-chars
CORS_ORIGIN=*
```

### Step 5: Deploy
Click "Create Web Service" - Render will automatically deploy!

**Your backend URL:** `https://wholesale-backend.onrender.com`

---

## Option 3: Railway (Easiest)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add backend deployment config"
git push origin main
```

### Step 2: Deploy on Railway
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js
6. Set **Root Directory:** backend

### Step 3: Add Environment Variables
In Railway dashboard, add:
```
NODE_ENV=production
DATABASE_URL=mongodb+srv://jishnu:jishnu123@cluster07.uw7kga7.mongodb.net/wholesale_crm?retryWrites=true&w=majority&appName=Cluster07
JWT_ACCESS_SECRET=super-secret-jwt-access-key-change-in-production-min-10-chars
JWT_REFRESH_SECRET=super-secret-jwt-refresh-key-change-in-production-min-10-chars
CORS_ORIGIN=*
```

### Step 4: Generate Domain
1. Go to Settings → Networking
2. Click "Generate Domain"

**Your backend URL:** `https://wholesale-backend.railway.app`

---

## Test Backend

After deployment, test:
```bash
curl https://your-backend-url.com/health
```

Should return: `{"ok":true}`

---

## Next Step

Copy your backend URL and use it when deploying the frontend!
