# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Step 1: Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import from GitHub: `https://github.com/ae9-in/pooja-wholesale---CRM---prod`

### Step 2: Configure Build Settings

**Framework Preset:** Other

**Root Directory:** `./` (leave as root)

**Build Command:**
```bash
npm install && cd backend && npm install && npm run prisma:generate && npm run build && cd ../frontend && npm install && npm run build && cd ..
```

**Output Directory:** `backend/dist`

**Install Command:**
```bash
npm install
```

### Step 3: Environment Variables

Add these environment variables in Vercel Dashboard:

```env
NODE_ENV=production
PORT=5001
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/wholesale_crm?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-characters-long
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

---

## 📋 Environment Variables Explained

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Set environment to production |
| `PORT` | `5001` | Server port (Vercel will override) |
| `DATABASE_URL` | Your MongoDB URL | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Random 32+ char string | Secret for access tokens |
| `JWT_ACCESS_EXPIRES_IN` | `1d` | Access token expiry (1 day) |
| `JWT_REFRESH_SECRET` | Random 32+ char string | Secret for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiry (7 days) |
| `CORS_ORIGIN` | `*` | Allowed origins (use your domain in production) |
| `UPLOAD_DIR` | `uploads` | Upload directory path |
| `MAX_FILE_SIZE_MB` | `5` | Maximum file upload size |

---

## 🔐 Generate Secure Secrets

Use these commands to generate secure secrets:

### On Linux/Mac:
```bash
# Generate JWT Access Secret
openssl rand -base64 32

# Generate JWT Refresh Secret
openssl rand -base64 32
```

### On Windows (PowerShell):
```powershell
# Generate JWT Access Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Generate JWT Refresh Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Online:
Visit: https://generate-secret.vercel.app/32

---

## 🗄️ MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string
6. Replace `<username>`, `<password>`, and database name

Example:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/wholesale_crm?retryWrites=true&w=majority
```

---

## ⚙️ Vercel Configuration (vercel.json)

Already included in the repository:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/node",
      "config": {
        "includeFiles": [
          "backend/dist/**",
          "backend/prisma/**",
          "frontend/dist/**"
        ]
      }
    }
  ],
  "routes": [
    {
      "src": "/api/v1/(.*)",
      "dest": "backend/dist/server.js"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "backend/dist/server.js"
    },
    {
      "src": "/health",
      "dest": "backend/dist/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "backend/dist/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 🔄 Post-Deployment Steps

### 1. Push Database Schema

After first deployment, run locally:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-mongodb-url"

# Push schema
cd backend
npm run prisma:push

# Seed initial users (optional)
npm run prisma:seed
```

### 2. Test Deployment

Visit your Vercel URL:
- Health check: `https://your-app.vercel.app/health`
- API: `https://your-app.vercel.app/api/v1/dashboard/summary`
- Frontend: `https://your-app.vercel.app`

### 3. Login Credentials

Default credentials (after seeding):
- **Super Admin**: superadmin@wholesale.local / Password123!
- **Admin**: admin@wholesale.local / Password123!
- **Staff**: staff@wholesale.local / Password123!

⚠️ **Change these immediately!**

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module '@prisma/client'"**
```bash
# Solution: Ensure prisma:generate runs in build command
npm run prisma:generate
```

**Error: "Frontend build failed"**
```bash
# Solution: Check frontend dependencies
cd frontend && npm install
```

### Runtime Errors

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is correct
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Ensure database user has correct permissions

**Error: "JWT errors"**
- Verify `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set
- Ensure secrets are at least 32 characters

### Frontend Not Loading

- Check Vercel logs for errors
- Verify `NODE_ENV=production`
- Ensure frontend was built correctly

---

## 📊 Vercel Limits (Free Tier)

- **Bandwidth:** 100GB/month
- **Serverless Function Execution:** 100GB-hours
- **Build Time:** 6000 minutes/month
- **Deployments:** Unlimited

For production, consider upgrading to Pro plan.

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel will automatically deploy
```

---

## 🌐 Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` environment variable to your domain

---

## 📈 Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- View real-time metrics

### Logs
- View in Vercel Dashboard → Your Project → Logs
- Filter by type: Build, Runtime, Edge

---

## ✅ Deployment Checklist

- [ ] GitHub repository connected
- [ ] Build command configured
- [ ] All environment variables set
- [ ] MongoDB Atlas database created
- [ ] Database schema pushed
- [ ] Initial users seeded
- [ ] Health check responds
- [ ] Can login to application
- [ ] All features working
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- GitHub Issues: https://github.com/ae9-in/pooja-wholesale---CRM---prod/issues

---

**Deployment Status:** ✅ Ready for Vercel  
**Last Updated:** April 15, 2026
