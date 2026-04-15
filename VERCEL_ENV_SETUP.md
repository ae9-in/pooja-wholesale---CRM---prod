# Vercel Environment Variables Setup

## Critical: Set These Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add the following:

### Required Environment Variables

```
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://jishnu:jishnu123@cluster07.uw7kga7.mongodb.net/wholesale_crm?retryWrites=true&w=majority&appName=Cluster07
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

## Important Notes

1. **JWT Secrets**: For production, generate strong random secrets:
   ```bash
   # Generate secure secrets (run locally)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **CORS_ORIGIN**: Set to `*` for now, or your specific domain like `https://poojawholesale.vercel.app`

3. **DATABASE_URL**: Make sure your MongoDB cluster allows connections from anywhere (0.0.0.0/0) or add Vercel's IP ranges

## Steps to Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project: `pooja-wholesale---CRM---prod`
3. Click "Settings" tab
4. Click "Environment Variables" in the left sidebar
5. Add each variable:
   - Key: `NODE_ENV`
   - Value: `production`
   - Environment: Select "Production", "Preview", and "Development"
   - Click "Save"
6. Repeat for all variables above
7. After adding all variables, go to "Deployments" tab
8. Click the three dots (...) on the latest deployment
9. Click "Redeploy"

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas cluster allows Vercel connections:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Or add Vercel's IP ranges if you want more security

## Testing After Setup

After redeploying with environment variables:

1. Visit: https://poojawholesale.vercel.app/health
   - Should return: `{"ok":true}`

2. Check browser console for errors
   - Should not see 500 errors anymore

3. Try logging in with your credentials

## Troubleshooting

If you still see 500 errors:

1. Check Vercel Function Logs:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Click "Functions" tab
   - Click on `api/index` to see logs

2. Common issues:
   - Missing environment variables
   - MongoDB connection refused (check Network Access)
   - Invalid JWT secrets (must be at least 10 characters)

## Quick Copy-Paste for Vercel

```
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://jishnu:jishnu123@cluster07.uw7kga7.mongodb.net/wholesale_crm?retryWrites=true&w=majority&appName=Cluster07
JWT_ACCESS_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

**Note**: Change the JWT secrets above to your own random strings!
