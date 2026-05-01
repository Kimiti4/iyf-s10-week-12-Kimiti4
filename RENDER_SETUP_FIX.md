# 🚀 Render.com Backend Deployment Guide

## Current Status
You're on the Render.com dashboard setting up your backend service.

---

## ❌ What's Wrong Currently

### Problem 1: Secret File Format
You pasted the entire `.env` content into a secret file. This won't work!

**Current (WRONG):**
```
.env file contains:
PORT=3000
NODE_ENV=development
...all variables in one block
```

**Should be:** Individual environment variables OR properly formatted secret file

### Problem 2: Health Check Path
- **Current:** `/healthz`
- **Should be:** `/api/health` (matches your backend endpoint)

### Problem 3: NODE_ENV
- **Current:** `development`
- **Should be:** `production` (for deployed service)

---

## ✅ Correct Setup Steps

### Step 1: Remove Current Secret File
1. Click the trash icon next to `.env` secret file
2. Delete it

### Step 2: Add Environment Variables Individually

Click **"Add Environment Variable"** and add these ONE BY ONE:

#### Variable 1: PORT
```
NAME: PORT
VALUE: 3000
✓ Required: Yes
```

#### Variable 2: NODE_ENV
```
NAME: NODE_ENV
VALUE: production
✓ Required: Yes
```

#### Variable 3: MONGODB_URI
```
NAME: MONGODB_URI
VALUE: mongodb+srv://elsapoguapo47_db_user:stqqJgQJrxzyvqdW@cluster0.pz2quoo.mongodb.net/jamiilink?retryWrites=true&w=majority
✓ Required: Yes
✓ Mark as Secret: Yes (click the lock icon)
```

#### Variable 4: JWT_SECRET
```
NAME: JWT_SECRET
VALUE: jamii-link-ke-production-secret-key-2026-xyz-abc-123-def-456
✓ Required: Yes
✓ Mark as Secret: Yes (click the lock icon)
```

#### Variable 5: JWT_EXPIRES_IN
```
NAME: JWT_EXPIRES_IN
VALUE: 7d
✓ Required: No (has default)
```

#### Variable 6: CORS_ORIGIN (Production Frontend URL)
```
NAME: CORS_ORIGIN
VALUE: http://localhost:5173
✓ Required: No
Note: Update this after deploying frontend to Vercel
```

#### Variable 7: LOG_LEVEL
```
NAME: LOG_LEVEL
VALUE: info
✓ Required: No
```

#### Variable 8: FRONTEND_URL (Optional)
```
NAME: FRONTEND_URL
VALUE: http://localhost:5173
✓ Required: No
Note: Update after frontend deployment
```

---

### Step 3: Fix Health Check Path

Change from:
```
/healthz
```

To:
```
/api/health
```

**Why?** Your backend has this endpoint in `routes/health.js`:
```javascript
app.use('/api/health', require('./routes/health'));
```

---

### Step 4: Verify Build & Start Commands

Make sure these are correct:

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Root Directory:** (if applicable)
```
iyf-s10-week-11-Kimiti4
```
(Only if your repo is a monorepo and backend is in a subfolder)

---

### Step 5: Auto-Deploy Settings

**Recommended:**
- ✓ Keep "Auto-Deploy" enabled (On Commit)
- This automatically redeploys when you push to GitHub

**Optional - Build Filters:**
If you want to only deploy when backend changes:

**Included Paths:**
```
iyf-s10-week-11-Kimiti4/**
```

**Ignored Paths:**
```
iyf-s10-week-09-Kimiti4/**
iyf-s10-week-10-Kimiti4/**
*.md
```

---

## 📋 Final Configuration Checklist

Before clicking "Deploy Web Service":

- [ ] Deleted the `.env` secret file
- [ ] Added PORT = 3000
- [ ] Added NODE_ENV = production (NOT development!)
- [ ] Added MONGODB_URI (marked as secret)
- [ ] Added JWT_SECRET (marked as secret)
- [ ] Added JWT_EXPIRES_IN = 7d
- [ ] Added CORS_ORIGIN = http://localhost:5173
- [ ] Health Check Path = /api/health
- [ ] Build Command = npm install
- [ ] Start Command = npm start
- [ ] Auto-Deploy = On Commit

---

## 🚀 Deploy!

Click the **"Deploy Web Service"** button at the bottom.

**Expected Output:**
```
Building...
Installing dependencies...
Starting server...
✅ MongoDB Connected: cluster0.pz2quoo.mongodb.net
🚀 Server running on port 3000
```

---

## ✅ After Deployment

### Test Your API

1. **Get your Render URL** (looks like):
   ```
   https://jamii-link-api.onrender.com
   ```

2. **Test Health Check:**
   ```
   https://jamii-link-api.onrender.com/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-05-01T...",
     "uptime": 123.456,
     "database": "connected"
   }
   ```

3. **Test API Endpoint:**
   ```
   https://jamii-link-api.onrender.com/api/posts
   ```

---

## 🔧 Troubleshooting

### Problem: Build Fails
**Check:**
- Root directory is correct
- package.json exists in the right folder
- All dependencies are listed in package.json

### Problem: MongoDB Connection Error
**Check:**
- MONGODB_URI is correct (no typos)
- MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Database user has correct permissions

### Problem: Server Crashes on Start
**Check logs in Render dashboard:**
1. Go to your service
2. Click "Logs" tab
3. Look for error messages

Common errors:
- Missing environment variables
- Wrong MongoDB URI
- Port already in use (shouldn't happen on Render)

### Problem: Health Check Failing
**Check:**
- Health check path is `/api/health` (not `/healthz`)
- Backend is actually starting successfully
- No errors in logs

---

## 📝 Update After Frontend Deployment

After you deploy frontend to Vercel, update these variables in Render:

1. **CORS_ORIGIN:**
   ```
   Change from: http://localhost:5173
   To: https://your-app.vercel.app
   ```

2. **FRONTEND_URL:**
   ```
   Change from: http://localhost:5173
   To: https://your-app.vercel.app
   ```

Then redeploy (Render will auto-deploy if enabled).

---

## 🎯 Quick Summary

**DO THIS NOW:**

1. ❌ Delete `.env` secret file
2. ✅ Add 8 environment variables individually
3. ✅ Change health check to `/api/health`
4. ✅ Set NODE_ENV to `production`
5. ✅ Click "Deploy Web Service"
6. ✅ Test: `https://your-app.onrender.com/api/health`

---

## 🔐 Security Note

Your secrets (MONGODB_URI, JWT_SECRET) are now:
- ✅ Encrypted by Render
- ✅ Not visible in logs
- ✅ Not exposed in build output
- ✅ Only accessible to your service

This is secure! 👍

---

Built with ❤️ for Kenyan Communities
