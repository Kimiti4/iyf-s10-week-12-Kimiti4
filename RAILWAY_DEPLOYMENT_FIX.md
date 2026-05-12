# 🔧 Railway Deployment Configuration Guide

## Current Status
✅ Backend deployed to: **https://iyf-s10-week-12-kimiti4.up.railway.app/**  
⚠️ Health check returning 404 - needs configuration fix  

---

## Issue: Application Not Found

The error `"Application not found"` suggests Railway isn't serving from the correct directory.

---

## Solution: Update Railway Root Directory

### Step 1: Check Railway Configuration

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project: `iyf-s10-week-12-kimiti4`
3. Click on your service
4. Go to **Settings** tab

### Step 2: Set Root Directory

In Railway settings, find **"Root Directory"** or **"Project Root"**:

**Set to:** `iyf-s10-week-11-Kimiti4`

This tells Railway to look for `package.json` and server files in that subdirectory.

### Step 3: Verify Build & Start Commands

In Railway **Settings** → **Deploy**:

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

Or if using custom start:
```bash
node server.js
```

### Step 4: Add Environment Variables

In Railway **Variables** tab, add these:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` (or let Railway auto-set) |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Random 64+ character string |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://jamii-link-ke.vercel.app` |
| `LOG_LEVEL` | `info` |

**Important:** Mark `MONGODB_URI` and `JWT_SECRET` as **secrets** (click the lock icon)

### Step 5: Redeploy

After updating settings:
1. Go to **Deployments** tab
2. Click **"Redeploy"** or trigger new deployment
3. Wait for build (~2-3 minutes)
4. Check logs for errors

---

## Alternative: Move Files to Root

If Railway doesn't support subdirectory deployment well, you can restructure:

### Option A: Move Backend to Root (Recommended for Railway)

```bash
# From project root
cd "c:\Users\user\New folder (4)\iyf-s10-week-12-Kimiti4"

# Move backend files to root
mv iyf-s10-week-11-Kimiti4/* .
mv iyf-s10-week-11-Kimiti4/.* . 2>/dev/null || true

# Remove empty directory
rmdir iyf-s10-week-11-Kimiti4

# Commit changes
git add .
git commit -m "Restructure: move backend to root for Railway"
git push origin main
```

**Warning:** This will mix backend and frontend files at root level.

### Option B: Keep Subdirectory (Better Organization)

Keep current structure and ensure Railway root directory is set correctly to `iyf-s10-week-11-Kimiti4`.

---

## Testing After Fix

Once redeployed, test these endpoints:

### 1. Health Check
```bash
curl https://iyf-s10-week-12-kimiti4.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "✅ OK",
  "timestamp": "2026-05-01T...",
  "uptime": 123.45,
  "memory": 45.67,
  "environment": "production",
  "categories": ["mtaani", "skill", "farm", "gig", "alert"]
}
```

### 2. Organizations Endpoint
```bash
curl https://iyf-s10-week-12-kimiti4.up.railway.app/api/organizations
```

Expected: Empty array `[]` or authentication error (both are OK)

### 3. Posts Endpoint
```bash
curl https://iyf-s10-week-12-kimiti4.up.railway.app/api/posts
```

Expected: List of posts or empty array

---

## Update Frontend Configuration

Once backend is working, update Vercel:

### In Vercel Dashboard:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select project: `jamii-link-ke`
3. **Settings** → **Environment Variables**
4. Update:
   ```
   VITE_API_URL = https://iyf-s10-week-12-kimiti4.up.railway.app/api
   ```
5. **Redeploy** frontend

### Or Create Local .env:
```env
VITE_API_URL=https://iyf-s10-week-12-kimiti4.up.railway.app/api
```

---

## Common Railway Issues

### Issue 1: Wrong Root Directory
**Symptom:** 404 errors, "Application not found"  
**Fix:** Set root directory to `iyf-s10-week-11-Kimiti4` in Railway settings

### Issue 2: Missing Environment Variables
**Symptom:** Database connection errors, JWT errors  
**Fix:** Add all required env vars in Railway Variables tab

### Issue 3: Port Conflict
**Symptom:** Service won't start  
**Fix:** Remove hardcoded PORT or let Railway auto-assign

### Issue 4: Build Fails
**Symptom:** Deployment fails during build  
**Fix:** Check build logs, ensure package.json exists in root directory

---

## Railway vs Render Comparison

| Feature | Railway | Render |
|---------|---------|--------|
| **Free Tier** | $5 credit/month | 750 hours free |
| **Subdirectory Deploy** | ✅ Supported | ✅ Supported |
| **Auto-Deploy** | ✅ Yes | ✅ Yes |
| **Environment Variables** | ✅ Dashboard UI | ✅ Dashboard + YAML |
| **Health Checks** | ✅ Built-in | ✅ Configurable |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**Recommendation:** Railway is excellent for your setup! Just need to fix root directory.

---

## Quick Fix Checklist

- [ ] Railway root directory set to `iyf-s10-week-11-Kimiti4`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start` or `node server.js`
- [ ] All environment variables added
- [ ] MONGODB_URI is correct
- [ ] JWT_SECRET is 64+ characters
- [ ] FRONTEND_URL includes Vercel domain
- [ ] Service redeployed after changes
- [ ] Health endpoint returns 200 OK
- [ ] No errors in Railway logs

---

## Next Steps

1. **Fix Railway configuration** (root directory)
2. **Redeploy service**
3. **Test health endpoint**
4. **Update Vercel env vars**
5. **Test full integration**

Once the backend responds correctly, your multi-tenant SaaS platform will be fully operational! 🚀
