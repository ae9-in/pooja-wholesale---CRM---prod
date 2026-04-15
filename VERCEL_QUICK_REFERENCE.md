# Vercel Deployment - Quick Reference Card

## 🚀 Build Command (Copy & Paste)

```bash
npm install && cd backend && npm install && npm run prisma:generate && npm run build && cd ../frontend && npm install && npm run build && cd ..
```

---

## 🔐 Environment Variables (Copy & Paste to Vercel)

```
NODE_ENV=production
PORT=5001
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/wholesale_crm?retryWrites=true&w=majority
JWT_ACCESS_SECRET=CHANGE_THIS_TO_RANDOM_32_CHAR_STRING
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=CHANGE_THIS_TO_ANOTHER_RANDOM_32_CHAR_STRING
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

⚠️ **IMPORTANT:** Replace the following:
- `username:password@cluster` with your MongoDB credentials
- `JWT_ACCESS_SECRET` with a random 32+ character string
- `JWT_REFRESH_SECRET` with a different random 32+ character string

---

## 🔑 Generate Secrets (PowerShell)

```powershell
# JWT Access Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# JWT Refresh Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

## ⚙️ Vercel Project Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Root Directory | `./` |
| Build Command | See above |
| Output Directory | `backend/dist` |
| Install Command | `npm install` |
| Node.js Version | 18.x |

---

## 📋 Deployment Steps

1. **Import Project**
   - Go to vercel.com
   - Click "Add New" → "Project"
   - Import: `https://github.com/ae9-in/pooja-wholesale---CRM---prod`

2. **Configure Build**
   - Paste build command (see above)
   - Set output directory: `backend/dist`

3. **Add Environment Variables**
   - Copy all variables from above
   - Replace placeholders with actual values

4. **Deploy**
   - Click "Deploy"
   - Wait 3-5 minutes

5. **Push Database Schema**
   ```bash
   cd backend
   npm run prisma:push
   npm run prisma:seed
   ```

---

## ✅ Post-Deployment Test

```bash
# Health Check
curl https://your-app.vercel.app/health

# API Test
curl https://your-app.vercel.app/api/v1/dashboard/summary

# Open in Browser
https://your-app.vercel.app
```

---

## 🔐 Default Login

- Email: `superadmin@wholesale.local`
- Password: `Password123!`

⚠️ Change immediately after first login!

---

## 🐛 Quick Fixes

**Build Failed?**
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies are in package.json
```

**Database Error?**
```bash
# Verify DATABASE_URL is correct
# Check MongoDB Atlas IP whitelist: 0.0.0.0/0
```

**Frontend Not Loading?**
```bash
# Verify NODE_ENV=production
# Check Vercel function logs
```

---

## 📞 Need Help?

- Full Guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- Vercel Docs: https://vercel.com/docs
- GitHub Repo: https://github.com/ae9-in/pooja-wholesale---CRM---prod

---

**Quick Reference Version:** 1.0  
**Last Updated:** April 15, 2026
