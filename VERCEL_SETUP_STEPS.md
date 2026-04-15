# Vercel Environment Variables - Step by Step

## Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Find and click on your project: `pooja-wholesale---CRM---prod`

## Step 2: Open Environment Variables Settings
1. Click the **Settings** tab at the top
2. In the left sidebar, click **Environment Variables**

## Step 3: Add Each Variable

Add these 10 variables one by one:

### Variable 1: NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Variable 2: PORT
- **Key:** `PORT`
- **Value:** `3000`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Variable 3: DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** `mongodb+srv://jishnu:jishnu123@cluster07.uw7kga7.mongodb.net/wholesale_crm?retryWrites=true&w=majority&appName=Cluster07`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Variable 4: JWT_ACCESS_SECRET
- **Key:** `JWT_ACCESS_SECRET`
- **Value:** `super-secret-jwt-access-key-change-in-production-min-10-chars`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Variable 5: JWT_ACCESS_EXPIRES_IN
- **Key:** `JWT_ACCESS_EXPIRES_IN`
- **Value:** `1d`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Variable 6: JWT_REFRESH_SECRET
- **Key:** `JWT_REFRESH_SECRET`
- **Value:** `super-secret-jwt-refresh-key-change-in-production-min-10-chars`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Variable 7: JWT_REFRESH_EXPIRES_IN
- **Key:** `JWT_REFRESH_EXPIRES_IN`
- **Value:** `7d`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Variable 8: CORS_ORIGIN
- **Key:** `CORS_ORIGIN`
- **Value:** `*`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Variable 9: UPLOAD_DIR
- **Key:** `UPLOAD_DIR`
- **Value:** `uploads`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Variable 10: MAX_FILE_SIZE_MB
- **Key:** `MAX_FILE_SIZE_MB`
- **Value:** `5`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

## Step 4: Verify All Variables Are Added
You should see 10 environment variables listed:
- ✓ NODE_ENV
- ✓ PORT
- ✓ DATABASE_URL
- ✓ JWT_ACCESS_SECRET
- ✓ JWT_ACCESS_EXPIRES_IN
- ✓ JWT_REFRESH_SECRET
- ✓ JWT_REFRESH_EXPIRES_IN
- ✓ CORS_ORIGIN
- ✓ UPLOAD_DIR
- ✓ MAX_FILE_SIZE_MB

## Step 5: Redeploy
1. Click the **Deployments** tab at the top
2. Find the latest deployment (should be at the top)
3. Click the three dots **...** on the right side
4. Click **Redeploy**
5. Confirm by clicking **Redeploy** again

## Step 6: Wait for Deployment
- Wait 2-3 minutes for the deployment to complete
- You'll see "Building..." then "Ready"

## Step 7: Test the Deployment
1. Visit: https://poojawholesale.vercel.app/health
   - Should show: `{"ok":true}`

2. Visit: https://poojawholesale.vercel.app
   - Should load the login page without errors

3. Check browser console (F12)
   - Should NOT see 500 errors anymore

## Troubleshooting

### If you still see 500 errors:

1. **Check Function Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Click **Functions** tab
   - Click on `api/index`
   - Look for error messages

2. **Common Issues:**
   - Missing environment variables (check all 10 are added)
   - MongoDB connection refused (check Network Access in MongoDB Atlas)
   - JWT secrets too short (must be at least 10 characters)

3. **MongoDB Atlas Network Access:**
   - Go to https://cloud.mongodb.com
   - Select your cluster
   - Click **Network Access** in left sidebar
   - Make sure `0.0.0.0/0` is in the IP Access List
   - If not, click **Add IP Address** → **Allow Access from Anywhere**

## Need Help?
If errors persist, share the error message from the Vercel Function Logs.
